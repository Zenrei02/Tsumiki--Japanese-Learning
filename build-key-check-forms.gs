/**
 * Builds the Naoshi Step-2 key-check forms — one Google Form per batch (B1–B8),
 * five sentences each, all feeding ONE response spreadsheet (one tab per batch).
 * v2 — reviewer-facing text is now Japanese-primary throughout: key rationales
 * are in Japanese and the FIX/UNNATURAL/NONE tier labels are glossed in the
 * form description (the labels themselves stay English by design — they are
 * the app's own tier names).
 *
 * HOW TO RUN
 *   1. Delete the v1 forms ("Naoshi — キー確認 B1..B8") and the old
 *      "Naoshi — キー確認 responses" spreadsheet from Drive, if present.
 *   2. script.google.com → New project → paste this over Code.gs
 *   3. Run → buildAllKeyCheckForms   (authorise when prompted)
 *   4. Open the execution log. Send each reviewer the LIVE link for their batch.
 *
 * Question titles are prefixed with the Eval ID (e.g. "E04 ・ キー確認") so
 * responses can be written back into naoshi-eval-v1.xlsx columns J–L by
 * import-key-check-responses.py (unchanged — works with v1 and v2 responses).
 */

var DATA = [
  {
    "id": "E18",
    "batch": "B1",
    "level": "N4",
    "sentence": "お金を貯まってる",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "お金を貯めてる",
    "rationale": "「を」なら他動詞「貯める」:「お金を貯めてる」。自動詞「貯まる」を使うなら「お金が貯まってる」。"
  },
  {
    "id": "E22",
    "batch": "B1",
    "level": "N3",
    "sentence": "明日の午前中はスーパーへ食料品を買いに行き、午後は部屋の掃除をする予定です。",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "「行き」の連用中止は正しい書き言葉のスタイル。誤りではない。"
  },
  {
    "id": "E25",
    "batch": "B1",
    "level": "N3",
    "sentence": "えりはえりの犬よりも早く私を置き換えました。（笑）",
    "status": "ERROR",
    "tier": "UNNATURAL",
    "correction": "えりはあっという間に僕から犬に乗り換えたね（笑）",
    "rationale": "文法的には正しいが、「置き換える」は物やデータに使う語で、英語の\"replace\"の直訳。人が相手ならふざけて「乗り換える」などと言うのが自然。"
  },
  {
    "id": "E29",
    "batch": "B1",
    "level": "N4",
    "sentence": "私は来月ピアノコンクールに出る予定なので、毎日ピアノを弾く練習をしています。",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "名詞「予定」の後に「な」が正しく入っている(予定なので)。文法的に問題はなく、指摘の必要はない。"
  },
  {
    "id": "E39",
    "batch": "B1",
    "level": "N4",
    "sentence": "日本のオーブンはちっちゃすぎので、できない",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "日本のオーブンはちっちゃすぎるので、できない",
    "rationale": "「〜すぎる」は動詞なので「る」を残す:「すぎるので」。"
  },
  {
    "id": "E08",
    "batch": "B2",
    "level": "N4",
    "sentence": "ベランダから僕を見えるよ（笑）",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "ベランダから僕が見えるよ（笑）",
    "rationale": "「見える」は見える対象を「が」で示す:「僕が見える」。"
  },
  {
    "id": "E16",
    "batch": "B2",
    "level": "N3",
    "sentence": "最近背中の痛みで、夜眠れず、なかなか疲れがとれません。",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "「〜ず」は正しい書き言葉の否定中止形。活用ミスとして指摘したら誤指摘。"
  },
  {
    "id": "E24",
    "batch": "B2",
    "level": "N4",
    "sentence": "え！僕も先週末に熱が出しました。",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "え！僕も先週末に熱が出ました。",
    "rationale": "「が」なら自動詞「出る」:「熱が出ました」。「出す」は他動詞(熱を出す)。"
  },
  {
    "id": "E27",
    "batch": "B2",
    "level": "N4",
    "sentence": "30日まで90キロになりたい",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "30日までに90キロになりたい",
    "rationale": "一回きりの変化の期限は「までに」:「30日までに」。「まで」は動作・状態の継続を表す。"
  },
  {
    "id": "E31",
    "batch": "B2",
    "level": "N4",
    "sentence": "修学旅行は、東京に行く予定。スカイツリーや浅草観光が楽しみだ。",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "名詞止め(〜予定。)は普通の書き言葉。だ体の第2文とも文体が一貫している。"
  },
  {
    "id": "E03",
    "batch": "B3",
    "level": "N5",
    "sentence": "大学から貰ったよ。欲しいじゃなかった…",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "大学から貰ったよ。欲しくなかった…",
    "rationale": "い形容詞の否定過去は「欲しくなかった」。「じゃなかった」は名詞・な形容詞にしか付かない。"
  },
  {
    "id": "E06",
    "batch": "B3",
    "level": "N2",
    "sentence": "会長にご報告を申し上げます。",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "「ご報告(を)申し上げる」は会長に対する正しい謙譲表現。「を」や文体を誤りとして指摘したら誤指摘。"
  },
  {
    "id": "E15",
    "batch": "B3",
    "level": "N5",
    "sentence": "もっと強いて長い薬がいる",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "もっと強くて長く効く薬がいる",
    "rationale": "「強い」のて形は「強くて」であり「強いて」は誤り。(「長い薬」も英語の直訳で、「長く効く薬」が自然。)"
  },
  {
    "id": "E20",
    "batch": "B3",
    "level": "N3",
    "sentence": "参考書をご覧になりますか？",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "「見る」の正しい尊敬語「ご覧になる」。「見ますか」への修正は誤指摘。"
  },
  {
    "id": "E30",
    "batch": "B3",
    "level": "N4",
    "sentence": "じゃ、寝ろうにする",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "じゃ、寝ることにする",
    "rationale": "「寝る」の意向形は「寝よう」で、「寝ろう」は存在しない形。「decide to」の意味なら「寝ることにする」。"
  },
  {
    "id": "E05",
    "batch": "B4",
    "level": "N2",
    "sentence": "それについて話したくないならいいが、僕の経験が起こっていないかのように扱わないでください。",
    "status": "ERROR",
    "tier": "UNNATURAL",
    "correction": "それについて話したくないならいいが、僕の経験がなかったかのように扱わないでください。",
    "rationale": "N2文型「かのように」自体は正しく使えているが、「経験が起こる」という組み合わせが不自然。経験は「ある/した」、出来事は「起こる」。文法テストでは誤りにならないためFIXではなくUNNATURAL。"
  },
  {
    "id": "E09",
    "batch": "B4",
    "level": "N4",
    "sentence": "先生が大阪にいらっしゃいました。",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "「いらっしゃる」は行く・来る・いるを兼ねる正しい尊敬語。普通形への「修正」や曖昧さの指摘は誤指摘。"
  },
  {
    "id": "E12",
    "batch": "B4",
    "level": "N3",
    "sentence": "私が好きなスポーツはバレーボールです。ダイナミックなアタックや、みんなでボールを繋ぐ一体感がとても楽しいです。",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "関係節内の「私が」は対比・特定のために必要。削除を提案したら誤指摘になる。"
  },
  {
    "id": "E32",
    "batch": "B4",
    "level": "N3",
    "sentence": "僕のプランが柔らかい",
    "status": "ERROR",
    "tier": "UNNATURAL",
    "correction": "僕のプランは柔軟だ",
    "rationale": "文法的には正しいが、「柔らかい」は物理的な柔らかさ。英語の\"flexible\"の直訳で、予定・計画には「柔軟」(または「融通がきく」)。"
  },
  {
    "id": "E33",
    "batch": "B4",
    "level": "N4",
    "sentence": "良かった！助けました！",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "良かった！助かりました！",
    "rationale": "自分が助けられた側なので自動詞「助かりました」。「助けました」だと自分が誰かを救った意味になる。"
  },
  {
    "id": "E14",
    "batch": "B5",
    "level": "N2",
    "sentence": "孤立な生活が大変だからたまに、ともが来たときは高揚された。",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "孤立した生活が大変だから、たまにともが来たときは気分が高揚した。",
    "rationale": "「孤立」は「孤立した」の形で名詞を修飾し、「孤立な」とは言えない。「高揚された」も不要な受身で、「(気分が)高揚した」が自然。"
  },
  {
    "id": "E34",
    "batch": "B5",
    "level": "N5",
    "sentence": "シンガポールの算数を教え方は世界で一番",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "シンガポールの算数の教え方は世界で一番",
    "rationale": "「教え方」は名詞なので「の」で繋ぐ:「算数の教え方」。「を」を使うなら動詞の形(算数を教える方法)が必要。"
  },
  {
    "id": "E35",
    "batch": "B8",
    "level": "N3",
    "sentence": "あの時、誰もに興味がなかったよ",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "あの時、誰にも興味がなかったよ",
    "rationale": "「も」は格助詞「に」の後ろに付く:「誰にも」。「誰もに」は順序が逆。「誰も来なかった」のように「誰も」が単独で主語になる形があるため、「誰も」を一つの塊と捉えてしまいやすい。"
  },
  {
    "id": "E36",
    "batch": "B5",
    "level": "N3",
    "sentence": "私はアルバイトをしたいと思っている。まかない付きの飲食店が希望だ。",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "「〜たいと思っている」「Nが希望だ」ともに自然。指摘なしが正解。"
  },
  {
    "id": "E40",
    "batch": "B5",
    "level": "N2",
    "sentence": "日本一高い山は富士山である。静岡県と山梨県にまたがっている。",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "である体+第2文の主語省略はどちらも正しい。文体だけを理由に指摘したら誤指摘。"
  },
  {
    "id": "E07",
    "batch": "B6",
    "level": "N5",
    "sentence": "6時の電車を乗る！",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "6時の電車に乗る！",
    "rationale": "「乗る」は「に」を取る:「電車に乗る」。"
  },
  {
    "id": "E10",
    "batch": "B6",
    "level": "N5",
    "sentence": "会いは8時からでしょう？",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "会うのは8時からでしょう？",
    "rationale": "「会い」は単独の名詞として使えない。動詞を「の」で名詞化して「会うのは」とする。"
  },
  {
    "id": "E11",
    "batch": "B6",
    "level": "N2",
    "sentence": "そのせいで今は変な空気になっちゃって、アダムだけが蚊帳の外にいる感じ。",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "誤りのない実際の学習者の文。N2慣用句「蚊帳の外」を含む。指摘なしが正解。"
  },
  {
    "id": "E19",
    "batch": "B6",
    "level": "N3",
    "sentence": "僕は帰ってほしい？",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "僕に帰ってほしい？",
    "rationale": "「〜てほしい」で動作してほしい相手は「に」で示す:「僕に帰ってほしい？」。「僕は」だと自分が望む側になり、意図と逆の意味になる。"
  },
  {
    "id": "E26",
    "batch": "B6",
    "level": "N5",
    "sentence": "原口さん、引っ越しを助ける人が知っていますか？",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "原口さん、引っ越しを手伝ってくれる人を知っていますか？",
    "rationale": "知っている対象は「を」で示す:「人を知っていますか」。「が」だと知っている側(主語)の意味になる。(「助ける」より「手伝ってくれる」がより自然。)"
  },
  {
    "id": "E01",
    "batch": "B7",
    "level": "N5",
    "sentence": "お昼はスーパーでお弁当を買って食べました。",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "基本のて形の連続で、完全に自然な文。指摘なしが正解。"
  },
  {
    "id": "E21",
    "batch": "B7",
    "level": "N4",
    "sentence": "2級ならいいけど3級を合格することはビザのことに関係ないよ．",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "2級ならいいけど3級に合格することはビザのことに関係ないよ．",
    "rationale": "「合格する」は「に」を取る:「3級に合格する」。"
  },
  {
    "id": "E23",
    "batch": "B7",
    "level": "N5",
    "sentence": "ひらがな・カタカナでもまだ分かりないの？！って思った。",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "ひらがな・カタカナでもまだ分からないの？！って思った。",
    "rationale": "「分かる」の否定形は「分からない」。「分かりない」という形は存在しない。"
  },
  {
    "id": "E28",
    "batch": "B7",
    "level": "N4",
    "sentence": "ワンパンマン見る後、モブサイコ見た",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "ワンパンマン見た後、モブサイコ見た",
    "rationale": "「後」の前の動詞は過去形:「見た後」。(逆に「前」は辞書形:「見る前」。)"
  },
  {
    "id": "E38",
    "batch": "B7",
    "level": "N5",
    "sentence": "めちゃ楽しいでした！",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "めちゃ楽しかったです！",
    "rationale": "い形容詞は自ら過去形に活用するため「でした」を直接付けられない。過去の丁寧形は「楽しかったです」。"
  },
  {
    "id": "E02",
    "batch": "B8",
    "level": "N4",
    "sentence": "えりが直ってくれると思ったから（笑）",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "えりが直してくれると思ったから（笑）",
    "rationale": "「〜てくれる」には他動詞が必要:「直してくれる」。「直る」は自動詞で、物が自然に直る意味になる。"
  },
  {
    "id": "E04",
    "batch": "B8",
    "level": "N4",
    "sentence": "歩いて帰るつもりのに飲み過ぎた",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "歩いて帰るつもりなのに飲み過ぎた",
    "rationale": "「つもり」は名詞なので「のに」の前に「な」が必要:「つもりなのに」。"
  },
  {
    "id": "E13",
    "batch": "B8",
    "level": "N3",
    "sentence": "15時に御社に伺います。",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "相手の会社を訪ねる正しい謙譲語「伺う」+「御社」。ビジネスの場面として適切で、誤りではない。"
  },
  {
    "id": "E17",
    "batch": "B8",
    "level": "N2",
    "sentence": "僕は優しいから僕の罪悪感をつけ込んだ．",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "僕が優しいから、僕の罪悪感につけ込んだ．",
    "rationale": "「付け込む」は弱みを「に」で示す:「罪悪感につけ込む」。(「僕は」も動作主が曖昧になるため「僕が優しいから」が読みやすい。)"
  },
  {
    "id": "E37",
    "batch": "B8",
    "level": "N5",
    "sentence": "ゴルフ好き人のためだけではなく、気になる人も集まりたいでしょ？",
    "status": "ERROR",
    "tier": "FIX",
    "correction": "ゴルフが好きな人のためだけではなく、気になる人も集まりたいでしょ？",
    "rationale": "「好き」はな形容詞なので名詞の前は「好きな人」。(「ゴルフ好きの人」という複合語も可。)"
  },
  {
    "id": "E41",
    "batch": "B9",
    "level": "N5",
    "sentence": "日本のランキングはどう思う？",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "普通の口語の疑問文で、直すところはない。"
  },
  {
    "id": "E42",
    "batch": "B9",
    "level": "N4",
    "sentence": "鳥山先生のネーミングセンスは変！！",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "「変」を「だ」なしで述語に使うのは口語として普通。「変だ」に直すのは誤指摘になる。"
  },
  {
    "id": "E43",
    "batch": "B9",
    "level": "N4",
    "sentence": "今週末のパーティに行こうかなー",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "意向形「行こう」＋「かな」で正しい。意向形が誤っているE30と対になる、正しい方の例。"
  },
  {
    "id": "E44",
    "batch": "B9",
    "level": "N4",
    "sentence": "今週末はいっぱい宿題があるけど、来週はお休み",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "口語の二文で、最後を名詞「お休み」で終える普通の書き方。E31と同じ形を、実際の学習者が書いた例。"
  },
  {
    "id": "E45",
    "batch": "B9",
    "level": "N3",
    "sentence": "あのとき、凄くハマってたよ…",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "「ハマってた」は「ハマっていた」の口語の縮約形で、誤りではない。口語を誤りとしないかを見る行。"
  },
  {
    "id": "E46",
    "batch": "B9",
    "level": "N3",
    "sentence": "他の仕事を見つけられませんので、近い所で探しました。岡山市はあまり遠くないでしょう？",
    "status": "CORRECT",
    "tier": "NONE",
    "correction": "—",
    "rationale": "丁寧体。可能形の否定「見つけられません」＋「ので」、続けて丁寧な疑問文。文法上の問題はない。"
  },
  {
    "id": "E47",
    "batch": "B9",
    "level": "N5",
    "sentence": "進撃の巨人をみたい〜",
    "status": "ERROR",
    "tier": "WORTH KNOWING",
    "correction": "進撃の巨人を見たい〜",
    "rationale": "文法の誤りではないため注意喚起（WORTH KNOWING）。「見たい」は漢字で書くのが標準で、かなの「みたい」は「〜のようだ」の意味と紛らわしい。"
  },
  {
    "id": "E48",
    "batch": "B9",
    "level": "N5",
    "sentence": "来週、ともだちと映画を見に行きます。",
    "status": "ERROR",
    "tier": "WORTH KNOWING",
    "correction": "来週、友達と映画を見に行きます。",
    "rationale": "「友達」が標準的な表記。かなでも誤りではないが、同じ文で「映画」「見」「行」は漢字なので不統一に見える。文法上の問題はない。"
  },
  {
    "id": "E49",
    "batch": "B9",
    "level": "N3",
    "sentence": "前はちょっと感情があったけど今はあんまりないと思う",
    "status": "ERROR",
    "tier": "UNNATURAL",
    "correction": "前はちょっと気持ちがあったけど今はあんまりないと思う",
    "rationale": "文法的には正しいのでUNNATURALどまり。「感情」は心理学的なカテゴリーとしての感情。人に対する気持ちは「気持ち」（慣用的には「気がある」）。"
  },
  {
    "id": "E50",
    "batch": "B9",
    "level": "N3",
    "sentence": "例えば、糖尿病は家族でよくあること。",
    "status": "ERROR",
    "tier": "UNNATURAL",
    "correction": "例えば、糖尿病は家系によくあること。",
    "rationale": "文法的には正しいのでUNNATURALどまり。「家族」は同居する家族、遺伝的な傾向は「家系」。英語の"runs in the family"の直訳。"
  }
];

/**
 * LIVE v2 form ids. Needed by patchAllKeyCheckForms.
 *
 * CORRECTED Aug 7 2026. The previous values here were copied from the link table
 * in the Session 6.1 journal, and that table is the **v1** set — the forms deleted
 * during the English-rationale rebuild. All eight were in the Drive trash, so a
 * patch run against them reported success and changed nothing a reviewer could see.
 * These ids come from Drive itself (created 2026-08-05T16:24–16:27Z, matching the
 * v2 build), verified against the live B1 form.
 *
 * Owner is quantumshifting@gmail.com, not zensoreno@gmail.com — the forms were
 * built while signed into the other account. zensoreno has editor access.
 *
 * Response spreadsheet 「Naoshi — キー確認 responses (all batches)」:
 *   1og82GhV3xcabE7DMr7NfNR2wtvvmmCQmDaeADyaHqPM
 */
var FORM_IDS = {
  B1: '15Ii484AOvUAEw1rsMM5WJGj6H5hU-7RNHxaUjVWE94o',
  B2: '1iyVRGLUii5zWoWqv1cM4FMP4H17DEgn0gBIF8ckwXb8',
  B3: '1rrLmz-6x-FCxv_umBIU3HqYXsWhiDFKvzRRDj5wiVGA',
  B4: '1V8Zmj68zSl-Pki6WkZWArJK778_uBuJu70-emI2oXcY',
  B5: '1He1ChhU6WVq47b-AE_Agdkw4UruZz-X-vmLpmAbqUrs',
  B6: '1sq46bjgwS2-TiHhpjwyNNM7Zjvx33Rj-zObABqmHgEU',
  B7: '1ojPRe41f-oxlcj0z2Xp5Xz7VhOtGbjKMF8b0_azRvo8',
  B8: '1NsMg9Oc_zs2fSmeBvbHTgBzjNU5Lv2YcEGHCT8tiyDA'
};

// ---------- shared rendering ----------
// v3 (Aug 6 2026), on reviewer feedback: レベル and the intended status are
//出題側 metadata, not claims the reviewer is being asked to verify. Leaving them
// inside 【解答キー】 meant a reviewer who disagreed with a level had no way to say
// so except 要修正 — indistinguishable in column J from "the correction is wrong".
// Level now sits in the item heading (their suggested format), the intended status
// sits with the sentence in Japanese, and 【解答キー】 holds only 判定・修正案・理由.

function intendedJa(status) {
  return status === 'CORRECT' ? '誤りなし' : '誤りあり';
}

function itemTitle(row) {
  return row.id + ' ・ ' + row.sentence + '（レベル:' + row.level + '）';
}

function itemHelp(row) {
  return '【文】\n' + row.sentence + '\n' +
         'レベル: ' + row.level + ' ・ 出題の想定: ' + intendedJa(row.status) + '\n\n' +
         '【解答キー】\n' +
         '判定: ' + row.tier + '\n' +
         '修正案: ' + row.correction + '\n' +
         '理由: ' + row.rationale;
}

function formDescription(batch, n) {
  return '文法チェックツールを採点する前に、「解答キー」（想定される判定と修正）が正しいかどうかを確認していただくフォームです。\n\n' +
    'この' + batch + 'バッチには' + n + '文あります。所要時間は10〜15分ほどです。途中保存はできないので、1回で最後までお願いします。\n\n' +
    '各文について：文とその解答キー（判定・修正案・理由）が表示されます。キーが正しいか判断してください。\n' +
    '・問題なし ＝ キーは正しい\n' +
    '・要修正 ＝ キーが間違っている（あなたの修正案を書いてください）\n' +
    '・一部修正 ＝ おおむね正しいが直しが必要（補足を書いてください）\n\n' +
    '【判定ラベルの意味】\n' +
    '・FIX ＝ 文法的な誤り（テストで×になるもの）\n' +
    '・UNNATURAL ＝ 文法的には正しいが、母語話者はそう言わない\n' +
    '・NONE ＝ 指摘なし（正しく自然な文）\n\n' +
    '【確認していただく範囲について】\n' +
    'レベル（N5〜N2）と「出題の想定」は出題側の情報で、確認の対象ではありません。' +
    '見ていただきたいのは【解答キー】の判定・修正案・理由だけです。\n' +
    '「出題の想定: 誤りなし」の文は、間違いのない文として出題されています。本当に間違いがないかを確認してください。\n' +
    'ツールの出力はまだ見ないでください（このフォームには含まれていません）。';
}

/**
 * Rewrites the section headers and description on the EXISTING live forms.
 * Question titles are never touched, so responses already collected stay valid
 * and import-key-check-responses.py is unaffected. Links do not change.
 *
 * Run → patchAllKeyCheckForms
 */
function patchAllKeyCheckForms() {
  var byId = {};
  DATA.forEach(function (row) { byId[row.id] = row; });
  var batches = Object.keys(FORM_IDS).sort();

  // ---- Phase 1: verify every form is the batch FORM_IDS claims it is. ----
  // The ids were transcribed from a journal page. A wrong-but-valid id would
  // still patch each section with data matching its own Eval ID, so the sentences
  // would look fine — but the batch name in the description would be wrong and
  // nothing would visibly break. Check first, change nothing until all 8 agree.
  var plan = [], problems = [];
  batches.forEach(function (batch) {
    var expected = DATA.filter(function (r) { return r.batch === batch; })
                       .map(function (r) { return r.id; }).sort();
    var form, sections = [], found = [];
    try {
      form = FormApp.openById(FORM_IDS[batch]);
    } catch (e) {
      problems.push(batch + ': cannot open form — ' + e.message);
      return;
    }

    // A TRASHED form still opens, still patches, and still reports success —
    // while its public link serves "no longer accepting responses". Found
    // Aug 7 2026: all eight ids recorded in the Session 6.1 journal turned out
    // to be trashed, so a patch run against them would have looked clean and
    // changed nothing a reviewer could see. Check before trusting the id.
    try {
      if (DriveApp.getFileById(FORM_IDS[batch]).isTrashed()) {
        problems.push(batch + ': form is IN THE TRASH — its public link is dead. '
                      + 'This id is almost certainly a superseded copy.');
        return;
      }
    } catch (e) {
      problems.push(batch + ': cannot check trashed state — ' + e.message);
      return;
    }

    if (!form.isAcceptingResponses()) {
      problems.push(batch + ': form is not accepting responses.');
      return;
    }
    form.getItems(FormApp.ItemType.SECTION_HEADER).forEach(function (item) {
      var m = item.getTitle().match(/^(E\d{2})/);
      if (m && byId[m[1]]) { sections.push(item); found.push(m[1]); }
    });
    found.sort();
    if (found.join(',') !== expected.join(',')) {
      problems.push(batch + ': expected [' + expected.join(' ') +
                    '] but form contains [' + found.join(' ') + ']');
      return;
    }
    plan.push({ batch: batch, form: form, sections: sections, n: expected.length });
  });

  if (problems.length) {
    Logger.log('ABORTED — nothing was changed.');
    problems.forEach(function (p) { Logger.log('  ' + p); });
    Logger.log('');
    Logger.log('Check FORM_IDS against the EDIT links in the Session 6.1 journal.');
    return;
  }

  // ---- Phase 2: apply. Idempotent — safe to run twice. ----
  plan.forEach(function (p) {
    p.form.setDescription(formDescription(p.batch, p.n));
    p.sections.forEach(function (item) {
      var row = byId[item.getTitle().match(/^(E\d{2})/)[1]];
      var sh = item.asSectionHeaderItem();
      sh.setTitle(itemTitle(row));
      sh.setHelpText(itemHelp(row));
    });
    Logger.log(p.batch + '  patched ' + p.n + ' sections');
  });
  Logger.log('');
  Logger.log('Done — all 8 forms verified and patched.');
  Logger.log('Links unchanged. Responses already collected are unaffected.');
  Logger.log('');
  Logger.log('--- CURRENT LINKS — paste these into the Notion links page ---');
  plan.forEach(function (p) {
    Logger.log(p.batch + '  LIVE: ' + p.form.getPublishedUrl());
    Logger.log(p.batch + '  EDIT: ' + p.form.getEditUrl());
  });
}

function buildAllKeyCheckForms() {
  var ss = SpreadsheetApp.create('Naoshi — キー確認 responses (all batches)');
  var batches = {};
  DATA.forEach(function (row) {
    (batches[row.batch] = batches[row.batch] || []).push(row);
  });
  Object.keys(batches).sort().forEach(function (b) {
    buildOneForm(b, batches[b], ss);
  });
  Logger.log('');
  Logger.log('RESPONSES (all batches, one tab per form): ' + ss.getUrl());
  Logger.log('When batches are done: File → Download → Microsoft Excel, drop the file');
  Logger.log('in the project folder, and run import-key-check-responses.py.');
}

function buildOneForm(batch, rows, ss) {
  var form = FormApp.create('Naoshi — キー確認 ' + batch + ' (' + rows.length + '文)');
  form.setDescription(formDescription(batch, rows.length));
  try { form.setCollectEmail(false); } catch (e) {}
  form.setLimitOneResponsePerUser(false);
  form.setProgressBar(true);
  form.setShuffleQuestions(false);
  form.setAllowResponseEdits(true);
  form.setConfirmationMessage('ありがとうございました！ ' + batch + ' の確認はこれで完了です。');

  form.addTextItem()
    .setTitle('お名前 / Your name')
    .setHelpText('どのバッチを誰が確認したか記録するためだけに使います。')
    .setRequired(true);

  rows.forEach(function (row, i) {
    if (i > 0) form.addPageBreakItem().setTitle(row.id + ' （' + (i + 1) + '/' + rows.length + '）');
    form.addSectionHeaderItem().setTitle(itemTitle(row)).setHelpText(itemHelp(row));
    form.addMultipleChoiceItem()
      .setTitle(row.id + ' ・ キー確認')
      .setChoiceValues(['問題なし', '要修正', '一部修正'])
      .setRequired(true);
    form.addParagraphTextItem()
      .setTitle(row.id + ' ・ 修正案')
      .setHelpText('「要修正」「一部修正」の場合はこちらに。')
      .setRequired(false);
    form.addParagraphTextItem()
      .setTitle(row.id + ' ・ コメント')
      .setRequired(false);
  });

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  Logger.log(batch + '  EDIT: ' + form.getEditUrl());
  Logger.log(batch + '  LIVE: ' + form.getPublishedUrl());
}
