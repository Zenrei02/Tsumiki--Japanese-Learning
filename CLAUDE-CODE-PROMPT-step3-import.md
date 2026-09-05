# Task — Step 3 clean import (all 9 blind-grading batches)

## Context

Keiko has returned **all nine** blind-grading batches (B1 Aug 22 → B9 Sep 4 2026).
Every count reported so far — including the recurring "unnatural rewrite" pattern —
came from **raw Drive text scrapes**, which corrupt free-text comment cells. Nothing
has been through `import-grading-responses.py` yet. `Blind Grading` G–H is empty:
150 rows, 0 grades.

So the eval currently has **no trustworthy numbers at all**, and the Results sheet
shows nothing. This task produces the first real ones.

This is a **correctness task, not a convenience one**, for one specific reason:
`naoshi-eval-v1.xlsx` and `naoshi-eval-v1-with-outputs.xlsx` are both gitignored and
untracked (`.gitignore:75-76`). They are the only load-bearing artefacts in the
project **with no version history**. A bad import is unrecoverable except from
`backups/`. Take the snapshot first. Every time.

## What the numbers are for

Read `Results` after the import. The gates, decided Aug 2 2026 before any results
existed, are narrow:

| Gate | Meaning |
|---|---|
| `A28` invented ≤ 5% | at most **2 of 50** per model |
| `A29` invented ≤ 3% | at most **1 of 50** per model |
| `A30` FIX-tier 誤指摘 | **any at all = hard fail**, no rate involved |
| `A31` overall | GO needs agreement ≥90% **and** ≤5% invented **and** zero FIX-tier invented |

Two misfiled comments flip a model on the rate. **One** misfiled comment on a
FIX-tier row fails it outright. That is why steps 5–6 exist and are not optional.

---

## Step 1 — Snapshot first

```bash
cp naoshi-eval-v1-with-outputs.xlsx backups/naoshi-eval-v1-with-outputs.06-pre-step3-import.xlsx
```

Then **open the copy and read it** — confirm `Blind Grading` has 150 rows and 0
values in column G. The counts in `backups/README.md` are trustworthy precisely
because every one was read back rather than assumed. Add a row to that table.

The importer writes only to `naoshi-eval-v1-with-outputs.xlsx`; the master
`naoshi-eval-v1.xlsx` holds the sentences and the key and is not touched. No master
snapshot is needed for this operation.

## Step 2 — Get a real `.xlsx`

In **Naoshi — ブラインド採点 responses (all batches)**
(`1QxPjAXNtCIwuB8m6eBCMP8mWWcKWln7zYIZCXBLNLP8`, owned by zensoreno@gmail.com):

> File → Download → Microsoft Excel (.xlsx)

Drop it in the project folder. Any filename containing `response` is found
automatically; otherwise pass the path.

**Do not substitute a text scrape, a CSV export, or a `web_fetch` of the sheet.**
That is the specific failure this whole task exists to undo — it mangles commas and
line breaks inside Japanese comment cells, and every provisional count in the
tracker (B2, B7/B8, B9) is unreliable for exactly that reason.

> ⚠️ **An earlier draft of this line overstated what had been checked.** It said the
> Drive connector's `download_file_content` with `exportMimeType:
> …spreadsheetml.sheet` was "verified" as equivalent to the manual download. What was
> actually observed was that the endpoint *returns something with an xlsx header*. It
> was never decoded, so its comment cells were never inspected — the one property that
> matters here. The reasoning that it is Google's own export path rather than a scrape
> is still sound, but reasoning is not verification, and this file is exactly the kind
> of place where an unearned claim gets believed later.
>
> Separately: an attempt to relay that export's bytes through a chat transcript
> **failed and produced a corrupt file** (4.9 KB against ~92 KB). Do not try it.
>
> **File → Download is the reference path.** The `text/csv` and plain-text exports are
> definitely unsafe and are what corrupted every provisional count in the tracker.

## Step 3 — Import

```bash
python3 import-grading-responses.py
```

**What a correct run looks like.** Nine tabs, every one `complete`, and this total:

| B1 | B2 | B3 | B4 | B5 | B6 | B7 | B8 | B9 | total |
|---|---|---|---|---|---|---|---|---|---|
| 15 | 15 | 15 | 15 | 12 | 15 | 15 | 18 | 30 | **150** |

Then `Wrote 150 rows into Blind Grading G-H (0 conflicts).` and
`Still ungraded: none — all 150 outputs graded, Step 3 complete.`

**Anything else is a finding, not an obstacle.** The script is built to refuse
rather than half-write, and its refusals are load-bearing:

- **`N graded output(s) have no row in Blind Grading` → nothing was written.** The
  forms and the workbook disagree about how many outputs exist. Reconcile them.
  Do **not** delete responses to make it pass. This guard exists because the
  script once shipped with a hardcoded `BG_LAST=124` and silently dropped all 30
  of B9 while printing "Step 3 complete" — the range is now read from the sheet.
- **`Unrecognised grade value(s)` → nothing was written.** The form choices and the
  column G validation have drifted apart.
- **`CONFLICT Oxxx` lines** — an output graded twice. Latest wins, and the conflict
  is printed for adjudication. With one grader this should not appear; if it does,
  find out why before accepting the run.
- **A tab reading `NOT RETURNED` or `PARTIAL`** contradicts the tracker, which
  records all nine as received. Investigate rather than re-running.

**Known and cosmetic:** B3's name field reads 「木谷恵子は」 (a typo of Keiko's). The
importer keys on **Output ID**, never on the name, so this affects nothing but the
`〔…〕` tag appended to those comments. Leave it — the tag is a provenance record.
Do not edit the response sheet to tidy it.

## Step 4 — Recalculate before reading anything

`openpyxl` writes values but **cannot evaluate formulas, and strips cached
results**. Straight after the import the Results sheet is stale or blank.

**Open the workbook in LibreOffice or Excel, let it recalculate, and save.** Only
then are `Results` and the GO/TUNE verdict meaningful. Reading Results
programmatically before this step gives `None`, not a number — and a `None` read as
"no invented errors" is precisely the class of mistake this project keeps making.

## Step 5 — Run the checks before believing the verdict

```bash
python3 check-unnatural-rewrite.py     # is 誤指摘 really 誤指摘?
python3 check-key-confound.py          # is the disagreement Keiko vs. Tomoko?
python3 check-romaji-leak.py           # unrelated, but it is a post-run check and cheap
```

**`check-unnatural-rewrite.py`** — the four-way vocabulary (一致 / 部分一致 / 見逃し /
誤指摘) can only ask *did the tool find the error?* It has no cell for *found it, then
suggested an unnatural rewrite*, and Keiko reached for 誤指摘 when she hit that. The
pattern appears in **all nine batches**. Session 20 established it on B1's えり/犬
sentence (E25): three 誤指摘 across three models, real invented-error count 0.

⚠ **One of those three, `O107`, is a FIX-tier output**, so on B1's grades as
submitted `Results!A30` hard-fails M1 (Haiku 4.5) on it.

⚠️ **CORRECTED Sep 5 2026, after the import.** An earlier draft of this paragraph said
O107 was "a verdict Session 20 already determined was not an invented error." The
comments do not support that. Her E25 comments quote the tool's own suggested rewrite
and correct it toward the key — a judgement of the REWRITE that is silent on the
tool's separate diagnostic claim (「えりは→えりが」). That claim is what decides the
gate, and it is undetermined. Read O107 as a band of 0–1, never as 0.

The script prints the invented count three ways — **as graded / floor / ceiling** —
and flags when the band straddles a gate. It writes nothing. A floor is not a
result; it is what the eval would show if every flagged comment survives reading.
Read the rows.

**`check-key-confound.py`** — Tomoko set the key, Keiko grades against it, and where
they disagree it is charged to the tool. **45 of 150 outputs (30%)** sit on a
sentence whose key Tomoko amended (11 一部修正 + 4 要修正 of 50). B1, B3, B6 and B7
are 40% each. In B1 the six amended-key pages are **E18 and E39**, three outputs
apiece — `O023 O057 O076` and `O026 O056 O088`. The script prints the amended-vs-
clean disagreement gap; a large positive gap means some of the tool's apparent error
is really reviewer-vs-reviewer.

## Step 6 — Report, and change nothing

Write up:

1. Per model: agreement rate, invented count **as graded / floor / ceiling**, FIX-tier
   invented, and the GO/TUNE verdict — plus whether that verdict is stable across the
   whole band or depends on which end you read.
2. Every row flagged by the two checks, quoted in full.
3. The amended-vs-clean gap.
4. Which specific rows would need adjudication to settle a verdict.

**Do not edit a single grade, comment, or key.** Setting a reviewer's verdict aside
is an adjudication, and adjudications get recorded in `Eval Set` column L with a date
and a name — the way E09's does: `要修正→問題なし adjudicated by Lloyd, Aug 14 2026`.
That is Lloyd's call, not a script's and not yours.

The adjudication order, because Tomoko did all of Step 2 **unpaid** and her time is
the scarcest thing in the project:

1. Lloyd adjudicates;
2. accept and annotate, where it does not move a tier;
3. return to Tomoko **last**, batched, and only where it changes a verdict.

Budget roughly **one** return trip for the whole eval.

## Environment traps, all previously bitten

- **`web_fetch` caches per URL**, for hours, unmarked — it returns whatever the URL
  served on first fetch. It once produced a false "the patch failed" report here.
  Bust it with `?cb=anything`.
- **Drive `modifiedTime` does not move when a form response arrives** — the write
  comes from the Forms service, not a user edit. It is the right corroboration for an
  Apps Script write and the wrong one for "has she submitted?". Read contents.
- **Never rebuild a form.** B1 holds live responses; a rebuild orphans real graded
  data, the way `patch-b7-b8-forms.gs` orphaned 16 columns on B8. Text patches are
  safe because a response column is named by its item title.
- If `check-romaji-leak.py` reports the English-frequency filter is **OFF**, install
  `wordfreq` (`pip3 install --break-system-packages wordfreq`) and re-run — without it
  the check produced 91 flagged rows instead of 15, and 76 false positives is a report
  nobody finishes reading.

## Definition of done

- [ ] `backups/naoshi-eval-v1-with-outputs.06-pre-step3-import.xlsx` exists, was read back, and `backups/README.md` has its row
- [ ] 150/150 imported, 9 tabs complete, 0 conflicts, 0 orphans
- [ ] Workbook opened, recalculated, saved
- [ ] All three checks run and their output pasted in full
- [ ] Verdict reported per model with the invented-error band, not a single number
- [ ] Zero edits to any grade, comment, or key
