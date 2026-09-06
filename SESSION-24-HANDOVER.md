# Session 24 — per-user error history

2026-09-06. One row: **Per-user error history keyed by `pattern_name`** (P1,
Phase 1 — MVP), which was task 3 of the Session 23 brief. Lloyd chose it over
the deploy.

**Two passes.** `923c138` built the store and the merge. `eedd400` is Lloyd's
revision: store everything, give the learner a way back to their own sentences,
and move Progress out of the Account dialog into its own destination. **The
second pass reverses a decision the first one made** — that is §"What is stored"
below, and it is the part to read if you only read one.

---

## Read this first if you are picking up the deploy

**The Session 23 handover is out of date about the commit count**, because three
commits landed after it was written (`079c5bb`, `cff61a6`, `8475070` — the
learner-anchored week, the Account screen, and Lloyd's four changes). It says
four commits are waiting. **Ten are.** `origin/main` is still `bbf15c8`.

It is still **one** Netlify build and 15 credits, because Netlify builds the head
of a push and not each commit in it. Nothing has silently accrued cost.

**Production still serves a build with no Account UI.** Everything proven in
Session 23 was proven against the live Supabase backend through a *local dev*
frontend. The one claim only a deploy can settle is unchanged: that the
production bundle inlines `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

---

## What shipped

`checker-module.jsx` has carried this sentence since it was written:

> Every issue carries a `pattern_name`, which is the pedagogical backbone: it is
> what will later let the app say "your particle errors are down forty percent
> since May" instead of correcting the same mistake forever.

Nothing stored it. Now something does — and **nothing reads it yet**, on purpose.
Stats, practice suggestions and reminders are their own rows. A store that is
wrong is cheap to fix while nothing reads it and expensive afterwards.

New key `checker-history-v1`: an object keyed by `pattern_name`, each entry
holding the day (day-resolution, not a timestamp), the register context, the
tier, and an id. A reserved `_checks` bucket holds one entry per graded check.
Store in `naoshi-app/src/lib/errorHistory.js`; design in
`error-history-design-v1.md`.

---

## ⚠️ The finding, and it changed the merge rule

**Every key in the app until now is STATE — where the learner is.** Two devices
holding different state means one of them is behind, which is exactly why
`sync.js` rule 3 refuses to guess and asks.

**This is the first LOG — what the learner did, and when.** Two devices holding
different logs means **both are true** and neither is behind. Asking *"which
history do you want to keep?"* has no right answer, and every wrong one deletes
writing the learner really did — out of a number the app will later show them as
fact. **That is rule 3's own failure mode, one level down**: the same argument
that made the merge per-key rather than whole-document, applied once more.

So `checker-history-v1` is **unioned, never chosen between**. Three things keep
that from being a loophole:

1. **It is a named list**, `LOG_MERGERS` in `sync.js`, sitting next to the rule
   it qualifies — a thing you can read, not a behaviour you have to infer. One
   entry. Adding a second is a decision about someone's data, not a refactor.
2. **It is earned, not asserted.** `union(A,B) === union(B,A)` and
   `union(A,A) === A` are assertions in `test-error-history.py`. If either stops
   holding, the exemption is unearned and the test says so.
3. **A merger that cannot do its job returns `null` and the key falls back to
   ASKING.** Unparseable on either side, wrong shape, or throwing — all of them
   land on the question. Wrong toward asking, never toward a merged document the
   app invented.

**The subtle half is the cap.** The store is trimmed at 800 entries. Trim each
side *before* the union and the result depends on which device happened to be
fuller — order-independence quietly stops holding, **and every small case still
passes**. Trim runs after the union, sorts by `(day, id)` so ties break
identically on both devices, and the assertion for it is *at the cap* rather
than on a small map.

---

## ⭐ What is stored — and the decision that reversed

**Everything.** The submission, every issue with its span, correction and
explanation, the natural rewrite, the readings. Enough to re-render exactly what
the learner saw.

The first pass stored counts only, and argued for withholding the sentence —
the checker is where someone writes the Japanese they are *unsure about*, so
keeping every one forever under an account is a large promise. **Lloyd overruled
it, and the reasoning is better than mine was:** a learner told "you make
particle errors", with no examples, has been given a label rather than a lesson.
The examples *are* the teaching. The privacy instinct was aimed at the wrong
target — the risk it names is real for *sharing*, not a reason to keep someone's
own writing from them.

A truncated record would have been the worst of both, so there isn't one:
storing the span but not the sentence would make Review a lossy retelling of the
result screen *while still holding their Japanese*. All of the exposure, less of
the use.

The original argument is quoted in §3 of `error-history-design-v1.md` rather
than deleted. A design doc that quietly agrees with the code has stopped being
evidence of anything, and what a decision was made *against* is the part worth
keeping.

**What it obliges, none of it optional:** it syncs under the same RLS as
everything else and lands in the archive on every replace; it is in `KEYS`, so
Save/Restore carries it; and the learner can delete it — the confirmation names
it in plain words, because "Checker" does not obviously mean *every sentence you
have ever written*, and deleting your own writing should never be something you
discover you did.

---

## ⭐ Review, and why it repeats itself

**Grouped by error type, and a sentence appears under every type it was flagged
for.** One sentence with a particle problem, a te-form problem and a keigo note
appears in all three groups. **The repetition is the feature** — someone asking
"what do I keep doing wrong with particles" should not have to hunt through a
chronological list.

Inside a group, each example highlights **only the issue that group is about**.
A learner opening te-form is looking for one thing; lighting up all six issues
equally makes them find it again by eye.

Groups order by frequency. A group's tier badge is the tier it comes back as
**most often** — calling a forty-times `fix` a "note" because one of them was is
how a real problem gets a soft label. Chronology is the second view, one tap
away, because *"what did I write last week"* is a different and equally real
question.

**Two doors, one surface.** Review lives inside the Checker, because it is the
same material. Progress links through with a one-shot flag cleared by the
reader — the same pattern Home already uses for the grammar challenge.

---

## Progress is a place now

It was a tab inside the Account dialog. The drawer's own comment, written before
this change, is the argument: *"the drawer list answers 'where can I go', and an
account is not a place."* Progress **is** a place — where a learner goes to see
what they can do and read back their own work. Behind a sign-in-shaped door it
read as account administration.

Moved with it: the capability list, the koban, the dormancy nudge, the reset.
Stayed in Account: who you are and the two settings.

### Save/Restore: out of the header, whole in Account

They came out of the header — above every lesson on every screen — because
accounts do the job they were invented for, and a permanent pair of file buttons
is a permanent hint that the app might lose your work.

**They live in Account under BACKUP: both halves, together, named as the thing a
person would call it.** Not gated on being signed in — a learner with no account
is exactly the one whose progress lives in a single browser, and the file is the
only thing that survives clearing it.

**⚠️ They were briefly split across two screens, and that was worse than either
end-state.** Save stayed at the danger points, Restore moved to Progress, on the
reasoning that each belongs where it is reached for. But a backup you take on
one screen and put back on another is not a feature, it is two loose ends — and
**both halves passed their own check the whole time.** `smoke.mjs` now asserts
they appear *in the same element*, and the control splits them again to prove it
fires.

**Two Save buttons stay elsewhere**, as shortcuts to the same download at the two
moments something is about to be overwritten: beside the sign-in conflict choice
and beside the reset confirm. They matter because the guarantee is asymmetric —
the account's losing copy is archived by the database trigger and cannot be
skipped; the device's has had no net since the automatic download was removed.

**⚠️ Seeding that test broke two of my own assertions, both "passing for the
wrong reason".** The reset confirm had never been *reachable* in this bundle —
nothing was started, so `Clear selected…` was disabled and the assertion was
being **skipped**, not passing. Seeding a section made it run, and made *"Progress
must not be modal"* fail — with progress on disk the once-a-day Goals dialog
opens itself, and the check asked whether **any** modal was open rather than
whether **Progress's** content was in one. Both were green only because the
fixture was empty. Modal check now scoped to Progress's own content, the
checkbox is ticked before the gated button, and an unreachable confirm is a
failure rather than a console note.

---

## Two budgets, because the halves weigh differently

The **ledger** — one light entry per issue, keyed by pattern — is capped by
**count** at 800. The **checks** are capped by **bytes** first: 400 KB, 300 max.
The count says nothing about the weight; 300 haiku and 300 essays are the same
number and a hundredfold apart in what they cost a sign-in. Both are constants
at the top of `errorHistory.js`, meant to be raised if learners lose examples
they wanted.

**⚠️ The ledger outlives the checks on purpose.** When a check ages out its
ledger entries stay, so "you have made this error 40 times since May" is still
true after the earliest examples are gone. The group still appears with its full
count and **says** how many sentences are no longer kept — a group that quietly
shrank would read as an error that stopped happening.

A ledger entry's id is `<checkId>#<issueIndex>`: it points the light half at its
own example without storing the link twice, and keeps every id unique, which the
union depends on. The same pattern flagged twice in **one** check is two events
and must not collide.

---

## Why `_checks` exists, since it looks like bookkeeping

**A clean check is the best work a learner can do.** A check with no issues
writes no pattern entries, so without `_checks` the store would not change and
`commitIfWorked()` — which uses "the store changed" as its evidence — would
credit nothing. Writing a perfect sentence would be the one thing that counts as
nothing.

**And a count of errors with no denominator is not a trend.** "Eight particle
errors in May, five in September" is not improvement if they also wrote half as
much. It has to be recorded at the time; there is no way to recover how much
someone wrote in a month that has already gone.

---

## Two consequences elsewhere, both intended

**The checker gets its first progress key**, so it joins `PROGRESS_KEYS` and
"write and check one sentence" stops being dark in the quest chain. `activity.js`
listed exactly that gap under *"what is not covered"* — **the note is corrected
in the same commit rather than left to rot.** A promise that used to be true and
quietly stopped being true is the most expensive kind of comment in this repo.

**The checker becomes a section in `stats.js`**, which is how reset reaches a
key: a learner must be able to delete their own record of their own mistakes.
The count is capability voice per the standing rule — `N patterns you have met`,
things explained to them, not a tally of failures. It comes out right for free,
because `countProgress()` already skips keys beginning with `_` and `_checks` is
the store's only non-pattern bucket.

---

## Tests, and both controls fire

```
python3 test-error-history.py                    52 assertions, exit 0
python3 test-error-history.py --self-check       4 red — control fires
node naoshi-app/test/test-checker-records.mjs                17 assertions, exit 0
node naoshi-app/test/test-checker-records.mjs --self-check   13 red — control fires
```

`npm run smoke` gained a **PROGRESS** block: reachable from the drawer, renders
as a **page and not a dialog** (a modal would mean it was relabelled rather than
moved), carries all three of its parts, names itself in the header, and is
**gone from the Account dialog** — copied-not-moved is the failure that would
otherwise pass in both places. Verified red by making the progress branch
unreachable: 4 assertions fire.

**⚠️ The integration test caught a real inconsistency — in my own fixture**,
which is the more useful kind. Its issue spans did not sit at the offsets it
gave them, so the rendered sentence came out 私は本見ててです and three assertions
went red. `Marked()` renders `text.slice(cursor, issue.start)` between issues
and then the issue's own `span`, so a span that disagrees with its offsets
renders as a different sentence. Not a harness quirk: the checker's own header
says spans arrive *"already verified character-for-character"*, so agreement is
a real property of a real response — which makes comparing the **rendered** text
against the submission a check that `rehydrate()` still carries offsets through.
Fixture fixed, assertion kept, reason written down.

**Why there are two.** `test-error-history.py` slices the pure core out of the
shipping module and proves the merge is sound. It says **nothing about whether
anything ever calls it.** `checker-module.jsx` carries a no-op `recordCheck`
that `build-vite-app.py` deletes and replaces with an import — if that
substitution ever stops matching, the app compiles, the checker works, every
unit test stays green, and **nothing is ever recorded.** So the second test
drives the real generated `Checker.jsx` in a DOM against a stubbed backend and
reads the store afterwards. It also picks a non-default register, so a call
passing the wrong variable cannot pass by coincidence.

**⚠️ And that control was wrong on the first attempt, in this repo's recurring
shape.** Built from a bare temp dir, esbuild could not resolve
`react-dom/client` — so the control "fired", loudly, while proving nothing at
all about the call site. Something *did* go wrong, which is exactly what makes
that failure read as a working control. Same trap as `test-weekly-window.py`'s
`WEEK_LEN` landmark. The mutant now borrows the app's real `node_modules`, so
the only difference from a passing run is the missing call.

`test-progress-sync.fixtures.mjs` gained the dispatch half: a registered key
unions and is reported as `unioned`; an **unregistered** key of the same shape
still asks; a merger returning `null` or throwing falls back to asking; and
one-side-only and identical-sides are untouched by the exemption. Verified red
by disabling the dispatch (4 assertions), then restored.

---

## Guards

```
python3 check-storage-keys.py       13/13, exit 0   (sees checker-history-v1)
python3 check-module-drift.py       no drift, exit 0
python3 test-progress-sync.py       exit 0
python3 test-progress-migration.py  exit 0
python3 test-weekly-window.py       exit 0
python3 test-error-history.py       exit 0   (new)
node .../test-checker-records.mjs   exit 0   (new)
npm run smoke                       PASSED — 6 modules, accounts, engagement, goals
vite build                          clean
```

**First load: 187.41 → 194.91 kB raw** across the whole session; 189.70 after
the first pass, 195.21 after the second, and roughly flat through the
Save/Restore rearrangement. Measured against a build of
`HEAD` in a throwaway worktree, not estimated. Progress is in the entry chunk
**deliberately** — it is not lazy, because it is the screen a learner opens to
be reassured about their own work and a spinner there reads as "gone". The
Checker's chunk carries Review and is still deferred: 9.47 → 15.43 kB.

**Note the baseline moved.** The Session 23 handover's 174.93 kB is not the
figure to compare against any more — the three commits written after it account
for the rest.

### Sandbox notes for whoever runs these next

- `npm run smoke` still hardcodes an unwritable `/tmp/test-bundle.js`. The
  override used here: an explicit `npx esbuild … --outfile=$HOME/test-bundle.js`
  followed by `SMOKE_BUNDLE=$HOME/test-bundle.js node test/smoke.mjs`.
- `npm run build` fails in the sandbox on `EPERM … unlink dist/` — it empties
  `dist/` first and the sandbox forbids deletion by default. `dist/` is
  gitignored and untracked, a purely local artifact, so building to
  `--outDir $HOME/…` is a faithful check and leaves nothing stale that matters.

---

## Not done

- **Not deployed.** See the top.
- **The span question is answered** — everything is stored. What is now worth
  a second look instead is the two budgets: 400 KB / 300 checks is a guess about
  how much of their own writing a learner wants kept, and the honest way to
  settle it is to watch a real one fill up.
- **No trend line yet.** `summarise()` takes a window and returns errors per
  check, so "down forty percent since May" is a query away, but nothing renders
  it. The next rows in line: *Stats & progress tracking dashboard* and *Practice
  suggestion engine*, both currently Phase 3.
- **Nothing has been seen in a real browser**, only in jsdom. Review is the
  first surface in this app built out of stored data rather than live data, and
  jsdom does not tell you whether a group of forty sentences is pleasant to
  scroll.
- **The file is still the only rollback a learner has.** The account has no
  undo of its own: `naoshi_progress_archive` already holds every replaced
  document, and surfacing it as *"restore an earlier version"* is what would
  make the file genuinely optional rather than merely tidier. Not built.
