# Missing word readings — derived from UniDic

Source ledger: `word-ledger-v1.json` (652 words, generated 2026-08-21)
Derived: **82** words that had no reading anywhere.
Needing a look: **10**.

These are the words that currently render *not in dictionary* when tapped.
Readings come from UniDic, not from a model — but nobody has checked them,
so they go to the reviewer with the rest of the queue.

Applying these to `KANJI_DICT` is an authoring pass, not a data operation:
the dict is a flat array in each single-file module, so the edit lands by hand
(or with the web-app port, whichever comes first).

## Check these first

| Word | Derived reading | Meaning | Why flagged |
|---|---|---|---|
| 予想外 | よそうがい | unexpected | multi-token entry, no linking particle |
| 価値観 | かちかん | values; worldview | multi-token entry, no linking particle |
| 努力家 | どりょくか | a hard worker | multi-token entry, no linking particle |
| 悪天候 | あくてんこう | bad weather | multi-token entry, no linking particle |
| 新入社員 | しんにゅうしゃいん | a new employee | multi-token entry, no linking particle |
| 条件付き | じょうけんつき | conditional | multi-token entry, no linking particle |
| 消費者 | しょうひしゃ | consumers | multi-token entry, no linking particle |
| 社会人 | しゃかいにん | a working adult | multi-token entry, no linking particle |
| 近所迷惑 | きんじょめいわく | neighborhood nuisance | multi-token entry, no linking particle |
| 電子マネー | でんしまねー | electronic money | multi-token entry, no linking particle |

## Derived cleanly

| Word | Reading | Meaning | JLPT | KANJI_DICT row |
|---|---|---|---|---|
| 上司 | じょうし | one's boss | N5 | `["上司", "じょうし", "one's boss", "N5"],` |
| 不満 | ふまん | dissatisfaction | N5 | `["不満", "ふまん", "dissatisfaction", "N5"],` |
| 世代 | せだい | a generation | N5 | `["世代", "せだい", "a generation", "N5"],` |
| 中止 | ちゅうし | cancellation | N5 | `["中止", "ちゅうし", "cancellation", "N5"],` |
| 予測 | よそく | a forecast | N5 | `["予測", "よそく", "a forecast", "N5"],` |
| 予防 | よぼう | prevention | N5 | `["予防", "よぼう", "prevention", "N5"],` |
| 事件 | じけん | an incident | N5 | `["事件", "じけん", "an incident", "N5"],` |
| 健康 | けんこう | health | N5 | `["健康", "けんこう", "health", "N5"],` |
| 内緒 | ないしょ | a secret | N5 | `["内緒", "ないしょ", "a secret", "N5"],` |
| 再会 | さいかい | reunion | N5 | `["再会", "さいかい", "reunion", "N5"],` |
| 出来事 | できごと | an event; happening | N5 | `["出来事", "できごと", "an event; happening", "N5"],` |
| 半面 | はんめん | the other side (of a quality) | N5 | `["半面", "はんめん", "the other side (of a quality)", "N5"],` |
| 協力 | きょうりょく | cooperation | N5 | `["協力", "きょうりょく", "cooperation", "N5"],` |
| 危機 | きき | a crisis | N5 | `["危機", "きき", "a crisis", "N5"],` |
| 危険 | きけん | danger | N5 | `["危険", "きけん", "danger", "N5"],` |
| 同時 | どうじ | the same time | N5 | `["同時", "どうじ", "the same time", "N5"],` |
| 周囲 | しゅうい | one's surroundings; those around | N5 | `["周囲", "しゅうい", "one's surroundings; those around", "N5"],` |
| 噂話 | うわさばなし | gossip | N5 | `["噂話", "うわさばなし", "gossip", "N5"],` |
| 回復 | かいふく | recovery | N5 | `["回復", "かいふく", "recovery", "N5"],` |
| 困難 | こんなん | difficulty | N5 | `["困難", "こんなん", "difficulty", "N5"],` |
| 基準 | きじゅん | a standard; criterion | N5 | `["基準", "きじゅん", "a standard; criterion", "N5"],` |
| 報道 | ほうどう | news coverage | N5 | `["報道", "ほうどう", "news coverage", "N5"],` |
| 夜中 | よなか | the middle of the night | N5 | `["夜中", "よなか", "the middle of the night", "N5"],` |
| 奇跡 | きせき | a miracle | N5 | `["奇跡", "きせき", "a miracle", "N5"],` |
| 実績 | じっせき | a track record | N5 | `["実績", "じっせき", "a track record", "N5"],` |
| 強行 | きょうこう | forcing through | N5 | `["強行", "きょうこう", "forcing through", "N5"],` |
| 恋しい | こいしい | longed-for | N5 | `["恋しい", "こいしい", "longed-for", "N5"],` |
| 悔しい | くやしい | frustrating; galling | N5 | `["悔しい", "くやしい", "frustrating; galling", "N5"],` |
| 情報 | じょうほう | information | N5 | `["情報", "じょうほう", "information", "N5"],` |
| 意識 | いしき | awareness | N5 | `["意識", "いしき", "awareness", "N5"],` |
| 感動 | かんどう | being moved | N5 | `["感動", "かんどう", "being moved", "N5"],` |
| 懐かしい | なつかしい | nostalgic; dearly missed | N5 | `["懐かしい", "なつかしい", "nostalgic; dearly missed", "N5"],` |
| 成果 | せいか | results; fruits | N5 | `["成果", "せいか", "results; fruits", "N5"],` |
| 手順 | てじゅん | a procedure | N5 | `["手順", "てじゅん", "a procedure", "N5"],` |
| 才能 | さいのう | talent | N5 | `["才能", "さいのう", "talent", "N5"],` |
| 批判 | ひはん | criticism | N5 | `["批判", "ひはん", "criticism", "N5"],` |
| 指示 | しじ | instructions | N5 | `["指示", "しじ", "instructions", "N5"],` |
| 方向 | ほうこう | a direction | N5 | `["方向", "ほうこう", "a direction", "N5"],` |
| 方針 | ほうしん | a policy; course | N5 | `["方針", "ほうしん", "a policy; course", "N5"],` |
| 時代 | じだい | an era | N5 | `["時代", "じだい", "an era", "N5"],` |
| 本気 | ほんき | seriousness | N5 | `["本気", "ほんき", "seriousness", "N5"],` |
| 材料 | ざいりょう | materials; ingredients | N5 | `["材料", "ざいりょう", "materials; ingredients", "N5"],` |
| 毎回 | まいかい | every time | N5 | `["毎回", "まいかい", "every time", "N5"],` |
| 決心 | けっしん | determination | N5 | `["決心", "けっしん", "determination", "N5"],` |
| 法律 | ほうりつ | the law | N5 | `["法律", "ほうりつ", "the law", "N5"],` |
| 涙 | なみだ | tears | N5 | `["涙", "なみだ", "tears", "N5"],` |
| 無事 | ぶじ | safe and sound | N5 | `["無事", "ぶじ", "safe and sound", "N5"],` |
| 無駄 | むだ | waste; futility | N5 | `["無駄", "むだ", "waste; futility", "N5"],` |
| 理想 | りそう | an ideal | N5 | `["理想", "りそう", "an ideal", "N5"],` |
| 瞬間 | しゅんかん | an instant | N5 | `["瞬間", "しゅんかん", "an instant", "N5"],` |
| 祈り | いのり | a prayer | N5 | `["祈り", "いのり", "a prayer", "N5"],` |
| 納得 | なっとく | being convinced | N5 | `["納得", "なっとく", "being convinced", "N5"],` |
| 結末 | けつまつ | the ending; outcome | N5 | `["結末", "けつまつ", "the ending; outcome", "N5"],` |
| 罰金 | ばっきん | a fine | N5 | `["罰金", "ばっきん", "a fine", "N5"],` |
| 羨ましい | うらやましい | envious | N5 | `["羨ましい", "うらやましい", "envious", "N5"],` |
| 習慣 | しゅうかん | a habit; custom | N5 | `["習慣", "しゅうかん", "a habit; custom", "N5"],` |
| 苦労 | くろう | hardship | N5 | `["苦労", "くろう", "hardship", "N5"],` |
| 被害 | ひがい | damage; harm | N5 | `["被害", "ひがい", "damage; harm", "N5"],` |
| 要望 | ようぼう | a request; wishes | N5 | `["要望", "ようぼう", "a request; wishes", "N5"],` |
| 見出し | みだし | a headline | N5 | `["見出し", "みだし", "a headline", "N5"],` |
| 規則 | きそく | a rule | N5 | `["規則", "きそく", "a rule", "N5"],` |
| 規定 | きてい | regulations | N5 | `["規定", "きてい", "regulations", "N5"],` |
| 覚悟 | かくご | readiness; resolve | N5 | `["覚悟", "かくご", "readiness; resolve", "N5"],` |
| 観点 | かんてん | a point of view | N5 | `["観点", "かんてん", "a point of view", "N5"],` |
| 言い訳 | いいわけ | an excuse | N5 | `["言い訳", "いいわけ", "an excuse", "N5"],` |
| 記者 | きしゃ | a reporter | N5 | `["記者", "きしゃ", "a reporter", "N5"],` |
| 評価 | ひょうか | evaluation; esteem | N5 | `["評価", "ひょうか", "evaluation; esteem", "N5"],` |
| 調整 | ちょうせい | adjustment | N5 | `["調整", "ちょうせい", "adjustment", "N5"],` |
| 謙遜 | けんそん | modesty; humility | N5 | `["謙遜", "けんそん", "modesty; humility", "N5"],` |
| 議論 | ぎろん | debate; discussion | N5 | `["議論", "ぎろん", "debate; discussion", "N5"],` |
| 資料 | しりょう | documents; data | N5 | `["資料", "しりょう", "documents; data", "N5"],` |
| 部下 | ぶか | a subordinate | N5 | `["部下", "ぶか", "a subordinate", "N5"],` |

---

JLPT shown as `N5` where the ledger carries no level — the bank entries
never recorded one. Worth setting properly during the authoring pass,
since the level drives the furigana-as-exception-marker rule.
