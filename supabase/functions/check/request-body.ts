// The Anthropic request body for the checker, as a pure function.
//
// Split out of index.ts on Oct 3 2026 so it can be tested without Deno, which
// is not installed on the dev machine: this file touches no `Deno.*` global and
// imports nothing, so `node test-request-body.mts` (Node 22.6+ strips the types)
// loads it directly. Keep it that way — a Deno import here would make the test
// unrunnable and the safety argument below unasserted.
//
// THE SAFETY ARGUMENT for TSUMIKI_EFFORT: with the variable unset, the body is
// byte-for-byte the one production sent before the switch existed. Set to
// `low`, it is the request B11 measured — bakeoff-harness.py's THINKING_CFG,
// logged on all 50 B11 rows as
//   {"thinking": {"type": "adaptive"}, "output_config": {"effort": "low"}}
// against claude-sonnet-5, prompt md5 7cabba30…. No `budget_tokens` (the
// 5-family rejects it) and no beta header. test-request-body.mts asserts both.

export const EFFORTS = ["low", "medium", "high"] as const;
export type Effort = typeof EFFORTS[number];

/**
 * Read a raw TSUMIKI_EFFORT value. Anything that is not exactly one of
 * EFFORTS degrades to unset — a typo in a dashboard field must give today's
 * behaviour, not take the checker down. `invalid` carries the bad value so
 * the caller can log it once.
 */
export function parseEffort(
  raw: string | undefined | null,
): { effort: Effort | null; invalid: string | null } {
  if (raw === undefined || raw === null || raw === "") {
    return { effort: null, invalid: null };
  }
  if ((EFFORTS as readonly string[]).includes(raw)) {
    return { effort: raw as Effort, invalid: null };
  }
  return { effort: null, invalid: raw };
}

export function buildRequestBody(opts: {
  model: string;
  userText: string;
  stream: boolean;
  effort: Effort | null;
  systemPrompt: string;
  /** False once the model has 400'd on `temperature` (NO_TEMPERATURE). */
  sendTemperature: boolean;
}): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: opts.model,
    max_tokens: 8000,
    // cache_control on a static system prompt is the whole prompt-caching win:
    // the harness saw ~90k cached tokens read per model across the run. It only
    // works because the prompt never varies — the learner's context goes in the
    // user turn, below, and not into the system block.
    system: [{
      type: "text",
      text: opts.systemPrompt,
      cache_control: { type: "ephemeral" },
    }],
    messages: [{ role: "user", content: opts.userText }],
  };
  if (opts.sendTemperature) body.temperature = 0;
  // Unset adds NOTHING — not `thinking` on its own, which would change the
  // request (thinking is on by default when the param is omitted).
  if (opts.effort) {
    body.thinking = { type: "adaptive" };
    body.output_config = { effort: opts.effort };
  }
  if (opts.stream) body.stream = true;
  return body;
}
