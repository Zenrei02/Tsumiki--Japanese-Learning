-- Archive retention — because the cadence changed underneath the archive.
--
-- WHAT CHANGED. 20260906000000 gave tsumiki_progress a BEFORE UPDATE trigger
-- that files the outgoing document into tsumiki_progress_archive on every
-- content-changing write, and keeps it forever. That was proportionate when
-- progress uploaded at exactly two moments — a sign-in and a settled merge — so
-- a busy learner filed a handful of versions a month.
--
-- As of 2026-09-16 the client saves continuously (tsumiki-app/src/lib/autosave.js:
-- debounced off the single storage setter, flushed when the page is hidden).
-- Every real change still files a full copy of the whole document. That is
-- hundreds of versions per learner per week, each one holding the entire
-- progress map — so the archive would outgrow the table it protects by three
-- orders of magnitude, for no gain: nobody is going to restore the version from
-- 11:42:07 rather than the one from 11:42:04.
--
-- ⚠️ THE EXISTING MIGRATION IS NOT EDITED. The migration files are a ledger of
-- what was applied, not a description of the current schema; rewriting one
-- would make the repo disagree with the database it already built. Same
-- reasoning as 20260906140000. The trigger there is also deliberately left
-- alone — it is still right that a content change is history. What changes is
-- how long history is kept.
--
-- ————— THE RULE —————
--
--   1. The newest 20 versions are kept, whatever their age. This is the undo
--      window: "I just tapped reset", "my phone overwrote something".
--   2. Older than that, ONE VERSION PER UTC DAY survives — the last one of
--      that day. This is the support window: "restore my version from
--      Tuesday", which is the actual sentence the original migration's comment
--      names as the thing it exists for.
--   3. Beyond 90 days, nothing. A learner who has not noticed in three months
--      is not going to.
--
-- So a learner's archive settles at roughly 20 + 90 rows rather than growing
-- without bound, and both questions anyone has actually asked of it still have
-- answers.
--
-- ⚠️ WHY IT IS A TRIGGER AND NOT A CRON JOB. A scheduled job is a second thing
-- that has to be running, and this project has already shipped a spend cap that
-- silently stopped running while every request returned 200 (20260814190000).
-- Pruning on insert cannot drift out of step with inserting, because it IS
-- inserting. The cost is bounded by rule 1-3 above: the scan touches one
-- learner's ~110 rows through the primary key, not the whole table.

begin;

-- ── the prune ───────────────────────────────────────────────────────────────
--
-- SECURITY DEFINER for the same reason as the archive trigger itself: RLS is on
-- and the archive deliberately has no DELETE policy or privilege for anyone.
-- The only thing that may remove history is the same mechanism that writes it.
-- Owned by postgres, search_path pinned, per 20260814180650_check_usage.sql.
--
-- No recursion risk: a DELETE does not fire an INSERT trigger.
create or replace function public.tsumiki_progress_archive_prune()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  delete from public.tsumiki_progress_archive a
  where a.user_id = new.user_id
    and a.version not in (
      -- rule 1: the newest 20, whatever their age
      select version from public.tsumiki_progress_archive
       where user_id = new.user_id
       order by version desc
       limit 20
    )
    and a.version not in (
      -- rule 2: the last version of each UTC day, within 90 days
      select max(version) from public.tsumiki_progress_archive
       where user_id = new.user_id
         and archived_at >= now() - interval '90 days'
       group by (archived_at at time zone 'UTC')::date
    );
  return null;   -- AFTER trigger; the return value is ignored
end;
$function$;

drop trigger if exists tsumiki_progress_archive_prune_trg
  on public.tsumiki_progress_archive;
create trigger tsumiki_progress_archive_prune_trg
  after insert on public.tsumiki_progress_archive
  for each row execute function public.tsumiki_progress_archive_prune();

-- ── the same rule, once, over what is already there ─────────────────────────
--
-- The trigger only ever prunes a user who is still writing. Without this, a
-- learner who stops using the app keeps every version they ever filed. Runs as
-- the migration's own role, which owns the table.
delete from public.tsumiki_progress_archive a
where a.version not in (
        select version from public.tsumiki_progress_archive
         where user_id = a.user_id
         order by version desc
         limit 20
      )
  and a.version not in (
        select max(version) from public.tsumiki_progress_archive
         where user_id = a.user_id
           and archived_at >= now() - interval '90 days'
         group by (archived_at at time zone 'UTC')::date
      );

comment on function public.tsumiki_progress_archive_prune() is
  'Keeps tsumiki_progress_archive bounded now that the client saves continuously: '
  'the newest 20 versions, plus the last version of each UTC day for 90 days. '
  'Runs on insert rather than on a schedule so it cannot silently stop running.';

commit;
