// Tests for the streaming checker's decoders —
// supabase/functions/check/stream-extract.ts (+ SpanPlacer in spans.ts)
//
// WHY THESE EXIST. Chunk boundaries are where streaming parsers die, and they
// die quietly: the failure is a mangled character or a swallowed issue, not an
// exception. This app's own rule is that a checker which fails invisibly is
// indistinguishable from one that found no errors, so "it worked when I tried
// it" is not evidence here — a stream that happens to arrive in convenient
// pieces proves nothing about one that does not.
//
// So the strategy is exhaustive rather than illustrative: take one realistic
// payload and re-run it split at EVERY position, at both the character level
// and the byte level, asserting the output never changes.
//
// The Session 7 lesson applies as it does in test-spans.mjs — a test that
// passes while testing nothing is worse than no test. Two guards against that
// here: the hostile fixtures are asserted to BE hostile (§4 proves the naive
// per-chunk decode really does corrupt this data), and every case asserts
// specific values rather than "no throw".
//
// RUN:  node test-stream-extract.mjs

import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ESBUILD = "./tsumiki-app/node_modules/.bin/esbuild";
const dir = mkdtempSync(join(tmpdir(), "tsumiki-stream-"));
const bundle = (src, name) => {
  const out = join(dir, name);
  execFileSync(ESBUILD, [src, "--bundle", "--format=esm", `--outfile=${out}`]);
  return out;
};

const { JsonStreamExtractor, SseDecoder, textDeltaOf, envelopeOf } =
  await import(`file://${bundle("supabase/functions/check/stream-extract.ts", "se.mjs")}`);
const { placeSpans, SpanPlacer } =
  await import(`file://${bundle("supabase/functions/check/spans.ts", "spans.mjs")}`);

let failures = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { console.log(`  ok   ${name}`); return; }
  console.log(`  FAIL ${name}\n       expected ${e}\n       actual   ${a}`);
  failures++;
}
function ok(name, cond, detail = "") {
  if (cond) { console.log(`  ok   ${name}`); return; }
  console.log(`  FAIL ${name}${detail ? "\n       " + detail : ""}`);
  failures++;
}

// ── the fixture ─────────────────────────────────────────────────────────────
//
// Deliberately carries every hazard the design names, in one payload:
//   * Japanese throughout, so almost every character is 3 UTF-8 bytes
//   * a `{` and a `}` inside an explanation string
//   * an escaped quote \" and an escaped backslash \\ inside a string
//   * a repeated span (私の appears twice in the text) so claiming matters
//   * 「」 quotes, which are also multi-byte

const TEXT = "私は毎日私の犬と私の猫と散歩します。";

const PAYLOAD = {
  overall: {
    natural_score: 3,
    summary: "意味は伝わりますが、代名詞が多すぎます。",
  },
  issues: [
    {
      span: "私の",
      type: "unnatural",
      correction: "",
      explanation:
        'Japanese drops the possessive when ownership is obvious. A literal ' +
        'gloss such as "my dog" {owner=私の} reads as redundant here, and the ' +
        'backslash \\ is included on purpose to exercise escape handling.',
    },
    {
      span: "私の",
      type: "note",
      correction: "",
      explanation: "二回目の「私の」も同じ理由で省けます。",
    },
    {
      span: "散歩します",
      type: "note",
      correction: "散歩に行きます",
      explanation: "「散歩に行きます」の方が自然に響きます。",
    },
  ],
  model_rewrite: "私は毎日犬と猫と散歩します。",
  readings: [["毎日", "まいにち"], ["犬", "いぬ"], ["散歩", "さんぽ"]],
};

const JSON_TEXT = JSON.stringify(PAYLOAD);

function runChunks(chunks) {
  const ex = new JsonStreamExtractor();
  const events = [];
  for (const c of chunks) events.push(...ex.push(c));
  return { events, complete: ex.complete };
}

const BASELINE = runChunks([JSON_TEXT]);

// ── 1. the whole thing at once ──────────────────────────────────────────────
{
  const { events, complete } = BASELINE;
  check("event types arrive in prompt order",
        events.map((e) => e.type),
        ["overall", "issue", "issue", "issue", "model_rewrite", "readings"]);
  check("overall is the object itself", events[0].value, PAYLOAD.overall);
  check("issues are indexed in model order",
        events.filter((e) => e.type === "issue").map((e) => e.index), [0, 1, 2]);
  check("an issue survives verbatim", events[1].value, PAYLOAD.issues[0]);
  check("braces inside an explanation did not end the object early",
        events[1].value.explanation.includes("{owner=私の}"), true);
  check("the escaped backslash survived",
        events[1].value.explanation.includes("backslash \\ is"), true);
  check("the escaped quotes survived",
        events[1].value.explanation.includes('"my dog"'), true);
  check("rewrite value", events[4].value, PAYLOAD.model_rewrite);
  check("readings value", events[5].value, PAYLOAD.readings);
  check("root closed", complete, true);
}

// ── 2. split at EVERY character position ────────────────────────────────────
//
// The single most valuable test in this file. If any state in the scanner is
// held in a local instead of a field, exactly one split point will expose it.
{
  const want = JSON.stringify(BASELINE.events);
  let bad = null;
  for (let i = 1; i < JSON_TEXT.length && !bad; i++) {
    const got = runChunks([JSON_TEXT.slice(0, i), JSON_TEXT.slice(i)]);
    if (JSON.stringify(got.events) !== want || !got.complete) {
      bad = { i, around: JSON.stringify(JSON_TEXT.slice(Math.max(0, i - 25), i + 25)) };
    }
  }
  ok(`every one of the ${JSON_TEXT.length - 1} two-way splits is identical`,
     !bad, bad ? `first divergence at index ${bad.i}, near ${bad.around}` : "");
}

// ── 3. many-way splits at hostile sizes ─────────────────────────────────────
{
  const want = JSON.stringify(BASELINE.events);
  let bad = null;
  for (const size of [1, 2, 3, 5, 7, 11, 13, 64]) {
    const chunks = [];
    for (let i = 0; i < JSON_TEXT.length; i += size) {
      chunks.push(JSON_TEXT.slice(i, i + size));
    }
    const got = runChunks(chunks);
    if (JSON.stringify(got.events) !== want || !got.complete) bad = size;
  }
  ok("fixed-size chunking (1,2,3,5,7,11,13,64) is identical", !bad,
     bad ? `diverged at chunk size ${bad}` : "");

  // Deterministic pseudo-random splits — no Math.random, so a failure here can
  // actually be reproduced.
  let seed = 12345;
  const rnd = (n) => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n) + 1;
  let badTrial = null;
  for (let t = 0; t < 300 && !badTrial; t++) {
    const chunks = [];
    let i = 0;
    while (i < JSON_TEXT.length) {
      const n = rnd(9);
      chunks.push(JSON_TEXT.slice(i, i + n));
      i += n;
    }
    const got = runChunks(chunks);
    if (JSON.stringify(got.events) !== want || !got.complete) badTrial = t;
  }
  ok("300 seeded random chunkings are identical", !badTrial,
     badTrial !== null ? `diverged on trial ${badTrial}` : "");
}

// ── 4. UTF-8: the byte-level split, through the real SSE decoder ────────────
//
// The design calls this "the likeliest real bug". A network chunk boundary
// lands mid-character constantly in Japanese text, and decoding each chunk on
// its own yields U+FFFD where the split fell.

function anthropicStream(jsonText, deltaSize = 19) {
  const frame = (event, data) =>
    `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  let s = "";
  s += frame("message_start", {
    type: "message_start",
    message: { model: "claude-sonnet-5", usage: { input_tokens: 1204, output_tokens: 1 } },
  });
  // A thinking block, which must never reach the client.
  s += frame("content_block_start", { type: "content_block_start", index: 0, content_block: { type: "thinking" } });
  s += frame("content_block_delta", {
    type: "content_block_delta", index: 0,
    delta: { type: "thinking_delta", thinking: "考え中：代名詞が多い。SECRET_REASONING" },
  });
  s += frame("content_block_stop", { type: "content_block_stop", index: 0 });
  s += ": keep-alive\n\n"; // comment frame — must be ignored, not parsed
  s += frame("content_block_start", { type: "content_block_start", index: 1, content_block: { type: "text", text: "" } });
  for (let i = 0; i < jsonText.length; i += deltaSize) {
    s += frame("content_block_delta", {
      type: "content_block_delta", index: 1,
      delta: { type: "text_delta", text: jsonText.slice(i, i + deltaSize) },
    });
  }
  s += frame("content_block_stop", { type: "content_block_stop", index: 1 });
  s += frame("message_delta", {
    type: "message_delta",
    delta: { stop_reason: "end_turn" },
    usage: { output_tokens: 812 },
  });
  s += frame("message_stop", { type: "message_stop" });
  return s;
}

const SSE_TEXT = anthropicStream(JSON_TEXT);
const SSE_BYTES = new TextEncoder().encode(SSE_TEXT);

function runBytes(splits) {
  const dec = new SseDecoder();
  const ex = new JsonStreamExtractor();
  const events = [];
  let deltas = "";
  let model = null, usage = null;
  const handle = (f) => {
    const env = envelopeOf(f);
    if (env) {
      if (env.model) model = env.model;
      if (env.usage) usage = { ...(usage ?? {}), ...env.usage };
    }
    const t = textDeltaOf(f);
    if (t !== null) { deltas += t; events.push(...ex.push(t)); }
  };
  let prev = 0;
  for (const at of [...splits, SSE_BYTES.length]) {
    for (const f of dec.push(SSE_BYTES.subarray(prev, at))) handle(f);
    prev = at;
  }
  for (const f of dec.flush()) handle(f);
  return { events, deltas, complete: ex.complete, model, usage };
}

{
  // First: prove the fixture really is hostile, so a pass here means something.
  let multibyteSplits = 0;
  for (let i = 1; i < SSE_BYTES.length; i++) {
    if ((SSE_BYTES[i] & 0xc0) === 0x80) multibyteSplits++; // continuation byte
  }
  // The bar is "hundreds of split points are genuinely mid-character", not a
  // precise count. It sits well below the observed 232 because the fixture's
  // explanations are ENGLISH on purpose — the containment rule requires English
  // feedback about Japanese text, so an all-Japanese fixture would be less
  // realistic, not more hostile. What matters is that the naive-decode check
  // immediately below actually corrupts.
  ok(`fixture is genuinely hostile: ${multibyteSplits} of ${SSE_BYTES.length - 1} byte splits land mid-character`,
     multibyteSplits > 150, `only ${multibyteSplits} continuation bytes`);

  const naive = (() => {
    // The bug this guards against, written out: decode each chunk on its own.
    const at = [...SSE_BYTES.keys()].find((i) => i > 0 && (SSE_BYTES[i] & 0xc0) === 0x80);
    const d = new TextDecoder();
    return d.decode(SSE_BYTES.subarray(0, at)) + d.decode(SSE_BYTES.subarray(at));
  })();
  ok("per-chunk decoding DOES corrupt this data (so the test is real)",
     naive.includes("�"), "no replacement character — fixture too easy");

  const whole = runBytes([]);
  check("streamed decode reproduces the JSON exactly", whole.deltas, JSON_TEXT);
  check("streamed events match the baseline",
        whole.events.map((e) => e.type),
        BASELINE.events.map((e) => e.type));
  check("envelope model picked up", whole.model, "claude-sonnet-5");
  check("envelope usage merged", whole.usage,
        { input_tokens: 1204, output_tokens: 812 });
  ok("thinking text never reached the deltas",
     !whole.deltas.includes("SECRET_REASONING") && !whole.deltas.includes("考え中"));

  // Every single byte boundary.
  const wantEvents = JSON.stringify(whole.events);
  let bad = null;
  for (let i = 1; i < SSE_BYTES.length && !bad; i++) {
    const got = runBytes([i]);
    if (got.deltas !== JSON_TEXT || JSON.stringify(got.events) !== wantEvents || !got.complete) {
      bad = i;
    }
  }
  ok(`every one of the ${SSE_BYTES.length - 1} BYTE splits is identical`,
     !bad, bad ? `first divergence splitting at byte ${bad}` : "");

  // Byte-at-a-time — the worst case, and the one that breaks line buffering.
  const oneByte = runBytes([...Array(SSE_BYTES.length).keys()].slice(1));
  check("one byte at a time still reproduces the JSON", oneByte.deltas, JSON_TEXT);
  check("one byte at a time still completes", oneByte.complete, true);
  ok("one byte at a time yields no replacement characters",
     !oneByte.deltas.includes("�"));
}

// ── 5. a fence and trailing prose — the 0ffe23d failure, streamed ───────────
{
  const wrapped = "```json\n" + JSON_TEXT + "\n```\n\n" +
    "Overall the sentence is understandable but repeats 私の unnecessarily.";
  const got = runChunks([wrapped]);
  check("fence and trailing prose are discarded",
        got.events.map((e) => e.type),
        ["overall", "issue", "issue", "issue", "model_rewrite", "readings"]);
  check("still counts as complete", got.complete, true);

  // And split across chunks, since the prose arrives in its own deltas.
  const pieces = [];
  for (let i = 0; i < wrapped.length; i += 4) pieces.push(wrapped.slice(i, i + 4));
  check("same when the wrapper is chunked",
        JSON.stringify(runChunks(pieces).events),
        JSON.stringify(got.events));
}

// ── 6. the stream that stops early — must NOT look like a clean result ──────
{
  const cut = JSON_TEXT.indexOf('"span":"散歩します"'); // mid-issues, after two issues
  ok("cut point is inside the issues array", cut > 0);
  const got = runChunks([JSON_TEXT.slice(0, cut)]);

  check("issues completed before the cut were still delivered",
        got.events.map((e) => e.type), ["overall", "issue", "issue"]);
  check("the truncated stream is NOT marked complete", got.complete, false);
  // This is the property the endpoint turns into `event: error` instead of
  // `done`, so a dropped connection can never render as "no issues found".
}
{
  // Cut mid-escape, the nastiest place to stop.
  const at = JSON_TEXT.indexOf("backslash \\") + 10;
  const got = runChunks([JSON_TEXT.slice(0, at)]);
  check("cut mid-escape yields no partial issue",
        got.events.map((e) => e.type), ["overall"]);
  check("cut mid-escape is incomplete", got.complete, false);
}
{
  // Cut immediately before the root's closing brace.
  const got = runChunks([JSON_TEXT.slice(0, JSON_TEXT.length - 1)]);
  check("missing only the final brace is still incomplete", got.complete, false);
}

// ── 7. zero issues — the case the prompt is rewarded for ────────────────────
{
  const clean = JSON.stringify({
    overall: { natural_score: 5, summary: "自然な日本語です。" },
    issues: [],
    model_rewrite: "",
    readings: [["天気", "てんき"]],
  });
  const got = runChunks([clean]);
  check("clean text goes overall → rewrite → readings, no issue events",
        got.events.map((e) => e.type), ["overall", "model_rewrite", "readings"]);
  check("clean text completes", got.complete, true);

  let bad = null;
  for (let i = 1; i < clean.length && !bad; i++) {
    const g = runChunks([clean.slice(0, i), clean.slice(i)]);
    if (g.events.length !== 3 || !g.complete) bad = i;
  }
  ok("empty issues array survives every split", !bad, bad ? `split ${bad}` : "");
}

// ── 8. key order is not assumed ─────────────────────────────────────────────
{
  const reordered = JSON.stringify({
    readings: [["犬", "いぬ"]],
    model_rewrite: "犬と散歩します。",
    issues: [{ span: "犬", type: "note", explanation: "ok" }],
    overall: { natural_score: 4, summary: "だいたい自然です。" },
    unknown_future_field: { nested: { deep: [1, 2, { x: "}" }] } },
  });
  const got = runChunks([reordered]);
  check("events follow the document, not a fixed order",
        got.events.map((e) => e.type),
        ["readings", "model_rewrite", "issue", "overall"]);
  check("an unknown key is consumed without breaking the stream",
        got.complete, true);
}

// ── 9. THE EQUALITY THE WHOLE DESIGN RESTS ON ──────────────────────────────
//
// "Placing issues one at a time as they arrive gives byte-identical results to
// placing them in a batch." If that is false, streaming silently changes where
// the highlights land — the one failure this checker must never have.
//
// SpanPlacer is now the shared implementation (placeSpans is a wrapper over
// it), which makes the equality structural. This tests it anyway: a shared
// implementation is an argument, and a test is evidence.
{
  // Chosen to exercise every branch of claiming at once: a repeated span that
  // must land on three DIFFERENT indices, a nested span that must lose an
  // overlap contest, an invented span, and an empty one.
  const text = "これは本です。それは犬です。あれは猫です。日本語を勉強しています。";
  const issues = [
    { _ord: 0, span: "は", type: "note" },
    { _ord: 1, span: "勉強しています", type: "fix" },
    { _ord: 2, span: "は", type: "note" },
    { _ord: 3, span: "しています", type: "unnatural" }, // nested in _ord 1
    { _ord: 4, span: "存在しない", type: "fix" },        // never appears
    { _ord: 5, span: "は", type: "note" },
    { _ord: 6, type: "note" },                            // no span field
  ];

  const batch = placeSpans(text, issues);

  const placer = new SpanPlacer(text);
  const incremental = issues.map((i) => placer.place(i)); // one at a time

  const key = (i) => [i._ord, i.start, i.end, i.located, i.reason ?? null];
  const byOrd = (list) =>
    [...list].sort((a, b) => a._ord - b._ord).map(key);

  check("incremental placement == batch placement, issue for issue",
        byOrd(incremental), byOrd(batch.issues));
  check("incremental stats == batch stats", placer.stats, batch.stats);

  // And the arrival-order results, sorted the way the batch path sorts, must
  // reproduce the batch array exactly — order is the ONLY difference.
  const resorted = [...incremental].sort((a, b) => {
    if (a.located && b.located) return a.start - b.start;
    if (a.located) return -1;
    if (b.located) return 1;
    return 0;
  });
  check("sorting the streamed results reproduces the batch array",
        resorted.map(key), batch.issues.map(key));

  // Assert the actual placements too, so this cannot pass by both sides being
  // equally broken (e.g. a placer that located nothing).
  check("three は landed on three different indices",
        byOrd(incremental).filter((k) => [0, 2, 5].includes(k[0])).map((k) => k[1]),
        [2, 9, 16]);
  check("the nested span lost the overlap contest",
        byOrd(incremental).find((k) => k[0] === 3).slice(1),
        [-1, -1, false, "overlap"]);
  check("the invented span was not found",
        byOrd(incremental).find((k) => k[0] === 4).slice(1),
        [-1, -1, false, "not-found"]);
  check("real work happened", batch.stats,
        { total: 7, located: 4, notFound: 2, overlapped: 1 });
}

// ── 10. arrival-order equality on the REAL fixture, end to end ─────────────
//
// Ties §4 and §9 together: drive placement from the byte-split stream and
// confirm it matches placing the payload's issues in a batch.
{
  const streamed = runBytes([7, 40, 91, 150, 233, 512]);
  const placer = new SpanPlacer(TEXT);
  const fromStream = streamed.events
    .filter((e) => e.type === "issue")
    .map((e) => placer.place(e.value));

  const batch = placeSpans(TEXT, PAYLOAD.issues);
  const key = (i) => [i.span, i.start, i.end, i.located, i.reason ?? null];

  check("stream-driven placement matches batch placement",
        [...fromStream].sort((a, b) => a.start - b.start).map(key),
        [...batch.issues].sort((a, b) => a.start - b.start).map(key));
  check("the two 私の landed on different indices",
        fromStream.filter((i) => i.span === "私の").map((i) => i.start), [4, 8]);
  check("stats agree", placer.stats, batch.stats);
  check("slices really are the spans",
        fromStream.filter((i) => i.located).map((i) => TEXT.slice(i.start, i.end)),
        ["私の", "私の", "散歩します"]);
}

console.log("\n" + "─".repeat(60));
if (failures) {
  console.log(`FAILED — ${failures} assertion${failures === 1 ? "" : "s"}`);
  process.exit(1);
}
console.log("PASSED — chunk boundaries, UTF-8 splits, truncation and " +
            "incremental==batch placement all hold.");
