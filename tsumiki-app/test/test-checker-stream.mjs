// Does the checker render a stream honestly?
//
// test-checker-records.mjs proves a buffered response is recorded. This drives
// the SAME generated module against a backend that streams, and checks the two
// contracts the endpoint's design (Session 16.5) hands the client:
//
//   1. A stream that ends WITHOUT `done` is a failure, not a short result — it
//      must never render as "Nothing to correct", and must never be recorded.
//   2. Issues arrive in model order and are re-sorted on `done` into the
//      buffered path's order (document order, unlocatable last).
//
// And the reason the UI half exists at all: a highlight is on screen BEFORE
// `done`, while nothing has been recorded yet.
//
// Four backends, one module:  stream to done · stream cut before done ·
// in-band error after content · a JSON 429 with no stream at all.
//
// RUN:  node test/test-checker-stream.mjs        (from tsumiki-app/)

import { JSDOM } from "jsdom";
import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "..");

const SUBMITTED = "私は本を見てです";   // 私0 は1 本2 を3 見4 て5 で6 す7
// Deliberately NOT in document order, and the unlocatable one first: the
// sort on `done` is what has to put them right.
const ISSUES = [
  { type: "note", span: "です", start: 6, end: 8, located: true,
    pattern_name: "politeness", explanation: "third" },
  { type: "fix", span: "ぬ", start: -1, end: -1, located: false, reason: "not-found",
    pattern_name: "ghost", explanation: "unplaced" },
  { type: "fix", span: "は", start: 1, end: 2, located: true,
    pattern_name: "particle-wa-vs-ga", explanation: "first" },
  { type: "unnatural", span: "見て", start: 4, end: 6, located: true,
    pattern_name: "te-form-request", explanation: "second" },
];
const DONE = { schema: "naoshi-4", model: "test", verdict: "FIX",
  spans: { total: 4, located: 3, notFound: 1, overlapped: 0 }, usage: null,
  cap: { used: 3, limit: 10 } };

// ————— build once —————
const out = path.join(os.tmpdir(), `checker-stream-${Date.now()}.js`);
execFileSync("npx", ["esbuild", path.join(HERE, "checker-entry.jsx"), "--bundle",
  "--loader:.jsx=jsx", "--format=iife", "--jsx=automatic", "--outfile=" + out,
  '--define:process.env.NODE_ENV="development"',
  '--define:import.meta.env={"VITE_CHECKER_URL":"http://stub.invalid/check"}',
], { cwd: APP, stdio: ["ignore", "ignore", "pipe"] });
const bundle = fs.readFileSync(out, "utf8");

const failures = [];
const ok = (label, cond) => {
  if (!cond) { failures.push(label); console.log("FAIL  " + label); }
  else console.log("ok    " + label);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const frame = (ev, data) => `event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`;

// A backend that hands out frames when the test says so. `emit` pushes one
// frame; `close` ends the body. The response is what a real fetch returns:
// ok, a content-type header, and a ReadableStream body.
function streamingBackend() {
  const enc = new TextEncoder();
  let controller = null;
  const body = new ReadableStream({ start(c) { controller = c; } });
  return {
    response: {
      ok: true, status: 200, body,
      headers: { get: (k) => (k.toLowerCase() === "content-type" ? "text/event-stream; charset=utf-8" : null) },
      json: async () => { throw new Error("json() must not be called on a stream"); },
    },
    emit: (ev, data) => controller.enqueue(enc.encode(frame(ev, data))),
    close: () => controller.close(),
  };
}

async function mount(fetchImpl) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',
    { runScripts: "outside-only", pretendToBeVisual: true, url: "http://localhost/" });
  const w = dom.window;
  const errors = [];
  let posted = null;
  w.fetch = (url, init) => { posted = JSON.parse(init.body); return Promise.resolve(fetchImpl(posted)); };
  // jsdom does not ship these; the bundle resolves globals on the window.
  if (!w.TextDecoder) w.TextDecoder = TextDecoder;
  if (!w.TextEncoder) w.TextEncoder = TextEncoder;
  if (!w.ReadableStream) w.ReadableStream = ReadableStream;
  if (!w.AbortController) w.AbortController = AbortController;
  w.console.error = (...a) => {
    const s = a.join(" ");
    if (!/Not implemented|jsdom|Could not parse CSS/i.test(s)) errors.push(s);
  };
  w.console.warn = () => {};
  w.addEventListener("error", (e) => errors.push("UNCAUGHT: " + (e.error?.message || e.message)));
  w.eval(bundle);
  await sleep(500);
  const buttons = () => [...w.document.querySelectorAll("button")];
  const byText = (t) => buttons().find((b) => (b.textContent || "").includes(t));
  // Furigana is ON by default, and <rt> readings are part of textContent —
  // "見て" reads back as "見みて". Strip them before comparing any Japanese.
  const plain = (el) => { const c = el.cloneNode(true); c.querySelectorAll("rt").forEach((r) => r.remove()); return c.textContent || ""; };
  const text = () => plain(w.document.querySelector("#root"));
  const box = w.document.querySelector("textarea");
  if (!box) { console.error("!! no input — the module did not render"); process.exit(2); }
  const setter = Object.getOwnPropertyDescriptor(w.HTMLTextAreaElement.prototype, "value").set;
  setter.call(box, SUBMITTED);
  box.dispatchEvent(new w.Event("input", { bubbles: true }));
  await sleep(50);
  const check = byText("Check");
  if (!check) { console.error("!! no Check button"); process.exit(2); }
  check.click();
  await sleep(100);
  const stored = () => { const raw = w.localStorage.getItem("tsumiki-checker-history-v1"); return raw ? JSON.parse(raw) : null; };
  // Highlights are the buttons inside the marked-up text, labelled "<Tier>: <span>".
  const highlights = () => buttons().filter((b) => /^(Fix|Unnatural|Worth knowing): /.test(b.getAttribute("aria-label") || ""));
  const cards = () => [...w.document.querySelectorAll("[aria-expanded]")];
  return { w, errors, posted: () => posted, byText, text, plain, stored, highlights, cards };
}

// ————— 1. stream to done —————
{
  const be = streamingBackend();
  const t = await mount(() => be.response);
  ok("[done] the request opted in: stream:true", t.posted()?.stream === true);

  be.emit("overall", { natural_score: 3, summary: "One real slip." });
  await sleep(80);
  ok("[done] the summary is on screen before any issue", t.text().includes("One real slip."));
  ok("[done] no verdict while the stream is open", !/Nothing to change|FIX|UNNATURAL|WORTH KNOWING/.test(t.text()));
  ok("[done] no 'Nothing to correct' while the stream is open", !t.text().includes("Nothing to correct"));

  be.emit("issue", ISSUES[0]);
  await sleep(80);
  ok("[done] the first highlight lands before done", t.highlights().length === 1 && t.highlights()[0].getAttribute("aria-label") === "Worth knowing: です");
  ok("[done] nothing is recorded before done", t.stored() === null);
  ok("[done] the busy copy says more is coming", t.text().includes("Still writing up"));

  be.emit("issue", ISSUES[1]); be.emit("issue", ISSUES[2]); be.emit("issue", ISSUES[3]);
  await sleep(80);
  ok("[done] three located highlights, the unplaced one has a card and no highlight",
     t.highlights().length === 3 && t.cards().length === 4 && t.text().includes("couldn't locate"));
  // Arrival order on screen: cards render in array order, which is model order until done.
  ok("[done] cards are in ARRIVAL order while streaming",
     t.cards().map((c) => t.plain(c)).join("|").indexOf("です") < t.cards().map((c) => t.plain(c)).join("|").indexOf("は"));

  be.emit("rewrite", { model_rewrite: "私は本を見ています" });
  be.emit("readings", { readings: [["私", "わたし"], ["本", "ほん"], ["見", "み"]] });
  be.emit("done", DONE);
  be.close();
  await sleep(300);

  ok("[done] the verdict appears only after done", t.text().includes("FIX"));
  ok("[done] the cap line comes from done", t.text().includes("3 of 10 free checks used today"));
  ok("[done] the rewrite is shown", t.text().includes("私は本を見ています"));
  const order = t.cards().map((c) => t.plain(c));
  ok("[done] cards are re-sorted into document order with the unplaced one LAST",
     order[0].includes("は") && order[1].includes("見て") && order[2].includes("です") && order[3].includes("ぬ"));
  // The rendered sentence must still be the sentence submitted (offsets agree).
  const marked = t.w.document.querySelector("p[style*='break-all']");
  ok("[done] the marked-up text is still the submitted sentence", marked && t.plain(marked) === SUBMITTED);
  const map = t.stored();
  ok("[done] recorded exactly once, after done, with all four issues",
     map && (map._checks || []).length === 1 && map._checks[0].n === 4);
  ok("[done] the stored order is the sorted order", map && map._checks[0].issues[0].span === "は" && map._checks[0].issues[3].span === "ぬ");
  ok("[done] no console errors", t.errors.length === 0 || (console.log("      " + t.errors.join("\n      ")), false));
}

// ————— 2. the connection drops before done —————
{
  const be = streamingBackend();
  const t = await mount(() => be.response);
  be.emit("overall", { natural_score: 4, summary: "Nearly there." });
  be.emit("issue", ISSUES[2]);
  await sleep(80);
  be.close();   // no done, no error event: the connection just ended
  await sleep(300);
  ok("[cut] the partial content stays on screen", t.highlights().length === 1 && t.text().includes("Nearly there."));
  ok("[cut] the cut-off notice is shown", t.text().includes("cut off partway"));
  ok("[cut] no verdict", !/Nothing to change|FIX|UNNATURAL|WORTH KNOWING/.test(t.text().replace("Fix: は", "")));
  ok("[cut] never 'Nothing to correct'", !t.text().includes("Nothing to correct"));
  ok("[cut] nothing recorded", t.stored() === null);
  ok("[cut] no console errors", t.errors.length === 0 || (console.log("      " + t.errors.join("\n      ")), false));
}

// ————— 2b. the connection drops before ANY content — the case that must not read as a clean sentence —————
{
  const be = streamingBackend();
  const t = await mount(() => be.response);
  await sleep(50);
  be.close();
  await sleep(300);
  ok("[empty-cut] never 'Nothing to correct'", !t.text().includes("Nothing to correct"));
  ok("[empty-cut] an error is shown", !!t.w.document.querySelector("[role=alert]"));
  ok("[empty-cut] nothing recorded", t.stored() === null);
}

// ————— 3. an in-band error after content —————
{
  const be = streamingBackend();
  const t = await mount(() => be.response);
  be.emit("overall", { natural_score: 2, summary: "Several." });
  be.emit("issue", ISSUES[3]);
  await sleep(80);
  be.emit("error", { error: "upstream-timeout" });
  be.close();
  await sleep(300);
  ok("[error] partial content stays, marked cut off", t.highlights().length === 1 && t.text().includes("cut off partway"));
  ok("[error] it does NOT say 'nothing was lost' — a cap slot was spent on what is showing", !t.text().includes("Nothing was lost"));
  ok("[error] nothing recorded", t.stored() === null);
}

// ————— 4. a refusal before the stream: JSON 429, no body stream —————
{
  const t = await mount(() => ({ ok: false, status: 429, json: async () => ({ error: "daily-cap", cap: 10, used: 10 }) }));
  await sleep(300);
  ok("[429] the daily-cap copy still shows", t.text().includes("free checks used up"));
  ok("[429] nothing recorded", t.stored() === null);
  ok("[429] no console errors", t.errors.length === 0);
}

console.log(failures.length ? `\n${failures.length} FAILED` : "\nALL PASSED");
process.exit(failures.length ? 1 : 0);
