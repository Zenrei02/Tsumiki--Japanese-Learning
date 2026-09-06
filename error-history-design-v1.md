# Error history — design v1

Session 24, 2026-09-06. The Notion row is *Per-user error history keyed by
`pattern_name`* (P1, Phase 1 — MVP). Session 23's brief gated it on accounts
landing and being verified; that gate is open.

> **⭐ REVISED THE SAME DAY, and §3 is the part that changed.** v1 of this
> document argued for storing counts and withholding the learner's sentence.
> Lloyd overruled it: the examples are the teaching, and a learner cannot review
> what was never kept. A check is now stored whole, and the review surface that
> follows from it is §7. The original §3 argument is kept below rather than
> deleted — it is what the decision was made against, and a design doc that
> quietly agrees with the code has stopped being evidence of anything.

The purpose is one sentence, and it was written into `checker-module.jsx` long
before anything stored it:

> Every issue carries a `pattern_name`, which is the pedagogical backbone: it is
> what will later let the app say "your particle errors are down forty percent
> since May" instead of correcting the same mistake forever.

Everything below is in service of that sentence being answerable later, and of
it not being answerable *wrongly*.

---

## 1. The finding that shapes the design: this is the first LOG in the app

Every key the app stores today is **state** — where the learner is.
`known-kanji-v1` is a set of characters they can read. `n5-progress-v1` is how
far through the syllabus they are. Two devices holding different state means one
of them is behind.

Error history is not that. It is a **log** — what the learner did, and when. Two
devices holding different logs means **both are true**, and neither is behind.

This matters because of `sync.js`. Its rule 3 says: key present on both sides,
different content -> **conflict, do not pick, ask**. That rule is right, and the
reason it is right is recorded in the file: a learner who did kanji on their
phone and grammar on their laptop must not be asked to choose, because choosing
destroys half their own work.

Apply rule 3 to a log and the same failure comes straight back, one level down.
A learner who checks sentences on their phone at lunch and on their laptop in
the evening would be asked, on their next sign-in:

> Your correction history differs between this device and your account. Which
> one do you want to keep?

There is no right answer to that question. Both halves are real. Whichever they
pick, the app deletes writing they actually did — and, because history is the
input to trends, it deletes it from a number they will later be shown as fact.
"Your particle errors are down forty percent since May" is a lie if May is
missing because they once answered a dialog on a Tuesday.

**So the merge rule needs one narrow, declared extension: keys whose values are
logs are UNIONED, not chosen between.** Not a general escape hatch — a named
list, in `sync.js`, next to the rule it qualifies.

### Why this is not a loophole in the rule

The existing rule refuses to guess because a guess can destroy progress. A union
cannot: every entry from both sides survives, and no entry is invented. It is
the one merge that is safe without asking, and it is safe for a structural
reason rather than a hopeful one — entries are immutable and carry their own
identity, so "both sides" and "one side twice" are distinguishable.

The property that has to hold, and that the test asserts:
`union(A, B) === union(B, A)`, and `union(A, A) === A`. If either fails, the
union is doing something other than uniting and the exemption is void.

---

## 2. Shape

One key, `checker-history-v1`, holding two things of very different weight.

**The ledger** — one entry per issue, keyed by `pattern_name`. Light, and what
trends are made of.

**The checks** — the whole result, under the reserved `_checks` bucket. Heavy,
and what review is made of.

```json
{
  "_checks": [{
    "id": "k3f9x2ab8h1", "d": "2026-09-06", "c": "polite", "n": 2,
    "text": "私は本を見てです",
    "verdict": "FIX", "score": 4, "summary": "…", "rewrite": "私が本を見ます",
    "readings": [["本", "ほん"]],
    "issues": [{ "t": "fix", "p": "particle-wa-vs-ga", "span": "は",
                 "corr": "が", "exp": "…", "start": 1, "end": 2, "loc": true }]
  }],
  "particle-wa-vs-ga": [{ "d": "2026-09-06", "c": "polite", "t": "fix",
                          "id": "k3f9x2ab8h1#0" }]
}
```

**A ledger entry's id is `<checkId>#<issueIndex>`.** That is what lets the
ledger point at its own example without storing the link twice — and the ledger
is the half that has to survive longest, so its weight is the one that matters.
It also keeps every entry id unique, which the union depends on: the same
pattern flagged twice in one check is two events, and two entries.

| field | is | why it is here |
|---|---|---|
| `d` | day, `YYYY-MM-DD` | Trends are measured in weeks and months. A full timestamp would be a finer record of *when this person was writing* than any feature needs. |
| `c` | the register context of the check | Register errors are context-specific. A business-register note is not a fact about someone's grammar, and rolling it in with one would report a learner as getting worse for writing to a client. |
| `t` | tier — `fix` / `unnatural` / `note` | **A note is not an error.** Counting "worth knowing" alongside "fix" would make a learner who is being told more interesting things look like a learner who is making more mistakes. |
| `n` | *(checks)* how many issues came back | The denominator. See §4. |
| `text`, `issues`, `readings`, `rewrite` | *(checks)* the result, whole | So Review re-renders **what the learner saw**, not a summary of it. See §3. |

### Why the ledger is keyed by pattern

Three things fall out of it for free rather than being built:

1. It is literally what the row asks for.
2. `countProgress()` in `stats.js` counts an object's keys and **skips keys
   beginning with `_`** — so the count of distinct patterns a learner has met is
   already computed, by a function that already exists, and `_checks` is already
   excluded from it. That underscore rule was written for a different reason and
   turns out to be exactly the escape hatch this needs.
3. "How am I doing on は vs が" is a lookup, not a scan.

### Two budgets, because the halves weigh differently

`MAX_ENTRIES = 800` caps the ledger **by count**. `MAX_CHECK_BYTES = 400_000`
and `MAX_CHECKS = 300` cap the checks **by bytes first**, because the count says
nothing about the weight — 300 haiku and 300 essays are the same number and a
hundredfold apart in what they cost a sign-in.

**The ledger outlives the checks, on purpose.** When an old check ages out, its
ledger entries stay, so "you have made this error 40 times since May" is still
true after the earliest examples are gone. The UI says how many sentences are no
longer kept rather than showing a group that quietly shrank — a shrinking group
reads as an error that stopped happening.

Both numbers are constants at the top of `errorHistory.js` and are meant to be
raised if learners are losing examples they wanted. The cost is paid at sign-in,
where the whole document is fetched and upserted, not on every page load.

## 3. ⭐ What is stored — the decision that reversed

**Everything. The submission, every issue with its span, correction and
explanation, the natural rewrite, the readings.** Enough to re-render exactly
what the learner saw.

### The original argument, kept because it is what was overruled

> The feature named at the top needs counts of patterns over time. It does not
> need the text. And the text is the most sensitive thing this app touches: the
> checker is where someone writes the Japanese they are *unsure about* — a
> message to a landlord, an apology to a colleague, something they would not
> post. Keeping every one of those forever, and syncing them to a server under
> an account, is a far larger promise than "we remember what you got wrong".
>
> The span is the genuine judgement call… spans are slices of the sentence, and
> enough of them across enough checks reconstruct a good deal of it.

### Why Lloyd overruled it, and why he is right

**A learner told "you make particle errors", with no examples, has been given a
label rather than a lesson.** The examples *are* the teaching. Withholding
someone's own writing from them protects them from nobody — it is their
sentence, they wrote it, and they came here to be shown what was wrong with it.

The privacy instinct in the original argument was aimed at the wrong target. The
risk it names is real for *sharing* — a leak, a third party, an unrelated
service. It is not a reason to keep a learner's own writing from the learner.

**And a truncated record would have been the worst of both.** Storing the span
but not the sentence, or the pattern but not the explanation, would make Review
a lossy retelling of the result screen instead of the same screen again — while
still storing the learner's Japanese. All of the exposure, less of the use.

### What that obliges, and none of it is optional

- **It syncs to the account**, so it is under the same RLS as everything else
  and lands in the archive on every replace.
- **It is in `KEYS`**, so Save-to-file carries it and Restore brings it back.
- **The learner can delete it.** The checker is a section in `stats.js`, so it
  appears in Progress's reset list — and the confirmation names it in plain
  words, because "Checker" does not obviously mean *every sentence you have ever
  written*. Deleting your own writing should never be something you discover you
  did.

## 4. Why `_checks` exists

Two reasons, and the second is the load-bearing one.

**A clean check is the best work a learner can do.** A check that returns no
issues writes no pattern entries. Without `_checks` the store would not change,
and `commitIfWorked()` — which uses "the store changed" as its evidence of real
work — would not credit it. Writing a perfect sentence would count for nothing,
which inverts the thing being measured.

**A count of errors with no denominator is not a trend.** "Eight particle errors
in May, five in September" is not improvement if they also wrote half as much.
Every claim the top-of-file sentence promises needs errors *per check*, so the
denominator has to be stored at the time, alongside the numerator. Deriving it
later from anything else would mean guessing how much someone wrote in a month
that has already gone.

---

## 5. Consequences elsewhere, all of them intended

- **The Checker gets its first progress key.** `activity.js` currently carries
  this, under "what is not covered": *"the Checker writes no progress key, so
  'write and check one sentence' cannot be credited this way and stays dark."*
  That stops being true with this change, so the comment is corrected in the same
  commit rather than left to rot — a promise that used to be true and quietly
  stopped being true is the most expensive kind of comment in this repo.
  Adding `checker` to `PROGRESS_KEYS` lights up the quest-chain task and lets a
  check count toward the weekly rhythm target.

- **The Checker becomes a section in `stats.js`**, so it appears in Progress
  and — this is the part that matters — **can be reset**. A learner must be able
  to delete their own record of their own mistakes. That mattered when this was
  counts; now that it holds their sentences it matters far more, and the
  confirmation names what is being cleared in plain words (§3).

- **The count is stated as capability, per the standing rule.** The unit is
  `N patterns you've met` — the same voice as "31 kanji you can read" and "n
  grammar points met". It is a count of things that have been *explained to*
  them, not a tally of failures. `${n} corrections` would be the same arithmetic
  and the opposite message, which is the entire reason that rule exists.

- **Both caps are applied after the union, deterministically** (sort by day then
  id, keep the newest). Trimming before the union would make the result depend on
  which device trimmed first, and the union would stop being order-independent —
  which is the one property the sync exemption rests on. The assertions for it
  are AT each cap rather than on a small map, because the small case passes under
  a wrong implementation.

---

## 6. What is not built here

Trend lines, practice suggestions and reminders are all downstream of this and
are their own rows.

---

## 7. ⭐ Review: organised by error type

Lloyd's instruction, and the shape follows from it directly:

> whenever they are looking for the types of errors they're making, they should
> always have the ability to find examples of their own mistakes.

**Grouped by error type, and a sentence appears under every type it was flagged
for.** One sentence with a particle problem, a te-form problem and a keigo note
appears in all three groups. **The repetition is the feature.** Someone asking
"what do I keep doing wrong with particles" is not helped by a chronological
list they have to hunt through — they open the particle group and their own
particle sentences are in it.

Inside a group, each example is shown **with only the issue that group is
about** highlighted. A learner opening "te-form" is looking for one thing, and
lighting up all six issues equally would make them find it again by eye.

Groups are ordered by how often the type has come up, newest example first. A
group's tier badge is the tier it comes back as **most often** — reporting a
forty-times `fix` as a `note` because one of them was is how a real problem gets
a soft label.

Chronology is the second view, one tap away, because *"what did I write last
week"* is a different and equally real question.

**Two doors, one surface.** Review lives inside the Checker, because it is the
same material — the checker is where you write Japanese and where you look back
at the Japanese you wrote. Progress links through to it with a one-shot flag
(`naoshi-open-review`, cleared by the reader), the same pattern Home already
uses to open the grammar challenge. A progress screen that reports "you have met
12 patterns" and offers no way to see them has, again, given the learner a label
instead of a lesson.

---

## 8. Progress became its own destination

It was a tab inside the Account dialog. The drawer's own comment explains why
that was wrong, in a line written before this change:

> the drawer list answers "where can I go", and an account is not a place.

**Progress is a place.** It is where a learner goes to see what they can do and
to read back their own work. Behind a sign-in-shaped door it read as account
administration. It now sits among the destinations, above the rule.

What moved with it: the capability list, the koban, the dormancy nudge and the
reset. What stayed in Account: who you are and the two settings.

**Save/Restore came out of the header in the same session** — it sat above every
lesson on every screen, and a permanent pair of file buttons is a permanent hint
that the app might lose your work, which is not what shipping accounts should
say.

**It lives in Account, under BACKUP: both halves, together, named as the thing
it is.** A backup you take and a backup you put back. It is *not* gated on being
signed in — a learner with no account is exactly the one whose progress lives in
a single browser, and the file is the only thing that survives clearing it.

⚠️ **It was briefly split across two screens and that was worse than either
end-state.** Save stayed at the danger points and Restore moved to Progress, on
the reasoning that each belongs where it is reached for. But a backup you can
take on one screen and put back on another is not a feature, it is two loose
ends — and **both halves passed their own check the entire time**. `smoke.mjs`
now asserts they appear *in the same element*, and the control for it splits
them again.

The two Save buttons elsewhere — beside the sign-in conflict choice and beside
the reset confirm — stay, as shortcuts to that same download at the two moments
something is about to be overwritten. They matter because the guarantee is
asymmetric: the account's losing copy is archived by the database trigger and
cannot be skipped; the device's has had no net since the automatic download was
removed.

⚠️ **The reset now goes through `resetEverywhere()` in `stats.js`, not
`resetSections()`.** Clearing only the browser while signed in undoes itself on
the next sign-in — silently, with a success message, because the merge rule
treats an empty value as absent and lets the account's real value win. That trap
is written out at length in `stats.js`; the single entry point exists so that
Account and Progress cannot drift apart on it.
