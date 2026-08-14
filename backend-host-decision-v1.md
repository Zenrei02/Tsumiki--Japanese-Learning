# Where the checker endpoint lives — decision brief v1

*Session 16, Aug 15 2026. Written before any endpoint code exists, so the choice is made
on evidence rather than on what has already been built.*

The build-out needs one server-side thing: an endpoint that holds the Anthropic API key,
sends the static system prompt with `cache_control`, and returns structured JSON to the
browser. Everything else in the vertical slice (checker UI, span verification, daily cap)
is downstream of where that endpoint runs.

---

## The measurement that decides it

The obvious answer is "Netlify Functions, same repo" — the site is already on Netlify and
`netlify.toml` is already the source of truth. That answer survives every consideration
except one, and the one it fails is not a matter of taste. **A check takes a long time.**

`bakeoff-log.jsonl` is 115 real calls against the real system prompt on the real eval
sentences — Lloyd's own workload, not a benchmark. Gaps between consecutive log writes on
a sequential run, **less the harness's `time.sleep(1)`**, give per-call wall time:

| Model | n | median | p90 | max |
|---|---|---|---|---|
| M2 (Sonnet-class) | 34 | ~16s | ~41s | ~49s |
| M3 (Opus-class) | 36 | ~17s | ~52s | ~63s |
| M1 (Haiku 4.5) | 44 | ~4s | ~36s | ~121s ¹ |

¹ Almost certainly a retry path (`time.sleep(2)` plus a second call), not one request.

These are *slow* because the Claude 5 family thinks by default and thinking bills as
output — the Session 15 finding that forced `max_tokens` from 2048 to 8000. Median output
was 1,105 tokens on M2 and 958 on M3, against Haiku's 289. **The long calls are not the
boring ones.** They are the error-heavy sentences — 30 of the 35 Session 15 failures were
M2/M3 on exactly those. The tail is where the product earns its money.

Caveat worth stating: the gaps are 1-second-resolution timestamps and include JSON
parsing and the log write. Treat them as ±1–2s, not as instrumentation.

---

## The four candidates

### Netlify Functions (same repo)

**Synchronous execution limit: 60 seconds, and the docs mark it `Configurable? No`.**
Worth flagging because the widely-repeated "10 seconds, 26 on Pro" figure is stale — it
comes from forum threads and third-party pricing blogs, and current Netlify docs
contradict it. The real ceiling is 60s on every plan.

60s is *above* the measured median and p90, and *below* the measured max of ~63s. So this
does not fail — it fails occasionally, on the longest analyses, which are the ones that
matter most. Roughly the top 1–3% of checks, presenting to the learner as a hang followed
by nothing.

The second problem is quieter. On a credit-based plan, functions bill through the same
**compute metric and the same 300-credit monthly pool as deploys** — 10 credits per
GB-Hour, 1024 MB default. At a ~17s median that is about **0.047 credits per check**, so
300 credits is roughly 6,000 checks a month *before* deploys take their 15 apiece. That is
plenty of headroom in absolute terms. What it is not is *separate*: every check the beta
testers run comes out of the same budget Lloyd is already rationing to one push per
session. Coupling the product's traffic to the deploy allowance means a busy week of
testing can silently make a deploy unaffordable.

Third, small but real: `netlify.toml`'s build-ignore rule is
`git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF ./`, relative to `base = "naoshi-app"`.
Functions living at the repo root in `netlify/functions/` are **outside that path**, so a
functions-only change would skip the build and deploy nothing, reporting success. Fixable
in one line, but it is exactly the shape of failure this project keeps getting bitten by —
a success log that is truthful about what it did and silent about what it didn't.

### Supabase Edge Functions

Free plan: **150s wall clock**, 150s idle timeout, 500,000 invocations/month, 2s CPU time
— and CPU time explicitly **excludes async I/O**, which is what a proxy to a slow API is
almost entirely made of. 150s against a measured max of 63s is headroom rather than a
gamble.

It is also already on the roadmap. Supabase is the planned home for accounts, and the
daily cap wants a database it can trust — a cap enforced in browser storage is not a cost
bound, it is a suggestion. Putting the endpoint here means the cap has Postgres next to it
today and account-scoping later without a move.

Costs: a second service to configure, Deno rather than Node (the harness is Python, so
nothing ports either way), CORS to set up, and `supabase functions deploy` as a second
deploy path. That last one is arguably a feature — **backend iteration stops costing
Netlify credits and stops being governed by the one-push-per-session rule.**

### Vercel Functions

Disqualified on terms, not on tech. Vercel's Hobby plan is restricted to non-commercial
personal use, and their fair-use guidance names processing payment, advertising a product,
and carrying ads as commercial. Phase 3 turns on Stripe. Using Hobby now means either
migrating at the exact moment the product starts earning, or paying $20/month for Pro from
today. Neither is worth it when free options fit.

### Railway

No meaningful free tier any more: a one-time $5 trial credit, then $1/month of credit on
the Free plan — enough for roughly one always-on 0.5 GB service and no database. Hobby is
$5/month minimum plus usage.

What it buys is a real always-on container: no cold starts, no execution ceiling at all,
and no serverless-shaped constraints to design around. That is genuinely the most
comfortable runtime here. It just costs money from day one to solve a problem the free
Supabase ceiling already solves.

---

## Recommendation: Supabase Edge Functions

Three reasons, in order of weight:

1. **150s versus 60s, against a measured 63s maximum.** Netlify's ceiling sits *inside*
   the observed range of this exact workload. Supabase's does not. This is the whole
   argument; the rest is corroboration.
2. **It decouples the checker from the deploy budget.** Checks stop drawing on the same
   300 credits as production deploys, and backend fixes stop being rationed by the
   one-push rule.
3. **It is the auth and database home already chosen.** The daily cap needs server-side
   state now and account-scoping later. Building it next to Postgres means the Supabase
   row on the tracker gets easier, not harder.

**What this does not commit to.** The frontend stays exactly where it is — Netlify, same
repo, same build. Only the endpoint moves. The checker module calls one URL from an env
var, so if Supabase disappoints, swapping to Netlify Functions or Railway is a config
change plus a redeploy, not a rewrite. Keep the handler's Anthropic-facing logic in a
plain function that takes a request and returns a response, with the Deno-specific glue at
the edges, and the port stays cheap.

**Regardless of the choice, fix the build-ignore rule** so that a backend change can never
again look deployed when it wasn't.

---

## What I'd need from Lloyd to proceed

- A Supabase project (free tier, existing one is fine if there is one).
- `ANTHROPIC_API_KEY` set as a Supabase secret — **set by Lloyd in the dashboard or CLI,
  never pasted into this chat, an artifact, or the tracker.**
- Confirmation of which model string the endpoint should default to. It reads from an env
  var either way, so this is not blocking — the bake-off verdict can change it later
  without touching code.

---

## Sources

- [Netlify — Configuration for functions](https://docs.netlify.com/build/functions/configuration/) (60s synchronous limit, not configurable)
- [Netlify — Functions usage and billing](https://docs.netlify.com/build/functions/usage-and-billing/) (10 credits per GB-Hour, 1024 MB default)
- [Supabase — Edge Functions limits](https://supabase.com/docs/guides/functions/limits) (150s free wall clock, 2s CPU excluding async I/O)
- [Vercel Hobby fair-use / commercial restriction](https://www.promptstoproduct.com/vercel-free-tier-limits)
- [Railway pricing plans](https://docs.railway.com/pricing/plans)
- `bakeoff-log.jsonl`, 115 calls, Aug 14–15 2026 — the latency table above
