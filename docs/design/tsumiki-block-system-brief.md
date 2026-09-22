# Design brief — tsumiki effort blocks

## The product

**tsumiki** (つみき, 積み木 — wooden building blocks) is a Japanese-learning
platform for adult English speakers. It began as a grammar checker and now spans
hiragana, katakana, kanji, vocabulary, and a sentence checker.

The name was chosen because 積み重ね — daily accumulation — is how Japanese
describes steady study. The product's thesis is **growth and progress, not
completion and perfection.** There are no lesson counts, no percentage complete,
no finish line. That thesis is the reason the block system exists, and every
design decision below follows from it.

Wordmark is lowercase `tsumiki`, with つみき in the lockup so the reading is
taught at first contact.

## What to design

The **effort block**: the visual unit representing one piece of work the learner
did. Blocks accumulate into a stack that is never finished and never shrinks.

Deliverables wanted:

1. Block vocabulary — the object itself, across its size range
2. The two densities described below
3. The stack — what a hundred blocks look like, and a thousand
4. Section mark treatment (see colour system)
5. Empty state — day one, zero blocks
6. How the stack sits inside Progress, which is its own destination in the app

## Hard rules

These are settled and should not be designed around or reopened. Each one exists
because the obvious alternative reintroduces a completion or punishment
mechanic.

**A block represents effort only.** Never grading, correctness, or performance.
A wrong answer earns the same block as a right one. The checker's three verdict
tiers (fix / correct-but-unnatural / worth-knowing) live in the checker and never
touch a block.

**Nothing ever falls, decays, wilts, empties, or greys out.** No streak, no
neglect state, no toppling stack. Placed blocks are permanent.

**No target silhouette.** Never show the outline of a finished shape, a goal
height, or anything a learner could be short of. There is no denominator.

**No calendar grid, and no day-rows.** Blocks flow and wrap continuously. If a
row equals a day, a skipped day becomes a visible hole — which is a streak with
extra steps. Chronology is available on demand, not in the layout.

**Colour is never the sole carrier of meaning.** Anything encoded by colour must
also be encoded by mark or position.

**Blocks outlive their source text.** Stored sentences are capped and evict over
time; blocks are just a timestamp and a module tag. The stack must never appear
to shrink.

## Register

The target feeling is **cute but not infantile** — warm, approachable, made.
Testing so far says the name reads as cute to English speakers, which is
correct and wanted.

The failure mode to avoid is nursery. What separates the two, from work already
done:

- **Material, not plastic.** Warm wood tones with faint grain. Not saturated
  primary red/blue/yellow.
- **Small corner radius** (~3px at 26px block height, not 10px). Chunky rounding
  reads as toy.
- **Slight per-block variation** in grain and tone, so blocks read as made
  objects rather than generated UI elements. No two identical.
- Restrained lowercase type. Rounded friendly typefaces push it toward kids' app.

Reference register: Muji, Japanese wooden toys made for adults. Not Duolingo,
not Forest, not habit-tracker garden apps — that category's visual language
comes bundled with the decay mechanics we've excluded.

## Section colour system

Each area of the app owns a colour. Hiragana and katakana are shades of purple,
because they are the same skill in two scripts and should read as a pair.

The block is always the same wood — **effort is the constant substance.** The
section is carried by a **mark drawn in the section colour**, not by colouring
the whole block. Colouring the whole block makes effort from different sections
into different materials, which contradicts the first hard rule, and at scale it
reads as a stacked bar chart rather than an accumulation.

Marks pair a Japanese character with an English name: あ Hiragana, ア Katakana,
漢 Kanji, 語 Vocabulary. The English is not decoration — a beginner cannot read
漢 yet, and the pairing is the app's own teaching pattern (unfamiliar form beside
known gloss).

## Two densities

**Labelled.** Mark plus English name. For legends, recent activity, a tapped
block, anywhere with room.

**Bare.** Mark alone. For the stack itself, where hundreds of blocks appear and
an English label would turn a pile into a list.

Same object, two densities. The transition between them is part of the design
problem.

## Open questions to solve

- **The checker's mark.** 文 is a placeholder and the weakest of the set: the
  other four name a thing you study, while the checker is something you do.
- **The two purples.** Pushing katakana dark enough to distinguish it from
  hiragana took it nearly to black, which defeats the point of a colour. Likely
  answer is to keep both purples close and light and let あ versus ア carry the
  distinction — but this needs testing at small sizes and for colourblind
  legibility.
- **Block size floor.** Below roughly 20px the mark stops reading. Either blocks
  never shrink past that and the stack scrolls, or the dense view falls back to a
  colour notch with marks returning on zoom.
- **What one block represents.** Undecided. One check means a long editing
  session produces a landslide and a careful single sentence produces one. The
  checker is capped at three blocks per day; caps for other sections are not yet
  set. Block size may need to vary with the amount written.

## Context worth knowing

Progress is its own destination in the app, not a tab inside an account dialog —
an account is not a place, and progress is one. The stack is the centrepiece of
that screen. A trend line ("errors per check, down since May") is planned to sit
alongside it: the stack is *what you did*, the trend is *what changed*. They
should read as two different things and must not visually contaminate each
other, since the trend does carry performance and the stack must not.
