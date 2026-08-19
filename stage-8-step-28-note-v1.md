# Step 28 · Asking, and being allowed — build note

*Session 17. Answers Lloyd's question "why are Stages 7 and 8 so small?", and the four
follow-on instructions. Content is authored and spliced; nothing pushed.*

## Why the step exists

Two separate causes were behind the small stages, and only one of them was a problem.

**S7 is small by accident.** The nine-stage split used existing checkpoints as boundaries,
and the checkpoint spacing in the old Stage 2 was already uneven — Checkpoints 4 and 5 each
cover four steps, Checkpoint 6 covers three, and those three are themselves short. Nobody
decided that; S7 inherited it. Left alone, because the only way to grow it is to move Step
20 across from S6, which puts Checkpoint 5 inside a stage and breaks the one rule that makes
the whole split defensible.

**S8 was small by design, and separately had a hole.** The design half is Lloyd's own
Session 14 ruling, still sitting in the module as a comment: *keigo opens Stage 3, SPACED
OUT — three small steps (hear it → lower yourself → build it), not one heavy one.*

The hole is what the diagnostic found. A probe across every title, explanation, wrinkle and
drill in the module returned **zero occurrences** of:

| construction | occurrences before this step |
|---|---|
| `〜させていただく` | 0 |
| `〜ていただけませんか` / `〜ていただきたい` | 0 |
| `お〜いただく` / `ご〜いただく` | 0 |
| `ご覧いただく`, `お待ちいただく`, `お願いできますか` | 0 |

The module had already noticed and not said so. **Step 27's composition brief (`b-keigo`)
asks the learner to produce ご確認いただけますか** — a form nothing in 246 lessons had ever
taught. That is the strongest possible evidence the gap was real rather than a matter of
taste: the app was setting an exercise on material it did not contain.

## Shape

Steps 24–27 are receptive — hear it, place it, dress a verb. Step 28 is the two things a
resident actually *does* with keigo, and it is placed where it is because it cannot come
earlier: it needs **Step 14's いただく** and **Step 20's causative**, and the meeting of the
two is the lesson.

| id | kind | what |
|---|---|---|
| `teitadakeru` | grammar | 〜ていただけますか / 〜ていただけませんか — asking upward, in the potential |
| `oitadaku` | grammar | お〜いただく・ご〜いただく — the request wearing Step 27's frame |
| `saseteitadaku` | grammar | 〜させていただきます — the causative meets いただく |
| `sb-onegai` | skill | one request, five heights |
| `cc-harigami` | culture | 貼り紙 — 誠に勝手ながら、本日休業させていただきます |
| `b-onegai` | composition | one request, three heights |

Four arcs, twelve extension pages, four DEEP blocks with wrinkles and drills. `rc7` now
covers the new points, and its text says why its last section changes character.

**S8 goes from 20 lessons / 8 teaching points to 26 / 12** — comparable to S7 (19 / 13),
and still the smallest teaching stage, which is now stated rather than left to be inferred.

## Sources

- 敬語の指針, 文化審議会答申, 2 February 2007 (平成19年) —
  https://www.bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/pdf/keigo_tosin.pdf
  Cited in `saseteitadaku.watch` for the claim that the guidelines take the construction up
  directly as a point of overreach. **Flagged for the reviewer**: the document's existence
  and date are confirmed; the characterisation needs a native reader to sign off.

## Reviewer

Batch **L**, with the rest of the keigo stage. Two items need a native eye most:

1. `sb-onegai`'s five-rung ladder — the ordering is the author's calibration, not a cited
   one, and it is the sort of thing a Japanese speaker will place slightly differently.
2. `cc-harigami`'s 貼り紙 wording — whether 誠に勝手ながら / 都合により / 何卒ご了承ください
   is really the set of phrases on shutters, or a plausible-sounding assembly of them.

## What else changed in the same pass

- **Step numbers.** Stage 9's Steps 28–33 became 29–34 to make room, and `b-s28`…`b-s33`
  moved with them. Nothing else shifted; no lesson id outside Stage 9 changed.
- **`build-stage3.py --update` was lying.** It reported `skipped … already present` for
  every point inside an already-spliced `new_steps` block, so an edit to `rc7` printed a
  clean run and changed nothing. That froze two thirds of the module's lessons out of the
  JSON-is-source-of-truth contract, silently. `--update` now walks those points, and DEEP
  entries are diffable too. This is the "green result that arrives too easily" failure the
  conventions file already warns about, caught by checking the module rather than the log.
- **`smoke.mjs` was matching Stage 1 by the subtitle `Foundations`.** The re-staging renamed
  it, so the test failed on a rename rather than on a regression. It now matches the card
  structurally.
