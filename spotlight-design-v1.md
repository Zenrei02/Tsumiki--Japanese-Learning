# Spotlights — teaching the places where the language allows several answers

**Status:** design note. Nothing built. Deliberately parked behind Phase 0 — see
*Do not build this yet* at the bottom.

## The gap

Naoshi has four verdicts — FIX, UNNATURAL, WORTH KNOWING, NONE — and all four are
**grades**. Each answers "how wrong was this?"

That leaves no way to say something that isn't a grade at all. When a learner
writes `日本語を話せます`, the honest answer is *"that's fine, and there's a reason
it's interesting"* — and the tool's only options are to invent a correction or
say nothing. It says nothing. The learner who wrote the most instructive sentence
in the set gets the same blank response as one who wrote a boring correct one.

Silence is currently indistinguishable from *nothing happened here*.

Found Aug 6 2026 running regression R6, where `を好き` fired and `を話せます` did
not, both from the same watchlist bullet. The tool was right to discriminate.
It had nowhere to put the reason.

## What a spotlight is

A short explanation attached to a span, carrying **no verdict and no score
impact**. Not a fifth tier — tiers are grades, and this is deliberately not one.

The content is already specified by rule 7, which requires naming the alternative
and saying *when a native would choose each*. A spotlight applies that same
teaching to the case where no issue is raised.

Roughly:

> **日本語を話せます** — both work here.
> `が` is the neutral, textbook choice and puts the focus on the ability itself.
> `を` shows up when the action is more in view than the capacity — it is common
> and correct in modern Japanese, and this is a place where textbooks are stricter
> than speakers are.

## Three design constraints

**1. It must not touch the score.** If a spotlight moves the hanko even slightly,
learners learn to avoid interesting constructions. Spotlights are commentary on a
correct sentence, so a spotlighted sentence must score identically to a plain one.

**2. It must not become a bucket.** Exactly the failure the note tier already has
a guard for: hand a model a low-stakes slot and it will fill it. Rule 7 already
carries *do not manufacture alternatives*. A spotlight on every sentence is worth
less than none, because it teaches the learner to skip them.

**3. It cannot be model-generated.** ⭐ **This is the load-bearing decision.**

The set of genuinely ambiguous constructions is small and enumerable — が/を with
potentials, は/が under contrast, 〜てもらう/〜てくれる, 〜たら/〜ば/〜と/〜なら, に/で
with locations, quantifier placement, 〜ている as state vs progressive. Perhaps
twenty to forty entries covering most of what a learner meets before N2.

So a spotlight should be **a lookup, not a generation**: authored once, verified
by the reviewer, stored keyed on the construction. The model's only job is
detecting that the construction is present — which it already does, since
`pattern_name` is emitted on every issue today.

Consequences, all good:

- **It cannot hallucinate.** The most dangerous place to improvise is precisely
  where the language is subtle.
- **It costs nothing per check** — no extra output tokens.
- **The reviewer signs off once**, not per learner sentence, which matters when
  reviewer time is the project's scarcest input.
- **It never inflates the invented-error rate**, because it isn't an issue.

## Where it connects

- **Pain-point lesson track** (Phase 3, already filed) — the cross-cutting
  non-JLPT lessons: pronoun omission, は/が, and now this. A spotlight is the
  in-context teaser; the lesson is the full treatment. Spotlight deep-links to it.
  That is a real retention mechanic rather than a bolted-on one.
- **Japanese Language Trivia** (Phase 3) — adjacent but distinct. Trivia is
  interesting-but-not-load-bearing. A spotlight is load-bearing: it prevents the
  learner absorbing a false rule.
- **Per-user error history keyed on `pattern_name`** (Phase 1) — the same key
  spotlights would use. Built once, used twice.

## Open question — free or paid?

Lloyd floated locking spotlights to a higher tier. Genuinely open, and worth
deciding deliberately rather than by default.

**For paid:** it is real, authored, reviewer-verified content, and it is the
strongest reason someone would pay for a tool whose corrections are free.

**Against:** it gates the single most pedagogically valuable moment the tool
produces. The free tier would teach *you were wrong*; the paid tier would teach
*here is how the language actually works*. That is a slightly uncomfortable split
for a product whose stated差別化 is pedagogical depth.

**Likely resolution:** show that a spotlight exists on the free tier — the span
marked, the one-line "both work here" — and put the full contrast plus the lesson
link behind the tier. The learner sees the value rather than being told about it,
and nobody absorbs a false rule for lack of paying.

## Do not build this yet

⚠️ **This must not touch `SYSTEM_PROMPT` before the bake-off runs.**

Session 5 shipped four prompt revisions immediately before validation and
invalidated everyone's feel for the tool's calibration; the regression set exists
because of it. A spotlight changes what the tool emits on *correct* sentences —
which is exactly the half of the eval that measures the invented-error rate, the
headline Phase 0 metric and the gate on the GO/TUNE decision.

Adding it now means re-running the eval. Ship the eval, then build this.

Authoring the entries also generates new Japanese teaching content, which goes to
the same reviewer already holding the key check, the blind grading, and 131
unreviewed curriculum points.

**Do now:** nothing but this note.
**Do after the go/tune decision:** pick the first five constructions, author them,
send with the next reviewer batch.
