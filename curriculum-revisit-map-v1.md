# Revisit map — what the grammar module cannot teach in one pass

**Read this before the next authoring pass on `grammar-module.jsx`.**

A linear syllabus teaches each point once, at one place. Some points cannot be
finished there — not because the explanation is weak, but because the learner
lacks the grammar needed to see the whole shape. Teaching them once and moving on
produces a learner who "did" は/が in Step 2 and still cannot use it in Step 11.

## The pattern already exists — it just isn't named

Two lessons already do this:

- `sb-waga` (Step 2 · Core particles) → `sb-waga2` (Step 11) — literally titled
  **「は vs が · second look」**
- `teiru` → `teiru2` (both Step 4) — 〜ています split into *ongoing* and
  *habit / state*

So the architecture is proven and the naming convention is half-invented. What is
missing is doing it deliberately, on the points that need it, rather than
wherever it happened to occur to us.

**Proposal:** make the revisit a first-class lesson kind alongside the existing
prefixes — `sb-` skill builder, `cc-` culture connection, `b-` composition,
`rc-` review. A revisit is not a review: `rc-` re-tests what was taught, a revisit
teaches something *new* about a point the learner already met.

## The map

| Point | First contact | Why it can't finish there | Revisit belongs |
|---|---|---|---|
| は / が | `sb-waga` — Step 2 | Contrast, scope, and が in subordinate clauses all need clause embedding | ✅ `sb-waga2` — Step 11. Done. Use as the template. |
| Pronoun omission | `sb-pronouns` — Step 3 (私・あなたを省く) | Step 3 teaches *drop it*. It cannot teach **when 私 is required**, because that case is mostly relative clauses — 名詞修飾 arrives in Step 4 | After `sb-nounmod` (Step 4), or Step 11. **Eval row E12** (`私が好きなスポーツは…`) is exactly this and is keyed CORRECT — a checker that "fixes" it is inventing an error |
| が vs を | `sb-ganotwo` — Step 10 (を じゃなくて が) | ⚠️ See below — the lesson conflates a hard rule with a soft preference | Same step; needs splitting, not a revisit |
| あげる / くれる / もらう | `ageru` — Step 8 | Perspective is learnable there; the keigo layer (いただく・くださる) and the が…くれる ↔ に…もらう choice are not | Stage 2, with keigo. **Regression R1 lives here** |
| Conditionals | `tara` — Step 12 (〜たら / 〜と) | 〜ば and 〜なら are not in Stage 1 at all, so the four-way contrast is structurally impossible | Stage 2, once all four exist. Unavoidable — flag it in Step 12 so the learner knows the set is incomplete |
| 自動詞 / 他動詞 | `sb-transitive` — Step 4 | Pairs are teachable early; the particle consequence (を with transitive, が with intransitive) keeps resurfacing, and it is one of the highest-frequency real error families in the chat logs | Light revisit in Step 10 alongside `sb-ganotwo` — both are "the particle follows the verb's nature" |
| に vs で | `sb-nide` — Step 2 | Extended by あります/います (Step 8) and 〜に行きます (Step 6), both after | Step 8, attached to `location` |
| 〜ています | `teiru` / `teiru2` — Step 4 | ✅ Already split. But state-vs-progressive depends on verb class, which needs vocabulary breadth | Watch in Stage 2; may need a third pass |

## ⚠️ Immediate consequence — `sb-ganotwo` needs a decision

Regression R6 (Aug 6 2026) found the checker flags `を好き` but **not**
`日本語を話せます`, and keeps `を` in its rewrite.

`sb-ganotwo` teaches both cases as one rule, sitting in Step 10 next to `suki`,
`jouzu`, `wakaru` and `potential` — the same grouping as the checker's L1
watchlist bullet, and with the same problem:

- 好き / 嫌い / 上手 / 下手 / 欲しい / わかる — が is effectively **obligatory**
- **Potential forms** — が and を are **both used**; が is the textbook default

Teaching them as one rule means the curriculum asserts something the checker
declined to assert. One of the two is wrong and they should agree.

**This is a reviewer question, not ours** — see the R6 write-up in
`prompt-regressions.md`. If they confirm `日本語を話せます` is natural, then
`sb-ganotwo` splits (or gains a caveat) **and** the watchlist bullet in
`SYSTEM_PROMPT` narrows — its own example currently asserts `日本語が話せる`.

Note this is also the module's best candidate for the **first spotlight**: the
lesson and the checker would then teach the same nuance from both directions.

## Where spotlights attach

Per `spotlight-design-v1.md`, spotlights are authored, reviewer-verified, keyed on
`pattern_name`. Every one of them has a home lesson — the spotlight is the
in-context teaser, the lesson is the full treatment, and they should deep-link.

| Spotlight | Home lesson |
|---|---|
| が/を with potentials | `sb-ganotwo` / `potential` — Step 10 |
| は vs が under contrast | `sb-waga2` — Step 11 |
| 〜てもらう vs 〜てくれる | `ageru` — Step 8 |
| 〜たら / 〜ば / 〜と / 〜なら | `tara` — Step 12 → Stage 2 |
| に vs で | `sb-nide` — Step 2 → Step 8 |
| 〜ている state vs progressive | `teiru2` — Step 4 |
| Pronoun kept vs dropped | `sb-pronouns` — Step 3 → Step 11 |

Every entry maps to a lesson that already exists. Spotlights need no new
curriculum — they need links into the curriculum we have.

## ⚠️ Naming collision

`wa` (Step 2) currently opens: **"は is a spotlight."**

If the feature ships as "Spotlight," the learner-facing word means two things in
the same product — one of them in the very first particle lesson. Rename one.
The lesson metaphor is good and load-bearing; the feature name is not yet
committed to anything.

## 📋 Audit queue — Saturday Aug 8 2026

Three items, found Aug 6–7 while mapping spotlights to lessons.

### 1. Factual error — `hiragana-module.jsx`, H-Series `exp` (~line 166)

> "This row matters again later, because **three of its kana** take on second jobs
> as particles — and **one of them** changes how it is read."

The H-series is は ひ ふ へ ほ. **Two** of its kana do particle duty — は and へ —
and **both** change reading (は→wa, へ→e). を is W-series, not this row.

The "three" almost certainly leaked from the note directly below it, which is
correct: *"は, へ and を get a lesson of their own once you finish the chart."*
Three particle kana in total; two of them in this row.

Suggested: *"two of its kana take on second jobs as particles — and both change
how they are read."*

AI-authored, so it belongs in the reviewer queue rather than being silently fixed.

### 2. Missing half of a cross-module lesson

`hiragana-module.jsx` has `{ id: "particles", kind: "skill" }` — 「は・へ・を」
*"when a kana stops sounding like itself"* — with four judge items, including
`はな は きれいです`, where は appears twice in one sentence read two ways. Good
lesson, and the H-series plants it in advance.

**The grammar module has no counterpart.** None of its thirteen `sb-` lessons
covers particle pronunciation; the quirk sits in one clause of `wa`'s `build`
field. Step 2 · Core particles is where all three characters land as grammar
(`wa`, `o`, and `ni-dest` covering に/へ).

This is the revisit pattern in its purest form: kana plants it before the learner
knows what a particle *is*, grammar completes it once they do. It also crosses
modules, which nothing else in this map does — worth deciding whether revisits
may span modules at all, since the kana modules gate Stage 1 but run separately.

### 3. Naming collision — `grammar-module.jsx`, `wa` lesson (~lines 373–374)

"は is a spotlight" appears twice, in `what` and `build`. Those are the only two
occurrences of the word in the entire project — kana, kanji and checker are all
clean. So this is a two-line fix if the Spotlight feature keeps its name.

### Where the audit does *not* need to spend time

Every numeric claim in both kana modules was checked — roughly forty across `exp`,
`why` and `en` fields. Only the H-series line above is wrong. The irregular-kana
count is internally consistent across three lessons (し・ち・つ・ふ, four, and the
"fourth and final" flag lands on ふ); 二十五 voiced sounds is right; the Y-series
"only three, i and e genuinely empty" is right; the ぢ/づ "two situations" is
right; the katakana シ・ツ・ソ・ン sequence correctly says three then four.

Counting claims are in good shape. Spend the audit elsewhere.

## Open, for the authoring pass

- **Does a revisit gate progression, or is it optional?** `rc-` checkpoints are
  currently ungated by design so testing stays friction-free. A revisit that can
  be skipped by the learner who most needs it is worth little.
- **Does the module surface "you'll see this again"?** A learner who knows は/が
  returns in Step 11 tolerates an incomplete Step 2 explanation. One who doesn't,
  concludes they failed to understand it.
- **Does the revisit re-use `point.id` or take a new one?** Progress keys on
  `point.id` (Session 5), so `sb-waga2` being a separate id means the two track
  independently — probably right, but it should be a decision rather than an
  accident.
