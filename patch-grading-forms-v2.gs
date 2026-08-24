/**
 * Naoshi Step-3 blind grading — IN-PLACE CLARITY PATCH. Aug 24 2026.
 *
 * WHY THIS EXISTS
 *   B1 came back Aug 22 and the grader told us, in her own words, what went wrong:
 *
 *     ①間違えた文章 → ②日本人の訂正した正しい文章 → ③また間違えた文章
 *     が書いてあったので、③の間違えた文章をまた訂正しないといけないのか、
 *     日本人の訂正した正しい文章はなにもしなくていいのか
 *     何を評価すればいいのか分かりづらかったです。
 *
 *   That is an accurate description of the form. Each page shows 【文】, then
 *   【解答キー】, then 【ツールの出力】 — and the third block opens with 判定: FIX
 *   and quotes broken Japanese throughout. Read as a SEQUENCE OF SENTENCES rather
 *   than as problem / reference / thing-being-judged, the third one looks like more
 *   broken Japanese awaiting correction. The old text did say
 *   「← 採点していただくのはこの部分です」, but the visual sequence overpowered one line.
 *
 *   Consequence worth stating plainly: her B1 comments are mostly REWRITES of the
 *   Japanese, which is Step-2 behaviour. Her 誤指摘 verdicts may therefore mean
 *   "the tool's suggested fix is bad Japanese" rather than "the tool flagged a
 *   correct part as an error" — and only the second meaning belongs in the
 *   invented-error gate. B1 is being disambiguated by asking her directly; this
 *   script makes sure B2-B9 never raise the question.
 *
 * WHAT IT CHANGES
 *   1. The form description, replaced wholesale. Leads with 日本語を直す必要はありません,
 *      names the three blocks by ROLE, and redefines all four verdicts as a
 *      comparison of ② against ③ rather than as free-standing judgements.
 *   2. Three block labels in every section header's helpText:
 *        【文】                                  -> 【① 学習者が書いた文】（直さなくて大丈夫です）
 *        【解答キー】                             -> 【② 正解 ＝ 判断の基準】（直さなくて大丈夫です）
 *        【ツールの出力】← 採点していただくのはこの部分です
 *                                               -> 【③ ツールの答え】★ 評価するのはココだけ …
 *   3. The comment field's helpText, so it stops inviting a rewrite.
 *
 *   The SENTENCES, KEYS and TOOL OUTPUT are not touched. Only labels and guidance.
 *
 * WHAT IT DOES NOT CHANGE, AND WHY THAT MATTERS MORE THAN USUAL
 *   No item is added, deleted or renamed. No choice value is altered. A response
 *   column is named by its item TITLE, so setHelpText cannot orphan one — which is
 *   how patch-b7-b8-forms.gs orphaned 16 columns on B8: it DELETED AND RE-ADDED
 *   questions. Nothing here does.
 *
 *   B1 ALREADY HAS A LIVE RESPONSE IN IT (木谷恵子, 8/22/2026 10:40:52). Before
 *   Saturday a rebuild of B1 would merely have been wasteful; now it would orphan
 *   real graded data. It is in the list below because a text patch is safe and
 *   keeps the nine forms consistent — but this must never become a rebuild script.
 *
 * HOW TO RUN
 *   script.google.com -> the existing "Naoshi - Build Grading Forms" project (or a
 *   new one; this needs no Script Properties), signed in as zensoreno@gmail.com,
 *   which OWNS these nine forms. Run patchAllGradingFormsV2, then — separately —
 *   run verifyClarityPatch and confirm it reports OK on all nine.
 *   Re-running is a no-op: the second pass finds 0 and says so.
 *
 * IT FAILS LOUDLY RATHER THAN PARTIALLY
 *   Every form declares its output count. Expected label replacements are exactly
 *   3 x outputs, and expected comment-helpText replacements exactly 1 x outputs.
 *   Anything else is a MISMATCH and the run ends unclean. This project has twice
 *   been handed a truthful success log for a broken artifact, so the verifier
 *   re-opens every form from scratch instead of trusting this run's own counters.
 */

// ── The nine forms. EDIT ids from the 🔗 Links page LIVE table (unchanged from
//    patch-grading-forms.gs run 2, which patched all nine cleanly on Aug 21).
//    `n` is the output count, taken from each form's own title: B1 (15件) etc.
var FORMS = [
  { batch: 'B1', id: '1237INUWWjKEpG5C8fodflhYd7uTVNRpE84e-9A3qh9Y', n: 15 },
  { batch: 'B2', id: '1BYSGds5PniJo5Fzmf8Zhhh56n5RpVwOTLR-UkMAlBAs', n: 15 },
  { batch: 'B3', id: '1exE4heUB_Mw_ZP0u4ooTD7KbZ_TzpTE6inWDqgLaNOA', n: 15 },
  { batch: 'B4', id: '1qi06fey2xumrSnY9hKIAwgtsNshbNj8cLx1_jLaKJSU', n: 15 },
  { batch: 'B5', id: '1R95S-sXQ2T1lIA1rZI6LmCKpCAQ2EIIDhqJmMeJ5A4Y', n: 12 },
  { batch: 'B6', id: '1Q0FoVPPH8J-lr9yCRCqlzCQJ1bqrEyc12F0Q2znY464', n: 15 },
  { batch: 'B7', id: '1wkgudE6d0RjPYzD3xCoDtzSEXd82cg7oUcyTwt4Y72g', n: 15 },
  { batch: 'B8', id: '15wLjmsMsepk83VeeeRgChlWX3h8BmLI6x2slVIK5uQw', n: 18 },
  { batch: 'B9', id: '19f6hLcU0cFA3Qw84853ZU-JLFrxW2lMwN8lZvFPoy30', n: 30 }
];

// ── The three block labels, old -> new. Order matters only in that ③'s old string
//    contains its own guidance clause, which must be matched in full.
var LABELS = [
  { from: '【文】',
    to:   '【① 学習者が書いた文】（間違いを含みます。直さなくて大丈夫です）' },
  { from: '【解答キー】',
    to:   '【② 正解 ＝ 判断の基準】（ネイティブ確認済み。直さなくて大丈夫です）' },
  { from: '【ツールの出力】← 採点していただくのはこの部分です',
    to:   '【③ ツールの答え】★評価するのはココだけです ― ②と同じことを言えていますか？' }
];

var COMMENT_HELP_FROM = '「部分一致」「誤指摘」の場合は、どこがずれているか一言お願いします。';
var COMMENT_HELP_TO   = '「部分一致」「見逃し」「誤指摘」を選んだときは、②と③のどこが違うか一言だけお願いします。' +
                        '日本語を直していただく必要はありません。' +
                        '「③の直し方が不自然だ」と感じた場合も、ここに書いてください。';

/** 所要時間, computed the same way build-grading-forms.py does: ~1.7-2.3 min per
 *  output, rounded to 5. Fixed at 25〜35分 for every batch until the Aug 23 audit —
 *  wrong by 2x on B9's 30. Kept identical here so the two texts cannot drift. */
function durationText_(n) {
  return Math.floor(n * 1.7 / 5) * 5 + '〜' + Math.ceil(n * 2.3 / 5) * 5 + '分';
}

function buildDescription_(batch, n) {
  return '' +
    'ツール（文法チェッカー）が出した指摘が、確認済みの解答キーとどれくらい合っているかを' +
    '見ていただくフォームです。\n\n' +

    '⚠️ いちばん大事なこと：日本語を直していただく必要はありません。\n' +
    'このフォームに出てくる文は、どれも「直すため」ではなく「見比べるため」に置いてあります。\n\n' +

    '【各ページの3つのブロック】\n' +
    '① 学習者が書いた文 … 間違いを含む文です。直さなくて大丈夫です。\n' +
    '② 正解 … ネイティブが確認済みの正解です。判断の基準にしてください。直さなくて大丈夫です。\n' +
    '③ ツールの答え … ツールが出した指摘です。★評価していただくのは、この③だけです。\n\n' +

    'やっていただくのは「③は②と同じことを言えているか？」の判断だけです。\n\n' +

    '【評価の選び方】（すべて ② と ③ を見比べての判断です）\n' +
    '・一致 ＝ ②にある間違いを、③も同じように指摘できている\n' +
    '・部分一致 ＝ ③も間違いには気づいているが、種類・箇所・説明のどれかがずれている\n' +
    '・見逃し ＝ ②にある間違いを、③が指摘していない\n' +
    '・誤指摘 ＝ ②では正しいとされている部分を、③が「間違い」だと言っている' +
    '（いちばん重要なチェック項目です）\n\n' +

    '※ 「③の指摘は合っているけれど、③が出した直し方が不自然だ」と感じることがあります。' +
    'その場合、評価は上の4つから選んでいただいたうえで、コメント欄に「直し方が不自然」と' +
    '書いてください。評価とコメントで別々に受け取れますので、迷わなくて大丈夫です。\n\n' +

    '【③が使うラベルの意味】\n' +
    '・FIX ＝ 文法的な誤り（要修正）\n' +
    '・UNNATURAL ＝ 文法的には正しいが不自然\n' +
    '・WORTH KNOWING ＝ 誤りではないが役立つ指摘（例：かな書き→漢字）\n' +
    '・NONE ＝ 指摘なし（正しく自然な文）\n\n' +

    'この' + batch + 'バッチには' + n + '件の出力があります。所要時間は' + durationText_(n) + 'ほどです。' +
    '途中保存はできないので、時間のあるときに1回で最後までお願いします。\n\n' +

    '同じ文が複数回出てきます。これは意図的なものです（同じ文を複数の設定で処理しているため）。' +
    'どの出力がどの設定によるものかは伏せてあります。' +
    '前の判断に合わせようとせず、1件ずつ独立して評価してください。\n\n' +

    'レベル（N5〜N2）と「出題の想定」は出題側の情報で、評価の対象ではありません。';
}

/** Item types that own a column in the response sheet. None of these are touched. */
function collectsResponse_(type) {
  return type === FormApp.ItemType.TEXT ||
         type === FormApp.ItemType.PARAGRAPH_TEXT ||
         type === FormApp.ItemType.MULTIPLE_CHOICE ||
         type === FormApp.ItemType.CHECKBOX ||
         type === FormApp.ItemType.LIST ||
         type === FormApp.ItemType.SCALE ||
         type === FormApp.ItemType.GRID ||
         type === FormApp.ItemType.CHECKBOX_GRID ||
         type === FormApp.ItemType.DATE ||
         type === FormApp.ItemType.DATETIME ||
         type === FormApp.ItemType.TIME ||
         type === FormApp.ItemType.DURATION;
}

/** The response schema, as a single comparable string. Must be identical after.
 *  Choice values are included: altering them would not orphan a column, but it
 *  would change what B1's already-submitted answers mean. */
function schemaFingerprint_(form) {
  var out = [];
  form.getItems().forEach(function (item) {
    if (!collectsResponse_(item.getType())) return;
    var sig = item.getType() + '::' + item.getTitle();
    if (item.getType() === FormApp.ItemType.MULTIPLE_CHOICE) {
      item.asMultipleChoiceItem().getChoices().forEach(function (c) {
        sig += '|' + c.getValue();
      });
    }
    out.push(sig);
  });
  return out.join('');
}

function countOf_(s, needle) {
  if (!s) return 0;
  return s.split(needle).length - 1;
}

function patchAllGradingFormsV2() {
  var totalLabels = 0, totalComments = 0, problems = [];

  FORMS.forEach(function (f) {
    var form;
    try {
      form = FormApp.openById(f.id);
    } catch (e) {
      problems.push(f.batch + ': cannot open — ' + e.message);
      Logger.log(f.batch + '  ERROR opening: ' + e.message);
      return;
    }

    // Guard from the v1/v2 mix-up: a trashed form opens, accepts edits and reports
    // success. Refuse rather than patch a copy nobody is looking at.
    if (DriveApp.getFileById(f.id).isTrashed()) {
      problems.push(f.batch + ': form is IN THE TRASH — refusing to patch it.');
      Logger.log(f.batch + '  SKIPPED — in trash.');
      return;
    }
    if (!form.isAcceptingResponses()) {
      problems.push(f.batch + ': not accepting responses — refusing.');
      Logger.log(f.batch + '  SKIPPED — not accepting responses.');
      return;
    }

    var before = schemaFingerprint_(form);
    var labelHits = 0, commentHits = 0, stray = [];

    // 1. Description, replaced wholesale. It owns no column.
    form.setDescription(buildDescription_(f.batch, f.n));

    // 2. + 3. Everything else is helpText only.
    form.getItems().forEach(function (item) {
      var type = item.getType();

      if (type === FormApp.ItemType.SECTION_HEADER) {
        var sh = item.asSectionHeaderItem();
        var help = sh.getHelpText() || '';
        var changed = false;
        LABELS.forEach(function (L) {
          var n = countOf_(help, L.from);
          if (n) { help = help.split(L.from).join(L.to); labelHits += n; changed = true; }
        });
        if (changed) sh.setHelpText(help);
        // A section-header TITLE is the sentence; it should never carry a block label.
        LABELS.forEach(function (L) {
          if (countOf_(sh.getTitle(), L.from)) {
            stray.push('section TITLE carries ' + L.from + ': ' + sh.getTitle());
          }
        });

      } else if (type === FormApp.ItemType.PARAGRAPH_TEXT) {
        // The comment box. Only its helpText is touched — the TITLE names the
        // response column and is left exactly as it is.
        var pt = item.asParagraphTextItem();
        var n = countOf_(pt.getHelpText(), COMMENT_HELP_FROM);
        if (n) { pt.setHelpText(COMMENT_HELP_TO); commentHits += n; }
      }
    });

    var after = schemaFingerprint_(form);
    if (before !== after) {
      problems.push(f.batch + ': RESPONSE SCHEMA CHANGED — investigate immediately.');
      Logger.log(f.batch + '  !! schema changed !!');
      return;
    }
    if (stray.length) {
      problems.push(f.batch + ': ' + stray.join(' | '));
    }

    var wantLabels = f.n * LABELS.length, wantComments = f.n;
    var labelOK   = (labelHits === wantLabels)   || labelHits === 0;
    var commentOK = (commentHits === wantComments) || commentHits === 0;
    if (labelHits !== wantLabels && labelHits !== 0) {
      problems.push(f.batch + ': expected ' + wantLabels + ' label replacements, made ' + labelHits);
    }
    if (commentHits !== wantComments && commentHits !== 0) {
      problems.push(f.batch + ': expected ' + wantComments + ' comment-help replacements, made ' + commentHits);
    }

    totalLabels += labelHits; totalComments += commentHits;
    Logger.log(f.batch + '  labels ' + labelHits + '/' + wantLabels +
               '   comments ' + commentHits + '/' + wantComments +
               '   ' + (labelHits === 0 && commentHits === 0 ? 'already patched'
                        : (labelOK && commentOK ? 'OK' : 'MISMATCH')) +
               '   LIVE: ' + form.getPublishedUrl());
  });

  Logger.log('');
  Logger.log('--- TOTAL: ' + totalLabels + ' label + ' + totalComments + ' comment replacement(s).');
  Logger.log('    First run expects 450 labels (3 x 150) and 150 comments. A re-run expects 0 and 0.');
  if (problems.length) {
    Logger.log('!!! ' + problems.length + ' PROBLEM(S) — the run is NOT clean:');
    problems.forEach(function (p) { Logger.log('    ' + p); });
  } else {
    Logger.log('No problems. Response schemas unchanged on all nine forms.');
  }
  Logger.log('');
  Logger.log('Now run verifyClarityPatch() — separately — and confirm OK on all nine.');
}

/**
 * Independent read-back. Deliberately NOT part of the patch run: this project's
 * repeated failure is trusting a script's own success log, so this re-opens every
 * form from scratch and counts what is actually there.
 *
 * Note for whoever confirms this from outside Apps Script: web_fetch CACHES PER URL
 * for hours, so a live-form fetch will happily show you the pre-patch text. Append
 * a junk query param (…/viewform?cb=whatever) or corroborate with Drive
 * modifiedTime, which does move for a script edit. (It does NOT move for a form
 * RESPONSE — found Aug 24 2026 — so it is the right channel here and the wrong one
 * for checking whether a reviewer has submitted.)
 */
function verifyClarityPatch() {
  var bad = 0;
  FORMS.forEach(function (f) {
    var form = FormApp.openById(f.id);
    var oldLeft = 0, newFound = 0, oldComment = 0, newComment = 0;

    var desc = form.getDescription() || '';
    var descOK = desc.indexOf('日本語を直していただく必要はありません') !== -1 &&
                 desc.indexOf('③は②と同じことを言えているか') !== -1 &&
                 desc.indexOf('この' + f.batch + 'バッチには' + f.n + '件') !== -1;

    form.getItems().forEach(function (item) {
      var type = item.getType();
      if (type === FormApp.ItemType.SECTION_HEADER) {
        var help = item.asSectionHeaderItem().getHelpText() || '';
        LABELS.forEach(function (L) {
          oldLeft  += countOf_(help, L.from);
          newFound += countOf_(help, L.to);
        });
      } else if (type === FormApp.ItemType.PARAGRAPH_TEXT) {
        var h = item.asParagraphTextItem().getHelpText() || '';
        oldComment += countOf_(h, COMMENT_HELP_FROM);
        newComment += countOf_(h, COMMENT_HELP_TO);
      }
    });

    // ① and ② survive as substrings of their own replacements, so counting the old
    // label naively would never reach 0. countOf_ uses the FULL old string including
    // its 】, which the new strings do not contain — verified by these expectations.
    var want = f.n * LABELS.length;
    var ok = descOK && oldLeft === 0 && newFound === want &&
             oldComment === 0 && newComment === f.n;
    if (!ok) bad++;
    Logger.log(f.batch +
      '  desc ' + (descOK ? 'ok' : 'STALE') +
      '   old-labels ' + oldLeft + ' (want 0)' +
      '   new-labels ' + newFound + '/' + want +
      '   comment-help ' + newComment + '/' + f.n +
      (ok ? '   ✓' : '   ← CHECK THIS'));
  });
  Logger.log('');
  Logger.log(bad === 0
    ? 'VERIFIED — all nine forms carry the v2 clarity text and none carries the old text.'
    : '!!! ' + bad + ' form(s) not fully patched.');
}
