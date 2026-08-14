# Reward system — points, announcements, earned lines, and the room

**Status:** design note, Session 11, revised same session after Lloyd's feedback (rule-scope
clarification, earned lines, koban approved, shop pulse). Extends the tracker row
*"Achievement markers + points currency (encounter / semi-mastery)"* (Phase 1 — MVP, P1),
whose `Notes` field carries the Session 9 decisions this note builds on. Read that row
first; it is the primary source. Nothing here is built. The room and pet remain **later
phase** — designed now only because pricing a sink is far easier against a known earn rate
than retrofitted.

---

## What is already decided (tracker row, Session 9 — not reopened here)

- Two achievement markers, both accumulation: **ENCOUNTER** and **SEMI-MASTERY**. Reaching
  one *offers* a short quiz — user choice, never a gate. Taking it earns points.
- Earn tiers, descending: word completes (20 Stage 1 events) > newly-unlocked kanji written
  in a known word (37) > the optional sentence use (37). Illustratively **10 / 3 / 2** —
  the *ratio* is the target, not the numbers. Sentence use is the best rate, never the
  biggest lump.
- Failure mode: over-rewarding the optional exercise turns "propose, don't dispose" into a
  gate. Points sparse, tied to thresholds that mean something.
- Budget under the sketch: **~385 points per stage** (200 + 111 + 74).
- Later phase: points buy vanity items — a pet, objects in a room — and the room grows with
  level, ending in a traditional house.

## The counts rule, scope clarified (Lloyd, Session 11)

Session 9 restated the standing rule as *no denominators — numerators are fine*. Lloyd has
now clarified the intent: **the ban is about lesson counts** — high double digits, possibly
triple, a daunting horizon. Short-term closed sets are different: **kana within a script,
or kanji within a step, may show denominators or fractions** ("42 of 46") because the goal
is near and shrinking. Restated:

> **Denominators are banned at the curriculum horizon (lessons, stages, the whole syllabus)
> and permitted at the sprint horizon (a kana script, the kanji of one step).**
> Numerators-only and capability percentages remain fine everywhere.

Second clarification, same session: **short countdowns to a designed checkpoint are also
permitted** — "2 more lessons left in this section." A remaining-count, but at the sprint
horizon and pointing at a nearby, deliberately-paced checkpoint, it motivates rather than
daunts. The ban's real target remains the long horizon: "12 of 40 lessons" and its kin.

---

## 1. Announcements — where points appear

**One home: the Flourish.** The finish flourish is the app's single sanctioned "well done"
moment (Session 11 extended it with the then-vs-now sentence). Point announcements are a
quiet appended line there, never a toast, never an interruption mid-exercise:

> +3 小判 — first time writing 人 in a word you know.

The copy grammar is fixed: **amount, then the capability that earned it.** The reason is
always a first ("first time writing…", "word now fully writable") because per the row, no
visit is ever a repeat — the copy must say what is new or learners will read the exercise
as repetition and skip on principle.

**Marker announcements** (encounter / semi-mastery) also land in the flourish, as an offer:

> You've now practised with 40 words. Want a two-minute quiz? It pays 小判.
> [Sure] [Not now]

"Not now" costs nothing and the offer recurs at the next threshold.

**Balance is visible only in the room/shop.** No global header counter. The score must not
sit on screen while the learner reads Japanese — the row's over-justification warning is
exactly about the score crowding out the intrinsic moment. You check your koban when you go
shopping, like a wallet. (The shop *entrance* may pulse — §5.)

## 2. The kana capability line (Lloyd, Session 11)

The flourish may state how much of the main kana is learned, with example words:

> You can now write 42 of the 46 hiragana — enough for ねこ, さかな, and たまご.

- Fraction or percentage both permitted under the clarified rule (sprint horizon, closed
  set). Fraction is probably *better* near the end — "44 of 46" makes the finish line
  visible in a way 96% does not.
- Per script (hiragana, katakana), not pooled. Same pattern later for "kanji in this step."
- Example words are computed at runtime: words from the module banks whose every character
  is in the learner's walked/traced set, preferring words unlocked by *this* lesson.
  Runtime selection only; nothing rewrites the modules.

## 3. Earned lines — "you are becoming someone who can do this" (Lloyd, Session 11)

Lloyd wants moments that make the learner feel *distinct*, not just praised. Three registers,
all requested in his words:

- **Difficulty**: "Most learners struggle with は/が for years — you just used it correctly."
- **Distinction**: "This is a skill people who study only for the JLPT never practice."
- **Bridge** (the inverse): "Many Japanese speakers can't do this in English. You can now
  do it in Japanese — you're the one who can bridge that gap."
- Plus **arc lines**: "You're most of the way to holding small talk" — progress named as a
  real-world capability, never as a lesson number.

**Architecture: identical to spotlights.** An authored library, keyed to specific lessons
and constructions, reviewer-verified, **never model-generated** — the claims are factual
claims about learners and about Japanese, and the most dangerous place to improvise is a
flattering statistic. The set is small and enumerable: the pain-point list (は/が,
potentials, conditionals, pronoun omission…) already names where "most learners struggle"
is *true*. A line the reviewer cannot stand behind does not ship.

**One recommendation against the brief:** drop the "many quit before completing X" family.
Two reasons: the claim is unverifiable at our scale, and naming quitting *primes* quitting —
it puts the exit door in the frame at the exact moment we want the learner looking forward.
The same specialness is available survivor-free: "you've passed the point where katakana
stops feeling foreign" says *you kept going* without mentioning anyone who didn't.
(Flagged as a recommendation — Lloyd's call.)

**Placement and scarcity:** flourish only, at most one earned line per flourish, and a given
line fires once per learner ever. Same bucket guard as spotlights: a line on every lesson
teaches learners to skip them. If a point announcement, a kana line, and an earned line all
qualify, the earned line wins — it is the rarest.

## 4. Currency — 小判 koban (APPROVED, Session 11)

The Edo-period gold coin. Why it fits: it is the coin the **maneki-neko** holds — giving
the later-phase pet an obvious species and making pet-and-currency one coherent image; and
猫に小判 ("koban to a cat") is a real proverb every learner eventually meets, so the
currency is itself a vocabulary item. Reads cleanly in UI: "+3 小判", no plural problems.

**花丸 hanamaru** — the flower-circle a teacher draws on good schoolwork, the culturally
native gold star — reserved for the **marker iconography**: encounter/semi-mastery badges
drawn as hanamaru sit naturally beside the hanko grading motif.

## 5. The room — sink design

**Space is earned; contents are bought.** The row says the room grows with level, ending in
a traditional house. Keep that split strict: room expansions (corner → room → engawa →
house) come from *markers* and are permanent; koban buy only the objects that fill the
space. Consequence: spending never shrinks anything. A learner who empties their wallet on
a kotatsu has lost no progress and no space — points stay a currency, markers stay a record.

**Every item is a vocabulary item.** The shop lists 畳, こたつ, 暖簾, 盆栽, 招き猫, 布団 —
Japanese name first, tap for reading and meaning (audio later, same pipeline as kana audio).
The shop is a reading exercise the learner *chooses* to do. This is the room's real defense
against being a Duolingo gem store: the decorations are content.

**The pulse (Lloyd, Session 11).** When the balance is significant, the shop entrance
pulses so the learner looks inside and finds something to work toward. Proposed trigger:
**the pulse fires when the balance first crosses the price of an item the learner has not
yet been able to afford** — especially into a new band — rather than at a raw coin total.
"Significant" then means *significant to this learner right now*: newly-affordable is what
makes looking inside worthwhile. Pulse once per crossing, clear on visit, home screen only —
never during an exercise, and never continuous (a permanently pulsing shop is a nag, and
the animation stops carrying information).

**Pricing bands against ~385/stage** (illustrative — ratios are the target, per the row):

| Band | Price | Feels like | Examples |
|---|---|---|---|
| Small | 20–40 | one good session | 湯呑, 座布団, plant |
| Medium | 80–150 | a focused week | 盆栽, 暖簾, lamp |
| Capstone | 300–400 | roughly a stage | こたつ, 屏風, the cat's own bed |

A capstone should always be visible but rarely affordable — wanting the kotatsu is the
retention mechanic; buying it is the then-vs-now proof that a stage of work happened. The
pulse at a band crossing is the moment that want gets refreshed.

**No curriculum-horizon denominators in the shop.** Never "12 of 30 items collected." The
room shows what you have; the catalog is browsed, not completed.

**First-open explainer (Lloyd, Session 11).** The first time the room opens, one short
card, dismissed once:

> Welcome home! This little room is all yours — fill it with whatever catches your eye
> in the shop. And as your Japanese grows, so will your home. You'll be moving somewhere
> bigger before you know it.

Warmed up from Lloyd's original wording at his request (Session 11), but the load-bearing
part is unchanged: the promise of a bigger home is tied to *your Japanese growing* —
capability — not to lessons finished or points earned. Any future copy edit must preserve
that framing.

**The pet: no tamagotchi guilt.** A pet that gets hungry or sad when the learner is away is
a streak mechanic wearing fur — obligation, not confidence, and the opposite of the
project's stated stance on guilt mechanics. The maneki-neko is *always* glad to see you: it
naps, it sits by whatever you bought most recently, it holds a koban when you earn one. It
reacts to presence, never punishes absence.

## 6. What earns outside the vocabulary module

Position: **kana lesson completion earns a small fixed amount — and nothing else does.**

Phase 0 learners live in the kana modules for weeks. If only the vocabulary module earns,
the economy starts as a locked door. A small payment at the kana flourish (the moment that
already "carries the weight") lets a Phase 0 learner furnish a first corner of the room
from day one. The guard: completion only, no per-trace or per-drill payments — that is the
over-rewarding failure mode applied to kana. Grammar quizzes, listening, the free pad: earn
nothing. Kana contributes a one-time, bounded pool; the per-stage ~385 from vocabulary
remains the steady-state rate everything is priced against.

**Amended, Session 14 (Lloyd):** one grammar surface now earns — the **daily review
challenge** (grammar module + Home card). Two tiers, each paying once per day, resetting at
midnight Tokyo time: single-mechanic **3**, multi-mechanic **5** (two mechanics, Stage 1) or
**8** (three–four mechanics once Stage 2 points are learned). Placeholders like all AP
numbers. Guards that keep this inside the §6 spirit: the daily cap bounds it (≤11/day even
maxed), the writing itself is unlimited and unpaid past the cap, and payment rides the
REAL grader only — the static build plays the challenge but pays nothing (Lloyd chose
deferral over paying on self-report). Wallet is the vocabulary module's
`achievement-points-v1`.

## 7. Post-publish: return thanks & the week-in-review (Lloyd, Session 11)

Both need durable per-user data — and the second needs an email address — so they are
**gated on publishing with accounts**. Filed now so they are not lost; tracker row exists.

Three pieces (Lloyd, Session 11 — the break message and the digest are both **emails**):

**1. The absence email.** After a gap (working definition: ≥5 days), one email, sent
**once per absence, never repeated** — a second one is a nag wearing kindness. Canonical
copy, Lloyd's wording, verbatim:

> It's healthy to take breaks from studying. We're here when you're ready to continue.

The tense is exactly right *because* it's an email — it reaches them while they're away.
Rules: **name the break and bless it**; never state how long they've been gone; no streak
language, no "we missed you" pressure, no ask beyond existing. A small authored pool in
this register, rotating; these make no factual claims, so review is a tone pass.

**2. The in-app return thanks.** When they do come back, the first screen thanks them for
persevering — **no koban** (Lloyd's explicit call): paying for returning would make
absence a transaction and thanks a wage. Same copy rules; register: *"Good to see you.
Coming back is the skill — everything else is just practice."* Once per return, in place,
no dismissal required.

**3. The weekly progress email.** **Weekly** (Lloyd, Session 11 — an earlier draft said
"deliberately random," but the breakable-ritual worry doesn't apply to email: a ritual is
only breakable when it depends on the learner showing up, and an email arrives
regardless). A plain list of what they actually did over the week: kana traced, words
practised, lessons finished, how far the kanji coverage moved. Accumulation only, no
denominators, capability framing where it fits. It reaches the learner *away* from the
app, where evidence of progress does its best work — and an email that says only what you
did, with no ask in it, is rare enough to be read. Computable today from `_firstAt`
stamps and the visit logs; only storage and delivery are new.

**Empty weeks** (Lloyd, Session 11): never a dressed-up empty list. Instead the slot
leads with the absence email — the break-blessing copy above — followed by **a small
tidbit about the Japanese language or culture**: something to connect with the country
even in a week with no study in it. Almost a newsletter. The tidbit pool is authored and
reviewed like everything else (it is the natural home for the *Japanese Language Trivia*
track the spotlight note parks at Phase 3, and kin to the culture lessons already in the
grammar module) — never model-generated claims about Japan. Reconciling with
once-per-absence: the **first** empty week sends absence email + tidbit; **further empty
weeks send nothing** until the learner returns — week three of the same blessing is a nag
(flagged: Lloyd may prefer tidbit-only continuation for long absences). Late phase, like
the rest of this section.

**Dependency:** accounts, server-side progress, email opt-in. Until then progress lives in
`window.storage` on-device and there is nowhere to send anything from.

## 8. Decisions Lloyd owns

1. ~~Currency name~~ — **decided: 小判 koban**; 花丸 for markers. In UI the coin is an
   **icon, not the word** (Lloyd, Session 11); item names stay in Japanese only where a
   pictured preview accompanies them.
2. ~~Fraction vs percentage for kana~~ — **resolved by the rule clarification**; fraction
   recommended near completion.
3. ~~Earned lines~~ — **approved, Session 11**: the three registers ship; the "many quit"
   family is **dropped** per the §3 recommendation.
4. ~~Pulse trigger~~ — **approved, Session 11**: newly-affordable crossing, once per
   crossing, cleared on visit.
5. ~~Kana-completion earning~~ — **in** (Session 11), completion-only as specified in §6.
6. Actual point numbers and prices — **deferred**; ratios above are targets, numbers are
   placeholders to be adjusted later.
7. ~~Room art direction~~ — **approved, Session 11**, per `room-demo-v1.html`: isometric
   2.5D, tatami grid, hand-drawn iso items, shop/room split with an inventory between them.

## Do not build yet

Markers + points + announcements are Phase 1 (per the tracker row). The room, shop, pet,
and pulse remain later phase. The earned-lines *library* can be authored and
reviewer-verified any time — it is content, not code — but firing logic ships with Phase 1
flourish work at the earliest.

**Implemented Session 11** (same session, later):

- **First-clear timestamps** land on every progress save in all five modules
  (`_firstAt` / `_stampEpoch`; stamps equal to the epoch predate stamping and mean "before
  we started counting"). The Phase 0 prerequisite is met.
- **Kana capability line + section countdown** live in both kana lesson flourishes — e.g.
  *"You can now write 10 of the 46 hiragana — enough for あい、いえ、あお. 3 more lessons
  in 'Getting started'."*
- **Then-vs-now (word level)** live in both kana flourishes: fires only when THIS lesson's
  tracing completes a word whose other characters first cleared ≥21 days earlier —
  *"ねこ — you have been building this word since July 21. Today it became yours."*
  Cannot fire before a learner's own history spans the window; silence until then is by
  design. The grammar-sentence version stays pending (sentence-bank plumbing, app level).
- **Markers** live in the vocabulary module: ENCOUNTER/SEMI-MASTERY thresholds
  (10/25/50/100/150/200, placeholders) offer a five-word self-marked check-in — never a
  gate, "Not now" costs nothing, no re-offer until the next threshold. Pays `AP.marker`
  (2, placeholder) per remembered word, riding Session 10's AP infrastructure.
- **Koban icon** replaces the "AP" label and toast text in the vocabulary UI.
- **Earned-lines library v1** drafted (`earned-lines-v1.json`, 15 lines, three registers +
  arc) — status DRAFT, reviewer sign-off required before any line ships; firing logic
  remains Phase 1.

Still pending: earned-lines wiring, the grammar-sentence then-vs-now, actual point
numbers/prices (deferred), and everything later-phase (room, shop, pulse, pet).
