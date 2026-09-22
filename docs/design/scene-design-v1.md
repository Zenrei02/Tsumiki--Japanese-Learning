# Grammar scenes — design v1

*Session 17, Aug 17 2026, second half. Sibling primitive to the micro cultural anecdotes
(`mca-design-v1.md`), asked for by Lloyd in the same session. First wave authored:
`grammar-scenes-v1.json`, 26 items. Nothing reviewed, nothing rendered.*

## The problem it solves

Lloyd's words: *some of the grammar can be awkward, especially ones that don't have an
English equivalent. Creating a situation that helps them understand the context would be
helpful — almost like we're telling a small story in each lesson.*

The four-beat `exp` already has a `when` beat, and it is good, but it is a **compressed
list of situation types**:

> `noni` — *when:* Disappointments, surprises, gentle reproaches — anywhere the world
> broke a promise to you.

That sentence is correct and it is abstract. A learner who has never felt のに cannot
generate an instance from it. A scene is the opposite move: **one concrete moment where
the pattern is the only thing that would work**, with people, a place and a stake.

The class of grammar this matters for is the one the project already has a name for —
`cc-sb-candidates-v1.md`'s **auto-qualifier: anything with no English equivalent.** For
those points a definition cannot finish the job, because the learner has no L1 slot to
put the definition in.

## Distinct from the anecdotes, and from `cc-`/`sb-`

| | anchored to | about | length |
|---|---|---|---|
| `mca-*` micro anecdote | a **word** in a bank | Japan — what you'd see | 45–90 w |
| **`sc-*` grammar scene** | a **grammar point** | one moment where the pattern does work | ≤130 w |
| `sb-*` Skill Builder | its own lesson slot | drilling a distinction | full lesson |
| `cc-*` Culture Connection | its own lesson slot | how Japanese is used | 150–400 w |

The two new primitives are complements: the anecdote says *here is where you are
standing*, the scene says *here is the sentence you would need while standing there*.
Deliberately no overlap in anchors — a scene never attaches to a word, an anecdote never
to a grammar point.

## Form

Decided with Lloyd: **English scene, Japanese at the moment.**

```
setup     35–70 words of English. A situation, concrete, second person, in Japan.
          Ends at the instant the sentence is needed — it does not tell you the answer.
line      the Japanese, with a gloss. The pattern is doing the work.
contrast  optional. The other reading, or the English-instinct version — LABELLED.
turn      25–55 words. Why English can't carry it, and what breaks if you use the
          English instinct. This is the beat that earns the scene.
```

Total rendered ≤ 130 words. Authored range 96–124.

**The setup ends before the Japanese, not after it.** If the setup explains the grammar
and the line illustrates it, that is an example sentence with a preamble — which the
module already has, in `ex`. The scene has to create the *need* first.

**Second person, in Japan, present day.** Not a textbook Mr Tanaka. The learner is the
one with the problem.

**No stakes inflation.** No emergencies, no embarrassment set pieces. The strongest ones
in the wave are quiet: a window that was shut when you left, six weeks into a job, the
bakery that has been closed for a week.

## Where it renders

**Inside the four-beat block, between `when` and `watch`.**

    what → build → when → ⟨scene⟩ → watch

The logic of the block survives intact: `when` gives the situation types, the scene gives
one of them at full resolution, `watch` then names the traps — and several `watch` beats
read better *after* a concrete instance than before one.

Considered and rejected: **before `what`**, as motivation. It reads well for のに and
badly for everything mechanical, and it would mean two different block orders in one
module.

Visually it needs to be clearly not-an-example — indent or rule it, and set the Japanese
line at the same weight as `ex` entries so the eye knows it is a sentence to keep.

## What earns one

1. **No English equivalent** — the auto-qualifier. If the learner's L1 already has a slot
   for it, the four-beat is enough.
2. **The error is invisible.** Both versions are grammatical and nothing warns you: `sb-must`
   (permission vs prohibition), `sb-transitive`, `toki`, `sb-negq`. These are the highest
   value in the set.
3. **A situation can carry it.** Some points are genuinely about form (`sb-verbtypes`,
   `sb-counters`' sound shifts) and a story adds nothing — `sb-counters` is in the wave
   only because its *failure mode* is situational.
4. **It is not a second `watch`.** If the turn is a list of traps, it is a `watch` beat and
   belongs there.

## Showing wrong Japanese

Several scenes carry a `contrast` line that is either the other correct reading (`toki`,
`sb-kuremorau`, `teikutekuru`) or **an actually wrong sentence** the English instinct
produces (`sb-ganotwo`, `sb-omou`, `sb-transitive`).

There is precedent — the `watch` beats already quote errors (`窓を閉まりました is wrong
twice`) — but it is a real risk in an app whose whole job is correcting Japanese. The
rules. `contrast.kind` takes three values, and they deliberately mirror the checker's own
tiers — the app already teaches learners to read this distinction, so the lessons should
use the same one:

| kind | means | app tier | render |
|---|---|---|---|
| `alt` | also correct, different meaning | — | neutral |
| `misfit` | grammatical, wrong **for this situation** | CORRECT-BUT-UNNATURAL | indigo |
| `error` | wrong Japanese | FIX | red or struck through, never neutral |

The `misfit` tier is the one that had to be added during authoring. 外に行きたいです is a
perfectly good sentence; it is only wrong because it claims someone else's mind. Filing
that as an error would have taught the learner that a correct sentence is broken — the
exact confusion the three-tier system exists to prevent.

- Never more than one contrast per scene.
- Never an `error` contrast in Steps 0–2, where the learner has the least ability to tell
  which line was the good one afterwards.

## Reviewer

**Batch K, 26 items.** Different work from batch J: J is factual claims about Japan, K is
judgement about Japanese. Each item asks the reviewer three things:

1. Is the Japanese line natural, and natural *for this situation*?
2. Is the contrast labelled correctly — really wrong, or just different?
3. Would a Japanese speaker actually reach for this pattern here, or is it a textbook
   choice the situation doesn't call for?

That third question is the one only they can answer and the one the whole primitive rests
on. It is worth doing K before J: a wrong fact in an anecdote is embarrassing, a wrong
instinct in a scene teaches the wrong instinct.

## Each scene names its own pattern

Every item carries a `pattern` field — the literal fragment that must appear in the
Japanese. This was added mid-authoring, after `check-scenes.py` failed three scenes that
were fine.

The checker had been deriving the pattern from the module's `jp` field, which is not
reliably a pattern: for `sb-uchisoto` it is the lesson title **うちとそと**, which no
sentence would ever contain, and for `teikutekuru` it is **〜てくる**, which appears in a
real sentence as **なってきました** and nowhere in that shape. Two of the three "failures"
were the checker being wrong.

The fix is not a cleverer heuristic. It is the author stating the fragment, and the
checker verifying it is there — which also catches the case that actually matters later:
someone edits a line and it quietly drifts off its own grammar point. Where the module
*does* supply a real pattern, the checker still cross-checks and warns on a mismatch
rather than failing, since conjugation explains most of them.

`pattern: null` means the pattern is an **absence**. Only `sc-drop` has this — the whole
lesson is what Japanese leaves out, so there is nothing to match and the checker says so
instead of passing silently.

## Level discipline

Every Japanese line uses vocabulary and kanji at or below its own step, checked against
the module's own banks and `KANJI_DICT` by `check-scenes.py`. Two consequences worth
knowing:

- The early scenes are short, because the learner's Japanese is short. `prim-drop`'s line
  is three words and that is the point of the lesson.
- Where a natural sentence needed an out-of-level word, the situation was changed rather
  than the sentence. The checker reports any kanji outside `KANJI_DICT` so the furigana
  decision is explicit rather than accidental.

## Coverage of the first wave

26 scenes over 21 steps, max 2 per step. Stage 1 gets 14 — deliberately front-loaded,
because that is where the awkward-without-an-equivalent points do the most damage to
confidence.

`sc-toki` closes a flag that has been sitting in `cc-sb-candidates-v1.md` since Session
13 (item 3, the 行くとき／行ったとき tense drill, queued as a Skill Builder). A scene is
the cheaper instrument and may make the SB unnecessary — Lloyd's call, and the flag
should not be cleared until he makes it.

## Open

- **Audio.** These are the first content in the module written as *spoken* moments. If the
  kana recordings ever extend to sentences, the scene lines are the natural first set.
- **Interaction.** Everything here is read-only by design. A version that hides the line
  and asks the learner to produce it is an obvious next step and a different feature —
  it turns a scene into an exercise, with a right answer and a grader.
- **Wave 2 candidates not authored:** `teoku`, `tearu`, `temiru`, `hazu`, `kamo`,
  `sb-sou`, `kadouka`, `sb-rareru`, `sb-noni`, `sb-suru-naru`, `youninaru`.
