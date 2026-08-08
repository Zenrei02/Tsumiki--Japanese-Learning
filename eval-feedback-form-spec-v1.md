# Eval Feedback Form — build spec v1

Phase 0 · Prompt & Eval · unblocks *Publish artifact and share link with reviewer*

> **Read §0 first.** Verified against `naoshi-prototype.jsx` (41 KB, Jul 31) and it changes more
> than the form.

---

## 0. Resolved: the tiers were never missing, the checker just never had them

Earlier in this session I recorded this as a lost feature. That was wrong, and the correction
matters for the tracker.

The three-tier system was built in Session 1 and still lives in `n5-practice.jsx` — both the
Practice grader and the sentence-practice Build grader, keyed on `type: "fix" | "unnatural" |
"note"`. The checker was always separate, using `severity: "error" | "suggestion"`. Session 1
noted the checker's indigo *suggestion* shares a colour with the practice module's *unnatural*
"so when both tools live in one app, the visual grammar stays consistent" — harmonisation was
deferred, not dropped. The tracker row is accurate as written.

**The mismatch was still real**, for a different reason: the eval workbook's grading codes were
built from the three-tier design (FIX / UNNATURAL / WORTH KNOWING / NONE), but the eval grades the
*checker*, which emitted two. The reviewer would have graded a two-tier tool against a three-tier
key.

**Closed as of this session.** The checker now carries all three tiers, sharing one `TIER` table
with the same type values, labels and colours as `n5-practice.jsx`. `SCHEMA_VERSION` is bumped to
`naoshi-2`. Two follow-ons: re-run the curriculum-gap audit script against the changed
`SYSTEM_PROMPT`, and confirm the workbook's *Expected tier* dropdown reads FIX / UNNATURAL /
WORTH KNOWING / NONE.

---

## 1. What this form is for

The artifact already collects the valuable data: per-issue **Yes / No / Not sure** verdicts,
serialised into a ~1.3 KB JSON payload. Artifacts cannot POST anywhere, so the human is the
transport — the form exists to receive that paste and nothing more.

**Design rule: the form asks only what the JSON cannot know.** Every question that duplicates the
payload costs response rate and buys nothing.

### Confirmed payload contents

`schema`, `id`, `submitted_at`, `writing_context`, `learner_text`, `naturalness`, `summary`,
`issues[]` (span, correction, category, severity, jlpt, pattern, explanation, `learner_verdict`),
`natural_version`, `readings`.

### What it cannot know

| Gap | Why the form has to ask |
|---|---|
| **Missed errors** | Per-issue verdicts measure *precision* only. If the model never raised an issue, there is no row to vote on — false negatives are structurally invisible to the artifact UI. |
| **Usefulness vs. correctness** | A correction can be right and useless. |
| **Who wrote the sentence** | Level segments the data. A Stage 1 learner and an N2 learner disagree with corrections for different reasons. |
| **Anything unanticipated** | One free-text field. |

### A note on the missed-errors question

Asking a learner "did it miss anything?" is weak instrumentation — not knowing what you got wrong
is *why you opened the tool*. Q4 asks about **unresolved uncertainty** instead, which learners can
actually answer: they hesitated, and the tool stayed silent. That is a signal, not a measurement;
true recall gets measured by the reviewer during blind grading. Ask it anyway — it's free.

---

## 2. Form settings

| Setting | Value | Reason |
|---|---|---|
| Collect email addresses | **Off** | The payload deliberately carries nothing identifying, and the in-app copy promises exactly that. Turning this on contradicts a promise already shipped. |
| Limit to 1 response | **Off** | One person submits many checks. Switches on automatically if you enable sign-in. |
| Response receipts | Off | — |
| Progress bar | Off | Single page. |
| Shuffle question order | Off | — |
| Responses → destination | **Link to a Google Sheet** | So responses join `naoshi-eval-v1.xlsx` on ref code. |

---

## 3. Fields

Two required, four optional.

### Q1 · Check reference code
- **Type:** Short answer · **Required:** Yes · **Prefilled** (see §5), so nobody types it
- **Help text:** `Shown next to the "Copy this check" button as "ref ABC123".`
- **Validation:** `^[0-9A-Z]{6}$` — **but fix the generator first, see §6.**

The code is also inside the JSON as `id`. Keeping it as its own column is worth the duplication:
extracting it from a JSON blob inside Sheets to do the join is miserable.

### Q2 · Paste your check here
- **Type:** Paragraph · **Required:** Yes
- **Help text:** `Tap "Copy this check" in the app, then paste. It should start with a curly brace.`
- **Validation:** `^\s*\{` with custom error `That doesn't look like a copied check — it should start with {`

### Q3 · Where are you in your Japanese?
- **Type:** Multiple choice · **Required:** No
- Just starting — still on kana
- Beginner (Stage 1, roughly N5)
- Upper beginner (Stage 2, roughly N4)
- Intermediate (Stage 3+, N3 and above)
- I'm a native or near-native speaker

Both framings deliberately. The app teaches Stages; testers from learner communities self-describe
in JLPT terms, and forcing them to translate loses responses. The last option separates
reviewer-grade responses from learner responses.

### Q4 · Was there anything you were unsure about that the tool didn't mention?
- **Type:** Multiple choice · **Required:** No
- `No, it covered everything I wondered about` / `Yes` / `Not sure`
- **Branch:** on **Yes** → Q4b

### Q4b · What was it? *(conditional)*
- **Type:** Paragraph · **Required:** No
- **Help text:** `Roughly which part of the sentence, and what you were unsure about.`

### Q5 · Which part of the feedback was most useful?
- **Type:** Multiple choice · **Required:** No
- The things marked **FIX**
- The things marked **CORRECT, BUT UNNATURAL**
- The things marked **WORTH KNOWING**
- The rewritten version at the end
- The furigana / readings
- None of it was useful
- I couldn't tell the tiers apart

Labels match the `TIER` table exactly. Two of these options carry the product thesis: UNNATURAL is
the tier LanguageTool and Bunpro don't offer, and if it doesn't win here the differentiation is
theoretical. The last option is the failure signal — if the tiers can't be told apart visually,
grader accuracy won't rescue them.

### Q6 · Anything else?
- **Type:** Paragraph · **Required:** No

---

## 4. Confirmation message

> Thank you — that check is now part of the data set that decides how this tool gets built.
> You can close this tab and carry on.

No "submit another response" link. The next check starts in the app.

---

## 5. Wiring `FEEDBACK_FORM_URL`

Currently `const FEEDBACK_FORM_URL = "";`. The file handles the empty case gracefully — the copy
button still works and the link simply doesn't render.

1. Build the form.
2. **⋮ → Get pre-filled link**, put `TESTCODE` in Q1, leave the rest blank, **Get link**.
3. Copy the URL: `https://docs.google.com/forms/d/e/FORM_ID/viewform?usp=pp_url&entry.123456789=TESTCODE`
4. Send it to me — I'll template the `entry.` ID so the code fills itself from `submissionId`.

**Prefill the ref code only, never the payload.** `learner_text` is the learner's own writing and
does not belong in a URL query string, and the JSON would breach URL length limits.

### Intended flow

Tap *Copy this check* → JSON on clipboard → form opens with the code already filled → paste →
submit. One paste, no transcription.

The button already handles a blocked clipboard with a `Copy blocked` state — but nobody has
exercised it in a published sandbox. Test it in the same sitting as publishing; that closes
*Verify clipboard + download inside the artifact sandbox* for free.

---

## 6. Two code fixes before this goes live

**A. The ref code generator can emit fewer than six characters.**

```js
const newSubmissionId = () => Math.random().toString(36).slice(2, 8).toUpperCase();
```

`Math.random()` occasionally returns a value with a short base-36 expansion — `0.5` becomes
`"0.i"`, so `slice(2, 8)` yields a single character, and a return of `0` yields an empty string.
Rare, but a short code fails the Q1 regex and orphans the response, and an empty one is
unjoinable. Uniform six characters:

```js
const newSubmissionId = () =>
  Math.floor(Math.random() * 36 ** 6).toString(36).toUpperCase().padStart(6, "0");
```

No collision handling needed at eval scale — 36⁶ is ~2.2 billion.

**B. `SCHEMA_VERSION` is inside the payload** as `"schema": "naoshi-1"`, so no form field is
needed. It's bumped by hand, and the in-file comment says to bump it whenever `SYSTEM_PROMPT`
changes. That's now the second thing riding on that event — the curriculum-gap audit script is the
first. Both are easy to forget and both silently corrupt data when missed. Worth a comment block
at the head of `SYSTEM_PROMPT` listing what has to happen when it changes.

---

## 7. Do this before publishing

Publishing early doesn't break anything — the link just hides. The real cost is that a tester
copies a check and has nowhere to send it, which is the one action you most want not to waste.

Order: **run `build-feedback-form.gs` → send me the prefill URL → publish → click the copy and
download buttons yourself in the published sandbox → share with reviewer.**

§6A (the ref code generator) and the tier port are both already applied in the delivered
`naoshi-prototype.jsx`.
