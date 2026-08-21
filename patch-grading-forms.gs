/**
 * Naoshi Step-3 blind grading — IN-PLACE name-tag patch. Aug 21 2026.
 *
 * WHAT IT DOES
 *   Rewrites the provenance tag in the amended-key block of all nine live grading
 *   forms. 45 occurrences: B1:6 B2:3 B3:6 B4:3 B5:3 B6:6 B7:6 B8:6 B9:6.
 *   Set RENAME_FROM / RENAME_TO below; everything else is fixed.
 *
 * WHY THE TAG EXISTS AT ALL
 *   The Step 2 key-check form's name field is free text, and the reviewer typed
 *   「テスト」 into it. import-key-check-responses.py wrote that through to Eval Set
 *   column L, and build-grading-forms.py splices column L into the grading forms —
 *   so a grader with no context read 「補足: 〔テスト〕」 as a leftover test artefact
 *   and would have discounted a real amendment. Run 1 fixed that. Run 2 replaces
 *   the name with a role, because the grader turned out to be a different person.
 *
 * WHY A PATCH AND NOT A REBUILD
 *   Rebuilding these forms would produce new URLs (already recorded in Notion) and
 *   leave nine trashed forms behind — and a trashed form still opens, still accepts
 *   edits, and still reports success. That is the v1/v2 trap that cost this project
 *   two sessions. Patching keeps every URL.
 *
 * WHY IT CANNOT ORPHAN RESPONSE COLUMNS
 *   The key block lives in the helpText of a SectionHeaderItem, which collects no
 *   response and owns no column. This script touches NOTHING ELSE — see the guards.
 *   patch-b7-b8-forms.gs orphaned columns because it DELETED AND RE-ADDED questions.
 *   Nothing here deletes, adds, or renames an item.
 *
 * HOW TO RUN
 *   Paste into the SAME Apps Script project as build-grading-forms.gs (or a new one
 *   — it needs no Script Properties), signed in as zensoreno@gmail.com, which owns
 *   these forms. Run patchAllGradingForms. Takes well under a minute.
 *   Re-running is a no-op: the second pass finds 0 and says so.
 *
 * IT FAILS LOUDLY RATHER THAN PARTIALLY
 *   Every form has an expected hit count below. A form that yields a different
 *   number is reported as MISMATCH and the run ends non-clean, because "it edited
 *   something" is not the same as "it edited the right things" — this project has
 *   twice been handed a truthful success log for a broken artifact.
 */

// ── RUN 2, Aug 21 2026 ───────────────────────────────────────────────────────
// Run 1 was 〔テスト〕 → 〔ともこ〕, 45/45 clean. Then a fact arrived that changed
// the answer: **the Step 3 grader is not the Step 2 reviewer.** A real name only
// helped while the grader was the person being credited. To a stranger, 「補足:
// 〔ともこ〕」 on 30 items names someone they cannot place — and putting Tomoko's
// name in front of a third party is a decision, not a default.
//
// So the form now carries a ROLE. Eval Set column L keeps her real name, because
// that column is the provenance record; build-grading-forms.py redacts the tag at
// render time instead. Record and artifact want different things here.
//
// Set these two and re-run. Counts and guards are unchanged — same 45 items.
var RENAME_FROM = '〔ともこ〕';
var RENAME_TO   = '〔別のネイティブレビュアー〕';

// EDIT ids, copied from the 🔗 Links page — the LIVE table, not reconstructed.
// Expected = occurrences of RENAME_FROM in that form, counted in the generated .gs.
var FORMS = [
  { batch: 'B1', id: '1237INUWWjKEpG5C8fodflhYd7uTVNRpE84e-9A3qh9Y', expected: 6 },
  { batch: 'B2', id: '1BYSGds5PniJo5Fzmf8Zhhh56n5RpVwOTLR-UkMAlBAs', expected: 3 },
  { batch: 'B3', id: '1exE4heUB_Mw_ZP0u4ooTD7KbZ_TzpTE6inWDqgLaNOA', expected: 6 },
  { batch: 'B4', id: '1qi06fey2xumrSnY9hKIAwgtsNshbNj8cLx1_jLaKJSU', expected: 3 },
  { batch: 'B5', id: '1R95S-sXQ2T1lIA1rZI6LmCKpCAQ2EIIDhqJmMeJ5A4Y', expected: 3 },
  { batch: 'B6', id: '1Q0FoVPPH8J-lr9yCRCqlzCQJ1bqrEyc12F0Q2znY464', expected: 6 },
  { batch: 'B7', id: '1wkgudE6d0RjPYzD3xCoDtzSEXd82cg7oUcyTwt4Y72g', expected: 6 },
  { batch: 'B8', id: '15wLjmsMsepk83VeeeRgChlWX3h8BmLI6x2slVIK5uQw', expected: 6 },
  { batch: 'B9', id: '19f6hLcU0cFA3Qw84853ZU-JLFrxW2lMwN8lZvFPoy30', expected: 6 }
];

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

/** The response schema, as a single comparable string. Must be identical after. */
function schemaFingerprint_(form) {
  var out = [];
  form.getItems().forEach(function (item) {
    if (collectsResponse_(item.getType())) out.push(item.getTitle());
  });
  return out.join('');
}

function countIn_(s) {
  if (!s) return 0;
  return s.split(RENAME_FROM).length - 1;
}

function patchAllGradingForms() {
  var totalHits = 0, problems = [];

  FORMS.forEach(function (f) {
    var form;
    try {
      form = FormApp.openById(f.id);
    } catch (e) {
      problems.push(f.batch + ': cannot open — ' + e.message);
      Logger.log(f.batch + '  ERROR opening: ' + e.message);
      return;
    }

    // Guard, learned from the v1/v2 mix-up: a trashed form opens, accepts edits and
    // reports success. Refuse rather than patch a copy nobody is looking at.
    if (DriveApp.getFileById(f.id).isTrashed()) {
      problems.push(f.batch + ': form is IN THE TRASH — refusing to patch it.');
      Logger.log(f.batch + '  SKIPPED — in trash.');
      return;
    }
    if (!form.isAcceptingResponses()) {
      problems.push(f.batch + ': form is not accepting responses — refusing.');
      Logger.log(f.batch + '  SKIPPED — not accepting responses.');
      return;
    }

    var before = schemaFingerprint_(form);
    var hits = 0, stray = [];

    // The form description is safe to edit (it owns no column).
    if (countIn_(form.getDescription())) {
      hits += countIn_(form.getDescription());
      form.setDescription(form.getDescription().split(RENAME_FROM).join(RENAME_TO));
    }

    form.getItems().forEach(function (item) {
      var type = item.getType();
      if (type === FormApp.ItemType.SECTION_HEADER) {
        var sh = item.asSectionHeaderItem();
        var n = countIn_(sh.getHelpText());
        if (n) {
          sh.setHelpText(sh.getHelpText().split(RENAME_FROM).join(RENAME_TO));
          hits += n;
        }
        // A section-header TITLE is the sentence; it should never carry the tag.
        if (countIn_(sh.getTitle())) stray.push('section title: ' + sh.getTitle());
      } else {
        // Anywhere else, the tag is NOT patched: renaming a question title renames
        // its response column, which is exactly how patch-b7-b8-forms.gs orphaned
        // 16 columns on B8. Report it and let a human decide.
        var t = countIn_(item.getTitle());
        if (t) stray.push('ITEM TITLE (would orphan a column): ' + item.getTitle());
      }
    });

    var after = schemaFingerprint_(form);
    if (before !== after) {
      problems.push(f.batch + ': RESPONSE SCHEMA CHANGED — investigate immediately.');
      Logger.log(f.batch + '  !! schema changed !!');
      return;
    }

    if (stray.length) {
      problems.push(f.batch + ': ' + stray.length +
                    ' occurrence(s) outside section help text, left untouched: ' +
                    stray.join(' | '));
    }

    totalHits += hits;
    var verdict = (hits === f.expected) ? 'OK'
                : (hits === 0 ? 'already patched (0 found)' : 'MISMATCH');
    if (verdict === 'MISMATCH') {
      problems.push(f.batch + ': expected ' + f.expected + ' replacements, made ' + hits);
    }
    Logger.log(f.batch + '  ' + hits + '/' + f.expected + '  ' + verdict +
               '   LIVE: ' + form.getPublishedUrl());
  });

  Logger.log('');
  Logger.log('--- TOTAL: ' + totalHits + ' replacement(s); expected 45 on a first run, 0 on a re-run.');
  if (problems.length) {
    Logger.log('!!! ' + problems.length + ' PROBLEM(S) — the run is NOT clean:');
    problems.forEach(function (p) { Logger.log('    ' + p); });
  } else {
    Logger.log('No problems. Response schemas unchanged on all nine forms.');
  }
  Logger.log('');
  Logger.log('Now run verifyNoTestTag() and confirm it reports 0 everywhere.');
}

/**
 * Independent read-back. Deliberately NOT part of the patch run: this project's
 * repeated failure is trusting a script's own success log, so the check re-opens
 * every form from scratch and counts what is actually there.
 */
function verifyNoTestTag() {
  var remaining = 0;
  FORMS.forEach(function (f) {
    var form = FormApp.openById(f.id);
    var found = countIn_(form.getDescription()), newTag = 0;
    newTag += (form.getDescription() || '').split(RENAME_TO).length - 1;
    form.getItems().forEach(function (item) {
      found += countIn_(item.getTitle());
      if (item.getType() === FormApp.ItemType.SECTION_HEADER) {
        var sh = item.asSectionHeaderItem();
        found += countIn_(sh.getHelpText());
        newTag += (sh.getHelpText() || '').split(RENAME_TO).length - 1;
      }
    });
    remaining += found;
    Logger.log(f.batch + '  old-tag remaining: ' + found +
               '   new-tag present: ' + newTag + ' (expected ' + f.expected + ')' +
               (found === 0 && newTag === f.expected ? '   ✓' : '   ← CHECK THIS'));
  });
  Logger.log('');
  Logger.log(remaining === 0
    ? 'VERIFIED — 〔テスト〕 appears nowhere in any of the nine forms.'
    : '!!! ' + remaining + ' occurrence(s) of 〔テスト〕 still live.');
}
