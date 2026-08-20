# Missing word readings — derived from UniDic

Source ledger: `word-ledger-v1.json` (475 words, generated 2026-08-21)
Derived: **104** words that had no reading anywhere.
Needing a look: **5**.

These are the words that currently render *not in dictionary* when tapped.
Readings come from UniDic, not from a model — but nobody has checked them,
so they go to the reviewer with the rest of the queue.

Applying these to `KANJI_DICT` is an authoring pass, not a data operation:
the dict is a flat array in each single-file module, so the edit lands by hand
(or with the web-app port, whichever comes first).

## Check these first

| Word | Derived reading | Meaning | Why flagged |
|---|---|---|---|
| 何でも | なにでも | anything | 何: なん → なに (headword reading) |
| 保険証 | ほけんしょう | insurance card | multi-token entry, no linking particle |
| 十分 | じゅうふん | enough | multi-token entry, no linking particle |
| 可能性 | かのうせい | a possibility | multi-token entry, no linking particle |
| 最後まで | さいごまで | to the end | multi-token entry, no linking particle |

## Derived cleanly

| Word | Reading | Meaning | JLPT | KANJI_DICT row |
|---|---|---|---|---|
| やり直す | やりなおす | to redo | N5 | `["やり直す", "やりなおす", "to redo", "N5"],` |
| 一緒に | いっしょに | together | N5 | `["一緒に", "いっしょに", "together", "N5"],` |
| 予想 | よそう | expectation | N5 | `["予想", "よそう", "expectation", "N5"],` |
| 事実 | じじつ | a fact | N5 | `["事実", "じじつ", "a fact", "N5"],` |
| 人口 | じんこう | population | N5 | `["人口", "じんこう", "population", "N5"],` |
| 以来 | いらい | since then | N5 | `["以来", "いらい", "since then", "N5"],` |
| 会計 | かいけい | the bill | N5 | `["会計", "かいけい", "the bill", "N5"],` |
| 体 | からだ | body | N5 | `["体", "からだ", "body", "N5"],` |
| 例 | れい | an example | N5 | `["例", "れい", "an example", "N5"],` |
| 例外 | れいがい | an exception | N5 | `["例外", "れいがい", "an exception", "N5"],` |
| 値段 | ねだん | price | N5 | `["値段", "ねだん", "price", "N5"],` |
| 偶然 | ぐうぜん | coincidence | N5 | `["偶然", "ぐうぜん", "coincidence", "N5"],` |
| 傷 | きず | a scratch | N5 | `["傷", "きず", "a scratch", "N5"],` |
| 内容 | ないよう | content | N5 | `["内容", "ないよう", "content", "N5"],` |
| 写真を撮る | しゃしんをとる | to take a photo | N5 | `["写真を撮る", "しゃしんをとる", "to take a photo", "N5"],` |
| 努力 | どりょく | effort | N5 | `["努力", "どりょく", "effort", "N5"],` |
| 勉強する | べんきょうする | to study | N5 | `["勉強する", "べんきょうする", "to study", "N5"],` |
| 原因 | げんいん | a cause | N5 | `["原因", "げんいん", "a cause", "N5"],` |
| 反対 | はんたい | the opposite | N5 | `["反対", "はんたい", "the opposite", "N5"],` |
| 受付 | うけつけ | reception | N5 | `["受付", "うけつけ", "reception", "N5"],` |
| 変化 | へんか | a change | N5 | `["変化", "へんか", "a change", "N5"],` |
| 変更 | へんこう | a change | N5 | `["変更", "へんこう", "a change", "N5"],` |
| 夢 | ゆめ | a dream | N5 | `["夢", "ゆめ", "a dream", "N5"],` |
| 失敗 | しっぱい | a failure | N5 | `["失敗", "しっぱい", "a failure", "N5"],` |
| 工事 | こうじ | construction work | N5 | `["工事", "こうじ", "construction work", "N5"],` |
| 希望 | きぼう | a hope | N5 | `["希望", "きぼう", "a hope", "N5"],` |
| 常識 | じょうしき | common sense | N5 | `["常識", "じょうしき", "common sense", "N5"],` |
| 座る | すわる | to sit | N5 | `["座る", "すわる", "to sit", "N5"],` |
| 当然 | とうぜん | natural; obvious | N5 | `["当然", "とうぜん", "natural; obvious", "N5"],` |
| 影響 | えいきょう | influence | N5 | `["影響", "えいきょう", "influence", "N5"],` |
| 後悔 | こうかい | regret | N5 | `["後悔", "こうかい", "regret", "N5"],` |
| 心配 | しんぱい | worry | N5 | `["心配", "しんぱい", "worry", "N5"],` |
| 必要 | ひつよう | necessity | N5 | `["必要", "ひつよう", "necessity", "N5"],` |
| 忘れる | わすれる | to forget | N5 | `["忘れる", "わすれる", "to forget", "N5"],` |
| 急ぐ | いそぐ | to hurry | N5 | `["急ぐ", "いそぐ", "to hurry", "N5"],` |
| 性格 | せいかく | character | N5 | `["性格", "せいかく", "character", "N5"],` |
| 想像 | そうぞう | imagination | N5 | `["想像", "そうぞう", "imagination", "N5"],` |
| 意見 | いけん | an opinion | N5 | `["意見", "いけん", "an opinion", "N5"],` |
| 成功 | せいこう | success | N5 | `["成功", "せいこう", "success", "N5"],` |
| 我慢 | がまん | putting up with it | N5 | `["我慢", "がまん", "putting up with it", "N5"],` |
| 手伝う | てつだう | to help | N5 | `["手伝う", "てつだう", "to help", "N5"],` |
| 担当 | たんとう | the person in charge | N5 | `["担当", "たんとう", "the person in charge", "N5"],` |
| 散歩する | さんぽする | to take a walk | N5 | `["散歩する", "さんぽする", "to take a walk", "N5"],` |
| 数 | すう | a number | N5 | `["数", "すう", "a number", "N5"],` |
| 文章 | ぶんしょう | a piece of writing | N5 | `["文章", "ぶんしょう", "a piece of writing", "N5"],` |
| 方法 | ほうほう | method | N5 | `["方法", "ほうほう", "method", "N5"],` |
| 晩ご飯 | ばんごはん | dinner | N5 | `["晩ご飯", "ばんごはん", "dinner", "N5"],` |
| 普通 | ふつう | ordinary | N5 | `["普通", "ふつう", "ordinary", "N5"],` |
| 最低 | さいてい | the minimum | N5 | `["最低", "さいてい", "the minimum", "N5"],` |
| 条件 | じょうけん | a condition | N5 | `["条件", "じょうけん", "a condition", "N5"],` |
| 機会 | きかい | an opportunity | N5 | `["機会", "きかい", "an opportunity", "N5"],` |
| 歌う | うたう | to sing | N5 | `["歌う", "うたう", "to sing", "N5"],` |
| 段落 | だんらく | a paragraph | N5 | `["段落", "だんらく", "a paragraph", "N5"],` |
| 気持ち | きもち | a feeling | N5 | `["気持ち", "きもち", "a feeling", "N5"],` |
| 決まる | きまる | to be decided | N5 | `["決まる", "きまる", "to be decided", "N5"],` |
| 決める | きめる | to decide | N5 | `["決める", "きめる", "to decide", "N5"],` |
| 泥 | どろ | mud | N5 | `["泥", "どろ", "mud", "N5"],` |
| 流れ | ながれ | the flow | N5 | `["流れ", "ながれ", "the flow", "N5"],` |
| 準備 | じゅんび | preparation | N5 | `["準備", "じゅんび", "preparation", "N5"],` |
| 環境 | かんきょう | environment | N5 | `["環境", "かんきょう", "environment", "N5"],` |
| 生 | なま | draught beer | N5 | `["生", "なま", "draught beer", "N5"],` |
| 番号 | ばんごう | number | N5 | `["番号", "ばんごう", "number", "N5"],` |
| 目的 | もくてき | a purpose | N5 | `["目的", "もくてき", "a purpose", "N5"],` |
| 知る | しる | to know | N5 | `["知る", "しる", "to know", "N5"],` |
| 確か | たしか | certain | N5 | `["確か", "たしか", "certain", "N5"],` |
| 確認 | かくにん | checking | N5 | `["確認", "かくにん", "checking", "N5"],` |
| 窓口 | まどぐち | the counter | N5 | `["窓口", "まどぐち", "the counter", "N5"],` |
| 答える | こたえる | to answer | N5 | `["答える", "こたえる", "to answer", "N5"],` |
| 範囲 | はんい | a range | N5 | `["範囲", "はんい", "a range", "N5"],` |
| 約束 | やくそく | a promise | N5 | `["約束", "やくそく", "a promise", "N5"],` |
| 経験 | けいけん | experience | N5 | `["経験", "けいけん", "experience", "N5"],` |
| 絶対 | ぜったい | absolutely | N5 | `["絶対", "ぜったい", "absolutely", "N5"],` |
| 続ける | つづける | to continue | N5 | `["続ける", "つづける", "to continue", "N5"],` |
| 署名 | しょめい | a signature | N5 | `["署名", "しょめい", "a signature", "N5"],` |
| 若い | わかい | young | N5 | `["若い", "わかい", "young", "N5"],` |
| 落ちる | おちる | to fall | N5 | `["落ちる", "おちる", "to fall", "N5"],` |
| 落とす | おとす | to drop | N5 | `["落とす", "おとす", "to drop", "N5"],` |
| 薬を飲む | くすりをのむ | to take medicine | N5 | `["薬を飲む", "くすりをのむ", "to take medicine", "N5"],` |
| 表現 | ひょうげん | an expression | N5 | `["表現", "ひょうげん", "an expression", "N5"],` |
| 表面 | ひょうめん | the surface | N5 | `["表面", "ひょうめん", "the surface", "N5"],` |
| 記事 | きじ | an article | N5 | `["記事", "きじ", "an article", "N5"],` |
| 記入 | きにゅう | filling in | N5 | `["記入", "きにゅう", "filling in", "N5"],` |
| 証拠 | しょうこ | evidence | N5 | `["証拠", "しょうこ", "evidence", "N5"],` |
| 話しかける | はなしかける | to speak to | N5 | `["話しかける", "はなしかける", "to speak to", "N5"],` |
| 話題 | わだい | a topic | N5 | `["話題", "わだい", "a topic", "N5"],` |
| 読み終わる | よみおわる | to finish reading | N5 | `["読み終わる", "よみおわる", "to finish reading", "N5"],` |
| 調査 | ちょうさ | a survey | N5 | `["調査", "ちょうさ", "a survey", "N5"],` |
| 返事 | へんじ | a reply | N5 | `["返事", "へんじ", "a reply", "N5"],` |
| 途中 | とちゅう | partway; en route | N5 | `["途中", "とちゅう", "partway; en route", "N5"],` |
| 連絡 | れんらく | getting in touch | N5 | `["連絡", "れんらく", "getting in touch", "N5"],` |
| 遅れる | おくれる | to be late | N5 | `["遅れる", "おくれる", "to be late", "N5"],` |
| 遅刻 | ちこく | lateness | N5 | `["遅刻", "ちこく", "lateness", "N5"],` |
| 過去 | かこ | the past | N5 | `["過去", "かこ", "the past", "N5"],` |
| 選択 | せんたく | a choice | N5 | `["選択", "せんたく", "a choice", "N5"],` |
| 閉まる | しまる | to close | N5 | `["閉まる", "しまる", "to close", "N5"],` |
| 間違い | まちがい | a mistake | N5 | `["間違い", "まちがい", "a mistake", "N5"],` |
| 雨が降る | あめがふる | to rain | N5 | `["雨が降る", "あめがふる", "to rain", "N5"],` |
| 面白い | おもしろい | interesting | N5 | `["面白い", "おもしろい", "interesting", "N5"],` |
| 風邪 | かぜ | a cold | N5 | `["風邪", "かぜ", "a cold", "N5"],` |

---

JLPT shown as `N5` where the ledger carries no level — the bank entries
never recorded one. Worth setting properly during the authoring pass,
since the level drives the furigana-as-exception-marker rule.
