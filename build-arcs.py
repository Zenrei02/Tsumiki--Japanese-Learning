#!/usr/bin/env python3
"""Splice lesson-arcs-v1.json into grammar-module.jsx as the ARCS object.

The module is a single-file artifact and cannot import data, so the arcs are
generated into it between // @@ARCS-START and // @@ARCS-END — the same pattern
build-vocab-data.py uses for the word table and author-deep-content.py uses for
DEEP. The JSON stays the source of truth; the block in the module is derived and
must never be hand-edited. Re-running is idempotent: same JSON in, byte-identical
block out, and the module is only rewritten when something actually changed.

WHAT IS EMITTED, AND WHAT IS NOT. Only the fields that render: the setting's
scene/jp/en/pattern and, per extension, kind/wr/t/scene/jp/en. `claims`,
`sources`, `flags` and `review` are the reviewer's unit and must never reach the
UI, so they are dropped here rather than filtered at render time. `step` is
dropped too — the module already knows which step a point sits in.

A wrinkle extension carries NO teaching text: `t` lives in DEEP[point].wr[i] and
is read from there at render time. This is the one rule worth restating, because
copying it would recreate exactly the side-file drift this folder has been burned
by twice. `wr` here is an index into that array and nothing more, so this script
verifies every index resolves against the module's own DEEP before writing —
a stale index would otherwise render a blank page instead of failing.

check-arcs.py is the full gate (word counts, register, kanji coverage, claims).
Run it before and after this.

    python3 build-arcs.py            # splice, report what changed
    python3 build-arcs.py --check    # exit 1 if the module is out of date
"""
import json, pathlib, re, sys

HERE = pathlib.Path(__file__).parent
JSON_PATH = HERE / "lesson-arcs-v1.json"
MODULE = HERE / "grammar-module.jsx"
START = "  // @@ARCS-START"
END = "  // @@ARCS-END"

# Fields carried into the module, in render order. Anything not listed is the
# reviewer's and stays in the JSON.
SETTING_KEYS = ("scene", "jp", "en", "pattern")
EXT_KEYS = ("kind", "wr", "t", "scene", "jp", "en")


def load_deep(src):
    """DEEP, parsed out of the module itself — same reader as check-arcs.py.

    Read from the module rather than any side copy: the wr indices are only
    meaningful against the array the app will actually render.
    """
    i = src.index("{", src.index("const DEEP = "))
    depth, j, instr, esc = 0, i, False, False
    while j < len(src):
        c = src[j]
        if instr:
            if esc: esc = False
            elif c == "\\": esc = True
            elif c == '"': instr = False
        else:
            if c == '"': instr = True
            elif c == "{": depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0: break
        j += 1
    body = "\n".join(l for l in src[i:j + 1].split("\n") if not l.lstrip().startswith("//"))
    return json.loads(re.sub(r",(\s*[}\]])", r"\1", body))


def build_block(items, deep, module_points):
    """One line per point, in the JSON's own order (which follows the syllabus)."""
    problems, lines = [], []
    for it in items:
        pid = it["point"]
        if pid not in module_points:
            problems.append(f"{pid}: not a point id in grammar-module.jsx")
        wr_avail = (deep.get(pid) or {}).get("wr") or []

        st = it["setting"]
        setting = {k: st[k] for k in SETTING_KEYS if st.get(k) is not None}
        if not setting.get("jp"):
            problems.append(f"{pid}: setting has no Japanese line")
        if setting.get("pattern") and setting["pattern"] not in setting["jp"]:
            problems.append(f"{pid}: setting pattern {setting['pattern']!r} is not in its own line")

        exts = []
        for n, e in enumerate(it["extensions"]):
            if e["kind"] == "wrinkle":
                idx = e.get("wr")
                if idx is None or idx >= len(wr_avail):
                    problems.append(
                        f"{pid}.ext{n}: wr index {idx!r} does not resolve — "
                        f"DEEP[{pid!r}].wr has {len(wr_avail)} entry(ies). "
                        f"Fix the JSON, not the module.")
                elif not (wr_avail[idx] or {}).get("t"):
                    problems.append(f"{pid}.ext{n}: DEEP wrinkle {idx} has no teaching text `t`")
            elif e["kind"] == "extra" and not e.get("t"):
                problems.append(f"{pid}.ext{n}: kind 'extra' must carry its own `t`")
            exts.append({k: e[k] for k in EXT_KEYS if e.get(k) is not None})
        if not exts:
            problems.append(f"{pid}: no extensions")

        entry = {"setting": setting, "extensions": exts}
        lines.append("  " + json.dumps(pid, ensure_ascii=False) + ": "
                     + json.dumps(entry, ensure_ascii=False) + ",")
    return lines, problems


def main():
    check_only = "--check" in sys.argv
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    items = data["items"]
    src = MODULE.read_text(encoding="utf-8")

    lines = src.split("\n")
    try:
        a = lines.index(START)
        b = lines.index(END)
    except ValueError:
        sys.exit(f"FAIL: {START.strip()} / {END.strip()} markers not found in {MODULE.name}. "
                 "Add them around an empty `const ARCS = {…};` first.")
    if b < a:
        sys.exit("FAIL: ARCS end marker precedes the start marker")

    deep = load_deep(src)
    module_points = set(re.findall(r'id: "([a-z0-9-]+)", jp: "', src))

    block, problems = build_block(items, deep, module_points)
    if problems:
        print(f"FAIL: {len(problems)} problem(s) — nothing written")
        for p in problems: print("  -", p)
        sys.exit(1)

    out = "\n".join(lines[:a + 1] + block + lines[b:])
    changed = out != src
    pages = len(items) + sum(len(it["extensions"]) for it in items)
    where = f"{len(items)} arcs, {pages} pages, {len(block)} lines, {len(out) - len(src) + 0:+d} bytes"

    if check_only:
        print(("STALE: " if changed else "up to date: ") + where)
        sys.exit(1 if changed else 0)
    if not changed:
        print(f"unchanged — {where.split(',')[0]}, {pages} pages already spliced (idempotent)")
        return
    MODULE.write_text(out, encoding="utf-8")
    print(f"wrote {MODULE.name}: {where}")
    print("  next: python3 build-vite-app.py   (regenerates tsumiki-app/src/modules/Grammar.jsx)")


if __name__ == "__main__":
    main()
