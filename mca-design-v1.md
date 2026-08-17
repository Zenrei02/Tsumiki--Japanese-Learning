# Micro cultural anecdotes — design v1

*Session 17, Aug 17 2026. Design pass agreed in Session 16, plus the first authored
wave (`micro-anecdotes-v1.json`, 33 items). Nothing here has been reviewed by a
native reader.*

## What this primitive is

A short paragraph about life in Japan, attached to a **word the learner is already
meeting** in a lesson bank. Not a lesson. Not a step. It has no slot in the syllabus,
no quiz, no completion state, and the learner can go the whole course without opening
one.

**The brief that shaped the first wave** (Lloyd, Session 17): generalisations and
simple daily-life things, written from the point of view of someone moving to or
travelling in Japan — what they would *see or run into*, city and countryside both.
Historical elements preferred, because a dated fact can be checked and a stereotype
cannot.

That last clause is the whole design. Everything below is a way of making the
history-over-stereotype instinct hold under authoring pressure.

## Distinct from the two neighbours it could be confused with

| | scope | attaches to | length |
|---|---|---|---|
| `cc-*` Culture Connection | a whole step, in the syllabus, usage-focused | a lesson slot | 150–400 words |
| **`mca-*` micro anecdote** | a paragraph about the *place* | a word in a bank | 45–90 words |
| Japanese Language Trivia (tracker, P2) | niche background about the *language* | its own optional strand | n/a |

The boundary that matters: a `cc-` is about how Japanese is **used**; an `mca` is about
where the learner will be **standing**. If an anecdote is really about the language, it
belongs in a Skill Builder or the trivia strand instead.

## Shape

**Length: 45–90 words. Hard cap 110.** One paragraph, no headings, no bullets. The test
is that it can be read without losing the thread of the lesson it hangs off. Anything
longer is a `cc-` wearing a disguise.

**Voice: the module voice** — second person, concrete, no exclamation, no "fun fact",
no "did you know". The same register as the four-beat `exp` blocks and the `cc-`
lessons, so nothing announces itself as a different content type.

**Opens on the observable.** The first sentence names something the learner will see,
hear or be asked to do. The history goes *second*, as the reason the visible thing is
that way. Reversing this produces an encyclopedia entry.

## Placement and density

**Attaches to a word, never to a grammar explanation.** The `exp` four-beat stays about
grammar; an anecdote in it would dilute the one thing that block does well.

**Surfaces in two places, same text:**

1. **Grammar module** — inside the existing tap-to-expand word popup for a bank word,
   below the gloss, in the ochre note style (`T.note` / `T.noteBg`).
2. **Vocabulary module** — as a fifth block on the word card, below
   what / build / when / watch, visually separated because it is not a teaching note.

**Always present, never auto-opened, never dismissible.** The learner opens the word;
the anecdote is sitting under the gloss. No dismiss control, no read-state, no counts —
consistent with the project's standing rule against workload numbers. A dismiss button
implies a completion loop, and this is deliberately the one surface with no loop.

**Density: at most 2 per step, never 2 on one word.** The first wave averages 1.6 across
the 21 steps it touches. It must also not restate a `cc-` in the same step.

**Known load spots to re-check after the first render:** Step 3 and Step 13 carry two
`cc-` lessons *and* anecdotes. Nothing is duplicated, but they are the steps where the
culture surface is thickest and the place to look first if the module starts to feel
padded.

## What earns one

All five, or it does not get written:

1. **First-months visible.** The learner would encounter it within a few months of
   arriving — not on a special occasion, not as a tourist.
2. **It changes what you would do or notice.** A rubbish calendar changes behaviour;
   "Japan has four seasons" does not.
3. **It carries at least one checkable claim** — a date, a law, a number, a named
   institution — or it carries an explicit hedge in the text itself.
4. **It is not about the language.** That is a Skill Builder's job.
5. **It admits variation where variation is real** — city vs countryside, region,
   generation. Several of the strongest items in the first wave *are* the variation:
   the bus fare system, the tatami sizes, the shopping street.

## The accuracy rules

This is the failure mode the tracker row was opened around: an AI-authored cultural
claim that is confident, slightly wrong and quietly stereotyped, with **no automated
check that can catch it**. There is no `check-culture-drift.py` to write. So the
controls are all editorial and all in the authoring, not the review:

- **Numbers carry a year.** "50.9% in FY2022", not "about half".
- **"Often", "traditionally", "many" must be earned** by a source or cut. They are the
  standard cover for a claim nobody checked.
- **No claims about what Japanese people think, feel or value.** Claims are about what
  exists, what the rule is, and what you will see. This rules out the entire class of
  sentence that reads as insight and is actually a stereotype.
- **Where the received version abroad is wrong, say so.** This is the cc-baito
  precedent — it states outright that バイト敬語's "wrongness" is contested rather than
  passing on the received opinion. Three items in the first wave are built on this
  shape and they are the most valuable ones in it: the phone shutter sound is a carrier
  agreement and **not a law**; Japanese schools **do** employ caretakers alongside
  student cleaning; the 30% medical co-payment is **not** what universal coverage meant
  in 1961.
- **Every item carries `claims[]` and `sources[]`, neither of which renders.** The
  reviewer reads the claim list, not the prose, and can check five statements in the
  time it would take to re-research one paragraph. `flags[]` names anything the author
  could not source.

## Data shape

`micro-anecdotes-v1.json` — hand-authored, like `vocab-notes-v1.json`, and for the same
reason: never regenerate it. A build step merges it into both modules by anchor word.

```json
{
  "id": "mca-eki",
  "anchor": { "word": "駅", "step": "Step 2 · Core particles" },
  "surfaces": ["grammar-bank", "vocab-card"],
  "text": "…45–90 words…",
  "claims": ["one checkable statement per line"],
  "sources": ["https://…"],
  "flags": ["anything unsourced, named explicitly"],
  "tags": ["city", "countryside", "history", "admin", "transport"],
  "review": { "batch": "J", "status": "unreviewed" }
}
```

`words` count is computed and stored so the cap is machine-checkable — the one thing
here a script *can* police.

## Reviewer cost

33 items is a real addition to the content-review load, and they are harder to check
than grammar because the reviewer is being asked about their own country rather than
about Japanese. Two things reduce it:

- The `claims[]` array is the review unit. 126 discrete claims across 33 items, most of
  them one-line factual statements with a source beside them. Every item carries at
  least one source; 21 carry a `flags[]` note naming what the author could not pin down.
- The batch is splittable by `tags`. `admin` (registration, insurance, seals, rubbish)
  is checkable by anyone resident; `history` items are the ones where a wrong date
  actually matters.

Filed as **batch J**. It should probably ship as J1/J2 rather than one sitting.

## Open, deliberately

- **No anecdotes in the kanji module yet.** Character-attached anecdotes drift into
  etymology, which is already a flagged reviewer risk on that module.
- **Countryside coverage is thinner than city coverage** — 8 of 33 lead with a rural
  observation. Real, and worth widening in wave 2, but not by inventing balance.
- **No `mca` touches religion, politics, gender roles or the war.** Not a permanent
  rule; it is where a first wave should not start.
