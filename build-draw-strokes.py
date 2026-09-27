#!/usr/bin/env python3
"""
build-draw-strokes.py — the stroke table behind the dictionary's draw-a-kanji.

WHAT IT MAKES
    tsumiki-app/public/draw/strokes-joyo-v1.json: {"遊": ["M42.71,11.28c…", …], …}
    for the 2,136 jōyō kanji (KANJIDIC2 grades 1–6 and 8, from
    freq-data/kanjidic-misc.json), stroke paths in KanjiVG order, 109×109 box.

WHY A SEPARATE FILE
    The app's own stroke registry (lib/strokeData.js) ships only what the
    lessons teach — a few hundred characters. A dictionary has to recognise
    kanji the learner has NOT been taught yet; that is when they need to look
    one up. So the full set lives in public/ and is fetched only when the
    drawing pad is opened, never on the way into the app.

WHERE THE DATA COMES FROM
    KanjiVG (Ulrich Apel), CC BY-SA 3.0 — the licence the modules already
    credit — via the npm package @madcat/kanjivg 2.0.2, whose dist/min/main
    holds one minified SVG per character. (5.x dropped the paths and keeps only
    stroke start points; 2.0.2 is the last version with the paths.) The npm
    registry is reachable from the sandbox where GitHub raw is not:

        curl -sS -o /tmp/kvg2.tgz https://registry.npmjs.org/@madcat/kanjivg/-/kanjivg-2.0.2.tgz
        python3 build-draw-strokes.py /tmp/kvg2.tgz
"""
import json, pathlib, re, sys, tarfile

HERE = pathlib.Path(__file__).parent
OUT = HERE / "tsumiki-app/public/draw/strokes-joyo-v1.json"

def main(tgz):
    chars = json.loads((HERE / "freq-data/kanjidic-misc.json").read_text(encoding="utf-8"))["chars"]
    joyo = sorted(c for c, v in chars.items() if v.get("grade") in (1, 2, 3, 4, 5, 6, 8))
    want = {f"package/dist/min/main/{ord(c):05x}.svg": c for c in joyo}
    table, missing = {}, []
    with tarfile.open(tgz) as t:
        for m in t.getmembers():
            c = want.get(m.name)
            if not c: continue
            svg = t.extractfile(m).read().decode("utf-8")
            paths = re.findall(r'<path d="([^"]+)"', svg)
            if paths: table[c] = paths
    missing = [c for c in joyo if c not in table]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "source": "KanjiVG (Ulrich Apel), CC BY-SA 3.0 — http://kanjivg.tagaini.net — via @madcat/kanjivg 2.0.2",
        "count": len(table), "strokes": table,
    }, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"jōyō: {len(joyo)}  written: {len(table)}  missing: {len(missing)} {''.join(missing[:20])}")
    print(f"{OUT.relative_to(HERE)}: {OUT.stat().st_size:,} bytes")
    if len(joyo) != 2136: print("⚠️ expected 2,136 jōyō kanji — check the grade field")
    if missing: sys.exit(1)

if __name__ == "__main__":
    main(sys.argv[1])
