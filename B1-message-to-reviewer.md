# B1 — the message to send

*Session 18.5, Aug 21 2026. Forms built and patched; B1 verified live and signed-out
this morning. This supersedes section 3 of `SESSION-18-reviewer-kickoff.md`, which was
written before the forms existed and before the name tag was corrected.*

---

## Send this

```
ともこさん、お待たせしました！こちらが1セット目です。

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

【前回の修正が入っています】
15問のうち6問に【Step 2でレビュアーが修正したキー】という欄があります。
これは前回ともこさんに直していただいた内容がそのまま入っているもので、
〔ともこ〕とお名前が付いています。その欄がある問題は、元のキーではなく
修正後のキーを基準に採点してください。

【同じ文が何回か出てきます】
これは意図的です（設定を変えて同じ文を処理しているため）。前にどう付けたかは
気にせず、1件ずつ独立して見てください。

15問で25〜35分くらいです。途中保存ができないので、まとまった時間のあるときに
一気にお願いします。

もし解答キーのほうがおかしいと思う問題があったら、採点はキー通りに付けて
いただいて、コメント欄に一言書いておいてもらえれば大丈夫です。

分からないところがあれば途中でも聞いてください！
```

---

## What changed from the Session 18 draft, and why

**Her name is in the greeting.** Taken from your instruction today, not from the form —
she typed 「テスト」 into the name field, so if 「ともこさん」 is not how you normally
address her, that is the one line to change before sending.

**The 【前回の修正が入っています】 block is new, and it is not decorative.** Six of B1's
fifteen pages carry an amended-key block, and the first of them is **page 2** — the second
thing she sees. She would meet her own name, in a form she was told is blind, with no
explanation. Read cold that looks like a leak or a mistake; explained in advance it reads
as her earlier work being taken seriously. It also does a second job: it tells her which
key to grade against on those six, which the form states but easy to skim past.

**The line about a doubtful key is new.** She is the person who verified these keys, so a
key she now disagrees with is real signal — but routing it into the *grade* would corrupt
the instrument, because 一致/部分一致/見逃し/誤指摘 can only express a judgement about the
tool. Sending it to the comment box keeps the score clean and still captures it.

**Everything else is Session 18's wording, unchanged** — including 「AIが正しい前提では
作っていません」, which is load-bearing: a polite grader who assumes the tool is
authoritative drifts toward 一致, and 誤指摘 is the count the whole go/tune decision rests
on. Also unchanged: 15問 (not the 12問 the Session 17 brief wrongly promised), the
no-deadline framing, and the honest warning that the form cannot be saved halfway.

**Verified before writing this:** B1's LIVE link opens signed-out with no login wall,
renders 15 pages, and the six amended blocks now read 〔ともこ〕. The link above is copied
from the Links page, not reconstructed from an EDIT id — the mistake made on Aug 12.

---

## Still yours to call

- **Payment method.** Not yet discussed, and worth settling *before* B1 comes back —
  prompt payment on batch one is most of what makes batch two feel safe to agree to.
  銀行振込 leaves a record; PayPay is faster and more casual; Amazonギフト券 avoids
  sharing account details.
- **Whether to commit past B1 now.** Deliberately not in the message above. B1 is the
  calibration batch: it tells you whether the 4-way vocabulary is usable before ¥40,000
  is committed. If you want to keep the option without making her feel auditioned, add
  「1セット目やってみて、続けられそうだったら残りもお願いしたいです」.
- **The ¥300/output correction.** Raise it *after* B1 lands, framed as fairness rather
  than renegotiation — 「バッチごとに問題数が違うことに気づいたので、1問あたりで計算し
  直しました」. Unprompted it reads as care; after she notices B9 is twice the work it
  reads as a haggle.

## Before B9 goes out — not a problem for B1

Every form's description says 「所要時間は25〜35分ほどです」 regardless of size. That is
honest for B1's 15 and for the other fifteens, generous for B5's 12, and **wrong for B9's
30**, which is roughly double. Fix the string in `build-grading-forms.py` and re-patch
before B9 ships.
