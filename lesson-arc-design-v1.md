# Lesson arcs — framework v1

*Session 17, fourth pass. The structure Lloyd specified: the situation opens the lesson,
the `when` becomes an **extension** of that same situation, and every wrinkle extends it
again onto its own page. Supersedes the page model in `lesson-setting-design-v1.md`;
that document's register and accuracy rules stand unchanged.*

## The instruction

> Take the situation and extend it. So the visa thing says they need to hang onto it —
> extend it by having it be said from the user's side with a different item, like asking
> someone to keep their spare apartment key. This also allows the learner to experience
> any wrinkles, by extending the situation into the "when". Then each additional wrinkle
> triggers another "when". Also, the grammar pieces should be done in small bits per
> page.

Three things, and they fit together into one shape.

## What already exists — read this before building anything

**The pager is already built.** `Walkthrough` (Session 14, `grammar-module.jsx` ~line
3679) renders a lesson as pages with dot navigation and Back/Next, and its own comment
says *"Paged, not scrolled — same mobile-first call as the kana Learn pager (Session
13)."* Current sequence:

```
idea  →  apart  →  again  →  watch  →  try
```

**Wrinkles already exist as data.** `DEEP[id].wr` is an array of `{t, jp, en, hl}`.
**133 points carry one; 83 of those are in Stage 1.** They currently all render stacked
on the single `watch` page.

So this is not a new system. It is three changes to a live one:

1. a new **`setting`** page at the front
2. the `when` beat rewritten as the **first extension** of that setting
3. the `watch` page **split into one page per wrinkle**, each carrying its own scene

## The new page sequence

```
setting → idea → apart → again → ext₁ → ext₂ → … → watch → try
```

`setting` opens on the situation. `idea`/`apart`/`again` are unchanged. Each extension is
its own page. `watch` keeps whatever `exp.watch` prose does not belong to a specific
wrinkle. `try` is unchanged.

A lesson with two wrinkles is eight pages of a few sentences each, which is the point —
the swiping is the pacing.

## The extension model

An extension is **the same situation, moved on**. Not a new scenario and not an abstract
list of uses.

The move that makes it work is Lloyd's: **flip the role, change the object.** In the
setting the pattern is said *to* the learner about one thing; in the extension the learner
says it *themselves* about something else.

Worked example — `teikutekuru`, Step 13:

| page | what happens |
|---|---|
| setting | The clerk hands over the residence card: **カードを持っていってください** — take it with you, every day, or it's a ¥200,000 fine. |
| ext₁ | Six weeks later you leave a spare key with the neighbour who signed for your parcels: **鍵を持っていてください**. Same grammar, your mouth, your object, and now you are the one asking. |
| ext₂ | She asks whether to bring it back on Saturday or keep hold of it — and the answer needs 持ってくる, because the direction has reversed. |

Each extension does exactly one job:

- **ext₁ — the flip.** Learner's side, different object. This is the replacement for
  `when`: it answers "when would I use this" by showing the learner using it.
- **ext₂ onward — the wrinkles.** Each existing `wr` entry becomes an extension: the
  situation develops a complication, and the complication is what the wrinkle teaches.

**A wrinkle must be caused by the situation, not announced beside it.** The clerk asking
whether to keep the key or return it is a wrinkle the story produced. "Note that 〜てくる
also means…" is a footnote with a page to itself.

## Schema

`lesson-arcs-v1.json`, one entry per teaching point:

```json
{
  "point": "teikutekuru",
  "step": "Step 13 · て-form, second wind",
  "setting": { "scene": "…45-80 words…", "jp": "…", "en": "…", "pattern": "持っていって" },
  "extensions": [
    { "wr": null, "kind": "flip",    "scene": "…30-60 words…", "jp": "…", "en": "…" },
    { "wr": 0,    "kind": "wrinkle", "scene": "…30-60 words…", "jp": "…", "en": "…" }
  ],
  "claims": [], "sources": [], "flags": [], "review": {"status": "unreviewed"}
}
```

**`wr` is an index into the module's own `DEEP[point].wr` array, not a copy of it.** The
wrinkle's teaching text (`t`) stays in the module where it already lives; the arc supplies
only the scene that carries it. This is deliberate — the folder has been burned twice by
side files that duplicated module content and then drifted from it, and the standing rule
is *read the modules, not the specs*.

`wr: null` means the extension has no module wrinkle behind it — the flip always does, and
so does any extension authored where the module has no `wr` entry (`kind: "extra"`, which
also needs a `t` of its own).

`check-arcs.py` verifies every index resolves against the real module.

## Length

| field | words | why |
|---|---|---|
| `setting.scene` | 45–80 | a page you can read before the train doors close |
| `extension.scene` | 30–60 | shorter — the situation is already established |
| existing `wr.t` | unchanged | it is the module's, not ours |

## Rules carried forward unchanged

From `lesson-setting-design-v1.md`, all of it:

- **Required, not merely observed.** The visa, the card, the ward office, the deadline.
  A learner's first months are errands with deadlines, not pleasant observations.
- **Numbers carry a year; "often/traditionally" earns a source or gets cut; no claims
  about what Japanese people think or feel.**
- **Where the received version abroad is wrong, say so.**
- `claims[]` / `sources[]` / `flags[]` never render and are the reviewer's unit.
- Contrast tiers `alt` / `misfit` / `error`; no `error` contrast in Steps 0–2.
- Japanese stays at or below the point's own step.

## The one place this can go wrong

A situation that runs across eight pages will drift into a short story, and a short story
about a residence card is not a grammar lesson. Two guards:

- **Every extension must contain a sentence the learner could now produce.** If a page has
  no Japanese in it, it is narration and should be cut.
- **The situation is a spine, not a plot.** No characters with names and arcs, no
  suspense, no payoff. The neighbour exists to receive a key; she does not need a
  personality.

The test for a finished lesson: read only the Japanese lines in order and ask whether they
are a set of sentences worth owning. If they are, the prose earned its place. If the
Japanese is thin and the prose is doing the work, the lesson is a story with grammar in it.

## Which lessons get `seg`, and which should not

26 of Stage 1's 112 points have no `DEEP.seg`, so the `apart` page has nothing to show.
Asked whether `seg` could simply be authored for them, the answer is **only for about a
third, and forcing the rest would damage them.**

`seg` dissects **one sentence** into per-token cards with `THE POINT` marked. That is the
right instrument when the lesson lives *inside* a single sentence, and the wrong one when
the lesson **is a comparison between sentences**.

**Worth authoring (8)** — one sentence, and taking it apart is the teaching:

`sb-nounmod` (離婚した人は… — the clause sitting in front of the noun with no joiner is
visible only in the parts) · `sb-no` (私の日本語の先生の本です — a chain that unwinds from
the right) · `sb-slots` (昨日、図書館で本を読みました — time, place, object, verb, which is
literally a segmentation) · `sb-kanaparticles` (私は学校へ行きます — per-token gloss is the
only way to show which kana is a particle) · `sb-omou` · `sb-pronouns2` · `sb-nide2` ·
`sb-suruverbs`

**Would be misrepresented (13)** — the lesson is the contrast, and dissecting one of the
sentences hides the system: `sb-yone` (ね/よ/よね, three settings of one sentence) ·
`sb-negq` (the はい/いいえ pair) · `sb-waga` and `sb-waga2` (the が→は handoff *between*
two sentences) · `sb-nide` · `sb-transitive` · `sb-transitive2` · `sb-kosoado` ·
`sb-counters` (a sound shift across いっぽん・にほん・さんぼん) · `sb-verbtypes` (a
transformation, not a sentence) · `sb-register` · `sb-future` (the point is an absent
form) · `sb-orthography` (script choice, not structure)

**Nothing to dissect (5)** — no example sentences at all: `prim-shape`, `prim-drop`,
`sb-must`, `sb-ganotwo`

These are not gaps. A contrastive lesson already has the right affordances: `again` shows
the remaining examples side by side, and the arc's extensions carry the comparison a page
at a time. `sb-pronouns` is the clearest case — its example is *昨日映画を見ました。とても
面白かったです。* and the entire point is that no 私 appears anywhere. There is nothing to
put a card around.

**⚠️ Do not author `seg` to make an arc render.** Twenty-six arcs are currently invisible
because the Learn tab gates `Walkthrough` on `deep.seg` — that is a three-line renderer
fix (`HANDOVER-lesson-arcs-buildout.md`), and reaching for content work to route around it
would both cost days and wreck half the lessons it touched.

## Scope of this pass

Stage 1 is **112 teaching points** across Steps 0–12, with **83 existing wrinkles**.
`cc-*` lessons are already situations and `b-*`/`rc*` are compositions, so neither takes an
arc.

Authored in this pass: see `lesson-arcs-v1.json` — the file states its own coverage, and
`check-arcs.py` reports which points in a started step still have none.

## Handover

The rendering change is a Claude Code job, specified in
`HANDOVER-lesson-arcs-preview.md`: local preview only, no Netlify deploy until Lloyd has
seen it.
