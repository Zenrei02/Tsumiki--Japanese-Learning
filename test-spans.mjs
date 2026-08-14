// Tests for span verification — supabase/functions/_shared/spans.ts
//
// WHY THESE EXIST. A wrongly-placed span attaches an explanation to the wrong
// characters, and the learner cannot catch it — inability to judge the output
// is why they are using the tool. So the placement rules get tested against the
// cases that actually occur, not just a happy path.
//
// The Session 7 lesson applies here in particular: "openpyxl cell(value=None)
// is a no-op, not a clear — two guard tests appeared to pass while doing
// nothing because the fixtures were never broken." Every case below asserts a
// SPECIFIC placement, so a stub that returned [] would fail rather than pass.
//
// RUN:  node test-spans.mjs        (transpiles the .ts with esbuild first)

import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ESBUILD = "./naoshi-app/node_modules/.bin/esbuild";
const out = join(mkdtempSync(join(tmpdir(), "naoshi-spans-")), "spans.mjs");
execFileSync(ESBUILD, [
  "supabase/functions/_shared/spans.ts",
  "--bundle", "--format=esm", `--outfile=${out}`,
]);
const { placeSpans, segment, verdictOf } = await import(`file://${out}`);

let failures = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { console.log(`  ok   ${name}`); return; }
  console.log(`  FAIL ${name}\n       expected ${e}\n       actual   ${a}`);
  failures++;
}

// ── 1. the ordinary case ────────────────────────────────────────────────────
{
  const text = "私は毎日私の犬と散歩します。";
  const { issues, stats } = placeSpans(text, [
    { span: "私の", type: "unnatural" },
  ]);
  check("locates a simple span", [issues[0].start, issues[0].end, issues[0].located],
        [4, 6, true]);
  check("stats count it", [stats.located, stats.notFound, stats.overlapped], [1, 0, 0]);
  check("slice really is the span", text.slice(issues[0].start, issues[0].end), "私の");
}

// ── 2. the model paraphrased the span — the documented failure mode ─────────
{
  const text = "昨日、友達と映画を見ました。";
  const { issues, stats } = placeSpans(text, [
    { span: "友達と一緒に", type: "fix" },   // never appears verbatim
  ]);
  check("unfound span is not placed", [issues[0].start, issues[0].end], [-1, -1]);
  check("unfound span is marked", [issues[0].located, issues[0].reason], [false, "not-found"]);
  check("issue is KEPT, not dropped", issues.length, 1);
  check("stats report not-found", [stats.located, stats.notFound], [0, 1]);
}

// ── 3. a repeated particle — the bug claiming prevents ──────────────────────
//
// Without claiming, three は issues all resolve to index 1 and the learner sees
// one character wearing three explanations while the real sites go unmarked.
{
  const text = "これは本です。それは犬です。あれは猫です。";
  const { issues } = placeSpans(text, [
    { span: "は", type: "note" },
    { span: "は", type: "note" },
    { span: "は", type: "note" },
  ]);
  check("three は land on three DIFFERENT indices",
        issues.map((i) => i.start), [2, 9, 16]);
  check("all three located", issues.every((i) => i.located), true);
}

// ── 4. overlapping spans — the model broke its own contract ─────────────────
{
  const text = "日本語を勉強しています。";
  const { issues, stats } = placeSpans(text, [
    { span: "勉強しています", type: "fix" },
    { span: "しています", type: "unnatural" },  // nested inside the first
  ]);
  const first = issues.find((i) => i.span === "勉強しています");
  const second = issues.find((i) => i.span === "しています");
  check("first span wins", [first.start, first.located], [4, true]);
  check("nested span demoted, not deleted", [second.located, second.reason],
        [false, "overlap"]);
  check("both survive", issues.length, 2);
  check("stats separate overlap from not-found",
        [stats.overlapped, stats.notFound], [1, 0]);
}

// ── 5. empty and missing spans ──────────────────────────────────────────────
{
  const { issues, stats } = placeSpans("テスト", [{ type: "note" }, { span: "", type: "note" }]);
  check("missing span field handled", issues[0].located, false);
  check("empty span handled", issues[1].located, false);
  check("both counted as notFound", stats.notFound, 2);
}

// ── 6. no issues at all — the case the prompt is rewarded for ───────────────
{
  const { issues, stats } = placeSpans("今日はいい天気ですね。", []);
  check("clean text yields nothing", issues.length, 0);
  check("clean stats are zeroed", [stats.total, stats.located], [0, 0]);
}

// ── 7. segmentation drives rendering, so it must reconstruct the input ──────
{
  const text = "私は毎日私の犬と散歩します。";
  const { issues } = placeSpans(text, [
    { span: "私の", type: "unnatural" },
    { span: "散歩します", type: "note" },
    { span: "存在しない", type: "fix" },      // unlocatable — must not appear
  ]);
  const segs = segment(text, issues);
  check("segments rebuild the text exactly", segs.map((s) => s.text).join(""), text);
  check("marked segments are exactly the located spans",
        segs.filter((s) => s.issue).map((s) => s.text), ["私の", "散歩します"]);
  check("unlocatable span produced no segment",
        segs.some((s) => s.text === "存在しない"), false);
}

// ── 8. verdict ordering matches the harness and the eval dropdown ───────────
{
  check("fix wins", verdictOf([{ type: "note" }, { type: "fix" }, { type: "unnatural" }]), "FIX");
  check("unnatural beats note", verdictOf([{ type: "note" }, { type: "unnatural" }]), "UNNATURAL");
  check("note alone", verdictOf([{ type: "note" }]), "WORTH KNOWING");
  check("nothing is NONE", verdictOf([]), "NONE");
}

console.log("\n" + "─".repeat(60));
if (failures) {
  console.log(`FAILED — ${failures} assertion${failures === 1 ? "" : "s"}`);
  process.exit(1);
}
console.log("PASSED — span placement, fallback, overlap and segmentation all hold.");
