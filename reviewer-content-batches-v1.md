# Reviewer content batches — v1, 2026-08-13

The unreviewed AI-authored inventory grew a lot in Session 13 (47 kanji, 4
grammar lessons). Per Lloyd: split it into batches the reviewer can take one
at a time. Each batch is sized to be finishable in one sitting, states exactly
what to check, and can be sent independently — a batch's verdicts are useful
even if the next batch waits a month.

Master lists live on two tracker rows ("Reviewer pass on kanji module content"
carries every claim by risk level; "Revisit map" carries the grammar items).
This file is the sending order and the per-batch scope, nothing more.

**Not in any batch here:** the sb-ganotwo / R6 question (が with potentials).
Already with the reviewer via reviewer-followup-2026-08-12.md, and it blocks
curriculum + SYSTEM_PROMPT edits — it stays first in line wherever it is.

## Recommended order

E → B → C → D → A. E is smallest and unblocks grammar authoring; B–D are the
new kanji in teaching order (verdicts on early groups matter to more learners
sooner); A is legacy phrasing that has already survived two sessions of use.

---

## Batch E — grammar copy from the revisit pass (smallest; ~20 sentences)

Where: grammar-module.jsx — sb-nide2, sb-pronouns2, sb-transitive2,
sb-kanaparticles, plus the tara watch addition.

1. **sb-nide2's core claim**: あります meaning "is held / takes place" puts で
   on the place — 明日、学校でパーティーがあります. Is the example natural,
   and is the rule stated tightly enough?
2. **sb-pronouns2 / E12 alignment**: 私が好きなスポーツはテニスです presented
   as fully natural; "inside a describing clause the subject takes が, never
   は" — confirm the never.
3. **sb-kanaparticles**: the IME claims (type ha for は, wo for を) and the
   はなはきれいです double-reading example.
4. **tara flag**: the four-ifs sentence — accurate as stated?
5. Carried from Session 7, never sent: the two UniDic-flagged readings in
   vocab-notes (お茶 multi-token; 言う ゆう-vs-いう).
6. **Added later in Session 13** (commit f38af96): sb-no's claim that の
   never attaches describing-words (きれいの人 wrong — any counterexamples
   worth teaching?); cc-n's 学生なんです な-insertion rule; cc-nakya's
   clipped forms and registers; sb-must's two-slot claim (なければ・ないと・
   なきゃ × なりません・いけません・だめ — "most combinations work"; confirm
   which don't); Step 13: てある with transitive + が stated hard,
   窓が開いてある called an error, ちゃいました described as
   polite-in-shape-casual-at-heart, 合格してしまいました reads as regret.
7. **The nine shipped queue lessons** (commit f886fb6): sb-yone's claim
   that 疲れていますよ is presumptuous; sb-counters' shift set
   (いっぽん・にほん・さんぼん・ろっぽん) and the "wrong counter understood,
   missing counter broken" claim; sb-kosoado's "それ even in their hands at
   distance" framing; cc-family's full humble/honorific sets and the
   お母さん-to-a-stranger judgment; cc-ogo's お/ご native-vs-Sino split
   (known to have exceptions — how should the lesson hedge?) and the
   fossilized list; cc-kedo's けど-request register claims; cc-drop's
   "が and に mostly stay" generalization; cc-aizuchi's はい-means-go-on
   and the meetings warning; cc-ritual's よろしくお願いします gloss and
   いただきます-even-alone claim.
8. **cc-yes** (Step 1): the はい/ええ/うん register ladder; そうですね as
   thinking-time; echo-the-predicate as "the most native yes"; and the
   negative-question claim (はい agrees with the negative) — state of the
   art says this is right but usage wobbles in real speech; how hard
   should the lesson state it?
9. **sb-negq + cc-no** (commit pending): sb-negq's "both systems agree on
   positive questions" framing and the skip-the-particle escape-hatch
   advice ("native speakers do this constantly" — confirm); cc-no's
   readings of ちょっと…/難しいですね/考えておきます/また今度 as
   refusals — the register judgments here are the most culture-loaded
   claims in the module and deserve the reviewer's closest read; also the
   recommended response そうですか、また今度ぜひ.

## Batch B — kanji Group 3, 17 characters (五六九会電開買作文使書朝起帰週毎曜)

Where: kanji-module.jsx k-t9…k-t13, sb-gate, cp-day + K entries.

- Flat claims to verify: 電 "originally meant lightning"; 曜 luminaries → day
  names; 買 net-over-貝, shells-as-money.
- Framings to sanity-check: 朝 (picture-not-history), 会 (family resemblance
  only), 帰 ("parts do not tell an honest story" — is that fair?), 毎
  (deliberately anti-etymology).
- Readings: 九時 くじ; 何曜日 gloss; all kun splits in the 17 K entries.
- The three stroke-rule lines (machine-checked against KanjiVG path order;
  needs a human eye once).

## Batch C — kanji Group 4, 14 characters (名前語高安新広思待始終飲茶歩)

Where: k-t14…k-t17, sb-tera, cp-desc + K entries.

- Hedged stories: 名 (evening+mouth), 安 (roof account — also judge the TONE),
  新 (axe), 思 (skull-not-field double claim), 終 (thread+winter as image).
- sb-tera's aggregate claim: left-names-topic / right-carries-sound is "the
  pattern most kanji are built on" — check the phrasing strength.
- ⚠️ The 時 DISCREPANCY now has three voices (old temple story, Tail 1
  sound-carrier, sb-tera sound-carrier). **Rule on it in this batch** — one
  account survives and the loser gets edited out everywhere.
- Readings: さんぽ rendaku note; 始 kun split; 茶 チャ・サ.

## Batch D — kanji Group 5, 16 characters (聞物写真勉強意味寒暑忙痛寝洗歯散)

Where: k-t18…k-t21, sb-gate2, cp-feel + K entries.

- Stories: 物 ox-radical (hedged), 忙 heart+亡 (hedged), 寝 bed-and-broom
  (explicitly loose), 歯 picture claim, 真 "true-copy" word-coinage claim,
  意 = 音+心 gloss.
- Readings: 聞く hear/ask double duty; **果物 くだもの — jukujikun**, feeds
  the exception-list row; 真ん中 まんなか; 得意 とくい.
- Consistency: k-t20 repeats sb-orthography's 暑い/熱い example — if either
  text changes, both must.

## Batch A — legacy items (Sessions 3–10; survived use, lowest urgency)

- Session 10 list: 先生 "born before", 行 crossroads, 私 禾+厶, 力 flexed arm,
  the eight tail-group texts.
- katakana-vocab-v1.json: 16 readings/glosses (dictionary facts, derived).
- The kana H-series factual fix from audit-2026-08-08.md (two particles, not
  three) — a two-line edit awaiting sign-off.

---

Bookkeeping when a batch comes back: verdicts land on the relevant tracker
row, edits go into the module masters (whole-file deliverables), and anything
that changes a story shared between two texts gets both texts in one commit.
