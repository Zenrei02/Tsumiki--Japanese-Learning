# Kanji order v1 — 2026-08-03

Corpora merged: kanjidic (newspaper rank).
Demand source: word-ledger-v1.json (286 words). Component precedence: KanjiVG depth-1, holds by construction. Cost is dynamic (placed components discount a compound) and confusables are pulled adjacent — Session 4 Decisions 3 and 6.
⚠ Only KANJIDIC2 newspaper ranks present — Session 4 Decision 8 calls that skew the wrong target for menu/message readers. The 0.3 frequency term inherits it until the scriptin corpora land in freq-data/.

## Generated order (63 taught characters)

日白目一人入八三今分手十二時生大天先上下子学百水車円月明気行見小年国雨間火来七千何田町力山女好川男口中土食話母木本休校四私林森

## Largest moves vs the hand order (≥10 positions)

- 手: hand #60 → generated #11
- 生: hand #61 → generated #15
- 先: hand #62 → generated #18
- 口: hand #9 → generated #50
- 分: hand #50 → generated #10
- 上: hand #56 → generated #19
- 下: hand #57 → generated #20
- 四: hand #23 → generated #60
- 天: hand #53 → generated #17
- 川: hand #13 → generated #48
- 田: hand #8 → generated #42
- 林: hand #28 → generated #62
- 森: hand #29 → generated #63
- 中: hand #19 → generated #51
- 山: hand #14 → generated #45
- 木: hand #26 → generated #56
- 本: hand #27 → generated #57
- 校: hand #30 → generated #59
- 休: hand #31 → generated #58
- 私: hand #34 → generated #61
- 気: hand #55 → generated #29
- 火: hand #63 → generated #37
- 女: hand #21 → generated #46
- 今: hand #32 → generated #9
- 時: hand #36 → generated #14
- 学: hand #43 → generated #22
- 月: hand #6 → generated #27
- 小: hand #11 → generated #32
- 年: hand #52 → generated #33
- 雨: hand #54 → generated #35
- 七: hand #58 → generated #39
- 行: hand #46 → generated #30
- 百: hand #38 → generated #23
- 見: hand #45 → generated #31
- 水: hand #12 → generated #24
- 二: hand #2 → generated #13
- 千: hand #51 → generated #40
- 母: hand #44 → generated #55
- 人: hand #15 → generated #5
- 入: hand #16 → generated #6
- 八: hand #17 → generated #7
- 国: hand #24 → generated #34

## Contrastive adjacency chains (Session 4 Decision 6 — confusables taught side by side)

日·白·目; 人·入·八; 今·分; 木·本

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

## Untaught components (known limitation)

Precedence holds among taught characters only. These contain KanjiVG parts nothing in the syllabus teaches — each needs either the part added to the syllabus, a 'shape only, don't learn it' framing in the lesson, or a later position. The hand order buried some of these by instinct; the pipeline surfaces them so the choice is explicit:

- 分 (generated #10): contains untaught 刀
- 時 (generated #14): contains untaught 寺
- 上 (generated #19): contains untaught 卜
- 下 (generated #20): contains untaught 卜
- 円 (generated #26): contains untaught 冂
- 気 (generated #29): contains untaught 气、乂
- 行 (generated #30): contains untaught 彳
- 見 (generated #31): contains untaught 儿
- 年 (generated #33): contains untaught 丿、干
- 国 (generated #34): contains untaught 囗、玉
- 間 (generated #36): contains untaught 門
- 来 (generated #38): contains untaught 米
- 七 (generated #39): contains untaught 乙
- 千 (generated #40): contains untaught 丿
- 何 (generated #41): contains untaught 可
- 町 (generated #43): contains untaught 丁
- 中 (generated #51): contains untaught 丨
- 話 (generated #54): contains untaught 言、舌
- 母 (generated #55): contains untaught 毋
- 校 (generated #59): contains untaught 交
- 四 (generated #60): contains untaught 囗
- 私 (generated #61): contains untaught 禾、厶

## Coverage curve

**Pending corpus counts.** The sandbox cannot reach GitHub raw; run this on your machine, in this folder:
```
wget -P freq-data https://raw.githubusercontent.com/scriptin/kanji-frequency/master/data2015/{aozora,news,twitter}.json
```
then re-run `python3 kanji-ordering-pipeline.py` — the merge widens and this section fills in automatically.
(Data: scriptin/kanji-frequency, CC-BY-4.0.)
