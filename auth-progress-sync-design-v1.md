# Accounts and progress sync — the design

Session 23, 2026-09-06. Written because the code refers to it, and because the
rule it records is the kind that gets "simplified" by a later session that does
not know what it cost.

> **⚠️ AMENDED 2026-09-16 — read "What changed, and why" at the bottom before
> this document.** Two of the decisions recorded below were reversed on purpose:
> *No continuous sync* and *ask on every conflict*. The reasoning here is not
> struck out, because it was right about the app it was written for — what
> changed is the app. The amendment says which sentences no longer describe the
> code and why, so that neither the old rule nor the new one can be adopted
> without its argument.

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
  **⚠️ REVERSED 2026-09-16 — see the amendment. This is the sentence that made
  the conflict prompt fire on an ordinary refresh.**
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


---

# Amendment — 2026-09-16

## What changed

1. **Progress saves continuously**, debounced off the single storage setter in
   `tsumiki-app/src/lib/storage.js`, flushed when the page is hidden or closed,
   hurried at a milestone. New file: `tsumiki-app/src/lib/autosave.js`.
2. **Once a device has joined an account, a load takes the account's copy**
   without asking. The conflict panel is reached only on the **first** sign-in
   on that device.

They are one change. Either alone is a bug — see "Why they cannot be split".

## Why the old rule had to go

Not because it was wrong. Because the cadence it assumed stopped being true —
and then it started firing on nothing.

`runSync` runs once per session restore, so on **every page load**. Under "no
continuous sync", the only uploads were the sign-in merge and a settled
conflict, so anything the learner did afterwards existed on the device and
nowhere else. `tsumiki-module-recency-v1` and the modules' own stores move as
soon as the app is used at all. So the next load found local ≠ remote, and the
merge — working exactly as specified — asked the learner to choose between their
own progress and their own progress.

That is the failure this document already names, reached from the other side:
*"a learner taught to dismiss the question will dismiss the real one too."* A
question that appears on a refresh is not a safeguard; it is training.

## Why the account can now win without asking

The old rule was the honest answer to *"two real bodies of work and no safe
default."* With continuous saving, that situation cannot arise on a joined
device:

- Work this device did has already been pushed.
- Work it could not push is still **here**, and rule 1 hands it back unasked,
  because the account does not have that key. Nothing local-only is discarded.
- The residual case — both sides real, both different — means this browser holds
  something **older** than the account.

**This is not "newest wins".** No timestamps are compared and no clocks are
trusted; the rejection recorded above still stands. The claim is structural: a
joined device has no way to hold newer state the account has not been told
about, because telling it is automatic.

What the load actually runs is `mergeProgress` followed by
`resolveConflicts(…, "remote")` — not a document replacement. So:

- a key only this device has **survives** (rule 1);
- an empty or absent account **cannot wipe a device** (an empty value is absent);
- `tsumiki-checker-history-v1` is still **unioned**, because the union settles
  it inside `mergeProgress` before a conflict list exists. That exemption
  matters more now, not less: without it a device that wrote checks offline
  would lose them on the next load with nothing on screen to show for it.

## The one case that is still a genuine merge

**The first sign-in on a device.** There this document's original reasoning
holds exactly: the browser's progress predates the account relationship and was
never pushed, so the two sides really are independent histories. Merge, and ask.

Which case applies is a fact about the browser, recorded by
`joinedAccount()` in `storage.js` under `tsumiki-account-joined-v1`.

- **That key must never enter `KEYS`.** It is the one piece of state that has to
  differ per device; uploading it would make every device claim to have joined
  the moment one of them had — skipping the merge that exists to check that
  claim. `test-autosave.py` asserts it is absent from `KEYS` and from the pushed
  document.
- **Signing out clears it.** Sign-out still does not clear progress, so the
  learner keeps working; by the time they sign back in this browser may hold
  work the account never saw. That is the two-independent-histories case again,
  and it gets the same answer.

## Why they cannot be split

- **Authoritative load without continuous saving** discards everything done
  since the last sign-in, on every load, silently. That is precisely the bug
  this document exists to prevent, automated.
- **Continuous saving without an authoritative load** leaves the refresh prompt
  in place, which was the complaint.

If autosave is ever disabled, the authoritative load must go with it.

## The guard, and what it is not

A push must not run before the load has settled: a document written mid-load is
thin where the account is full, and the account would take it.

**The guard is a flag, not a size test.** `armAutosave()` is called only when
this device's state *is* the account's state. Before that, writes are remembered
and nothing is sent. A "refuse a push much smaller than the account" heuristic
was considered and rejected for the reason `wouldWipeRemote` already gives about
itself: it cannot tell a stale push from a learner who reset one section, and a
guard that refuses real work gets switched off.

**⚠️ The first version of that guard was untestable and the control caught it.**
`armAutosave` originally took the client *and* set the flag, so "not ready" and
"no client to push with" were the same condition — deleting the gate left every
assertion green, because a push with no client throws before it reaches the
network. The API is now split: `autosaveSession()` says who we would push as,
`armAutosave()` says we may. `python3 test-autosave.py --self-check` deletes the
gate from a copy and requires red; it also runs the unmutated copy first and
requires green, because the control's own first run was red for an unrelated
reason (no `package.json`, so the copied ES modules loaded as CommonJS).

## Consequences that are costs, stated rather than buried

- **On the load path a device's differing keys are replaced with no button
  pressed, so no file is offered and none is saved.** The archive keeps every
  version the *account* held — which is now the side that survives — and BACKUP
  in the account panel is still there for a copy the learner holds themselves.
- **If the load fails, this session saves nothing to the account.** Deliberate:
  a device that could not read the account has no business writing to it. The
  local write still happens, and the panel now says so in words. This is not a
  regression — under the old cadence a failed sign-in sync also meant no upload
  for the whole session.
- **A module mounted before the load settles could write stale state over what
  the pull installed.** The window is sub-second and the app always opens on
  Home, where no module is mounted; it would take navigating into a module
  within the first few hundred milliseconds of a load. Named here rather than
  left to be discovered.

## Archive retention

The archive trigger files a full copy of the document on every content change.
That was a handful of versions a month at sign-in cadence and is hundreds a week
at this one. `supabase/migrations/20260916000000_progress_archive_retention.sql`
adds a rule — newest 20 versions, then one per UTC day for 90 days — as a **new**
migration; the existing one is not edited, for the reason `20260906140000`
gives. Identical content still costs a round trip and does **not** bump the
version, because the original trigger already compares `old.data is distinct
from new.data`; the client now also declines to send an unchanged document at
all, so a quiet load costs one GET and no POST.
