# Prompt regressions — SYSTEM_PROMPT behaviour checks

Small, fixed set of sentences run by hand through the checker after any
`SYSTEM_PROMPT` change, to confirm the rule the change was made for still holds.

**Why this file exists.** Session 5 shipped four `SYSTEM_PROMPT` revisions
(`naoshi-1` → `naoshi-4`) and closed by flagging that any feel for the tool's
calibration was now out of date, with the `が…くれる` sentence named as the one to
re-run. That sentence was never written down — only described. Six days later it
could not be recovered from the record, only reconstructed. So: the regression
lives in the repo, not in a journal sentence or in anyone's memory.

**Current version under test:** `naoshi-4`
**Last run:** *(not yet run against the published build)*

---

## How to run

1. Open the published build:
   <https://claude.ai/public/artifacts/74f60481-df68-454e-a453-80b32073a958>
   (Requires a free Claude account — the artifact calls the API at runtime.)
2. Paste the sentence, run the check.
3. **Copy this check** → confirm `"schema": "naoshi-4"` in the JSON.
4. Compare against *Expected* below. Record the result in the log at the bottom.

Takes about five minutes for all six.

**Read the tier, not just the words.** Several of these pass or fail on which
tier fired, not on whether the explanation sounds reasonable. R1 in particular
produces sensible-sounding prose either way — FIX with a good explanation is
still a failure.

**The published artifact does not run the model you think it does.** The artifact
API proxy pins the model regardless of the requested string (Session 5 probe), so
these check *prompt* behaviour, not model behaviour. That is the intent — the
tiers are prompt-assigned. Model comparison is the bake-off's job.

---

## R1 — Defensible phrasing is not a "fix"  ⭐ the one Session 5 asked for

**Guards:** Critical rule 7 (`DO NOT ASSERT A SINGLE RIGHT ANSWER…`), added in
`naoshi-4`. This rule changes tier assignment, not just wording, so it is the
highest-value regression in the set.

**Input:**

```
友達が引っ越しを手伝ってくれました。
```

**Expected:** `NONE` — or at most `UNNATURAL`.

The sentence is correct. `〜てもらう` (友達に引っ越しを手伝ってもらいました) is a
valid alternative differing in *perspective*, not correctness: `くれる` frames the
friend as the giver of the favour, `もらう` frames the speaker as the receiver.
If the tool raises it at all, the explanation must name the alternative **and say
when a native would choose each**.

**Fails if:** tier is `FIX`. That is the exact Session 5 failure — asserting
`に…もらう` as a correction where it is a preference. Also fails if it offers
`〜てもらう` with no reason to prefer it; rule 7 calls a bare alternative noise.

> ⚠️ **AI-authored, unverified.** The original sentence Lloyd wrote was not
> recorded, so this is a reconstruction of the same construction. Flag it to the
> reviewer with the eval content — or replace it with the real one if it can be
> recovered from the Session 5 chat.

---

## R2 — Correct keigo is left alone

**Guards:** Critical rule 1 (`DO NOT invent errors`). The invented-error rate is
the headline Phase 0 metric, and keigo is where a checker is most tempted to
"fix" something already right.

**Input:**

```
会長にご報告を申し上げます。
```

**Expected:** `NONE`. Empty issues array.

**Fails if:** anything is raised — particularly a "correction" of `を` or of the
humble form. Source: eval row **E06**, keyed `NONE`, in Step 2 verification.

---

## R3 — Zero notes is the correct output for a good sentence

**Guards:** the note-restraint clause (`"note" IS NOT A BUCKET FOR MARGINAL
OBSERVATIONS`), added in `naoshi-2`. Session 5: `note` is the cheapest tier to
over-produce, and if the invented-error rate comes in high this is the first
place to look.

**Input:**

```
お昼はスーパーでお弁当を買って食べました。
```

**Expected:** `NONE`, zero notes.

**Fails if:** any `WORTH KNOWING` note appears. Nothing here would change what
the learner writes next time. Source: eval row **E01**, the clean control.

---

## R4 — Kana where kanji is standard is a note, never a fix

**Guards:** `Never mark correct kana usage as a "fix"`. This is the tier that
feeds the kanji module's coverage work, so it needs to fire — but as a note.

**Input:**

```
きのうから頭がいたいです。
```

**Expected:** `WORTH KNOWING` on `いたい` → `痛い`, naming the kanji's JLPT level.
`きのう` → `昨日` is also legitimate.

**Fails if:** tier is `FIX` (inverts the tier's meaning — the learner is told
correct writing was wrong), or if nothing fires at all (the note tier has gone
silent, which R3 would not catch).

> ⚠️ **AI-authored, unverified.**

---

## R5 — Spans are the smallest substring, and never nested

**Guards:** the span-tightening rule added in `naoshi-4` after nested spans were
found silently dropping an issue card.

**Input:**

```
私は昨日私の友達に会いました。私はとても嬉しかったです。
```

**Expected:** two or more issues (pronoun overuse, `私の` with an obvious
possessor). Each span marks the pronoun itself, not the surrounding clause. Every
issue card is tappable and highlighted.

**Fails if:** one span swallows most of the sentence, or a card exists that cannot
be reached by tapping, or a card lands in the "not highlighted" list. Source:
`SAMPLES[1]` in `tsumiki-prototype.jsx` — already a built-in sample.

---

## R6 — が/を trap fires as a particle issue

**Guards:** the L1-interference watchlist entry for potential forms and
`好き/わかる/できる`. Watchlist coverage is what the product's differentiation
claim rests on.

**Input:**

```
私は日本語を話せます。すしを好きです。
```

**Expected:** `FIX` on both — `日本語が話せます`, `すしが好きです` — tagged
`particle`, with the construction named in `pattern_name`.

**Fails if:** either is missed, or `pattern_name` is absent (per-user error
history is keyed on it, so a blank breaks a Phase 1 feature downstream).
Source: `SAMPLES[4]` in `tsumiki-prototype.jsx`.

---

## Run log

| Date | Version | R1 | R2 | R3 | R4 | R5 | R6 | Notes |
|---|---|---|---|---|---|---|---|---|
| Aug 6 2026 | `naoshi-4` | ✅ | ✅ | ✅ | ✅ | ⚠ | ⚠ | Full set. **Invented-error count: 0.** R5/R6 span and coverage issues below. |

Add a row per run. A failing regression is a tracker row, not a note here —
the point of the log is to make prompt drift visible across versions.

### Automation limit — R1 to R4 must be run by hand

The published artifact runs in a cross-origin iframe on `claudeusercontent.com`.
Browser automation can *click* into it but cannot *type* into it — keystrokes go
to the parent frame and are lost. Confirmed: typing works on claude.ai itself,
and clicking works inside the artifact (the sample buttons fire).

So R5 and R6, which use the prototype's built-in `SAMPLES`, can be driven
automatically. R1–R4 use custom sentences and need a human at the keyboard.
Not worth engineering around for four sentences.

---

## Aug 6 2026 — findings

**Headline: the Session 5 regression does not reproduce, and nothing was
invented.** R1 came back clean, and R2/R3 — the two invented-error probes, testing
the metric that gates GO/TUNE — both returned empty issue arrays. All six ran on
`schema: naoshi-4`.

### R1 ✅ — `が…くれる` is no longer graded FIX

Input: `友達が引っ越しを手伝ってくれました。`
Result: `issues: []`, naturalness 5, `natural_version` identical to input.
Summary: *"This sentence is natural and grammatically correct — well done."*

The Session 5 bug is gone. Rule 7 did its job on the tier.

**But it surfaced the spotlight gap in its purest form.** Rule 7 requires naming
the alternative and saying when a native would choose each — and it says to do
that *"inside `explanation`"*. With zero issues there is no `explanation` field,
so the `〜てくれる` ↔ `〜てもらう` contrast — the richest teaching moment in all four
sentences — had nowhere to go. The learner wrote something genuinely interesting
and got "well done."

This is direct evidence for `spotlight-design-v1.md`: rule 7's teaching is
currently reachable only through the failure path. Get the sentence *right* and
the explanation disappears.

### R2 ✅ — correct keigo left alone

Input: `会長にご報告を申し上げます。`
Result: `issues: []`, naturalness 5.
Summary: *"Impeccable keigo — the phrasing is exactly what a native speaker would
use when formally reporting to a chairperson."*

No invented error on the construction most likely to attract one. Eval row E06.

### R3 ✅ — zero notes on a good sentence

Input: `お昼はスーパーでお弁当を買って食べました。`
Result: `issues: []`, naturalness 5.

The note-restraint clause holds. Eval row E01.

### R4 ✅ — kana-for-kanji is a note, with two things worth reading

Input: `きのうから頭がいたいです。`
Result: one issue — span `いたい` → `痛い`, category `orthography`, **type `note`**,
`pattern: kana vs. standard kanji`, JLPT named. Naturalness 4.

Passes exactly: right tier, right span, level named, not a FIX.

Good restraint too — `きのう` was *not* also flagged, and `natural_version` keeps
`きのう` while changing `痛い`. Two notes on a twelve-character sentence would have
been the over-annotation the clause exists to prevent.

**✅ N3 is accepted.** 痛 as N3 matches the common unofficial lists, and there is no
official post-2010 JLPT kanji list to appeal to. `freq-data/kanjidic-misc.json`
carries `jlpt_old: 2, grade: 6`, which is a different scale, not a contradiction.
Treat N3 as expected.

**✅ 痛 missing from `kanji-module.jsx` is expected too** — the generated order in
`kanji-order-v1.json` has not been applied to the module yet; that is a tracked
authoring pass, not a defect. Revisit once it lands.

**⚠️ The real finding — the note tier conditions on a variable that isn't in scope.**

The tier's own definition reads:

> a word written in kana where the kanji is standard **and at or near the
> learner's level** (e.g. いたい → 痛い, naming the kanji's JLPT level)

The checker has no learner level. It runs standalone — no access to
`known-kanji-v1`, `known-words-v1`, or grammar progress. So the model cannot
evaluate the condition it has been given, and it resolved the gap by assuming one:
*"commonly expected in written Japanese at intermediate level."*

Nobody told it the learner was intermediate. Note that the prompt's own worked
example for this rule is `いたい → 痛い` — the exact sentence that exposed it.

**Why this is not a small thing:** *no learner data* is not a degraded fallback,
it is the **first-run state for every single user**. Every learner's first check
has no history. So this path is the one most people will ever see.

**The principle it points to:** with no learner data, the checker should describe
**the language**, not **the learner**.

- ❌ "commonly expected in written Japanese at intermediate level" — asserts where
  the learner is
- ✅ "痛い is the standard written form; the kanji 痛 is around N3 on the common
  lists" — states a property of Japanese, true for any reader

With data, the note gets *better* rather than merely safer: if `known-kanji-v1`
contains 痛, it becomes *"you already know this one"*; if it sits at the frontier,
it stays a note; if it is far beyond them, it may be worth no note at all.

Filed as its own tracker row. **Not a fix to make now** — it changes what the tool
emits on correct sentences, which is the invented-error half of the eval.

### R5 ⚠ — nesting fixed, spans still loose

Input: `私は昨日私の友達に会いました。私はとても嬉しかったです。`
Result: 2 issues, both CORRECT BUT UNNATURAL / Naturalness / N5. Score 3/5 CLEAR.

- `私の友達` → `友達` — pattern `unnecessary 私の: obvious possessor`. Tight span. ✓
- `私はとても嬉しかったです` → `とても嬉しかったです` — pattern
  `pronoun overuse: subject drop after establishment`. **Span is the whole second
  sentence** when the problem is the two characters `私は`.

**Passes** on what Session 5 actually broke: no nesting, both cards tappable and
highlighted, nothing in the "not highlighted" list.

**Fails** the smallest-substring half of the rule. Possibly by design on the
model's part — a pure deletion rendered as `私は → (omit)` is what R6 produced for
the same pattern, so the wide span here is inconsistent rather than principled.
Worth deciding which rendering is wanted before this becomes a reviewer question.

**Loose end:** the NATURAL VERSION is `昨日友達に会いました。とても嬉しかったです。`
— it also drops the *opening* `私は`, which no issue card flagged. The rewrite is
making a change the learner has no card explaining.

### R6 ⚠ — the 好き trap fires, the potential-form trap does not

Input: `私は日本語を話せます。すしを好きです。`
Result: 1 fix, 1 unnatural. Score 3/5 CLEAR.

- `を好き` → `が好き` — FIX / Particle / N5, pattern `が vs を: 好き construction`.
  Exactly as expected. ✓
- `私は` → `(omit)` — UNNATURAL / Naturalness / N5, pattern `pronoun overuse: subject drop`.
- **`日本語を話せます` was not flagged**, and the NATURAL VERSION keeps `日本語を`.

`pattern_name` is present on every card, so the Phase 1 per-user error history
dependency is satisfied.

**The miss is arguable, and that is the interesting part.** The L1 watchlist names
potential verb forms explicitly (`日本語が話せる`). But `〜を話せる` is widely used and
defended in modern Japanese, so rule 7 — do not assert one answer where the
language allows several — points the other way. The tool made a *consistent*
choice: it declined to flag it and left it in the rewrite.

This is a prompt conflict, not a bug: the watchlist says flag, rule 7 says don't.
**Do not resolve it here — it is a question for the native reviewer**, and it is
exactly the kind of thing the Phase 0 eval exists to settle. If the reviewer says
`日本語を話せます` is fine, the watchlist entry needs narrowing; if they say it is an
error, rule 7 needs an exception for watchlist items.
