# Running the bake-off harness — a primer (Linux)

You only ever run one script: `bakeoff-harness.py`. The other Python files in
this folder (`curriculum-gap-audit.py`, `build-word-ledger.py`) are dev tools
that get run in Cowork sessions — you never need to touch them.

There is no project, no build, no compiler. Python is just a program that
reads a script file and runs it.

---

## One-time setup (~2 minutes)

Open a terminal in this folder (most file managers: right-click → "Open
Terminal Here", or `cd` to the folder).

1. **Check Python** — almost every distro ships it:

   ```
   python3 --version
   ```

   If that prints a version, done. If not (Debian/Ubuntu/Mint):
   `sudo apt install python3`

2. **Install the one library the script needs** (reads/writes the eval
   workbook):

   ```
   pip3 install openpyxl
   ```

   Two common hiccups, both fine:
   - `pip3: command not found` → `sudo apt install python3-pip`, then retry.
   - `error: externally-managed-environment` (newer Ubuntu/Debian protects
     system Python) → use the packaged version instead:
     `sudo apt install python3-openpyxl`
     (or, if you prefer pip: `pip3 install --break-system-packages openpyxl`)

That's the entire setup.

---

## The three commands

Run from this folder, in this order.

### 1. Rehearsal — free, safe, no key needed

```
python3 bakeoff-harness.py --dry-run
```

Prints what a real run WOULD do: how many sentences it found, which models,
how many calls. Nothing is sent anywhere. Run it as often as you like — it's
how you check the Eval Set sentences are being picked up.

### 2. Load your key, then smoke test — costs about a cent

Don't type the key directly into a command — it would be saved in your shell
history. This reads it invisibly instead (paste, press Enter; nothing will
appear on screen, that's the point):

```
read -rs ANTHROPIC_API_KEY && export ANTHROPIC_API_KEY
```

The key now exists only in this terminal window and vanishes when you close
it. Then:

```
python3 bakeoff-harness.py --smoke
```

Sends ONE sentence to each of the three models and prints their verdicts.
This proves your key works and — the important part — that each model answers
under its own name. If this passes, the full run will work.

### 3. The real run — after the reviewer has verified the answer key

Same window (so the key is still loaded):

```
python3 bakeoff-harness.py --run --key-verified
```

The `--key-verified` flag is you asserting the reviewer has checked the
answer key — the script refuses to run without it, on purpose. Takes a few
minutes: 120 calls, one per second, each result printed as it lands. Total
cost ~US$1.60, less with caching.

**If it crashes or you close the window mid-run: just run the same command
again.** Every completed call is already saved in `bakeoff-log.jsonl`; the
script picks up where it stopped and re-runs nothing.

When it finishes you get `naoshi-eval-v1-with-outputs.xlsx` — the workbook
copy with the Blind Grading sheet filled in — plus token totals to paste into
the two yellow cells on the Results sheet.

---

## 4. After the run — Step 3 grading forms

The run produces the outputs; it doesn't grade them. Two commands turn those
120 outputs into the Results sheet.

```
python3 build-grading-forms.py
```

Reads the filled workbook and writes `build-grading-forms.gs` — 8 Google Forms,
one per batch, 15 outputs each. Same routine as Step 2: script.google.com → New
project → paste over Code.gs → Run → `buildAllGradingForms` → send each reviewer
the LIVE link for their batch, B1 first as calibration.

It refuses to run, on purpose, if Step 2 is unfinished, if any Blind Grading row
has no tool verdict, or if a model code would end up in a reviewer-facing file.
The last one matters most: a grader who can tell which model wrote an output
makes the comparison worthless.

Reviewers see the sentence, the verified key (including any correction they made
at Step 2), and the tool's output — but never which model produced it. Grading is
the same four choices as column G: 一致 / 部分一致 / 見逃し / 誤指摘.

**A grading batch is 15 outputs, roughly 25–35 minutes** — noticeably longer than
a Step 2 batch. One sitting per batch.

```
python3 import-grading-responses.py
```

Same routine as Step 2: download the response spreadsheet as .xlsx, drop it in
this folder, run. Writes into the Blind Grading G–H columns of
`naoshi-eval-v1-with-outputs.xlsx`, reports anything still ungraded, and flags
conflicts if a sentence was graded twice.

Then open the workbook so the formulas recalculate, and read the **Results**
sheet: agreement rate, invented-error rate, the two invented-error gates, and the
GO / TUNE verdict per model.

---

## Key safety, restated

- Load the key with `read -rs` as above: it never appears on screen, never
  lands in shell history, is never saved in any file, and closing the
  terminal forgets it.
- Never paste the key into a chat, a document, or Notion. If it ever ends up
  somewhere it shouldn't, revoke it at console.anthropic.com and make a new
  one — keys are free; leaks aren't.

## If something goes wrong

| Symptom | Fix |
|---|---|
| `python3: command not found` | `sudo apt install python3` |
| `No module named openpyxl` | `sudo apt install python3-openpyxl` (or the pip route above) |
| `ANTHROPIC_API_KEY is not set` | Run the `read -rs` line again in the SAME window you run the script from. |
| `credit balance is too low` | Add usage credits at console.anthropic.com. |
| `ABORT ... requested X, answered Y` | A model substitution — stop and flag it in the tracker. This check exists because it happened silently once before. |
| Anything else | Copy the error message into a Cowork session and I'll sort it. |
