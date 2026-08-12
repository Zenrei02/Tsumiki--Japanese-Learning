# -*- coding: utf-8 -*-
"""
Post-run check: has romaji leaked into the checker's feedback?

WHY THIS EXISTS INSTEAD OF EVAL ROWS
The tracker item "Romaji containment rule in generation prompt" says to add
romaji-leak cases to the eval. Eval rows turn out to be the wrong instrument:
the Blind Grading vocabulary is 一致 / 部分一致 / 見逃し / 誤指摘, none of which can
express "the explanation was correct but written in romaji". A reviewer grading
a leak row would grade the verdict, not the leak.

A post-run assertion is strictly better. It costs no reviewer time and it checks
ALL rows rather than two special ones — a leak can surface on any sentence.

WHAT COUNTS AS A LEAK
Checker feedback is written in English by design, so most Latin text is fine.
A leak is a JAPANESE word written in Latin letters: "use tabemasu here" rather
than "use 食べます here". Detection is therefore: tokens that decompose cleanly
into Japanese syllables, are long enough not to be noise, and are not ordinary
English or established loanwords.

This is a REPORTING aid, not a gate. It is tuned for recall; skim the hits.

USAGE
  python3 check-romaji-leak.py [workbook.xlsx]
Defaults to naoshi-eval-v1-with-outputs.xlsx (what bakeoff-harness.py produces).
Exits 1 if any candidate is found, so it can be wired into a run script.
"""
import re, sys
from pathlib import Path

import openpyxl

# OPTIONAL. Japanese words romanised sit low in English frequency (tomodachi 2.0,
# desu 2.3) while ordinary English sits high (seen 5.5, usage 4.2), so one lookup
# removes almost every false positive. Deliberately optional: RUNNING-THE-BAKEOFF
# tells Lloyd to install openpyxl and nothing else, and this must not change that.
#   pip3 install --break-system-packages wordfreq
try:
    from wordfreq import zipf_frequency
    HAVE_WORDFREQ = True
except ImportError:
    HAVE_WORDFREQ = False

ENGLISH_ZIPF = 3.0        # at or above this, treat the token as ordinary English

DEFAULT = 'naoshi-eval-v1-with-outputs.xlsx'
FEEDBACK_COL = 6          # F — ツールの指摘 / Tool feedback
OUTPUT_COL, EVAL_COL = 1, 2

# Japanese syllables, longest-first so "shi" wins over "s"+"hi".
SYL = sorted(
    [c + v for c in ['', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w',
                     'g', 'z', 'd', 'b', 'p', 'ky', 'sh', 'ch', 'ny', 'hy',
                     'my', 'ry', 'gy', 'j', 'by', 'py']
             for v in 'aiueo']
    + ['shi', 'chi', 'tsu', 'fu', 'ji', 'n', 'nn'],
    key=len, reverse=True)

# Ordinary English + established loanwords that happen to decompose.
STOP = {
    'a', 'i', 'no', 'so', 'to', 'on', 'an', 'in', 'at', 'it', 'is', 'as', 'he',
    'we', 'me', 'be', 'do', 'go', 'or', 'of', 'if', 'us', 'my', 'by', 'up',
    'the', 'this', 'that', 'than', 'then', 'there', 'these', 'those', 'they',
    'not', 'you', 'use', 'uses', 'used', 'user', 'one', 'two', 'ten', 'ton',
    'more', 'here', 'hare', 'note', 'none', 'name', 'same', 'some', 'time',
    'take', 'make', 'mode', 'made', 'mean', 'many', 'may', 'nice', 'name',
    'kanji', 'kana', 'hiragana', 'katakana', 'romaji', 'sushi', 'anime',
    'manga', 'samurai', 'tsunami', 'karaoke', 'sudoku', 'japanese', 'japan',
    'tokyo', 'kyoto', 'osaka', 'sensei', 'san', 'chan', 'kun',
    'na', 'ni', 'te', 'ta', 'ga', 'wa', 'ha', 'de', 'ka', 'mo', 'ne', 'yo',
}


def decomposes(word):
    """True if word is fully splittable into Japanese syllables."""
    if not word:
        return True
    for s in SYL:
        if word.startswith(s) and decomposes(word[len(s):]):
            return True
    return False


def candidates(text):
    hits = []
    for w in re.findall(r"[A-Za-z]+", text or ''):
        lw = w.lower()
        if len(lw) < 4 or lw in STOP:
            continue
        if re.search(r'[lqvxcf]', lw) and not re.search(r'ch|fu', lw):
            continue                      # letters romaji does not use
        if HAVE_WORDFREQ and zipf_frequency(lw, 'en') >= ENGLISH_ZIPF:
            continue                      # ordinary English, not a leak
        if decomposes(lw):
            hits.append(w)
    return hits


def main():
    path = Path(sys.argv[1] if len(sys.argv) > 1 else DEFAULT)
    if not path.exists():
        print(f"{path.name} not found — run the bake-off first "
              f"(bakeoff-harness.py --run --key-verified). Nothing to check yet.")
        return 0

    ws = openpyxl.load_workbook(path, data_only=True)['Blind Grading']
    found, scanned = [], 0
    for r in range(5, ws.max_row + 1):
        fb = ws.cell(r, FEEDBACK_COL).value
        if not fb:
            continue
        scanned += 1
        hits = candidates(str(fb))
        if hits:
            found.append((ws.cell(r, OUTPUT_COL).value,
                          ws.cell(r, EVAL_COL).value, hits, str(fb)))

    mode = ("English-frequency filter ON" if HAVE_WORDFREQ else
            "English-frequency filter OFF — expect false positives; "
            "pip3 install --break-system-packages wordfreq to sharpen it")
    print(f"Scanned {scanned} feedback cells in {path.name}.  [{mode}]")
    if not found:
        print("No romaji candidates. Containment rule holds for this run.")
        return 0

    print(f"\n{len(found)} row(s) with possible romaji — EYEBALL THESE, "
          f"the check is tuned for recall:\n")
    for oid, eid, hits, fb in found:
        print(f"  {oid} ({eid}): {', '.join(sorted(set(hits)))}")
        print(f"      {fb[:160]}{'…' if len(fb) > 160 else ''}")
    print("\nA confirmed leak is a SYSTEM_PROMPT bug, not a grading problem — "
          "the romaji containment rule is not being honoured. Do not fix it by "
          "editing outputs.")
    return 1


if __name__ == '__main__':
    sys.exit(main())
