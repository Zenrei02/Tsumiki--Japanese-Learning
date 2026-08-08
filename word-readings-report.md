# Missing word readings — derived from UniDic

Source ledger: `word-ledger-v1.json` (286 words, generated 2026-08-02)
Derived: **33** words that had no reading anywhere.
Needing a look: **2**.

These are the words that currently render *not in dictionary* when tapped.
Readings come from UniDic, not from a model — but nobody has checked them,
so they go to the reviewer with the rest of the queue.

Applying these to `KANJI_DICT` is an authoring pass, not a data operation:
the dict is a flat array in each single-file module, so the edit lands by hand
(or with the web-app port, whichever comes first).

## Check these first

| Word | Derived reading | Meaning | Why flagged |
|---|---|---|---|
| お茶 | おちゃ | tea | multi-token entry, no linking particle |
| 言う | いう | to say | 言う: ゆう → いう (headword reading) |

## Derived cleanly

| Word | Reading | Meaning | JLPT | KANJI_DICT row |
|---|---|---|---|---|
| 一緒に | いっしょに | together | N5 | `["一緒に", "いっしょに", "together", "N5"],` |
| 会う | あう | to meet | N5 | `["会う", "あう", "to meet", "N5"],` |
| 作る | つくる | to make | N5 | `["作る", "つくる", "to make", "N5"],` |
| 使う | つかう | to use | N5 | `["使う", "つかう", "to use", "N5"],` |
| 写真を撮る | しゃしんをとる | to take a photo | N5 | `["写真を撮る", "しゃしんをとる", "to take a photo", "N5"],` |
| 勉強する | べんきょうする | to study | N5 | `["勉強する", "べんきょうする", "to study", "N5"],` |
| 安い | やすい | cheap | N5 | `["安い", "やすい", "cheap", "N5"],` |
| 寒い | さむい | cold | N5 | `["寒い", "さむい", "cold", "N5"],` |
| 寝る | ねる | to sleep | N5 | `["寝る", "ねる", "to sleep", "N5"],` |
| 帰る | かえる | to go home | N5 | `["帰る", "かえる", "to go home", "N5"],` |
| 広い | ひろい | spacious | N5 | `["広い", "ひろい", "spacious", "N5"],` |
| 座る | すわる | to sit | N5 | `["座る", "すわる", "to sit", "N5"],` |
| 待つ | まつ | to wait | N5 | `["待つ", "まつ", "to wait", "N5"],` |
| 忙しい | いそがしい | busy | N5 | `["忙しい", "いそがしい", "busy", "N5"],` |
| 思う | おもう | to think | N5 | `["思う", "おもう", "to think", "N5"],` |
| 急ぐ | いそぐ | to hurry | N5 | `["急ぐ", "いそぐ", "to hurry", "N5"],` |
| 手を洗う | てをあらう | to wash hands | N5 | `["手を洗う", "てをあらう", "to wash hands", "N5"],` |
| 散歩する | さんぽする | to take a walk | N5 | `["散歩する", "さんぽする", "to take a walk", "N5"],` |
| 新しい | あたらしい | new | N5 | `["新しい", "あたらしい", "new", "N5"],` |
| 暑い | あつい | hot | N5 | `["暑い", "あつい", "hot", "N5"],` |
| 歯をみがく | はをみがく | to brush teeth | N5 | `["歯をみがく", "はをみがく", "to brush teeth", "N5"],` |
| 痛い | いたい | painful | N5 | `["痛い", "いたい", "painful", "N5"],` |
| 終わる | おわる | to end | N5 | `["終わる", "おわる", "to end", "N5"],` |
| 薬を飲む | くすりをのむ | to take medicine | N5 | `["薬を飲む", "くすりをのむ", "to take medicine", "N5"],` |
| 買う | かう | to buy | N5 | `["買う", "かう", "to buy", "N5"],` |
| 起きる | おきる | to get up | N5 | `["起きる", "おきる", "to get up", "N5"],` |
| 遅れる | おくれる | to be late | N5 | `["遅れる", "おくれる", "to be late", "N5"],` |
| 開ける | あける | to open | N5 | `["開ける", "あける", "to open", "N5"],` |
| 雨が降る | あめがふる | to rain | N5 | `["雨が降る", "あめがふる", "to rain", "N5"],` |
| 面白い | おもしろい | interesting | N5 | `["面白い", "おもしろい", "interesting", "N5"],` |
| 高い | たかい | expensive; tall | N5 | `["高い", "たかい", "expensive; tall", "N5"],` |

---

JLPT shown as `N5` where the ledger carries no level — the bank entries
never recorded one. Worth setting properly during the authoring pass,
since the level drives the furigana-as-exception-marker rule.
