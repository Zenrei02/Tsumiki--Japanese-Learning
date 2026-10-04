// Asserts the TSUMIKI_EFFORT safety argument in request-body.ts.
//
//   node supabase/functions/check/test-request-body.mts      (Node 22.6+)
//
// Node, not Deno, because Deno is not installed on the dev machine. Node 22
// needs --experimental-strip-types; Node 23.6+ strips types by default.
//
// The comparisons are on JSON.stringify output as well as deep equality,
// because what reaches the API is the serialised string: "byte-identical to
// today's request" includes key order, which deepStrictEqual ignores.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { buildRequestBody, parseEffort } from "./request-body.ts";
import { SYSTEM_PROMPT } from "./_prompt.ts";

let failures = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`FAIL  ${name}\n      ${(e as Error).message.split("\n").join("\n      ")}`);
  }
}
const same = (actual: unknown, expected: unknown) => {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected));
  assert.deepEqual(actual, expected);
};

const MODEL = "claude-sonnet-5";
const TEXT = "私は昨日図書館で本を読みました。";
const body = (effort: ReturnType<typeof parseEffort>["effort"], stream: boolean, sendTemperature: boolean) =>
  buildRequestBody({ model: MODEL, userText: TEXT, stream, effort, systemPrompt: SYSTEM_PROMPT, sendTemperature });

// TODAY'S BODY — a literal of what index.ts's requestBody() built at a189bf3,
// before the switch existed: model, max_tokens, cached system block, one user
// message, then `temperature: 0` unless the model is in NO_TEMPERATURE, then
// `stream` only when asked. In that order.
function today(stream: boolean, sendTemperature: boolean): Record<string, unknown> {
  const b: Record<string, unknown> = {
    model: MODEL,
    max_tokens: 8000,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: TEXT }],
  };
  if (sendTemperature) b.temperature = 0;
  if (stream) b.stream = true;
  return b;
}

// What B11 measured: bakeoff-harness.py THINKING_CFG for --effort low, as
// logged in `thinking_config` on all 50 naoshi-4-lowthink rows.
const B11_THINKING_CONFIG = { thinking: { type: "adaptive" }, output_config: { effort: "low" } };

for (const stream of [false, true]) {
  for (const temp of [true, false]) {
    const tag = `stream=${stream} temperature=${temp}`;

    check(`unset → today's body, byte for byte (${tag})`, () => {
      same(body(parseEffort(undefined).effort, stream, temp), today(stream, temp));
      same(body(parseEffort("").effort, stream, temp), today(stream, temp));
    });

    check(`low → today's body plus exactly the two B11 keys (${tag})`, () => {
      const got = body(parseEffort("low").effort, stream, temp);
      const base = today(stream, temp);
      const added = Object.keys(got).filter((k) => !(k in base));
      assert.deepEqual(added.sort(), ["output_config", "thinking"]);
      for (const k of Object.keys(base)) assert.deepEqual(got[k], base[k], `key ${k} changed`);
      assert.deepEqual(
        { thinking: got.thinking, output_config: got.output_config },
        B11_THINKING_CONFIG,
      );
    });

    check(`invalid "lwo" → identical to unset (${tag})`, () => {
      const p = parseEffort("lwo");
      assert.equal(p.effort, null);
      assert.equal(p.invalid, "lwo");
      same(body(p.effort, stream, temp), today(stream, temp));
    });
  }
}

// The request B11 measured had no temperature: the 5-family 400s on it, the
// harness learned that at run time and every logged row reads temperature:
// None. index.ts learns it the same way, so the generating `low` request for
// claude-sonnet-5 must equal the harness's lowthink body on every key but
// `stream`.
check("low, after the temperature 400 → the harness's lowthink request (keys other than stream)", () => {
  const harness = {
    model: MODEL,
    max_tokens: 8000,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: TEXT }],
    ...B11_THINKING_CONFIG,
  };
  for (const stream of [false, true]) {
    const got = { ...body("low", stream, false) };
    delete got.stream;
    assert.deepEqual(got, harness);
  }
});

check("medium and high pass through; case and whitespace variants do not", () => {
  assert.equal(parseEffort("medium").effort, "medium");
  assert.equal(parseEffort("high").effort, "high");
  for (const bad of ["LOW", " low", "low ", "none", "0"]) {
    assert.equal(parseEffort(bad).effort, null, bad);
    assert.equal(parseEffort(bad).invalid, bad, bad);
  }
});

// The verdict transfers to production only while the prompt is the one B11
// ran. Not an assertion about the switch — a tripwire on what it is safe for.
const md5 = createHash("md5").update(SYSTEM_PROMPT, "utf8").digest("hex");
check(`SYSTEM_PROMPT md5 is B11's (7cabba30…) — got ${md5}`, () => {
  assert.equal(md5, "7cabba30572fab4a30d77e0c605a4942");
});

// No value for the switch may sit in this directory, only read sites.
check("no TSUMIKI_EFFORT value assigned in the function's sources", () => {
  for (const f of ["index.ts", "request-body.ts"]) {
    const src = readFileSync(new URL(f, import.meta.url), "utf8");
    assert.doesNotMatch(src, /TSUMIKI_EFFORT\s*[:=]\s*["'`]?(low|medium|high)/, f);
  }
});

console.log(failures ? `\n${failures} FAILED` : "\nall passed");
process.exit(failures ? 1 : 0);
