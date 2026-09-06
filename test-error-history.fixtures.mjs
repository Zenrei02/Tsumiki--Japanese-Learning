// Fixtures for test-error-history.py. Appended to the PURE CORE sliced out of
// naoshi-app/src/lib/errorHistory.js at run time, so these assertions run
// against the shipping code and not against a copy of it.

let fails = 0;
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function ok(label, cond) {
  if (!cond) { fails++; console.log("FAIL  " + label); } else { console.log("ok    " + label); }
}
const ids = (n, tag) => Array.from({ length: n }, (_, i) => `${tag}${i}`);

// ————— foldCheck —————

const issues = [
  { pattern_name: "particle-wa-vs-ga", type: "fix" },
  { pattern_name: "te-form-request", type: "unnatural" },
];
const one = foldCheck({}, { day: "2026-09-06", context: "polite", issues, ids: ids(3, "a") });

ok("a check files one entry per issue, keyed by pattern_name",
   one["particle-wa-vs-ga"].length === 1 && one["te-form-request"].length === 1);
ok("the tier travels with the entry",
   one["particle-wa-vs-ga"][0].t === "fix" && one["te-form-request"][0].t === "unnatural");
ok("the context travels with the entry", one["particle-wa-vs-ga"][0].c === "polite");
ok("the day is day-resolution, not a timestamp",
   /^\d{4}-\d{2}-\d{2}$/.test(one["particle-wa-vs-ga"][0].d));

// ⚠️ THE PROPERTY THE DENOMINATOR RESTS ON. A clean check must still write, or
// commitIfWorked() cannot see it and the best sentence a learner can produce is
// the one thing that counts as nothing.
const clean = foldCheck({}, { day: "2026-09-06", context: "casual", issues: [], ids: ids(1, "b") });
ok("a check with NO issues still writes a _checks entry", clean[CHECKS].length === 1);
ok("...and files no pattern entries", Object.keys(clean).length === 1);
ok("_checks records how many issues the check returned", one[CHECKS][0].n === 2);

// An unattributable issue must not invent a pattern, but must still count
// toward the denominator — otherwise the numerator and denominator disagree.
const partial = foldCheck({}, {
  day: "2026-09-06", context: "polite",
  issues: [{ type: "fix" }, { pattern_name: "  ", type: "fix" }, { pattern_name: "x", type: "fix" }],
  ids: ids(4, "c"),
});
ok("an issue with no pattern_name files no pattern", eq(Object.keys(partial).sort(), [CHECKS, "x"]));
ok("...but still counts toward the check's issue total", partial[CHECKS][0].n === 3);
ok("a pattern named like the reserved bucket is refused",
   !Object.keys(foldCheck({}, { day: "2026-09-06", context: "polite",
     issues: [{ pattern_name: "_checks", type: "fix" }], ids: ids(2, "d") }))
     .filter((k) => k !== CHECKS).length);

// The same error twice in one day is TWO events. A content hash would merge
// them and undercount exactly the learner who most needs the count to be right.
let twice = foldCheck({}, { day: "2026-09-06", context: "polite", issues: [issues[0]], ids: ids(2, "e") });
twice = foldCheck(twice, { day: "2026-09-06", context: "polite", issues: [issues[0]], ids: ids(2, "f") });
ok("the same pattern twice in one day is two entries", twice["particle-wa-vs-ga"].length === 2);

// ————— unionHistory: the two properties the sync exemption rests on —————

const A = foldCheck({}, { day: "2026-09-04", context: "polite", issues, ids: ids(3, "A") });
const B = foldCheck({}, { day: "2026-09-06", context: "casual",
  issues: [{ pattern_name: "particle-wa-vs-ga", type: "fix" }], ids: ids(2, "B") });

ok("union is order-independent — union(A,B) === union(B,A)",
   eq(unionHistory(A, B), unionHistory(B, A)));
ok("union is idempotent — union(A,A) === A", eq(unionHistory(A, A), A));
ok("union keeps both devices' entries for a shared pattern",
   unionHistory(A, B)["particle-wa-vs-ga"].length === 2);
ok("union keeps a pattern only one device has",
   unionHistory(A, B)["te-form-request"].length === 1);
ok("union with an empty side changes nothing", eq(unionHistory(A, {}), A));
ok("union drops nothing when one side is a strict superset",
   eq(unionHistory(unionHistory(A, B), A), unionHistory(A, B)));

// A device that synced, then kept working, then synced again.
const A2 = foldCheck(A, { day: "2026-09-07", context: "polite",
  issues: [{ pattern_name: "te-form-request", type: "note" }], ids: ids(2, "C") });
ok("a second sync from the same device adds only what is new",
   unionHistory(A2, unionHistory(A, B))["te-form-request"].length === 2);

// ————— trim: the ordering the union depends on —————

let big = {};
for (let i = 0; i < MAX_ENTRIES + 60; i++) {
  big = foldCheck(big, { day: "2026-0" + (1 + (i % 9)) + "-01", context: "polite",
                         issues: [], ids: ["z" + String(i).padStart(5, "0")] });
}
const total = (m) => Object.values(m).reduce((n, l) => n + l.length, 0);
ok("trim caps the store at MAX_ENTRIES", total(big) === MAX_ENTRIES);
ok("trim keeps the NEWEST days", big[CHECKS].every((e) => e.d >= "2026-01-01"));

// ⚠️ THE ONE THAT MATTERS. Trim per side before uniting and the result depends
// on which device happened to be fuller — and order-independence is the entire
// basis on which sync.js is allowed to merge this key without asking.
ok("trim after union is order-independent at the cap",
   eq(unionHistory(big, B), unionHistory(B, big)));

// Entries must sort the same way on both devices, so ties break on id.
const sameDay = unionHistory(
  { p: [{ d: "2026-09-06", id: "b" }, { d: "2026-09-06", id: "a" }] },
  { p: [{ d: "2026-09-06", id: "c" }] },
);
ok("entries on the same day order by id, identically on both sides",
   eq(sameDay.p.map((e) => e.id), ["a", "b", "c"]));

// Junk from a foreign writer must not crash a sign-in.
ok("a non-array value for a key is ignored rather than thrown",
   eq(unionHistory({ p: "nonsense" }, A), A));
ok("entries with no id are dropped rather than duplicated forever",
   total(unionHistory({ p: [{ d: "2026-09-06" }] }, {})) === 0);

// ————— summarise —————

const s = summarise(unionHistory(A, B));
ok("summarise reports the denominator alongside the patterns", s.checks === 2);
ok("summarise counts issues across checks", s.issues === 3);
ok("summarise separates notes from errors",
   s["patterns"]["te-form-request"].errors === 1 && s["patterns"]["te-form-request"].notes === 0);
const noted = summarise(A2);
ok("a 'worth knowing' note is not counted as an error",
   noted.patterns["te-form-request"].errors === 1 && noted.patterns["te-form-request"].notes === 1);
ok("summarise windows by day",
   summarise(unionHistory(A, B), { since: "2026-09-05" }).checks === 1);
ok("summarise excludes _checks from the pattern list",
   !Object.keys(s.patterns).includes(CHECKS));

console.log(fails ? `\n${fails} FAILED` : "\nall assertions passed");
process.exit(fails ? 1 : 0);
