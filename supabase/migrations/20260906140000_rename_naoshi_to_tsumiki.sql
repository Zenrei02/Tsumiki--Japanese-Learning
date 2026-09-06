-- Session 25 — rename every naoshi_* object to tsumiki_*.
--
-- WHY THIS IS A MIGRATION AND NOT A FIND-AND-REPLACE
-- The earlier migration files are a ledger of what was applied, not a
-- description of the current schema. Rewriting them would make the repo
-- disagree with the database it already built. So they keep the old names and
-- this file carries the change.
--
-- ⚠️ THE ORDERING THAT MATTERS. `alter function ... rename` keeps the body
-- verbatim, and every one of these bodies names a table by hand. Rename the
-- tables first and a renamed-but-unchanged function still reads
-- `public.naoshi_check_usage`, which no longer exists — and it fails at CALL
-- time, not at migration time, so this would apply green and break the checker
-- on the next learner request. Each function is therefore recreated with a
-- corrected body rather than renamed.
--
-- ⚠️ AND THE DEPLOYED EDGE FUNCTION IS NOT IN THIS TRANSACTION. It calls
-- `rpc/naoshi_reserve_check` over REST and keeps doing so until it is
-- redeployed. Renaming the function out from under it turns every check into
-- `upstream-error`, which reaches the learner as "The checker could not be
-- reached just now" — the exact silent-death shape the keepalive job was added
-- to catch. So the old names survive as thin wrappers over the new ones. Drop
-- them in a follow-up once the redeploy is verified.

begin;

-- ── 1. Tables. Data, grants, policies and triggers all follow the rename. ──
alter table public.naoshi_progress          rename to tsumiki_progress;
alter table public.naoshi_progress_archive  rename to tsumiki_progress_archive;
alter table public.naoshi_check_usage       rename to tsumiki_check_usage;

-- ── 2. Constraints and indexes do NOT follow. They are renamed by hand. ──
alter table public.tsumiki_progress
  rename constraint naoshi_progress_pkey to tsumiki_progress_pkey;
alter table public.tsumiki_progress_archive
  rename constraint naoshi_progress_archive_pkey to tsumiki_progress_archive_pkey;
alter table public.tsumiki_check_usage
  rename constraint naoshi_check_usage_pkey to tsumiki_check_usage_pkey;
alter index public.naoshi_check_usage_day_idx rename to tsumiki_check_usage_day_idx;

-- ── 3. Policies keep their old names after a table rename. ──
alter policy naoshi_progress_own_select on public.tsumiki_progress
  rename to tsumiki_progress_own_select;
alter policy naoshi_progress_own_insert on public.tsumiki_progress
  rename to tsumiki_progress_own_insert;
alter policy naoshi_progress_own_update on public.tsumiki_progress
  rename to tsumiki_progress_own_update;
alter policy naoshi_progress_archive_own_select on public.tsumiki_progress_archive
  rename to tsumiki_progress_archive_own_select;

-- ── 4. The archive trigger. Body rewritten, not renamed — see the note above. ──
drop trigger if exists naoshi_progress_archive_trg on public.tsumiki_progress;

create or replace function public.tsumiki_progress_archive_prev()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if old.data is distinct from new.data then
    insert into public.tsumiki_progress_archive (user_id, version, data)
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
$function$;

create trigger tsumiki_progress_archive_trg
  before update on public.tsumiki_progress
  for each row execute function public.tsumiki_progress_archive_prev();

drop function if exists public.naoshi_progress_archive_prev();

-- ── 5. The two cap functions, likewise recreated with corrected bodies. ──
create or replace function public.tsumiki_reserve_check(p_subject text, p_day date)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  new_n integer;
begin
  insert into public.tsumiki_check_usage as u (subject, day, n)
  values (p_subject, p_day, 1)
  on conflict (subject, day)
  do update set n = u.n + 1, updated_at = now()
  returning u.n into new_n;
  return new_n;
end;
$function$;

create or replace function public.tsumiki_release_check(p_subject text, p_day date)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  new_n integer;
begin
  update public.tsumiki_check_usage
  set n = greatest(n - 1, 0), updated_at = now()
  where subject = p_subject and day = p_day
  returning n into new_n;
  return coalesce(new_n, 0);
end;
$function$;

-- A policy is not a privilege — this schema has learned that twice
-- (20260814190000, 20260825000100). State the grants rather than assume the
-- new functions inherited anything.
revoke all on function public.tsumiki_reserve_check(text, date) from public, anon, authenticated;
revoke all on function public.tsumiki_release_check(text, date) from public, anon, authenticated;
grant execute on function public.tsumiki_reserve_check(text, date) to service_role;
grant execute on function public.tsumiki_release_check(text, date) to service_role;

-- ── 6. Wrappers, so the already-deployed Edge Function keeps working. ──
create or replace function public.naoshi_reserve_check(p_subject text, p_day date)
returns integer
language sql
security definer
set search_path to 'public'
as $function$ select public.tsumiki_reserve_check(p_subject, p_day); $function$;

create or replace function public.naoshi_release_check(p_subject text, p_day date)
returns integer
language sql
security definer
set search_path to 'public'
as $function$ select public.tsumiki_release_check(p_subject, p_day); $function$;

revoke all on function public.naoshi_reserve_check(text, date) from public, anon, authenticated;
revoke all on function public.naoshi_release_check(text, date) from public, anon, authenticated;
grant execute on function public.naoshi_reserve_check(text, date) to service_role;
grant execute on function public.naoshi_release_check(text, date) to service_role;

comment on function public.naoshi_reserve_check(text, date) is
  'Session 25 compatibility wrapper. Delegates to tsumiki_reserve_check so the '
  'Edge Function deployed before the rename keeps working. Drop once a '
  'redeploy has been verified against the new name.';
comment on function public.naoshi_release_check(text, date) is
  'Session 25 compatibility wrapper. See naoshi_reserve_check.';

commit;
