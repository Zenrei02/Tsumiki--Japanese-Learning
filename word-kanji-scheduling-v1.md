# Word and kanji scheduling — decision v1

Curriculum · Architecture · proposal. Flagged in Session 3 as *"worth resolving before either is
built, or they will fight."* The kanji module is now in flight, so it is due.

---

## 1. The conflict, precisely

Two orderings exist and they are not compatible, by design:

**Kanji order** is centrality — frequency ÷ learning cost — with a topological sort so components
precede compounds. It deliberately front-loads simple, high-component-frequency characters.
Stage 0 is ~25 stroke-rule exemplars chosen partly because they *build other kanji*.

**Vocabulary order** is communicative usefulness, tied to grammar Steps. It front-loads words a
learner needs to say something, whatever they happen to be written with.

These pull in opposite directions on the same text. 図書館 is a useful early word made of late
kanji. 見 is an early kanji whose words (見る, 見せる, 意見, 見物) sprawl across every level.
Neither ordering is wrong; they are optimising different things.

The three naive resolutions all fail:

- **Gate words on kanji** → the learner cannot meet 図書館 until 館 arrives. Guts the vocabulary.
- **Gate kanji on words** → the topological property breaks, and components stop preceding
  compounds. Guts the kanji ordering.
- **Full independence** → incoherence. The app teaches 痛 as a new character months after the
  learner met いたい in kana, and never connects them.

---

## 2. The resolving principle

> **Kanji state changes how a word looks. It never changes whether the word appears.**

This is the display rule from Session 4 promoted to a scheduling rule. The dependency stays
one-way: vocabulary progression never blocks on kanji progression, exactly as grammar doesn't.

The corollary is the useful part: **a word is learned once, and its written form is upgraded
later.** That is not a compromise, it is how literacy actually develops — the spoken word comes
years before the written one. It also gives you a genuine product moment: the point where a
finishing kanji reaches back and re-renders a word the learner already knows. *That* is when 痛
stops being a shape and becomes いたい. The kanji module's gated sentence-production prompt is
already the seed of this; it should become a first-class event rather than a special case.

---

## 3. Split the schedule by skill, not by object

The trap in SRS design is scheduling *things*. Schedule *abilities*.

| | Recognition — can I read it? | Production — can I write it unaided? |
|---|---|---|
| **Kanji** | Yes — fed by every encounter | Yes — fed **only** by deliberate writing practice |
| **Word** | Yes — fed by encounters and recall drills | **No such thing.** See below |

**Words have no production schedule, and this is not a shortcut.** Japanese is entered by IME:
you type としょかん and select 図書館 from a list. That is recognition with a prompt, not
production. The realistic target for a word is *recognise it on sight* and *retrieve it from
meaning* — neither of which involves forming strokes. Handwriting is a kanji-level skill and
belongs to the kanji module's Trace → Guided → Blank engine, which is exactly where it already is.

This matters because it removes the double-counting problem before it starts. A word review and
a kanji writing drill are no longer competing to own the same interval; they are advancing
different abilities.

---

## 4. Cross-feeding rules

Asymmetric, and the asymmetry is the whole point.

**Word encounter → constituent kanji recognition: yes, capped.** A learner reading 図書館 fluently
in context has genuinely met 図. Withholding all credit would drill them on a character they read
this morning. Cap it — a fraction of a full review, and never enough on its own to advance a kanji
past its first interval — because reading a kanji inside a familiar word is much easier than
reading it cold, and treating them as equal would inflate the schedule.

**Kanji production → word: no credit, ever.** Writing 痛 from memory says nothing about whether
the learner can retrieve いたい from its meaning.

**Kanji recognition → word: no credit.** Same reason in reverse.

**Passive sightings feed nothing.** Already decided for the grammar module and it generalises:
a kanji appearing in a sample sentence the learner read past is not a review. Only deliberate
retrieval counts. Without this rule the coverage meter drifts upward on its own and stops
meaning anything.

---

## 5. What this means for sample sentences

Directly answering the original question, because the split makes it simple:

**Word selection** is constrained by the vocabulary ledger — has the learner met this word, or is
this the lesson introducing it. Nothing to do with kanji.

**Rendering** is constrained by kanji state, per word, at display time: plain kanji if every
character is known, ruby furigana if not, kana only for characters far outside the syllabus. This
is already built.

So a Step 3 sentence can freely use 図書館 while 館 is still years away. It renders with furigana,
the learner reads it, and the word is available. When 館 eventually completes, the same word
quietly stops needing ruby — visible progress the learner didn't have to be told about.

**This also fixes an unenforceable instruction.** `QUIZ_SYSTEM` currently says *"use only JLPT N5
vocabulary,"* which cannot be checked and therefore cannot be relied on. With a ledger, generated
output can be validated against it in code — flag any word outside the learner's met-set, and
either regenerate or gloss it. That converts a thing you trust the model to honour into a thing
you verify. Worth doing while the eval is open precisely because it reduces what rides on model
judgement.

---

## 6. Build order

1. **Split `KANJI_DICT`.** It is doing two jobs — display dictionary and de facto vocabulary list —
   and they want opposite things. Display needs coverage of everything appearing anywhere;
   vocabulary needs a curated, levelled, ordered subset. Pure refactor, no new content.
2. **Build the met-ledger.** Which words the learner has encountered, and where. No external list
   needed, no licensing question, because the authoritative source for *"words this learner has
   met"* is the app's own corpus — the `bank` entries, lesson examples, and their own submissions.
3. **Add word recurrence.** Session 3 named this as the actual gap: not *"we need a word list"*
   but *"we need words to recur."* Nothing currently brings a word back after first exposure.
4. **Wire the promotion event** — kanji completes, words containing it re-render, and the learner
   is shown that it happened.
5. **Only then** choose an external frequency list, and only to order words the learner has *not*
   yet met. Deferring this defers the licensing question entirely, and steps 1–4 deliver most of
   the value without it.

---

## 7. Checked against `kanji-module.jsx`

The file is now in Project files, so three of the four open questions resolve.

**Where the ledger lives — resolved.** The module uses `window.storage`, not `localStorage`, with
four keys: `kanji-progress-v1`, `known-kanji-v1` (written there, read by grammar), `n5-progress-v1`
(read there, written by grammar), and `stroke-data-v1` (shared with the kana modules, so the
handwriting floor calibrated once applies everywhere). `known-words-v1` on the same API is the
obvious shape and needs no new convention.

**Multi-reading kanji — resolved, and more simply than expected.** Each character carries a single
`on` and a single `kun` string, with multiple readings packed into one value (日 is `ひ・か`). So
the data cannot support reading-level promotion, and it does not need to: **promotion should key on
whether every character in the word is known, not on readings.** 生 completing promotes 学生 only
once 学 is also known. That is exactly the rule the renderer already applies to decide furigana, so
promotion and display stay consistent for free, with no new logic.

**Cap size — still open.** Unchanged; it wants tuning against real usage.

## 8. New finding: words now live in three places

Each kanji carries a `w:` array of `[written, reading, meaning]` sample words. That is a third
uncoordinated word store, alongside `bank` in the grammar module and `KANJI_DICT`.

None of the three agree on scope or format, none is authoritative, and every one of them is a
partial answer to *"what words does this app teach."* This escalates the first build step: it is
not "split `KANJI_DICT` in two" but "consolidate three stores into one ledger plus one display
dictionary."

Worth being clear that `w:` should survive as *presentation* — showing a couple of words on a
kanji's card is good teaching and should not be replaced by a ledger lookup. What must not survive
is three places independently deciding what a word means and how it is read. Note also that `w:`
holds one or two sample words per character, not every word using it, so it cannot be the
promotion trigger — another reason promotion keys on characters-known instead.

---

## 9. How this relates to frequency-driven ordering

Session 4 settled kanji ordering on centrality — frequency ÷ learning cost — with a topological
sort. Its most useful finding was in Loach & Wang's final section: they rerun the whole method
**driven by word frequency rather than character frequency**, so characters are introduced only
when needed to build words the learner can immediately use, and the target word set can be
restricted to a course's own vocabulary.

That is the same commitment as this document, arriving from the other side. Word-driven ordering
makes vocabulary primary and kanji subordinate at authoring time; the scheduling model makes
vocabulary primary and kanji subordinate at runtime. Neither is much use without the other: an
ordering that introduces 館 to serve 図書館 still has to answer what happens when a learner meets
図書館 first, and that answer is §2.

### Authoring time and runtime are different times

The one place the two rules can look contradictory. Word-driven ordering means kanji are
introduced *because of* words. §2 says kanji never gate words. Both hold, because they act at
different moments — the word set shapes the kanji order when the syllabus is built, and at runtime
kanji progress blocks nothing. Stating it here so nobody tries to reconcile them later.

### The corpus is the whole decision

"Order by frequency rather than by N5" is only an improvement if the frequency is measured over
the right corpus. General Japanese frequency lists are built on newspapers and web text, and would
push 的, 場合, 関係, 政府 at a beginner — words they cannot use in any sentence they can currently
form. That is precisely the critique Session 4 made of kyōiku order: **mistargeted rather than
wrong.** A general-frequency vocabulary order repeats that mistake in a new costume.

The app's own corpus is small but correctly aimed, and Loach & Wang explicitly support restricting
the target set this way. So the ledger is not merely a tidier place to keep words — **it is the
input the ordering algorithm needs**, and nothing can run until the three stores are one. That
reclassifies the consolidation task: not housekeeping ahead of a vocabulary feature, but the
prerequisite for replacing the kanji module's hand-sequenced placeholder order.

### The two tracks need different algorithms

Easy to get wrong once both are described as "frequency-driven."

Kanji centrality divides frequency by **learning cost** because kanji costs vary enormously —
stroke count, novel components, look-alike interference. Words do not have that spread under this
model, because a word can be met in kana whatever it is written with. Its cost does not inherit
from its characters. **Word learning cost is roughly flat**, so word ordering sits much closer to
pure frequency, while kanji ordering needs the full centrality-plus-topological treatment.

One algorithm run twice would silently penalise useful words for being written with hard kanji —
reintroducing exactly the gating that §2 exists to prevent.

### A small dividend

Within your own corpus, a high-frequency word appears across many lessons, so it recurs without
anything being scheduled. Some of the retention mechanic comes free. Those sightings remain
passive, though, and still must not feed the scheduler (§4) — the recurrence makes the word easier
to keep, it does not constitute evidence that the learner has kept it.
