const fix = {
  "k-lines": { traced: ["一:trace"], recallBest: 5, recallOf: 5 },
  "k-frame": { traced: ["日:trace"], recallBest: 3, recallOf: 5 },
  "cc-intro": { read: true },
  "k-tree":  { traced: ["木:trace","本:trace","校:trace"] },
  "k-verbs": { traced: ["見:trace","来:trace","言:trace"] },
  "k-field": { traced: ["田:trace","男:trace"] },
  "k-sun":   { traced: ["白:trace","明:trace"] },
  "sb-tree": { traced: ["今:trace","木:trace"] },
};
const out = migrateProgressV2(fix);
const t = (id) => (out[id] || {}).traced || [];
const assert = (cond, msg) => { if (!cond) { console.error("FAIL:", msg); process.exit(1); } };
assert(out["k-lines"].recallBest === 5, "survivor untouched");
assert(out["k-frame"].recallBest === 3 && t("k-frame").includes("田:trace") && t("k-frame").includes("日:trace"), "survivor merged, not overwritten");
assert(out["cc-intro"].read === true, "cc survives");
assert(!out["k-tree"] && !out["k-verbs"] && !out["sb-tree"], "dead ids gone");
assert(t("k-t7").sort().join() === "木:trace,本:trace,言:trace", "k-t7 gets 木本言, deduped");
assert(t("k-t8").includes("校:trace"), "校 → k-t8");
assert(t("k-t4").includes("見:trace") && t("k-t5").includes("来:trace"), "verbs split by char");
assert(t("k-t6").includes("男:trace"), "男 → k-t6");
assert(t("sb-eye").includes("白:trace"), "白 falls back to sb-eye");
assert(t("k-t1").includes("今:trace") && !out["sb-lid"], "今 → k-t1, sb-lid starts fresh");
assert(out._migratedV2.from.length === 5, "marker lists the 5 dead ids present");
const again = migrateProgressV2(out);
assert(again === out, "idempotent");
const clean = { "k-lines": { traced: ["一:trace"] } };
assert(migrateProgressV2(clean) === clean, "no-op on clean storage");
console.log("ALL MIGRATION TESTS PASS");
