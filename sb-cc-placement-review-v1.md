# Where the skill builders and culture connections should go

*Session 17, after Stage 10 landed. Lloyd: "double back and review for places to put SB and
CC lessons." Measured from the module, not from the specs. Nothing authored — this is the
placement decision, for ruling.*

## The finding, in one line

**The course becomes culture-free exactly where a learner starts living in the language.**

Culture connections by stage, counting the whole module:

| stage | teaching points | CC lessons |
|---|---|---|
| S1 First sentences | 23 | 2 |
| S2 Verbs arrive | 31 | 3 |
| S3 Asking and wanting | 22 | 3 |
| S4 Describing the world | 36 | 3 |
| S5 Conversation | 22 | **7** |
| S6 Plans, time and voice | 25 | 1 |
| S7 Nuance and other minds | 13 | 1 |
| S8 Politeness | 12 | **11** |
| **S9 Independence** | 36 | **0** |
| **S10 Saying it precisely** | 63 | **2** |

S9 has **none**. S10 has the two gathering lessons I just wrote and nothing else. Between
them that is **99 teaching points across sixteen steps with two culture stops**, against
seven in a 22-point stage earlier on.

Skill builders are fine — every step has one, and the S9/S10 pattern of exactly one
per step is deliberate and works.

## Why it happened, which matters for whether to fix it

It is not an oversight in the ordinary sense. S9 and S10 were both authored in a single
session each, against a **grammar inventory** — a list of patterns to close a level. A
grammar list has no culture in it, so nothing in the source material ever prompted a
culture lesson, and the steps came out shaped like the list rather than like the earlier
stages.

The earlier stages were authored from situations and pain points, which is why cc-konbini,
cc-aizuchi, cc-honne and cc-baito exist. **The instrument shaped the output, and nobody
chose the shape.** That is the same failure as the preview reporting 180 lessons: a
process producing a confident, coherent result that answers a different question than the
one being asked.

## The argument for fixing it rather than accepting it

A learner who reaches Stage 9 has been in the country a while. This is precisely where
culture lessons stop being decoration and start being the reason the grammar matters —
わけではない is a social instrument before it is a pattern, and 一方で is how a Japanese
argument is conducted rather than a connector to memorise.

There is also a shape argument: Stage 8 is 11 culture lessons out of 26, and going from
that straight into 36 points of pure grammar is a cliff.

## Recommended placements — S9 and S10 first

Seven lessons close the worst of it. Each is a real room or a real practice, not a topic:

| step | proposed | what it is |
|---|---|---|
| **30** compound particles | `cc-keiji` | The noticeboard — 掲示板, ward newsletters, the wall of a station. Where every compound particle a learner has just met is actually printed, and the first place they are readable. |
| **31** conclusions | `cc-aimai` | Disagreeing without disagreeing. わけではない, とは限らない and そうですね in the mouth of somebody who means no. The single most-requested thing foreign residents say they cannot read. |
| **32** verbs that carry more | `cc-manga` | Compound verbs in the wild — 見かける, やりかける, 立ち止まる. Manga, signage and casual speech are made of them, and this is the stage a learner can start reading for pleasure. |
| **34** manner and timing | `cc-aisatsu2` | The set phrases with grammar inside them: おかげさまで, お疲れさま, 失礼します at four different doors. Retro-fits phrases already met with the structure now visible. |
| **36** sources and proportions | `cc-news` | Reading a news headline. Where によると, に比べて and につれて all appear inside forty characters, and where a learner discovers headlines drop the verb entirely. |
| **38** no choice, and enough | `cc-taberu` | 仕方がない — the phrase, the attitude, and whether the received wisdom about it is fair. Handled like cc-baito: the contested reading stated as contested, not resolved. |
| **42** occasions | `cc-nengajou` | The calendar year in obligations — 年賀状, お中元, お歳暮, 忘年会. Deadlines a resident is genuinely caught out by, and the register each one demands. |

That takes S9 from 0 → 4 and S10 from 2 → 5, and leaves both stages still lighter on culture
than S5 or S8, which is right for their subject.

## Earlier stages — smaller, and only two are real

The audit flags nine earlier gaps. Most are false alarms: Step 12 is a two-point bridge,
Step 8 is short by design. Two are worth acting on:

- **Step 7 · Linking actions & time** — 8 teaching points, **no SB and no CC**, the only
  step in Stage 1–4 with neither. A skill builder separating てから / あとで / まえに is the
  obvious missing piece, and cc-sb-candidates-v1.md has been carrying it as item 3 since
  Session 13 under Lloyd's hold.
- **Step 9 · Adjectives & adverbs** — 9 teaching points and no skill builder, the largest
  builder-free step in the course. い/な adjective conjugation is where N5 learners
  actually break.

The rest — Steps 2, 10, 17, 18, 19 — are worth one CC between them at most, and Step 19
(time's edges) is the best candidate if only one gets written.

### ✅ BOTH BUILT — same session

`sb-junjo` (Step 7) and `sb-keiyoushi` (Step 9), authored with DEEP walkthroughs, wrinkles
and drills to match their neighbours rather than to the arcs-only standard Stages 9 and 10
shipped in. Source `early-builders-v1.json`; reviewer scoping is **Batch P**. `rc2` and
`rc3` covers extended so the checkpoints still match their steps.

⚠️ **Step 7's builder closes `cc-sb-candidates-v1.md` item 3, and the scope changed in the
making.** The flag had asked since Session 13 for a 行くとき／行ったとき tense drill. Reading
the live lesson first showed that `toki`'s own `watch` beat already teaches that relativity,
with both example sentences present — a builder repeating it would have duplicated shipped
work. The actual gap was wider: five ways to relate two actions in time and nothing sorting
them. `sb-junjo` sorts the five and points at the とき rule as the sharpest edge in the set.
Recorded on the flag itself so the change of scope is not lost.

Step 2, 10, 17, 18 and 19 remain open.

## ✅ BUILT — all seven, same session

Lloyd ruled them in and they are authored, spliced and arced: `cc-aimai` (31),
`cc-keiji` (30), `cc-manga` (32), `cc-aisatsu2` (34), `cc-news` (36), `cc-shikata` (38),
`cc-nengajou` (42). Source `stage-9-10-culture-v1.json`; arcs in `lesson-arcs-v1.json`;
reviewer scoping in `reviewer-content-batches-v1.md` as **Batch O**.

Two carry sourced facts rather than general description — `cc-keiji` cites the Tokyo
metropolitan subsidy for 電子回覧板, and `cc-nengajou` cites Japan Post's 2026 print run
(≈748 million, −30.1% year on year, fifteenth consecutive decline, against a 2004 peak
near 4.46 billion). Both sets of citations live in the arcs file beside the claims.

**S9 goes 0 → 4 culture lessons; S10 goes 2 → 5.** Both stages remain lighter on culture
than S5 or S8, which is right for their subject.

The earlier-stage items below are NOT built and remain open.

## Open for Lloyd

1. **Seven CCs for S9/S10, or fewer?** Seven is the number that makes the stages match the
   rest of the course. Four (`cc-aimai`, `cc-news`, `cc-nengajou`, `cc-keiji`) would fix
   the cliff without a full authoring session.
2. **`cc-aimai` is the highest-value lesson in the list and the highest-risk.** It makes
   claims about how Japanese people decline things. It needs the reviewer more than any
   lesson outside the keigo stage.
3. **Step 7's skill builder has been on hold since Session 13** pending your call on
   whether the とき scene made it unnecessary. This is the natural moment to close that.
4. Reviewer batch for any of these would be **O**, and it should go after N.
