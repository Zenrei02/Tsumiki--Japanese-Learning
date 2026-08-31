# Supabase keep-alive — build report, Aug 30 2026

Project `llkazgmhsuonhwrubwjw` (`ca-central-1`), `ACTIVE_HEALTHY` before and
after. One restore already spent, so this was built as a correctness task.

## What shipped

| Commit | File |
|---|---|
| `357b2a9` | `supabase/migrations/20260825000000_keepalive.sql` |
| `111dd89` | `supabase/migrations/20260825000100_keepalive_grant_select.sql` |
| `f56ab3e` | `.github/workflows/supabase-keepalive.yml` |

Applied remotely as `20260829160356` (keepalive) and `20260829160546`
(keepalive_grant_select).

## The defect the spec shipped with

The first migration creates the table, enables RLS, adds a permissive SELECT
policy — and stops. **A policy is not a privilege.** RLS narrows what a role may
see; the table-level GRANT decides whether it may look at all, and this
project's public schema does not hand out the DML privileges by default.

ACL after the first migration:

```
{postgres=arwdDxtm/postgres, anon=Dxtm/postgres,
 authenticated=Dxtm/postgres, service_role=Dxtm/postgres}
```

`Dxtm` is TRUNCATE, REFERENCES, TRIGGER, MAINTAIN. No `r`. anon held four
privileges it has no conceivable use for and not the one the keep-alive needs.

Running the workflow's own script against the live endpoint with the anon key:

```
HTTP 401 {"code":"42501","message":"permission denied for table keepalive",
          "hint":"GRANT SELECT ON public.keepalive TO anon;"}
```

`pg_policies` showed `keepalive_anon_read` present and correct. So did the
security advisors. **Only an actual request found it** — the gap
`20260817174150` names in its own header: the advisors answer "can the wrong
roles reach this?" and say nothing about "can the right one?".

Third appearance of one statement-shape lesson, after `20260814190000` (revoke
from PUBLIC took service_role's only grant with it; the cap stopped bounding
spend while every check returned 200) and `20260817174150` (revoke against a
NULL acl is a silent no-op). The role that must HOLD a privilege gets named, in
the ACL, where it can be read.

Kept as a separate migration rather than folded into the first, matching how
`20260814190000` was handled: editing the original would delete the evidence
that a policy alone reads as sufficient.

## Verification

Every path exercised against the live project.

| Condition | Result |
|---|---|
| Row present (post-grant) | `200 [{"id":1}]`, exit 0 |
| No grant — the DB's real state between migrations | `401` `42501`, exit 1 |
| Nonexistent table | `404` `PGRST205`, exit 1 |
| `200` with empty array | exit 1 on the row assertion |
| Secrets unset | exit 1, names the settings page |

The 401 was not simulated; it was the database's actual condition, which is how
the missing grant surfaced. The empty-array case is the one that matters most —
a workflow checking only the status code would go green forever while recording
no activity, and the first news would be a pause email.

Privileges now: anon and authenticated SELECT true; anon INSERT, UPDATE, DELETE
false. One row, one policy. Advisors report nothing new — only the pre-existing,
documented `naoshi_check_usage` INFO.

## Netlify

```
3e6e357..HEAD (the three keep-alive commits)  exit 0  -> add no build
origin/main..HEAD (what the next push evaluates) exit 1  -> WILL build
```

Both controls run: a known app-touching range exits 1, an empty range exits 0,
so the rule can say both things rather than always saying skip.

The keep-alive work is free. **The push is not.** `3e6e357` is the oldest
unpushed commit and touches `naoshi-app/`, so the diff spans it regardless of
what sits on top. 15 credits, one of two.

Consequence worth acting on: `VITE_CHECKER_URL` is inlined at BUILD time
(`import.meta.env` in `naoshi-app/src/modules/Checker.jsx:39`). Setting it in
Netlify's environment BEFORE this push makes the one unavoidable build carry
both the section accents and the P0 blocker carried since Session 16. Setting it
afterwards costs the second deployment.

## `CAP DISABLED` across the outage

**Zero hits.** Continuous coverage Aug 26 01:00Z -> Aug 30 01:15Z, four
contiguous 24h windows (the log API caps each query at 24h). Retention reached
further back than expected, past the outage itself.

Stronger than the absence of the string: **zero `function_edge_logs`, zero
`function_logs`, zero requests to `/functions/v1/check`** in the whole window.
No check ran at all, so none ran unbounded. The ~$0.80 was never at risk.

## Model

`supabase/functions/check/index.ts:39` —
`Deno.env.get("NAOSHI_MODEL") ?? "claude-sonnet-5"`. The only model literal in
the function. So Sonnet 5 unless a dashboard secret overrides it; Edge Function
secret VALUES are not readable through the API, so the effective model can only
be confirmed by a real check, whose response carries `model` as answered
(~1 cent, ~1.2% of the balance).

At $0.80: roughly 24 checks of runway on Sonnet, roughly 220 on Haiku.

## Still open

1. **Repo secrets are not set.** No `gh` on this machine and the GitHub API is
   proxy-blocked from the sandbox, so steps 4 and 5 could not run. Until
   `SUPABASE_URL` and `SUPABASE_ANON_KEY` exist under Settings -> Secrets and
   variables -> Actions, the workflow fails closed with a message naming that
   page. **Nothing is protecting the project until this is done.**
2. **The workflow has never run on GitHub.** Its script has, in full, locally,
   against the live endpoint — but `workflow_dispatch` is the confirmation that
   the YAML parses and the secrets resolve in Actions' own environment.
3. **GitHub disables scheduled workflows after 60 days of repository
   inactivity.** This is the failure mode the design cannot see, and it is the
   same shape as the one that caused the pause: activity happening somewhere the
   timer does not count. A `push` trigger on main, or an external cron that does
   not depend on repo liveness, closes it.
4. **Migration versions do not match local filenames** (`20260829160356` vs
   `20260825000000`) — the same divergence `20260814190000` already carries.
   Both files are idempotent, so a `db push` re-applying them is harmless, but
   it will look like the divergence the README says to stop and investigate.
   Applied through the MCP connector because there is no `SUPABASE_ACCESS_TOKEN`
   in the sandbox and `supabase login` needs a browser.
