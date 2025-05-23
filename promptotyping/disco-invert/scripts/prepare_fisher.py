#!/usr/bin/env python
# prepare_fisher.py  •  rev-D •  07 May 2025
# ----------------------------------------------------------
#  • liest  “Fisher Corpus Texts 1-50.xlsx”  (oder anderen Pfad)
#  • säubert Kommentar-/Leerzeilen, normalisiert Sprecher-Tags
#  • MERGED-Klausen:  benachbarte Äußerungen desselben Sprechers
#        werden zusammengelegt, wenn   GAP  ≤  --gap  Sekunden
#      (Standard 0.50 s → tolerant für kleine Pausen)
#  • schreibt vier Artefakte:
#        fisher_clean.parquet              (utterances)
#        fisher_clean_merged.parquet        (clauses)
#        fisher_summary.csv                 (QC-Metriken)
#        fisher_schema.yml                  (Spalten + Version)
#  • doppelte Protokollierung:  stderr  +  fisher_clean.log
#
# Aufruf:
#     python prepare_fisher.py                    # Standardpfade, 0.50 s
#     python prepare_fisher.py my.xls  --gap 0.3  # eigenes Excel, engerer Merge
#
# ----------------------------------------------------------
from __future__ import annotations

import argparse
import inspect
import logging
import pathlib
import re
import sys
from datetime import datetime
from typing import Any, Dict, List

import pandas as pd

try:
    import yaml
except ModuleNotFoundError:  # Fallback:  JSON-Dump
    import json as yaml  # type: ignore


# ───────────────── Config ──────────────────────────────────
DEF_GAP = 0.50  # Sekunden – Standard-Merge-Puffer
TAG_RE = re.compile(
    r"<[^>]+>"                       # XML-artige Tags
    r"|\(\([^)]*\)\)"                # (( Kommentar ))
    r"|\b(?:uh|um|mm-?hm|uh-huh)\b",  # Fülllaute
    flags=re.I,
)
UTT_RE = re.compile(r"^\s*(\d+\.\d+)\s+(\d+\.\d+)\s+([AB])\s*$")

# Arrow-Backend verfügbar?
def _accepts_kw(func, kw):  # noqa: D401
    return kw in inspect.signature(func).parameters


ARROW_OK = (
    _accepts_kw(pd.read_excel, "dtype_backend")
    and _accepts_kw(pd.DataFrame.from_records, "dtype_backend")
)

# ───────────────── Logging ─────────────────────────────────
def _setup_log(path: pathlib.Path) -> None:
    fmt = "%(asctime)s [%(levelname)s] %(message)s"
    logging.basicConfig(
        level=logging.INFO,
        format=fmt,
        handlers=[logging.StreamHandler(sys.stderr), logging.FileHandler(path, "w", encoding="utf-8")],
    )
    logging.info("Start %s", datetime.now().isoformat(timespec="seconds"))


# ───────────────── Excel → DataFrames ─────────────────────
def _iter_sheets(xls: pathlib.Path):
    """Yield (sheet_name, DataFrame) pairs."""
    with pd.ExcelFile(xls) as book:
        for sheet in book.sheet_names:
            kw: Dict[str, Any] = {"sheet_name": sheet}
            if ARROW_OK:
                kw["dtype_backend"] = "pyarrow"
            yield sheet, pd.read_excel(book, **kw)


# ───────────────── Parsing 1 Sheet ─────────────────────────
def _parse_sheet(name: str, df: pd.DataFrame) -> List[Dict[str, Any]]:
    recs: List[Dict[str, Any]] = []
    for _, row in df.iterrows():
        m = UTT_RE.match(str(row.get("Speaker ID", "")))
        if not m:  # Kommentar / leer
            continue
        start, end, spk = float(m[1]), float(m[2]), m[3]
        text = (row.get("Text") or "").strip()
        recs.append(
            dict(
                file=row.get("Source.Name"),
                start=start,
                end=end,
                duration=end - start,
                speaker=spk,
                text=text,
                char_len=len(text),
            )
        )
    logging.info("Sheet %-12s → %5d utterances (%d raw rows)", name, len(recs), len(df))
    return recs


# ───────────────── Merge-Helfer ───────────────────────────
def _merge_adjacent(df: pd.DataFrame, gap: float) -> pd.DataFrame:
    """Fasse gleiche-Speaker-Turns zusammen, wenn Pause ≤ gap."""
    df = df.sort_values(["file", "start"], ignore_index=True)
    merged, cur = [], None
    for r in df.itertuples(index=False):
        if (
            cur
            and r.file == cur["file"]
            and r.speaker == cur["speaker"]
            and r.start - cur["end"] <= gap
        ):
            cur["end"] = r.end
            cur["duration"] = cur["end"] - cur["start"]
            cur["text"] += " " + r.text
            cur["char_len"] = len(cur["text"])
        else:
            if cur:
                merged.append(cur)
            cur = r._asdict()
    if cur:
        merged.append(cur)
    return pd.DataFrame(merged, copy=False)


# ───────────────── Hauptlogik ──────────────────────────────
def _prepare(xls: pathlib.Path, out: pathlib.Path, gap: float):
    recs: List[Dict[str, Any]] = []
    logging.info("Loading workbook %s", xls)
    for name, df in _iter_sheets(xls):
        recs.extend(_parse_sheet(name, df))
    if not recs:
        raise ValueError("❌ Keine Utterances gefunden!")

    df = (
        pd.DataFrame.from_records(recs, dtype_backend="pyarrow")
        if ARROW_OK
        else pd.DataFrame.from_records(recs).convert_dtypes()
    )
    df["conv_id"] = df["file"].factorize()[0]
    df["text_clean"] = (
        df["text"]
        .astype(str)
        .str.replace(TAG_RE, "", regex=True)
        .str.replace(r"\s+", " ", regex=True)
        .str.strip()
    )

    merged = _merge_adjacent(df, gap)
    logging.info("Merged segments : %d → %d rows  (gap ≤ %.2fs)", len(df), len(merged), gap)

    # QC-Stats
    gaps = (
        df.sort_values(["file", "start"])
        .groupby("file")["start"]
        .apply(lambda s: s.diff().dropna())
    )
    if not gaps.empty:
        logging.info("Gap stats       : median %.2fs | 95-pct %.2fs", gaps.median(), gaps.quantile(0.95))

    # ── Artefakte schreiben ───────────────────────────────
    df.to_parquet(out, index=False)
    merged_path = out.with_name(out.stem + "_merged.parquet")
    merged.to_parquet(merged_path, index=False)

    summary = (
        df.groupby("file")
        .agg(utts=("file", "size"), chars=("char_len", "sum"), dur=("end", "max"))
        .reset_index()
    )
    summary.to_csv(out.with_name("fisher_summary.csv"), index=False)

    schema = {"columns": list(df.columns), "version": "2025-05-07", "gap_sec": gap}
    yaml.safe_dump(schema, out.with_name("fisher_schema.yml").open("w", encoding="utf-8"))

    logging.info(
        "Artefacts saved : %s  %s  fisher_summary.csv  fisher_schema.yml",
        out.name,
        merged_path.name,
    )
    logging.info("Done.")


# ───────────────── CLI ─────────────────────────────────────
def main():
    here = pathlib.Path(__file__).resolve().parent
    default_xls = here.parent / "data" / "Fisher Corpus Texts 1-50.xlsx"
    default_out = pathlib.Path("fisher_clean.parquet")

    pa = argparse.ArgumentParser(
        prog="prepare_fisher.py",
        description="Tidy Fisher-Excel in Parquet + QC-Artefakte.",
    )
    pa.add_argument("excel", nargs="?", default=default_xls, type=pathlib.Path, help="Pfad zur XLSX-Datei")
    pa.add_argument("-g", "--gap", default=DEF_GAP, type=float, help="Merge-Schwelle in Sekunden")
    args = pa.parse_args()

    if not args.excel.exists():
        pa.error(f"Excel file not found: {args.excel}")

    _setup_log(default_out.with_suffix(".log"))
    _prepare(args.excel, default_out, args.gap)


if __name__ == "__main__":
    main()
