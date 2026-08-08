# Kanji Pipeline — Tokenizer Options

*Draft, July 28 2026. Covers tracker row "Kanji display pipeline: tokenizer annotation, verified levels, higher-kanji setting". Library status and versions need re-verifying at build time — this moves fast.*

---

## What you're actually buying

The row currently reads as one task. It's three, and they have different answers.

| Job | What's needed | Solved by |
|---|---|---|
| **1. Segmentation** — where do words start and end | Morphological analyser | Any option below |
| **2. Readings** — what kana go over which kanji | Analyser + okurigana alignment | Analyser gives word-level reading; alignment is a second layer |
| **3. JLPT level tags** — is this word above N5 | Kanji/vocab level dataset | **None of them.** Separate data problem |

Job 3 is the one most likely to bite. No tokenizer returns JLPT levels. KANJIDIC2 carries level tags but against the pre-2010 four-level JLPT, so they need remapping to N1–N5, and remapping is lossy at the boundaries. Vocabulary-level tagging (as opposed to per-kanji) has no authoritative source at all — JLPT stopped publishing official lists in 2010. Community lists exist and disagree with each other.

**Implication:** your ~110-word hand-tagged prototype dictionary is not just small, it's solving a problem the tokenizer won't solve at any size. Budget for it separately, and treat the level tags as reviewer-verified content rather than library output.

---

## Three different runtime moments

Worth separating, because they have different constraints.

| Moment | Volume | Latency tolerance | Quality bar |
|---|---|---|---|
| **Build-time** — annotating your 100 authored lesson modules | One-off batch | None. Run it overnight | Highest — reviewer sees this |
| **Runtime, generated** — AI-produced quiz stems and examples | Per request | ~100ms | High |
| **Runtime, learner input** — tappable words in submitted sentences | Per submission | ~100ms | Medium |

Build-time is a batch job where quality is everything and speed is irrelevant. That's most of your content. It argues for picking on accuracy, not throughput — the benchmark numbers you'll find comparing these tools are mostly measuring the thing you care least about.

---

## The options

### A — kuromoji.js (JavaScript)

Pure-JS port of the Java Kuromoji analyser. Returns surface form, POS, base form, reading, and pronunciation per token. Runs in Node or the browser.

**For:** no separate service, no non-JS runtime, works directly in a Next.js API route. If your stack is JS end-to-end, this is the zero-friction option. Pairs with kuroshiro for furigana/okurigana alignment, which is the layer you actually need.

**Against:** the dictionary is IPADIC-based and ships as multi-megabyte files that must be loaded before first tokenization. Browser-side that's a serious first-load cost on mobile — strong argument for running it server-side even though it *can* run client-side. Upstream maintenance has been intermittent; several forks exist (ES-module builds, typed builds), which is a maintenance signal in both directions.

### B — MeCab + fugashi (Python)

The long-standing C++ analyser with a well-regarded Python wrapper. Fast, battle-tested, huge amount of prior art.

**For:** fastest of the mainstream options, and the dictionary choice is yours — IPADIC, UniDic, or NEologd for contemporary vocabulary. UniDic gives more principled readings; IPADIC is the common default and is what most furigana tooling assumes.

**Against:** needs a Python service, so it's a second runtime unless your backend is already Python. Native compilation adds deployment friction on serverless platforms. Core MeCab has been essentially unchanged for over a decade — stable, but nobody is fixing anything either. Dictionary choice materially changes reading output, which is a real footgun: pick one and pin it.

### C — Sudachi / SudachiPy (Python or Java)

Newer analyser, actively maintained for business use, with three segmentation granularities (A short / B middle / C long) selectable per call. Exposes readings directly.

**For:** the best-maintained option, and the split modes are genuinely useful for you specifically — mode C gives longest-match units, which is what you want for tappable-word popups, while shorter modes suit grammatical analysis. One library, two behaviours. Dictionary is UniDic-like and updated.

**Against:** slower than MeCab. Python or JVM only, so same second-runtime problem as B. Dictionary packages are large.

### D — Lindera / Vibrato (Rust)

Modern Rust reimplementations, MeCab-dictionary-compatible. Vibrato is substantially faster than MeCab on the same dictionary; Lindera has WASM builds.

**For:** WASM opens the door to running the same analyser server-side and client-side from one binary, which is architecturally tidy. Fast.

**Against:** smallest ecosystem and the least prior art for furigana specifically. You'd be building the alignment layer yourself. For a solo side project this is the option most likely to cost you a weekend you didn't budget.

---

## Recommendation shape

**If the stack ends up JS/TypeScript (Next.js, Vercel):** kuromoji.js + kuroshiro, run server-side in an API route, never in the browser. One runtime, no extra service, and the furigana alignment problem is already solved for you. Accept IPADIC's limitations.

**If the stack ends up Python:** Sudachi, mode C for display units. Better maintained than MeCab and the split modes earn their keep. You'll write the alignment layer, which is more work than kuroshiro but not hard.

**Either way, run it server-side.** Multi-megabyte dictionary downloads on a mobile first-load are worse than a round trip, and server-side means one code path for build-time and runtime.

---

## The pattern worth adopting

You already have the model self-annotating 【word|reading】 after the ご飯 leak. Don't throw that away when the tokenizer lands.

**Use the tokenizer as a verifier, not a generator.** The model annotates; the tokenizer independently tokenizes the same string and checks that the readings agree. Disagreement flags the word rather than silently picking a winner.

This catches the failure mode neither one catches alone:
- The model hallucinates a plausible-but-wrong reading — tokenizer disagrees, flag raised
- The tokenizer mis-segments an unusual construction — model's annotation disagrees, flag raised

It also gives you a free quality signal. Log the disagreement rate; if it climbs after a prompt change, something regressed.

Ambiguous readings are where this pays off most — 日本 (にほん/にっぽん), 何 (なに/なん), 上手 (じょうず/うわて/かみて), 今日 (きょう/こんにち). Analysers pick one and state it confidently. A learner-facing app should not.

---

## Open questions before deciding

1. **Stack.** JS or Python? This decides A vs C more than any quality difference between them.
2. **JLPT level source.** KANJIDIC2 remapped, a community vocabulary list, or hand-curated and reviewer-verified? Affects how big the "verified levels" job is.
3. **Per-kanji or per-word levels?** Your current rule ("above-N5 words render in kana") is word-level, but KANJIDIC2 is kanji-level. A word of two N5 kanji may still be an N3 word. Worth deciding before building the data.

Question 3 is the one I'd think about first — it changes what dataset you need, and it's the kind of thing that's expensive to reverse once 100 modules are tagged.
