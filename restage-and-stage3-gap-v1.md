# Re-staging, and what Stage 3 is actually missing

*Session 17. Two questions Lloyd asked together, and they turn out to be coupled in the
opposite direction to the one he assumed. Diagnosis and proposal; nothing built.*

## 1. Is Stage 3 finished? No — and the module already says so

**Stage 3 is 20 lessons. Stage 1 is 143 and Stage 2 is 83.** It is not a stage, it is an
appendix, and the app admits it in its own copy — `LEVELS[2].tagline` reads:

> *"It opens with keigo — hearing it, lowering yourself, building politeness you can send.
> **The rest of Independence is on its way.**"*

That sentence was written in Session 15 and has been true ever since.

### The gap, measured

Probing 42 common N3 patterns against the whole module — titles, explanations, wrinkles,
drills — **30 are entirely absent**:

| group | missing |
|---|---|
| **cause & blame** | 〜おかげで, 〜せいで, 〜ばかりに |
| **compound particles** | 〜について, 〜に対して, 〜によって, 〜において, 〜にとって, 〜に関して |
| **conclusion & obligation** | 〜わけだ / 〜わけではない, 〜べき, 〜に違いない |
| **aspect verbs** | 〜かける, 〜ぬく, 〜はじめる, 〜おわる, 〜っぱなし |
| **tendency & degree** | 〜がち, 〜気味, 〜わりに, 〜ば〜ほど, 〜どころか |
| **manner & state** | 〜とおり, 〜ふりをする, 〜ながらも, 〜くせに |
| **time** | 〜たとたん, 〜最中に, 〜次第 |

That is roughly **50–70 lessons** to author — the size of Stage 2, which was most of a
working session on its own. Stage 3 is not a finishing job; it is another build.

## 2. The finding that reverses the order of work

**Stages are already explicit, and they are cheap to change.** `LEVELS` (module ~line
3214) is a real structure, and each stage selects its steps by the `level` field on the
step block:

```js
{ id: "S1", subtitle: "Foundations",      jlpt: "≈ JLPT N5", groups: CURRICULUM.filter(c => !c.level) },
{ id: "S2", subtitle: "Everyday fluency", jlpt: "≈ JLPT N4", groups: …c.level === "N4" },
{ id: "S3", subtitle: "Independence",     jlpt: "≈ JLPT N3", groups: …c.level === "N3" },
{ id: "S4", subtitle: "Nuance",           jlpt: "≈ JLPT N2", locked: true },
{ id: "S5", subtitle: "Mastery",          jlpt: "≈ JLPT N1", locked: true },
```

Three consequences:

**Re-staging needs no renumbering.** It is a `level` value per step plus a rewritten
`LEVELS` array. Nothing like the Step 26 → 27 renumber, which touched six files.

**Stage currently *equals* JLPT level, exactly.** Which is why Stage 1 is 143 lessons: N5
is simply a big level, and the architecture inherited that shape wholesale.

**And that contradicts a decision already on the record.** The project's own line is
*"Stages 1–5, JLPT shown as reference only, not identity."* The implementation made stage
and JLPT the same thing. Lloyd's instinct — 6 or 7 stages, *"even if it doesn't adhere
directly to the JLPT levels"* — is not a new direction. It is the original decision,
reasserted against a drift.

### So the work should be sequenced the other way round

Lloyd's assumption was *"with Stage 3 finished, we should have a good idea of how to split
things up."* But the seams are **already visible** — the checkpoints mark them — and the
N3 inventory above is knowable from a grammar list without authoring a word.

Meanwhile the split decides **which container the 50–70 new lessons land in.** Authoring
Stage 3 first means writing them into a boundary that is about to be redrawn.

**Recommendation: split first. It is an afternoon. The authoring is a session.**

## 3. The proposed split — the seams already exist

Every boundary below is an **existing checkpoint**. Nothing moves; only the `level` field
and the `LEVELS` array change.

| # | stage | steps | lessons | milestone |
|---|---|---|---|---|
| 1 | **First sentences** | 0–2 | 27 | — |
| 2 | **Verbs arrive** | 3–4 + Ckpt 1 | 42 | — |
| 3 | **Asking and wanting** | 5–7 + Ckpt 2 | 30 | — |
| 4 | **Describing the world** | 8–12 + Ckpt 3 | 46 | ✅ **N5 covered** |
| 5 | **Conversation** | 13–16 + Ckpt 4 | 34 | — |
| 6 | **Plans, time and voice** | 17–20 + Ckpt 5 | 31 | — |
| 7 | **Nuance and other minds** | 21–23 + Ckpt 6 | 18 | ✅ **N4 covered** |
| 8 | **Politeness** | 24–27 + Ckpt 7 | 20 | — |
| 9 | **Independence** *(to build)* | new | ~60 | ✅ **N3 covered** |

Sizes run 18–46 against today's 143 / 83 / 20. **Stage 1 stops being a mountain**: a
learner's first stage is 27 lessons and contains no verbs at all, which is a real, honest
boundary rather than an arbitrary cut.

**If seven is wanted rather than nine:** merge 6 into 5 (Steps 13–20, 65) and 8 into 9
(politeness opens Independence, as it already does). That gives 7 stages of 27 / 42 / 30 /
46 / 65 / 18 / 80. Less even, fewer choices on the picker.

**Recommendation: nine.** The picker already handles five cards with two locked, so more
cards is not new UI, and evenness is the whole point of the exercise.

### The JLPT milestone lesson — Lloyd's idea, and it fits exactly

*"A special lesson that reviews content and then says: you've covered everything that is
expected to be in the Nx test."*

This is what makes decoupling safe. Once stage ≠ JLPT level, a learner loses the thing the
old architecture gave them for free — knowing where they stand against the test. The
milestone lesson hands it back, and hands it back **better**, because it arrives as an
achievement rather than as a label on a locked door.

Three of them, at the end of Stages 4, 7 and 9. Proposed id `ms-n5` / `ms-n4` / `ms-n3`,
`kind: "review"`, sitting after the existing checkpoint so the checkpoint still does the
grammar review and the milestone does the framing.

And it is consistent with the standing rule against lesson counts: *"the kanji coverage
percentage is the one permitted number, because it states capability not workload."* A
milestone states capability. It says what you can now do, not how much is left.

## 4. What this does NOT change

- No step numbers move. No lesson ids change. No arcs break.
- `check-arcs.py` derives stages from step number and **will need updating** — it currently
  hardcodes 1–12 / 13–23 / 24+. That is the one piece of tooling this touches.
- The five-card picker becomes nine; `locked: true` still covers N2/N1.

## 5. Open for Lloyd

1. **Nine stages (recommended) or seven?**
2. **Stage names** — the ones above are placeholders picked to describe content rather than
   level. "Verbs arrive" and "Describing the world" are the two most likely to want changing.
3. **Milestone lessons at 4 / 7 / 9** — as their own lesson after the checkpoint, or folded
   into the checkpoint's own text?
4. Once ruled: the split lands in one commit, and Stage 3's ~60 lessons get authored into
   Stage 9 with the boundary already settled.
