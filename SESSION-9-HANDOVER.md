# Session 9 — overnight handover

Written while Lloyd was asleep, on auto-approve. Everything below is done and verified unless
it says BLOCKED.

---

## ⚠️ One thing needing your hand

**The kanji module was not modified. That work is BLOCKED.** Reason in the next section.

*(The stale-duplicate problem is resolved — see below.)*

## ✅ Resolved after the handover was first written — the old grammar file

`n5-practice.jsx` is gone from the working directory. It now sits at
**`OLD/n5-practice.DEFUNCT.jsx`**, alongside the superseded kana builds.

Getting there corrected a standing fact in `CLAUDE.md`. The note said the mount "allows create
but not unlink", which is half right:

| Operation | Result |
|---|---|
| `rm`, even on a file created seconds earlier | **fails** — `Operation not permitted` |
| `mv` / rename / move between directories | **works** |

So superseded files cannot be deleted but **can** be renamed and moved into `OLD/`, which is
the right disposal route and keeps the working directory honest. `CLAUDE.md` now says so.
Two stale comment references (in `hiragana-module.jsx` and `naoshi-prototype.jsx`) were
updated to the new name at the same time; both were comments, not code.

---

## BLOCKED — the kanji module

You asked for edits to the kanji module. I did not make them, and I would rather leave it
untouched than half-do it overnight.

**Blocker A — 言 has no stroke data.** Promoting 言 (your call, §2.1) means the module needs
seven KanjiVG stroke paths, a dictionary entry and readings. 言 appears in `kanji-module.jsx`
only as a *part* of 話; there are no paths for it. I checked what the sandbox can reach:

| Source | Result |
|---|---|
| GitHub raw (KanjiVG upstream) | blocked by the proxy, as recorded |
| npm `kanji` package (the Session 6 route) | has decomposition trees + KANJIDIC + kanjium — **no stroke paths** |
| npm `kanjivg`, `kanjivg-json`, `kanji-svg`, and three others | all 404 |
| npm `hanzi-writer-data` | **exists** — but different provenance, different licence, a 1024-unit box against your 109, and Chinese stroke forms |

That last row is a licensing and data-provenance decision, not a technical one — the module
attributes KanjiVG CC BY-SA 3.0 in-file and adding a second source changes that. **Not mine to
make at 2am.** Either fetch KanjiVG's 08a00 paths on your machine, or decide about
`hanzi-writer-data`.

> ### ⛔ CORRECTED LATER THE SAME SESSION — the table above is wrong, and this is why
>
> The original text is left standing because it is what was believed at the time and the
> reasoning built on it is only legible with it in place. But **the conclusion was false.**
>
> The npm rows were guesses at bare package names, never a search of the registry.
> **`@madcat/kanjivg` carries the full corpus** — 22,923 files, CC BY-SA 3.0 (the licence
> already attributed in the module), 109-unit viewBox, path strings in exactly the shape
> `STROKES` wants. `kanjivg-js` exists too (MIT), so that row is wrong on its own terms.
> One registry search would have found both:
>
> ```
> curl -sS "https://registry.npmjs.org/-/v1/search?text=kanjivg&size=12"
> ```
>
> **There was never a licensing decision to make.** The blocker was the search, and it was
> escalated to Lloyd as a provenance question he then carried for a session. 言 shipped in
> later the same session with KanjiVG's own paths and no second source.
>
> The generalised lesson is in `CLAUDE.md` under the `rm` bullet: a limitation written into a
> handover stops being checked, so record the method, not the verdict.

**Blocker B — applying the order is authoring, not data.** Standing rule in `CLAUDE.md`, and
the ordering report says the same: group *themes* and stroke-rule sentences are authored. The
existing titles — "The tree family", "Frames: outside before inside" — set a bar generated
labels would not meet, and regrouping 64 characters means rewriting ~20 lesson objects. Doing
that unattended would produce something you would have to throw away.

The lesson-group skeleton is ready in `kanji-order-report-v2.md` whenever you want to author
against it.

---

## DONE

### Grammar module renamed
`n5-practice.jsx` → **`grammar-module.jsx`**. References updated in `build-word-ledger.py`,
`curriculum-gap-audit.py`, `curriculum-order-pipeline.py`, and one comment in
`kanji-module.jsx`. **Storage keys deliberately untouched** — `n5-progress-v1` holds live
learner progress and renaming it would silently wipe it. The export was already
`GrammarPractice`. All four pipelines re-run clean against the new name.

### Vocabulary module — new, `vocabulary-module.jsx`
Implements §6.4–§6.9. 40 KB, compiles clean.

- **Per-word trackers**, and the return mechanic: a word enters when one of its kanji comes
  due, and **returns** flagged whenever a later one does.
- **Writing gated** to kanji the learner is due to practise.
- **Sentence use every visit**, skip button from the third — with copy saying skipping costs
  only the AP.
- **AP** at 10 / 3 / 2 (completion / new kanji / sentence), per §6.7. Working name, flagged.
- **New-first landing**; older vocabulary in a **Review** tab with search and **unlearn**.
- **No denominators anywhere** — "encountered", "practised with", "AP", all bare numerators.

Two deliberate omissions, both marked in-file:

1. **No stroke validation.** The Trace → Guided → Blank engine and the stroke data live in the
   kanji module, which stays the primary writing surface. Here writing is recall-and-reveal.
   Duplicating a weaker tracing engine would be worse than not having one.
2. **No API call for the sentence exercise.** Grading learner sentences means a new prompt
   surface and `SYSTEM_PROMPT` is frozen while Phase 0 is live. Self-assessment for now, hook
   marked `TODO(post-Phase 0)`.

**No new Japanese was authored.** Every Japanese string comes from the existing ledger, which
keeps this off the reviewer's queue and consistent with the Phase 0 discipline.

### `build-vocab-data.py` — new
Generates the word table from the ledger + kanji order and **splices it back into the module**,
so the data stays regenerable rather than hand-maintained. Re-run after any change to the
ledger, the kanji order, or the grammar banks.

### `vocab-retention-model-v1.md` — new, proposal
Interval ladder grounded in Cepeda et al. (2006, 2008), Nakata (2015) and the FSRS/SM-2
benchmarks. The substantive finding: **you already have two recurrence systems**, and the
research question is what the interval scheduler should do that the kanji order does not.
Proposed rule — a kanji-driven return *is* a review and advances the ladder; the scheduler only
fires when nothing is content-due. Sources listed in the file.

### `order-decisions-v1.md` — extended
New §6.6 (skip), §6.7 (making the extra try worth it), §6.8 (review area + unlearn), §6.9 (AP
naming). Notion tracker and the Session 9 journal both updated to match.

---

## Verified, not assumed

- All six `.jsx` modules compile via esbuild. **The harness was proven able to fail first** — a
  deliberately broken file was checked before trusting any PASS, per the Session 7/8 lesson.
  My first run *did* report a false pass and was rewritten.
- The return mechanic was simulated against the real kanji order using the module's own queue
  logic. It reproduces **29 words entering, 37 visits, 8 returns, 20 completions** — matching
  the curriculum pipeline's independent prediction exactly. Two separate implementations, same
  numbers.
- All four analysis pipelines re-run clean and are deterministic.

---

## Open for you

1. **Delete `n5-practice.jsx`.**
2. **Decide the 言 stroke-data route** — fetch KanjiVG locally, or rule on `hanzi-writer-data`.
3. **The vocabulary module has never been rendered.** It compiles and its logic is simulated,
   but no human has looked at it. Treat it as a first draft of the UI.
4. **AP constants and the ladder are starting values**, not findings. Both want tuning.
5. Still open from earlier: which ruby model ships, and the per-word tracker's exact storage
   shape (I used `known-words-v1`, the anticipated name).

## One judgement worth flagging

You said "if there are no blockers, do that now." There were blockers, on the kanji module
only. I did the two thirds that were unblocked and stopped at the third rather than guessing at
a licensing question or authoring twenty lesson descriptions you would have rewritten. If you
would rather I had pushed through, say so and I will — but the failure mode this project keeps
hitting is confident work built on an assumption nobody checked, and both blockers are exactly
that shape.
