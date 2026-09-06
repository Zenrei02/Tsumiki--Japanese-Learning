// Does a real check actually get recorded?
//
// WHY THIS EXISTS AND WHY test-error-history.py IS NOT ENOUGH. That test slices
// the pure core out of lib/errorHistory.js and proves the merge is sound. It
// says nothing about whether anything ever CALLS it. The wiring it cannot see:
//
//   · checker-module.jsx carries a NO-OP recordCheck that build-vite-app.py
//     deletes and replaces with an import. If that substitution stops matching
//     — a rename, a reformat — the app compiles, the checker works, every unit
//     test stays green, and nothing is ever recorded. Silently.
//   · the call passes `context`, which is the register selector's state. Pass
//     the wrong variable and every entry is filed under a register the learner
//     did not choose, which is not visible anywhere.
//
// Session 23's lesson, three times over: the only thing that caught anything
// was exercising the artifact. So this drives the real generated module in a
// DOM with a stubbed backend and reads the store afterwards.
//
// NEGATIVE CONTROL:  node test-checker-records.mjs --self-check
// rebuilds from a checker with the recordCheck call removed and requires the
// assertions to go RED. Without it this file is only evidence that something
// green happened.

import { JSDOM } from "jsdom";
import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "..");
const SELF_CHECK = process.argv.includes("--self-check");

const RESPONSE = {
  issues: [
    { type: "fix", span: "は", start: 1, end: 2, located: true,
      pattern_name: "particle-wa-vs-ga", note: "…" },
    { type: "unnatural", span: "見て", start: 3, end: 5, located: true,
      pattern_name: "te-form-request", note: "…" },
    { type: "note", span: "です", start: 6, end: 8, located: true,
      pattern_name: "particle-wa-vs-ga", note: "…" },
  ],
  readings: [],
};

// ————— build —————
const out = path.join(os.tmpdir(), `checker-records-${Date.now()}.js`);
let entry = path.join(HERE, "checker-entry.jsx");
let scratch = null;

if (SELF_CHECK) {
  // Remove the call site only. The import stays, so this is a test of the CALL
  // and not of whether the file happens to mention errorHistory — a control
  // that passes because it broke the build is not a control.
  scratch = fs.mkdtempSync(path.join(os.tmpdir(), "checker-mutant-"));
  // ⚠️ THE CONTROL'S OWN TRAP, AND IT FIRED ON THE FIRST ATTEMPT. Built from a
  // bare temp dir, esbuild cannot resolve "react-dom/client" — so the control
  // "failed", loudly, while proving nothing at all about the call site. That is
  // exactly the shape test-weekly-window.py's first control had: something did
  // go wrong, which is what makes it read as a working control. The mutant now
  // borrows the app's real node_modules so the ONLY difference between it and a
  // passing run is the missing recordCheck call.
  fs.symlinkSync(path.join(APP, "node_modules"), path.join(scratch, "node_modules"), "dir");
  const modDir = path.join(scratch, "modules");
  fs.mkdirSync(modDir, { recursive: true });
  const real = path.join(APP, "src/modules/Checker.jsx");
  let src = fs.readFileSync(real, "utf8");
  const call = /\s*try \{ await recordCheck\(context, data\.issues\); \}\n\s*catch \(e\) \{[^\n]*\n/;
  if (!call.test(src)) {
    console.error("!! self-check landmark not found — the control cannot be trusted");
    process.exit(2);
  }
  src = src.replace(call, "\n").replace(
    'import { recordCheck } from "../lib/errorHistory.js";',
    'import { recordCheck } from "../lib/errorHistory.js";\nvoid recordCheck;');
  fs.writeFileSync(path.join(modDir, "Checker.jsx"),
    src.replace(/"\.\.\/lib\//g, `"${APP.replace(/\\/g, "/")}/src/lib/`));
  entry = path.join(scratch, "entry.jsx");
  fs.writeFileSync(entry,
    'import { createRoot } from "react-dom/client";\n' +
    `import { installStorage } from "${APP.replace(/\\/g, "/")}/src/lib/storage.js";\n` +
    'import Checker from "./modules/Checker.jsx";\n' +
    "installStorage();\n" +
    'createRoot(document.getElementById("root")).render(<Checker />);\n');
}

execFileSync("npx", ["esbuild", entry, "--bundle", "--loader:.jsx=jsx",
  "--format=iife", "--jsx=automatic", "--outfile=" + out,
  '--define:process.env.NODE_ENV="development"',
  '--define:import.meta.env={"VITE_CHECKER_URL":"http://stub.invalid/check"}',
], { cwd: APP, stdio: ["ignore", "ignore", "pipe"] });

// ————— drive —————
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',
  { runScripts: "outside-only", pretendToBeVisual: true, url: "http://localhost/" });
const w = dom.window;
const errors = [];
let posted = null;
w.fetch = (url, init) => {
  posted = JSON.parse(init.body);
  return Promise.resolve({ ok: true, status: 200, json: async () => RESPONSE });
};
w.console.error = (...a) => {
  const s = a.join(" ");
  if (!/Not implemented|jsdom|Could not parse CSS/i.test(s)) errors.push(s);
};
w.console.warn = () => {};
w.addEventListener("error", (e) => errors.push("UNCAUGHT: " + (e.error?.message || e.message)));
w.eval(fs.readFileSync(out, "utf8"));
await new Promise((r) => setTimeout(r, 800));

const buttons = () => [...w.document.querySelectorAll("button")];
const byText = (t) => buttons().find((b) => (b.textContent || "").includes(t));

const failures = [];
const ok = (label, cond) => {
  if (!cond) { failures.push(label); console.log("FAIL  " + label); }
  else console.log("ok    " + label);
};

// Choose a register that is NOT the default, so a call passing the wrong
// variable cannot pass by coincidence.
const casual = byText("Casual");
if (!casual) { console.error("!! no register selector — the module did not render"); process.exit(2); }
casual.click();
await new Promise((r) => setTimeout(r, 100));

const box = w.document.querySelector("textarea");
if (!box) { console.error("!! no input — the module did not render"); process.exit(2); }
const setter = Object.getOwnPropertyDescriptor(w.HTMLTextAreaElement.prototype, "value").set;
setter.call(box, "私は本を見てです");
box.dispatchEvent(new w.Event("input", { bubbles: true }));
await new Promise((r) => setTimeout(r, 100));

const check = byText("Check");
if (!check) { console.error("!! no Check button"); process.exit(2); }
check.click();
await new Promise((r) => setTimeout(r, 900));

ok("the check actually reached the (stubbed) backend", posted && posted.text === "私は本を見てです");

const raw = w.localStorage.getItem("checker-history-v1");
ok("a graded check writes checker-history-v1", raw != null);

const map = raw ? JSON.parse(raw) : {};
ok("the store is keyed by pattern_name",
   Array.isArray(map["particle-wa-vs-ga"]) && Array.isArray(map["te-form-request"]));
ok("a pattern seen twice in one check gets two entries",
   (map["particle-wa-vs-ga"] || []).length === 2);
ok("the tier is recorded per occurrence, not per pattern",
   (map["particle-wa-vs-ga"] || []).map((e) => e.t).sort().join(",") === "fix,note");
ok("the denominator is recorded", (map._checks || []).length === 1 && map._checks[0].n === 3);
// The whole point of choosing Casual above.
ok("the entry carries the register the LEARNER chose, not the default",
   (map._checks || [])[0]?.c === "casual");
ok("nothing threw on the way", errors.length === 0 || (console.log(errors), false));

fs.unlinkSync(out);
if (scratch) fs.rmSync(scratch, { recursive: true, force: true });

if (SELF_CHECK) {
  if (!failures.length) {
    console.log("\n!! CONTROL DID NOT FIRE — a checker with no recordCheck call " +
      "still recorded.\n   These assertions are not testing the wiring. Fix the test.");
    process.exit(1);
  }
  console.log(`\ncontrol fired as required: ${failures.length} assertion(s) red ` +
    "when the call site is removed");
  process.exit(0);
}
console.log(failures.length ? `\n${failures.length} FAILED` : "\nchecker records as designed");
process.exit(failures.length ? 1 : 0);
