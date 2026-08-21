# Missing word readings — derived from UniDic

Source ledger: `word-ledger-v1.json` (545 words, generated 2026-08-21)
Derived: **38** words that had no reading anywhere.
Needing a look: **3**.

These are the words that currently render *not in dictionary* when tapped.
Readings come from UniDic, not from a model — but nobody has checked them,
so they go to the reviewer with the rest of the queue.

Applying these to `KANJI_DICT` is an authoring pass, not a data operation:
the dict is a flat array in each single-file module, so the edit lands by hand
(or with the web-app port, whichever comes first).

## Check these first

| Word | Derived reading | Meaning | Why flagged |
|---|---|---|---|
| 休業日 | きゅうぎょうひ | closed day | multi-token entry, no linking particle |
| 入社式 | にゅうしゃしき | company entrance ceremony | multi-token entry, no linking particle |
| 経験者 | けいけんしゃ | someone with experience | multi-token entry, no linking particle |

## Derived cleanly

| Word | Reading | Meaning | JLPT | KANJI_DICT row |
|---|---|---|---|---|
| 乾杯 | かんぱい | a toast | N5 | `["乾杯", "かんぱい", "a toast", "N5"],` |
| 値上げ | ねあげ | a price rise | N5 | `["値上げ", "ねあげ", "a price rise", "N5"],` |
| 全国 | ぜんこく | the whole country | N5 | `["全国", "ぜんこく", "the whole country", "N5"],` |
| 判断 | はんだん | a judgement | N5 | `["判断", "はんだん", "a judgement", "N5"],` |
| 卒業 | そつぎょう | graduation | N5 | `["卒業", "そつぎょう", "graduation", "N5"],` |
| 印象 | いんしょう | an impression | N5 | `["印象", "いんしょう", "an impression", "N5"],` |
| 司会 | しかい | the MC; chairing | N5 | `["司会", "しかい", "the MC; chairing", "N5"],` |
| 命令 | めいれい | an order | N5 | `["命令", "めいれい", "an order", "N5"],` |
| 国籍 | こくせき | nationality | N5 | `["国籍", "こくせき", "nationality", "N5"],` |
| 増加 | ぞうか | an increase | N5 | `["増加", "ぞうか", "an increase", "N5"],` |
| 契約 | けいやく | a contract | N5 | `["契約", "けいやく", "a contract", "N5"],` |
| 対象 | たいしょう | the target; those covered | N5 | `["対象", "たいしょう", "the target; those covered", "N5"],` |
| 幅広い | はばひろい | broad; wide-ranging | N5 | `["幅広い", "はばひろい", "broad; wide-ranging", "N5"],` |
| 年齢 | ねんれい | age | N5 | `["年齢", "ねんれい", "age", "N5"],` |
| 当たり前 | あたりまえ | obvious; only natural | N5 | `["当たり前", "あたりまえ", "obvious; only natural", "N5"],` |
| 承認 | しょうにん | approval | N5 | `["承認", "しょうにん", "approval", "N5"],` |
| 支払い | しはらい | payment | N5 | `["支払い", "しはらい", "payment", "N5"],` |
| 断る | ことわる | to refuse | N5 | `["断る", "ことわる", "to refuse", "N5"],` |
| 更新 | こうしん | renewal | N5 | `["更新", "こうしん", "renewal", "N5"],` |
| 書類 | しょるい | documents | N5 | `["書類", "しょるい", "documents", "N5"],` |
| 期間 | きかん | a period (of time) | N5 | `["期間", "きかん", "a period (of time)", "N5"],` |
| 期限 | きげん | a time limit | N5 | `["期限", "きげん", "a time limit", "N5"],` |
| 残業 | ざんぎょう | overtime | N5 | `["残業", "ざんぎょう", "overtime", "N5"],` |
| 満員 | まんいん | full (of people) | N5 | `["満員", "まんいん", "full (of people)", "N5"],` |
| 無理 | むり | impossible; unreasonable | N5 | `["無理", "むり", "impossible; unreasonable", "N5"],` |
| 犯人 | はんにん | the culprit | N5 | `["犯人", "はんにん", "the culprit", "N5"],` |
| 申請 | しんせい | an application | N5 | `["申請", "しんせい", "an application", "N5"],` |
| 発表 | はっぴょう | an announcement | N5 | `["発表", "はっぴょう", "an announcement", "N5"],` |
| 真実 | しんじつ | the truth | N5 | `["真実", "しんじつ", "the truth", "N5"],` |
| 行列 | ぎょうれつ | a queue | N5 | `["行列", "ぎょうれつ", "a queue", "N5"],` |
| 証言 | しょうげん | testimony | N5 | `["証言", "しょうげん", "testimony", "N5"],` |
| 評判 | ひょうばん | reputation | N5 | `["評判", "ひょうばん", "reputation", "N5"],` |
| 誤解 | ごかい | a misunderstanding | N5 | `["誤解", "ごかい", "a misunderstanding", "N5"],` |
| 諦める | あきらめる | to give up | N5 | `["諦める", "あきらめる", "to give up", "N5"],` |
| 面接 | めんせつ | a job interview | N5 | `["面接", "めんせつ", "a job interview", "N5"],` |

---

JLPT shown as `N5` where the ledger carries no level — the bank entries
never recorded one. Worth setting properly during the authoring pass,
since the level drives the furigana-as-exception-marker rule.
