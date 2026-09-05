# Message to Keiko — completion, payment, and the one question that settles M1

**Status:** ready to send. Written Sep 5 2026, Session 22.
**Send via:** LINE, same as every previous batch message.

---

## Why this message exists, and why it is only one question

Blind grading is complete: 150/150 imported clean. The gate reads **TUNE on all
three models** and that will not change — agreement is 68% / 86% / 82% against a
90% bar, and even the most generous possible regrade leaves M1 at 86%.

So this is **not** a message that can rescue a result. Exactly one thing is still
genuinely unresolved and worth her time:

`O107` is the single output where a **FIX-tier 誤指摘** decides `Results!A30`, the
hard-fail gate that ignores rates entirely. Her comment on it reads:

> 「えりが犬よりも早く私の立場を置き換わった→えりはあっという間に僕から犬に乗り換えたね(笑)」

Checked against the source text, that comment is **not** a free rewrite of the
learner's sentence. The left side is quoted **verbatim from the tool's own
suggested rewrite**, and the right side is **verbatim the answer key**. She was
writing *"[what the tool proposed] → [what it should have been]"*. Same shape on
O058 and O111, the other two outputs for that sentence.

That tells us she judged the tool's **rewrite** — but the tool on O107 also made a
separate **grammatical claim** (「えりは → えりが」, asserting that 〜より comparisons
require が). Her comment does not touch that claim, and it is the claim that
decides whether this is an invented error or a bad suggestion.

**Those are opposite verdicts and the comment distinguishes neither.** One question
settles it. Nothing else in the eval buys as much certainty per minute of her time.

⚠️ **Do not ask about O058 and O111 as well.** They are UNNATURAL-tier, so they
touch no hard gate, and the same reasoning applies to them anyway once O107 is
answered. The tracker's adjudication rule — return to a reviewer **last, batched,
and only where it changes a verdict** — applies to Keiko too, and she has now done
nine batches with B1 unpaid by her own choice.

⚠️ **Do not reveal which model produced the output**, here or in any follow-up.
The blinding is what makes all 150 verdicts comparable, and it costs nothing to
preserve now that grading is finished.

---

## The message (send as-is)

> 恵子さん
>
> ブラインド採点、全9バッチ（150問）すべて完了していただき、本当にありがとうございました。
> 長い作業でしたし、日本語の細かいところまで丁寧に見ていただいたのがよく分かりました。
> いただいたコメントは、どれもツールの改善に直接つながるものばかりです。
>
> B8（2,000円）とB9（4,000円）の合計6,000円、近日中にお送りします。
> 方法はPayPayでも銀行振込でも、ご都合のよい方で大丈夫です。
>
> 最後に、一問だけ確認させてください。30秒で終わる質問です。
>
> B1（最初のバッチ）の、この文についてです：
>
> ① えりはえりの犬よりも早く私を置き換えました。（笑）
>
> このとき、ツールは「えりは → えりが」と直して、
> 「〜より」の比較では「が」を使う、と説明していました。
> 恵子さんは「誤指摘」を選んで、
> 「えりが犬よりも早く私の立場を置き換わった → えりはあっという間に僕から犬に乗り換えたね(笑)」
> とコメントしてくださいました。
>
> このとき、お考えに近いのはどちらでしょうか。
>
> **（A）** そもそも「えりは」を「えりが」に直す必要はなかった。ツールの指摘自体が間違い。
>
> **（B）** 「が」に直すこと自体は問題ないが、ツールが作った文が不自然で、②の正解とは違う意味になっていた。
>
> AかBか、一言だけいただければ十分です。
> 「よく覚えていない」「どちらとも言えない」でも全く問題ありません。
> B1はフォームがまだ分かりにくかった頃のものなので、迷われていても当然だと思います。
>
> 改めて、ここまでお付き合いいただき本当にありがとうございました。
> 広島でのお食事の件、こちらこそぜひお願いします。

---

## English gloss (for Lloyd — not to be sent)

> Keiko,
>
> Thank you so much for completing all nine batches — 150 items. It was a long job,
> and it's clear you looked closely at the fine details of the Japanese. Every one of
> your comments feeds directly into improving the tool.
>
> I'll send the ¥6,000 for B8 (¥2,000) and B9 (¥4,000) shortly — PayPay or bank
> transfer, whichever is easier for you.
>
> One last thing I'd like to check — a single question, about 30 seconds.
>
> It's about this sentence from B1, the first batch:
>
> ① えりはえりの犬よりも早く私を置き換えました。（笑）
>
> The tool changed 「えりは」 to 「えりが」, explaining that 〜より comparisons take が.
> You chose 誤指摘 (invented error) and commented:
> 「えりが犬よりも早く私の立場を置き換わった → えりはあっという間に僕から犬に乗り換えたね(笑)」
>
> Which of these is closer to what you meant?
>
> **(A)** There was no need to change 「えりは」 to 「えりが」 at all — the tool's
> correction itself was wrong.
>
> **(B)** Changing it to 「が」 was fine in itself, but the sentence the tool produced
> was unnatural and meant something different from the correct answer in ②.
>
> Just A or B is plenty. "I don't remember" or "I couldn't say" is completely fine too
> — B1 was from when the form was still confusing, so it would be natural to be unsure.
>
> Thank you again for seeing this all the way through. And yes — I'd love to take you
> up on that meal in Hiroshima.

---

## How to read the answer

| She says | Meaning | Effect on `Results!A30` |
|---|---|---|
| **(A)** | The 「えりは→えりが」 claim was itself wrong | **Genuine invented error.** M1's FIX-tier hard fail stands. Record it and move on — TUNE was already the verdict. |
| **(B)** | Diagnosis fine, rewrite bad | **Not an invented error.** M1's only surviving FIX-tier 誤指摘 falls away, and the row joins the 23 rewrite-quality cases — which is the real Phase 0 finding. |
| "don't remember" / unclear | Genuinely undetermined | Leave it. Record the ambiguity in `Eval Set` col L and read M1's invented count as the **band 0–1**, never a point value. |

Whatever she answers, write it into `Eval Set` column L for E25 **with a date and
her name**, in the form the E09 precedent set:

```
要修正→問題なし adjudicated by Lloyd, Aug 14 2026
```

Do not edit the grade in `Blind Grading` G. The verdict she gave is the record of
what she judged; an adjudication is a separate, attributed note about how to read it.

**None of the three answers changes the go/tune decision.** All three models are
TUNE on agreement alone. This question buys a clean number and a closed question,
not a different outcome — worth one message, not worth a second one.
