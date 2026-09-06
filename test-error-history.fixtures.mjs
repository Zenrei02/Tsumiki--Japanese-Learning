// Fixtures for test-error-history.py. Appended to the PURE CORE sliced out of
// naoshi-app/src/lib/errorHistory.js at run time, so these assertions run
// against the shipping code and not against a copy of it.

let fails = 0;
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function ok(label, cond) {
  if (!cond) { fails++; console.log("FAIL  " + label); } else { console.log("ok    " + label); }
}

const ISSUE = (p, t, extra = {}) => ({
  type: t, pattern_name: p, span: "は", correction: "が",
  explanation: "why " + p, start: 1, end: 2, located: true, ...extra,
});
const RESULT = (issues, extra = {}) => ({
  issues, readings: [["本", "ほん"]], verdict: issues.length ? "FIX" : "NONE",
  overall: { natural_score: 4, summary: "s" }, model_rewrite: "私が本を見ます", ...extra,
});
const check = (map, id, day, ctx, issues, text = "私は本を見て") =>
  foldCheck(map, { day, context: ctx, checkId: id, submitted: text, result: RESULT(issues) });

// ————— the record, now that it holds the whole submission —————

const two = [ISSUE("particle-wa-vs-ga", "fix"), ISSUE("te-form-request", "unnatural")];
const one = check({}, "a1", "2026-09-06", "polite", two);
const c0 = one[CHECKS][0];

ok("the submitted sentence is stored", c0.text === "私は本を見て");
ok("every issue is stored with its span, correction and explanation",
   c0.issues.length === 2 && c0.issues[0].span === "は" &&
   c0.issues[0].corr === "が" && c0.issues[0].exp === "why particle-wa-vs-ga");
ok("the offsets are stored, so a stored check can be re-highlighted",
   c0.issues[0].start === 1 && c0.issues[0].end === 2 && c0.issues[0].loc === true);
ok("the readings are stored, so furigana still works in review",
   eq(c0.readings, [["本", "ほん"]]));
ok("the natural rewrite and the score are stored",
   c0.rewrite === "私が本を見ます" && c0.score === 4);
ok("the ledger is still keyed by pattern_name",
   one["particle-wa-vs-ga"].length === 1 && one["te-form-request"].length === 1);
ok("the day is day-resolution, not a timestamp", /^\d{4}-\d{2}-\d{2}$/.test(c0.d));

// ⚠️ The ledger points at its example through the id rather than storing the
// link twice — that is what keeps the half that must survive longest light.
ok("a ledger entry's id resolves to its check and its issue",
   refOf(one["te-form-request"][0].id) === "a1" && ixOf(one["te-form-request"][0].id) === 1);

// ⚠️ THE PROPERTY THE DENOMINATOR RESTS ON. A clean check must still write, or
// commitIfWorked() cannot see it and the best sentence a learner can produce is
// the one thing that counts as nothing.
const clean = check({}, "b1", "2026-09-06", "casual", []);
ok("a check with NO issues still writes a _checks entry", clean[CHECKS].length === 1);
ok("...and files nothing in the ledger", Object.keys(clean).length === 1);
ok("_checks records how many issues the check returned", c0.n === 2);

// An unattributable issue keeps its example and its place in the denominator;
// only the ledger, which is indexed BY pattern, has nothing to file it under.
const partial = check({}, "c1", "2026-09-06", "polite",
  [{ type: "fix" }, ISSUE("  ", "fix"), ISSUE("x", "fix")]);
ok("an issue with no pattern_name files no ledger entry",
   eq(Object.keys(partial).sort(), [CHECKS, "x"]));
ok("...but is still stored on the check itself", partial[CHECKS][0].issues.length === 3);
ok("...and still counts toward the check's issue total", partial[CHECKS][0].n === 3);
ok("a pattern named like the reserved bucket is refused",
   !Object.keys(check({}, "d1", "2026-09-06", "polite", [ISSUE("_checks", "fix")]))
     .filter((k) => k !== CHECKS).length);

let twice = check({}, "e1", "2026-09-06", "polite", [ISSUE("particle-wa-vs-ga", "fix")]);
twice = check(twice, "f1", "2026-09-06", "polite", [ISSUE("particle-wa-vs-ga", "fix")]);
ok("the same pattern twice in one day is two entries", twice["particle-wa-vs-ga"].length === 2);
const same = check({}, "g1", "2026-09-06", "polite",
  [ISSUE("particle-wa-vs-ga", "fix"), ISSUE("particle-wa-vs-ga", "note")]);
ok("the same pattern twice in ONE check is two entries, not a collision",
   same["particle-wa-vs-ga"].length === 2);

// ————— unionHistory: the two properties the sync exemption rests on —————

const A = check({}, "A1", "2026-09-04", "polite", two);
const B = check({}, "B1", "2026-09-06", "casual", [ISSUE("particle-wa-vs-ga", "fix")]);

ok("union is order-independent — union(A,B) === union(B,A)",
   eq(unionHistory(A, B), unionHistory(B, A)));
ok("union is idempotent — union(A,A) === A", eq(unionHistory(A, A), A));
ok("union keeps both devices' checks", unionHistory(A, B)[CHECKS].length === 2);
ok("union keeps both devices' entries for a shared pattern",
   unionHistory(A, B)["particle-wa-vs-ga"].length === 2);
ok("union keeps a pattern only one device has",
   unionHistory(A, B)["te-form-request"].length === 1);
ok("union with an empty side changes nothing", eq(unionHistory(A, {}), A));
ok("union drops nothing when one side is a strict superset",
   eq(unionHistory(unionHistory(A, B), A), unionHistory(A, B)));

const A2 = check(A, "A2", "2026-09-07", "polite", [ISSUE("te-form-request", "note")]);
ok("a second sync from the same device adds only what is new",
   unionHistory(A2, unionHistory(A, B))["te-form-request"].length === 2);

// ————— trim: two budgets, because the halves weigh differently —————

let many = {};
for (let i = 0; i < MAX_CHECKS + 40; i++) {
  many = check(many, "z" + String(i).padStart(5, "0"),
               "2026-0" + (1 + (i % 9)) + "-01", "polite", []);
}
ok("the checks are capped by count", many[CHECKS].length <= MAX_CHECKS);
ok("the checks kept are the NEWEST", many[CHECKS][many[CHECKS].length - 1].d === "2026-09-01");

// The heavy half must be capped by BYTES, not only by count — 300 haiku and
// 300 essays are the same number and a hundredfold apart in weight.
let heavy = {};
const LONG = "あ".repeat(600);
for (let i = 0; i < 200; i++) {
  heavy = check(heavy, "h" + String(i).padStart(5, "0"), "2026-09-01", "polite",
                [ISSUE("p", "fix", { explanation: "x".repeat(1500) })], LONG);
}
ok("the checks are capped by bytes before they are capped by count",
   heavy[CHECKS].length < 200 &&
   JSON.stringify(heavy[CHECKS]).length <= MAX_CHECK_BYTES);

// ⚠️ THE LEDGER OUTLIVES THE CHECKS. "You have made this error 40 times" must
// stay true after the earliest examples have aged out of the byte budget.
ok("the ledger keeps entries whose checks were dropped",
   heavy["p"].length > heavy[CHECKS].length);

let ledger = {};
for (let i = 0; i < MAX_ENTRIES + 60; i++) {
  ledger = check(ledger, "L" + String(i).padStart(5, "0"),
                 "2026-0" + (1 + (i % 9)) + "-01", "polite", [ISSUE("q", "fix")]);
}
ok("the ledger is capped at MAX_ENTRIES", ledger["q"].length === MAX_ENTRIES);

// ⚠️ THE ONE THAT MATTERS. Trim per side before uniting and the result depends
// on which device happened to be fuller — and order-independence is the entire
// basis on which sync.js is allowed to merge this key without asking.
ok("trim after union is order-independent at the check cap",
   eq(unionHistory(many, B), unionHistory(B, many)));
ok("trim after union is order-independent at the ledger cap",
   eq(unionHistory(ledger, B), unionHistory(B, ledger)));

const sameDay = unionHistory(
  { p: [{ d: "2026-09-06", id: "b" }, { d: "2026-09-06", id: "a" }] },
  { p: [{ d: "2026-09-06", id: "c" }] },
);
ok("entries on the same day order by id, identically on both sides",
   eq(sameDay.p.map((e) => e.id), ["a", "b", "c"]));

ok("a non-array value for a key is ignored rather than thrown",
   eq(unionHistory({ p: "nonsense" }, A), A));
ok("entries with no id are dropped rather than duplicated forever",
   !unionHistory({ p: [{ d: "2026-09-06" }] }, {}).p);

// ————— ⭐ byErrorType: the view Lloyd asked for —————

// One sentence, three kinds of thing wrong with it.
const three = check({}, "T1", "2026-09-06", "polite", [
  ISSUE("particle-wa-vs-ga", "fix"),
  ISSUE("te-form-request", "unnatural"),
  ISSUE("keigo-overuse", "note"),
]);
const groups = byErrorType(three);
ok("byErrorType groups by error type", groups.length === 3);
ok("⭐ the SAME sentence appears under every type it was flagged for",
   groups.every((g) => g.examples.length === 1 && g.examples[0].check.id === "T1"));
ok("each group points at the ONE issue it is about, not all of them",
   eq(groups.map((g) => g.examples[0].issue.p).sort(),
      ["keigo-overuse", "particle-wa-vs-ga", "te-form-request"]));
ok("a group carries the tier its issue came back as",
   groups.find((g) => g.pattern === "keigo-overuse").tier === "note");

let freq = {};
for (let i = 0; i < 5; i++) {
  freq = check(freq, "F" + i, "2026-09-0" + (i + 1), "polite", [ISSUE("common", "fix")]);
}
freq = check(freq, "F9", "2026-09-06", "polite", [ISSUE("rare", "fix")]);
const fg = byErrorType(freq);
ok("the most frequent type comes first", fg[0].pattern === "common" && fg[0].total === 5);
ok("examples inside a group are newest first",
   fg[0].examples[0].check.d === "2026-09-05");

// A pattern whose tier varies is reported as the one it USUALLY is. Calling a
// forty-times "fix" a "note" because one of them was is how a real problem
// gets a soft label.
let mixed = check({}, "M1", "2026-09-01", "polite", [ISSUE("m", "fix")]);
mixed = check(mixed, "M2", "2026-09-02", "polite", [ISSUE("m", "fix")]);
mixed = check(mixed, "M3", "2026-09-03", "polite", [ISSUE("m", "note")]);
ok("a group's tier is the one it comes back as most often",
   byErrorType(mixed).find((g) => g.pattern === "m").tier === "fix");

// ⚠️ A group whose examples have aged out must still SHOW, with its count
// intact — a group that quietly shrinks reads as an error that stopped.
const aged = byErrorType(heavy).find((g) => g.pattern === "p");
ok("a type whose examples aged out still appears with its full count",
   aged && aged.total === heavy["p"].length);
ok("...and says how many sentences are no longer kept",
   aged.missing === aged.total - aged.examples.length && aged.missing > 0);

ok("byErrorType windows by day",
   byErrorType(freq, { since: "2026-09-04" }).find((g) => g.pattern === "common").total === 2);
ok("byErrorType never reports the reserved bucket as a type",
   !byErrorType(three).some((g) => g.pattern === CHECKS));
ok("recentChecks is newest first", recentChecks(freq)[0].id === "F9");

// ————— summarise —————

const s = summarise(unionHistory(A, B));
ok("summarise reports the denominator alongside the patterns", s.checks === 2);
ok("summarise counts issues across checks", s.issues === 3);
ok("a 'worth knowing' note is not counted as an error",
   summarise(A2).patterns["te-form-request"].errors === 1 &&
   summarise(A2).patterns["te-form-request"].notes === 1);
ok("summarise windows by day",
   summarise(unionHistory(A, B), { since: "2026-09-05" }).checks === 1);
ok("summarise excludes _checks from the pattern list",
   !Object.keys(s.patterns).includes(CHECKS));

console.log(fails ? `\n${fails} FAILED` : "\nall assertions passed");
process.exit(fails ? 1 : 0);
