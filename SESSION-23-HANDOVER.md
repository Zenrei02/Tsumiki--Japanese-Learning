# Session 23 — the engineering track

2026-09-06, overnight, unattended. Tasks 1 and 2 of
`CLAUDE-CODE-PROMPT-session23-engineering.md`. Task 3 was not started, on the
brief's own condition — see the bottom.

---

## ✅ DONE AND VERIFIED — sign-in was exercised for real on Sep 6

Lloyd set the URL configuration and the whole flow was driven end to end against
the live Supabase project. **The section below is kept because it records what
was wrong and how it was found, not because it is still outstanding.**

What was actually proven, from the API logs and the row rather than from the
screen:

```
POST /auth/v1/otp ?redirect_to=http://localhost:5173/   200
GET  /auth/v1/verify ?type=signup                       303
GET  /rest/v1/tsumiki_progress ...                       200   fetchRemote
POST /rest/v1/tsumiki_progress ?on_conflict=user_id      201   pushRemote
```

- RLS and the grants held under a real JWT — 200/201 throughout, no 42501.
- **The conflict path stops and asks.** With four keys in play the dialog named
  exactly one: kanji (genuinely different), while known-words (byte-identical),
  hiragana (device-only) and engagement (equal) were all settled silently. A
  whole-document design would have asked one crude question and taken the
  hiragana progress as collateral.
- **Nothing is written while the question is open.** The conflicting load shows
  a GET with no POST, and the row's `updated_at` did not move. That sentence was
  in the migration comments and the design doc as an intention; it is now an
  observation.
- **Both preservation halves ran.** Choosing the account's copy dropped
  `tsumiki-progress-2026-09-06.json` into Downloads before overwriting anything
  local, and the archive table holds versions 1–3. The device-only key survived
  into version 4 even though the account won the disputed one.

  ⚠️ **That automatic download was removed later the same day**, on Lloyd's
  instruction — nothing should land in someone's Downloads unasked. The file is
  now a button offered beside the choice. The paragraph above records what was
  tested on the day and is left as written; the current behaviour is in
  `auth-progress-sync-design-v1.md`.
- Supabase's built-in mailer **does** deliver.

No real progress was ever at risk: the browser used for the test held nothing —
the first sync pushed `{}`, which is the evidence for that.

**One bug was found this way and fixed** (commit below): the sign-in sync ran
TWICE per load. StrictMode made it visible, but the race is real without it,
because `setPhase()` does not take effect until the next render. It was harmless
only because that account was empty — with data on both sides, run B reads the
remote that run A has just written, finds it identical to local, and reports
"clean", **silently settling a genuine conflict**. The guard is now a ref,
checked and set synchronously. Confirmed fixed by the logs: one GET per load
across three loads, where there had been two.

Still not proven, and only a deploy can: that the **production bundle** inlines
the two `VITE_SUPABASE_*` vars. Both are set and scoped correctly, and the local
build reads them, but the committed `dist/` is a local artifact and says nothing
about Netlify's.

---

## How the production blocker was found — kept for the method

**Magic-link sign-in dead-ended on the live site until one setting changed.**
The code was correct; this was configuration.

Supabase → **Authentication → URL Configuration**:

| field | is now | must be |
|---|---|---|
| Site URL | `http://localhost:3000` | `https://tsumiki.netlify.app` |
| Redirect URLs | (localhost only) | add `https://tsumiki.netlify.app/**` |

**This was measured, not guessed, and it cost nothing to find.** `/auth/v1/verify`
resolves `redirect_to` before it looks at the token, so an invalid token is a
free, side-effect-free probe of the allow-list. Asking it where three different
URLs would land:

```
asked https://tsumiki.netlify.app   ->  location: http://localhost:3000#error=…   ← NOT allow-listed
asked http://localhost:5173        ->  location: http://localhost:5173#error=…   ← allow-listed
asked https://example.invalid/steal->  location: http://localhost:3000#error=…   ← correctly refused
```

So a learner on the live site would have received the email, clicked the link,
and been sent to `localhost:3000` — nothing, on their phone. From their side
that is indistinguishable from "the email never arrived", and from the app's
side it is invisible, because they never reach the app at all.

The third row is the good news: the allow-list is doing its job as a security
control. It just does not yet contain production.

**Second thing to check while you are in there: who can receive the email.**
Supabase's built-in mailer is rate-limited and, on recent projects, restricted
to team members. `disable_signup` is `false` and email auth is on (both read from
`/auth/v1/settings`), but whether a message actually reaches Keiko's inbox is not
something this session could test without creating an account. If testers report
no email, that is the cause, and the fix is a custom SMTP sender rather than
anything in the code.

---

## What shipped

### 1. Accounts, and a merge rule that cannot silently lose progress

Two migrations, both applied to the live project and both verified:

- `20260906000000_progress_sync.sql` — `tsumiki_progress` (one JSONB document per
  learner, stored verbatim as key → string) and `tsumiki_progress_archive`. RLS
  and the table-level GRANTs are in the same migration that creates the tables.
- `20260906000100_revoke_public_execute_on_progress_trigger.sql` — the archive
  trigger is `SECURITY DEFINER`, so it raised advisors 0028/0029 on sight. Same
  shape, and the same `revoke … from public` subtlety, as
  `20260817174150`. Both WARNs are now gone; the only remaining item is the
  pre-existing intentional INFO on `tsumiki_check_usage`.

**The server never parses a module's value**, so it cannot drop a field it does
not recognise. Merging is the client's job, per key. The rule — including the
cases where it must ask, and why the losing side is always preserved — is
`auth-progress-sync-design-v1.md`.

**An overwrite cannot destroy progress, structurally.** Every content-changing
update files the outgoing document into the archive by trigger, with no client
involvement and no way to skip it. Same move as making the spend cap a database
table rather than a browser variable.

New app files, all hand-maintained: `src/lib/supabase.js`, `src/lib/sync.js`,
`src/lib/account.jsx`, `src/lib/activity.js`, `src/lib/engagementPanel.jsx`.
Netlify now carries `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`,
same shape and scopes as `VITE_CHECKER_URL`. Neither is a secret.

### 2. The engagement layer, spliced

It is on Home — below the hero, above the doors — and renders nothing for a
learner who has started nothing.

**The brief said "the remaining work is the splice itself". It was not.**
`engagement-module.jsx` is authored in **Tailwind** and this app has no Tailwind;
the other six modules style themselves off the `T` tokens. Splicing it as-is
compiles, renders, and passes every check in the repo — as a wall of unstyled
text.

Rather than add Tailwind (its preflight would restyle all six existing modules)
or fork the authoring artifact, `build-vite-app.py` now reads the classes the
module actually uses and generates a stylesheet scoped under `.eng-scope`. 107
classes, 107 rules, and **the build refuses if any class has no rule** — so
someone adding `text-rose-500` later gets a red build rather than a paragraph
that quietly renders wrong.

**Activity is wired from evidence, not from navigation.** The module's §5 asks
for seven call sites inside the five learning modules. It did not need them:
`App.jsx`'s `commitIfWorked()` already snapshots a module's own progress store on
the way in and compares on the way out, writing "last worked on" only if it
changed. That is the same "opening the app is not studying" distinction the
module insists on, arrived at independently, so it drives this too — **with no
edits inside any module**. The authoring module gained one prop (`onApi`) and
nothing else.

Verified by driving a browser, both halves:

```
navigate into hiragana and straight back out  ->  activeDays []     "0 of 3 days this week"
change the module's own progress store        ->  activeDays [today] "1 of 3 days this week"
                                                  and "Finish one hiragana set: 1/1"
```

---

## Three things that were caught only by checking, and are worth the ink

**1. A count is not a check.** The generated stylesheet was emitted inside a JS
template literal, where JavaScript eats the backslash out of `.text-\[11px\]`,
`.gap-1\.5`, `.from-amber-50\/40` and every `.hover\:…`. Eight selectors shipped
invalid, which browsers drop **in silence**. The build printed "107 rules" and
the file contained 107 rules; both true, neither the question. Found by reading
computed styles in a real browser. Fixed with `String.raw`.

**2. The obvious guard for that did not work.** The first regression check
compared rules emitted against rules the CSS parser accepted — sound reasoning,
and true in Chrome. **jsdom accepts the broken selectors**: run against a
stylesheet with every escape stripped it still reported 107 of 107 and passed.
Only running the negative control exposed it. The check is now textual — a
selector containing `[ ] . / %` or a variant colon must carry its backslash —
and *that* control does fire, on 8 selectors.

**3. My own wiring was broken and looked fine.** The engagement panel lives on
Home, so it is unmounted for the entire time the learner is inside a module —
which is when the studying happens. The study signal was published to nobody.
It is now a queue that survives both unmount and reload.

All three are the project's recurring shape: truthful about what was done,
silent about what was missed. The only thing that caught any of them was
exercising the artifact.

---

## Guards

```
python3 check-storage-keys.py       11/11, exit 0
python3 check-module-drift.py       no drift, exit 0
python3 test-progress-sync.py       exit 0   (new)
python3 test-progress-migration.py  exit 0
npm run smoke                       PASSED — 6 modules, + accounts, + engagement
npm run build                       clean
```

`npm run smoke` still hardcodes an unwritable `/tmp/test-bundle.js` path in the
sandbox; the override used here was
`SMOKE_BUNDLE=$HOME/test-bundle.js` after an explicit esbuild to `$HOME`.

**First load: 158.58 kB → 174.93 kB raw (51.84 → 56.71 kB gzip).** Measured
against a build with the new imports stripped, not estimated. `@supabase/supabase-js`
(223.6 kB) and the engagement module (34.2 kB) are both deferred and are not in
the entry chunk.

---

## Deploy

`git push` was not attempted — it fails by design and you push from GitHub
Desktop. Netlify's own ignore rule was run against the pending commit, in both
directions:

```
origin/main..HEAD  vs ./ ../netlify.toml   -> exit 1   BUILD RUNS
control A: HEAD~1..HEAD (touches the app)  -> exit 1   (must be 1 — and is)
control B: HEAD..HEAD   (touches nothing)  -> exit 0   (must be 0 — and is)
```

Both controls matter: an ignore rule that always exits 0 is indistinguishable
from a free push, and one that always exits 1 would make every push look
expensive.

**So this push costs one deployment — 15 credits.** That is the one you
authorised.

One thing to know before you press it: **`origin/main` is at `bbf15c8`, and four
commits are waiting, not one.** The three older ones (`0860eae`, `9f433c0`,
`3fd3e4e`) are docs-only — I checked their file lists rather than trusting their
subjects — so they were free to hold and are still free now. They go out in the
same push and it is still **one** build, because Netlify builds the head of a
push and not each commit in it. Nothing has been silently accruing cost.

Worth spending only alongside the dashboard change at the top of this file.
Without it the sign-in button is live and dead-ends, which is a worse first
impression than no sign-in button at all.

---

## Not done, and why

**Task 3 (per-user error history keyed by `pattern_name`)** — the brief gates it
on task 1 landing *and being verified*. At the time this was written sign-in had
not been exercised; it has been since (see the top), so the gate is now open and
task 3 is simply the next thing rather than a blocked thing.

**Two observations, neither acted on, both authoring decisions rather than bugs:**

- The quest chain offers *"Clear your kanji reviews"* when **nothing is due**.
  `deriveQuests` puts a review task into the non-due `rest` pool and can still
  pick it. `engagementPanel.jsx` passes explicit zeroes for `due` (the module's
  own default is a demo value of `kanji: 6`, which would otherwise always claim
  six reviews are waiting), so this is the module's selection logic, not the
  wiring. Real due counts have no source outside the modules that own them.
- A study report that arrives **before the first chain exists** marks the day
  active but credits no task — the module returns early when `prev.chain` is
  null. Only reachable on a learner's very first report. The day is the
  load-bearing half and it is recorded correctly.
