# -*- coding: utf-8 -*-
"""
Post-import check: is the tool's REWRITE right, not just its diagnosis?

WHY THIS EXISTS
Blind grading finished Sep 5 2026 and all three models read TUNE. The binding
constraint is agreement (68% / 86% / 82% against a 90% bar), not invented errors
— and even counting every flagged 部分一致 as 一致 leaves M1 at 86%, M2 at 92%,
M3 at 90%. No regrading produces a GO. So the question stopped being "is the
score right?" and became "what is actually wrong?"

check-unnatural-rewrite.py answered that from the reviewer's side: 23 of 150
outputs carry a comment describing a fault the four-way vocabulary cannot name,
16 of them FIX-tier. Reading the sentences where two or more models failed the
same way gives one pattern:

    THE REWRITER REACHES FOR GRAMMATICAL REPAIR WHEN THE REQUIRED FIX IS
    LEXICAL OR SEMANTIC.

    E02  えりが直ってくれる     key 直って→直して
         M1 rewrote えり (a NAME) as 襟 ("collar") and left the transitivity
         error alone. M2 said NONE and echoed the input back.
    E10  会いは8時からでしょう？  key 会い→会うの
         All three saw that 会い is not a standalone noun. M3 substituted 会議,
         M2 substituted 待ち合わせ — both change what the sentence says — and
         M1 swapped the particle and left 会い intact.
    E14  孤立な→孤立した          M3 changed 孤立 to 孤独, a different word.
    E50  家族→家系                M2 kept 家族 and merely added です.

That is measurable WITHOUT REVIEWER TIME, which is the whole point of this
script. Every Blind Grading row carries the tool's proposed rewrite (the
`Rewrite:` line in column F — present on all 150, checked) and Eval Set column H
carries the expected correction. That is a reference pair on all 150 rows.
Keiko was computing this comparison by hand; this automates what she was doing.

⚠ REVIEWER TIME IS THE SCARCEST RESOURCE IN THIS PROJECT AND IT IS NEARLY SPENT.
Nine batches done, B1 declined payment, ¥6,000 owed. The reason this is an
instrument and not a SYSTEM_PROMPT change is that changing the prompt invalidates
the baseline: all 150 outputs were produced under the current prompt, so a change
means the eval no longer measures what ships, and re-grading costs another nine
batches. Instrument first, change second — the same call that sent the romaji
問題 to check-romaji-leak.py instead of to eval rows.

WHAT IT MEASURES

PRIMARY signals — these set the headline flag:

  TARGET_MISSED    The key changed a span; the rewrite left that span verbatim.
                   E50's 家族 and E02's 直って both fail here.
  LEXICAL_MISS     A key edit was applied only in part, and what survived is a
                   KANJI. This is the pattern itself: 家族で→家系に carries a
                   lexical fix (族→系) and a grammatical one (で→に); the tool
                   does the grammar and leaves the word. Kana surviving is
                   inflection and means nothing; a kanji surviving is a word
                   left wrong.
  SUBSTITUTION     A replace op whose replacement contains kanji or katakana
                   found in neither source nor key — 会議, 待ち合わせ, 襟, 孤独.
  ECHOED           The rewrite is the source verbatim on a row marked ERROR:
                   the tool proposed nothing. (On a CORRECT row that is the
                   right answer and is not counted as a fault.)
  NAME_KANJIFIED   An all-hiragana run the key left alone became kanji.
                   Hiragana proper nouns are the trap; E02's えり→襟 is the case.

SECONDARY signals — computed and printed, deliberately NOT in the headline:

  TARGET_PARTIAL   Any partial application, kana included. Measured at 17%
                   precision against a 15% base rate, i.e. it carries no
                   information; 「いでした」→「かったです」 leaves a で standing
                   by coincidence and the row reads as a fault — that
                   coincidence IS O120, one of the rows below that no reference
                   pair can really reach, so counting it would be luck dressed
                   as measurement. Kept visible because LEXICAL_MISS is its
                   useful subset.
  SELF_INCONSISTENT  The tool stated a correction in its own issues list and
                   then did not make it in its own rewrite. Needs NO answer key,
                   so it is the only signal that covers the 19 CORRECT rows.
                   22% precision — below the bar, and kept secondary because of
                   it, but the low number is itself informative: on most of
                   these Keiko graded 一致, because she was grading the
                   DIAGNOSIS and the diagnosis was right. It is the clearest
                   example in this script of a fault she had no box for.
  EXTRA_EDIT       The rewrite changed a span the key left alone — the
                   invented-error shape one level down. 26% precision, so it is
                   shown but not counted. It is the only thing that catches
                   O048, which applied the key's を→が correctly and then
                   changed から to に as well.

HOW THE PRIMARY SET WAS CHOSEN, so it can be re-derived rather than trusted:
a signal is primary if its precision against the reviewer-derived positives is
at least TWICE the base rate (23/150 = 15%). That rule, fixed before the numbers
were looked at, admits the five above (41–62%) and excludes the two below
(17%, 26%). It is a stated rule, not a fitted one: maximising F1 would keep
TARGET_MISSED alone, which scores better and measures less.

WHAT IT IS NOT
A grader. It writes nothing, it does not touch a verdict, and its output is a
reading. It is also CHARACTER-BASED, deliberately: no Japanese tokenizer is
installed here and adding one would put a dependency between Lloyd and a check he
needs to be able to run. Character diffing is coarse — it cannot tell a
morpheme boundary from a coincidence — so every signal is a lead, and the rows
are printed in full so they can be read rather than counted.

⚠ AND IT HAS A CEILING IT CANNOT PASS. Three of the rows Keiko flagged —
O009 (E30), O098 (E02), O120 (E38) — have a rewrite that matches the
reviewer-verified key CHARACTER FOR CHARACTER, and she still graded them
部分一致 with 「直し方が不自然」. On E02 and E38 Tomoko had approved that key
問題なし. No reference-pair instrument can catch those, because by construction
the tool hit the reference. They are not rewrite-quality failures at all: they
are the two reviewers disagreeing about what correct Japanese is, arriving in a
column that has nowhere to put it. Recall against the 23 is therefore capped at
20/23 = 87%, and the last three are a finding rather than a bug.

VALIDATION
The headline number is agreement with the reviewer: the 23 rows
check-unnatural-rewrite.py derives from Keiko's own comments are the positive
class, the other 127 the negative. A check that does not reproduce her calls is
not measuring what she measured. Note what that comparison is — her comments,
classified by another script — not a hand-labelled gold set. It is the best
reference available without spending more of her time, and it is the reason this
script exists rather than a tenth batch.

USAGE
  python3 check-rewrite-quality.py [workbook.xlsx] [--all] [--quiet]

    --all     print every row, not just the flagged ones
    --quiet   summary tables only, no per-row detail

Defaults to naoshi-eval-v1-with-outputs.xlsx. Run AFTER
import-grading-responses.py has written Blind Grading G–H.

Exit codes: 0 nothing flagged · 1 flagged rows to read · 2 refused (nothing scanned)
"""
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path

import openpyxl

DEFAULT = 'naoshi-eval-v1-with-outputs.xlsx'
BG_SHEET = 'Blind Grading'
ES_SHEET = 'Eval Set'
BG_FIRST = 5

# Blind Grading columns
B_OID, B_EID, B_MODEL, B_SENT, B_TIER, B_FEEDBACK, B_GRADE, B_COMMENT = 1, 2, 3, 4, 5, 6, 7, 8
# Eval Set columns
E_ID, E_SRC, E_LEVEL, E_SENT, E_STATUS, E_WATCH, E_TIER, E_KEY, E_WHY, E_KEYOK, E_AMEND, E_NOTE = range(1, 13)

OID_RE = re.compile(r'^O\d{3}$')
EID_RE = re.compile(r'^E\d+$')
REWRITE_RE = re.compile(r'^\s*Rewrite:\s*(.+?)\s*$', re.MULTILINE)
# The tool's OWN stated corrections: "[FIX] 誰もに → 誰も — because…". Parsing these
# gives a second reference that needs no answer key at all, so it covers the 19
# CORRECT rows where column H is just "—" and the key comparison has nothing to say.
ISSUE_RE = re.compile(r'^\[([A-Z][A-Z ]*)\]\s*(.+?)\s*[→⇒]\s*(.+?)(?:\s+—|\s*$)',
                      re.MULTILINE)

NO_CORRECTION = '—'          # what col H holds on a CORRECT row

# See "HOW THE PRIMARY SET WAS CHOSEN" above. Primary signals set the headline
# flag; secondary ones are printed beside them and excluded from the count.
PRIMARY = ['TARGET_MISSED', 'LEXICAL_MISS', 'SUBSTITUTION', 'ECHOED', 'NAME_KANJIFIED']
SECONDARY = ['SELF_INCONSISTENT', 'TARGET_PARTIAL', 'EXTRA_EDIT']
KANJI = re.compile(r'[一-鿿㐀-䶿]')
KATAKANA = re.compile(r'[゠-ヿ]')
HIRAGANA_ONLY = re.compile(r'^[぀-ゟ]+$')

# Characters that carry no lexical weight — an "alien" run made only of these is
# punctuation or inflection drift, not a substituted word. Without this the
# politeness particles that every rewrite adds (です, ます) drown the signal.
TRIVIAL = set('。、！？!?（）()「」『』…・~〜　 \t\n\r"\'.,')


def norm(s):
    """NFKC, collapse whitespace. Nothing else — the differences being measured
    are inside the text, so normalising harder would erase the finding."""
    if s is None:
        return ''
    s = unicodedata.normalize('NFKC', str(s))
    return re.sub(r'\s+', ' ', s).strip()


def parse_issues(feedback):
    """(tier, before, after) for each correction the tool stated for itself."""
    if feedback is None:
        return []
    return [(t.strip(), b.strip(), a.strip()) for t, b, a in ISSUE_RE.findall(str(feedback))]


def unapplied_issues(issues, rewrite):
    """Corrections the tool announced and then did not make.

    This is the one signal that needs NO answer key, which is why it is worth
    having separately: it asks whether the model did what it just said it would.
    O043 is the case in its purest form — the tool reported the sentence sound,
    then handed back a rewrite that had turned a person's name into a noun.
    """
    out = []
    for tier, before, after in issues:
        if not after or after in rewrite:
            continue
        out.append((tier, before, after))
    return out


def parse_rewrite(feedback):
    """The `Rewrite:` line from a column F blob, or '' if there isn't one."""
    if feedback is None:
        return ''
    hits = REWRITE_RE.findall(str(feedback))
    return norm(hits[-1]) if hits else ''


def merged_opcodes(a, b, glue=1):
    """SequenceMatcher opcodes with near-adjacent edits merged.

    Two edits separated by one shared character are one edit as far as a reader
    is concerned; left unmerged they produce single-character spans that match
    anywhere in the sentence by accident.
    """
    ops = [op for op in SequenceMatcher(None, a, b, autojunk=False).get_opcodes()
           if op[0] != 'equal']
    if not ops:
        return []
    merged = [list(ops[0])]
    for tag, i1, i2, j1, j2 in ops[1:]:
        if i1 - merged[-1][2] <= glue and j1 - merged[-1][4] <= glue:
            merged[-1][2], merged[-1][4] = i2, j2
            merged[-1][0] = 'replace'
        else:
            merged.append([tag, i1, i2, j1, j2])
    return [tuple(m) for m in merged]


def target_edits(src, key):
    """The spans the KEY changes in the SOURCE, as (i1, i2, src_span, key_span)."""
    return [(i1, i2, src[i1:i2], key[j1:j2])
            for _tag, i1, i2, j1, j2 in merged_opcodes(src, key)]


def preserved_mask(src, rewrite):
    """Per-character: True where src[i] survives verbatim into the rewrite.

    This is the load-bearing primitive. Asking "is the key's span still in the
    rewrite?" as a substring test was the first version's mistake — 「っ」 matches
    inside 思った and a real fix reads as a miss. Positional alignment answers the
    question that is actually being asked: did the tool touch THIS span?
    """
    mask = [False] * len(src)
    for tag, i1, i2, _j1, _j2 in SequenceMatcher(None, src, rewrite,
                                                 autojunk=False).get_opcodes():
        if tag == 'equal':
            for i in range(i1, i2):
                mask[i] = True
    return mask


def classify_edit(i1, i2, s_span, k_span, rewrite, mask):
    """APPLIED / MISSED / PARTIAL / DIVERGED for one key edit.

    PARTIAL is the whole reason this script exists. When the key changes 家族で to
    家系に, that is ONE edit carrying TWO fixes — a lexical one (族→系) and a
    grammatical one (で→に). The rewriter does the grammar and leaves the word.
    Merged into a single span both halves vanish into "DIVERGED"; split by which
    characters survived, the pattern is visible and countable.
    """
    kept = [s_span[k] for k in range(i2 - i1) if mask[i1 + k]]
    if not s_span:                                  # pure insertion by the key
        return ('APPLIED' if k_span and k_span in rewrite else 'DIVERGED'), kept
    if len(kept) == len(s_span):
        return 'MISSED', kept
    if not kept:
        return ('APPLIED' if k_span and k_span in rewrite else 'DIVERGED'), kept
    return 'PARTIAL', kept


def lexical(s):
    """The characters in s that carry lexical weight — kanji and katakana.

    Kana are inflection and particles: they move under any correct rewrite. A
    kanji surviving an edit that was supposed to replace it is a word left wrong.
    """
    return [c for c in s if KANJI.match(c) or KATAKANA.match(c)]


def substitutions(src, key, rewrite):
    """Replace operations in src→rewrite whose replacement is foreign to both.

    Restricted to REPLACE on purpose. The first version flagged any run of
    characters absent from source and key, which made every added です a
    substitution and buried the signal at 35% precision. A substitution is a
    replacement OF something — 会い→会議, えり→襟, 孤立→孤独 — and a pure
    insertion is not one.
    """
    known = set(src) | set(key)
    out = []
    for tag, i1, i2, j1, j2 in merged_opcodes(src, rewrite):
        if tag != 'replace' or i1 == i2:
            continue
        s_span, r_span = src[i1:i2], rewrite[j1:j2]
        alien = ''.join(c for c in r_span if c not in known and c not in TRIVIAL)
        if alien and (KANJI.search(alien) or KATAKANA.search(alien)):
            out.append((s_span, r_span, alien))
    return out


def extra_edits(src, key, rewrite, key_spans):
    """Edits the rewrite makes to spans the KEY left alone.

    The invented-error shape, one level down: not "flagged a correct sentence"
    but "corrected a part of it that was already right". O048 is the case —
    it applied the key's を→が and then changed から to に as well, which Keiko
    says is simply wrong.
    """
    covered = set()
    for i1, i2, _s, _k in key_spans:
        covered.update(range(max(0, i1 - 1), i2 + 1))
    out = []
    # glue=0 on purpose. Merging is right for reading a key edit as one idea, and
    # wrong here: O048 changed から→に AND applied the key's を→が, and with the
    # spans glued the legitimate half absorbed the invented half and the row came
    # back clean. An extra edit has to be measured on its own boundaries.
    for tag, i1, i2, j1, j2 in merged_opcodes(src, rewrite, glue=0):
        if i1 == i2:                                # pure insertion: politeness drift
            continue
        if set(range(i1, i2)) & covered:
            continue
        s_span, r_span = src[i1:i2], rewrite[j1:j2]
        # On a row the eval marks CORRECT there is no key, so every span is
        # "left alone" and a particle swap is the invented-error shape itself.
        # On an ERROR row a one-kana change elsewhere is ordinary drift.
        if not key and s_span:
            out.append((s_span, r_span))
            continue
        if not (lexical(s_span) or lexical(r_span) or len(s_span) >= 2):
            continue
        out.append((s_span, r_span))
    return out


def kanjified_names(src, key, rewrite):
    """All-hiragana runs the KEY left alone that the REWRITE turned into kanji."""
    out = []
    for _tag, i1, i2, j1, j2 in merged_opcodes(src, rewrite):
        s_span, r_span = src[i1:i2], rewrite[j1:j2]
        if len(s_span) < 2 or not HIRAGANA_ONLY.match(s_span):
            continue
        if not KANJI.search(r_span):
            continue
        if s_span not in key:          # the key changed it too — not the tool's doing
            continue
        out.append((s_span, r_span))
    return out


def read_eval_set(ws):
    rows = {}
    for r in range(1, ws.max_row + 1):
        v = ws.cell(row=r, column=E_ID).value
        if isinstance(v, str) and EID_RE.match(v.strip()):
            rows[v.strip()] = {
                'row': r,
                'sent': norm(ws.cell(row=r, column=E_SENT).value),
                'status': (ws.cell(row=r, column=E_STATUS).value or '').strip(),
                'tier': (ws.cell(row=r, column=E_TIER).value or '').strip(),
                'key': norm(ws.cell(row=r, column=E_KEY).value),
                'keyok': (ws.cell(row=r, column=E_KEYOK).value or '').strip(),
                'amend': norm(ws.cell(row=r, column=E_AMEND).value),
            }
    return rows


def reviewer_flagged(path):
    """The Output IDs check-unnatural-rewrite.py derives from Keiko's comments.

    Imported rather than reimplemented: two copies of a lexicon drift, and this
    script's whole validation rests on comparing against THAT script's calls, not
    against a second opinion about them. Returns None if it cannot be loaded, and
    the validation section then says so instead of inventing a baseline.
    """
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location('_cur', str(path))
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
    except Exception as exc:                       # noqa: BLE001 — reported, not raised
        return None, f'{type(exc).__name__}: {exc}'
    return mod, None


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    show_all = '--all' in sys.argv
    quiet = '--quiet' in sys.argv
    path = Path(args[0]) if args else Path(DEFAULT)
    if not path.exists():
        sys.exit(f'No such workbook: {path}')

    wb = openpyxl.load_workbook(path, data_only=True)
    for need in (BG_SHEET, ES_SHEET):
        if need not in wb.sheetnames:
            sys.exit(f'{path} has no {need!r} sheet — refusing.')

    bg, es = wb[BG_SHEET], wb[ES_SHEET]
    evalset = read_eval_set(es)
    if not evalset:
        sys.exit(f'No eval rows read from {ES_SHEET} — refusing to report on nothing.')

    results, no_rewrite, ungraded = [], [], 0
    for r in range(BG_FIRST, bg.max_row + 1):
        oid = bg.cell(row=r, column=B_OID).value
        oid = str(oid).strip() if oid is not None else ''
        if not oid:
            continue
        if not OID_RE.match(oid):
            sys.exit(f'{BG_SHEET} A{r} is {oid!r}, not an Output ID — refusing to '
                     'report on a sheet with an unexpected shape.')
        eid = str(bg.cell(row=r, column=B_EID).value or '').strip()
        ev = evalset.get(eid)
        if ev is None:
            sys.exit(f'{oid} points at {eid!r}, which is not in {ES_SHEET} — refusing.')
        if bg.cell(row=r, column=B_GRADE).value in (None, ''):
            ungraded += 1

        src = ev['sent']
        key = ev['key'] if ev['key'] != NO_CORRECTION else ''
        rewrite = parse_rewrite(bg.cell(row=r, column=B_FEEDBACK).value)
        if not rewrite:
            no_rewrite.append(oid)

        edits = target_edits(src, key) if key else []
        mask = preserved_mask(src, rewrite) if rewrite else [False] * len(src)
        verdicts, kept_by_edit = [], []
        if rewrite:
            for i1, i2, s_span, k_span in edits:
                v, kept = classify_edit(i1, i2, s_span, k_span, rewrite, mask)
                verdicts.append(v)
                kept_by_edit.append(kept)
        issues = parse_issues(bg.cell(row=r, column=B_FEEDBACK).value)
        unapplied = unapplied_issues(issues, rewrite) if rewrite else []
        subs = substitutions(src, key, rewrite) if rewrite and key else []
        extras = extra_edits(src, key, rewrite, edits) if rewrite else []
        names = kanjified_names(src, key, rewrite) if rewrite else []
        echoed = bool(rewrite) and rewrite == src

        # A PARTIAL that leaves a KANJI standing is the headline pattern: the
        # grammar was repaired and the wrong word was left in place.
        lex_miss = [(e, kept) for e, v, kept in zip(edits, verdicts, kept_by_edit)
                    if v in ('MISSED', 'PARTIAL') and lexical(''.join(kept))]

        flags = []
        if 'MISSED' in verdicts:
            flags.append('TARGET_MISSED')
        if 'PARTIAL' in verdicts:
            flags.append('TARGET_PARTIAL')
        if lex_miss:
            flags.append('LEXICAL_MISS')
        if subs:
            flags.append('SUBSTITUTION')
        if echoed and ev['status'] == 'ERROR':
            flags.append('ECHOED')
        if names:
            flags.append('NAME_KANJIFIED')
        if unapplied:
            flags.append('SELF_INCONSISTENT')
        if extras:
            flags.append('EXTRA_EDIT')

        results.append({
            'oid': oid, 'eid': eid, 'model': str(bg.cell(row=r, column=B_MODEL).value or ''),
            'tool_tier': str(bg.cell(row=r, column=B_TIER).value or ''),
            'grade': str(bg.cell(row=r, column=B_GRADE).value or ''),
            'status': ev['status'], 'keyok': ev['keyok'], 'amended': bool(ev['amend']),
            'src': src, 'key': key, 'rewrite': rewrite,
            'edits': edits, 'verdicts': verdicts, 'kept': kept_by_edit,
            'subs': subs, 'extras': extras, 'lex_miss': lex_miss,
            'issues': issues, 'unapplied': unapplied,
            'names': names, 'echoed': echoed, 'flags': flags,
        })

    if not results:
        sys.exit(f'No output rows read from {BG_SHEET} — refusing to report on nothing.')

    print(f'Scanned {len(results)} outputs in {path}.')
    if ungraded:
        print(f'⚠ {ungraded} of them are UNGRADED — the reviewer comparison below '
              'covers only what has been graded.')
    if no_rewrite:
        print(f'⚠ {len(no_rewrite)} row(s) carry no `Rewrite:` line: '
              + ', '.join(no_rewrite[:12]) + ('…' if len(no_rewrite) > 12 else ''))
        print('  Those rows cannot be scored here — a missing rewrite is a parse '
              'question, not a quality finding.')

    flagged = [x for x in results if set(x['flags']) & set(PRIMARY)]
    secondary_only = [x for x in results
                      if x['flags'] and not set(x['flags']) & set(PRIMARY)]

    # ── per-row detail ────────────────────────────────────────────────────────
    if not quiet:
        show = results if show_all else (flagged + secondary_only)
        print()
        print('─' * 78)
        print(f'{len(flagged)} output(s) on a PRIMARY signal, plus '
              f'{len(secondary_only)} on a secondary signal only.')
        print('Read them — the check is character-based and coarse by design.')
        print('─' * 78)
        for x in sorted(show, key=lambda x: x['oid']):
            prim = [f for f in x['flags'] if f in PRIMARY]
            sec = [f for f in x['flags'] if f in SECONDARY]
            label = ', '.join(prim) or 'clean'
            if sec:
                label += f"  (secondary: {', '.join(sec)})"
            head = (f"\n■ {x['oid']}  {x['eid']}  {x['model']}  tool={x['tool_tier']}  "
                    f"graded={x['grade'] or '—'}  [{label}]")
            if x['amended']:
                head += f"  ⚠ key amended ({x['keyok']}) — reference pair is confounded"
            print(head)
            print(f"    文       {x['src']}")
            print(f"    key      {x['key'] or '— (CORRECT row, no correction expected)'}")
            print(f"    rewrite  {x['rewrite'] or '(none parsed)'}")
            for (_i1, _i2, s_span, k_span), v, kept in zip(x['edits'], x['verdicts'],
                                                           x['kept']):
                mark = {'APPLIED': '✓', 'MISSED': '✗', 'PARTIAL': '◐', 'DIVERGED': '~'}[v]
                line = f"      {mark} {v:<9} key edit  {s_span or '∅'} → {k_span or '∅'}"
                if kept:
                    line += f"   left standing: {''.join(kept)}"
                    if lexical(''.join(kept)):
                        line += '  ← LEXICAL'
                print(line)
            for s_span, r_span, alien in x['subs']:
                print(f"      ⚠ SUBST     {s_span} → {r_span}   "
                      f"({alien} is in neither 文 nor key)")
            for s_span, r_span in x['names']:
                print(f"      ⚠ NAME      {s_span} → {r_span}  (key left {s_span} alone)")
            for tier, before, after in x['unapplied']:
                print(f"      ⚠ SELF      tool said [{tier}] {before} → {after}, "
                      f"then did not do it in its own rewrite")
            for s_span, r_span in x['extras']:
                print(f"      ⚠ EXTRA     {s_span} → {r_span}  (the key left this alone)")
            if x['echoed']:
                print(f"      ⚠ ECHOED    rewrite is the source verbatim"
                      + (' on an ERROR row' if x['status'] == 'ERROR' else ''))

    # ── aggregates ────────────────────────────────────────────────────────────
    print()
    print('═' * 78)
    print('PER MODEL')
    print('═' * 78)
    models = sorted({x['model'] for x in results if x['model']})
    SIGNALS = PRIMARY + SECONDARY
    print(f"{'':<5}{'n':>4}{'flagged':>8}" + ''.join(f'{s[:9]:>11}' for s in SIGNALS)
          + f"{'key edits applied':>21}")
    for m in models:
        rows = [x for x in results if x['model'] == m]
        ap = sum(x['verdicts'].count('APPLIED') for x in rows)
        tot = sum(len(x['verdicts']) for x in rows)
        print(f"{m:<5}{len(rows):>4}"
              f"{sum(1 for x in rows if set(x['flags']) & set(PRIMARY)):>8}"
              + ''.join(f"{sum(1 for x in rows if s in x['flags']):>11}" for s in SIGNALS)
              + f"{ap:>14}/{tot:<6}")

    print()
    print('BY TOOL TIER — where the damage sits')
    tiers = defaultdict(lambda: [0, 0])
    for x in results:
        tiers[x['tool_tier']][0] += 1
        tiers[x['tool_tier']][1] += bool(set(x['flags']) & set(PRIMARY))
    for t, (n, f) in sorted(tiers.items(), key=lambda kv: -kv[1][1]):
        print(f"  {t or '(blank)':<15} {f:>3} of {n:<4} flagged")

    # ── validation against the reviewer ───────────────────────────────────────
    print()
    print('═' * 78)
    print('AGREEMENT WITH THE REVIEWER — the headline number')
    print('═' * 78)
    sibling = path.parent / 'check-unnatural-rewrite.py'
    if not sibling.exists():
        sibling = Path('check-unnatural-rewrite.py')
    mod, err = reviewer_flagged(sibling)
    if mod is None:
        print(f'  ⚠ could not load {sibling} ({err}).')
        print('    NO BASELINE — this run reports its own flags and nothing else.')
        print('    That is a refusal, not a pass: the validation is the point.')
    else:
        theirs = set()
        for r in range(BG_FIRST, bg.max_row + 1):
            oid = bg.cell(row=r, column=B_OID).value
            oid = str(oid).strip() if oid is not None else ''
            if not OID_RE.match(oid):
                continue
            grade = bg.cell(row=r, column=B_GRADE).value
            cat, _d, _t = mod.classify(mod.clean_comment(bg.cell(row=r, column=B_COMMENT).value))
            if cat and not (cat == getattr(mod, 'KEY_ASSERT_ONLY_ON_PARTIAL', None)
                            and grade != '部分一致'):
                theirs.add(oid)
        mine = {x['oid'] for x in flagged}
        both, only_m, only_t = mine & theirs, mine - theirs, theirs - mine
        n = len(results)
        agree = n - len(only_m) - len(only_t)
        prec = len(both) / len(mine) if mine else 0.0
        rec = len(both) / len(theirs) if theirs else 0.0
        print(f'  Reviewer-derived positives (check-unnatural-rewrite.py): {len(theirs)}')
        print(f'  This script flags:                                      {len(mine)}')
        print(f'  Both:  {len(both):>3}   only this script: {len(only_m):>3}   '
              f'only reviewer: {len(only_t):>3}')
        print(f'  Row-level agreement: {agree}/{n} = {agree / n:.0%}   '
              f'precision {prec:.0%}   recall {rec:.0%}')

        print()
        print('  PER SIGNAL, against the same 23. Base rate is '
              f'{len(theirs)}/{n} = {len(theirs) / n:.0%}; a signal earns a place in')
        print('  the headline set at twice that. * marks the primary ones.')
        print(f"    {'signal':<16}{'fires':>6}{'hits':>6}{'prec':>7}{'recall':>8}")
        for s in SIGNALS:
            fires = {x['oid'] for x in results if s in x['flags']}
            hit = fires & theirs
            p = len(hit) / len(fires) if fires else 0.0
            rc = len(hit) / len(theirs) if theirs else 0.0
            print(f'   {"*" if s in PRIMARY else " "}{s:<16}'
                  f'{len(fires):>6}{len(hit):>6}{p:>6.0%}{rc:>8.0%}')
        if only_t:
            print(f'\n  MISSED by this script ({len(only_t)}) — the rows that decide '
                  'whether it measures what she measured:')
            for oid in sorted(only_t):
                x = next(y for y in results if y['oid'] == oid)
                sec = [f for f in x['flags'] if f in SECONDARY]
                if sec:
                    why = f'  ← caught by secondary: {", ".join(sec)}'
                elif x['key'] and x['rewrite'] == x['key']:
                    why = ('  ← rewrite MATCHES the key exactly; not reachable '
                           'from a reference pair')
                elif not x['key']:
                    why = '  ← CORRECT row: no key to compare a rewrite against'
                else:
                    why = '  ← no signal fired'
                print(f'    {oid}  {x["eid"]}  {x["model"]}  tool={x["tool_tier"]}  '
                      f'graded={x["grade"]}{why}')
        if only_m:
            print(f'\n  Flagged here but NOT by the reviewer ({len(only_m)}) — either a '
                  'false positive or a fault she had no box for:')
            for oid in sorted(only_m):
                x = next(y for y in results if y['oid'] == oid)
                print(f'    {oid}  {x["eid"]}  {x["model"]}  '
                      f'[{", ".join(f for f in x["flags"] if f in PRIMARY)}]  '
                      f'graded={x["grade"]}')

    # ── confound note ─────────────────────────────────────────────────────────
    amended = [x for x in results if x['amended']]
    if amended:
        print()
        print(f'⚠ {len(amended)} of {len(results)} outputs sit on a sentence whose KEY '
              'Tomoko amended.')
        print('  On those rows column H is Lloyd\'s expected correction, not the '
              'reviewer-verified one,')
        print('  so a TARGET_MISSED there may be the tool disagreeing with a key that '
              'later moved.')
        af = sum(1 for x in amended if set(x['flags']) & set(PRIMARY))
        cl = [x for x in results if not x['amended']]
        cf = sum(1 for x in cl if set(x['flags']) & set(PRIMARY))
        print(f'  flagged on amended-key rows: {af}/{len(amended)} = '
              f'{af / len(amended):.0%}')
        print(f'  flagged on clean-key rows:   {cf}/{len(cl)} = {cf / len(cl):.0%}')

    print()
    print('NOTHING WAS WRITTEN. This script never edits the workbook. Setting a '
          'verdict aside is an')
    print('adjudication and belongs in Eval Set col L with a date and a name, the '
          'way E09 was.')
    return 1 if flagged else 0


if __name__ == '__main__':
    sys.exit(main())
