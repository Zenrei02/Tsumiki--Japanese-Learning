# -*- coding: utf-8 -*-
"""
Post-import check: how many 誤指摘 are actually invented errors?

WHY THIS EXISTS
The Step 3 grading vocabulary is 一致 / 部分一致 / 見逃し / 誤指摘. All four ask the
same question — did the tool FIND the error? None of them can say "the tool found
the error correctly and then suggested an unnatural rewrite." A grader who hits
that case reaches for whichever box feels closest, and Keiko reached for 誤指摘.

That matters more here than it would anywhere else in the eval, because 誤指摘 is
the narrowest gate in the workbook:

    Results!A28  invented ≤ 5%  →  at most 2 of 50 per model
    Results!A29  invented ≤ 3%  →  at most 1 of 50 per model
    Results!A30  ANY 誤指摘 on a FIX-tier output → hard fail, no rate involved

Two misread comments move a model from PASS to FAIL on the rate. ONE misread
comment on a FIX-tier row fails it outright with no arithmetic at all.

Session 20 first saw this on B1's えり/犬 sentence (E25) and recorded it as three
誤指摘 that were really "diagnosis right, rewrite unnatural", i.e. an invented-error
count of 0 rather than 3.

⚠ THAT SECOND HALF DOES NOT SURVIVE CONTACT WITH THE COMMENTS (checked Sep 5 2026,
after the real import). Session 20 was right that her comments on E25 are rewrites
rather than verdicts. What does not follow is that the tool was therefore correct.
On O107 — the FIX-tier one — the tool made a DIAGNOSTIC claim (「えりは→えりが」,
asserting 〜より takes が) as well as a suggested rewrite, and her comment addresses
only the rewrite. Whether the claim itself was wrong is undetermined, and it is the
claim that decides the gate. The count for E25 is a band of 0–1, not 0.

That is the shape of the whole problem: a later recap of an earlier reading is not
the reading. The pattern does recur in every batch B1–B9, and the number the GO/TUNE
decision rests on still cannot be read off Results until the comments behind it have
been looked at — one at a time, against the tool output they are judging.

WHAT THIS IS, AND WHAT IT IS NOT
It is a READING aid, on the check-romaji-leak.py model: recall-tuned, prints
everything it flags, writes nothing. It does NOT correct the count and it does NOT
touch the workbook. A verdict is a reviewer's judgement; only Lloyd can decide to
set one aside, and doing so is a documented adjudication, not a script's output.

What it does instead is bound the answer. It reports the invented-error count three
ways per model:

    AS GRADED   every 誤指摘 counted — what Results!B13 already shows
    FLOOR       only 誤指摘 with no exculpating comment — the best case
    CEILING     floor + the ones whose comment is blank or unreadable

The FLOOR is not a result. It is the number the eval would show IF every flagged
comment survives eyeballing, which is exactly the thing this script cannot know.
Read the printout, then decide. If floor and ceiling fall on opposite sides of a
gate, the eval does not have a verdict yet and the honest move is to ask Keiko
about those specific rows rather than to pick the flattering end of the band.

USAGE
  python3 check-unnatural-rewrite.py [workbook.xlsx]
Defaults to naoshi-eval-v1-with-outputs.xlsx. Run it AFTER
import-grading-responses.py has written Blind Grading G–H.

Exit codes: 0 nothing flagged · 1 flagged rows to read · 2 refused (nothing scanned)
"""
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

import openpyxl

DEFAULT = 'naoshi-eval-v1-with-outputs.xlsx'
SHEET = 'Blind Grading'
FIRST_ROW = 5

# Blind Grading columns
C_OID, C_EID, C_MODEL, C_SENT, C_TIER, C_FEEDBACK, C_GRADE, C_COMMENT = 1, 2, 3, 4, 5, 6, 7, 8

INVENTED = '誤指摘'
PARTIAL = '部分一致'
VALID = {'一致', PARTIAL, '見逃し', INVENTED}

# The importer appends 〔name〕 to every comment it writes, so EVERY cell is
# non-empty even when the reviewer left no comment. Strip the tag before asking
# whether anything was said — otherwise "blank comment" never fires and the
# UNREADABLE bucket silently empties itself. That is the house failure mode: a
# check whose negative case cannot occur.
NAME_TAG_RE = re.compile(r'〔[^〕]*〕')

# ── Categories ────────────────────────────────────────────────────────────────
# Ordered: the first match wins, most specific first. Every pattern below was
# taken from a comment Keiko actually wrote (Sessions 20–21, B1–B9), not invented
# to be thorough. Adding a pattern that has never appeared widens the exculpation
# net against no evidence, which is the one direction this script must not err in.
CATEGORIES = [
    ('WRONG_MEANING',
     'the rewrite changes what the sentence says',
     # Particle and word order vary more than the first draft assumed. Real
     # comments from the Sep 5 import that the narrow list MISSED:
     #   O075 「会う時間　と　待ち合わせの時間の　意味は違う」   (は, not が)
     #   O024 「②は会うという意味なのに　③では会議という意味になっている」
     # Both are textbook meaning-changes and both were being counted as invented
     # errors. Match on 意味 plus a change/difference verb rather than on fixed
     # phrases — Japanese will not hold still for a phrase list.
     ['違う意味', '意味が違', '意味は違', '意味の違', '意味が変わ', '意味は変わ',
      '意味がおかしい', '別の意味', '意味になっている', '意味になってる',
      '意味なのに', '意味が異な']),

    ('BLOCK_MISMATCH',
     '② and ③ are not about the same sentence — a rendering/harness fault, not the model',
     ['例文が違', '文章が違', '②と③', '文が違います', '別の文']),

    ('REWRITE_UNNATURAL',
     'diagnosis right, suggested rewrite judged unnatural',
     ['不自然', '直し方', '直しかた', '自然じゃない', '自然ではない',
      'おかしい', '変です', '変な日本語', 'ぎこちない']),

    ('KEY_AMBIVALENT',
     'the reviewer says either form is acceptable — a key-doubt signal on any verdict',
     ['どちらでもいい', 'どっちでもいい', 'どちらでも良い', 'どちらでもよい']),

    # ⚠ ASYMMETRIC ON PURPOSE — see KEY_ASSERT_ONLY_ON_PARTIAL below.
    ('KEY_ASSERT',
     'the reviewer asserts the original was fine — disputing the KEY',
     ['問題ない', '問題なし', '間違いではない', '間違いじゃない',
      'これでもいい', 'これでいい', '大丈夫', '正しいと思', 'いいと思い']),
]

# 🚩 THE ONE PLACE THIS SCRIPT COULD DO REAL DAMAGE, found in fixture testing.
#
# 「問題のない文です」 reads as "this sentence is fine". Against a 部分一致 that means
# the reviewer is arguing with Tomoko's key — the two-reviewer confound, and a fair
# reason to set the verdict aside. Against a 誤指摘 it means the exact opposite: the
# tool flagged a sentence that was fine, which is the DEFINITION of an invented
# error. Identical words, opposite implication, and the naive version exculpated
# both — quietly deleting the clearest confirmations of the very thing the gate
# exists to catch.
#
# So KEY_ASSERT can only ever excuse a 部分一致. On a 誤指摘 the same phrases are
# CONFIRMATORY and the row is reported as such. This is the only asymmetry in the
# lexicon and it is deliberate: every other category describes a fault the
# vocabulary cannot name, while this one describes a fault it names perfectly.
KEY_ASSERT_ONLY_ON_PARTIAL = 'KEY_ASSERT'

# 「ような気がします」「かもしれません」 etc. Keiko hedged the whole B1 finding this
# way. A hedged exculpation is still an exculpation, but the reader should see
# that it was hedged rather than asserted.
HEDGE = ['気がします', 'かもしれ', 'と思います', 'ような', 'たぶん', '多分']


def clean_comment(raw):
    """Comment text with the importer's 〔name〕 tag removed."""
    if raw is None:
        return ''
    return NAME_TAG_RE.sub('', str(raw)).strip('　 \t\r\n')


# Arrows mean "I would write it this way". Keiko used → throughout.
ARROW_RE = re.compile(r'[→⇒➡]|->')
ALL_TERMS = [t for _, _, terms in CATEGORIES for t in terms]


def quotes_source(comment, feedback, key):
    """Does the comment quote the TOOL's own rewrite, and/or the KEY?

    🚩 THE SECOND CORRECTION, and it overturned the first one's label. `is_rewrite_only`
    called these comments "a rewrite, not a judgement". Checked against the source text
    that is wrong. On O107 the comment is

        「えりが犬よりも早く私の立場を置き換わった → えりはあっという間に僕から犬に乗り換えたね(笑)」

    where the LEFT side is quoted verbatim from the tool's own suggested rewrite and the
    RIGHT side is verbatim the answer key. She was writing *"[what the tool proposed] →
    [what it should have been]"*. Same shape on O058 and O111. That is emphatically a
    judgement — it just judges the REWRITE rather than the DIAGNOSIS.

    The distinction decides the gate. A tool output can contain both a diagnostic claim
    (O107: 「えりは→えりが」, asserting 〜より takes が) and a suggested rewrite. A comment
    of this shape objects to the rewrite and is SILENT on the claim. Whether the claim
    itself was wrong is a linguistic judgement no script can make, so these stay in the
    uninterpretable band — but they are labelled for what they are, because the label is
    what tells you which question to ask.
    """
    seg = [p.strip() for chunk in str(comment).split('\n')
           for p in ARROW_RE.split(chunk) if p.strip()]
    n = lambda s: unicodedata.normalize('NFKC', re.sub(r'\s', '', str(s or '')))
    nf, nk = n(feedback), n(key)
    hits_tool = any(len(n(p)) >= 6 and n(p) in nf for p in seg)
    hits_key = any(len(n(p)) >= 6 and (n(p) in nk or nk in n(p)) for p in seg)
    return hits_tool, hits_key


def is_rewrite_only(comment):
    """True if the comment supplies a CORRECTION instead of a JUDGEMENT.

    🚩 THE GAP THE FIRST DRAFT HAD, found against the real Sep 5 import. Session 20
    already said it in words — "her comments are mostly REWRITES, i.e. Step 2
    behaviour" — and the scanner was still built to look only for evaluative
    vocabulary. So the single clearest signature of the problem was invisible to
    the instrument built to find it. All three E25 (えり/犬) comments are pure
    rewrites with no evaluative word anywhere:

        O107 「えりが犬よりも早く私の立場を置き換わった→えりはあっという間に…」

    ⚠ AND THIS DOES NOT EXCULPATE. A bare rewrite does not say whether she thought
    the tool invented an error or simply preferred different Japanese — those are
    opposite verdicts and the comment distinguishes neither. So a rewrite-only
    誤指摘 is UNINTERPRETABLE as a grade: it widens the band rather than lowering
    the floor, exactly like an empty comment. Reading it as agreement with the tool
    would be inventing evidence in the flattering direction.
    """
    if not comment or not ARROW_RE.search(comment):
        return False
    return not any(t in comment for t in ALL_TERMS)


def classify(comment):
    """(category, description, matched_terms) — or (None, None, []) if nothing matched."""
    for name, desc, terms in CATEGORIES:
        hits = [t for t in terms if t in comment]
        if hits:
            return name, desc, hits
    return None, None, []


def load_rows(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    if SHEET not in wb.sheetnames:
        sys.exit(f"{path.name} has no '{SHEET}' sheet — wrong workbook?")
    ws = wb[SHEET]
    keys = {}
    if 'Eval Set' in wb.sheetnames:
        ev = wb['Eval Set']
        for r in range(6, ev.max_row + 1):
            eid = ev.cell(r, 1).value
            if eid:
                keys[str(eid).strip()] = str(ev.cell(r, 8).value or '')
    rows = []
    for r in range(FIRST_ROW, ws.max_row + 1):
        oid = ws.cell(r, C_OID).value
        if not oid:
            continue
        rows.append({
            'row': r,
            'oid': str(oid).strip(),
            'eid': str(ws.cell(r, C_EID).value or '').strip(),
            'model': str(ws.cell(r, C_MODEL).value or '').strip(),
            'tier': str(ws.cell(r, C_TIER).value or '').strip(),
            'feedback': str(ws.cell(r, C_FEEDBACK).value or '').strip(),
            'grade': str(ws.cell(r, C_GRADE).value or '').strip(),
            'comment': clean_comment(ws.cell(r, C_COMMENT).value),
        })
        rows[-1]['key'] = keys.get(rows[-1]['eid'], '')
    return rows


def bar(label, value, width=42):
    return f'{label:<26}{value}'


def main():
    path = Path(sys.argv[1] if len(sys.argv) > 1 else DEFAULT)
    if not path.exists():
        print(f'{path.name} not found. Nothing to check yet.')
        return 0

    rows = load_rows(path)
    graded = [r for r in rows if r['grade']]

    # Same guard as check-romaji-leak.py, and for the same reason: an empty read
    # must not produce the same all-clear as a clean one.
    if not graded:
        print(f'REFUSED: {len(rows)} Blind Grading rows read, 0 of them graded.\n'
              'Nothing has been imported yet, so "no misclassified 誤指摘" would be\n'
              'meaningless rather than reassuring. Run import-grading-responses.py first.')
        return 2

    unknown = sorted({r['grade'] for r in graded if r['grade'] not in VALID})
    if unknown:
        print(f'REFUSED: unrecognised grade value(s) {unknown} in Blind Grading G.\n'
              'The sheet is not in the shape this check assumes; fix the import first.')
        return 2

    # ── Classify every non-一致 verdict. 部分一致 is included because the same
    # instrument gap pushes cases there too — it does not feed the gate, but it
    # depresses the agreement rate, which is the OTHER half of the GO condition.
    flagged = defaultdict(list)      # category -> rows
    unreadable_invented = []
    confirmed_invented = []          # 誤指摘 whose comment CONFIRMS the invented error
    residual_invented = defaultdict(list)   # model -> rows
    per_model_raw = defaultdict(int)
    per_model_graded = defaultdict(int)

    for r in graded:
        per_model_graded[r['model']] += 1
        if r['grade'] == INVENTED:
            per_model_raw[r['model']] += 1

        if r['grade'] not in (INVENTED, PARTIAL):
            continue

        cat, desc, hits = classify(r['comment'])

        # The asymmetry. A KEY_ASSERT phrase on a 誤指摘 confirms the invented error
        # rather than excusing it, so it must fall through to the residual bucket —
        # and be shown, because it is the strongest evidence in the whole sheet.
        if cat == KEY_ASSERT_ONLY_ON_PARTIAL and r['grade'] == INVENTED:
            r['hits'] = hits
            confirmed_invented.append(r)
            residual_invented[r['model']].append(r)
            continue

        if cat:
            r['category'], r['hits'] = cat, hits
            r['hedged'] = any(h in r['comment'] for h in HEDGE)
            flagged[cat].append(r)
        elif r['grade'] == INVENTED:
            if not r['comment']:
                r['why'] = 'no comment at all'
                unreadable_invented.append(r)
            elif is_rewrite_only(r['comment']):
                t, k = quotes_source(r['comment'], r['feedback'], r['key'])
                if t and k:
                    r['why'] = ("quotes the TOOL's own rewrite → corrects it toward the KEY. "
                                "Judges the REWRITE; silent on whether the DIAGNOSIS was right — "
                                "and on a FIX-tier row that is exactly what decides the gate")
                elif t:
                    r['why'] = ("quotes the TOOL's own rewrite and corrects it. Judges the "
                                "REWRITE; silent on the DIAGNOSIS")
                else:
                    r['why'] = 'a bare rewrite, with no reference to the tool or the key'
                unreadable_invented.append(r)
            else:
                residual_invented[r['model']].append(r)

    models = sorted(per_model_graded)

    print(f'Scanned {len(graded)} graded rows in {path.name} '
          f'({len(rows)} rows present).\n')

    # ── The flagged rows, in full. This is the part that has to be read. ───────
    total_flagged = sum(len(v) for v in flagged.values())
    if total_flagged:
        print('─' * 78)
        print(f'{total_flagged} verdict(s) whose comment describes something the four-way')
        print('vocabulary cannot express. EYEBALL EVERY ONE — the check is tuned for recall,')
        print('and each of these is a reviewer judgement that only Lloyd can set aside.')
        print('─' * 78)
        for name, desc, _ in CATEGORIES:
            group = flagged.get(name)
            if not group:
                continue
            print(f'\n■ {name} — {desc}   ({len(group)})')
            for r in sorted(group, key=lambda x: x['oid']):
                gate = ''
                if r['grade'] == INVENTED:
                    gate = '  ⚠ COUNTS AS INVENTED'
                    if r['tier'] == 'FIX':
                        gate = '  🚨 FIX-TIER INVENTED — Results!A30 hard fail'
                hedge = '  (hedged)' if r.get('hedged') else ''
                print(f"\n  {r['oid']}  {r['eid']}  {r['model']}  tool={r['tier']}  "
                      f"graded={r['grade']}{gate}{hedge}")
                print(f"      matched: {', '.join(r['hits'])}")
                print(f"      comment: {r['comment'][:220]}"
                      f"{'…' if len(r['comment']) > 220 else ''}")
                print(f"      tool said: {r['feedback'][:180]}"
                      f"{'…' if len(r['feedback']) > 180 else ''}")

    if confirmed_invented:
        print('\n' + '─' * 78)
        print(f'{len(confirmed_invented)} 誤指摘 whose comment CONFIRMS it — the reviewer says the')
        print('original sentence was fine. These are invented errors on the reviewer\'s own')
        print('account and are NOT set aside by anything below.')
        print('─' * 78)
        for r in sorted(confirmed_invented, key=lambda x: x['oid']):
            flag = '  🚨 FIX-tier — Results!A30 hard fail' if r['tier'] == 'FIX' else ''
            print(f"\n  {r['oid']}  {r['eid']}  {r['model']}  tool={r['tier']}{flag}")
            print(f"      matched: {', '.join(r['hits'])}")
            print(f"      comment: {r['comment'][:220]}"
                  f"{'…' if len(r['comment']) > 220 else ''}")

    if unreadable_invented:
        print('\n' + '─' * 78)
        print(f'{len(unreadable_invented)} 誤指摘 that cannot be READ as a grade — neither exculpated')
        print('nor confirmed. These are the width of the band below, and they are the')
        print('rows to ask Keiko about if a gate turns on them.')
        print('─' * 78)
        for r in sorted(unreadable_invented, key=lambda x: x['oid']):
            flag = '  🚨 FIX-tier' if r['tier'] == 'FIX' else ''
            print(f"\n  {r['oid']}  {r['eid']}  {r['model']}  tool={r['tier']}{flag}")
            print(f"      why: {r['why']}")
            if r['comment']:
                print(f"      comment: {r['comment'][:200]}"
                      f"{'…' if len(r['comment']) > 200 else ''}")

    # ── The arithmetic, per model, against the real gates. ────────────────────
    print('\n' + '═' * 78)
    print('INVENTED-ERROR COUNT, BOUNDED')
    print('═' * 78)
    print('AS GRADED = what Results!B13 shows now.  FLOOR = every flagged 誤指摘 set')
    print('aside.  CEILING = floor + the no-comment ones. The truth is inside the band,')
    print('and the band is only as good as your reading of the rows above.\n')

    n_exculpated = defaultdict(int)
    n_unreadable = defaultdict(int)
    fix_tier_raw = defaultdict(list)
    fix_tier_floor = defaultdict(list)
    for group in flagged.values():
        for r in group:
            if r['grade'] == INVENTED:
                n_exculpated[r['model']] += 1
    for r in unreadable_invented:
        n_unreadable[r['model']] += 1
    for r in graded:
        if r['grade'] == INVENTED and r['tier'] == 'FIX':
            fix_tier_raw[r['model']].append(r['oid'])
    for m, rs in residual_invented.items():
        fix_tier_floor[m] = [r['oid'] for r in rs if r['tier'] == 'FIX']

    # 🚩 A row that left `residual` is NOT necessarily exculpated — it may be
    # UNINTERPRETABLE (rewrite-only or blank), which is a different thing and must
    # not be reported as though the hard fail had been explained away. The first
    # version collapsed the two and announced "ALL have an exculpating comment"
    # about O107, whose comment explains nothing. Erring toward the flattering
    # reading is the exact failure this script exists to prevent.
    fix_tier_unreadable = defaultdict(list)
    for r in unreadable_invented:
        if r['tier'] == 'FIX':
            fix_tier_unreadable[r['model']].append(r['oid'])

    hdr = f"{'':<12}{'graded':>7}{'as graded':>11}{'floor':>7}{'ceiling':>9}   gate (rate ≤5% = ≤2)"
    print(hdr)
    print('-' * len(hdr))
    band_straddles = []
    for m in models:
        n = per_model_graded[m]
        raw = per_model_raw[m]
        floor = raw - n_exculpated[m] - n_unreadable[m]
        ceiling = floor + n_unreadable[m]

        def verdict(c):
            if n == 0:
                return '—'
            return 'PASS' if (c / n) <= 0.05 else 'FAIL'

        v_raw, v_floor, v_ceil = verdict(raw), verdict(floor), verdict(ceiling)
        note = f'{v_raw} → {v_floor}' if v_raw != v_floor else v_raw
        if v_floor != v_ceil:
            note += f' / {v_ceil} (band straddles the gate)'
            band_straddles.append(m)
        print(f'{m:<12}{n:>7}{raw:>11}{floor:>7}{ceiling:>9}   {note}')

    # ── The hard fail is separate, because it has no denominator. ─────────────
    print('\n' + '═' * 78)
    print('FIX-TIER 誤指摘 — Results!A30, hard fail, no rate involved')
    print('═' * 78)
    any_fix = False
    for m in models:
        raw_f = fix_tier_raw.get(m, [])
        floor_f = fix_tier_floor.get(m, [])
        unread_f = fix_tier_unreadable.get(m, [])
        excul_f = [o for o in raw_f if o not in floor_f and o not in unread_f]
        if not raw_f:
            print(f'  {m:<6} none')
            continue
        any_fix = True
        print(f'  {m:<6} {len(raw_f)} as graded: {", ".join(raw_f)}')
        if excul_f:
            print(f'  {"":<6}   {len(excul_f)} with an exculpating comment: {", ".join(excul_f)}')
        if unread_f:
            print(f'  {"":<6}   {len(unread_f)} UNINTERPRETABLE (rewrite-only or blank): '
                  f'{", ".join(unread_f)}')
        if floor_f:
            print(f'  {"":<6}   🚨 {len(floor_f)} SURVIVE READING: {", ".join(floor_f)} — HARD FAIL STANDS')
        elif unread_f:
            print(f'  {"":<6}   ⚠ The hard fail turns entirely on rows that cannot be read as a')
            print(f'  {"":<6}     grade. It is neither confirmed nor cleared. These are the')
            print(f'  {"":<6}     rows worth one question to Keiko — nothing else in the eval')
            print(f'  {"":<6}     buys as much certainty per minute of her time.')
        else:
            print(f'  {"":<6}   Every one has an exculpating comment. The hard fail rests')
            print(f'  {"":<6}     entirely on verdicts this script reads as misfiled.')
            print(f'  {"":<6}     Adjudicate before letting Results!A31 read TUNE on them.')
    if not any_fix:
        print('  (no FIX-tier 誤指摘 anywhere — A30 is clean on every model)')

    print('\n' + '═' * 78)
    if band_straddles:
        print(f'⚠ {", ".join(band_straddles)}: floor and ceiling fall on OPPOSITE SIDES of')
        print('  the 5% gate. There is no verdict for these models yet. Going back to Keiko')
        print('  on the specific no-comment rows is cheaper than a wrong go/tune call, and')
        print('  the adjudication order in the tracker applies: Lloyd first, then annotate,')
        print('  then return to the reviewer LAST and batched.')
    elif total_flagged:
        flipped = [m for m in models
                   if per_model_graded[m]
                   and (per_model_raw[m] / per_model_graded[m] > 0.05)
                   and ((per_model_raw[m] - n_exculpated[m] - n_unreadable[m])
                        / per_model_graded[m] <= 0.05)]
        if flipped:
            print(f'⚠ {", ".join(flipped)}: the rate gate FLIPS from FAIL to PASS once the')
            print('  flagged verdicts are set aside. That is a real change of result and it')
            print('  rests on this script\'s reading, so the reading has to be checked by hand')
            print('  before anyone quotes the corrected number.')
        else:
            print('Floor and ceiling agree on every model — the flagged rows change the count')
            print('but not the rate gate.')
        print('\nEither way, read them: they are the product finding. "Diagnosis right,')
        print('rewrite unnatural" recurring across all nine batches is a REWRITE-QUALITY')
        print('problem, which no amount of grading arithmetic fixes.')
    else:
        print('Nothing flagged. Every 誤指摘 reads as a genuine invented error.')
    print('═' * 78)
    print('\nNOTHING WAS WRITTEN. This script never edits the workbook — setting a verdict')
    print('aside is an adjudication, and adjudications get recorded in Eval Set col L with')
    print('a date and a name, the way E09 was.')

    return 1 if (total_flagged or unreadable_invented) else 0


if __name__ == '__main__':
    sys.exit(main())
