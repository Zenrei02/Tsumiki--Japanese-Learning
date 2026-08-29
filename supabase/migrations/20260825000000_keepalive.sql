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
