#!/usr/bin/env python3
"""Regression test for the order-v1 → order-v2 kanji progress migration.

Extracts MODULES and migrateProgressV2 from kanji-module.jsx AT RUN TIME (so it
always tests the shipped code, never a copy) and runs fixture assertions in
node. Written Session 10, alongside the migration itself. The harness was
proven able to fail before its first green run, per standing practice.

Exit 0 = all assertions pass.
"""
import re, subprocess, sys, pathlib, tempfile, os

HERE = pathlib.Path(__file__).parent
src = (HERE / "kanji-module.jsx").read_text(encoding="utf-8")
mod = src[src.index("const MODULES = ["):src.index("\n];", src.index("const MODULES = [")) + 3]
mig = src[src.index("const DEAD_IDS_V1"):src.index("\nconst GROUPS")]
asserts = (HERE / "test-progress-migration.fixtures.mjs").read_text(encoding="utf-8")

with tempfile.NamedTemporaryFile("w", suffix=".mjs", delete=False, dir=tempfile.gettempdir()) as f:
    f.write(mod + "\n" + mig + "\n" + asserts)
    path = f.name
try:
    r = subprocess.run(["node", path], capture_output=True, text=True)
    sys.stdout.write(r.stdout); sys.stderr.write(r.stderr)
    sys.exit(r.returncode)
finally:
    os.unlink(path)
