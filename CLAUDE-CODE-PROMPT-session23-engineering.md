# Session 23 — the engineering track

**This is Session 23.** Do not infer a session number from anything else; CLAUDE.md records
what happens when one gets invented.

Read `CLAUDE.md` first. Everything below assumes it.

---

## Where things stand, so you do not re-derive it

**Phase 0 is closed except one row.** Blind grading finished — 150/150 imported, verified
against the pre-import snapshot, O107 adjudicated with Keiko. The gate says **TUNE on all
three models**, and it is not close: agreement 68% / 86% / 82% against a 90% bar, failing
even at the most generous possible regrade. The finding is that the checker's *detection* is
sound while its *rewrites* are not.

The one open Phase 0 row — **rewrite quality** — is **NOT this session's work.** It is a
scoping decision that is Lloyd's alone, and it has its own brief
(`CLAUDE-CODE-PROMPT-rewrite-quality.md`) plus a written proposal.

**The Sep 5 weekly audit is fully applied**, all nine items, verified against the repo rather
than the log. Do not re-fix them.

**Production is at `9a4f0bb`** (Sep 5). The Save/Restore data-loss bug is fixed and live, and
the Checker was exercised end-to-end against production.

---

## ⚠️ What this session does NOT touch

- **`SYSTEM_PROMPT` / `naoshi-prototype.jsx`.** The prompt that produced all 150 eval outputs
  lives at `naoshi-prototype.jsx:56` — *not* `checker-module.jsx`, which has no such constant —
  and `supabase/functions/check/_prompt.ts` is **generated** from it by `build-checker-endpoint.py`.
  They are currently byte-identical, sha `0f9310266962`, both `SCHEMA_VERSION = naoshi-4`.
  Changing either invalidates the eval baseline. Leave both alone.
- **The eval workbook and `backups/`.** Nothing here needs them.
- **The Google Forms.** They hold live responses; a rebuild orphans real graded data.
- **Japanese authoring — deliberately, and this is a scoping rule rather than a caution.**
  The Phase 1 bottleneck is reviewer capacity, not engineering: nine rows are already waiting
  on a native-speaker read, Batches W and X are queued behind Keiko, and she has just finished
  nine batches. **Every task below was chosen because it adds nothing to that queue.** If a
  task starts to require new Japanese, stop and say so rather than authoring it.

---

## The work, in order

### 1. Accounts and auth (Supabase) — P0, the gate

This is the largest unstarted item on the board and it blocks most of Phase 2: per-user error
history, `checks/user` and return-rate metrics, and opening the capped free tier.

Ground truth, checked Sep 6:

- **The app has no Supabase client at all.** `naoshi-app/package.json` dependencies are exactly
  `react` and `react-dom`. Adding `@supabase/supabase-js` is part of this task.
- **No auth or profile tables exist.** `supabase/migrations/` holds only `check_usage`,
  `keepalive`, and an RLS revoke. Auth tables are new work.
- **RLS from the first migration, not added afterwards.** The project already carries
  `20260817174150_revoke_public_execute_on_rls_auto_enable.sql`, and the keep-alive work found a
  GRANT defect the hard way — "a policy is not a privilege" is in that report for a reason.
- The publishable key belongs in a `VITE_`-prefixed Netlify env var, the same shape as
  `VITE_CHECKER_URL` (which is already set, scoped to builds, and inlined in production).

🚩 **THE CONSTRAINT THAT MATTERS MOST: AUTH MUST NOT ORPHAN LOCAL PROGRESS.**

Every learner's progress currently lives in `localStorage` under the eleven keys in
`naoshi-app/src/lib/storage.js`. **Twelve days of silent grammar-progress loss just shipped to
production** because two keys were missing from `KEYS` — that is `e78ba96`, fixed last week.
Introducing accounts is the single most likely way to do it again, at larger scale.

- `storage.js` already exports `exportProgress()`, `importProgress(text)` and
  `downloadProgress()`. **That is the bridge** — a signed-in user's first action should adopt
  existing local state, never silently start empty beside it.
- Decide and write down what happens when local and remote both exist and disagree. Silent
  pick-one is the wrong answer.
- **Precedent for how to test it:** `test-progress-migration.py` extracts the migration from
  the shipped module *at run time* so it can never test a stale copy, and was proven able to
  fail before its first green run. Do the same here. A migration test that has never failed
  has not been tested.

### 2. Splice the engagement layer

Staged and dark, waiting only on integration:

- `engagement-module.jsx` is authored at the repo root (24 KB) and **not** in
  `naoshi-app/src/modules/`.
- `engagement-v1` is **already in `KEYS`** — added ahead of the splice in `c828e3e`, precisely
  so the fix landed before the bug could.
- `App.jsx:63-68` already reads the key defensively and says so in a comment.

So the remaining work is the splice itself. `check-storage-keys.py` must stay green afterwards —
it now scans `naoshi-app/src/**` plus the root `*-module.jsx` files, so it will see this module
once it moves.

Note the design decision recorded on that row and do not undo it: **opening the app is not
studying.** A draft that marked a day active on mount was thrown out for exactly that.

### 3. Per-user error history keyed by `pattern_name` — only if 1 lands cleanly

Sits directly behind auth. The checker already emits `pattern_name` on every issue (regression
R6 confirmed it), so the data is there. If auth is not finished and verified, do not start this.

### Stretch, only if 1 and 2 are done, verified, and committed

`Kanji display pipeline` · `build-time-only tokenizer annotation + latency disclaimer` ·
`Romaji detection with stateful redirect` · `Pop-up 五十音 kana keyboard` · `Kana review
section` · `UX polish pass — practice module` · `Split Step 4 at its three build seams`.

All self-contained, all reviewer-free. Pick by what the session has time to finish properly,
not by what is most interesting.

---

## Deploy discipline

**Lloyd has explicitly authorised one deployment for this session** (his words, Sep 6: *"I
don't care if it spends a deployment with only 3 days to go"*). Roughly one of two remains on
the Aug 30 reading, and the reset is *believed* to be the 8th — his hedge, unconfirmed, and
CLAUDE.md says not to promote it into a fact.

So: **batch tasks 1 and 2 into a single deploying push.** Both touch `naoshi-app/`. Do not
push after each one.

Verify rather than assume, with the control in both directions:

```
cd naoshi-app
git --no-optional-locks diff --quiet origin/main HEAD ./ ../netlify.toml
# exit 0 => build SKIPPED (free).  exit 1 => build RUNS (15 credits).
```

`git push` will fail and always does — **Lloyd pushes from GitHub Desktop.** Probe delete
permission (`touch .p && rm .p`) *before* any git call, or `commit` leaves `.git/index.lock`
behind and his GitHub Desktop reports the repo as locked.

---

## Guards that must be green before you call anything done

```
python3 check-storage-keys.py      # 11/11 keys, exit 0 — will grow with auth
python3 check-module-drift.py      # byte-stable between runs
npm run smoke                      # in naoshi-app; never run node test/smoke.mjs directly
```

The smoke trap is worth re-reading in CLAUDE.md: run directly, it reads whatever bundle is
already at `/tmp/test-bundle.js`, including one from a previous session. Session 10 reported
passes for code the bundle predated.

⚠️ `npm run smoke` hardcodes `--outfile=/tmp/test-bundle.js`, and **the sandbox's `/tmp` is not
writable** — which is how that stale-bundle bug was finally exposed. Running in the sandbox,
build to `$HOME` and pass the override instead:

```
cd naoshi-app
npx esbuild test/entry.jsx --bundle --loader:.jsx=jsx --format=iife --jsx=automatic \
  --outfile=$HOME/test-bundle.js --define:process.env.NODE_ENV='"development"'
SMOKE_BUNDLE=$HOME/test-bundle.js node test/smoke.mjs
```

A write failure there is a real result, not an environment annoyance — it means nothing
rebuilt, and any green line after it would be about the wrong artifact.

---

## Definition of done

- [ ] Auth works end-to-end against production, **and** existing local progress survives sign-in
- [ ] The local-vs-remote conflict rule is written down, not implicit
- [ ] A migration test exists that was **proven able to fail** before its first green run
- [ ] RLS enabled in the same migration that creates any user-data table
- [ ] Engagement module spliced; `check-storage-keys.py` still green
- [ ] All three guards green; whole-file deliverables, never patches
- [ ] One deploying push, cost verified with the control, Lloyd told the cost rather than the count
- [ ] `SYSTEM_PROMPT` untouched; no Japanese authored; nothing added to the reviewer queue
- [ ] Tracker rows updated at source — `Status` only unless the `Notes` genuinely need the
      record, and if they do, fetch-append-resend and verify head + seam + length
