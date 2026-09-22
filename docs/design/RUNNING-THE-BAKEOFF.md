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

2. **Install the two libraries** — `openpyxl` reads/writes the eval workbook,
   `wordfreq` is used by the romaji check in step 5:

   ```
   pip3 install openpyxl wordfreq
   ```

   Two common hiccups, both fine:
   - `pip3: command not found` → `sudo apt install python3-pip`, then retry.
   - `error: externally-managed-environment` (newer Ubuntu/Debian protects
     system Python) → use the packaged version instead:
     `sudo apt install python3-openpyxl`
     (or, if you prefer pip: `pip3 install --break-system-packages openpyxl wordfreq`)

   **`wordfreq` is not optional in practice, even though the script runs
   without it.** It is how the romaji check tells a Japanese word written in
   Latin letters from ordinary English. Measured on the real 150-row run:

   | | rows flagged to eyeball |
   |---|---|
   | with `wordfreq` | **9** |
   | without it | **89** |

   The check still runs without the library and warns that it is missing — but
   80 extra rows of false positives is not a rougher check, it is one nobody
   finishes reading.

   (Both figures measured Aug 17 2026 against the completed 150-row run, with
   the current word list. Session 16 recorded 91 → 15 for the same workbook;
   that was the same comparison before four grammar terms were added to the
   script's stop list, which is what moved 15 → 9.)

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
answer key — the script refuses to run without it, on purpose. **150 calls**
(50 sentences x 3 models), each result printed as it lands.

**Budget ~35 minutes and ~US$4.20.** Both figures are measured, not estimated:
the naoshi-4 run cost $4.11 and the naoshi-5 run $4.23, and the naoshi-5 run
took 13.5 seconds per row wall-clock. The older "~US$2.00, a few minutes" here
dated from the 40-sentence set and from before `max_tokens` went to 8000 — the
Claude 5 family spends adaptive-thinking tokens inside that budget, so both the
clock and the bill roughly doubled. Cost splits very unevenly by model:
M1 ~$0.21, M2 ~$1.68, M3 ~$2.34.

(It was 120 calls / ~$1.60 when the set was 40 sentences. The set grew to 50 on
Aug 12 2026 — six REAL clean controls, two WORTH KNOWING, two UNNATURAL. The
invented-error gates did NOT move: at most 2 invented still passes the goal bar
and at most 1 the stretch bar.)

**If it crashes or you close the window mid-run: just run the same command
again.** Every completed call is already saved in `bakeoff-log.jsonl`; the
script picks up where it stopped and re-runs nothing.

### A run can finish with rows missing — and retrying only fixes some of them

The naoshi-5 run ended `⚠️ RUN INCOMPLETE — 6 of 150 rows missing`. Re-running
recovered five. The sixth never will, and the difference is worth knowing before
you burn calls on it.

- **Five were Opus/Sonnet returning a thinking block and NO text block at all**
  — nothing to parse, not malformed output. One had spent all 8000 tokens
  thinking (`stop_reason: max_tokens`); the other four simply stopped
  (`end_turn`) after 358–1529 thinking tokens. **These recover on retry**,
  because M2 and M3 reject the `temperature` parameter and so run at the model
  default — a retry is genuinely a different sample.
- **One was Haiku emitting invalid JSON** — an unescaped `"` inside a gloss
  (`出す (transitive, "to produce/put out")`), which breaks the object. **This
  will never recover**, because M1 is the only model that still accepts
  `temperature=0`, so it reproduces its output byte for byte. It failed
  identically three times.

So: retry once. If a row fails twice and it is an **M1** row, stop retrying —
it is deterministic. **Do not hand-repair the JSON to rescue it**; that
manufactures a parse the harness never made. Leave the row out, and say so — it
costs that model one row of denominator (M1's key-edit rate was reported 17/41,
not /42).

When it finishes you get `naoshi-eval-v1-with-outputs.xlsx` — the workbook
copy with the Blind Grading sheet filled in — plus token totals to paste into
the two yellow cells on the Results sheet.

---

## 4. After the run — Step 3 grading forms

The run produces the outputs; it doesn't grade them. Two commands turn those
150 outputs into the Results sheet.

```
python3 build-grading-forms.py
```

Reads the filled workbook and writes `build-grading-forms.gs` — **9 Google Forms**,
one per batch (B1–B9). **Batches are no longer equal**: most are 5 sentences (15
outputs), but B5 is 4 (12), B8 is 6 (18) and B9 is 10 (30). The script prints a
`NOTE` about uneven batches — that is expected, not an error. Same routine as Step 2: script.google.com → New
project → paste over Code.gs → Run → `buildAllGradingForms` → send each reviewer
the LIVE link for their batch, B1 first as calibration.

It refuses to run, on purpose, if Step 2 is unfinished, if any Blind Grading row
has no tool verdict, or if a model code would end up in a reviewer-facing file.
The last one matters most: a grader who can tell which model wrote an output
makes the comparison worthless.

Reviewers see the sentence, the verified key (including any correction they made
at Step 2), and the tool's output — but never which model produced it. Grading is
the same four choices as column G: 一致 / 部分一致 / 見逃し / 誤指摘.

**A grading batch is 12–30 outputs, roughly 25–60 minutes** depending on the batch
— noticeably longer than a Step 2 batch. One sitting per batch. B9 is the big one
at 30 outputs; consider warning whoever grades it.

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

### ⚠️ A NEW `--run` WIPES THE IMPORTED GRADES. They are not lost, but they do not carry over.

`--run` rebuilds `naoshi-eval-v1-with-outputs.xlsx` **from
`naoshi-eval-v1.xlsx`**, which has never held grades — they only ever existed in
the with-outputs copy, put there by `import-grading-responses.py`. So the moment
you re-run the harness, columns G–H are blank again.

Nothing is destroyed: the grades are in the response spreadsheet and in
`backups/`. What bites is how the loss *presents*. `check-rewrite-quality.py`
then reports:

```
Reviewer-derived positives: 0
precision 0%   recall 0%
```

which reads like a catastrophic collapse in quality and is actually a missing
join. **Do not quote precision, recall or row-level agreement from a run whose
outputs have not been graded.** The per-model and per-signal counts above that
block are still valid — they are computed from source, key and rewrite only, and
never touch a grade.

**And do not "fix" it by re-importing the old grades onto new outputs.** Those
grades describe the *text the previous prompt produced*. Attaching them to
different text would silently fabricate agreement. New outputs need new grading,
which costs reviewer time — that is the real reason a prompt change is expensive,
and why the instrument exists.

**Before any re-run, snapshot the graded workbook into `backups/`** with the
prompt version in the name, the way `naoshi-eval-v1-with-outputs.08-naoshi-4-final.xlsx`
was. It is the only copy of the old prompt's scored results, and the naoshi-4
baseline was re-derivable in Session 26 purely because that snapshot existed.

---

## 5. The romaji check — the reason `wordfreq` is installed

```
python3 check-romaji-leak.py
```

Runs against the finished workbook and needs no key, no forms and no reviewer
time. It scans every feedback cell for a **Japanese word written in Latin
letters** — "use tabemasu here" instead of "use 食べます here" — which the
containment rule forbids. English glosses are fine; romaji *readings* are not.

This is a **reporting aid, not a gate**. It is deliberately tuned to over-report,
so read the hits rather than trusting the count: it prints each flagged row with
its feedback so a pass takes a few minutes. Grammar terminology written in
English (`godan`, `ichidan`, `suru`, `sonkeigo`) is already filtered out, as are
`kanji`, `kana` and the usual loanwords.

A confirmed leak is a **`SYSTEM_PROMPT` problem, not a grading problem.** Do not
fix it by editing outputs — that edits the thing being measured. Note it and
carry it into the GO/TUNE decision.

(Why this is a script and not eval rows: the Blind Grading vocabulary is
一致 / 部分一致 / 見逃し / 誤指摘, none of which can express "the explanation was
correct but written in romaji". A reviewer handed a leak row would grade the
verdict and miss the leak. The script also covers all 150 rows instead of two
special ones.)

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
| Romaji check flags ~89 rows instead of ~9 | `wordfreq` is missing — the check says so in its own header line. `pip3 install --break-system-packages wordfreq` |
| `ANTHROPIC_API_KEY is not set` | Run the `read -rs` line again in the SAME window you run the script from. |
| `credit balance is too low` | Add usage credits at console.anthropic.com. |
| `ABORT ... requested X, answered Y` | A model substitution — stop and flag it in the tracker. This check exists because it happened silently once before. |
| `API error 401 … Unauthorized` **inside a Cowork session** | Not your key. See below — the sandbox blocks it. |
| `⚠️ RUN INCOMPLETE — N rows missing` | Re-run the same command once. M2/M3 rows usually recover; an **M1** row that fails twice is deterministic and never will. See "A run can finish with rows missing" above. Never hand-edit the JSON to rescue one. |
| `check-rewrite-quality.py` reports `precision 0%  recall 0%` | Not a quality collapse — the outputs are ungraded. `--run` rebuilds the workbook and clears the imported grades. See the warning in §4. The per-model and per-signal counts above that block are still valid. |
| `note: <model> rejects 'temperature' — retrying without it` | Expected, not an error. The Claude 5 family dropped the parameter, so those models run at their API default — which is also how production calls them. Only M1 still runs at `temperature=0`. |
| Anything else | Copy the error message into a Cowork session and I'll sort it. |

---

## ⚠️ The bake-off CANNOT be run from inside a Cowork session

Found Sep 6 2026, after a 401 was misread as a rotated key and nearly sent
someone to the Console to make a new one.

**The Cowork sandbox's egress layer rejects any request to `api.anthropic.com`
that carries an `x-api-key` or an `authorization` header.** It is a credential
control, not a key check — it never looks at the value. So the request never
reaches Anthropic, and the harness reports a 401 that has nothing to do with
your key. **A perfectly valid key fails exactly the same way.**

### How to tell this apart from a real auth failure, in one look

| | intercepted by the sandbox | genuinely from Anthropic |
|---|---|---|
| body | `Unauthorized` — plain text, 12 bytes | `{"type":"error","error":{"type":"authentication_error",…},"request_id":"req_…"}` |
| headers | `Connection`, `Content-Type`, `Transfer-Encoding` — that is all | includes `Request-Id`, `Cf-Ray`, `Server`, `Date`, `X-Should-Retry` |

**A 401 with no `request-id` header never reached Anthropic.** Their API always
stamps one, on errors as much as on successes.

### The discriminating test, if you ever need to re-confirm it

Send the same request with the key in a header the proxy does not police:

```python
# x-api-key -> intercepted, bare "Unauthorized"
# x-foo     -> sails through; Anthropic replies "x-api-key header is required"
```

If a made-up header carrying the same key-shaped string gets a real JSON answer
and `x-api-key` does not, the key is not the problem and never was.

### Where to run it instead

Anywhere outside the sandbox: your own terminal, or a Claude Code session on
your machine. Nothing about the harness changes — `python3 bakeoff-harness.py
--smoke` then `--run --key-verified`, exactly as above.

### ✅ CONFIRMED Sep 8 2026 (Session 26): the key is fine and always was

The diagnosis above was written from inside the sandbox, where it could only be
argued from response headers. It has now been settled the direct way. Run from a
Claude Code session on Lloyd's own machine, the key in `ANTHROPIC_API_KEY`:

- passed `--smoke` — **no 401 at all**, all three models answered under their own
  names;
- completed a full 150-call run.

**The key had never been tested by anything until this run** — the Session 24
brief said so in as many words, and a Sep 6 reading of the same 401 had already
concluded it was rotated and nearly sent someone to the Console to replace it.
**Revoking it would have destroyed a working credential to fix a problem it did
not have.**

Keep this paragraph next to the diagnosis above, because the two are only
convincing together: the sandbox 401 is real, *and* the key behind it is good.
The wider habit is the one CLAUDE.md keeps relearning — a limitation written
down outlives the mistake that produced it, so when the cheap direct test
becomes available, run it and date the answer.
