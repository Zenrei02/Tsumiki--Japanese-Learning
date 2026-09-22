# Stage 10 · The last N3 mile — skeleton v1

*Session 17. Lloyd asked whether Stage 9 finishes N3. It does not, and the gap is bigger
than the question assumed. This is the plan that closes it.*

## The finding

Stage 9 closed the **structural** N3 gap — わけ, the compound particles, the stance
patterns, the argumentative machinery. That was the right thing to close first and it is
genuinely done. It is not the same as finishing N3.

Audited against a full community N3 list (131 entries,
`jlptgrammarlist.neocities.org`, saved as `n3-list-jlptgrammarlist.json`; JLPT Sensei
counts 182 by splitting senses):

| | count |
|---|---|
| **Taught** — the pattern owns a lesson title | **38** |
| Mentioned in teaching text but never taught | 9 |
| **Absent entirely** | **84** (≈72 distinct after de-duplicating multi-sense rows) |

Audit script output in `n3-audit.json`. Two methodological notes, because the first two
passes were both wrong in opposite directions:

- **A raw substring search over the module gives false POSITIVES.** 合う "matched" on a
  single incidental occurrence; 結果 matched a vocabulary bank entry; 中 matched because it
  is a common kanji. A pattern only counts as taught if it appears in a lesson **title** —
  an example sentence is not instruction.
- **And naive normalisation gives false NEGATIVES.** The list writes ぎみ where the module
  titles 〜気味; entries carry trailing sense numbers (`間 / 間に 1`) that break a match; and
  `ば○○ほど` failed a minimum-length guard while `bahodo` teaches exactly it. Both directions
  were caught by printing the matched lesson id next to every hit and reading the list.

## Lloyd's two rulings

1. **Patterns get lessons; the adverb tier gets a gathering lesson.** A large share of any
   community N3 list is adverbs and discourse markers — ふと, 一体, 結局, どうしても, おそらく,
   めったに, 確かに, なるべく. They are on the test and they are not grammar. They go into
   culture-connection lessons that show them working, rather than a drill each.
2. **Author tonight**, skeleton first.

## Theme

Stage 9 was *stance toward a fact*. Stage 10 is **precision, and writing for a reader**.

> Stage 4 finished the sentences. Stage 7 finished the conversation. Stage 9 taught you to
> argue. **Stage 10 is where you stop being understood and start being exact** — saying on
> whose authority, in what proportion, to what extent, and how sure.

It is also the stage where the language tips from spoken to **written**: によると, に関して,
につれて, と共に, をはじめ and 一方で are what a newspaper, a notice and a report are made of.
That is the honest reason a learner needs them, and it is not "because they are on N3".

## The nine steps

| step | theme | teaching points |
|---|---|---|
| **35** | Naming and rephrasing | `toiukoto`, `toiuto`, `toiunowa`, `toiuyori`, `toittemo`, `sb-toiu2` |
| **36** | Sources and proportions | `niyoruto`, `nikanshite`, `nikurabete`, `nitsurete`, `nikakete`, `tomoni`, `sb-hikaku` |
| **37** | Audience and coverage | `wohajime`, `wochuushin`, `nikawatte`, `mukimuke`, `chuujuu`, `tochuu`, `sb-hanni` |
| **38** | No choice, and enough | `shikanai`, `baii`, `sae`, `kotoda`, `kotohanai`, `naikotohanai`, `temokamawanai`, `sb-sentaku` |
| **39** | Denying the inference | `wakeganai`, `wakeniwaikanai`, `towakagiranai`, `soumonai`, `sb-hitei` |
| **40** | Regret, hope, and the unreal | `bayokatta`, `taraii`, `toshitara`, `zuniwairarenai`, `younakigasuru`, `marude`, `sb-katei` |
| **41** | Quality, quantity, limit | `darake`, `ppoi`, `gatai`, `kirenai`, `kiri`, `ippouda`, `sb-teido2` |
| **42** | Occasions and consequences | `uchini`, `tabini`, `tsuideni`, `tehajimete`, `kekka`, `tameni`, `sb-toki2` |
| **43** | The connectors | `tsumari`, `tokoroga`, `ippoude`, `nazenara`, `nishiteha`, `nishitemo`, `kawarini`, `sb-setsuzoku` |
| **CP 9** | Stage review + the real N3 milestone | `rc9`, `ms-n3` |

Roughly **55 teaching points**, plus skill builders, culture connections and one
composition per step — around 75 lesson objects, which makes Stage 10 the largest stage in
the course. That is correct: it is the whole remaining tail of a level.

## ⚠️ The milestone has to move, and this is not cosmetic

`ms-n3` currently sits at the end of **Stage 9** and tells the learner they have covered
everything the N3 syllabus expects. **That is false, and it has been false since it
shipped.** It moves to Checkpoint 9. Stage 9's checkpoint keeps `rc8` and closes on what
Stage 9 actually did — the argument layer — without claiming the level.

This is the milestone lessons' whole design working as intended: a claim about capability
is falsifiable, so it can be caught being wrong. A stage label could not have been.

## Stage numbering

Adding a real Stage 10 pushes the two locked placeholders down: today's `S10` (N2) becomes
`S11`, today's `S11` (N1) becomes `S12`. Same one-line change as the Session 17 re-stage —
`LEVELS` plus a `level` field per step. No step numbers move and no lesson ids change.

## The adverb tier — what goes in the gathering lessons

Not drilled individually. Two culture connections in Step 43:

- **`cc-fukushi`** — the hedging and softening drawer: おそらく, もしかしたら, 確かに,
  めったに, なるべく, ふと, 別に〜ない, 決して〜ない. Shown as a register dial across one
  scene rather than eight definitions.
- **`cc-kaiwa`** — the spoken glue: だけど, なんか, なんて, っけ, てごらん, たとえば, つまり's
  casual life. This is where a learner finds out that the connectors they meet in speech
  are not the ones they meet in print.

## Register and shape — carried unchanged

Everything in `lesson-arc-design-v1.md` applies: situation → line → flip → wrinkles, one
page each. Required-not-observed situations. Japanese at or below the step's own level,
kanji outside `KANJI_DICT` flagged.

**Arcs yes, DEEP not yet** — the same accepted state Stage 9 shipped in. Every teaching
point gets a situation and extensions; `seg`/`wr`/`drill` come in a later pass so the stage
can land whole rather than a third of it landing deep.

## Reviewer

Batch **N**. Lower risk than the keigo batches — grammar rather than claims about rooms —
but three items want a native eye:

1. **`toiunowa`** carries three distinct senses (means / because / in particular) and most
   English explanations collapse them.
2. **`nishiteha` vs `nishitemo`** are one kana apart and mean different things.
3. **`marude`** almost always wants ような/みたいな with it, and a learner who meets it bare
   will produce something that parses and sounds wrong.
