// Fixtures for test-romaji-search.py. The romaji section of
// dictionary-module.jsx is sliced out at run time and PREPENDED to this file by
// the harness — same approach as test-weekly-window.py — so these assertions
// run against the shipping code rather than a copy of it.

let pass = 0, fail = 0;
const eq = (got, want, what) => {
  if (got === want) { pass++; }
  else { fail++; console.log(`  FAIL ${what}\n    got  ${JSON.stringify(got)}\n    want ${JSON.stringify(want)}`); }
};
const kana = (r) => romajiToKana(r).kana;

// ————— the words a learner actually types —————
eq(kana("taberu"),   "たべる",     "taberu");
eq(kana("neko"),     "ねこ",       "neko");
eq(kana("tsukue"),   "つくえ",     "tsukue");
eq(kana("jisho"),    "じしょ",     "jisho");
eq(kana("ryokou"),   "りょこう",   "ryokou");
eq(kana("ohayou"),   "おはよう",   "ohayou");
eq(kana("sakana"),   "さかな",     "sakana");

// ————— the two romanisations of the same sound —————
// An IME takes both; a learner taught Kunrei at school types the second.
eq(kana("shinbun"),  "しんぶん",   "shinbun (Hepburn)");
eq(kana("sinbun"),   "しんぶん",   "sinbun (Kunrei)");
eq(kana("jisho"),    kana("zisyo"), "ji/zi and sho/syo agree");
eq(kana("tsuki"),    kana("tuki"),  "tsu/tu agree");
eq(kana("fune"),     kana("hune"),  "fu/hu agree");
eq(kana("chikara"),  kana("tikara"),"chi/ti agree");

// ————— っ, the doubled consonant —————
eq(kana("kitte"),    "きって",     "kitte");
eq(kana("gakkou"),   "がっこう",   "gakkou");
eq(kana("chotto"),   "ちょっと",   "chotto");
eq(kana("zasshi"),   "ざっし",     "zasshi");

// ————— ん, the one that needs a rule —————
eq(kana("hon"),      "ほん",       "trailing n is ん");
eq(kana("hona"),     "ほな",       "n before a vowel is not ん");
eq(kana("nihon"),    "にほん",     "nihon");
eq(kana("konnichiwa"), "こんにちわ", "nn is ん");
eq(kana("nya"),      "にゃ",       "n before y stays open");
eq(kana("sanpo"),    "さんぽ",     "n before a consonant is ん");
eq(kana("shinya"),   "しにゃ",     "shinya — wapuro reading, as an IME gives it");
eq(kana("shinnya"),  "しんにゃ",   "shinnya is the spelling that forces ん");

// ————— long vowels and macrons —————
eq(kana("kyou"),     "きょう",     "kyou");
eq(kana("ōsaka"),    "おうさか",   "macron o folds to ou");
eq(kana("kūki"),     "くうき",     "macron u folds to uu");

// ————— what must NOT be treated as romaji —————
// These are English. The converter stops early and leaves a long tail, which
// is what romajiSearchable() reads to keep English queries out of kana search.
// Some stop immediately (a consonant cluster converts nothing); the ones that
// matter here are the ones that convert PART way and leave a tail, because
// those are what a loosened predicate would start swallowing.
for (const w of ["strength", "rhythm", "school", "thought", "flower",
                 "english", "monster", "handle", "printer"]) {
  eq(romajiSearchable(romajiToKana(w)), false, `${w} is not romaji`);
}

// AND THE LIMIT OF THE PREDICATE, asserted so nobody mistakes it for cleverer
// than it is: "manage" decomposes into perfectly good morae. No predicate can
// reject it without also rejecting a real word. What rejects it is the
// dictionary returning nothing for まなげ — search() only promotes kana results
// when there ARE any, which is the real filter.
eq(kana("manage"), "まなげ", "manage converts cleanly — the empty result set is what rejects it");
eq(romajiSearchable(romajiToKana("manage")), true, "…and the predicate cannot know better");

// ————— mid-keystroke —————
// A half-typed mora leaves one consonant. Still searchable, as a prefix.
eq(romajiSearchable(romajiToKana("tab")), true, "tab is still searchable");
eq(kana("tab"), "た", "tab converts as far as it can");
eq(romajiSearchable(romajiToKana("taberu")), true, "a complete word is searchable");
eq(romajiSearchable(romajiToKana("")), false, "empty is not searchable");

// ————— the known ambiguity, asserted so a change to it is deliberate —————
// `sake` is an English word AND 酒; `eat` decomposes into morae by accident.
// Both are allowed through to kana search on purpose — search() runs the
// English query too and only lets kana take the top slot on an EXACT match.
eq(kana("sake"), "さけ", "sake converts (English search still runs alongside)");
eq(romajiSearchable(romajiToKana("eat")), true, "eat converts by accident — English leads, kana follows");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
