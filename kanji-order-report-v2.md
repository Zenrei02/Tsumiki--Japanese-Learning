# Kanji order v2 — 2026-08-08

Supersedes `kanji-order-report.md` (v1, 2026-08-03). Same method; the two blockers v1 raised are resolved here rather than deferred.

Corpora merged: kanjidic (newspaper rank).
Demand source: word-ledger-v1.json (286 words).

## Blocker 1 — untaught components: resolved, no promotions

v1 listed 22 characters containing parts the syllabus never teaches and asked whether to promote the parts, frame them as shape-only, or move the characters later. Checked against the ledger the question collapses:

| Candidate part | Ledger word-demand |
|---|---:|
| 可 | 1 |
| 門 | 0 |
| 米 | 0 |
| 玉 | 0 |
| 刀 | 0 |
| 寺 | 0 |
| 交 | 0 |
| 舌 | 0 |
| 禾 | 0 |
| 囗 | 0 |
| 彳 | 0 |
| 丁 | 0 |
| 儿 | 0 |

### The one authored override — 言 is promoted

Lloyd's call, Session 9, and it is worth recording as an override rather than folding it into the rule. 言 has the most demand of any candidate and still only 2, so the demand rule alone would have left it a named shape. It is promoted on grounds the ledger cannot see: **言う is a high-frequency verb in its own right, and 言 is the backbone of 話, 読む, 語, 言語** — most of which sit just past this syllabus. The ledger measures the corpus as it is today, not as it will be two stages out. That is a genuine limitation of demand-driven ordering and this is the first case where it bites.

⚠️ **Not free.** 言 has no KanjiVG stroke paths and no dictionary entry in `kanji-module.jsx` — it appears there only as a part of 話. Promoting it needs stroke paths, a dictionary entry with readings, and a lesson slot **before this order can be applied**. The pipeline places it; it cannot supply the data.

### Everything else stays out

**No other component carries enough demand to earn a syllabus slot.** Promoting them would teach characters the learner never reads, to satisfy a decomposition graph — the same mistargeting the word-driven method exists to prevent. So the resolution is not to add characters but to state what was always true: **KanjiVG decomposition is a structural fact and carries no pedagogical claim.** The module already applies that locally, overriding KanjiVG's 白 ⊃ 日 because the shape is real and the meaning is not. v2 makes it a rule, and classifies every part:

**Named shapes (13)** — glossed on the card as a shape, never taught, never scheduled, never in `KANJI_SYLLABUS`. Cost +0.5 for the glance.

- **門** — gate — the shape is a pair of doors, and it recurs widely later
- **米** — rice — honest as a shape in 来, though not its true origin
- **玉** — jewel — 'a jewel inside a border' is a good story for 国
- **刀** — blade — pairs with 八 'divide' to make 分 read as splitting
- **寺** — temple — recurs in 持, 待, 特, so the glance is repaid
- **交** — crossing — 校 as 'where paths cross by the trees'
- **舌** — tongue — with 言 it makes 話 obviously about talking
- **可** — possible — abstract, but it is a real character the learner may meet
- **禾** — grain (radical) — the leaning tree-like shape on the left of 私
- **囗** — enclosure (radical) — the full box, distinct from 口 the mouth
- **彳** — going (radical) — the 'step' on the left of 行
- **丁** — block — a real if uncommon character; 町 is 'fields plus blocks'
- **儿** — legs (radical) — 見 as an eye on legs is well attested and memorable

**Muted shapes (10)** — hidden from the card entirely; the character is atomic for teaching. Cost +0.0. These do not merely fail to help — showing them misleads.

- **丿** — a single diagonal stroke, not a component
- **丨** — a single vertical stroke, not a component
- **乙** — effectively the whole of 七; decomposing it says nothing
- **卜** — artifact — 上 and 下 are atomic 3-stroke characters
- **冂** — artifact — 円's frame, no separable meaning
- **干** — misleading — 年 is historically 禾 + 千, not this
- **乂** — a stroke pair inside 気, no gloss possible
- **厶** — artifact in 私, no honest meaning
- **毋** — circular — this is just 母's own frame
- **气** — the vapour frame of 気; the character's story is better told whole

The cost consequence is a correction, not a loosening: v1 charged a flat +1.5 for every foreign part, which penalised simple characters (上 下 七 千 中 年 気 母 円 四) for artifacts of the decomposition rather than for anything a learner has to do.

## Blocker 2 — newspaper-only frequency: measured, not guessed

The scriptin corpora are still absent, so the frequency term still inherits KANJIDIC2's newspaper skew (Session 4 Decision 8). Rather than warn about it again, v2 measures how much the order depends on that term:

| Frequency weight | Kendall τ vs base (0.3) | Max displacement | Chars moved ≥10 |
|---:|---:|---:|---:|
| 0.00 | 0.9871 | 4 | 0 |
| 0.15 | 0.997 | 2 | 0 |
| 0.30 ← base | 1.0 | 0 | 0 |
| 0.50 | 0.9901 | 5 | 0 |

**Not blocking.** Dropping the frequency term entirely leaves the order substantially intact (τ = 0.9871, 0 characters moving ten places or more). Word-demand and component structure are doing the work; the newspaper skew rides on a term that barely steers. The order can be applied now, and the scriptin merge treated as a refinement rather than a prerequisite.

```
wget -P freq-data https://raw.githubusercontent.com/scriptin/kanji-frequency/master/data2015/{aozora,news,twitter}.json
```
(scriptin/kanji-frequency, CC-BY-4.0. Run on your own machine — the sandbox proxy refuses GitHub raw.)

## Blocker 3 — Stage 0 was being reordered by a criterion that does not apply

**A recorded limitation, not a discovery.** The v1 tracker row lists it among its own caveats — *"Stage 0's stroke-rule constraint is not modelled"* — so this was known when v1 shipped. What v2 adds is the measurement of what the omission cost, and the fix.

The module's first block is not a centrality decision: its **25** characters are chosen because between them they demonstrate the nine stroke rules, and the pipeline has no visibility of that criterion. v1 sorted all 63 together, so 口, 川, 田, 中, 四, 山 and 女 were each pushed forty-odd places down the list and the report presented those as the method paying off.

They were not. **15 of the 42 'large moves' v1 reported — 人 入 八 二 水 月 小 国 田 山 女 川 口 中 四 — were the pipeline overriding a deliberate teaching choice it could not see.**

v2 locks Stage 0 as an ordered prefix and derives centrality over the remaining 39 characters only, so every move it now reports is real.

**Locked prefix (stroke-rule block, authored order):**

> 一二三十日月目田口白小水川山人入八大中車女子四国円

## Generated order (64 taught characters)

一二三十日月目田口白小水川山人入八大中車女子四国円 ｜ 今分手時上学下生明天先気百好年見行七千間雨来町火何母力男土食言話私木本休校林森

(Locked Stage 0 to the left of the bar; derived order to the right.)

## Separating the two v2 changes

The raw v1 → v2 diff is dominated by the Stage 0 lock and says little on its own. Read the two changes apart:

**The Stage 0 lock** restores 25 characters to their authored stroke-rule order. This is a restoration, not a re-ranking — v1's placement of them was never meaningful.

**The component policy**, measured only within the 38 derived characters where it is the sole variable: 32 shift relative rank, largest move 12 places.

| Character | v1 rank in tail | v2 rank in tail | Artifact parts v1 charged for |
|---|---:|---:|---|
| 好 | 26 | 14 | — |
| 火 | 19 | 24 | — |
| 母 | 31 | 26 | 毋 |
| 天 | 6 | 10 | — |
| 先 | 7 | 11 | — |
| 学 | 10 | 6 | — |
| 雨 | 17 | 21 | — |
| 私 | 36 | 32 | 禾、厶 |
| 生 | 5 | 8 | — |
| 上 | 8 | 5 | 卜 |
| 明 | 12 | 9 | — |
| 行 | 14 | 17 | 彳 |
| 七 | 21 | 18 | 乙 |
| 千 | 22 | 19 | 丿 |

Two different effects are visible here and they should not be conflated. Characters with artifact parts (母, 私, 上, 七, 千) gain directly: v1 was charging them for strokes rather than for anything the learner has to do. Characters with no foreign parts at all (好, 学, 明) move because cost is **dynamic** — 好 is 女 + 子 and both are now locked early in Stage 0, so by the time it is considered it costs almost nothing. That is the intended behaviour of Decision 3, and it only becomes visible once Stage 0 stops being shuffled into the middle of the list.

## Largest moves vs the hand-sequenced order (≥10 places)

- 林: hand #28 → v2 #63
- 森: hand #29 → v2 #64
- 木: hand #26 → v2 #59
- 本: hand #27 → v2 #60
- 手: hand #60 → v2 #28
- 校: hand #30 → v2 #62
- 休: hand #31 → v2 #61
- 生: hand #61 → v2 #33
- 上: hand #56 → v2 #30
- 先: hand #62 → v2 #36
- 下: hand #57 → v2 #32
- 私: hand #34 → v2 #58
- 分: hand #50 → v2 #27
- 天: hand #53 → v2 #35
- 気: hand #55 → v2 #37
- 何: hand #33 → v2 #50
- 七: hand #58 → v2 #43
- 火: hand #63 → v2 #49
- 力: hand #39 → v2 #52
- 男: hand #40 → v2 #53
- 学: hand #43 → v2 #31
- 年: hand #52 → v2 #40

## Contrastive adjacency chains (Session 4 Decision 6)

今·分; 木·本

**Read these as scheduling hints, not as constraints on the order.** Applying Decision 6 to the module shows the adjacency mechanism is a weaker version of something already built: 日, 目 and 白 are *not* adjacent in Stage 0 (positions 5, 7, 10, with 月, 田, 口 between them), and the contrast is carried by a dedicated skill lesson `sb-eye` placed once the set is complete. `sb-person` and `sb-tree` do the same for 人·入·八 and for 木·本 / 今·分. A contrast lesson teaches the distinction explicitly, survives regrouping, and does not compete with centrality for sequence positions. Decision 6 is better stated as *confusables get a contrast lesson once the set is complete*. Note the two chains formed above are exactly the pairs `sb-tree` already covers.

## Characters carrying named shapes (lesson needs a shape gloss)

- 四 (#23): 囗
- 国 (#24): 囗、玉
- 分 (#27): 刀
- 時 (#29): 寺
- 見 (#41): 儿
- 行 (#42): 彳
- 間 (#45): 門
- 来 (#47): 米
- 町 (#48): 丁
- 何 (#50): 可
- 話 (#57): 舌
- 私 (#58): 禾
- 校 (#62): 交

## Characters with muted parts (decomposition hidden — teach whole)

- 中 (#19): 丨
- 円 (#25): 冂
- 上 (#30): 卜
- 下 (#32): 卜
- 気 (#37): 气、乂
- 年 (#40): 丿、干
- 七 (#43): 乙
- 千 (#44): 丿
- 母 (#51): 毋
- 私 (#58): 厶

## Lesson-group plan — applying the order

The order is a sequence; the module teaches in groups of 3–7 with a theme and a stroke rule. Groups below are cut from the derived tail at the adjacency chains (which must not be split) and at size 5, then named from what actually landed together. Stage 0's groups are unchanged.

| Group | Characters | Note |
|---|---|---|
| Tail 1 | 今・分・手・時・上 | contrast pair 今·分; shape gloss on 分、時 |
| Tail 2 | 学・下・生・明・天 | — |
| Tail 3 | 先・気・百・好・年 | — |
| Tail 4 | 見・行・七・千・間 | shape gloss on 見、行、間 |
| Tail 5 | 雨・来・町・火・何 | shape gloss on 来、町、何 |
| Tail 6 | 母・力・男・土・食 | — |
| Tail 7 | 言・話・私・木・本 | contrast pair 木·本; shape gloss on 話、私 |
| Tail 8 | 休・校・林・森 | shape gloss on 校 |

8 groups after the two existing Stage 0 checkpoints. Two properties hold by construction and are worth stating because they are what the pipeline is for: **no character appears before a taught component of itself**, and **no contrast pair is split across a group boundary**.

What the pipeline cannot supply is the theme sentence and the stroke rule for each group — those are authoring, and the existing group titles ('The tree family', 'Frames: outside before inside') set a bar a generated label would not meet. The grouping above is the skeleton to author against, not a replacement for it.

## Expansion queue (ledger characters not yet taught — top 15)

- 会 — in 5 app word-slots (会う、会議、会)
- 友 — in 4 app word-slots (友達)
- 公 — in 3 app word-slots (公園)
- 文 — in 3 app word-slots (作文、文、一文)
- 毎 — in 4 app word-slots (毎日)
- 画 — in 5 app word-slots (映画、計画)
- 電 — in 8 app word-slots (電車、電気、電話)
- 写 — in 3 app word-slots (写真を撮る、写真)
- 犬 — in 2 app word-slots (犬)
- 机 — in 3 app word-slots (机、机の上)
- 週 — in 5 app word-slots (週末、来週、先週)
- 映 — in 4 app word-slots (映画)
- 作 — in 3 app word-slots (作る、作、作文)
- 図 — in 3 app word-slots (図書館)
- 広 — in 2 app word-slots (広い、広)

## Coverage curve

Still pending the scriptin corpora (see Blocker 2). The percentage shown in the module UI remains interpolated from published anchor points — the most confident-looking number in the interface and the least earned.
