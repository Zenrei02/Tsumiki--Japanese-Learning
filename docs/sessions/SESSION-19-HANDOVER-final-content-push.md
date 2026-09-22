# Session 19 — the final content push (arcs + DEEP)

*Written at Session 18's close, Aug 21 2026, minutes after Lloyd's push landed
(origin/main moved 22:27, thirty minutes after the last commit — verified by
timestamp, not by the rev-list zero that lies). The curriculum is complete and
live: 16 stages, 581 lessons, 193 kanji, 763 words, N5 through N1. Session 19
closes the authoring era.*

## What Session 19 builds, and what it must not

**Two jobs, in this order: arcs first, DEEP second.** Arcs are learner-visible
and carry no answer keys; DEEP drills carry answer keys, the one content type
where an error actively teaches something false. If the session runs short,
a finished arc wave beats a half-finished everything.

**Scope, measured (do not trust these numbers — re-measure at session start,
the way every count in this project has eventually needed):**

- **Arcs:** ~165 grammar points across Stages 11–16 (the preview's own line —
  "293 of 581 carry an arc" — is the instrument; run `build-arc-preview.py`
  first and read it). Each arc: a `setting` (EN scene, one JP line, en gloss,
  pattern) + 2–3 `extensions` (kind flip/wrinkle, scene, jp, en).
- **DEEP:** ~200 grammar points across Stages 9–16 (S1–S8 + Step 28 have it;
  nothing after does). Each block: `seg` (segmented walkthrough), `wr`
  (wrinkles), `drill` (~5 items with q/a/opts/why).

## The rules that already exist — do not re-derive them

1. **Arc scenes have a 30-word floor.** Set in S9 (74 came in short, expanded
   not padded), enforced again in S10 (41 more). It will bite again; budget an
   expansion pass after the first draft, because there has always been one.
2. **Arcs enter via `lesson-arcs-v1.json` + `build-arcs.py`**, DEEP via the
   `@@DEEP` markers through `build-stage3.py`. JSON is the source of truth;
   the module is derived; `--update` exists and is never the default.
3. **Whole-file deliverables, splice scripts censused, verify the artifact
   not the log.** The ledger parser, the preview, and `--update` have each
   lied exactly once. Every splicer since carries a census.
4. **Scan every string for stray scripts before splicing** — a Russian word
   reached a hajimeru example once. The check is one grep.
5. **Register discipline in scenes:** S11–S14 scenes live in offices, counters
   and notices; S15–S16 scenes may lean literary but the JP line must match
   the pattern's register wall (や否や does not happen in a kitchen).

## Build the drill checker BEFORE authoring DEEP

Answer keys demand mechanical verification that exists before the content
does, not after. Minimum assertions, as a new `check-deep.py`:

- every drill item's `a` (answers) appear in `opts` when opts exist;
- no item where a distractor equals an accepted answer;
- every `q` blank (`___`) has at least one `a`;
- seg spans exist character-for-character in their sentence;
- every covered point id exists in the module;
- census: DEEP blocks parsed == blocks present.

This is the same move as the conjugator's golden tests and the scene
reachability guard: the check first, so a green result can mean something.

## Sequencing within the session

1. Re-measure both scopes (preview + a DEEP census against the module).
2. Arcs for S11 (37 points) as the pilot wave → run checks → then S12–S16 in
   stage-sized JSON files (`stage-N-arcs-v1.json`), splicing per wave.
3. The short-scene expansion pass (history says it's coming).
4. `check-deep.py`, exercised against the EXISTING S1–S8 DEEP first — if it
   flags old content, that's a finding, not a bug in the checker.
5. DEEP in stage waves, S9 outward (oldest debt first), drills leaning on
   each lesson's own bank vocabulary so no new words enter the ledger.
6. Full verify chain: preview, drift, smoke, stage-view, golden forms,
   arc/scene/mca checks, DEEP checker.
7. ONE push at close (Netlify: every push to main that touches tsumiki-app/
   costs a build; this one will).

## The review interaction — decided, not drifted into

Lloyd chose to run this push despite the queue. Record what that means:
arcs add ~500 new JP lines (batch U), DEEP adds ~1,000 keyed items (batch V) —
roughly doubling a reviewer pile that already runs J–T, in the two formats
(dialogue lines, answer keys) where native review catches the most. If any
review batches have RETURNED by Session 19, read them before authoring —
a systematic finding about the voice changes how 500 scenes get written, and
reading it first is free.

## Standing state worth knowing cold

- Reviewer: B1 grading link goes out the morning of Aug 21 (Lloyd's task);
  ¥300/output pricing raise is post-B1; payment method undecided.
- Lloyd's own audit of the N2/N1 content is scheduled and takes precedence
  over new authoring if findings are structural.
- The 8 declared N1 soft cells live in `n1-audit.json`; arcs/DEEP for their
  adjacent lessons could fold them in cheaply — check while authoring.
- STEP_POINTS generator slurps LEVELS ids into the last step's list —
  known artifact, harmless, do not rediscover.
- After this push: content era CLOSED. What follows is corrections (small,
  batched), elective polish (kanji Group 11+, scenes wave 3, anecdote wave 2 —
  the last still blocked on batch J), and then Phase 1 product work.

*One more session of authoring. Then the repository stops growing by words
and starts changing by verdicts. 言うまでもなく — finish well.*
