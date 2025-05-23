# Fisher Corpus Texts 1‑50 — DATA.md v1.2  
*(Excel workbook: `Fisher Corpus Texts 1-50.xlsx`)*  

This revision appends **official LDC metadata** about Fisher English Training Speech Part 1 and clarifies how the 50‑conversation Excel subset relates to the full corpus.

---

## A. Quick reference — LDC corpus metadata

| Field | Value |
|-------|-------|
| Item Name | Fisher English Training Speech Part 1 Speech |
| LDC Catalog No. | LDC2004S13 |
| DOI | https://doi.org/10.35111/da4a-se30 |
| Release Date | December 15, 2004 |
| Audio format | NIST SPHERE, 2‑channel µ‑law, 8000 Hz, Shorten‑compressed |
| Total conversations (full corpus) | 11,699 (Parts 1 & 2) |
| Total hours (full corpus) | ≈1,960 h (984 h in Part 1) |
| Gender breakdown | 6,813 female, 5,104 male |

---

## B. Scope of this Excel subset

* **Subset size**: 50 conversations (≈8.4 hours) extracted from the 5,850 audio files in Part 1.  
* The Excel file holds only **transcripts** for these 50 calls; no audio is bundled here.  
* All structural and processing details below remain unchanged from v1.1.

---

-------|---------|------|
| `000` | Main data (comments + utterances) | 24430 |
| `Tabelle1` | Empty placeholder | 0 |

---

## 2. Column dictionary (sheet `000`)

| Column | dtype | nulls | null_frac |
|--------|-------|-------|-----------|
| Source.Name | object | 0 | 0.0 |
| Speaker ID | object | 12173 | 0.498 |
| Text | object | 12273 | 0.502 |

---

## 3. Record types

| Type | Detection rule | Row count |
|------|----------------|-----------|
| Comment | `Speaker ID` starts with '#' | 100 |
| Utterance | regex `^\s*\d+\.\d+\s+\d+\.\d+\s+[A-Za-z]` | 12157 |
| Empty / other | everything else | 12173 |

---

## 4. Corpus statistics

| Metric | Value |
|--------|-------|
| Total conversations | 50 |
| Total rows | 24430 |
| Total utterances | 12157 |
| Speakers per conversation | 2 (A & B) |
| Avg utterances per file | 243.1 |
| Avg utterance char length | 37.89 |

### Speaker distribution

| Speaker | Count | Share |
|---------|------:|-------:|
| B | 6362 | 52.33% |
| A | 5795 | 47.67% |

---

## 5. Timestamp & speaker semantics

* `START` and `END` = seconds from conversation start (float).  
* Only speakers **A** and **B** occur in this subset.

| Stat | Seconds |
|------|---------|
| Min duration | 0.25 |
| Median duration | 1.47 |
| Mean duration | 2.28 |
| 95th pct | 7.04 |
| Max duration | 14.98 |

---

## 6. Example conversation profile — *fe_03_00001.txt*

| Metric | Value |
|--------|-------|
| Rows (including blanks) | 576 |
| Utterances | 287 |
| Speaker A utterances | 149 |
| Speaker B utterances | 138 |
| Speaker turns | 182 |
| Conversation duration | 507.34 s |
| Gaps between utterances | 212 (max 3.96 s) |
| Overlaps between utterances | 74 (max 4.06 s) |
| Text length (chars) | mean 30.07, min 4, max 151 |

---

## 7. Quality‑control & advanced metrics

| Check | Quick code |
|-------|------------|
| `start < end` | `(utterances['End_Time'] > utterances['Start_Time']).all()` |
| Non‑decreasing timestamps per file | `utterances.groupby('Source.Name')['Start_Time'].is_monotonic_increasing` |
| Overlap / gap histogram | `np.histogram(np.diff(utter['Start_Time']) - utter['duration'])` |
| Strip leading/trailing spaces | `utterances['Text'] = utterances['Text'].str.strip()` |
| Merge adjacent same‑speaker turns | `...groupby(['Source.Name','Speaker']).apply(lambda g: ' '.join(g['Text']))` |

---

## 8. Ready‑to‑run Python loader (updated)
```python
import re, pandas as pd

FILE = "Fisher Corpus Texts 1-50.xlsx"
df = pd.read_excel(FILE, sheet_name="000", dtype_backend="pyarrow")

utt_regex = re.compile(r"^\s*(\d+\.\d+)\s+(\d+\.\d+)\s+([AB])")
def parse(row):
    m = utt_regex.match(str(row['Speaker ID']))
    if not m: 
        return None
    st, en, spk = float(m[1]), float(m[2]), m[3]
    txt = (row['Text'] or "").strip()
    return st, en, spk, txt

records = []
for _, row in df.iterrows():
    res = parse(row)
    if not res: 
        continue
    st, en, spk, txt = res
    records.append({{
        'file': row['Source.Name'],
        'start': st,
        'end': en,
        'speaker': spk,
        'text': txt,
        'duration': en-st,
        'char_len': len(txt)
    }})

utts = pd.DataFrame.from_records(records)
utts['conv_id'] = utts['file'].factorize()[0]

# save for fast reload
utts.to_parquet("fisher_clean.parquet", index=False)
```

---

## 9. Encoding & text quirks

* Leading and trailing spaces appear **in most utterances** — call `.str.strip()`.  
* Inline tags: `<laughter>`, `<breath>`, `(( ))` etc.  
* Excel import is UTF‑8 safe; the companion SPH audio uses Windows‑1252.  

---

## 10. Data workflow recommendations

1. Strip spaces **then** tokenise.  
2. Merge adjacent utterances from the **same speaker** if gap ≤ 0.3 s.  
3. Drop comment rows (`#…`) unless you need channel metadata.  
4. Detect & handle overlapping speech (`start < prev_end`).  
5. Cache to Parquet for 10× faster reloads.
