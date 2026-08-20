// Golden tests for the conjugator. Evals the FORMS-BEGIN…FORMS-END block out
// of the ROOT module source — one source of truth, no copied logic to drift.
// Every expectation below is a dictionary fact; if one fails, the rules are
// wrong, not the test.
import fs from "fs";
import { fileURLToPath } from "url";

const src = fs.readFileSync(
  fileURLToPath(new URL("../../vocabulary-module.jsx", import.meta.url)), "utf8");
const m = src.match(/\/\/ ————— Verb forms \(FORMS-BEGIN\) —————([\s\S]*?)\/\/ ————— FORMS-END —————/);
if (!m) { console.error("FAIL: FORMS block not found"); process.exit(2); }
const ctx = {};
new Function("exports", m[1] + "\nexports.conjugate=conjugate;exports.formDistractors=formDistractors;exports.FORMS=FORMS;exports.sampleDrill=sampleDrill;exports.FORM_POOL=FORM_POOL;")(ctx);
const { conjugate, formDistractors, FORMS, sampleDrill, FORM_POOL } = ctx;

const CASES = [
  // godan う-row
  ["買う", "godan-u", "masu", "買います"], ["買う", "godan-u", "te", "買って"],
  ["買う", "godan-u", "nai", "買わない"], ["買う", "godan-u", "potential", "買える"],
  ["買う", "godan-u", "volitional", "買おう"], ["買う", "godan-u", "passive", "買われる"],
  ["買う", "godan-u", "ba", "買えば"], ["買う", "godan-u", "imperative", "買え"],
  ["買う", "godan-u", "causative", "買わせる"], ["買う", "godan-u", "causPass", "買わせられる"],
  // く/ぐ/す/つ/む te-rows
  ["書く", "godan-ku", "te", "書いて"], ["急ぐ", "godan-gu", "te", "急いで"],
  ["話す", "godan-su", "te", "話して"], ["待つ", "godan-tsu", "te", "待って"],
  ["飲む", "godan-mu", "te", "飲んで"], ["飲む", "godan-mu", "ta", "飲んだ"],
  // 行く exception
  ["行く", "godan-ku", "te", "行って"], ["行く", "godan-ku", "ta", "行った"],
  ["行く", "godan-ku", "nai", "行かない"], ["行く", "godan-ku", "tara", "行ったら"],
  // the る-traps conjugate as godan
  ["帰る", "godan-ru", "te", "帰って"], ["帰る", "godan-ru", "nai", "帰らない"],
  ["帰る", "godan-ru", "potential", "帰れる"], ["入る", "godan-ru", "te", "入って"],
  ["知る", "godan-ru", "masu", "知ります"],
  // ichidan
  ["食べる", "ichidan", "te", "食べて"], ["食べる", "ichidan", "nai", "食べない"],
  ["食べる", "ichidan", "potential", "食べられる"], ["食べる", "ichidan", "volitional", "食べよう"],
  ["食べる", "ichidan", "imperative", "食べろ"], ["見る", "ichidan", "masu", "見ます"],
  ["起きる", "ichidan", "ta", "起きた"], ["食べる", "ichidan", "causPass", "食べさせられる"],
  // する compounds — suppletive, incl. 〜ず exception せず
  ["勉強する", "suru", "te", "勉強して"], ["勉強する", "suru", "potential", "勉強できる"],
  ["勉強する", "suru", "passive", "勉強される"], ["勉強する", "suru", "volitional", "勉強しよう"],
  ["勉強する", "suru", "ba", "勉強すれば"], ["勉強する", "suru", "zu", "勉強せず"],
  // 来る — kana on purpose
  ["来る", "kuru", "te", "きて"], ["来る", "kuru", "nai", "こない"],
  ["来る", "kuru", "potential", "こられる"], ["来る", "kuru", "ba", "くれば"],
  ["来る", "kuru", "imperative", "こい"], ["来る", "kuru", "volitional", "こよう"],
  // N3 additions
  ["飲む", "godan-mu", "hajimeru", "飲みはじめる"], ["食べる", "ichidan", "kakeru", "食べかける"],
  ["買う", "godan-u", "zu", "買わず"],
  // ある exception
  ["ある", "godan-ru", "nai", "ない"], ["ある", "godan-ru", "nakatta", "なかった"],
];

let fail = 0;
for (const [w, cls, form, want] of CASES) {
  const got = conjugate(w, cls, form);
  if (got !== want) { console.error(`✗ ${w} ${form}: got ${got}, want ${want}`); fail++; }
}
console.log(`${CASES.length - fail}/${CASES.length} golden forms correct`);

// Distractors must never contain the right answer, and must offer the trap.
for (const [w, cls, form] of [["帰る", "godan-ru", "te"], ["食べる", "ichidan", "potential"]]) {
  const correct = conjugate(w, cls, form);
  const d = formDistractors(w, cls, form, correct);
  if (d.includes(correct)) { console.error(`✗ distractors for ${w} ${form} contain the answer`); fail++; }
  if (!d.length) { console.error(`✗ no distractors for ${w} ${form}`); fail++; }
}
const ranuki = formDistractors("食べる", "ichidan", "potential", "食べられる");
if (!ranuki.includes("食べれる")) { console.error("✗ ら抜き distractor missing for 食べる potential"); fail++; }
const kaete = formDistractors("帰る", "godan-ru", "te", "帰って");
if (!kaete.includes("帰て")) { console.error("✗ ichidan-mistake distractor 帰て missing"); fail++; }

// The drill sampler: 6 items, all with answers, stratified.
for (const f of ["te", "potential", "zu"]) {
  const d = sampleDrill(f);
  if (d.length < 5) { console.error(`✗ drill for ${f} too small (${d.length})`); fail++; }
  if (!d.every((x) => x.correct)) { console.error(`✗ drill for ${f} has an unanswerable item`); fail++; }
  if (!d.some((x) => x.trap) && f !== "zu") { console.error(`✗ drill for ${f} skipped the る-traps`); fail++; }
}
// Ladder sanity: every pt id must be a real grammar point id in STEP_POINTS.
const sp = src.match(/const STEP_POINTS = (\{.*?\});\n/s);
const ids = new Set(JSON.parse(sp[1].replace(/;$/, "")) && Object.values(JSON.parse(sp[1])).flat());
for (const f of FORMS) if (!ids.has(f.pt)) { console.error(`✗ FORMS.${f.id} points at unknown grammar id ${f.pt}`); fail++; }

console.log(fail ? `FAILED — ${fail} problem(s)` : "PASSED — conjugator, distractors, drill sampler, ladder ids all check out");
process.exit(fail ? 1 : 0);
