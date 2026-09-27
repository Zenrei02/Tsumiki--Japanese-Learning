# Vocabulary retention model — draft v1

Session 9. Curriculum · Architecture · **proposal, not applied.** Drafted against the research
below and fitted to the return mechanic decided in `order-decisions-v1.md` §6.4.

---

## 0. The thing that makes tsumiki's case unusual

Most vocabulary apps have exactly one recurrence system: an interval scheduler. **tsumiki
already has a second one**, and it arrived from the curriculum rather than from memory science.
A word returns to the vocabulary module every time one of its kanji comes due (§6.4). That is a
spacing schedule — it is just driven by the kanji order instead of by a forgetting curve.

So the question is not "what intervals should we use." It is **"what should the interval
scheduler do that the kanji order does not already do."** Getting this wrong produces the
double-counting failure `word-kanji-scheduling-v1.md` §3 was written to prevent, one level up:
two systems both claiming to own when a word comes back.

The answer proposed here: **the kanji-driven return is a real review and advances the interval.
The interval scheduler only fires when the content schedule has nothing due.** One queue, two
things allowed to write to it.

---

## 1. What the research actually supports

Four findings, in decreasing order of how confident we can be:

**1 · Distributed beats massed, enormously.** The most robust finding in the literature.
Cepeda et al.'s meta-analysis covers 839 assessments across 317 experiments, and the effect is
large and consistent. This is not in dispute and it is the only part of the model we should
treat as settled.

**2 · The optimal gap scales with how long you want to remember.** Cepeda et al. (2008) found
the best inter-study gap is roughly **10–20% of the target retention interval** for delays of a
few weeks, **falling to about 5%** when the target is a year out. This is the finding that
should shape the ladder, and it has a specific consequence: **early gaps should be short and
they should widen faster than intuition suggests.** For a learner who wants a word available in
a year, a gap of a couple of weeks is roughly right — not a couple of days.

**3 · Expanding intervals beat equal ones, but only just.** Nakata (2015) is the first L2
vocabulary study to find a statistically significant advantage for expanding over equal
spacing, and reports it as *limited*. The literature overall is mixed. Meanwhile the **amount**
of spacing produced large effect sizes in the same study.

> Read those two together, because it is the practical takeaway: **how much you space matters
> far more than whether the spacing expands.** An expanding ladder is the right default, but it
> is not worth much engineering effort, and it is certainly not worth blocking a build on.

**4 · Modern schedulers beat fixed ladders — once you have data.** FSRS, now Anki's default,
fits a model per user and needs 20–30% fewer reviews than SM-2 for the same retention. But it
is fitted to review history: FSRS-6 has 21 trainable parameters trained on ~700 million
reviews. **tsumiki has no users and no review history**, so this is a Phase 2+ option, not a
starting point. Worth designing so it can be swapped in later — which mainly means storing
per-review outcomes and timestamps from day one, not just a current interval.

---

## 2. The proposed ladder

Word **recognition** only. There is no word production schedule (`word-kanji-scheduling-v1.md`
§3) and §6.4 did not change that — writing credit goes to the constituent kanji.

| Stage | Interval to next | Rationale |
|---|---|---|
| 0 · new | same session, then **1 day** | First recall must be soon; nothing survives a week from cold. |
| 1 | **3 days** | |
| 2 | **7 days** | |
| 3 | **16 days** | ~2.2× growth; at this point a month's retention wants a ~6-day gap and we are past it deliberately, aiming longer. |
| 4 | **35 days** | |
| 5 | **90 days** | ≈5% of a two-year horizon — Cepeda's long-retention ratio. |
| 6 · retired | **180 days**, then dormant | Still resurfaces via kanji returns and grammar lessons. |

Growth factor ≈ **2.2×**, deliberately between SM-2's 2.5 default and the more conservative
ratios that suit learners who study irregularly. It is a starting constant, not a finding —
see §5.

**Lapses.** On a failed recall, drop **two stages, not to zero.** Dropping to zero is the
classic Leitner behaviour and it punishes a single bad evening with weeks of re-drilling, which
is the most common reason people abandon SRS apps. Two stages back preserves most of the
spacing gained while still front-loading the repair.

---

## 3. How the two systems interact

The rule that keeps them from fighting:

> **A kanji-driven return counts as a review and advances the word's interval stage. The
> interval scheduler only queues a word that has nothing content-driven due.**

Consequences worth stating:

- **No double-counting.** A word that returns because 館 unlocked does not also get an interval
  review that week. It was just reviewed — that is what the return *is*.
- **The content schedule wins ties**, because it is pedagogically richer: it arrives with a
  reason ("there is more to practise here") and new material, where a bare interval review
  arrives with neither.
- **Words with many kanji need the scheduler least**, and words with none need it most. That is
  a pleasant inversion: kana-only words like いっしょに get no free returns at all, so the
  interval scheduler carries them entirely.
- **Passive sightings still feed nothing.** Unchanged from `word-kanji-scheduling-v1.md` §4. A
  word appearing in a grammar example the learner read past is not a review. Only deliberate
  retrieval advances a stage, or the coverage numbers drift upward on their own and stop
  meaning anything.

**On the current corpus this matters less than it should.** Only 29 of 93 taught words ever
enter the module and only 8 return events occur in the whole of Stage 1 (§6.4). So today the
interval scheduler does nearly all the work, and the elegant interaction above is mostly
theoretical. It becomes real as the promotion queue lands — another reason to prefer
multi-kanji words when promoting.

---

## 4. Where Lloyd's "unlearn" button fits

It is a **manual lapse to stage 0**, and it is the cheapest good feature in this document.

Two reasons it earns its place beyond user control. It is a **free signal** — a learner
volunteering "I don't actually know this" is higher-quality data than a scheduler's guess, and
it is exactly the input FSRS would want later. And it fixes the **false-positive problem** no
SRS handles well: a word recognised from context or from the shape of the exercise rather than
from memory. The learner knows the difference. Nothing else in the system does.

Pair it with the review area (§5 of `order-decisions-v1.md` §6.8) so that marking something
unlearned has somewhere obvious to happen.

---

## 5. What this is not

**These numbers are not evidence-based; the *shape* is.** The research supports: distribute
rather than mass, widen the gaps, widen them a lot, and expand rather than hold equal. It does
not tell us that stage 3 should be 16 days rather than 14 or 20. Anyone reading this later
should treat the ladder as a starting constant that wants tuning against real usage, in exactly
the way the word→kanji credit cap was left open for the same reason.

**Store outcomes, not just state.** Every review should record *when* it happened, *what* the
outcome was, and *which system queued it* (kanji return vs interval). None of that is needed
for the ladder to run. All of it is needed to fit FSRS later, or even to check whether the
ladder is working. Cheap now, impossible to backfill.

**One thing to watch in the eval sense:** if retention looks good, confirm it is not just that
words with many kanji get many free returns while kana-only words quietly rot. Report
retention split by return-count, or the average will hide the failure.

---

## 6. Stages and checked reviews (Session 36, decided by Lloyd)

**Three names over the seven rungs.** The learner sees a stage, not an interval:

| Stage | Rungs | Next check |
|---|---|---|
| **Seen** | 0 | 1 day |
| **Reviewing** | 1–3 | 3, 7, 16 days |
| **Known** | 4–6 | 35, 90, 180 days |

**Say-so puts a word on the path; only proof moves it into Known.**

- **"I've seen this"** (first visit, Meet this word card) puts the word at Seen and makes it due
  for a check at once. The learner still proves it in Review.
- **A practice visit** still advances a word, as §3 says a content return should, but it stops
  at the top of Reviewing (rung 3). A word already Known keeps climbing on visits.
- **Every interval review is a checked answer.** The old self-marked "Knew it" flashcard from
  board 09 was never built and is replaced by this.

**How the check is asked, by rung** (Lloyd: choose from four at the start, mix typing in, then
mostly typing as the word climbs):

| Rung | Chance of typing | Otherwise |
|---|---|---|
| 0 | 0% | choose the meaning from four |
| 1 | 35% | choose |
| 2 | 65% | choose |
| 3–6 | 100% | — |

Rung 3 is always typed because a right answer there crosses into Known, and a one-in-four guess
must not be able to do that. The mix is seeded by the word and its review count, so a question
never changes under the learner mid-answer.

- **Choose** shows the word (ruby where its kanji are not yet known) and four glosses. The three
  wrong ones come from words the learner has met, or from taught words when fewer than eight are
  met.
- **Type** shows the gloss and asks for the word, in kana, kanji, or romaji as an IME takes it
  (the dictionary's converter, copied verbatim and held identical by check-module-drift.py).
  Nothing displays romaji; the preview under the box shows the kana. Any taught word with the
  same gloss is accepted. One slip of a single sound (edit distance 1, words of three kana or
  more) gets one "Nearly" retry before it counts as wrong.

**Outcomes.** Right: up one rung, next check at that rung's interval. Wrong or "Not yet": the
§2 lapse, **two rungs down, never below Seen**, and back **tomorrow** (the repair is
front-loaded). "Unlearn" (§4) is still the full reset. Reviews pay no koban; the reward
economy was left alone.

**Queues.** A check no longer waits behind writing work: a word can be due for a check and have
kanji to practise at the same time, and it appears in both places. A practice visit resets the
check's due date, so it is never asked twice in a cycle.

---

## Sources

- [Cepeda, Pashler, Vul, Wixted & Rohrer (2006), *Distributed practice in verbal recall tasks: A review and quantitative synthesis*](https://augmentingcognition.com/assets/Cepeda2006.pdf)
- [Cepeda et al. (2008), *Spacing effects in learning: A temporal ridgeline of optimal retention*](https://laplab.ucsd.edu/articles/Cepeda%20et%20al%202008_psychsci.pdf)
- [Nakata (2015), *Effects of expanding and equal spacing on second language vocabulary learning*, SSLA](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/D1D796306985C52F9BE7A1200AC50DB9/S0272263114000825a.pdf/effects-of-expanding-and-equal-spacing-on-second-language-vocabulary-learning.pdf)
- [FSRS vs SM-2 comparison and benchmark summary](https://www.neurako.com/blog/fsrs-vs-sm2-spaced-repetition-algorithms-compared)
