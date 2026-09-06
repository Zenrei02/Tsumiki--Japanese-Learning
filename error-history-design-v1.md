# Error history — design v1

Session 24, 2026-09-06. The Notion row is *Per-user error history keyed by
`pattern_name`* (P1, Phase 1 — MVP). Session 23's brief gated it on accounts
landing and being verified; that gate is open.

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

One key, `checker-history-v1`, holding an object keyed by `pattern_name`:

```json
{
  "_checks":            [{ "d": "2026-09-06", "c": "polite", "n": 2, "id": "…" }],
  "particle-wa-vs-ga":  [{ "d": "2026-09-06", "c": "polite", "t": "fix", "id": "…" }],
  "te-form-request":    [{ "d": "2026-09-04", "c": "casual", "t": "unnatural", "id": "…" }]
}
```

Per entry:

| field | is | why it is here |
|---|---|---|
| `d` | day, `YYYY-MM-DD` | Trends are measured in weeks and months. A full timestamp would be a finer record of *when this person was writing* than any feature needs. |
| `c` | the register context of the check | Register errors are context-specific. A business-register note is not a fact about someone's grammar, and rolling it in with one would report a learner as getting worse for writing to a client. |
| `t` | tier — `fix` / `unnatural` / `note` | **A note is not an error.** Counting "worth knowing" alongside "fix" would make a learner who is being told more interesting things look like a learner who is making more mistakes. |
| `id` | stable, created once, on the device where the check happened | The whole basis of the union. |
| `n` | *(`_checks` only)* how many issues that check returned | The denominator. See §4. |

### Why keyed by pattern, and not a flat list

Three things fall out of it for free rather than being built:

1. It is literally what the row asks for.
2. `countProgress()` in `stats.js` counts an object's keys and **skips keys
   beginning with `_`** — so the count of distinct patterns a learner has met is
   already computed, by a function that already exists, and `_checks` is already
   excluded from it. That underscore rule was written for a different reason and
   turns out to be exactly the escape hatch this needs.
3. "How am I doing on は vs が" is a lookup, not a scan.

---

## 3. What is deliberately NOT stored, and this is the part to argue with

**The learner's sentence. Not the submission, and not the span.**

The feature named at the top needs counts of patterns over time. It does not
need the text. And the text is the most sensitive thing this app touches: the
checker is where someone writes the Japanese they are *unsure about* — a message
to a landlord, an apology to a colleague, something they would not post. Keeping
every one of those forever, and syncing them to a server under an account, is a
far larger promise than "we remember what you got wrong", and it is not a promise
this row asked to make.

**The span is the genuine judgement call, and it is being declined for now.** It
is only a few characters, and it would let the app show a learner the actual
shape they keep getting wrong instead of a category name — which is more
teaching, not less. But spans are slices of the sentence, and enough of them
across enough checks reconstruct a good deal of it. That is a decision about
someone's private writing and it should be made deliberately, once, in daylight —
not arrived at because storing it was convenient in Session 24.

**It is recorded here as an open question rather than omitted silently**, which
is the difference this repo keeps paying for.

---

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

- **The Checker becomes a section in `stats.js`**, so it appears on the Progress
  tab and — this is the part that matters — **can be reset**. A learner must be
  able to delete their own record of their own mistakes. Being unable to is worse
  here than for any other key in the app.

- **The count is stated as capability, per the standing rule.** The unit is
  `N patterns you've met` — the same voice as "31 kanji you can read" and "n
  grammar points met". It is a count of things that have been *explained to*
  them, not a tally of failures. `${n} corrections` would be the same arithmetic
  and the opposite message, which is the entire reason that rule exists.

- **The cap is 800 entries, trimmed after union, deterministically** (sort by
  day then id, keep the newest). Trimming before the union would make the result
  depend on which device trimmed first, and the union would stop being
  order-independent — which is the one property the sync exemption rests on.

---

## 6. What is not built here

Stats screens, practice suggestions and reminders are all downstream of this and
are their own rows. This session builds the record and the merge, and stops. A
store that is wrong is cheap to fix while nothing reads it and expensive
afterwards, so the record goes in first and alone.
