# Handover — Claude Code → Cowork (Session 16, Aug 15 2026)

Everything `HANDOVER-to-claude-code.md` asked for is done. This file is the
report back: what actually happened, what it found, and what is still open.
Read `CLAUDE.md` for environment facts; not repeated here.

## What was done, in order

**1. Diagnosed E20.** Ran M1 (Haiku 4.5) on E20's sentence eight times outside
the harness. 4/8 succeeded, 4/8 failed identically: Haiku returned a valid
fenced JSON block, then kept talking — a paragraph of English commentary past
the closing fence. `json.loads`/`JSON.parse` choked on the trailing prose
("Extra data"). Not truncation (112–372 output tokens, nowhere near the 8000
cap), not malformed JSON, not a refusal. This was already committed
(`0ffe23d`) before this leg of the session picked back up: both
`bakeoff-harness.py` and `supabase/functions/check/index.ts` now extract the
first balanced JSON object and discard the rest, instead of stripping fence
markers and handing the remainder to the parser.

Worth restating because it nearly went into the verdict as a Haiku defect and
would have been wrong: the JSON was always well-formed. This was our parsing
bug, not a Haiku reliability finding. Haiku does follow the "no fences"
instruction less strictly than Sonnet or Opus, which is real but minor and not
disqualifying.

**2. Deployed the checker endpoint.** `check` was on version 3 (pre-fix
parser); deployed version 4 with the fix, `verify_jwt: false` (matches the
prior deploy — this is the intentional anonymous-checker design documented in
`supabase/README.md`, not a new decision). Verified with a real POST, not just
the deploy log — two things came back that resolve open items from the
previous handover:

- `access-control-allow-origin: https://naoshi.netlify.app` — `TSUMIKI_ALLOWED_ORIGIN`
  turned out to be already narrowed, not `*`. **Resolved**, no action needed.
- `"cap":{"used":1,"limit":10}` — the daily-cap `service_role` grant fix
  (`351c7b4`) is proven live. First successful reserve ever recorded.
  **Resolved.**

Not checked: the app's own Checker tab in a real browser session against the
deployed endpoint. Everything above was verified by curling the endpoint
directly, not by exercising the UI. Per `CLAUDE.md`'s own standing lesson
("verify the artifact, not the log"), that UI path is still unverified and
should be the first thing anyone checks before calling this done end-to-end.

**3. Re-ran the bake-off.** Resumed from the 149 already-logged rows; only
E20×M1 called the API. With the fixed parser it landed clean on the first
try — verdict `NONE`, no retries needed. **150/150, an honest 50/50/50 across
M1/M2/M3**, every `model_answered` matches `model_requested` (no silent
substitution). `naoshi-eval-v1-with-outputs.xlsx` rewritten with all 150 rows.

Cumulative tokens:

| Model | Input | Output |
|---|---|---|
| M1 (Haiku 4.5) | 99,174 | 16,017 |
| M2 (Sonnet 5) | 131,385 | 82,798 |
| M3 (Opus 5) | 128,729 | 65,947 |

**4. `check-romaji-leak.py`.** Installed `wordfreq` first (not installed by
default; `RUNNING-THE-BAKEOFF.md` only asks for `openpyxl`, so this is an
addition worth knowing about) — cut 91 raw candidates down to 15. Eyeballed
all 15 against the actual containment rule (`input-romaji-layer-spec-v1.md`:
English **glosses** allowed, romaji **readings** banned):

- **Not leaks** — `godan`, `ichidan`, `suru`(-verb), `sonkeigo`. These name
  grammatical categories in established English-language Japanese-teaching
  terminology, the same class as the already-whitelisted `kanji`/`kana`. The
  detector's `STOP` list doesn't include them yet; worth adding if this check
  becomes routine, to cut the eyeball work next time.
- **Real leaks, 6 rows, spread across all three models** (not one model's
  problem): O010 (`友達 (tomodachi, friend)`), O015 (`the word 'daremo'
  pattern`), O057 (`貯まる (tamaru, 'to accumulate')`), O064 (`強いて
  (shiite)`), O075 (`待ち合わせ (machiawase)` / `会議 (kaigi)`), O105
  (`Harakuchi` for 原口 — a personal name transliterated, a slightly different
  flavor than the others).

Per the script's own instruction and `CLAUDE.md`'s "measure separately, state
alongside" rule for exactly this kind of thing: **outputs were not edited and
the prompt was not touched.** This is a `SYSTEM_PROMPT` gap to carry into the
GO/TUNE verdict, not something fixed mid-run. That decision is yours.

**5. Results sheet.** Filled the yellow avg-token cells (B18:D19) in
`naoshi-eval-v1-with-outputs.xlsx`. Cost section now computes:

| | M1 | M2 | M3 |
|---|---|---|---|
| Cost / 1,000 checks | $3.59 | $32.72 | $45.85 |

Accuracy section (agreement rate, invented-error rate, the GO/TUNE cells
themselves) is still blank — it depends on `Blind Grading` column G, which
only the reviewer fills in. That's step 6.

**6. `build-grading-forms.py` — found and fixed a real bug before running it.**
`BG_LAST=124` / `ES_LAST=45` were stale from before the eval set expanded
40→50 on Aug 12. Running as-is would have **silently dropped E41–E50** (30
output rows across all three models — the WORTH KNOWING tier and the
REAL-CORRECT rows that Aug 12 audit specifically added) with no error
message: the `range()` loop simply never visits those rows, so the script's
own "not in Eval Set" safety check never gets a chance to fire. Same
success-log-hides-a-failure shape as the trashed-forms and B7/B8 incidents
already in `CLAUDE.md`.

Fixed to 55/154, confirmed against the workbook's real data extents first
(Eval Set → row 55 = E50, Blind Grading → row 154 = O150), then ran it.
Also needed the Blind Grading batch column (an INDEX/MATCH formula)
recalculated first — `openpyxl` never evaluates formulas, so `data_only`
reads came back blank and the script correctly refused rather than guessing.
Recalculated via a one-off headless LibreOffice/UNO script rather than
reimplementing the lookup in Python, to stay faithful to the real formula.
The resulting batch sizes (B5=12, B8=18, B9=30, rest=15) match the script's
own docstring exactly — independent confirmation the range fix was right.

**Output: `build-grading-forms.gs`, committed.** 150 outputs across 9
batches, blinding check passed (no `M1`/`M2`/`M3` in the generated file).

## What's still open

- **The reviewer step — the one human gate on Phase 0, unchanged from before.**
  Paste `build-grading-forms.gs` into script.google.com, run
  `buildAllGradingForms`, send the batch LIVE links out. Same flow as Step 2.
  Once responses come back: `import-grading-responses.py`, then the Results
  sheet's Accuracy section and the GO/TUNE verdict cells compute themselves.
- **The Checker tab, end-to-end, in the real app** — not exercised this
  session. Endpoint is proven live by direct curl; the UI path calling it
  through `VITE_CHECKER_URL` is not.
- **The romaji-leak finding** — 6 confirmed rows, all three models, needs a
  decision: carry as a caveat alongside the verdict (as the previous handover
  anticipated), or treat as a blocking prompt fix before GO. Not decided here.
- Unchanged from before: Supabase accounts; the tool-`input_schema` JSON
  upgrade (decide after the verdict, not before); the pre-existing
  `public.rls_auto_enable()` anon-executable RPC (not ours, not urgent, revoke
  before real traffic); Stage 3 steps 27+; kanji Group 7; potential2 on R6;
  the kana-tab paging verdict; the N4 holding pen; the 57-shape policy pass.

## One thing worth carrying forward

Both bugs caught this session (`0ffe23d`'s parser, and today's stale row
ranges) were found by checking the artifact against what it was supposed to
contain rather than trusting a script that ran without error. Neither would
have thrown — both would have completed, printed something that read as
success, and quietly produced less than what was asked for. `CLAUDE.md`
already has this lesson written down twice; this session is a third instance
in the same folder, on different code.

Per the standing rule: **at most one push per session.** These commits are
local; Lloyd pushes once from GitHub Desktop.
