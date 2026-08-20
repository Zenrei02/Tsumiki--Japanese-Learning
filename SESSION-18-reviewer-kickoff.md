# Reviewer kickoff — everything to send and run

*Session 18, Aug 20 2026. The reviewer said yes on Aug 19 and asked
「いつぐらいに確認をしたらいいですか？」. Decisions taken this session: the forms are
built under **zensoreno@gmail.com**, and the B1 link goes out **Friday Aug 21**.*

---

## 0. One correction to the Session 17 brief, before you send anything

**B1 is 15 outputs, not 12.** The brief's suggested reply said 12問; that number
belongs to B5, the one small batch. Real sizes, read out of the generated file:

| B1 | B2 | B3 | B4 | B5 | B6 | B7 | B8 | B9 | total |
|----|----|----|----|----|----|----|----|----|-------|
| 15 | 15 | 15 | 15 | 12 | 15 | 15 | 18 | 30 | 150 |

The form's own description tells the grader 25〜35分. The reply below says 30分
くらい, which matches. Promising 12問 and delivering 15 would be a bad first
impression on the one batch that exists to build trust.

---

## 1. Send this now

They are waiting on a date, so this goes before the forms are built.

```
ありがとう！すごく助かります🙏

今フォームを準備しているので、明日中にリンクを送りますね。
1セット目は15問で、30分くらいで終わると思います。

締め切りは特にないので、時間のあるときにゆっくりやってもらえれば大丈夫です。
ただ、途中保存ができない作りなので、まとまった時間があるときにお願いします。

やってみて「思ってたのと違うな」と思ったら、途中でやめてもらっても
全然かまいません。そのときは送信せずに閉じて、一言もらえれば大丈夫です。

またリンクと一緒に、やり方の説明も送ります！
```

Four things that copy is doing on purpose: a real date, no deadline, an
explicit exit, and an honest warning that the form can't be saved halfway —
which the Session 17 draft omitted and which would otherwise be discovered the
hard way, 20 minutes in.

---

## 2. Build the forms — run checklist

**Account decision, recorded: `zensoreno@gmail.com` runs this.** Written down
because the expensive mistake is re-running under the other account when a form
looks missing, which creates a second live form set. It does not need to match
the account that owns the Step 2 key-check forms — the two steps are separate
form sets with separate response sheets, and `import-grading-responses.py` reads
a downloaded `.xlsx`, so it never authenticates as anyone.

One side benefit of choosing zensoreno: it is a personal Gmail, not a Workspace
account, so the domain-restriction trap that silently blocks outside respondents
does not apply. Step 6 still verifies it rather than assuming.

1. **Check the account first.** Open script.google.com and confirm the avatar
   top-right is `zensoreno@gmail.com`. If you're multi-signed-in, use a fresh
   profile or an incognito window with only that account.
2. New project → paste `build-grading-forms.gs` over `Code.gs` (173 KB, it will
   take a second to paste).
3. Run → `buildAllGradingForms` → authorise when prompted.
4. **Expect it to stop early, and don't panic.** ~600 form items sit close to
   Apps Script's 6-minute limit. The script now remembers what it finished, so
   if it stops it says so and names the batches left. **Run
   `buildAllGradingForms` again** — it resumes and skips what's done. Repeat
   until it reports nothing remaining. Running it five times is harmless; the
   one thing that isn't is starting a *new project* to try again, because a new
   project has no memory and will duplicate every form.
5. Run → `showLinks` → **copy the whole log into
   `grading-form-links.md` in the project folder.** The Apps Script console
   clears, and Session 5 lost a response-sheet URL exactly this way. `showLinks`
   can reprint it, but only from that same project under that same account.
6. **Verify, don't trust the log.** Two checks, both cheap:
   - Search Drive as zensoreno for `ブラインド採点` → expect **9 forms + 1
     spreadsheet**. If a form is missing here but the log claimed it, stop and
     say so — do not re-run.
   - Open **B1's LIVE url in a private window, signed out**. It must render the
     questions with no login prompt. If it asks for a login, the reviewer would
     hit the same wall and would probably assume they'd done something wrong.
7. Only then send section 3.

*Note on Drive titles: after a form is created its Drive filename can lag behind
what the script set. Judge a form by opening it, not by its name in the list.*

---

## 3. Send with the B1 link

```
お待たせしました！こちらが1セット目です。

［B1のLIVEリンク］

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

【同じ文が何回か出てきます】
これは意図的です（設定を変えて同じ文を処理しているため）。前にどう付けたかは
気にせず、1件ずつ独立して見てください。

15問で25〜35分くらいです。途中保存ができないので、まとまった時間のあるときに
一気にお願いします。

分からないところがあれば途中でも聞いてください！
```

The 「AIが正しい前提では作っていません」 line is load-bearing. A polite grader who
assumes the tool is authoritative drifts toward 一致, and 誤指摘 — the count the
whole go/tune decision rests on — is the cell that drift would empty.

---

## 4. Pricing for batches 2–9 — decide before B1 lands

¥5,000 flat per batch is uneven now that the batches aren't: B5 is 12 outputs
and B9 is 30, for the same money.

**¥300/output.** B1 stays at ¥5,000 as promised — do not revise it down; at
¥300 it would have been ¥4,500, so you're ¥500 generous on the calibration
batch, which is a fine place to be generous.

| batch | outputs | at ¥300 |
|-------|---------|---------|
| B1 | 15 | ¥5,000 *(as promised)* |
| B2–B4 | 15 each | ¥4,500 each |
| B5 | 12 | ¥3,600 |
| B6–B7 | 15 each | ¥4,500 each |
| B8 | 18 | ¥5,400 |
| B9 | 30 | ¥9,000 |
| **total** | **150** | **¥45,500** |

Raise it *after* B1, framed as a fairness correction rather than a
renegotiation — *「バッチごとに問題数が違うことに気づいたので、1問あたりで
計算し直しました」*. Coming from you unprompted, it reads as care; coming after
they notice B9 is twice the work, it reads as a haggle.

**Two things still open, and both are yours to call:**

- **How to pay.** Not yet discussed. 銀行振込 is normal for this size and leaves
  a record; PayPay is faster and more casual between friends; Amazonギフト券
  avoids sharing account details. Worth settling *before* B1 comes back, so
  the first payment is prompt — prompt payment on batch one is most of what
  makes batch two feel safe to agree to.
- **Whether to commit past B1 now.** The de-risking argument says don't. B1 is
  the calibration batch: it tells you whether the form wording holds up and
  whether the 4-way vocabulary is usable before ¥40,000 is committed. Say
  「1セット目やってみて、続けられそうだったら残りもお願いしたいです」 and you
  keep the option without making them feel auditioned.

---

## 5. When responses come back

`import-grading-responses.py` writes them into the Blind Grading sheet, and the
Results sheet's Accuracy section and GO/TUNE cells compute themselves.

Two things to carry into reading that verdict — both already established, both
invisible to the grader, and neither will appear in the number:

- **The romaji leak.** 6 confirmed rows across all three models, so a
  `SYSTEM_PROMPT` gap rather than a property of any one model. Whether it's a
  caveat or a blocking fix is undecided.
- **The cost spread.** Haiku $3.59 / Sonnet ~$32.7 / Opus ~$45.9 per 1,000
  checks. Knowable now, and it sets how large a quality gap has to be before the
  expensive model is worth it. Decide roughly what gap would justify 9× *before*
  seeing the scores, or the number will justify whatever it happens to say.
