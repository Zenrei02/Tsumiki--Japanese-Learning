#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
test-b11-roundtrip.py — can build-b11-forms.gs be trusted to be what was built?

Same shape as test-b10-roundtrip.py: the parser reads the ARTIFACT back and must
equal the rows in memory; and every refusal has a partner that must succeed. A
guard that has only ever refused has not been tested; a round trip that has only
ever passed has not been either.
Exit 0 = js/unjs are exact inverses, the parser reads good input, and the
blinding assertion refuses a smuggled O-id, a model code and a setting name.
"""
import importlib.util, pathlib, sys
HERE = pathlib.Path(__file__).parent
spec = importlib.util.spec_from_file_location("_b11", str(HERE / "build-b11-forms.py"))
b11 = importlib.util.module_from_spec(spec); spec.loader.exec_module(b11)

fails = []
def ok(label, cond):
    print(("ok    " if cond else "FAIL  ") + label)
    if not cond: fails.append(label)
def refuses(label, fn):
    try:
        fn(); ok(label, False)
    except SystemExit as e:
        ok(label + f"  [{str(e)[:60]}]", str(e).startswith("STOP"))

# 1. js/unjs exact inverses on hostile strings
for s in ["plain", "it's", "back\\slash", "line\nbreak", "「引用」と'quote'\\n", "", "末尾\\"]:
    ok(f"unjs(js(x)) == x for {s!r}", b11.unjs(b11.gf.js(s)) == s)

# 2. the emitted file decodes to the built rows
seq, records = b11.build_records()
gs = (HERE / "build-b11-forms.gs").read_text(encoding="utf-8")
back = b11.parse_gs_rows(gs)
ok("emitted .gs decodes to exactly the 50 built rows, in order", back == records)
ok("labels are B11-01 … B11-50 and no row carries an O-id",
   [r["oid"] for r in back] == [f"B11-{i:02d}" for i in range(1, 51)])
ok("25 rows in B11a, 25 in B11b", sum(r["batch"] == "B11a" for r in back) == 25 and sum(r["batch"] == "B11b" for r in back) == 25)
ok("the response sheet name is B11's own", "ブラインド採点 B11 responses" in gs and "(all batches)" not in gs)

# 3. refusal partners
refuses("a .gs with one row removed is refused", lambda: b11.assert_blind(gs.replace("  { oid: 'B11-07'", "//", 1)))
refuses("a smuggled O-id is refused", lambda: b11.assert_blind(gs.replace("B11-07", "O017", 1)))
refuses("a model code is refused", lambda: b11.assert_blind(gs.replace("B11a", "M2", 1)))
refuses("a setting name is refused", lambda: b11.assert_blind(gs + "\n// lowthink\n"))
refuses("a corrupted DATA line is refused by the parser", lambda: b11.parse_gs_rows(gs.replace("level: 'N", "level: N", 1)))
ok("the untouched file still passes the assertion (control for the refusals)", b11.assert_blind(gs) is None)

print(("\n%d FAILED" % len(fails)) if fails else "\nALL PASSED")
sys.exit(1 if fails else 0)
