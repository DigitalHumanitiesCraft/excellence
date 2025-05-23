#!/usr/bin/env python
# analyse_fisher.py  •  rev-D  (07 Mai 2025)
# ------------------------------------------------------------
# Erkennt in fisher_clean_merged.parquet:
#   1. Dative-Alternation  (DO-IO  /  IO-PP)
#   2. Alle in der Projektliste genannten Subjekt-Aux-Inversionen:
#        NEG    : never, nowhere, hardly, seldom, scarcely, rarely,
#                 little, less, only*, no sooner*, Objekt-Not-Phrasen
#                 (*Mehrwort-Trigger eingeschlossen)
#        COND   : Had/Were/Should + Subj …
#        DEGREE : So/Such-Inversion  (So little time did …)
#        COMP   : Vergleichs-/as-than-Inversion  (… as do I)
#        EXCL   : Exklamative  (Boy did she …, How hard …)
#        OPT    : Optativ/Formel (May …, Long live …, So be it)
#        REJ    : Positive/negative rejoinder  (So do I, Neither do they)
#
# CSV-Ausgaben:
#   • dative_sentences.csv
#   • inversion_sentences.csv  (mit Spalte inv_type)
# ------------------------------------------------------------
from __future__ import annotations

import argparse
import itertools
import logging
import pathlib
import re
import sys
from typing import Iterable, List, Sequence

import pandas as pd
import spacy

PARQUET_DEFAULT = pathlib.Path("fisher_clean_merged.parquet")

# ---------- Listen & Regex ------------------------------------------------------------------
DAT_VERBS: set[str] = {
    "give","show","tell","offer","send","teach","promise","lend","hand",
    "bring","pass","mail","read","make","buy","get","assign","serve",
    "write","sell","owe","award","grant",
}

NEG_SINGLE = {"never","nowhere","hardly","seldom","scarcely","rarely","little","less","only"}
NEG_MULTI  = {"at no time","on no condition","least of all","no sooner"}
NEG_OBJ_RE = re.compile(r"^not\s+(?:a|an|one|any|the)\b", re.I)

COND_AUX  = {"had","were","should"}
DEGREE_RE = re.compile(r"^(so|such)\b", re.I)
EXCL_RE   = re.compile(r"^(boy|what|how)\b", re.I)
OPT_RE    = re.compile(r"^(may|long live|so be it|suffice it to say)\b", re.I)
REJOIN_RE = re.compile(r"^(so|neither|nor)\b", re.I)
COMP_RE   = re.compile(r"\b(as|than)$", re.I)

NONALPHA  = re.compile(r"^\W*$")

# ---------- spaCy ---------------------------------------------------------------------------
def _ensure_model(name: str = "en_core_web_sm") -> spacy.language.Language:
    try:
        return spacy.load(name, disable=("ner",))
    except OSError:
        from spacy.cli import download
        logging.info("Downloading spaCy model %s …", name)
        download(name)
        return spacy.load(name, disable=("ner",))


def _parse_pipe(texts: Iterable[str], nlp: spacy.language.Language) -> List[spacy.tokens.Doc]:
    return list(nlp.pipe(texts, batch_size=128, n_process=4))

# ---------- Dative-Detector ------------------------------------------------------------------
def classify_dative(doc: spacy.tokens.Doc) -> str | None:
    for v in (t for t in doc if t.pos_ == "VERB" and t.lemma_.lower() in DAT_VERBS):
        obj  : Sequence = [c for c in v.children if c.dep_ in {"obj","dobj"}]
        iobj : Sequence = [c for c in v.children if c.dep_ == "iobj"]
        obl_to = [c for c in v.children if c.dep_ == "obl"
                  and any(g.dep_ == "case" and g.lemma_.lower() == "to" for g in c.children)]
        prep_to = [p for p in v.children if p.dep_ == "prep" and p.lemma_.lower() == "to"]
        pobj    = [g for p in prep_to for g in p.children if g.dep_ == "pobj"]

        if obj and (iobj or obl_to): return "DO-IO"
        if obj and (pobj or obl_to): return "IO-PP"
    return None

# ---------- Inversion-Detector ---------------------------------------------------------------
def inversion_type(doc: spacy.tokens.Doc) -> str | None:
    if not doc or NONALPHA.match(doc[0].text):
        return None
    first = doc[0].lemma_.lower()
    start3 = doc[:3].text.lower()

    # --- NEG / restrictive ------------------------------------------------
    if first in {"nor","neither"}:
        return None  # explizit ausgeschlossen
    if start3 in NEG_MULTI or first in NEG_SINGLE or NEG_OBJ_RE.match(start3):
        return "NEG" if _aux_before_subj(doc) else None
    # --- CONDITIONAL ------------------------------------------------------
    if first in COND_AUX and doc[0].dep_ == "aux" and _subj_after(doc[0]):
        return "COND"
    # --- DEGREE so/such ---------------------------------------------------
    if DEGREE_RE.match(first) and _aux_before_subj(doc):
        return "DEGREE"
    # --- COMPARATIVE as/than ---------------------------------------------
    if any(tok.dep_ == "mark" and COMP_RE.match(tok.lemma_) for tok in doc):
        return "COMP" if _aux_before_subj(doc) else None
    # --- EXCLAMATIVE ------------------------------------------------------
    if EXCL_RE.match(first) and _aux_before_subj(doc):
        return "EXCL"
    # --- OPTATIVE / FORMEL -----------------------------------------------
    if OPT_RE.match(start3):
        return "OPT"
    # --- REJOINDER so/neither/nor ----------------------------------------
    if REJOIN_RE.match(first) and _aux_before_subj(doc):
        return "REJ"
    return None


def _aux_before_subj(doc: spacy.tokens.Doc) -> bool:
    aux_seen = False
    for tok in itertools.islice(doc, 1, len(doc)):
        if tok.dep_ == "aux":
            aux_seen = True
        if aux_seen and tok.dep_ == "nsubj":
            return True
        if tok.dep_ in {"punct", "ROOT"}:
            break
    return False


def _subj_after(token: spacy.tokens.Token) -> bool:
    for tok in token.doc[token.i + 1 :]:
        if tok.dep_ == "nsubj":
            return True
        if tok.dep_ in {"punct", "ROOT"}:
            break
    return False

# ---------- Analyse-Pipeline -----------------------------------------------------------------
def analyse(df: pd.DataFrame) -> None:
    nlp = _ensure_model()
    logging.info("spaCy model: %s", nlp.meta["name"])

    docs = _parse_pipe(df["text_clean"], nlp)
    df   = df.assign(doc=docs)

    df["dative_type"] = [classify_dative(d) for d in df["doc"]]
    df["inv_type"]    = [inversion_type(d)  for d in df["doc"]]

    df.query("dative_type.notna()").reset_index(drop=True) \
      .to_csv("dative_sentences.csv", index=False,
              columns=["file","start","speaker","text_clean","dative_type"])

    df.query("inv_type.notna()").reset_index(drop=True)    \
      .to_csv("inversion_sentences.csv", index=False,
              columns=["file","start","speaker","text_clean","inv_type"])

    print("\nDATIVE-Verteilung")
    print(df["dative_type"].value_counts(dropna=True).to_string())
    print("\nINVERSIONEN  (nach Typ)")
    print(df["inv_type"].value_counts(dropna=True).to_string())

# ---------- CLI ------------------------------------------------------------------------------
def main() -> None:
    pa = argparse.ArgumentParser(prog="analyse_fisher.py",
        description="Dative-Alternation & alle SA-Inversions­typen im Fisher-Korpus erkennen.")
    pa.add_argument("parquet", nargs="?", default=PARQUET_DEFAULT, type=pathlib.Path,
                    help="Pfad zu fisher_clean_merged.parquet")
    args = pa.parse_args()
    if not args.parquet.exists():
        pa.error(f"{args.parquet} nicht gefunden")

    logging.basicConfig(level=logging.INFO, stream=sys.stderr,
                        format="%(levelname)s: %(message)s")
    logging.info("Lade %s …", args.parquet)
    analyse(pd.read_parquet(args.parquet))

if __name__ == "__main__":
    main()
