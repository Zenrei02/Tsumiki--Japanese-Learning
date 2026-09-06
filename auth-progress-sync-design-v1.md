# Accounts and progress sync — the design

Session 23, 2026-09-06. Written because the code refers to it, and because the
rule it records is the kind that gets "simplified" by a later session that does
not know what it cost.

---

## The one constraint

**Signing in must not be able to lose progress.**

Not "should not". This app has already shipped silent progress loss once:
`n5-progress-v1` and `learner-depth-v1` were absent from the Save/Restore key
list for twelve days, and Restore printed *"Restored 7 saved items"* over a
restore that had dropped the largest module in the app. The message was true
about what it did and silent about what it missed.

Accounts are that same bug with a bigger blast radius, because now there are two
copies of a learner's work and something has to choose. A sign-in that quietly
replaces this device's progress with an empty account looks **exactly** like a
successful sign-in. There is no error, no log line, and the learner finds out
days later.

Everything below follows from that.

---

## The rule

Progress is compared **per key**, never as one document.

| case | what happens | can anything be lost? |
|---|---|---|
| key present on one side only | take it | no |
| key present on both, same content | nothing to do | no |
| key present on both, **different** | **conflict — ask** | not without an answer |

Three details that are load-bearing:

**"Same content" is canonical-JSON equality, not string equality.** Two devices
can hold identical state serialised in a different key order. Reporting that as
a conflict teaches the learner to dismiss the question, and a learner who
dismisses this question by reflex will dismiss the real one too.

**"Present" means present and non-empty.** A module that has been opened but not
used writes `{}`. Treating that as a rival to real progress raises a conflict
over nothing. The empty set is exactly `"" {} [] null undefined` — deliberately
short and literal. **`"0"` is not in it**: a koban wallet at zero is a value
someone earned their way down to, and pulling 120 over it would be theft.

**The union case is the common one and it must never ask.** Kanji on the phone,
grammar on the laptop is two partial states and no disagreement at all. Merging
per key gives the learner both. Whole-document sync would make them destroy half
their own work to answer a question they should never have seen.

## When it does have to ask

- No default. No pre-selected button. No timer.
- The differing items are named in the learner's language, not as storage keys.
- Everything that was **not** in dispute is already settled and is said to be,
  so the choice is visibly about three items rather than about everything.

## What happens to the side that loses

The two sides are protected differently, and the asymmetry is deliberate rather
than an oversight. Say it plainly wherever it comes up; do not let a comment or
a sentence of UI copy imply symmetry it does not have.

- **The account's copy is kept automatically.** `tsumiki_progress` has a
  `BEFORE UPDATE` trigger that files the outgoing document into
  `tsumiki_progress_archive` under the version it had. No client involvement, and
  no way for a client to skip it — see
  `supabase/migrations/20260906000000_progress_sync.sql`. So choosing *this
  device* is always reversible.

- **The device's copy is not.** It is saved only if the learner presses the
  button offered beside the choice, and the copy is a file written by
  `downloadProgress()` — which is what `exportProgress` / `importProgress` were
  built for, and why the merge writes back through `importProgress` rather than
  growing a second write path with subtly different filtering.

**This changed on 2026-09-06.** The first version downloaded the file
automatically before any local overwrite, and the reset did the same. Lloyd
removed both: a file appearing in someone's Downloads without being asked for is
intrusive, and an app that does it routinely teaches people to ignore the files
it produces — which is precisely the opposite of what a backup is for.

The cost of that decision is honest and worth stating: **choosing "keep my
account" without saving first really does discard this device's differing keys.**
The UI says so at the point of choosing rather than promising a rescue that no
longer happens. A promise that used to be true and quietly stopped being true is
the most expensive kind of comment in this repo, which is why this section names
the date.

## Order of operations, and why

On a clean merge the app **writes local first, uploads second**. If the upload
fails, the learner is left with *more* progress than they started with, never
less. The safe direction to be wrong in.

On a conflict, nothing local is written until the question is answered.

## Sign-out does not clear anything

The learner keeps studying on that device exactly as before, and the next
sign-in merges rather than replaces. Clearing on sign-out would make "sign out"
mean "delete my work", which is not what the words say.

---

## What is deliberately not here

- **No profile table.** Progress sync does not need one, and an unused table is
  surface with no caller.
- **No DELETE privilege** on either table. Deleting the account removes the rows
  through the foreign-key cascade, which is the path a learner actually wants.
- **No continuous sync.** Progress uploads on sign-in and after a settled merge.
  A real-time engine is a much larger thing and buys little for one learner on
  one device at a time.
- **No "newest wins".** Timestamps across two devices with two clocks are not a
  fact about which work matters more.

---

## What was tested, and how it was proven able to fail

`test-progress-sync.py` slices the merge core out of
`tsumiki-app/src/lib/sync.js` **at run time**, so it can never test a stale copy —
the same trick, for the same reason, as `test-progress-migration.py`.

The control, run before the first green run: `mergeProgress` was changed to
settle a conflict by silently preferring local, which is precisely the bug the
file exists to prevent. Seven assertions went red, and one of the seven was
**not** the bug — it was the assertion helper tripping over object key order on
a value that was correct. That helper now compares canonically, and the control
was re-run against the amended harness (six failures, all real) before the
result was believed.

RLS was exercised the same way against the live project, with two simulated
users: 16 checks green, then the same probes re-run **with RLS switched off** to
confirm they went red. Without that second run the 16 greens would have been
consistent with a table nobody could write to at all.

---

## The one thing that is not verified end to end

**Nobody has signed in.** Doing so would mean creating a real account, and that
was left for Lloyd rather than done automatically. What *is* verified: the
schema, the policies, the privileges, the archive trigger, the merge rule, the
client's unconfigured path, the configured path rendering against the real
Supabase project, and the auth callback's error handling.

What that leaves — and it is not nothing — is in
`SESSION-23-HANDOVER.md` under "Before this can work in production".
