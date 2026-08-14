// The checker endpoint. Holds the API key; the browser never sees it.
//
// This is the production sibling of bakeoff-harness.py, and deliberately makes
// the same request the harness makes — the bake-off's verdict is only about the
// request that was measured. Where the two must differ, it is commented.
//
// FOUR CLAUDE 5 API FACTS, all learned by the harness hitting them live on
// Aug 14 2026 and recorded on the backend-endpoint tracker row. Any request
// code written before 2026 gets all four wrong:
//
//   1. temperature / top_p / top_k are deprecated on Claude 4.7+ — sending one
//      is a 400, even with thinking off. Omit them; put determinism in the
//      prompt. (Haiku 4.5 still accepts temperature: 0, hence the per-model
//      retry below rather than a blanket omission.)
//   2. Thinking is ON BY DEFAULT when the thinking param is omitted, and
//      thinking tokens bill as OUTPUT inside max_tokens. 2048 was starving the
//      5-family and truncating JSON mid-object on exactly the error-heavy
//      sentences. 8000 is the harness's fixed value.
//   3. Assistant prefill is not supported on 4.6+ — requests must end with a
//      user message. Anything that leaned on prefilling `{` to force JSON is
//      broken.
//   4. Thinking blocks PRECEDE text blocks, so content[0].text is not safe.
//      Iterate and collect text blocks.

import { SCHEMA_VERSION, SYSTEM_PROMPT } from "./_prompt.ts";
import { placeSpans, verdictOf } from "../_shared/spans.ts";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

// Model is an env var on purpose. The bake-off verdict gates LAUNCH, not
// building — so the endpoint is model-agnostic and the winner is a dashboard
// setting, not a deploy.
const MODEL = Deno.env.get("NAOSHI_MODEL") ?? "claude-sonnet-5";
const DAILY_CAP = Number(Deno.env.get("NAOSHI_DAILY_CAP") ?? "10");
const MAX_CHARS = Number(Deno.env.get("NAOSHI_MAX_CHARS") ?? "600");

// Supabase's own wall clock is 150s on the free plan. The measured p90 for a
// Claude 5 check is ~52s and the observed maximum ~63s, so 120s is generous
// headroom that still returns a real error rather than a hung socket.
const UPSTREAM_TIMEOUT_MS = 120_000;

const CORS = {
  "Access-Control-Allow-Origin": Deno.env.get("NAOSHI_ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "content-type": "application/json" },
  });

/** Context changes what counts as an error, so register is undecidable without it. */
const CONTEXTS: Record<string, string> = {
  casual: "a casual message to a friend",
  polite: "a polite message to someone you do not know well",
  business: "a business email to a colleague or client",
};

// ── the daily cap ───────────────────────────────────────────────────────────
//
// The free tier's hard cap is what converts worst-case API cost from unbounded
// to a chosen number, so it is enforced HERE and not in the browser. A
// client-side cap is a suggestion.
//
// Anonymous for now (accounts are a later session), so the subject is a salted
// hash of the caller's IP. The salt means the table never holds anything that
// can be reversed to an address, and the hash is per-day so it is not a
// cross-day identifier either. When accounts land, the subject becomes the user
// id and nothing else about this changes.
async function subjectOf(req: Request, day: string): Promise<string> {
  const salt = Deno.env.get("NAOSHI_CAP_SALT") ?? "";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("cf-connecting-ip") ?? "unknown";
  const data = new TextEncoder().encode(`${salt}:${day}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0"))
    .join("").slice(0, 32);
}

/**
 * Reserve one check. Increments FIRST and returns the new count, because a cap
 * that increments after a successful call does not bound cost — a client that
 * hangs up mid-request would pay nothing and be charged nothing.
 *
 * Returns null when the cap table is unreachable. That case FAILS OPEN
 * deliberately: a Postgres blip should degrade the cap, not take the product
 * down. It is logged loudly so a persistent failure is visible rather than
 * quietly uncapped.
 */
async function reserve(subject: string, day: string): Promise<number | null> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    console.error("CAP DISABLED: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
    return null;
  }
  try {
    const r = await fetch(`${url}/rest/v1/rpc/naoshi_reserve_check`, {
      method: "POST",
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ p_subject: subject, p_day: day }),
    });
    if (!r.ok) {
      console.error(`CAP DISABLED: reserve rpc ${r.status} ${await r.text()}`);
      return null;
    }
    return Number(await r.json());
  } catch (e) {
    console.error(`CAP DISABLED: reserve threw ${e}`);
    return null;
  }
}

/** Hand a reservation back when the upstream call never happened. */
async function release(subject: string, day: string): Promise<void> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return;
  try {
    await fetch(`${url}/rest/v1/rpc/naoshi_release_check`, {
      method: "POST",
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ p_subject: subject, p_day: day }),
    });
  } catch (e) {
    console.error(`release failed (quota will self-heal tomorrow): ${e}`);
  }
}

// ── the model call ──────────────────────────────────────────────────────────

/** Models whose API rejects `temperature`, learned at runtime like the harness. */
const NO_TEMPERATURE = new Set<string>();

async function callModel(key: string, model: string, userText: string) {
  const body: Record<string, unknown> = {
    model,
    max_tokens: 8000,
    // cache_control on a static system prompt is the whole prompt-caching win:
    // the harness saw ~90k cached tokens read per model across the run. It only
    // works because the prompt never varies — the learner's context goes in the
    // user turn, below, and not into the system block.
    system: [{
      type: "text",
      text: SYSTEM_PROMPT,
      cache_control: { type: "ephemeral" },
    }],
    messages: [{ role: "user", content: userText }],
  };
  if (!NO_TEMPERATURE.has(model)) body.temperature = 0;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    // Read the API's own error body. A bare "400" says nothing about WHICH
    // field was rejected; the body names it exactly. This was the harness's
    // first fix (bf8e2a2) and it is what made the temperature problem legible.
    // The key is never in the body, so this is safe to log.
    const detail = await res.text();
    if (res.status === 400 && detail.includes("temperature") && !NO_TEMPERATURE.has(model)) {
      NO_TEMPERATURE.add(model);
      console.log(`note: ${model} rejects temperature — retrying without it`);
      return await callModel(key, model, userText);
    }
    throw new Error(`anthropic ${res.status}: ${detail.slice(0, 600)}`);
  }
  return await res.json();
}

/** Rule 4: thinking blocks come first, so collect text blocks rather than [0]. */
function textOf(resp: { content?: Array<{ type?: string; text?: string }> }): string {
  return (resp.content ?? [])
    .filter((b) => b.type === "text" || typeof b.text === "string")
    .map((b) => b.text ?? "")
    .join("");
}

function parsePayload(raw: string) {
  // The prompt says no fences; models sometimes add them anyway. Same defensive
  // strip the harness does.
  const cleaned = raw.trim().replace(/^```(?:json)?/m, "").replace(/```$/m, "").trim();
  return JSON.parse(cleaned);
}

// ── handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) {
    console.error("ANTHROPIC_API_KEY is not set on this function");
    return json({ error: "server-misconfigured" }, 500);
  }

  let payload: { text?: string; context?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "body must be JSON" }, 400);
  }

  const text = (payload.text ?? "").trim();
  const context = payload.context && context_ok(payload.context) ? payload.context : "polite";

  if (!text) return json({ error: "empty-text" }, 400);
  if ([...text].length > MAX_CHARS) {
    return json({ error: "too-long", limit: MAX_CHARS }, 400);
  }

  const day = new Date().toISOString().slice(0, 10);
  const subject = await subjectOf(req, day);
  const used = await reserve(subject, day);
  if (used !== null && used > DAILY_CAP) {
    await release(subject, day); // do not let a refusal consume tomorrow's quota
    return json({ error: "daily-cap", cap: DAILY_CAP, used: used - 1 }, 429);
  }

  const userText =
    `Context: the writer intends this as ${CONTEXTS[context]}.\n\n${text}`;

  let resp: { content?: unknown; usage?: unknown; model?: string };
  try {
    resp = await callModel(key, MODEL, userText);
  } catch (e) {
    if (used !== null) await release(subject, day);
    const msg = String(e);
    console.error(`upstream failed: ${msg}`);
    // Distinguish "we timed out" from "the API said no" — they need different
    // words in the UI, and lumping them together is how a slow check gets
    // reported as a broken one.
    const timedOut = msg.includes("aborted") || msg.includes("AbortError");
    return json({ error: timedOut ? "upstream-timeout" : "upstream-error" }, 502);
  }

  let data: {
    overall?: { natural_score?: number; summary?: string };
    issues?: unknown[];
    model_rewrite?: string;
    readings?: unknown[];
  };
  try {
    data = parsePayload(textOf(resp as never));
  } catch (e) {
    // A parse failure is nearly always truncation — the Session 15 signature.
    // Log the usage so a rising rate is diagnosable rather than mysterious.
    console.error(`unparseable model output: ${e} · usage=${JSON.stringify(resp.usage)}`);
    return json({ error: "unparseable" }, 502);
  }

  const rawIssues = Array.isArray(data.issues) ? data.issues : [];
  const { issues, stats } = placeSpans(text, rawIssues as never);

  if (stats.notFound || stats.overlapped) {
    // Not an error for the learner — those issues just render without a
    // highlight. It IS a signal about the prompt, so it goes in the logs.
    console.log(
      `spans: ${stats.located}/${stats.total} located · ` +
        `${stats.notFound} not-found · ${stats.overlapped} overlapping · schema ${SCHEMA_VERSION}`,
    );
  }

  return json({
    schema: SCHEMA_VERSION,
    model: (resp as { model?: string }).model ?? MODEL,
    verdict: verdictOf(rawIssues as never),
    overall: data.overall ?? {},
    issues,
    model_rewrite: data.model_rewrite ?? "",
    readings: Array.isArray(data.readings) ? data.readings : [],
    spans: stats,
    usage: resp.usage ?? null,
    cap: used === null ? null : { used, limit: DAILY_CAP },
  });
});

function context_ok(c: string): boolean {
  return Object.prototype.hasOwnProperty.call(CONTEXTS, c);
}
