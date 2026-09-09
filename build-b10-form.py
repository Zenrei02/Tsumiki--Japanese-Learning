# -*- coding: utf-8 -*-
"""
Generates build-b10-form.gs — ONE Google Form asking a question nobody has asked
Keiko yet.

THE QUESTION. B1–B9 asked whether the tool's DIAGNOSIS matched the verified key:
一致 / 部分一致 / 見逃し / 誤指摘. That vocabulary cannot express the fault this
batch is about. On thirteen naoshi-4 rows the tool told the learner the sentence
was fine — verdict NONE or WORTH KNOWING — and then handed back a DIFFERENT
sentence. O077 says "Natural and grammatically sound" and silently repairs
分かりない → 分からない. O043 says the same and turns えり, a person's NAME, into
襟. The learner is told they were right and is quietly corrected, so they never
learn they erred — which defeats the pattern_name premise the product rests on.

Whether that is acceptable is not a 一致/部分一致 judgement. It is a judgement
about the EXPLANATION, and it needs its own question.

WHAT IT READS
  naoshi-eval-v1-with-outputs.xlsx — the naoshi-4 outputs and Keiko's grades.
      ⚠ MUST be the naoshi-4 workbook. Restore it from
      backups/naoshi-eval-v1-with-outputs.08-naoshi-4-final.xlsx if it is not;
      the harness will not rebuild it from bakeoff-log.jsonl. This script
      verifies the schema against the log and refuses otherwise.

ROW SELECTION, and why each group is here
  SILENT RESCUE (13) — every row on any model, not just the product model. They
      are cheap, and the question is about the explanation rather than the model.
  KEY-EXACT 部分一致 (4) — rows whose rewrite matches the verified key CHARACTER
      FOR CHARACTER and that Keiko still graded 部分一致. No reference-pair
      instrument can reach these; only she can say whether the grade stands.
      Session 22.1 named three (O009, O098, O120); this script finds a fourth,
      O088. Two of the four sit on a key Tomoko AMENDED, and those two are
      labelled as such on the form — asking her to re-affirm a grade against a
      reference that had already moved would be asking the wrong question.
  CONTROLS — ordinary graded rows where the tool did NOT silently change the
      sentence, shuffled in so the rescued rows cannot be found by position.

ORDERING
  Rows are shuffled with a CONSTRAINT fixed before the output was looked at: no
  more than three consecutive rows of the same role. Rescued rows are 13 of 24,
  so an unconstrained draw regularly clusters them — seed 31 produced a run of
  six — and a run that long is a pattern a reader notices without trying. The
  seed advances until the constraint holds, so the order is reproducible without
  being a draw someone picked because they liked it.

BLINDING
  Model codes are never read into DATA and the emitted file is asserted free of
  M1/M2/M3 before it is saved — the same rule as build-grading-forms.py. The
  VERDICT TIER IS ALSO WITHHELD, which is new: the whole question is whether the
  explanation reads as acceptable ON ITS OWN, and printing "判定: NONE" beside it
  answers that question for her.

  The per-issue [FIX]/[NOTE] tags INSIDE the explanation are kept. They are part
  of the text the learner saw and Keiko has read them for nine batches; stripping
  them would show her something the product does not produce.

  The explanations are in ENGLISH because that is what the product outputs to an
  English-speaking learner. Everything this script writes AROUND them is Japanese.

B1–B9 ARE NOT TOUCHED. Different script, different form, different response
sheet, its own Script Properties keys.

USAGE
  python3 build-b10-form.py            # writes build-b10-form.gs + prints the manifest
"""
import importlib.util
import json
import random
import sys
from pathlib import Path

import openpyxl

HERE = Path(__file__).resolve().parent
WB = HERE / "naoshi-eval-v1-with-outputs.xlsx"
GS_OUT = HERE / "build-b10-form.gs"
LOG = HERE / "bakeoff-log.jsonl"

TARGET_TOTAL = 24          # 17 rows of interest + 7 controls; brief asks 20–25
SEED = 31                  # the session number, so the order is reproducible

BG_FIRST = 5
B_OID, B_EID, B_MODEL, B_SENT, B_TIER, B_FEEDBACK, B_GRADE, B_COMMENT = range(1, 9)
E_ID, E_SENT, E_STATUS, E_KEY, E_KEYOK = 1, 4, 5, 8, 10
KEY_AMENDED = ("一部修正", "要修正")


def die(msg):
    sys.exit(f"STOP: {msg}")


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, str(path))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


cq = load("_cq", HERE / "check-rewrite-quality.py")
ab = load("_ab", HERE / "analyse-bakeoff-log.py")


def js(s):
    """A JavaScript single-quoted string literal."""
    return ("'" + str(s).replace("\\", "\\\\").replace("'", "\\'")
            .replace("\n", "\\n").replace("\r", "") + "'")


def main():
    if not WB.exists():
        die(f"{WB} is missing.")
    wb = openpyxl.load_workbook(WB, data_only=True)
    for need in ("Blind Grading", "Eval Set"):
        if need not in wb.sheetnames:
            die(f"{WB} has no {need!r} sheet.")
    bg, es = wb["Blind Grading"], wb["Eval Set"]

    # ── the schema guard, before a single row is read ────────────────────────
    # A form built from naoshi-6 text and naoshi-4 grades would look completely
    # normal and would ask Keiko about sentences she never graded.
    schema, matched, total = cq.detect_scored_schema(bg, LOG)
    if schema != cq.GRADED_SCHEMA:
        die(f"the feedback in {WB.name} is {schema!r}, not {cq.GRADED_SCHEMA}. "
            f"({matched}/{total} cells matched.) Restore "
            f"backups/naoshi-eval-v1-with-outputs.08-naoshi-4-final.xlsx first — "
            "the harness will not rebuild it from the log.")
    print(f"schema OK: {matched}/{total} cells match {schema} log rows.")

    evalset = {}
    for r in range(1, es.max_row + 1):
        v = es.cell(row=r, column=E_ID).value
        if not (isinstance(v, str) and cq.EID_RE.match(v.strip())):
            continue
        key = cq.norm(es.cell(row=r, column=E_KEY).value)
        keyok = (es.cell(row=r, column=E_KEYOK).value or "").strip()
        evalset[v.strip()] = {
            "sent": cq.norm(es.cell(row=r, column=E_SENT).value),
            "sent_raw": str(es.cell(row=r, column=E_SENT).value or "").strip(),
            "status": (es.cell(row=r, column=E_STATUS).value or "").strip(),
            "key": "" if key == cq.NO_CORRECTION else key,
            # ⚠ RAW, for anything the reviewer READS. cq.norm() is NFKC, which
            # turns the learner's （笑） into (笑) — a form she never saw. The
            # normalised values stay for the comparisons; the display uses these.
            "key_raw": ("" if key == cq.NO_CORRECTION
                        else str(es.cell(row=r, column=E_KEY).value or "").strip()),
            "keyok": keyok,
            "amended": keyok in KEY_AMENDED,
        }
    if not evalset:
        die("no eval rows read.")

    rows = []
    for r in range(BG_FIRST, bg.max_row + 1):
        oid = str(bg.cell(row=r, column=B_OID).value or "").strip()
        if not cq.OID_RE.match(oid):
            continue
        eid = str(bg.cell(row=r, column=B_EID).value or "").strip()
        ev = evalset.get(eid)
        if ev is None:
            die(f"{oid} points at {eid!r}, which is not in the Eval Set.")
        fb = bg.cell(row=r, column=B_FEEDBACK).value
        rewrite = cq.parse_rewrite(fb)
        rewrite_raw = cq.parse_rewrite_raw(fb)
        tier = str(bg.cell(row=r, column=B_TIER).value or "").strip()
        grade = str(bg.cell(row=r, column=B_GRADE).value or "").strip()

        edits = cq.target_edits(ev["sent"], ev["key"]) if ev["key"] else []
        mask = cq.preserved_mask(ev["sent"], rewrite) if rewrite else []
        applied = 0
        for i1, i2, s_span, k_span in edits:
            v, _kept = cq.classify_edit(i1, i2, s_span, k_span, rewrite, mask)
            applied += (v == "APPLIED")
        rescue = ab.silent_rescue(tier, ev["sent_raw"], rewrite_raw, applied > 0)

        # the explanation as the learner saw it, minus the Rewrite: line, which
        # is shown as its own block
        expl = "\n".join(l for l in str(fb or "").splitlines()
                         if not l.strip().startswith("Rewrite:")).strip()

        rows.append({
            "oid": oid, "eid": eid, "model": str(bg.cell(row=r, column=B_MODEL).value
                                                 or "").strip(),
            "tier": tier, "grade": grade, "sent": ev["sent"], "key": ev["key"],
            "amended": ev["amended"], "keyok": ev["keyok"],
            "sent_raw": ev["sent_raw"], "key_raw": ev["key_raw"],
            "expl": expl, "rewrite": rewrite, "rewrite_raw": rewrite_raw,
            "rescue": rescue,
            "key_exact": bool(ev["key"]) and rewrite == ev["key"],
        })
    if len(rows) != 150:
        die(f"expected 150 output rows, read {len(rows)}.")
    if any(not r["grade"] for r in rows):
        die("some rows are UNGRADED — this batch re-presents graded rows only.")

    rescues = [r for r in rows if r["rescue"]]
    keyexact = [r for r in rows if r["key_exact"] and r["grade"] == "部分一致"]
    chosen = {r["oid"]: r for r in rescues}
    for r in keyexact:
        chosen.setdefault(r["oid"], r)

    # Controls: rows the tool did NOT silently change, spread across models and
    # grades so the batch does not read as "all the odd ones".
    pool = [r for r in rows if r["oid"] not in chosen]
    rng = random.Random(SEED)
    by_model = {}
    for r in sorted(pool, key=lambda r: r["oid"]):
        by_model.setdefault(r["model"], []).append(r)
    for lst in by_model.values():
        rng.shuffle(lst)
    controls, i = [], 0
    want = TARGET_TOTAL - len(chosen)
    models = sorted(by_model)
    while len(controls) < want:
        m = models[i % len(models)]
        if by_model[m]:
            controls.append(by_model[m].pop())
        i += 1
        if i > 1000:
            die("could not fill the control quota.")
    for r in controls:
        chosen[r["oid"]] = r

    data = list(chosen.values())

    # ── the pre-shuffle, CONSTRAINED ────────────────────────────────────────
    # A plain shuffle is not enough here. Rescued rows are 13 of 24, so a random
    # draw regularly produces a long run of them — seed 31 gave six in a row —
    # and a run that long is a pattern a reader picks up without trying. So:
    # shuffle, and reject any order with more than MAX_RUN consecutive rows of
    # the same role, advancing the seed until one passes.
    #
    # This is a CONSTRAINT DECIDED IN ADVANCE, not a seed chosen by looking at
    # the output. The difference matters: the first is a property the order must
    # have, the second is picking the draw you liked.
    MAX_RUN = 3

    def role_of(r):
        return ('rescue' if r['rescue']
                else 'keyexact' if (r['key_exact'] and r['grade'] == '部分一致')
                else 'control')

    def longest_run(seq):
        best = run = 1
        for a, b in zip(seq, seq[1:]):
            run = run + 1 if role_of(a) == role_of(b) else 1
            best = max(best, run)
        return best

    for attempt in range(SEED, SEED + 500):
        random.Random(attempt).shuffle(data)
        if longest_run(data) <= MAX_RUN:
            shuffle_seed, run_len = attempt, longest_run(data)
            break
    else:
        die(f'no ordering within 500 seeds keeps runs at or under {MAX_RUN}.')
    print(f'order: seed {shuffle_seed}, longest same-role run {run_len} '
          f'(cap {MAX_RUN})')

    # ── manifest, for Lloyd only — this must NOT go to the reviewer ──────────
    print(f"\nB10: {len(data)} rows "
          f"({len(rescues)} silent rescue, {len(keyexact)} key-exact 部分一致, "
          f"{len(controls)} control)")
    print(f"{'#':>3} {'oid':<6}{'eid':<6}{'model':<6}{'role':<18}"
          f"{'tier':<15}{'graded':<10}key")
    for n, r in enumerate(data, 1):
        role = ("silent:" + r["rescue"].lower() if r["rescue"]
                else "key-exact" if r["key_exact"] and r["grade"] == "部分一致"
                else "control")
        print(f"{n:>3} {r['oid']:<6}{r['eid']:<6}{r['model']:<6}{role:<18}"
              f"{r['tier']:<15}{r['grade']:<10}"
              f"{'amended' if r['amended'] else 'clean'}")

    # ── emit ────────────────────────────────────────────────────────────────
    lines = []
    for r in data:
        show_key = r["key_exact"] and r["grade"] == "部分一致"
        lines.append(
            "  { oid: %s, sentence: %s, explanation: %s, rewrite: %s, "
            "showKey: %s, key: %s, keyAmended: %s }," % (
                js(r["oid"]), js(r["sent_raw"]), js(r["expl"] or "（指摘なし）"),
                js(r["rewrite_raw"] or "（提案なし）"),
                "true" if show_key else "false",
                js(r["key_raw"]) if show_key else "''",
                "true" if (show_key and r["amended"]) else "false"))

    gs = GS_TEMPLATE.replace("__DATA__", "\n".join(lines)) \
                    .replace("__N__", str(len(data))) \
                    .replace("__MINS_LO__", str(int(len(data) * 1.7 // 5 * 5))) \
                    .replace("__MINS_HI__", str(int(-(-len(data) * 2.3 // 5) * 5)))

    # The display text must be the raw text. If NFKC had crept back in, the
    # forms would differ from the learner's screen in a way nobody would notice.
    drift = [r["oid"] for r in data
             if r["sent_raw"] != r["sent"] and js(r["sent"]) in gs]
    if drift:
        die(f"normalised sentence text reached the form for {drift} — the "
            "reviewer must see the raw string.")

    for banned in ("M1", "M2", "M3"):
        if banned in gs:
            die(f"{banned} appears in the generated file — the batch would not be "
                "blind. Fix the generator; do not hand-edit the .gs.")
    GS_OUT.write_text(gs, encoding="utf-8")
    print(f"\nwrote {GS_OUT.name} ({len(gs)} chars) — blinding assertion passed.")
    print("NOTHING WAS SENT. Lloyd reads this and "
          "SESSION-31-message-to-reviewer-B10.md before anything goes to Keiko.")
    return 0


GS_TEMPLATE = r"""/**
 * Naoshi B10 — 「説明の適切さ」 one form, one response sheet.
 *
 * GENERATED FILE — do not hand-edit. Regenerate with:
 *     python3 build-b10-form.py
 *
 * THIS IS NOT A BLIND-GRADING BATCH. B1–B9 asked whether the tool's diagnosis
 * matched the key (一致/部分一致/見逃し/誤指摘). This asks something that
 * vocabulary cannot express: when the tool told the learner the sentence was
 * fine and then quietly changed it, was the EXPLANATION the learner saw
 * acceptable?
 *
 * ⚠️ THE VERDICT TIER IS DELIBERATELY NOT SHOWN. Printing 判定: NONE beside an
 * explanation answers the question being asked. The per-issue [FIX]/[NOTE] tags
 * inside the explanation text stay, because the learner sees those.
 *
 * ⚠️ B1–B9 ARE NOT TOUCHED. Separate form, separate response spreadsheet,
 * separate Script Properties keys (B10_*). Running this cannot alter them.
 *
 * ⚠️ RUN IT FROM THE ACCOUNT THAT OWNS THE OTHER FORMS. A form built while
 * signed into a different account is invisible to a Drive search from this one,
 * and re-running to "fix" that creates a SECOND live form. After running,
 * confirm the form appears in a Drive search before trusting the log.
 *
 * HOW TO RUN
 *   1. script.google.com → New project → paste this over Code.gs
 *   2. Run → buildB10   (authorise when prompted)
 *   3. Run → showB10Links, and PASTE THE LOG SOMEWHERE PERMANENT — the Apps
 *      Script console clears.
 *   4. Load the LIVE link from OUTSIDE the account before sending it. A
 *      Workspace account will sometimes restrict a new form to its own domain
 *      and silently block the reviewer.
 *
 * Re-running is safe: the form is remembered in Script Properties and a second
 * run SKIPS it rather than building a duplicate.
 */

var DATA = [
__DATA__
];

function buildB10() {
  var props = PropertiesService.getScriptProperties();
  var live = props.getProperty('B10_LIVE');
  if (live) { Logger.log('B10 already built — ' + live); return; }
  var partial = props.getProperty('B10_EDIT');
  if (partial) {
    throw new Error('B10 was left HALF-BUILT by an earlier run: the form exists (' +
      partial + ') but its questions were not finished. Open it, delete it in ' +
      'Drive, delete the B10_EDIT key in Project Settings → Script Properties, ' +
      'then run again. Building on top of it would leave two live forms.');
  }
  buildB10Form(b10ResponseSheet());
  showB10Links();
}

/** B10's OWN response spreadsheet — never the blind-grading one. */
function b10ResponseSheet() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('B10_RESPONSE_SS_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (e) {
      throw new Error('The stored B10 response spreadsheet (' + id + ') could not ' +
        'be opened — it may be trashed, or you may be signed in as a different ' +
        'account. Check Drive before re-running; building again would create a ' +
        'second live form.');
    }
  }
  var ss = SpreadsheetApp.create('Naoshi — 説明の適切さ B10 responses');
  props.setProperty('B10_RESPONSE_SS_ID', ss.getId());
  Logger.log('B10 RESPONSES created: ' + ss.getUrl());
  return ss;
}

function buildB10Form(ss) {
  var form = FormApp.create('Naoshi — 説明の適切さ B10 (__N__件)');
  PropertiesService.getScriptProperties().setProperty('B10_EDIT', form.getEditUrl());

  form.setDescription(
    'いつもありがとうございます。今回は これまでの9回とは しつもんが ちがいます。\n\n' +
    '⚠️ 日本語を直していただく必要はありません。今回も「見て、判断していただく」だけです。\n\n' +
    '【今回きいていること】\n' +
    'ツールが学習者に見せた「説明」が、学習者にとって適切かどうか、それだけです。\n' +
    '正解キーと合っているかどうか（一致・部分一致…）は、今回は聞いていません。\n\n' +
    '【各ページの内容】\n' +
    '① 学習者が書いた文 … 直さなくて大丈夫です。\n' +
    '② ツールの説明 … 学習者が実際に画面で見た文章です。英語です。\n' +
    '③ ツールが提案した文 … ツールが「こう書けます」と出した文です。\n\n' +
    '②が英語なのは、このツールが英語話者の学習者向けだからです。学習者が読むのは' +
    'この英文そのものですので、そのまま載せています。\n\n' +
    '【評価の選び方】\n' +
    '・適切 ＝ ②を読んだ学習者は、自分の文がどうだったか正しく理解できる\n' +
    '・一部適切 ＝ だいたい伝わるが、足りない・分かりにくいところがある\n' +
    '・不適切 ＝ 学習者が誤解する。または、必要なことが説明されていない\n' +
    '・判断できない ＝ 情報が足りず、決められない\n\n' +
    '※ ②と③を見比べて「説明していないことを、③で勝手に直している」と感じた場合は、' +
    'それは「不適切」または「一部適切」にあたります。コメント欄に一言いただけると助かります。\n\n' +
    '一部のページには【④ ネイティブ確認済みの正解】が付いています。' +
    'そのページだけ、追加の質問があります。\n\n' +
    'この B10 には __N__件 あります。所要時間は __MINS_LO__〜__MINS_HI__分ほどです。' +
    '途中保存はできないので、時間のあるときに1回で最後までお願いします。\n\n' +
    '同じ文が複数回出てくることがあります。これは意図的なものです。' +
    '前の判断に合わせようとせず、1件ずつ独立して評価してください。'
  );
  try { form.setCollectEmail(false); } catch (e) {}
  form.setLimitOneResponsePerUser(false);
  form.setProgressBar(true);
  form.setShuffleQuestions(false);
  form.setAllowResponseEdits(true);
  form.setConfirmationMessage('ありがとうございました！ B10 はこれで完了です。');

  form.addTextItem()
    .setTitle('お名前 / Your name')
    .setHelpText('記録のためだけに使います。')
    .setRequired(true);

  DATA.forEach(function (row, i) {
    if (i > 0) {
      form.addPageBreakItem().setTitle(row.oid + ' （' + (i + 1) + '/' + DATA.length + '）');
    }
    var body =
      '【① 学習者が書いた文】（直さなくて大丈夫です）\n' + row.sentence + '\n\n' +
      '【② ツールの説明】★これが適切かどうかを見てください\n' + row.explanation + '\n\n' +
      '【③ ツールが提案した文】\n' + row.rewrite;
    if (row.showKey) {
      body += '\n\n【④ ネイティブ確認済みの正解】\n' + row.key;
      if (row.keyAmended) {
        body += '\n（※ この正解は、キー確認のときに修正が入ったものです。' +
                'その点をふまえてご判断ください。）';
      }
    }
    form.addSectionHeaderItem()
      .setTitle(row.oid + ' ・ ' + row.sentence)
      .setHelpText(body);
    form.addMultipleChoiceItem()
      .setTitle(row.oid + ' ・ ツールの説明は学習者にとって適切ですか')
      .setChoiceValues(['適切', '一部適切', '不適切', '判断できない'])
      .setRequired(true);
    form.addParagraphTextItem()
      .setTitle(row.oid + ' ・ コメント')
      .setHelpText('「一部適切」「不適切」を選んだときは、どこが足りないか一言だけお願いします。' +
                   '日本語を直していただく必要はありません。')
      .setRequired(false);
    if (row.showKey) {
      form.addMultipleChoiceItem()
        .setTitle(row.oid + ' ・ ③は④とほぼ同じ文ですが、以前の「部分一致」という評価は' +
                  '今もそのままでよいですか')
        .setChoiceValues(['はい、部分一致のままでよい', 'いいえ、一致に変えたい',
                          'どちらとも言えない'])
        .setRequired(true);
      form.addParagraphTextItem()
        .setTitle(row.oid + ' ・ 「部分一致」の理由')
        .setHelpText('③と④が同じ文に見えるのに部分一致とされた理由が分かると、' +
                     'ツールの評価のしかたを直せます。')
        .setRequired(false);
    }
  });

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  Logger.log('B10  EDIT: ' + form.getEditUrl());
  Logger.log('B10  LIVE: ' + form.getPublishedUrl());
  PropertiesService.getScriptProperties().setProperty('B10_LIVE', form.getPublishedUrl());
}

function showB10Links() {
  var props = PropertiesService.getScriptProperties();
  Logger.log('RESPONSES: ' + (props.getProperty('B10_RESPONSE_SS_ID')
    ? SpreadsheetApp.openById(props.getProperty('B10_RESPONSE_SS_ID')).getUrl()
    : '(not created yet)'));
  Logger.log('B10 LIVE:  ' + (props.getProperty('B10_LIVE') || '(not built yet)'));
  Logger.log('B10 EDIT:  ' + (props.getProperty('B10_EDIT') || '(not built yet)'));
}

/** Clears B10's memory ONLY. Does not touch the blind-grading batches. */
function resetB10State() {
  var props = PropertiesService.getScriptProperties();
  ['B10_LIVE', 'B10_EDIT', 'B10_RESPONSE_SS_ID'].forEach(function (k) {
    props.deleteProperty(k);
  });
  Logger.log('B10 state cleared. The form and sheet still exist in Drive — ' +
             'delete them by hand before rebuilding, or you will have two.');
}
"""

if __name__ == "__main__":
    sys.exit(main())
