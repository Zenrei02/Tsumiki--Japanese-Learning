# When to stitch the modules together — decision v1

Session 9. Architecture. Answers a question Lloyd asked directly: *"When will it be time to
stitch this all together? We are getting to the point where they are sharing engines and word
lists."*

The short answer: **the trigger is not a date, and it has already fired once.**

---

## 1. What is actually shared today

Six single-file modules, ~695 KB, ~11,500 lines. Artifacts cannot import, so everything shared
is shared by copying.

| Shared thing | Copies | How it is kept in sync |
|---|---:|---|
| Design tokens `const T` | 6 | by hand |
| Stroke engine (6 functions) | 4 | by hand ×3, **generated ×1** |
| `STROKES` path table | 4 | by hand ×3, **generated ×1** |
| `loadJSON` / `saveJSON` | 2 | by hand |
| Word data | 1 | **generated** |
| Storage keys | 8 keys, 4 of them shared | by hand, by convention |

Rough duplication tax: **~85 KB, about 12% of all module code.**

Five build scripts now exist largely to paper over the missing import statement:
`build-word-ledger.py`, `build-vocab-data.py`, `build-shared-stroke-engine.py`,
`build-standalone-html.py`, `build-grading-forms.py`.

---

## 2. The trigger is drift, and drift is now measurable

Duplication costs nothing while every copy is identical. It starts costing correctness the
moment one copy is edited and the others are not — silently, because nothing checks.

`check-module-drift.py` now checks. It compares the engine functions, the design tokens, the
storage helpers and the storage keys across all six modules, normalises away formatting, and
exits nonzero on real divergence.

**It found one.**

> **The design token `note` is `#907119` in the kanji and vocabulary modules and `#B08A1F`
> everywhere else.**

That is not a cosmetic split. `#B08A1F` is the ochre that was measured at **3.2:1 contrast on
white — below WCAG AA**. The kanji module fixed it (Session 4 records the change explicitly)
and the fix never propagated. The checker, the grammar module and both kana modules still ship
the failing colour.

**So the answer to "when" is: the stitching moment passed at least one session ago, and nobody
noticed because nothing was watching.** The fix is trivial and the detection was not.

### Three false alarms first — worth knowing

The detector reported drift three times before reporting it correctly:

1. `floor * 1.6` vs `floor*1.6` — whitespace around operators
2. `calibrated: true,}` vs `calibrated: true}` — trailing commas in literals
3. `for (...) {x}` vs `for (...) x` — a brace pair around a single statement

All three are formatting. **A drift alarm that fires on formatting is worse than no alarm,
because it trains you to ignore it.** The first two are now normalised away; the third is
recorded in a `BENIGN` allowlist with a written reason, because a detector needs somewhere to
record *"a human looked at this and it is fine."*

The tool needed three iterations to become trustworthy — which is itself the argument for
having it. Nobody was going to catch a hex code differing between two of six files by reading.

---

## 3. The port splits in two, and only one half is gated

Standing principle: **no further production build work until the blind grading session is
complete and a go/tune decision is made.** That gate is real and it should hold. But it does
not apply evenly.

| | Depends on the go/tune outcome? | Gated? |
|---|---|---|
| **The checker** (`naoshi-prototype.jsx`) | **Yes** — the decision may rewrite `SYSTEM_PROMPT`, the tier model, or the whole pipeline | **Yes.** Porting it now risks porting something that changes. |
| **The four learning modules** (kana ×2, kanji, grammar, vocabulary) | **No** — none of them calls the checker, none reads `SYSTEM_PROMPT`, none is affected by the eval result | **Only by the letter of the rule, not its reason.** |

The gate exists so that engineering effort is not spent on a pipeline that might be replaced.
That argument has no force over the kana modules. **Worth deciding deliberately rather than
inheriting.**

Two things push the other way, and they are not trivial:

- **Reviewer time is the scarcest input**, and a port consumes none of it. So does waiting.
- **Every session adds to the porting surface.** The vocabulary module added ~1,350 lines this
  session. The cost of waiting is real but it is linear, not compounding, and the modules are
  well-factored.

---

## 4. DECIDED — Lloyd, Session 9

> **Hold off on the evaluation side, because it still requires running the checker engine. As
> soon as no other grading checks need to run, run the bake-off, then build it all the way out.**

The sequence, in order:

1. **Finish the outstanding grading checks.** Step 2 answer-key verification (in progress) and
   the Step 3 blind grading session. Both run *through the published artifact* — that is the
   delivery vehicle the reviewer is using.
2. **Run the bake-off.** Needs API credits and the standalone harness, because the artifact
   proxy pins the model and cannot run it.
3. **Then build it all the way out.**

**The reason to hold is operational, not architectural, and that is a sharper trigger than the
one this document originally proposed.** The earlier framing was "wait for go/tune, because the
decision may reshape the checker." True, but secondary. The real constraint is that **the
reviewer is grading through the artifact right now**, and porting mid-eval would move the thing
being graded out from under the person grading it. Reviewer time is the scarcest input in the
project; disrupting a session in flight costs more than any amount of duplication.

### What this means for the interim

- **The scaffolding stays, and keeps costing.** `build-shared-stroke-engine.py` and
  `check-module-drift.py` — ~355 lines — exist only because artifacts cannot import, and die at
  the port. That is accepted, not overlooked.
- **The drift check is what makes the interim safe.** It is now wired into the weekly audit. As
  long as it exits zero, hand-maintained duplication is costing disk space and nothing else.
- **Escalate early if it fires on anything behavioural** — a scoring function, a storage key, a
  progress shape. A colour was embarrassing; two modules sharing the `stroke-data-v1`
  calibration key while scoring differently would be a bug in a learner's face, and would be
  worth interrupting the sequence for.

### One sub-question left open

Three modules — `hiragana-module.jsx`, `katakana-module.jsx`, `vocabulary-module.jsx` — make
**zero API calls**. They need static hosting, no backend, no key, no credits, ever. That is
~409 KB of the ~695 KB. They are not part of the eval and porting them would not touch anything
the reviewer is using.

Whether they move early or wait for the single build-out is undecided, and it is genuinely a
preference call: moving early cuts the duplication surface sooner; waiting keeps one port
instead of two. Recorded rather than resolved.

---

## 4a. Superseded recommendation (kept for the record)

*The three cheap things below were proposed before the decision above and have all since been
done: the contrast fix is propagated, the drift check is in the weekly audit, and the engine is
generated into all four modules that carry it rather than one.*

**Do not port yet. Do three cheap things instead.**

1. **Fix the `note` colour** in the four modules still carrying `#B08A1F`. It is a live
   accessibility defect, it is four one-line edits, and it does not need the reviewer.
2. **Add `check-module-drift.py` to the weekly audit.** The audit already runs Saturdays and
   already reports rather than acts. This is exactly its shape, and it converts "when should we
   stitch" from a judgement call anyone can forget into an alarm.
3. **Extend the generated-not-copied pattern.** The vocabulary module's engine is generated and
   therefore cannot drift; the kana and kanji copies are hand-maintained and can.
   `build-shared-stroke-engine.py` already does the hard part — pointing it at the kana modules
   too would take one of four solved to four of four, and would have prevented the colour drift
   if tokens were included.

**Then port when the go/tune decision lands**, which is the moment the checker stops being a
moving target. At that point the four learning modules and the checker port together, and the
duplication collapses into imports.

**Revisit early if** the drift check fires on anything behavioural rather than cosmetic — a
scoring function, a storage key, a progress shape. Colour is embarrassing; a scoring function
diverging silently between two modules that share a calibration key would be a real bug in a
learner's face.

---

## 5. What porting actually collapses

For scoping when the time comes:

- ~85 KB of duplication becomes ~0
- 5 build scripts become 1 or 2 (the ledger and the notes stay; the engine and data splicers die)
- `window.storage` becomes a real store, and the `window.storage` shim in
  `build-standalone-html.py` stops being necessary
- The 4 shared storage keys become a schema, and the "rename a key, orphan a learner" hazard
  becomes a migration rather than a landmine
- The artifact-environment quirks in `CLAUDE.md` — pinned model, blocked clipboard, sign-in
  requirement for AI artifacts — all stop applying

That last one matters more than the code: **the model pinning means no impression of output
quality formed inside an artifact is an impression of the model named in the code.** Porting is
what makes the checker's behaviour measurable, which is the same reason the bake-off needs a
standalone harness.
