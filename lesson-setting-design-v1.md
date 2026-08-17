# Lesson settings — design v1

*Session 17, third pass. **Supersedes the structure of `mca-design-v1.md` and
`scene-design-v1.md`**, both written earlier the same day. Neither has been moved to
`OLD/` yet — that waits until Lloyd has seen a worked lesson and confirmed the shape.*

## What changed, and why

The first two passes built two optional things hanging off lessons. Lloyd named the
problem in one sentence: he had asked for anecdotes, and got **informative moments rather
than part of the lesson.**

`mca-design-v1.md` admits it in writing — *"no slot in the syllabus, no quiz, no
completion state, and the learner can go the whole course without opening one."* That is
a well-sourced footnote, not a lesson. And the scenes stopped half way: I placed them
between `when` and `watch`, illustrating a point already explained three times over, and
recorded a decision to **reject** situation-first without asking. That call was the thing
under Lloyd's question.

Two decisions, both his:

1. **The situation is the spine.** The lesson opens on it.
2. **One artifact, not two.** The daily-life fact *is* the setting the grammar happens in.

## The new block order

```
setting   →   line   →   what   →   build   →   when   →   watch
```

Only the setting moves. Everything in the four-beat keeps its order and its wording, so
this is an insertion at the top rather than a rewrite of 200 explanations.

The learner meets a moment, sees the sentence that moment demands, and *then* gets told
how it works. The grammar arrives as the answer to a question they already have.

**Open, and deliberately not decided here: does `when` still earn its place?** It lists
situation *types* — the abstract version of what the setting now shows concretely. My
instinct is that it survives where it names situations the setting does not reach, and
becomes redundant where it doesn't. That is an editorial pass over every point that gets
a setting, it is reversible, and it is not mine to decide unasked — which is exactly the
mistake this document exists to correct.

## The principle that makes the merge work

**A fact has no single grammar point. The pattern you choose is a claim about how the
fact feels.**

This surfaced while mapping and it is the difference between a merged lesson and a fact
in a costume. Take *dogs must be vaccinated against rabies every year*:

| pattern | what the sentence claims |
|---|---|
| 毎年しなければなりません | the law, stated |
| 毎年しています | what owners do — a description, not a rule |
| しないといけないよ | what a neighbour tells you over a fence |
| ことになっています | it has been decided, by someone else, somewhere |

All four are true of the same fact. Only the first is what a mapping reaches for
automatically, and it is usually the least interesting of the four.

The consequence for authoring: **choose the pattern from how a person would actually say
it in that moment**, then check the point is at or below the learner's step. Do not start
from the point and hunt for a fact.

The clearest case in the first four worked lessons is `ls-teikutekuru`. "Bring your
medicine booklet every time" looks like an obligation fact and maps mechanically to
なければなりません. What a pharmacist actually says is 持ってきてください — the sentence is
about carrying something *toward* the speaker, not about duty at all.

## Density, and the finding that forced this section

Cap stays at **2 settings per step**. Applying it to the mapped 59 items produced a
finding worth keeping:

**Step 5 attracted ten of them.** Nine anecdotes landed on obligation grammar — register
within 14 days, vaccinate the dog, prove you have parking, get a seal, sort the rubbish,
don't smoke indoors. That is not a mapping accident. Facts about *moving to a country*
are overwhelmingly rules, and rules produce one sentence shape.

Applying the principle above spreads some of them (Cool Biz moved to 〜ても; the seal
reform to 〜ことになる). The rest are **parked, not forced** — see
`lesson-settings-map-v1.md`. A lesson that exists to house a fact is the failure mode this
whole redesign is trying to get away from.

## What carries over unchanged

From `mca-design-v1.md`, all of it, and it is the part worth protecting:

- **Numbers carry a year.** "42.8% in 2024", not "not very much".
- **"Often / traditionally / many" earns a source or gets cut.**
- **No claims about what Japanese people think or feel** — only what exists, what the
  rule is, what you will see.
- **Where the received version abroad is wrong, say so** (the cc-baito precedent).
- Every setting keeps `claims[]`, `sources[]` and `flags[]`, none of which render. The
  reviewer's unit is the claim list, not the prose.

From `scene-design-v1.md`:

- `contrast.kind` is `alt` / `misfit` / `error`, mirroring the app's own tiers. An `error`
  contrast must render marked as wrong and is banned in Steps 0–2.
- Each item names its own `pattern` fragment, verified by the checker.
- Japanese stays at or below the point's own step; kanji outside `KANJI_DICT` is reported
  so the furigana decision is explicit.

## Shape of one lesson

```
setting    45–80 words. The situation, carrying the verified fact. Ends AT the moment
           the sentence is needed — it does not explain the grammar and it does not
           name the pattern.
line       the Japanese, with a gloss.
contrast   optional, labelled alt / misfit / error.
turn       25–55 words. Why English can't carry it, or what the fact explains.
```

The setting is doing two jobs the old primitives split: it is the anecdote (a true,
sourced thing about Japan) *and* the scene (the moment that demands the sentence). Where
those two pulled apart during authoring, the situation wins and the fact gets trimmed to
what the moment can carry — the rest lives in `claims[]` for the reviewer.

## Surfaces

The setting belongs to the **lesson**. It renders in the grammar module at the top of the
point.

The vocabulary module loses its copy. Word cards keep what/build/when/watch, and a word
that appears in a setting can link to the lesson rather than duplicating it — the same
fact told twice in two voices was one of the things the merge was meant to remove.

## Reviewer

Batches J (facts) and K (Japanese) collapse into **one batch per lesson**, which is the
real win: the reviewer sees the fact and the sentence together and can answer the only
question that spans them — *would a person in this situation say this?*

Three questions per lesson: are the claims true; is the line natural **for this
situation**; and is the pattern the one a Japanese speaker would actually reach for here,
rather than the one the syllabus needed.
