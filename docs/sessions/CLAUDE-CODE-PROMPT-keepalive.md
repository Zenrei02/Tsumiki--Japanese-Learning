# Task — Supabase keep-alive (free-tier pause prevention)

## Context

The tsumiki Supabase project (`llkazgmhsuonhwrubwjw`, `ca-central-1`) was paused
today by the free-tier inactivity timer. I have used my one restore. **There is
no second unpause**, so a repeat is not recoverable — treat this as a
correctness task, not a convenience one.

The timer resets on *database activity*. Dashboard visits, Edge Function
invocations, and deploys do not count. A query against Postgres does. Since the
build-out, everything has been content authoring and Edge Function work, so
nothing has touched Postgres for days at a stretch.

Build a daily GitHub Actions job that reads one row from a purpose-built table.

## Files to create

Both are given in full. Create them as written; if you disagree with something,
say so before changing it.

### 1. `supabase/migrations/20260825000000_keepalive.sql`

```sql
-- Keep-alive target for the free-tier inactivity timer.
--
-- Supabase pauses a free project after ~7 days without database activity.
-- Dashboard visits and Edge Function invocations do NOT count; a query
-- against Postgres does. This table exists solely to be that query.
--
-- Deliberately minimal surface: one row, one column read by anon, no writes.
-- It holds no data and reveals nothing if read by a stranger.

create table if not exists public.keepalive (
  id smallint primary key default 1,
  constraint keepalive_singleton check (id = 1)
);

insert into public.keepalive (id) values (1)
  on conflict (id) do nothing;

alter table public.keepalive enable row level security;

-- Read-only, and only the singleton row can exist at all.
-- Named policy + drop-first so this migration is idempotent, matching the
-- house rule that a rerun must not error or silently diverge.
drop policy if exists keepalive_anon_read on public.keepalive;

create policy keepalive_anon_read
  on public.keepalive
  for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policies. RLS denies by default, so writes are
-- already impossible for anon and authenticated without naming them.

comment on table public.keepalive is
  'Single-row table read daily by .github/workflows/supabase-keepalive.yml to prevent free-tier inactivity pause. Contains no data.';
```

### 2. `.github/workflows/supabase-keepalive.yml`

```yaml
name: Supabase keep-alive

# Reads one row from public.keepalive so the free-tier inactivity timer resets.
# Daily against a ~7-day window: six consecutive failures before anything breaks.
#
# Minute offset is deliberate. Scheduled runs at :00 sit in GitHub's most
# contended slot and are routinely delayed or dropped.

on:
  schedule:
    - cron: '17 3 * * *'   # 03:17 UTC daily (12:17 JST)
  workflow_dispatch:        # manual run, for verifying setup

jobs:
  ping:
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: Query keepalive table
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: |
          set -euo pipefail

          if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_ANON_KEY:-}" ]; then
            echo "FAIL: SUPABASE_URL or SUPABASE_ANON_KEY is unset."
            echo "Set both under Settings -> Secrets and variables -> Actions."
            exit 1
          fi

          body_file="$(mktemp)"

          status="$(curl -sS \
            -o "$body_file" \
            -w '%{http_code}' \
            --max-time 30 \
            --retry 2 \
            --retry-delay 5 \
            -H "apikey: ${SUPABASE_ANON_KEY}" \
            -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
            "${SUPABASE_URL}/rest/v1/keepalive?select=id&limit=1")"

          body="$(cat "$body_file")"

          echo "HTTP status: ${status}"
          echo "Response body: ${body}"

          if [ "${status}" != "200" ]; then
            echo "---"
            echo "FAIL: expected HTTP 200, got ${status}."
            case "${status}" in
              401|403) echo "Auth rejected - check SUPABASE_ANON_KEY is the publishable/anon key." ;;
              404)     echo "Table not found - has 20260825000000_keepalive.sql been pushed?" ;;
              5*)      echo "Server error - the project may be paused or still coming up." ;;
            esac
            exit 1
          fi

          # The failure that looks like success.
          #
          # If RLS blocks the read, PostgREST returns 200 with an empty array.
          # A workflow that checks only the status code goes green forever while
          # recording no activity, and the first sign of trouble is a pause email.
          # Assert the row itself.
          if ! printf '%s' "${body}" | grep -q '"id"'; then
            echo "---"
            echo "FAIL: HTTP 200 but no row in the response."
            echo "The query reached Postgres and came back empty - almost"
            echo "certainly the RLS policy keepalive_anon_read is missing."
            echo "Green on status alone would have hidden this."
            exit 1
          fi

          echo "---"
          echo "OK - row read, database activity recorded."
```

## Steps

1. Confirm the project is out of `COMING_UP` and healthy before touching it.
2. Create both files.
3. Apply the migration with `npx supabase@latest db push`.
   Not `brew install`, not `npm install -g supabase` — both are dead ends
   already recorded in `supabase/README.md`.
4. Set the two repo secrets. If `gh` is authenticated, prefer:
   ```
   gh secret set SUPABASE_URL --body "https://llkazgmhsuonhwrubwjw.supabase.co"
   read -rs KEY && gh secret set SUPABASE_ANON_KEY --body "$KEY" && unset KEY
   ```
   `read -rs` so the key never echoes and never enters shell history — same
   pattern used for `SUPABASE_ACCESS_TOKEN`.
5. Trigger the workflow manually (`gh workflow run "Supabase keep-alive"`) and
   read the run output.

## Verification — required, and specific

Do not report success from command exit codes. Every one of these has a
plausible green-for-the-wrong-reason failure, and this project has hit that
class five separate times.

- **The table exists and anon can actually read it.** Do not confirm this by
  listing policies or running the security advisors. The advisors answer *"can
  the wrong roles call this?"* and are silent on *"can the right one still?"* —
  that exact gap took the daily cap offline on Aug 15 while everything looked
  healthy. Confirm by making a real request with the anon key and seeing the row
  come back.
- **The workflow's own failure path works.** Point the URL at a nonexistent
  table, confirm the step fails, then revert. A guard that has never fired is a
  guard that has never been tested.
- **No Netlify build was triggered.** This touches neither `tsumiki-app/` nor
  `netlify.toml`, so it should cost no deploy credit. Confirm rather than assume.

## Also while you're in there

During the pause, Postgres was unreachable and the checker endpoint fails open
by design. Grep `function_edge_logs` for `CAP DISABLED` across the outage window
and tell me whether any check ran unbounded. The account has ~$0.80 on it, so
the ceiling is small, but I want to know whether it happened rather than assume
it didn't.

Also report which model `supabase/functions/check/index.ts` is currently pinned
to. At $0.80, Haiku is roughly 220 checks of runway and Sonnet roughly 24.

## Conventions

- Whole files, not patches.
- Commit as me, separate commits per concern, **leave unpushed** — one push at
  session close, as always.
- If something here is wrong, say so before building it.
