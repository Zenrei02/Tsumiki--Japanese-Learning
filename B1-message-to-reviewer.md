# B1 — the message to send

*Session 18.5, Aug 21 2026. Forms built, patched twice, B1 verified live and
signed-out. Supersedes section 3 of `SESSION-18-reviewer-kickoff.md`.*

> ⚠️ **The Step 3 grader is NOT the Step 2 reviewer.** Established late on Aug 21,
> after a first draft had been written on the opposite assumption. It changes the
> amended-key wording below, the name tag inside the forms, and how the B1 results
> should be read. Everything downstream of "same person" was rewritten.

---

## Send this

Replace `［お名前］` with how you address her — that is the only blank left.

```
［お名前］さん、お待たせしました！こちらが1セット目です。

https://docs.google.com/forms/d/e/1FAIpQLSfO2OlT-vWhUwvt419nJPxg3DgQxHOQi7Vyjj8W0R1lK7RdYA/viewform

【やっていただくこと】
1問ごとに、学習者が書いた日本語の文と、その文についてAIツールが言ったことが
並んでいます。上に【解答キー】（正しい答え）があるので、それと照らして、
ツールの出力が合っているかを4つから選んでください。

・一致　　… ツールの指摘が解答と合っている
・部分一致 … 間違いがあるのは合っているが、種類・箇所・説明のどれかがずれている
・見逃し　 … 解答にある間違いをツールが指摘していない
・誤指摘　 … 正しい部分を間違いとして指摘している

コメント欄は任意ですが、「部分一致」「誤指摘」を選んだときに、どこがずれて
いるか一言もらえるとすごく助かります。

【いちばん大事なこと】
AIが正しい前提では作っていません。むしろ、どこで間違えるかを知るための
テストです。「これは違うでしょ」と思ったら、遠慮なくそう付けてください。
厳しく付けてもらうほど価値があります。

【解答キーについて】
15問のうち6問に【Step 2でレビュアーが修正したキー】という欄があります。
解答キーは前の段階で別のネイティブの方に一度チェックしてもらっていて、その方が
直した内容がそのまま入っています。その欄がある問題は、元のキーではなく
修正後のキーを基準に採点してください。

そのうえで、キー自体がおかしいと思う問題があったら、採点はキー通りに付けて
いただいて、コメント欄に「キーのほうが違うと思う」と書いておいてください。
そこが食い違うこと自体が知りたい情報なので、遠慮なくお願いします。

【同じ文が何回か出てきます】
これは意図的です（設定を変えて同じ文を処理しているため）。前にどう付けたかは
気にせず、1件ずつ独立して見てください。

15問で25〜35分くらいです。途中保存ができないので、まとまった時間のあるときに
一気にお願いします。

分からないところがあれば途中でも聞いてください！
```

---

## What the "different person" fact changed

**The amended-key block now says the opposite of the first draft.** It previously read
「前回ともこさんに直していただいた内容」 — written when the grader was thought to be the
same person. Sent to this reviewer it would have been a misattribution on **page 2**, the
second thing she sees, in a form she has been told is blind. It now says a different
native checked the key beforehand, which is both true and useful: it tells her the key
has standing without asking her to defer to a stranger.

**The tag inside the forms became a role.** 〔ともこ〕 → 〔別のネイティブレビュアー〕,
re-patched across all nine forms. Eval Set column L still holds the real name, because
that column is the provenance record and rewriting it would erase who did the Step 2
work; `build-grading-forms.py` redacts the tag at render time instead. The record and
the artifact want different things here, and that is not a conflict to resolve by
picking one.

**The "if the key looks wrong" line got promoted and expanded.** With one person doing
both steps it was a nicety. With two it is the main safety valve — see below.

---

## ⚠️ Read this before reading the B1 score

**A different person set the key than grades against it, and that is a confound the
number will not show.** Where this reviewer disagrees with the Step 2 reviewer's amended
key, the disagreement surfaces as 部分一致 or 誤指摘 **charged to the tool** — because
一致/部分一致/見逃し/誤指摘 can only express a judgement about the tool. Two natives
differing gets recorded as the tool being wrong.

**Six of B1's fifteen pages carry an amended key** (pages 2, 3, 6, 7, 10, 12), so this is
not a marginal effect on the calibration batch. Before treating a low B1 score as a tool
problem, read the comment boxes on those six first.

It is not purely a cost. One person doing both steps would grade the tool against their
own remembered reasoning; an independent grader is a stronger test of whether the key is
objectively usable at all. But it has to be read deliberately rather than absorbed into
the headline.

---

## Still yours to call

- **Her name**, for the greeting — the one blank above.
- **Payment method.** Not yet discussed, and worth settling *before* B1 comes back:
  prompt payment on batch one is most of what makes batch two feel safe to agree to.
- **Whether to commit past B1 now.** Deliberately not in the message. If you want the
  option without making her feel auditioned, add 「1セット目やってみて、続けられそう
  だったら残りもお願いしたいです」.
- **Whether ¥5,000 was ever agreed with *this* reviewer.** The kickoff's pricing section
  says "B1 stays at ¥5,000 as promised" — that promise was made in a conversation whose
  other party I cannot verify. Worth checking before the ¥300/output correction is
  framed as a raise to someone who never heard the original figure.

## Before B9 goes out — not a problem for B1

Every form's description says 「所要時間は25〜35分ほどです」 regardless of size. Honest for
B1's 15, generous for B5's 12, **wrong for B9's 30**, which is roughly double. Fix the
string in `build-grading-forms.py` and re-patch before B9 ships.
