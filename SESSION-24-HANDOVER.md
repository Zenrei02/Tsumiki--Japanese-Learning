# Session 24 — per-user error history

2026-09-06. One row: **Per-user error history keyed by `pattern_name`** (P1,
Phase 1 — MVP), which was task 3 of the Session 23 brief. Lloyd chose it over
the deploy. Commit `923c138`.

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

## What is deliberately not stored — argue with this

**The learner's sentence, and the span.**

The feature needs counts of patterns over time; it does not need the text. And
the text is the most sensitive thing this app touches: the checker is where
someone writes the Japanese they are *unsure about* — a message to a landlord,
an apology to a colleague. Keeping every one forever, synced under an account,
is a far larger promise than "we remember what you got wrong".

⭐ **The span is the real judgement call and it is an open question for Lloyd**
(§3 of the design doc). It is only a few characters and it would let the app show
a learner the actual shape they keep getting wrong instead of a category name —
more teaching, not less. But spans are slices of the sentence and enough of them
reconstruct a good deal of it. Declined for v1 and **written down rather than
omitted silently**, which is the difference this repo keeps paying for.

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
python3 test-error-history.py                    30 assertions, exit 0
python3 test-error-history.py --self-check       3 red — control fires
node naoshi-app/test/test-checker-records.mjs                exit 0
node naoshi-app/test/test-checker-records.mjs --self-check   6 red — control fires
```

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

**First load: 187.41 kB → 189.70 kB raw (59.90 → 60.68 kB gzip).** Measured
against a build of `HEAD` in a throwaway worktree, not estimated. The checker's
own chunk moves 9,411 → 9,469 bytes.

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
- **The span question** (§3 of the design doc) is Lloyd's, and nothing should be
  built on top of the store until it is answered — adding spans later is easy,
  removing them from histories already synced to accounts is not.
- **Nothing reads the store.** Deliberate, and the next rows in line: *Stats &
  progress tracking dashboard* and *Practice suggestion engine*, both currently
  Phase 3.
