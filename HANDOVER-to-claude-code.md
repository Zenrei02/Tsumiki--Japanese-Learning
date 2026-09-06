# Handover — Cowork → Claude Code (end of Session 16, Aug 15 2026)

Read `CLAUDE.md` first; it carries the environment facts and is not repeated here.
This file is only the live state and the open threads, written at the moment the
work moved to a machine with a real shell.

## Why the split

Cowork did the design, the code, the Supabase migration and the records. It could
not do: run `bakeoff-harness.py` (needs Lloyd's API key and his machine), install
packages, or drive the Supabase CLI. The remaining work is mostly those three, so
it belongs in Claude Code. **Design and planning stay in Cowork.**

## Live state

- **Checker endpoint: deployed and working.** `check` on project
  `llkazgmhsuonhwrubwjw`, `verify_jwt:false`, verified with a real request —
  three spans located, correct offsets, prompt caching confirmed.
- **Daily cap: fixed, still unproven.** The first migration revoked EXECUTE from
  PUBLIC, which `service_role` inherited through, so the cap silently never ran
  (`"cap": null`, `CAP DISABLED` in the logs). Migration
  `20260814190000_check_usage_grant_service_role.sql` fixes it. **No successful
  reserve has happened yet** — the next real check proves it or doesn't.
- **App: live at tsumiki.netlify.app**, six modules behind a side menu.
  **The Checker tab has never been used.** The endpoint shows one invocation
  ever, the curl. `VITE_CHECKER_URL` set but unverified end-to-end.
- **`TSUMIKI_ALLOWED_ORIGIN` may still be `*`.** Check it. Wide open means anyone
  can spend the API budget.

## The bake-off — 149/150, and the missing one is the finding

`O117` / `E20` / `M1` (Haiku 4.5) — `参考書をご覧になりますか？`, thirteen characters
of ordinary keigo.

The retry history is the point:

| Row | Model | Outcome |
|---|---|---|
| E39 | M3 | failed 1×, then succeeded |
| E39 | M1 | failed 2×, then succeeded |
| E17 | M1 | failed 2×, then succeeded |
| E20 | M1 | **failed 4×, still missing** |

M2 and M3 filled 50/50 essentially first-pass. M1 needed four runs to reach 49.

**These are not sentences Haiku cannot handle — they are intermittent unparseable
responses.** Same input, same settings, sometimes valid JSON and sometimes not.
The harness `sys.exit`s on HTTP errors and did not, so these are `json.loads`
failures on a 200.

**Do not fix this by dropping the row.** M1's denominator would quietly become 49
while M2 and M3 keep 50 — dropping Haiku's worst output and flattering it.
`CLAUDE.md`: changing a count without re-deriving the bar moves the bar without
anyone choosing to.

### First job in Claude Code

Capture what Haiku actually returns for E20. The harness discards the body on a
parse failure, which is why four runs have taught us nothing about the cause. A
throwaway script that calls M1 on that one sentence and prints the raw text
distinguishes: truncation, a markdown fence, a trailing comma, an unescaped
character, or a refusal. **The cause determines the right fix**, and all four are
different fixes:

- fence or stray prose → the parse step should strip more aggressively
- truncation → `max_tokens`, though 8000 on 13 characters would be remarkable
- malformed JSON → a genuine Haiku reliability finding, record and move on
- refusal → the prompt is doing something unexpected on keigo

Consider making the harness log the raw body on a parse failure permanently. Four
runs produced no diagnostic information, which is itself a defect.

### Then

`check-romaji-leak.py` over the outputs → cumulative totals into the Results
yellow cells → `build-grading-forms.py`. That is the GO/TUNE gate.

## Carry this into the verdict

A model that intermittently returns unparseable JSON is a poor bet for an endpoint
whose entire contract is structured output — independent of how it grades. And
**the blind grading cannot see this**: reviewers grade outputs that exist, so a
model's failures to produce one are invisible to them by construction. Same trap
as the romaji-leak rows — the instrument cannot express the fault, so it has to be
measured separately and stated alongside the scores.

The production endpoint has **no retry**. A learner would see an error.

## Open, not urgent

- Reviewer decision — still the one human gate on Phase 0.
- Supabase accounts; the tool-`input_schema` JSON upgrade (decide AFTER the
  verdict — switching now ships a request shape the bake-off never measured).
- Pre-existing `public.rls_auto_enable()` is anon-executable via `/rest/v1/rpc/`.
  Not ours, not urgent, revoke before real traffic.
- Stage 3 steps 27+; kanji Group 7 (社 leads; ledger turn first); potential2 on
  R6; the kana-tab paging verdict; the N4 holding pen; the 57-shape policy pass.

## Two things Session 16 learned the hard way

Both are in `CLAUDE.md` now, and both have the same shape: **a check that passed
for a reason unrelated to what it claimed to measure.**

1. The smoke test's 200-char floor was partly counting nav-bar text. Removing the
   tab bar exposed an empty state that had never independently cleared it.
2. The security advisors confirmed the cap's revoke had landed. It had — and it
   had also locked out the only caller. Advisors answer "can the wrong roles call
   this?", never "can the right one still?".

Neither was caught by a check. Both were caught by exercising the real path.
