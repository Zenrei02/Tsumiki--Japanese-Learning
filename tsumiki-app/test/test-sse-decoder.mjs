// Does the client's SSE decoder survive every chunk boundary?
//
// Chunk boundaries are where streaming parsers die, and they die quietly — a
// mangled character or a swallowed frame, not an exception. The endpoint's own
// decoder was tested this way in Session 16.5 (test-stream-extract.mjs); this
// is the same test on the CLIENT half, added in Session 32 when the UI first
// consumed the stream.
//
// The decoder is sliced out of checker-module.jsx by name and evaluated here,
// the way test-error-history.py slices the pure core out of lib/errorHistory.js:
// the thing under test is the thing that ships, not a copy of it.
//
// NEGATIVE CONTROL:  node test-sse-decoder.mjs --self-check
// swaps the stream-mode decoder for a naive per-chunk decode and requires the
// byte-split cases to go RED. Without it, this file is only evidence that
// something green happened.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = fs.readFileSync(path.join(HERE, "../../checker-module.jsx"), "utf8");
const SELF_CHECK = process.argv.includes("--self-check");

// ————— slice —————
const start = SRC.indexOf("function sseDecoder() {");
if (start === -1) { console.error("!! sseDecoder not found in checker-module.jsx"); process.exit(2); }
let depth = 0, end = -1;
for (let i = SRC.indexOf("{", start); i < SRC.length; i++) {
  if (SRC[i] === "{") depth++;
  else if (SRC[i] === "}" && --depth === 0) { end = i + 1; break; }
}
let code = SRC.slice(start, end);
if (SELF_CHECK) {
  // The mutant: decode every chunk on its own. This is the bug the stream-mode
  // decoder exists to prevent, and the byte-split cases must catch it.
  const before = code;
  code = code.replace("dec.decode(bytes, { stream: true })", "new TextDecoder().decode(bytes)");
  if (code === before) { console.error("!! self-check landmark not found — the control cannot be trusted"); process.exit(2); }
}
const sseDecoder = new Function(code + "; return sseDecoder;")();

// ————— fixture —————
// Shaped exactly as the endpoint writes it: `event: X\ndata: <json>\n\n`, and
// hostile on purpose — Japanese in every data line, an explanation in English
// (the containment rule), a comment line, a CRLF frame, and a multi-line data.
const frames = [
  ["overall",  { natural_score: 3, summary: "Mostly natural; one particle and one register slip." }],
  ["issue",    { span: "を", category: "particle", type: "fix", correction: "が",
                 explanation: "好き takes が, not を — the thing you like is the grammatical subject.",
                 pattern_name: "が vs を: 好き", jlpt: "N5", start: 5, end: 6, located: true }],
  ["issue",    { span: "食べれる", category: "conjugation", type: "unnatural", correction: "食べられる",
                 explanation: "ら抜き is common in speech; in polite writing keep the ら.",
                 pattern_name: "ら抜き言葉", jlpt: "N4", start: 12, end: 16, located: true }],
  ["issue",    { span: "あなた", category: "register", type: "note", correction: "",
                 explanation: "Prefer the person's name + さん.", pattern_name: "あなた as you",
                 jlpt: "N5", start: -1, end: -1, located: false, reason: "not-found" }],
  ["rewrite",  { model_rewrite: "私は寿司が好きで、毎日でも食べられます。" }],
  ["readings", { readings: [["私", "わたし"], ["寿司", "すし"], ["好", "す"], ["毎日", "まいにち"], ["食", "た"]] }],
  ["done",     { schema: "naoshi-4", model: "claude-sonnet-5", verdict: "FIX",
                 spans: { total: 3, located: 2, notFound: 1, overlapped: 0 }, usage: null,
                 cap: { used: 2, limit: 10 } }],
];
let wire = ": keep-alive comment\n\n";
frames.forEach(([ev, data], i) => {
  const json = JSON.stringify(data);
  if (i === 1) wire += `event: ${ev}\r\ndata: ${json}\r\n\r\n`;               // CRLF frame
  // Multi-line data: the SSE rule joins data lines with "\n", so the split
  // must land where a newline is legal JSON whitespace — between tokens, never
  // inside a string. (A first draft split inside the rewrite string and blamed
  // the decoder for the invalid JSON it had itself written.)
  else if (i === 4) wire += `event: ${ev}\ndata: {\ndata: ${json.slice(1, -1)}\ndata: }\n\n`;
  else wire += `event: ${ev}\ndata: ${json}\n\n`;
});
const bytes = new TextEncoder().encode(wire);

// Assert the fixture is actually hostile: count byte positions that fall inside
// a multi-byte character. A fixture that is not hostile makes a test pass while
// testing nothing (Session 16.5's lesson, and Session 7's before it).
//
// The bar is 100, and it was MEASURED, not guessed: this fixture has 150. A
// first draft demanded 200 and failed on its own fixture — exactly the mistake
// 16.5 recorded (a threshold of 500 against a fixture with 232). The
// explanations are English on purpose, because that is what the containment
// rule requires, so an all-Japanese fixture would be less realistic rather than
// more hostile. 150 places where a split lands inside a character is plenty.
let midChar = 0;
for (let i = 1; i < bytes.length; i++) if ((bytes[i] & 0xC0) === 0x80) midChar++;
if (midChar < 100) { console.error(`!! fixture is not hostile enough: ${midChar} mid-character byte positions`); process.exit(2); }

// ————— expected —————
function decodeAll(chunks) {
  const d = sseDecoder();
  const out = [];
  for (const c of chunks) out.push(...d.push(c));
  out.push(...d.flush());
  return out;
}
const normalise = (fs) => fs.map((f) => [f.event, JSON.parse(f.data)]);
const expected = frames;   // the comment line yields no frame; the joined multi-line data must re-parse

const failures = [];
const ok = (label, cond) => {
  if (!cond) { failures.push(label); console.log("FAIL  " + label); }
  else console.log("ok    " + label);
};
const same = (got) => JSON.stringify(normalise(got)) === JSON.stringify(expected);

ok("whole payload in one chunk decodes to the seven frames", same(decodeAll([bytes])));

// Every byte position — this is the case that matters.
let bad = 0, worst = null;
for (let i = 1; i < bytes.length; i++) {
  const got = decodeAll([bytes.subarray(0, i), bytes.subarray(i)]);
  if (!same(got)) { bad++; if (worst === null) worst = i; }
}
ok(`split at every byte position (${bytes.length - 1} splits) never changes the output` +
   (bad ? ` — ${bad} bad, first at byte ${worst}` : ""), bad === 0);

// One byte at a time.
ok("one byte at a time", same(decodeAll([...bytes].map((b) => new Uint8Array([b])))));

// Fixed-size and seeded-random chunkings.
const chunked = (size) => { const out = []; for (let i = 0; i < bytes.length; i += size) out.push(bytes.subarray(i, i + size)); return out; };
for (const n of [3, 7, 64, 1024]) ok(`fixed ${n}-byte chunks`, same(decodeAll(chunked(n))));
let seed = 42; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
for (let t = 0; t < 20; t++) {
  const out = []; let i = 0;
  while (i < bytes.length) { const n = 1 + Math.floor(rnd() * 40); out.push(bytes.subarray(i, i + n)); i += n; }
  if (!same(decodeAll(out))) { ok(`seeded random chunking #${t}`, false); break; }
  if (t === 19) ok("20 seeded random chunkings", true);
}

// A frame the connection cut in half is dropped, never guessed at — and the
// frames before it survive intact.
{
  const cut = bytes.subarray(0, bytes.length - 12);   // inside the `done` frame
  const got = normalise(decodeAll([cut]));
  ok("a truncated final frame is dropped and the earlier six survive",
     got.length === 6 && got[5][0] === "readings");
}

// No U+FFFD anywhere, ever.
{
  const all = decodeAll(chunked(5)).map((f) => f.data).join("");
  ok("no replacement characters in any decoded frame", !all.includes("�"));
}

console.log(failures.length ? `\n${failures.length} FAILED` : "\nALL PASSED");
if (SELF_CHECK) {
  if (failures.length === 0) { console.error("!! self-check: the mutant PASSED — this test proves nothing"); process.exit(1); }
  console.log("self-check: the mutant failed, as it must"); process.exit(0);
}
process.exit(failures.length ? 1 : 0);
