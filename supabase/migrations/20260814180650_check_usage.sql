-- The daily check cap's storage.
--
-- WHY IT IS A DATABASE TABLE. The free tier's cap is the structural answer to
-- cost risk in the project breakdown: it converts worst-case API spend from
-- unbounded to a number someone chose. A cap kept in the browser does not do
-- that — it is a suggestion to anyone who opens devtools. This table is the
-- only place the count is authoritative.
--
-- WHAT IS AND IS NOT STORED. `subject` is a SHA-256 of
-- (secret salt, day, client IP), truncated. No IP address is stored, and
-- because the day is inside the hash, yesterday's subject and today's do not
-- match — the table cannot be used to follow anyone across days. It holds a
-- count and nothing else.
--
-- WHEN ACCOUNTS LAND: `subject` becomes the user id. Nothing else here changes,
-- which is the point of keying on an opaque subject rather than on an IP column.

create table if not exists public.naoshi_check_usage (
  subject   text        not null,
  day       date        not null,
  n         integer     not null default 0,
  updated_at timestamptz not null default now(),
  primary key (subject, day)
);

-- No policies are created and RLS stays ON, so the anon key cannot read or
-- write this table at all. Only the service role — which lives in the Edge
-- Function's environment and never reaches a browser — touches it, via the two
-- SECURITY DEFINER functions below.
alter table public.naoshi_check_usage enable row level security;

-- Reserve one check and return the new count.
--
-- Increment-then-check, not check-then-increment: two requests arriving
-- together must not both read "9 used" and both proceed. The upsert is atomic,
-- so the second caller sees 11 and is refused. The cost of that ordering is
-- that a request which never reaches the API has to be handed back — hence
-- naoshi_release_check.
create or replace function public.naoshi_reserve_check(p_subject text, p_day date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_n integer;
begin
  insert into public.naoshi_check_usage as u (subject, day, n)
  values (p_subject, p_day, 1)
  on conflict (subject, day)
  do update set n = u.n + 1, updated_at = now()
  returning u.n into new_n;
  return new_n;
end;
$$;

-- Hand a reservation back: the upstream call never happened, so it should not
-- count against the learner. Floors at zero so a double-release cannot mint
-- quota.
create or replace function public.naoshi_release_check(p_subject text, p_day date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_n integer;
begin
  update public.naoshi_check_usage
  set n = greatest(n - 1, 0), updated_at = now()
  where subject = p_subject and day = p_day
  returning n into new_n;
  return coalesce(new_n, 0);
end;
$$;

-- The functions are called with the service role only. Revoking the public
-- grants means a leaked anon key still cannot mint or burn quota.
revoke all on function public.naoshi_reserve_check(text, date) from public, anon, authenticated;
revoke all on function public.naoshi_release_check(text, date) from public, anon, authenticated;

-- Yesterday's rows have no purpose. Keeping a fortnight leaves enough to answer
-- "is anyone actually hitting the cap?" without accumulating indefinitely.
create index if not exists naoshi_check_usage_day_idx on public.naoshi_check_usage (day);

comment on table public.naoshi_check_usage is
  'Daily free-tier check counter. subject = salted per-day hash of client IP (no IP stored); becomes the user id when accounts land. Prune rows older than ~14 days.';
