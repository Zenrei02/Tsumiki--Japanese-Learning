# Before you rename Naoshi

> # ⚠️ SUPERSEDED — the rename happened on 2026-09-06. Read this as history.
>
> *Banner added 2026-09-13 by the weekly audit. This file reads as live guidance
> and is not; three of its claims are now false, and this project has been
> bitten three times by a superseded claim outliving its correction.*
>
> **What actually happened, and where the real record is:** Session 25 — *The
> Rename, and Three Things a Find-and-Replace Would Have Broken*, plus its three
> addenda. Lloyd took the expensive option at every hazard below.
>
> - **§1 — the advice was NOT taken.** The export format string was renamed
>   outright to `tsumiki-progress`, with no dual-accept, so every backup file a
>   tester already held stopped loading — exactly as predicted here. Fixed
>   2026-09-13: `importProgress` now accepts **both** format strings *and* maps
>   pre-rename key names forward. Guarded by `test-import-format.py`.
> - **§3 — WRONG, and acting on it would have cost the bake-off.** There are no
>   product-name mentions inside `SYSTEM_PROMPT` (lines 56–190); all five hits
>   are in the export report builder, which the model never sees. The rename
>   therefore left the model's input byte-identical, and the danger ran the
>   other way — bumping the stamp would have put one prompt under two stamps.
>   `SCHEMA_VERSION` is `naoshi-4` and stays frozen.
> - **§4 — not taken either.** All fifteen Supabase objects were migrated
>   (fifteen, not twelve: the three primary-key constraints do not follow a
>   table rename). Old-name wrappers carried the deployed Edge Function through
>   and were dropped on 2026-09-07 once a real call proved the new path.
> - **"The good news: no learner progress key carries the name" — no longer
>   true, by choice.** All thirteen keys moved into the `tsumiki-` namespace.
>   Lloyd accepted that his own device store would clear. What was *not*
>   decided is that the account row could then be overwritten with `{}` by an
>   empty device — which happened on 2026-09-07 and was recovered only from
>   `tsumiki_progress_archive`. Guarded since 2026-09-13 by `wouldWipeRemote`
>   in `sync.js`.
> - **"21 commits unpushed / origin/main at bbf15c8" —** long spent. Production
>   has served `f0e2fd6` since 2026-09-08.
>
> **Still true and still worth reading:** §2 (the Supabase redirect allow-list
> and the Netlify env vars are dashboard settings no repo edit reaches) and §5's
> distinction between a storage key and the export format string. The
> post-rename check list at the bottom is also still the right list to run.

Written Sep 6 2026 (Session 24) for whoever runs the rename. Every claim below
was checked against the code, not remembered. `git grep -li naoshi` finds **271
files**, and a sweep across all of them is mostly safe — these are the places
where it is not.

---

## 1. ⚠️ `"naoshi-progress"` is a FILE FORMAT, not a name

`naoshi-app/src/lib/storage.js`

```js
111:    format: "naoshi-progress",                      // written into every export
139:  if (parsed?.format !== "naoshi-progress" || …)    // and checked on every import
```

Rename it and **every backup a tester has already saved stops loading**, with
the message "That looks like a different kind of file."

This is not hypothetical furniture. Session 24 kept two Save buttons
specifically because they are the only undo the *device's* copy has — beside the
sign-in conflict choice, and beside the reset confirm — and Account's BACKUP
block is where those files get read back. Breaking the format silently disarms
all three.

**Do one of:** leave the string alone, or accept both values on import and keep
writing the old one for a release or two.

---

## 2. ⚠️ The Supabase redirect allow-list is NOT in this repo

If the rename changes the site URL, **sign-in dead-ends** — and this exact
failure already cost Session 23 a day.

Supabase → Authentication → **URL Configuration**. An origin that is not on the
list does not error: the magic link silently falls back to the project's Site
URL. From the learner's side that is indistinguishable from "the email never
arrived", and from the app's side it is invisible, because they never reach the
app at all.

A repo-wide find-and-replace cannot touch this. It is a dashboard setting.

Same for **Netlify**: the site name, `VITE_CHECKER_URL`, `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY` are build env vars, not repo contents.

---

## 3. ⚠️ `SCHEMA_VERSION` is stamped on every graded row

`naoshi-prototype.jsx:354` — `const SCHEMA_VERSION = "naoshi-5";`

Every row in `bakeoff-log.jsonl` and in the eval workbook carries this string,
and it is how a row is traced back to the prompt that produced it. Renaming it
orphans 150 `naoshi-4` rows and 150 `naoshi-5` rows from their provenance.

**And there is a live interaction with the bake-off.** The harness reads
`SYSTEM_PROMPT` out of this same file and stamps `SCHEMA_VERSION` on what it
logs. The dangerous case is not the version changing — it is the rename editing
the **prompt text** (there are "Naoshi" mentions inside the prompt string) while
leaving `SCHEMA_VERSION` alone: two different prompts then share one stamp and
nothing downstream can separate the rows.

**Do not rename this while a bake-off is running, and if you change the prompt
text, bump the version too.** See `CLAUDE-CODE-PROMPT-session24-bakeoff-run.md`.

---

## 4. The 12 Supabase objects are a migration, not a replace

```
naoshi_progress                      naoshi_progress_archive
naoshi_progress_own_select           naoshi_progress_archive_own_select
naoshi_progress_own_insert           naoshi_progress_archive_prev
naoshi_progress_own_update           naoshi_progress_archive_trg
naoshi_check_usage                   naoshi_check_usage_day_idx
naoshi_reserve_check                 naoshi_release_check
```

Tables, RLS policies, an index, the archive trigger and two functions — plus
`sync.js:218,232` calling `.from("naoshi_progress")`. Renaming them means a
migration applied to the live project in the right order, with the client
updated in the same breath.

**Recommendation: leave them.** They are invisible to learners, and the schema
has already learned twice that a policy is not a privilege
(`20260814190000`, `20260825000100`). This is cost with no user-facing benefit.

---

## 5. The six `naoshi-` browser keys are mostly safe — one is not

```
naoshi-goals-seen        naoshi-last-module      naoshi-open-challenge
naoshi-open-review       naoshi-pending-study    naoshi-progress  ← §1, NOT a key
```

The first five are per-device UI state. Renaming them costs a learner one
re-shown Goals dialog and a forgotten "last module". Fine.

`naoshi-progress` in that list is the **export format string** from §1, not a
storage key. Do not treat it as one.

---

## ✅ The good news: no learner progress key carries the name

```
hiragana-progress-v2   katakana-progress-v1   kanji-progress-v1
known-kanji-v1         known-words-v1         n5-progress-v1
learner-depth-v1       achievement-points-v1  engagement-v1
stroke-data-v1         kanji-mode             module-recency-v1
checker-history-v1
```

All neutral. **A rename cannot orphan anyone's progress**, which is the failure
this project has actually shipped before — `n5-progress-v1` missing from the
export list for twelve days.

If you *do* rename any of them, `check-storage-keys.py` fails the build rather
than letting it go quiet. Run it after.

---

## Run these after the rename

```
python3 check-storage-keys.py          # a renamed key that escaped the KEYS list
python3 check-module-drift.py
python3 test-progress-sync.py
python3 test-progress-migration.py
python3 test-weekly-window.py
python3 test-error-history.py
python3 test-keepalive-checker.py
node naoshi-app/test/test-checker-records.mjs
npm run smoke                          # in naoshi-app/
npx vite build
```

Sandbox notes, both real: `npm run smoke` hardcodes an unwritable
`/tmp/test-bundle.js` — esbuild to `$HOME` and pass `SMOKE_BUNDLE`. And
`npm run build` fails on `EPERM … unlink dist/`; `dist/` is gitignored and
untracked, so `--outDir "$HOME/…"` is a faithful check.

---

## One more thing

**21 commits are unpushed** and `origin/main` is at `bbf15c8`. Production still
serves a build with no accounts, no Review and no Progress section. A rename
landing on top of that stack is fine — but it is one Netlify build for all of
it, so pushing before and after the rename costs two.
