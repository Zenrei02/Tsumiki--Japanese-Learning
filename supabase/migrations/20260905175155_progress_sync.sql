-- Accounts: where a signed-in learner's progress lives.
--
-- WHY A SINGLE JSONB DOCUMENT AND NOT ELEVEN COLUMNS. The eleven keys in
-- naoshi-app/src/lib/storage.js are opaque to the server: each module owns the
-- shape of its own value and changes it without telling anyone. A schema that
-- mirrored them would need a migration every time a module gained a field, and
-- would silently drop anything it did not know about — which is the exact
-- failure this project already shipped once (`n5-progress-v1` missing from
-- KEYS for twelve days, "Restored 7 saved items" over a partial restore).
--
-- So the server stores what the browser stores: a map of key -> string, verbatim.
-- The server never parses a module's value and therefore can never drop a field
-- it does not recognise. Merging is the CLIENT's job, at key granularity, and
-- the rule it follows is written down in auth-progress-sync-design-v1.md.
--
-- ⚠️ THE CONSTRAINT THIS SCHEMA EXISTS TO SATISFY: AN OVERWRITE MUST NOT BE
-- ABLE TO LOSE PROGRESS. Not "should not" — must not, structurally, the way
-- naoshi_check_usage made the spend cap structural rather than advisory. Client
-- code can be wrong; a learner can tap the wrong button at 1am. So every write
-- that replaces an existing document copies the old one into
-- naoshi_progress_archive first, by trigger, with no client involvement and no
-- way for the client to skip it. A bad merge is then a support question
-- ("restore my version from Tuesday") instead of a bereavement.

create table if not exists public.naoshi_progress (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  data       jsonb       not null default '{}'::jsonb,
  version    integer     not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.naoshi_progress_archive (
  user_id     uuid        not null references auth.users(id) on delete cascade,
  version     integer     not null,
  data        jsonb       not null,
  archived_at timestamptz not null default now(),
  primary key (user_id, version)
);

-- ── the archive trigger ─────────────────────────────────────────────────────
--
-- Fires before every UPDATE, stamps the new version, and files the outgoing
-- document under the version it had. `version` is therefore assigned by the
-- database and never by the client: a client that sends its own version number
-- can be stale or lying, and either way the archive key would collide.
--
-- SECURITY DEFINER because RLS is on and the archive deliberately has no INSERT
-- policy — the only thing that may write history is history being made. Owned
-- by postgres, search_path pinned, per the pattern in
-- 20260814180650_check_usage.sql.
create or replace function public.naoshi_progress_archive_prev()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- A no-op write (same document) is not history; archiving it would bury the
  -- real previous version under identical copies.
  if old.data is distinct from new.data then
    insert into public.naoshi_progress_archive (user_id, version, data)
    values (old.user_id, old.version, old.data)
    on conflict (user_id, version) do nothing;
    new.version := old.version + 1;
    new.updated_at := now();
  else
    new.version := old.version;
    new.updated_at := old.updated_at;
  end if;
  return new;
end;
$$;

drop trigger if exists naoshi_progress_archive_trg on public.naoshi_progress;
create trigger naoshi_progress_archive_trg
  before update on public.naoshi_progress
  for each row execute function public.naoshi_progress_archive_prev();

-- ── RLS, in the same migration that creates the tables ──────────────────────
--
-- Not added afterwards, and not left to the `ensure_rls` event trigger that
-- 20260817174150 documents: that guardrail is a backstop, and a table whose own
-- migration does not say `enable row level security` is a table whose intent
-- has to be inferred from an event trigger someone else installed.
alter table public.naoshi_progress          enable row level security;
alter table public.naoshi_progress_archive  enable row level security;

drop policy if exists naoshi_progress_own_select on public.naoshi_progress;
drop policy if exists naoshi_progress_own_insert on public.naoshi_progress;
drop policy if exists naoshi_progress_own_update on public.naoshi_progress;

create policy naoshi_progress_own_select on public.naoshi_progress
  for select to authenticated using ((select auth.uid()) = user_id);

create policy naoshi_progress_own_insert on public.naoshi_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- USING decides which rows may be updated; WITH CHECK decides what they may be
-- updated INTO. Both are needed: without WITH CHECK a learner could hand their
-- own row to another user_id and lose it out of their own account.
create policy naoshi_progress_own_update on public.naoshi_progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists naoshi_progress_archive_own_select on public.naoshi_progress_archive;

create policy naoshi_progress_archive_own_select on public.naoshi_progress_archive
  for select to authenticated using ((select auth.uid()) = user_id);

-- No DELETE policy on either table, deliberately. Deleting the account deletes
-- the rows through the FK cascade, which is the path a learner actually wants;
-- an in-app "delete my progress" button does not exist, so a DELETE privilege
-- would be surface with no caller. No INSERT or UPDATE policy on the archive:
-- history is written by the trigger above and by nothing else.

-- ── privileges, named explicitly ────────────────────────────────────────────
--
-- ⚠️ A POLICY IS NOT A PRIVILEGE. This project has now shipped that bug twice:
-- 20260814190000 (service_role lost EXECUTE it held only through PUBLIC, and
-- the spend cap silently stopped running while every check returned 200) and
-- 20260825000100 (keepalive had a correct SELECT policy and no SELECT grant,
-- so anon got `42501 permission denied for table keepalive`). pg_policies
-- looked right both times. The security advisors looked right both times.
--
-- This schema's relacl starts as {postgres=arwdDxtm/postgres, anon=Dxtm/...,
-- authenticated=Dxtm/..., service_role=Dxtm/...} — TRUNCATE, REFERENCES,
-- TRIGGER, MAINTAIN, and no `r`. So the grant below is not belt-and-braces; it
-- is the thing that makes the policies reachable at all.
grant select, insert, update on table public.naoshi_progress         to authenticated;
grant select                 on table public.naoshi_progress_archive to authenticated;

-- anon is named nowhere on purpose: a signed-out visitor has no auth.uid(), so
-- every policy above would deny anyway, and withholding the privilege as well
-- means both layers say no — the arrangement the rest of this schema uses.

comment on table public.naoshi_progress is
  'One row per signed-in learner: the browser''s localStorage progress map, stored verbatim as key -> string. Server never parses module values. Merge rule lives in auth-progress-sync-design-v1.md.';
comment on table public.naoshi_progress_archive is
  'Previous versions of naoshi_progress, written by trigger on every content-changing update. Exists so that no overwrite — including one caused by a client bug or a mis-tap — can destroy a learner''s progress.';
