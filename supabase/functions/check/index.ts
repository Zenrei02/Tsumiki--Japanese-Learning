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
import { placeSpans, type RawIssue, SpanPlacer, verdictOf } from "./spans.ts";
import {
  envelopeOf,
  JsonStreamExtractor,
  SseDecoder,
  textDeltaOf,
} from "./stream-extract.ts";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

// Model is an env var on purpose. The bake-off verdict gates LAUNCH, not
// building — so the endpoint is model-agnostic and the winner is a dashboard
// setting, not a deploy.
const MODEL = (Deno.env.get("TSUMIKI_MODEL") ?? Deno.env.get("NAOSHI_MODEL")) ?? "claude-sonnet-5";
const DAILY_CAP = Number((Deno.env.get("TSUMIKI_DAILY_CAP") ?? Deno.env.get("NAOSHI_DAILY_CAP")) ?? "10");
const MAX_CHARS = Number((Deno.env.get("TSUMIKI_MAX_CHARS") ?? Deno.env.get("NAOSHI_MAX_CHARS")) ?? "600");

// Supabase's own wall clock is 150s on the free plan. The measured p90 for a
// Claude 5 check is ~52s and the observed maximum ~63s, so 120s is generous
// headroom that still returns a real error rather than a hung socket.
const UPSTREAM_TIMEOUT_MS = 120_000;

const CORS = {
  "Access-Control-Allow-Origin": (Deno.env.get("TSUMIKI_ALLOWED_ORIGIN") ?? Deno.env.get("NAOSHI_ALLOWED_ORIGIN")) ?? "*",
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
  const salt = (Deno.env.get("TSUMIKI_CAP_SALT") ?? Deno.env.get("NAOSHI_CAP_SALT")) ?? "";
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
    const r = await fetch(`${url}/rest/v1/rpc/tsumiki_reserve_check`, {
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
    await fetch(`${url}/rest/v1/rpc/tsumiki_release_check`, {
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

/**
 * The request body, built in ONE place for both paths.
 *
 * This matters more than it looks. The bake-off's verdict is only about the
 * request that was measured, and the streaming design is safe to ship before
 * that verdict lands precisely because it changes delivery and not generation:
 * same model, same prompt, same max_tokens, same everything, plus `stream`.
 * Two separately-maintained body builders would make that a claim nobody could
 * check; here the difference is one line and it is visible.
 */
function requestBody(
  model: string,
  userText: string,
  stream: boolean,
): Record<string, unknown> {
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
  if (stream) body.stream = true;
  return body;
}

async function callModel(key: string, model: string, userText: string) {
  const body = requestBody(model, userText, false);

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

/**
 * Extract the FIRST JSON object and ignore everything after it.
 *
 * This replaced a fence-marker strip on Aug 15 2026, after the bake-off
 * harness — which had the same bug — was diagnosed by running one sentence
 * through Haiku eight times. Four calls returned a valid fenced JSON block and
 * then KEPT TALKING: a paragraph of English commentary after the closing
 * fence. `JSON.parse` on the remainder throws, so four good analyses were
 * discarded as failures.
 *
 * It is worth being clear that this is not a Haiku problem, because it was
 * nearly recorded as one. The JSON was always well-formed and well under the
 * token cap. The prompt does ask for no fences, and Haiku honours that less
 * strictly than Sonnet or Opus — but ANY model can append a stray sentence,
 * and when it does, this endpoint used to return `unparseable` (502) on a
 * check that had in fact succeeded. The learner would see an error and be
 * charged a cap slot for it.
 *
 * So: scan for the first `{`, then walk forward tracking depth, skipping over
 * string contents so a brace inside an explanation cannot end the object
 * early. Anything past the close is discarded.
 */
function parsePayload(raw: string) {
  const start = raw.indexOf("{");
  if (start === -1) throw new Error("no JSON object in model output");

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];

    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return JSON.parse(raw.slice(start, i + 1));
    }
  }
  throw new Error("unterminated JSON object in model output");
}

// ── the streaming path ──────────────────────────────────────────────────────
//
// OPT-IN, via `"stream": true` in the request body. The buffered path above is
// untouched and stays the default, because:
//   * bakeoff-harness.py must keep making the request that was measured;
//   * it is the fallback if streaming misbehaves in a browser we cannot test;
//   * it is far easier to curl when debugging.
// Two code paths is a real cost, accepted while the eval is still open.
//
// WE EMIT OUR OWN EVENTS AND NEVER PROXY ANTHROPIC'S. Two reasons, the first
// non-negotiable:
//   1. Span verification must stay server-side. The guarantee this endpoint
//      makes is that every start/end was checked character-for-character
//      against the submitted text. Forwarding raw model output would move that
//      into the browser, or drop it.
//   2. Thinking deltas would leak reasoning to the client. Not for the learner,
//      and not the product.

/** Open the upstream stream. Same shape as callModel, including the retry. */
async function openModelStream(
  key: string,
  model: string,
  userText: string,
  signal: AbortSignal,
): Promise<Response> {
  const res = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(requestBody(model, userText, true)),
    signal,
  });

  if (!res.ok) {
    const detail = await res.text();
    if (
      res.status === 400 && detail.includes("temperature") &&
      !NO_TEMPERATURE.has(model)
    ) {
      NO_TEMPERATURE.add(model);
      console.log(`note: ${model} rejects temperature — retrying without it`);
      return await openModelStream(key, model, userText, signal);
    }
    throw new Error(`anthropic ${res.status}: ${detail.slice(0, 600)}`);
  }
  return res;
}

type StreamCtx = {
  text: string;
  subject: string;
  day: string;
  used: number | null;
  clearTimer: () => void;
  abortUpstream: () => void;
};

/**
 * Consume the upstream stream and emit our own.
 *
 * ⚠️ ONCE HEADERS ARE SENT THE STATUS IS FIXED AT 200, so every failure past
 * this point has to travel in-band as `event: error`. The corollary is a
 * contract on the client: a stream that ends WITHOUT `done` is a failure, not a
 * short result. Getting that wrong would make a dropped connection render as
 * "no issues found" — the exact confusion this product exists to prevent, and
 * the reason `done` is only ever sent on a genuinely complete parse.
 */
function streamingResponse(upstream: Response, ctx: StreamCtx): Response {
  const enc = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const frames = new SseDecoder();
      const extractor = new JsonStreamExtractor();
      const placer = new SpanPlacer(ctx.text);
      const rawIssues: RawIssue[] = [];

      // Has the learner received anything yet? This is the ONLY input to the
      // cap decision below, so it is set for content events and nothing else.
      let emitted = false;
      let usage: Record<string, unknown> | null = null;
      let modelName = MODEL;
      let failure: string | null = null;

      const send = (event: string, data: unknown) =>
        controller.enqueue(enc.encode(
          `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
        ));

      try {
        const reader = upstream.body!.getReader();

        const handle = (frame: { event: string; data: string }) => {
          if (frame.event === "error") {
            failure = `upstream event: ${frame.data.slice(0, 300)}`;
            return;
          }
          const env = envelopeOf(frame);
          if (env) {
            if (env.model) modelName = env.model;
            if (env.usage) {
              usage = { ...(usage ?? {}), ...(env.usage as object) };
            }
          }
          const delta = textDeltaOf(frame);
          if (delta === null) return;

          for (const ev of extractor.push(delta)) {
            switch (ev.type) {
              case "overall":
                send("overall", ev.value);
                break;
              case "issue": {
                // Placement happens HERE, server-side, one issue at a time.
                // Greedy claiming in model order means this is identical to
                // placing the whole list at once — see SpanPlacer, and the
                // equality test in test-stream-extract.mjs.
                const raw = ev.value as RawIssue;
                rawIssues.push(raw);
                send("issue", placer.place(raw));
                break;
              }
              case "model_rewrite":
                send("rewrite", { model_rewrite: ev.value ?? "" });
                break;
              case "readings":
                send("readings", {
                  readings: Array.isArray(ev.value) ? ev.value : [],
                });
                break;
            }
            emitted = true;
          }
        };

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const frame of frames.push(value)) handle(frame);
        }
        for (const frame of frames.flush()) handle(frame);
      } catch (e) {
        failure = String(e);
      }

      ctx.clearTimer();

      // `complete` is the guard that stops a truncated stream from looking like
      // a finished one: the root object has to have actually closed.
      const incomplete = !failure && !extractor.complete;
      if (incomplete) {
        console.error(
          `stream ended mid-object after ${extractor.raw.length} chars · ` +
            `usage=${JSON.stringify(usage)}`,
        );
      }
      if (failure) console.error(`stream failed: ${failure}`);

      try {
        if (failure) {
          const timedOut = failure.includes("aborted") ||
            failure.includes("AbortError");
          send("error", { error: timedOut ? "upstream-timeout" : "upstream-error" });
        } else if (incomplete) {
          send("error", { error: "unparseable" });
        } else {
          const stats = placer.stats;
          if (stats.notFound || stats.overlapped) {
            console.log(
              `spans: ${stats.located}/${stats.total} located · ` +
                `${stats.notFound} not-found · ${stats.overlapped} overlapping · ` +
                `schema ${SCHEMA_VERSION}`,
            );
          }
          send("done", {
            schema: SCHEMA_VERSION,
            model: modelName,
            verdict: verdictOf(rawIssues),
            spans: stats,
            usage,
            cap: ctx.used === null ? null : { used: ctx.used, limit: DAILY_CAP },
          });
        }
      } catch {
        // The client hung up. Nothing to say to it; the cap rule below still
        // applies, because the tokens were still spent.
      }

      // THE CAP RULE. Released only when the learner got NOTHING — a failure
      // after content was emitted has already delivered value and already cost
      // tokens, so counting it is correct.
      if ((failure || incomplete) && !emitted && ctx.used !== null) {
        await release(ctx.subject, ctx.day);
      }

      try {
        controller.close();
      } catch { /* already closed by a disconnect */ }
    },

    cancel() {
      // The learner navigated away. Stop paying for tokens nobody will read.
      ctx.clearTimer();
      ctx.abortUpstream();
    },
  });

  return new Response(body, {
    headers: {
      ...CORS,
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      // Without this some proxies buffer the whole response and hand it over at
      // the end, which would produce a slower version of the buffered path
      // while looking like it worked.
      "x-accel-buffering": "no",
    },
  });
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

  let payload: { text?: string; context?: string; stream?: boolean };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "body must be JSON" }, 400);
  }
  const wantsStream = payload.stream === true;

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

  if (wantsStream) {
    // The upstream connection is opened BEFORE any response headers go out, so
    // an upstream refusal (400/401/429, or a timeout on the handshake) can
    // still be answered with a real HTTP status and a released cap slot,
    // exactly as the buffered path does. Only failures after this point have to
    // be in-band, which keeps the awkward case as small as possible.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
    let upstream: Response;
    try {
      upstream = await openModelStream(key, MODEL, userText, controller.signal);
    } catch (e) {
      clearTimeout(timer);
      if (used !== null) await release(subject, day);
      const msg = String(e);
      console.error(`upstream failed (stream): ${msg}`);
      const timedOut = msg.includes("aborted") || msg.includes("AbortError");
      return json({ error: timedOut ? "upstream-timeout" : "upstream-error" }, 502);
    }
    return streamingResponse(upstream, {
      text,
      subject,
      day,
      used,
      clearTimer: () => clearTimeout(timer),
      abortUpstream: () => controller.abort(),
    });
  }

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
