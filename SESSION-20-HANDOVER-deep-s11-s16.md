# Session 20 — DEEP for S11–S16, and the authoring era actually closes

*Written at Session 19's close, Aug 22 2026. Session 19 finished the arc era
completely and opened the DEEP era properly: gate first, oldest debt first,
two finished waves rather than six half ones.*

## Where Session 19 left the board

- **Arcs: DONE, all of them.** 449 arcs / 1,362 pages in `lesson-arcs-v1.json`,
  spliced, idempotent, preview rebuilt, `check-arcs.py` 441/441 (100%), the
  full verify chain green. There is no arc work left in the course.
- **DEEP: S1–S10 done.** 248 entries, 1,307 drill items. Session 19 added S9
  (36) and S10 (33) via `stage-9-deep-v1.json` / `stage-10-deep-v1.json`.
- **`check-deep.py` exists and is calibrated to the renderer.** Run it on any
  pending file BEFORE splicing: `python3 check-deep.py stage-11-deep-v1.json`.
  On its first outing it caught a duplicated correct option in sb-ikukuru's
  drill and a dead hl in oitadaku — both fixed. It knows: hl paints seg OR the
  point's ex lines OR wrinkle jps; wr.jp is optional; multi-accept answers
  need ONE option present, not all.

## What Session 20 builds

**DEEP for S11–S16, in stage waves, S11 outward: 186 points.**
S11: 30 · S12: 37 · S13: 33 · S14: 32 · S15: 27 · S16: 27.
Plus **6 real stragglers** to fold into the first wave: `sb-suruverbs` (S2),
`sb-ganotwo` (S4), `teshimau`, `teoku`, `tearu`, `sb-aspect` (S5).
`prim-shape` / `prim-drop` are excluded BY DESIGN (Session 17 ruled the
renderer opens on the arc; do not fake a seg) — do not rediscover them.

Re-measure at session start anyway: `python3 check-deep.py` prints the
coverage table from the module itself.

## The method that proved out (use it, don't reinvent it)

1. Author `stage-N-deep-v1.json` as a deep-only content file: `new_steps`
   blocks whose `cat` already exists, `points: []`, entries in `deep`.
   build-stage3.py skips the block and splices only the deep dicts.
2. Entry shape: `seg` [[span, gloss(,1)]…] decomposing the lesson's own first
   example (sentence-final 。 included); `hl`; one-line `note`; ONE `wr` with
   `t`/`jp`/`en`/`hl`; `drill` of 5 items — q/en/a/opts/why. Drills reuse the
   lesson's own ex sentences and step-sibling contrasts as distractors, so no
   new words enter the ledger and no distractor is defensibly correct.
   sb- lessons: drill + note only, never a faked seg.
3. Gate → add file to CONTENT in build-stage3.py → splice → **grep the DEEP
   block, don't read the log** → `check-deep.py` plain → `build-vite-app.py`
   → commit per stage.

## Traps hit this session, so you don't hit them again

- **⚠️ build-stage3.py's DEEP-existence check used to search the whole file.**
  The ARCS block (filled this session) emits lines in the IDENTICAL shape —
  `  "okage": {` — so all 36 S9 inserts were skipped as "already present"
  while the log read as success. Fixed: the check is now scoped between the
  @@DEEP markers. The class repeats: any splicer that greps the whole module
  for an id-shaped line can be fooled by a block added later. Census the
  TARGET block after every splice.
- **The smoke walk no longer fits the sandbox's execution window.** Against
  the post-splice module the walk runs green — 22+ ok checks reached in 40s,
  INCLUDING the walkthrough pager and a presented drill item, i.e. the two
  things Session 19 changed — but the terminal PASS line sits past the 45s
  per-call cap, and detached (setsid) runs are reaped between tool calls, so
  no in-sandbox run reached it. State it exactly: partial-walk green on a
  fresh bundle; full completion unverified in-sandbox. Lloyd's machine runs
  `npm run smoke` to the end in seconds — ask for that rather than burning
  calls. And never trust a PASS whose bundle predates your splices — the
  freshness gate refused a stale one this session, which is it working.
- `pkill -f smoke` matches the bash -c wrapper that launched it and kills
  your own call (exit 143). Use the .done marker discipline instead.

## Reviewer arithmetic (batches U and V)

Arcs added ~470 new JP lines (settings + extensions, S12–S16) — **batch U**.
DEEP S9+S10 added 345 keyed drill items + 69 wrinkle lines — **batch V, first
tranche**. S11–S16 DEEP will add roughly 930 more items. Nothing from any
review batch (B1–B9, J–T) had returned as of Session 19; Lloyd's own N2/N1
audit was still pending. If either lands before Session 20 authors anything,
READ IT FIRST — a systematic voice finding changes 930 items cheaply now and
expensively later.

## Standing rules that bound this work

One push per session, at close, by Lloyd. Whole-file deliverables. Verify the
artifact, not the log — twice proven again this session. The eval set and
SYSTEM_PROMPT untouched. Journals record what was known; never rewrite one.

*Two waves in, six to go, and the gate was built before the content — which
is the whole reason the remaining six are safe to author fast.*
