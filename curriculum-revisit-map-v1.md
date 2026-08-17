# Revisit map — what the grammar module cannot teach in one pass

**Status as of Aug 15 2026: six of the seven mapped points have shipped.**
This file is now mostly a record of a completed idea. Two things are still
live — read those and skip the rest:

- **`sb-ganotwo` still needs the reviewer's R6 ruling** (§ "Immediate
  consequence" below). It is the only mapped point with no revisit and no
  plan, because the decision isn't ours.
- **〜ています may want a third pass in Stage 2.** Never more than a "watch
  this"; still just a watch.

Everything else below is history, kept because the reasoning is worth having
when the same problem turns up in Stage 3+.

*Updated by the Aug 15 2026 weekly audit, which found the map still presenting
shipped work as a to-do list while its own header told the next session to
follow it. The risk was concrete: re-authoring Step 14 and Step 16.*

---

A linear syllabus teaches each point once, at one place. Some points cannot be
finished there — not because the explanation is weak, but because the learner
lacks the grammar needed to see the whole shape. Teaching them once and moving on
produces a learner who "did" は/が in Step 2 and still cannot use it in Step 11.

## The pattern, now named

Two lessons did this before it was deliberate:

- `sb-waga` (Step 2 · Core particles) → `sb-waga2` (Step 11) — literally titled
  **「は vs が · second look」**
- `teiru` → `teiru2` (both Step 4) — 〜ています split into *ongoing* and
  *habit / state*

The convention that came out of it, and that Sessions 13–15 followed: a revisit
is `kind: "skill"`, takes a **new id with a `2` suffix**, is optional, and is
placed at the step where the missing grammar has just arrived. A revisit is not
a review: `rc-` re-tests what was taught, a revisit teaches something *new*
about a point the learner already met.

## The map

| Point | First contact | Why it can't finish there | Revisit | Status |
|---|---|---|---|---|
| は / が | `sb-waga` — Step 2 | Contrast, scope, and が in subordinate clauses all need clause embedding | `sb-waga2` — Step 11 | ✅ **Done** — the template |
| Pronoun omission | `sb-pronouns` — Step 3 | Step 3 teaches *drop it*. It cannot teach **when 私 is required**, because that case is mostly relative clauses — 名詞修飾 arrives in Step 4 | `sb-pronouns2` — Step 11, after `sb-waga2` | ✅ **Done** (Session 13) — aligned with eval row E12 (`私が好きなスポーツは…`, keyed CORRECT) |
| に vs で | `sb-nide` — Step 2 | Extended by あります/います (Step 8) and 〜に行きます (Step 6), both after | `sb-nide2` — Step 8, after `location` | ✅ **Done** (Session 13) — new rule: event-あります takes で |
| 自動詞 / 他動詞 | `sb-transitive` — Step 4 | Pairs are teachable early; the particle consequence keeps resurfacing, and it is one of the highest-frequency real error families in the chat logs | `sb-transitive2` — Step 10, before `sb-ganotwo` | ✅ **Done** (Session 13) — separates the two unrelated が, not a re-teach |
| は・へ・を pronunciation | `particles` — **hiragana module** | Kana plants it before the learner knows what a particle *is* | `sb-kanaparticles` — Step 2 | ✅ **Done** (Session 13) — the first deliberate **cross-module** revisit; precedent set that revisits may span modules |
| あげる / くれる / もらう | `ageru` — Step 8 | Perspective is learnable there; the keigo layer (いただく・くださる) and the が…くれる ↔ に…もらう choice are not | `ageru2`, `sb-kuremorau`, `itadaku` — Step 14; keigo layer in Steps 24–26 | ✅ **Done** (Sessions 14–15) — regression R1 lives here |
| Conditionals | `tara` — Step 12 (〜たら / 〜と) | 〜ば and 〜なら were not in Stage 1 at all, so the four-way contrast was structurally impossible | `ba`, `nara`, **`sb-if4`** — Step 16 · The four ifs | ✅ **Done** (Session 14) — `tara` carries an honesty flag that the set is completed later |
| が vs を | `sb-ganotwo` — Step 10 | ⚠️ See below — the lesson conflates a hard rule with a soft preference | Same step; needs **splitting**, not a revisit | 🔴 **Blocked on the reviewer (R6)** |
| 〜ています | `teiru` / `teiru2` — Step 4 | Already split. But state-vs-progressive depends on verb class, which needs vocabulary breadth | Possible third pass | 🟡 **Watch in Stage 2** |

## ⚠️ Still live — `sb-ganotwo` needs a decision that is not ours

Regression R6 (Aug 6 2026) found the checker flags `を好き` but **not**
`日本語を話せます`, and keeps `を` in its rewrite.

`sb-ganotwo` teaches both cases as one rule, sitting in Step 10 next to `suki`,
`jouzu`, `wakaru` and `potential` — the same grouping as the checker's L1
watchlist bullet, and with the same problem:

- 好き / 嫌い / 上手 / 下手 / 欲しい / わかる — が is effectively **obligatory**
- **Potential forms** — が and を are **both used**; が is the textbook default

Teaching them as one rule means the curriculum asserts something the checker
declined to assert. One of the two is wrong and they should agree.

**This is a reviewer question** — see the R6 write-up in
`prompt-regressions.md`. If they confirm `日本語を話せます` is natural, then
`sb-ganotwo` splits (or gains a caveat) **and** the watchlist bullet in
`SYSTEM_PROMPT` narrows — its own example currently asserts `日本語が話せる`.

Note this is also the module's best candidate for the **first spotlight**: the
lesson and the checker would then teach the same nuance from both directions.
`potential2` is the placeholder id if the split goes that way.

## Where spotlights attach

Per `spotlight-design-v1.md`, spotlights are authored, reviewer-verified, keyed on
`pattern_name`. Every one of them has a home lesson — the spotlight is the
in-context teaser, the lesson is the full treatment, and they should deep-link.

| Spotlight | Home lesson |
|---|---|
| が/を with potentials | `sb-ganotwo` / `potential` — Step 10 |
| は vs が under contrast | `sb-waga2` — Step 11 |
| 〜てもらう vs 〜てくれる | `ageru` — Step 8 → `sb-kuremorau` — Step 14 |
| 〜たら / 〜ば / 〜と / 〜なら | `sb-if4` — Step 16 |
| に vs で | `sb-nide` — Step 2 → `sb-nide2` — Step 8 |
| 〜ている state vs progressive | `teiru2` — Step 4 |
| Pronoun kept vs dropped | `sb-pronouns` — Step 3 → `sb-pronouns2` — Step 11 |

Every entry maps to a lesson that already exists. Spotlights need no new
curriculum — they need links into the curriculum we have.

**The "Spotlight" naming collision is resolved** (Aug 8 2026). The feature keeps
the name; the `wa` lesson was reworded and now opens **"は sets the stage."**

## Open questions — all three answered

Kept because the answers are the precedent, not because anything is pending.

- **Does a revisit gate progression?** **No.** Consistent with `rc-`
  checkpoints, which are ungated by design so testing stays friction-free.
  Gating remains its own Phase 2 tracker row, covering both at once.
- **Does the module surface "you'll see this again"?** **Yes** — Session 13 put
  forward pointers in the `watch` field of each first-contact lesson
  (`sb-nide`, `sb-pronouns`, `sb-transitive`). A learner who knows は/が returns
  in Step 11 tolerates an incomplete Step 2 explanation; one who doesn't
  concludes they failed to understand it.
- **Does the revisit re-use `point.id` or take a new one?** **A new one.**
  Progress keys on `point.id` (Session 5), so the two track independently. This
  is now a deliberate convention rather than an accident.

## 📋 Audit queue

**Empty.** The three items filed here on Aug 8 2026 were all closed the same
morning and the section is retired rather than carried:

1. **H-Series factual error** (`hiragana-module.jsx`) — fixed; the line now
   reads *"two of its kana take on second jobs as particles — and both change
   how they are read."*
2. **Missing grammar-side counterpart to the kana `particles` lesson** — shipped
   as `sb-kanaparticles` (Step 2), which also settled the prior question:
   revisits **may** span modules.
3. **"Spotlight" naming collision** — resolved; the feature keeps the name and
   the `wa` lesson was reworded.

Kana numeric claims were verified exhaustively on Aug 6–7 (~40 across `exp`,
`why` and `en` in both modules) and re-checked on Aug 15 after Sessions 11 and
13 added 856 lines: still clean. **Counting claims are in good shape — spend the
audit elsewhere.**

New items go to the weekly audit (`audit-YYYY-MM-DD.md` + the Notion 🔍 Audit
log), not back into this file.
