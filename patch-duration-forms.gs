/**
 * patch-duration-forms.gs — fix 所要時間 in the nine LIVE blind-grading forms.
 *
 * WHY. Every form's description said 「所要時間は25〜35分ほどです」 regardless of
 * size — right for the 15-output batches, generous for B5's 12, and wrong by
 * about 2× for B9's 30, on a form that also says 途中保存はできない. Found by the
 * Session 18.5 review, confirmed still live by the 2026-08-23 audit, approved
 * by Lloyd the same day. build-grading-forms.py now computes the number from
 * rows.length (same formula as below), so freshly generated forms are right;
 * this patch brings the nine ALREADY-LIVE forms up to match.
 *
 * WHAT IT TOUCHES. form.setDescription() only. A description owns no response
 * column; nothing here adds, deletes, renames or retypes an item, so the
 * response schema cannot change and no column can be orphaned (the B8 trap).
 * Safe to run after batches have responses. Idempotent: a form already showing
 * the computed value is skipped and logged as such.
 *
 * THE NUMBER TRAVELS WITH THE ARTIFACT. The output count is read from each
 * form's own items (titles ending 「・ 評価」), never from a constant in this
 * file — the BG_LAST lesson. Expected results: B1–B4, B6, B7 (15) stay 25〜35;
 * B5 (12) → 20〜30; B8 (18) → 30〜45; B9 (30) → 50〜70.
 *
 * RUN: paste into script.google.com (zensoreno account — Step 3 forms are owned
 * there, unlike Step 2), run patchDurationAllForms, read the log, then open one
 * changed form with a cache-buster (…/viewform?cb=1) to confirm — web_fetch and
 * browsers both cache form pages.
 */

var FORMS = [
  { batch: 'B1', id: '1237INUWWjKEpG5C8fodflhYd7uTVNRpE84e-9A3qh9Y' },
  { batch: 'B2', id: '1BYSGds5PniJo5Fzmf8Zhhh56n5RpVwOTLR-UkMAlBAs' },
  { batch: 'B3', id: '1exE4heUB_Mw_ZP0u4ooTD7KbZ_TzpTE6inWDqgLaNOA' },
  { batch: 'B4', id: '1qi06fey2xumrSnY9hKIAwgtsNshbNj8cLx1_jLaKJSU' },
  { batch: 'B5', id: '1R95S-sXQ2T1lIA1rZI6LmCKpCAQ2EIIDhqJmMeJ5A4Y' },
  { batch: 'B6', id: '1Q0FoVPPH8J-lr9yCRCqlzCQJ1bqrEyc12F0Q2znY464' },
  { batch: 'B7', id: '1wkgudE6d0RjPYzD3xCoDtzSEXd82cg7oUcyTwt4Y72g' },
  { batch: 'B8', id: '15wLjmsMsepk83VeeeRgChlWX3h8BmLI6x2slVIK5uQw' },
  { batch: 'B9', id: '19f6hLcU0cFA3Qw84853ZU-JLFrxW2lMwN8lZvFPoy30' }
];

var DURATION_RE = /所要時間は\d+〜\d+分ほどです。/;

function expectedString_(n) {
  var lo = Math.floor(n * 1.7 / 5) * 5;
  var hi = Math.ceil(n * 2.3 / 5) * 5;
  return '所要時間は' + lo + '〜' + hi + '分ほどです。';
}

function outputCount_(form) {
  var n = 0;
  form.getItems().forEach(function (item) {
    if (/・ 評価$/.test(item.getTitle())) n++;
  });
  return n;
}

/** Every item's type+title — stronger than needed for a description-only patch,
 *  kept so a surprise can only surface as a hard abort. */
function fingerprint_(form) {
  return form.getItems().map(function (i) {
    return i.getType() + '|' + i.getTitle();
  }).join('\n');
}

function patchDurationAllForms() {
  var changed = 0, skipped = 0, problems = [];

  FORMS.forEach(function (f) {
    if (DriveApp.getFileById(f.id).isTrashed()) {
      problems.push(f.batch + ': form is TRASHED — refusing (the v1/v2 trap). Nothing written.');
      return;
    }
    var form = FormApp.openById(f.id);
    var n = outputCount_(form);
    if (n === 0) {
      problems.push(f.batch + ': counted 0 「・ 評価」 items — wrong form or changed titles. Nothing written.');
      return;
    }
    var want = expectedString_(n);
    var desc = form.getDescription();
    var m = desc.match(DURATION_RE);
    if (!m) {
      problems.push(f.batch + ': no 所要時間 sentence found in the description. Nothing written.');
      return;
    }
    if (m[0] === want) {
      Logger.log(f.batch + ' (' + n + ' outputs): already ' + want + ' — skipped.');
      skipped++;
      return;
    }
    var before = fingerprint_(form);
    form.setDescription(desc.replace(DURATION_RE, want));
    var after = fingerprint_(form);
    if (before !== after) {
      problems.push(f.batch + ': ITEM FINGERPRINT CHANGED after a description-only write — investigate before touching anything else.');
      return;
    }
    // Read the artifact back, not the variable we just wrote.
    var reread = FormApp.openById(f.id).getDescription().match(DURATION_RE);
    if (!reread || reread[0] !== want) {
      problems.push(f.batch + ': re-read shows ' + (reread ? reread[0] : 'nothing') + ' not ' + want);
      return;
    }
    Logger.log(f.batch + ' (' + n + ' outputs): ' + m[0] + ' → ' + want + ' ✓');
    changed++;
  });

  Logger.log('----');
  if (problems.length) {
    Logger.log('PROBLEMS (' + problems.length + ') — the run is NOT clean:');
    problems.forEach(function (p) { Logger.log('  ' + p); });
  } else {
    Logger.log('Clean: ' + changed + ' patched, ' + skipped + ' already correct, of ' + FORMS.length + ' forms.');
  }
}
