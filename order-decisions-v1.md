# Kanji, vocabulary and grammar order — decisions v1

Session 9. Curriculum · Architecture. Picks up the kanji ordering settled in Session 4,
derives the vocabulary and grammar orders that were promised alongside it, and checks all
three against each other for the first time.

Companion artifacts, both re-runnable:

- `kanji-ordering-pipeline-v2.py` → `kanji-order-v2.json`, `kanji-order-report-v2.md`
- `curriculum-order-pipeline.py` → `curriculum-order-v1.json`, `curriculum-order-report-v1.md`

---

## 0. First, the notes have drifted

Everything below is measured against the live `n5-practice.jsx` and `kanji-module.jsx`, not
against the session documents, because the documents no longer describe the files.

| What a note says | What the file says |
|---|---|
| `stage-1-unit-breakdown-v1.md`: "Step 2 is 25 points, split it" | Already split — Step 2 (10) + Step 3 (15) |
| Same: "three builds have empty `requires`" | Already filled — no build has an empty array |
| `word-ledger-report.md`: 87 bank words | 93 in the file; 6 are invisible to the ledger's regex |
| `kanji-order-report.md`: order pending two blockers | Three — the tracker row carries a third the report omits |

This is the cost of specs that describe a plan rather than a state. Both new pipelines read
the modules directly and regenerate their reports, so the next drift is visible rather than
assumed.

**One more source, and it is not a file.** The last row above matters twice over: that third
blocker was recorded on the *tracker row*, not in the report or in anything in this folder.
Several decisions this document depends on live only in the `Notes` field of a Notion row —
the per-word aggregation rule, the mazegaki rejection and the jukujikun limitation in §5a are
all row-only, and none appears in any `.md` here. **The tracker is a primary source, not an
index of the files.** Read the rows before concluding something is undecided.

---

## 1. The three orders, and the one rule that keeps them apart

Session 4 and `word-kanji-scheduling-v1.md` §2 settled the governing rule:

> **Kanji state changes how a word looks. It never changes whether the word appears.**

That rule is what lets the three orders be derived independently rather than negotiated:

| Order | Optimises | Algorithm | Gates |
|---|---|---|---|
| **Kanji** | centrality — demand ÷ learning cost | greedy topological, components first | nothing |
| **Vocabulary** | communicative usefulness | flat cost, near-pure own-corpus demand | nothing |
| **Grammar** | capability arcs | prerequisite DAG, cut at build lessons | vocabulary and kanji *display* |

Word cost is flat and kanji cost is not — the asymmetry §9 warned about. One algorithm run
twice would penalise useful words for being written with hard kanji, which is the gating §2
exists to prevent. They stay two algorithms.

---

## 2. Kanji — three blockers, all resolved

### 2.1 Untaught components: one promotion, and the rest stay shapes

v1 flagged 22 characters containing KanjiVG parts the syllabus never teaches, and asked
whether to promote the parts, frame them as shape-only, or move the characters later.

Checked against the ledger the question mostly collapses. **Almost every promotion candidate
carries zero word-demand** — 門, 寺, 刀, 米, 交, 玉, 舌, 禾, 丁 appear in no app word at all;
可 appears in one metalinguistic label. Promoting those would teach characters the learner
never reads, purely to satisfy a decomposition graph — the exact mistargeting the word-driven
method exists to avoid, kyōiku ordering in a new costume.

**言 is the exception, and it is an authored override rather than a rule.** It has the most
demand of any candidate and still only 2 (言う, 言), so the rule alone would have kept it a
shape. Lloyd promoted it on grounds the ledger cannot see: 言う is a high-frequency verb in
its own right, and 言 is the backbone of 話, 読む, 語 and 言語 — most of which sit just past
this syllabus. **The ledger measures the corpus as it is today, not as it will be two stages
out.** That is a real limitation of demand-driven ordering, and this is the first case where
it bites. Recording it as an override keeps the rule intact and the exception visible.

> ⚠️ **Not free.** 言 has no KanjiVG stroke paths and no dictionary entry in
> `kanji-module.jsx` — it appears there only as a part of 話. It needs seven stroke paths, a
> dictionary entry with readings, and a lesson slot **before the order can be applied.** The
> pipeline places it; it cannot supply the data. See §8, step 3.

For the other twenty-three parts the resolution is not to add characters. It is to state what
was always true:

> **KanjiVG decomposition is a structural fact. It carries no pedagogical claim.**

This is not a new principle — it is Session 4's own instruction made enforceable. That journal
records *"KanjiVG's decompositions are structural, not pedagogical… do not generate mnemonics
from the decomposition data automatically."* The module applies it locally, overriding
KanjiVG's 白 ⊃ 日 because the shape is real and the meaning is not. What was missing was a
place to write the decision down for every part rather than case by case. v2 classifies all 24:

- **Named shapes (13)** — 門 米 玉 刀 寺 交 舌 可 禾 囗 彳 丁 儿. Glossed on the card
  (*"this shape means gate — you are not learning it yet"*). Never a lesson, never in
  `KANJI_SYLLABUS`, never a review item. Costs one glance.
- **Muted shapes (10)** — 丿 丨 乙 卜 冂 干 乂 厶 毋 气. Hidden entirely; the character is
  atomic for teaching. These do not merely fail to help. *"上 = 卜 + 一"* teaches a 3-stroke
  character as a compound of two things the learner will never see again.

The cost consequence is a correction, not a loosening: v1's flat +1.5 per foreign part was
charging 上 下 七 千 中 年 気 母 円 四 for artifacts of the decomposition.

Per §6.2 the glosses ship as **shape-naming only** — *"this shape means gate"* stays, the
origin story waits for the etymology phase.

### 2.2 Newspaper-only frequency: measured instead of warned about

The scriptin corpora still cannot be fetched (the sandbox proxy refuses GitHub raw), so the
0.3 frequency term still inherits KANJIDIC2's newspaper skew — the wrong target for a learner
reading menus and messages, per Session 4 Decision 8.

Rather than caveat it a third time, v2 runs the whole order across a sweep of frequency
weights and measures the dependency:

| Frequency weight | Kendall τ vs base | Characters moving ≥10 places |
|---:|---:|---:|
| 0.00 | 0.986 | 0 |
| 0.15 | 0.997 | 0 |
| 0.30 (base) | 1.000 | 0 |
| 0.50 | 0.989 | 0 |

**Not blocking.** Removing the frequency term entirely barely disturbs the order. Word-demand
and component structure are doing the work; the newspaper skew rides on a term that does not
steer. The order can be applied now and the scriptin merge treated as a refinement.

Still worth fetching, on your machine, for the coverage curve — which remains the most
confident-looking number in the UI and the least earned:

```
wget -P freq-data https://raw.githubusercontent.com/scriptin/kanji-frequency/master/data2015/{aozora,news,twitter}.json
```

### 2.3 Stage 0 was being reordered by a criterion that does not apply to it

**This was already recorded, and I initially claimed otherwise.** The v1 tracker row lists it
among its own caveats — *"Stage 0's stroke-rule constraint is not modelled"* — so it was known
when v1 shipped. An earlier draft of this document called it a new finding; it is the
resolution of a logged limitation. What is new here is the measurement of what the omission
cost, and the fix.

The module's first block is **not** a centrality decision. Its 25 characters are chosen
because between them they demonstrate the nine stroke rules — a criterion the pipeline has no
visibility of. v1 sorted all 63 together, so 口, 川, 田, 中, 四, 山 and 女 were each pushed
forty-odd places down the list, and the report presented those as the method paying off.

**They were not. 15 of the 42 "large moves" v1 reported — 人 入 八 二 水 月 小 国 田 山 女 川
口 中 四 — were the pipeline overriding a deliberate teaching choice it could not see.** v2
locks Stage 0 as an ordered prefix and derives centrality over the remaining 38 only.

A useful side effect: with Stage 0 locked early, the *dynamic* cost from Decision 3 finally
shows itself. 好 rises twelve places not because of any policy change but because 女 and 子
are both known by the time it is considered, so it costs almost nothing. That behaviour was
in v1 too — it was just invisible while Stage 0 was scattered through the middle of the list.

### 2.4 The resulting order

```
一二三十日月目田口白小水川山人入八大中車女子四国円 ｜ 今分手時上学下生明天先気百好年見行七千間雨来町火何母力男土食言話私木本休校林森
```

*(Regenerated after 言 was promoted — see §2.1. 64 characters now; 言 sits at #56, immediately
before 話 at #57.)*

Locked Stage 0 to the left; derived to the right. Component precedence holds with no
violations. Eight tail groups of 3–5 — see the report for the table. Group *themes* and
stroke-rule sentences are authoring, not generation; the existing titles set a bar a generated
label would not meet.

**A correction to Decision 6 while applying it.** The pipeline implements contrastive
adjacency by placing look-alikes next to each other in the sequence. Checked against the
module, that is a weaker version of something already built. 日, 目 and 白 are *not* adjacent
in Stage 0 — they sit at positions 5, 7 and 10, with 月, 田 and 口 between them — and the
contrast is carried instead by a dedicated skill lesson, `sb-eye` (*"日, 目, 白 — three
squares"*), placed immediately after the group that completes the set. The same pattern
appears twice more: `sb-person` for 人·入·八 and `sb-tree` for 木·本 and 今·分.

That is the better mechanism, and it is more robust: a skill lesson teaches the contrast
explicitly, survives regrouping, and does not fight the centrality order for sequence
positions. **Decision 6 should be restated as "confusables get a contrast lesson once the set
is complete," not "confusables are placed adjacently."** The pipeline's adjacency pass then
becomes a scheduling hint — it marks where a contrast lesson is due — rather than a
constraint on the order. Its output already reads that way: the two chains it forms in the
derived tail, 今·分 and 木·本, are exactly the pairs `sb-tree` already covers.

---

## 3. Grammar — two items left, not a re-plan

The prerequisite graph is clean: 126 points, 17 steps, no duplicate ids, no `requires`
pointing at a missing or later point, no build with an empty array. That property is what
makes units computable rather than hand-maintained, and it currently holds.

Adopting the 14-unit breakdown therefore reduces to two items:

**Split Step 4.** It carries 18 points and *three* build lessons — the file saying it is three
units wearing one name. The seams are already authored, so splitting costs no new content and
lands at 7 / 4 / 7, exactly the sizes the breakdown predicted:

| Unit | Closes with | Capability name |
|---|---|---|
| 4a | `b-s3a` chain three actions | Put verbs in the past |
| 4b | `b-s3c` describe a state | Say what's going on right now |
| 4c | `b-s3b` describe a person | Describe with a whole clause |

*Nit found while placing the seams:* `cc-teru` (casual 〜てる) sits after `b-s3c`, so a
mechanical split files it under 4c. It is about 〜ている and belongs in 4b — which also
rebalances the split to 7 / 5 / 6.

**Capability-first naming.** Untouched. "Core particles" describes the grammar; "Mark who does
what to what" describes the learner. The breakdown's argument stands and needs no new analysis.

One unit remains oversized: Step 3 at 15 points, closing at `b-s2b`. The breakdown already
identified this as the single place needing new content — a build lesson to close the joining
half before quantity begins. Still the one genuine addition on the table.

---

## 4. Vocabulary — the order is not the problem

The ledger holds 286 words. **Only 93 are introduced anywhere.** The other 193 are
`KANJI_DICT` display entries and kanji-card samples: reachable, glossable, never taught.

That reframes the task. There is no missing *sequence* — the taught words already have one,
in bank order, authored against the grammar they support. There is a missing *syllabus*, and
three defects in what exists.

### 4.1 The Step 2 split cloned its bank

Step 2 and Step 3 carry byte-identical banks:

> 公園、友達、図書館、学校、映画、朝ごはん、電車、駅

When the split happened the points divided and the bank did not. Both halves now claim to
introduce all eight words, so neither half's vocabulary is scoped and the first-introduction
map is ambiguous for eight of the 93. **This is the highest-value fix in the document** —
small, unambiguous, and every downstream ordering reads through it.

### 4.2 Recurrence is not happening, and §9 assumed it was

`word-kanji-scheduling-v1.md` §9 banked a "small dividend": *a high-frequency word appears
across many lessons, so it recurs without anything being scheduled.*

Measured: **it does not.** 23 of 93 words appear in more than one bank; 13 of those recur only
at their own checkpoint. Discounting the cloned bank above, exactly two words genuinely
reappear in a later teaching step — 終わる and 時間.

In this corpus a word is introduced once and, unless its checkpoint catches it, never returns.
The retention dividend the note relied on is not there. **Recurrence has to be scheduled after
all**, which puts Session 3's original diagnosis back on the table intact.

### 4.3 Six words are invisible to the ledger

`build-word-ledger.py` matches `bank:` only when `points:` follows, so the N4 stress-test bank
(かさ、全部、忘れる、最後まで、落とす、財布) never reaches the ledger. Arguably correct to
exclude as out-of-stage — but it happens by regex accident rather than by decision, and it is
why the ledger reports 87 where the file has 93.

### 4.4 The genuinely orderable list

What *can* be ordered is the promotion queue: which dictionary-only words deserve a lesson
bank. Ranked by own-corpus demand with bonuses for kanji-card presence and N5, **no centrality
division and no kanji gate**. Top of the list: 三時, 上手, 日本, 百円, 一つ, 一人, 下手, 二つ,
今, 手, 私, 母, 好き. Full table in the report.

---

## 5. The finding that should change a plan

Cross-cutting all three orders, for each taught word, at what point does it stop needing
furigana:

- **5** taught words are kana-only and always render plain.
- **18** get a promotion event during Stage 1.
- **68 — 73% of the taught vocabulary — never render plain at all within the 63-character
  syllabus.**

And the tail is flat. No untaught character unlocks more than two words; 80 of 85 unlock
exactly one. Clearing furigana from all 68 would take **85 new characters**, growing the
syllabus from 63 to 148, and 20 of those words need two or three before anything visible
happens.

> **Correction, made after checking the tracker.** These figures were originally 19 / 69 / 74%.
> The **Kanji display pipeline** row (Jul 28 2026) records a limitation the analysis had
> ignored: *"jukujikun break composition entirely — 今日 きょう, 大人 おとな, 昨日 きのう,
> 一人 ひとり. Both kanji may be N5 while the word is unreadable by composition."* The row calls
> for a hand-maintained exception list carrying each word's own unsplittable reading. **That
> list has never been built**, and the pipeline had silently assumed every word composes. It now
> seeds the list with twelve entries and excludes them from the arithmetic. Four of the original
> top-ten promotion-queue entries — 上手, 日本, 一人, 下手 — were scored as fully kanji-covered
> and therefore ready; knowing 上 and 手 does not let anyone read じょうず.

This matters twice over.

`word-kanji-scheduling-v1.md` §2 describes the promotion event — a finishing kanji reaching
back to re-render a word the learner already knows — as the payoff of the entire scheduling
model. *"That is when 痛 stops being a shape and becomes いたい."* On the current syllabus 痛 is
one of the 69: it never arrives.

More seriously, it puts pressure on **Session 4 Decision 4** itself — *"characters arrive when
they unlock a word the learner can already say."* Measured against the taught vocabulary, the
current 63 characters mostly do not. The decision is right; the syllabus was assembled before
there was a ledger to test it against, and it has never been checked. That check is now a
`python3` away, which is the point of building the pipeline rather than a one-off sort.

The model is not wrong. The expectation set on it is. Either the kanji syllabus expands far
past 63 to chase the vocabulary, or the promotion event is repositioned as a pleasant
occasional surprise rather than a core mechanic. **That is a product decision and it should be
made deliberately, not discovered after the feature is built.**

---

## 5a. A stale decision found in the same place — now retired at source

*(Resolved Aug 7. Decision 5 on the row is marked superseded, with an amendment explaining why;
the jukujikun limitation has its own tracker row. Recorded here because the reasoning matters.)*

The **Kanji display pipeline** row (Jul 28 2026) carried this, as Decision 5:

> **RUBY AS EXCEPTION MARKER.** App is popup-by-default, so ruby appears nowhere normally —
> which means its appearance is itself the signal. Show ruby only when a KNOWN kanji carries an
> UNEXPECTED reading.

**This stopped being true a week ago.** Session 4 Decision 4 made furigana the general
rendering mechanism rather than an exception marker, and Session 6 wired it that way — the
`KANJI_SYLLABUS` row records *"untaught kanji now render with real ruby furigana instead of
substituting kana."* The display row went on asserting the superseded rule, and it is the most
detailed kanji-display document in the tracker, so it is the one someone would reach for.

**One thing was lost in retiring it, and is now an open question rather than a solved one.**
Decision 5 was doing real work: it gave the *unexpected reading* case a signal — 生 as なま to
a learner who knows せい. That case has not gone away, but ruby now means "you have not learned
this character yet," so it can no longer carry the second meaning. What marks an unexpected
reading is currently undecided.

Everything else on that row stands and is load-bearing for this document:

- **Level tags are per-kanji, not per-word** — also the only sourceable option, since JLPT
  stopped publishing vocabulary lists in 2010 while kanji lists stayed consistent.
- **Aggregation rule: store atomically per-kanji, decide compositely per-word.** A word renders
  in kanji only if *every* kanji in it is at or below level. This is exactly what §5's
  `plain_at` computes — arrived at independently, which is reassuring.
- **Mazegaki (交ぜ書き) rejected** — no でん車. It manufactures word-shapes that exist nowhere,
  and word-shape recognition is most of reading fluency.
- **Split popup** turns the limitation into a motivation beat: 電車 — train / 車 — you know this
  one / 電 — later on. Free given per-kanji storage.
- **Level tags the character, not the reading** — 生 is one tag across ~10 readings, so
  per-kanji levels overclaim. Recorded as accepted slippage.

That last one compounds the jukujikun problem: composition can fail either because the word
does not decompose at all, or because it decomposes onto a reading the learner has not met.

## 6. Decisions taken — Lloyd, Session 9

The five questions this document opened with are answered. Three of them collide with earlier
decisions, and those collisions are recorded here rather than resolved silently.

### 6.1 The promotion event becomes an achievement marker, not a gate

Two thresholds, both stated as accumulation rather than progress-toward-a-target:

- **Encounter** — *"you have encountered X words"*
- **Semi-mastery** — *"you have practised with X words"*

Reaching one **offers** a short quiz. It does not impose one. The framing is user choice, and
taking it up earns achievement points — a currency that needs introducing.

*Later phase, captured so it is not lost:* achievement points buy vanity items — a pet, objects
in a room the learner decorates — and the room itself grows with level, ending in a traditional
house. Not scoped; recorded because it makes the point currency worth having.

> **⚠️ Collides with the no-counts rule.** Standing practice is *no lesson counts anywhere in
> the UI — they are discouraging*, with the kanji coverage percentage as the sole exception
> "because it states capability, not workload." *"You have encountered 47 words"* is a count.
>
> It is compatible with the **principle** even though it breaks the letter, and the distinction
> is worth writing down because it will come up again: **counts of what you have accumulated
> motivate; counts of what remains discourage.** "12 of 40 lessons" tells a learner how much is
> left. "You have encountered 47 words" has no denominator, so it cannot. **The rule should be
> restated as: no denominators. Numerators are fine.** That covers the coverage percentage too
> — it survives for exactly the same reason.

### 6.2 Etymology defers to a later phase

Not cut — deferred to a phase with room to research, confirm and implement it properly as a
feature in its own right.

> **Consequence for §2.1.** The named-shape glosses are the thin end of this. Several of my
> rationales are etymological claims wearing shape-description clothes — 刀 "blade, pairs with
> 八 to make 分 read as splitting" is an origin story, not a description. If etymology defers,
> the glosses must be **shape-naming only**: *"this shape means gate"* stays, *"and that is why
> 間 means interval"* waits. This also shrinks the reviewer queue now and moves the interesting
> half of it to the phase that can do it justice. 米 in 来 is the clearest case — honest as a
> shape, wrong as an origin, and under this rule only the honest half ships.

### 6.3 Step 3 gets its new build lesson

The one genuine content addition on the table. It closes the joining half (と, も, の, から, より,
か, や) before quantity begins (だけ, しか, counters, ぐらい, ごろ), and brings the largest unit
in Stage 1 down from fifteen points.

### 6.4 Recurrence lives in the vocabulary module

Words due or already encountered at the current stage surface there. Three activities:
see the word, practise writing it, practise using it in a sentence. **Exposure counts drive
visual mastery; writing and sentence use drive full mastery.**

This answers §4.2 directly — recurrence is not free, and this is the mechanism that supplies it.
It also gives the Jul 29 vocabulary-module note its missing piece; that note ended on *"not 'we
need a word list' but 'we need words to recur'"* and never said where recurrence would happen.

> **⚠️ Collides with the scheduling model.** `word-kanji-scheduling-v1.md` §3 states, in bold:
> *"Words have no production schedule, and this is not a shortcut."* The argument was that
> Japanese is entered by IME — typing としょかん and picking 図書館 is recognition with a prompt
> — and that **handwriting is a kanji-level skill belonging to the kanji module's Trace →
> Guided → Blank engine.** "Practise writing it" in the vocabulary module is the thing that
> decision ruled out.
>
> **Resolved (Lloyd):** *word-writing is an activity, not a schedule.* Writing 図書館 exercises
> production of 図, 書 and 館, so **credit flows to those characters' production intervals** and
> the word itself keeps only its recognition schedule. That preserves what §3 was actually
> protecting — the double-counting problem, where a word review and a kanji drill compete to own
> one interval and the kanji ends up looking known when only the word was practised.
>
> Sentence use is less fraught: that is composition, which the grammar module's build lessons
> already do, and it feeds neither schedule.

**And the writing option is itself gated** — offered only for kanji the learner is due to be
practising, never for characters they have not met or are not ready for. Otherwise the module
would invite someone to write 図書館 having never seen 館.

#### The word returns, once per kanji — and this is the recurrence mechanic

Lloyd's design, and it resolves the partial-writing question in the better direction. **Each
word carries its own trackers.** A word enters the module when it has a kanji to learn. When a
*later* kanji in that same word comes due, **the word returns**, carrying a marker that tells
the learner there is more to practise here and points them at it. They then write using every
kanji unlocked so far — previously learned plus currently learning — and use the word in a
sentence again.

This is better than either branch I offered. Partial writing is not a compromise on the
all-or-nothing rule; it is the mechanism. And the recurrence §4.2 said had to be scheduled
**falls out of the kanji order for free** — no separate interval design, no second queue. A
word's return points are simply the positions of its characters in the kanji sequence.

It is also the first thing in this document that makes the kanji order do vocabulary work
rather than merely coexist with it.

> **A note on display during partial practice.** Showing 電車 with 電 blanked is *not*
> mazegaki. The mazegaki rejection (Decision 3 on the display row) is about rendering a word's
> standard written form as でん車 in running text. A practice affordance that masks the
> character you are about to write is a different object and the rejection does not reach it.
> Worth stating so nobody re-litigates it later.

**What the corpus does to it.** The mechanic is sound; the vocabulary cannot currently feed it:

| | |
|---|---:|
| Taught words that ever enter the module | **29** of 93 |
| Total practice visits generated across Stage 1 | **37** |
| Words that ever *return* | **7** |
| Return events in the whole of Stage 1 | **8** |

22 of the 29 have exactly one taught kanji, so they enter once and are done. Only 日本人
returns twice. **The marker fires eight times in a stage.** Visits do at least spread evenly
across the kanji order — 5 to 9 per ten characters, no starved stretch — so pacing is fine;
there is just not much of it.

**This gives the promotion queue a sharper criterion than the one in §4.4.** A multi-kanji word
is worth disproportionately more than a single-kanji word, because it generates a return rather
than a single visit. 21 of the 60 queued words qualify, and promoting just the top 20 by
existing score would add **30 visits to the current 37 — an 81% increase** — with 10 of them
generating returns. 三時, 百円, 七時, 三年, 千円, 日本 are the cheap wins: high demand already,
and each one buys a return.

Recommend adding *number of taught kanji* as an explicit term in the promotion ranking rather
than leaving it implicit in the source count.

> **This is not the gating §2 forbids, and the difference is worth stating.** §2 says kanji
> state may change how a word *looks*, never whether it *appears*. Gating the write-it
> affordance leaves the word fully present — visible, glossed, recognisable, counting toward
> exposure. Only one of three activities is conditional. The word still appears; one button is
> not yet lit.

**Measured, because the gate has a cost.** Of the 93 taught words, only **20 have all their
kanji inside the syllabus** and would ever offer full writing — 9 more are partially covered,
59 contain no taught kanji at all, and 5 are kana-only. Following it through to characters:

> **Word-writing can only ever reach 24 of the 64 taught kanji. The other 40 appear in no
> taught word.**

That is the §5 finding arriving from a third direction — the taught vocabulary and the taught
kanji barely overlap. Two consequences. The kanji module's Trace → Guided → Blank engine stays
the **primary** writing surface; the vocabulary module supplements it for a minority of
characters and should not be scoped as if it replaced it. And the writing activity will feel
thin early on, because the eligible pool at the start of Stage 1 is a handful of words.

The 20 that qualify: 下、今日、先生、入る、国、天気、子ども、学校、学生、日本人、時間、本、水、
行く、見る、言う、話す、車、雨、食べる — which is a decent spread of everyday verbs and nouns,
so the pool is small but not junk.

### 6.5 Unexpected reading = anything outside the on-yomi and first two kun-yomi

A workable definition, and the data supports it: each character carries one `on` and one `kun`
string with readings packed (日 is `ひ・か`), so "the first two kun" is directly expressible
without a schema change.

> **⚠️ This is a third ruby model, not the current one.** Worth being explicit, because §5a
> retired one model and this proposes another:
>
> | Model | Ruby means | Status |
> |---|---|---|
> | Ruby as exception marker | this known kanji has a surprising reading | retired §5a |
> | Ruby as taught/untaught | you have not met this character | **shipped, Session 6** |
> | Ruby until mastery | you have met it but not yet mastered it | **proposed here** |
>
> Ruby-until-mastery is the better idea and it dissolves the §5a problem — if ruby persists
> past first contact, the unexpected-reading case can simply keep it longer rather than needing
> a separate signal. The **always-on switch** is right regardless and should be built whichever
> model wins, as accessibility rather than preference.
>
> **It does change §5's arithmetic, in the direction of the finding.** Every "plain at kanji
> #N" figure assumes ruby drops when a character is *taught*. Under mastery-gating it drops
> later and by a per-learner amount, so the 18 promotion events are an upper bound and the 73%
> is a floor. The §5 conclusion holds and gets slightly stronger.

### 6.6 Sentence use repeats every visit, with a skip from the third

The sentence exercise runs on every return. From the **third** time a word comes back, the
learner gets a button to skip it if they want to.

This is the §6.1 philosophy applied consistently — *offer, do not impose*. It is the third time
in this document the same shape has been reached: the quiz is offered rather than gated, the
writing option is lit rather than forced, and now the repeat sentence can be declined. Worth
naming as a principle rather than re-deciding case by case: **the module proposes, the learner
disposes.** Nothing in the vocabulary module blocks progress.

Two things follow that should be settled with it:

- **Skipping should forfeit the achievement points for that exercise.** Otherwise it is not a
  choice, it is a free bypass, and the points stop meaning anything. Since sentence use feeds
  neither schedule (§6.4), skipping has no scheduling consequence at all — the cost is purely
  the points, which is exactly the right size of cost.
- **The threshold is nearly inert on the current corpus, so build the simple version.** Exactly
  **two words in the whole 286-word ledger** ever reach a third visit — 日本人, and 三十分 if it
  is promoted. A visit-count threshold means carrying per-word counter logic to change behaviour
  twice. **Recommend making skip available on every repeat visit instead of gating it on the
  third**: same philosophy, no counter, and it stops being dead code the moment the vocabulary
  grows. If the third-visit threshold is wanted for its own sake, it is cheap — but it should be
  a deliberate choice rather than a rule that never fires.

### 6.7 Making the extra try worth taking

Lloyd's steer: the reward for doing the optional exercise should be worth the effort. Three
things shape how to do that without breaking §6.6.

**First — no visit is ever a repeat, and that changes the framing.** Verified against the data:
a word returns *only* when another of its kanji comes due, so **every return carries a
newly-unlocked character, in all 37 visits, zero exceptions.** The third pass at 日本人 is not
"write it again" — it is the first time the learner can write 人 in it. The exercise is *use
this word now that you can write more of it*, and the word is materially different on the page
than it was last time. That is worth saying in the copy, because a learner who reads it as
repetition will skip on principle no matter what it pays.

**Second — pay for what is new, and let completion carry the weight.** The strongest motivator
here is already in the design and it is not a point: it is the moment the last kanji lands and
the word becomes fully writable. That is §5's promotion event, and this module is where it
finally has somewhere to happen. Points should **mark** that moment, not substitute for it.
Three tiers, in descending size:

| Event | Stage 1 count | Why it pays what it pays |
|---|---:|---|
| Word completes — fully writable | **20** | The intrinsic moment. Points acknowledge it. |
| Writing a newly-unlocked kanji in a known word | **37** | The actual new work, every visit. |
| The sentence use | **37** | Optional — so it should be the best *rate*, not the biggest lump. |

Illustratively, at 10 / 3 / 2 the sentence is about a fifth of everything earnable in the stage:
enough that a completionist always takes it, small enough that skipping on a tired evening is
not a punishment. **That ratio is the design target, not the specific numbers.**

**Third — the failure mode is over-rewarding it.** Make the optional exercise pay too well and
skipping becomes costly, at which point §6.6's "propose, do not dispose" is a gate with extra
steps and the button is decorative. There is also a well-documented risk of over-justification:
attach points to everything and the intrinsic satisfaction — reading Japanese unaided, watching
furigana fall away — gets crowded out by the score. Points should be **sparse and tied to
thresholds that mean something**, which is the same reasoning that put the coverage percentage
in the UI and kept lesson counts out.

**Practical consequence for the sink.** 385-ish points a stage under the sketch above is the
budget the vanity rewards (§6.1) have to price against. Worth knowing before the room and the
pet get designed, because it is much easier to set prices against a known earn rate than to
retrofit one.

### 6.8 The module opens on what is new; older vocabulary lives in a review area

Opening the vocabulary module shows **new words only** — words with a kanji newly due, and
words returning because another of their kanji unlocked. Everything already worked through
moves to a separate **review area**, reachable but not in the way.

The reason is the one that governs the whole module: a learner opening it should see what to do
now, not a list of what they have done. An undifferentiated pile grows monotonically and turns
into a wall — the same failure as a progress denominator (§6.1), arriving through layout rather
than through a number.

**Learners can mark any word "unlearned"**, which returns it to active practice.

That is a better feature than it looks. It is a **free, high-quality signal**: a learner
volunteering *"I don't actually know this"* beats any scheduler's guess, and it is exactly the
input a fitted scheduler would want later. And it fixes the **false-positive problem** no
spaced-repetition system handles well — a word recognised from context, or from the shape of
the exercise, rather than from memory. The learner can tell the difference. Nothing else in the
system can. Mechanically it is a manual lapse to stage 0 of the ladder in
`vocab-retention-model-v1.md`.

### 6.9 The currency is AP, for now

Working name. **Flagged for renaming in a later phase** — it is a placeholder, and Lloyd
expects a better one to turn up unprompted rather than by committee.

Worth noting the working title of the app itself is on the same list, so this is the second
name deliberately left open. Both are cheap to change while nothing is published and expensive
afterwards, so the renaming pass should happen before any public build, not after.

## 6a. Still open

1. **Achievement points** — the earn structure is sketched in §6.7 (completion > new-kanji
   write > sentence, with the optional exercise as the best rate rather than the biggest lump).
   Still needed: a **name** for the currency, the actual numbers, and whether anything outside
   the vocabulary module earns.
2. **Which ruby model ships** — §6.5. Mastery-gating is proposed; taught/untaught is what runs
   today.
3. **Per-word tracker shape** — the return mechanic needs state per word: which of its kanji are
   unlocked, which have been written, exposure count, sentence-use count. That is a fifth
   `window.storage` key alongside the four that exist, and it should be named and shaped
   deliberately rather than accreted. `known-words-v1` was already the anticipated name.
4. **~~Does the sentence use repeat on every visit?~~** Decided — see §6.6.
5. **Add "number of taught kanji" to the promotion ranking** (§6.4). Currently implicit in the
   source count, and it is now the strongest predictor of a word's value.

*Closed since the first draft: 言's position (stays at #56); word-writing credit (flows to the
constituent kanji); and partial writing (yes — it is the return mechanic, §6.4).*

## 7. The kanji module needs a preface

Decided alongside §6: the module opens by explaining where its order comes from, and by setting
expectations about JLPT levels.

The `cc-intro` culture lesson already does the first half — *"Where this order comes from"*,
covering why no official JLPT kanji list has existed since 2010 and why ours is a sixth
reconstruction. What it does not yet say is the part learners will actually worry about:

> **The JLPT level you need will arrive on its own.** Kanji are marked with the level they are
> commonly held to belong to, so you can see where you stand — but they are taught in the order
> that makes them easiest to learn and most immediately useful. **That means you will be
> learning kanji from several levels at once, and that is deliberate, not a mistake.**

Saying it up front matters because the alternative is a learner three weeks in noticing they
have N4 characters before finishing N5 and concluding the app is disorganised.

**One honesty constraint on the level markers.** Session 4 Decision 1 established that every
circulating JLPT kanji list is a reconstruction, and Session 7 found the project already
carrying **three disagreeing level sources** — a per-check assertion, KANJIDIC's `jlpt_old`
(a different scale entirely), and the AI-tagged `KANJI_DICT`. 痛 is N3 by one and grade 6 /
`jlpt_old: 2` by another. So the marker must be worded as *commonly listed as*, drawn from one
named source, and never as a claim about the exam. Getting this wrong is worse than omitting
it: a learner who trusts the badge and fails the paper has been misled by the one number that
looked official.

## 8. Build order

1. **Fix the Step 2/3 bank clone** (§4.1). Smallest change, unblocks the first-introduction
   map that everything else reads.
2. **Split Step 4** at its existing seams and move `cc-teru` (§3). No new content.
3. **Add 言 to the module** — stroke paths, dictionary entry, readings, lesson slot (§2.1).
   Blocks step 4, because the order now contains a character the module has no data for.
4. **Apply the kanji order** (§2.4) to the module's lesson groups, authoring themes and stroke
   rules per group, and extend `cc-intro` with the §7 preface.
5. **Write Step 3's new build lesson** (§6.3). The one content addition.
6. **Then** the capability-first renaming, which is presentation and can follow safely.

Deferred by §6.2: etymology, and with it the interesting half of the shape glosses.
Sequenced separately because they are their own tracks: the vocabulary module (§6.4), the
achievement-point currency (§6.1), and the ruby-model decision (§6.5).

Nothing here depends on the scriptin corpora. The reviewer is needed for the shape glosses and
the new build lesson's Japanese — both content, neither ordering.
