#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Regression test for romaji input in dictionary-module.jsx.

WHAT IT GUARDS. The dictionary takes wapuro romaji so that a learner who cannot
yet read kana can still look a word up — being unable to look a word up is where
people stop. The property under test is that the converter behaves like the IME
the learner already has on their phone: both romanisations of the same sound
agree (shi/si, tsu/tu, fu/hu, ji/zi, cha/tya), a doubled consonant is っ, and ん
takes the three-way rule that makes `nya` にゃ, `hona` ほな and `hon` ほん.

IT ALSO GUARDS THE OTHER DIRECTION, which is the half that will actually break:
English queries must NOT be swallowed as romaji. "strength" and "rhythm" stop
the converter dead, and romajiSearchable() reads the leftover tail to tell the
two apart. Loosen that predicate and every English search starts returning kana
noise; these assertions are what says so.

NO ROMAJI IS DISPLAYED BY ANY OF THIS. Romaji is an input path only — the rule
in dictionary-drawer-design-v1.md is about what the app writes, and
input-romaji-layer-spec-v1.md draws the same line ("the banned thing is
transliteration, not translation"). check-romaji-leak.py reads the eval
workbook, not this module, so the two do not overlap.

HOW IT AVOIDS TESTING A COPY. The romaji section is sliced out of
dictionary-module.jsx AT RUN TIME, between two landmarks, and prepended to the
fixtures — same approach as test-weekly-window.py and test-progress-sync.py.

PROVEN ABLE TO FAIL BEFORE ITS FIRST GREEN RUN, per standing practice — and it
earned its keep before that: the first run was RED, catching a real bug in the
ん lookahead that turned こんにちわ into こんいちわ.

THREE CONTROLS RUN Sep 23 2026, each failing for its own reason and green again
on revert:
  1. ん made to consume both n's unconditionally — the bug above. 2 red
     (nn is ん, shinnya).
  2. A live table entry broken, `tsu:"つ"` -> `tsu:"す"`. 2 red (tsukue,
     tsu/tu agree).
  3. romajiSearchable() loosened to `kana.length > 0` — the English-swallowing
     failure. 3 red (english, monster, handle). Not `printer` or `strength`:
     those convert to nothing at all, so they survive a loosened predicate.
     The words that catch it are the ones that convert PART way, which is why
     the list includes them.

A CONTROL THAT WOULD HAVE PROVED NOTHING, recorded because it was the obvious
one to reach for: changing `nn:"ん"` in RK. After the lookahead fix that entry
is unreachable — `nn` never reaches the table — so editing it produces a green
run. It has been removed from RK for exactly that reason. Control 2 edits an
entry that is actually consulted.

THE LANDMARKS CARRY NO VALUE UNDER TEST — they are the section's own comment
rules, so editing the table cannot break the extraction and disguise a failure
as an exit 2. That mistake is recorded in test-weekly-window.py.

Exit 0 = all assertions pass. Exit 1 = red. Exit 2 = landmarks not found.
"""
import pathlib
import subprocess
import sys
import tempfile

HERE = pathlib.Path(__file__).parent
SRC = HERE / "dictionary-module.jsx"
FIXTURES = HERE / "test-romaji-search.fixtures.mjs"

START = "// ————— Romaji input (Session 35) —————"
END = "// ————— end romaji input —————"


def slice_source() -> str:
    src = SRC.read_text(encoding="utf-8")
    a = src.find(START)
    b = src.find(END)
    if a < 0 or b < 0 or b <= a:
        print(f"could not find the landmarks in {SRC.name}", file=sys.stderr)
        print(f"  start {'found' if a >= 0 else 'MISSING'} / end {'found' if b >= 0 else 'MISSING'}",
              file=sys.stderr)
        sys.exit(2)
    return src[a:b]


def main() -> int:
    section = slice_source()
    if "function romajiToKana" not in section or "function romajiSearchable" not in section:
        print("the sliced section no longer contains both functions under test", file=sys.stderr)
        return 2
    bundle = section + "\n" + FIXTURES.read_text(encoding="utf-8")
    with tempfile.NamedTemporaryFile("w", suffix=".mjs", delete=False, encoding="utf-8") as fh:
        fh.write(bundle)
        path = fh.name
    try:
        r = subprocess.run([sys.executable and "node", path], capture_output=True, text=True)
        sys.stdout.write(r.stdout)
        sys.stderr.write(r.stderr)
        return r.returncode
    finally:
        pathlib.Path(path).unlink(missing_ok=True)


if __name__ == "__main__":
    sys.exit(main())
