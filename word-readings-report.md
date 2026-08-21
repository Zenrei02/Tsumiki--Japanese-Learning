# Missing word readings — derived from UniDic

Source ledger: `word-ledger-v1.json` (753 words, generated 2026-08-21)
Derived: **78** words that had no reading anywhere.
Needing a look: **8**.

These are the words that currently render *not in dictionary* when tapped.
Readings come from UniDic, not from a model — but nobody has checked them,
so they go to the reviewer with the rest of the queue.

Applying these to `KANJI_DICT` is an authoring pass, not a data operation:
the dict is a flat array in each single-file module, so the edit lands by hand
(or with the web-app port, whichever comes first).

## Check these first

| Word | Derived reading | Meaning | Why flagged |
|---|---|---|---|
| 一滴 | いちてき | a single drop | multi-token entry, no linking particle |
| 圧倒的 | あっとうてき | overwhelming | multi-token entry, no linking particle |
| 失敗続き | しっぱいつづき | a string of failures | multi-token entry, no linking particle |
| 徹底的 | てっていてき | thorough | multi-token entry, no linking particle |
| 泥だらけ | どろだらけ | mud-covered | multi-token entry, no linking particle |
| 相乗効果 | そうじょうこうか | synergy | multi-token entry, no linking particle |
| 言い出しっぺ | いいだしっぺ | the one who suggested it | multi-token entry, no linking particle |
| 風物詩 | ふうぶつし | a seasonal fixture | multi-token entry, no linking particle |

## Derived cleanly

| Word | Reading | Meaning | JLPT | KANJI_DICT row |
|---|---|---|---|---|
| 一切 | いっさい | entirely (not) | N5 | `["一切", "いっさい", "entirely (not)", "N5"],` |
| 一瞬 | いっしゅん | an instant | N5 | `["一瞬", "いっしゅん", "an instant", "N5"],` |
| 世論 | よろん | public opinion | N5 | `["世論", "よろん", "public opinion", "N5"],` |
| 主張 | しゅちょう | an assertion | N5 | `["主張", "しゅちょう", "an assertion", "N5"],` |
| 事態 | じたい | the situation; state of affairs | N5 | `["事態", "じたい", "the situation; state of affairs", "N5"],` |
| 些細 | ささい | trivial | N5 | `["些細", "ささい", "trivial", "N5"],` |
| 偏見 | へんけん | prejudice | N5 | `["偏見", "へんけん", "prejudice", "N5"],` |
| 傑作 | けっさく | a masterpiece | N5 | `["傑作", "けっさく", "a masterpiece", "N5"],` |
| 先駆け | さきがけ | a forerunner | N5 | `["先駆け", "さきがけ", "a forerunner", "N5"],` |
| 光栄 | こうえい | an honor | N5 | `["光栄", "こうえい", "an honor", "N5"],` |
| 兼業 | けんぎょう | a side occupation | N5 | `["兼業", "けんぎょう", "a side occupation", "N5"],` |
| 処分 | しょぶん | disciplinary action | N5 | `["処分", "しょぶん", "disciplinary action", "N5"],` |
| 功績 | こうせき | achievements; merit | N5 | `["功績", "こうせき", "achievements; merit", "N5"],` |
| 台無し | だいなし | ruined | N5 | `["台無し", "だいなし", "ruined", "N5"],` |
| 合図 | あいず | a signal | N5 | `["合図", "あいず", "a signal", "N5"],` |
| 名残 | なごり | traces; the remains of | N5 | `["名残", "なごり", "traces; the remains of", "N5"],` |
| 唯一 | ゆいいつ | the one and only | N5 | `["唯一", "ゆいいつ", "the one and only", "N5"],` |
| 埃 | ほこり | dust | N5 | `["埃", "ほこり", "dust", "N5"],` |
| 基盤 | きばん | a foundation; base | N5 | `["基盤", "きばん", "a foundation; base", "N5"],` |
| 変遷 | へんせん | transitions; evolution | N5 | `["変遷", "へんせん", "transitions; evolution", "N5"],` |
| 妥協 | だきょう | compromise | N5 | `["妥協", "だきょう", "compromise", "N5"],` |
| 容認 | ようにん | toleration; acceptance | N5 | `["容認", "ようにん", "toleration; acceptance", "N5"],` |
| 寸前 | すんぜん | the verge; just before | N5 | `["寸前", "すんぜん", "the verge; just before", "N5"],` |
| 尊敬 | そんけい | respect | N5 | `["尊敬", "そんけい", "respect", "N5"],` |
| 尻ぬぐい | しりぬぐい | cleaning up someone's mess | N5 | `["尻ぬぐい", "しりぬぐい", "cleaning up someone's mess", "N5"],` |
| 幕開け | まくあけ | the curtain's rise | N5 | `["幕開け", "まくあけ", "the curtain's rise", "N5"],` |
| 徹夜 | てつや | an all-nighter | N5 | `["徹夜", "てつや", "an all-nighter", "N5"],` |
| 感激 | かんげき | deep emotion | N5 | `["感激", "かんげき", "deep emotion", "N5"],` |
| 抗議 | こうぎ | a protest | N5 | `["抗議", "こうぎ", "a protest", "N5"],` |
| 振り向く | ふりむく | to turn around | N5 | `["振り向く", "ふりむく", "to turn around", "N5"],` |
| 撤回 | てっかい | retraction | N5 | `["撤回", "てっかい", "retraction", "N5"],` |
| 撤退 | てったい | withdrawal; pulling out | N5 | `["撤退", "てったい", "withdrawal; pulling out", "N5"],` |
| 施行 | しこう | coming into force | N5 | `["施行", "しこう", "coming into force", "N5"],` |
| 最悪 | さいあく | the worst | N5 | `["最悪", "さいあく", "the worst", "N5"],` |
| 本場 | ほんば | the authentic home (of a thing) | N5 | `["本場", "ほんば", "the authentic home (of a thing)", "N5"],` |
| 根拠 | こんきょ | grounds; basis | N5 | `["根拠", "こんきょ", "grounds; basis", "N5"],` |
| 歓声 | かんせい | a cheer | N5 | `["歓声", "かんせい", "a cheer", "N5"],` |
| 気配 | けはい | a presence; sign | N5 | `["気配", "けはい", "a presence; sign", "N5"],` |
| 汗 | あせ | sweat | N5 | `["汗", "あせ", "sweat", "N5"],` |
| 満面 | まんめん | the whole face | N5 | `["満面", "まんめん", "the whole face", "N5"],` |
| 物音 | ものおと | a (suspicious) sound | N5 | `["物音", "ものおと", "a (suspicious) sound", "N5"],` |
| 独自 | どくじ | unique to oneself | N5 | `["独自", "どくじ", "unique to oneself", "N5"],` |
| 発足 | ほっそく | inauguration; launch | N5 | `["発足", "ほっそく", "inauguration; launch", "N5"],` |
| 皆無 | かいむ | utterly absent | N5 | `["皆無", "かいむ", "utterly absent", "N5"],` |
| 皮肉 | ひにく | irony; sarcasm | N5 | `["皮肉", "ひにく", "irony; sarcasm", "N5"],` |
| 盲点 | もうてん | a blind spot | N5 | `["盲点", "もうてん", "a blind spot", "N5"],` |
| 矛盾 | むじゅん | contradiction | N5 | `["矛盾", "むじゅん", "contradiction", "N5"],` |
| 破産 | はさん | bankruptcy | N5 | `["破産", "はさん", "bankruptcy", "N5"],` |
| 祝賀 | しゅくが | celebration (formal) | N5 | `["祝賀", "しゅくが", "celebration (formal)", "N5"],` |
| 節目 | ふしめ | a milestone; juncture | N5 | `["節目", "ふしめ", "a milestone; juncture", "N5"],` |
| 結局 | けっきょく | in the end | N5 | `["結局", "けっきょく", "in the end", "N5"],` |
| 義務 | ぎむ | duty; obligation | N5 | `["義務", "ぎむ", "duty; obligation", "N5"],` |
| 羽目 | はめ | a fix; predicament | N5 | `["羽目", "はめ", "a fix; predicament", "N5"],` |
| 職人 | しょくにん | an artisan | N5 | `["職人", "しょくにん", "an artisan", "N5"],` |
| 肝心 | かんじん | the crucial (part) | N5 | `["肝心", "かんじん", "the crucial (part)", "N5"],` |
| 膨大 | ぼうだい | enormous | N5 | `["膨大", "ぼうだい", "enormous", "N5"],` |
| 貫禄 | かんろく | weight; gravitas | N5 | `["貫禄", "かんろく", "weight; gravitas", "N5"],` |
| 責務 | せきむ | one's charge; responsibility | N5 | `["責務", "せきむ", "one's charge; responsibility", "N5"],` |
| 賭け | かけ | a gamble | N5 | `["賭け", "かけ", "a gamble", "N5"],` |
| 辞任 | じにん | resignation (from a post) | N5 | `["辞任", "じにん", "resignation (from a post)", "N5"],` |
| 逆境 | ぎゃっきょう | adversity | N5 | `["逆境", "ぎゃっきょう", "adversity", "N5"],` |
| 遺憾 | いかん | regrettable (officialese) | N5 | `["遺憾", "いかん", "regrettable (officialese)", "N5"],` |
| 鑑賞 | かんしょう | appreciation (of art) | N5 | `["鑑賞", "かんしょう", "appreciation (of art)", "N5"],` |
| 集大成 | しゅうたいせい | a culmination | N5 | `["集大成", "しゅうたいせい", "a culmination", "N5"],` |
| 静寂 | せいじゃく | silence; stillness | N5 | `["静寂", "せいじゃく", "silence; stillness", "N5"],` |
| 面影 | おもかげ | a lingering likeness | N5 | `["面影", "おもかげ", "a lingering likeness", "N5"],` |
| 風格 | ふうかく | dignity; presence | N5 | `["風格", "ふうかく", "dignity; presence", "N5"],` |
| 風潮 | ふうちょう | a (social) trend | N5 | `["風潮", "ふうちょう", "a (social) trend", "N5"],` |
| 飛び出す | とびだす | to dash out | N5 | `["飛び出す", "とびだす", "to dash out", "N5"],` |
| 駄作 | ださく | a dud; failure of a work | N5 | `["駄作", "ださく", "a dud; failure of a work", "N5"],` |

---

JLPT shown as `N5` where the ledger carries no level — the bank entries
never recorded one. Worth setting properly during the authoring pass,
since the level drives the furigana-as-exception-marker rule.
