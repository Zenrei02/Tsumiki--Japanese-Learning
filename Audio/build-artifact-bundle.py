#!/usr/bin/env python3
"""
build-artifact-bundle.py — pack a kana module into one self-contained .jsx with
its audio embedded, for publishing as a shareable artifact.

An artifact is a single file: there is no second file to fetch, so the sprite
has to travel inside the module. This script builds a sprite containing only
the sounds that module can actually request, base64s it, and substitutes the
SPRITE_INLINE constant. The module source is not modified — the bundle is
written alongside it — so the app build keeps fetching the sprite normally and
the two never drift apart.

USAGE
    python3 build-artifact-bundle.py                       # both modules, 96k
    python3 build-artifact-bundle.py --bitrate 64k
    python3 build-artifact-bundle.py --module hiragana-module.jsx

OUTPUT
    <module>-artifact.jsx    self-contained, ready to paste as an artifact

BITRATE
    96k is what the app ships and what the voice contributor should be shown —
    a demo at a lower rate misrepresents her recording. Drop to 64k only if the
    bundle is too large to publish. Below 64k the fricatives go first: し, つ
    and ふ carry their identity in 4-8 kHz noise, which is exactly what a low
    bitrate discards, and those are sounds learners copy.

REQUIRES ffmpeg + ffprobe on PATH.
"""

import argparse
import base64
import json
import os
import re
import subprocess
import sys
import tempfile

GAP = 0.15
LEAD = 0.25
SAMPLE_RATE = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(HERE)


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def duration(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", path])
    return float(r.stdout.strip())


def sounds_used_by(module_src):
    """Every sound the module's UI can ask for, minus the ones with no sound.

    Read out of the module rather than hardcoded, so adding a row or a lesson
    to a module automatically widens its bundle instead of silently shipping a
    sprite with a hole in it.
    """
    s = set()
    # Chart rows and lesson headings.
    for block in re.findall(r'sounds:\s*\[([^\]]*)\]', module_src):
        s |= {t.strip().strip('"') for t in block.split(",") if t.strip().strip('"')}
    # Dakuten, handakuten, ん, and the small kana.
    extra = re.search(r'const EXTRA_SOUND = \{(.*?)\};', module_src, re.S)
    if extra:
        s |= {m.group(1) for m in re.finditer(r':\s*"([^"]+)"', extra.group(1))}
    # The yōon chart, whose rows carry their romaji in a trailing array rather
    # than under a `sounds:` key. Missing this shipped a bundle 33 clips short
    # while every check still passed, because the sounds were unreachable in
    # the UI at the same time. Any new table of playable sounds needs adding
    # here too — the coverage report below is what catches it.
    youon = re.search(r'const YOUON = \[(.*?)\n\];', module_src, re.S)
    if youon:
        for row in re.findall(r'\[\s*"[^"]+",\s*\[[^\]]*\],\s*\[([^\]]*)\]\s*\]',
                              youon.group(1)):
            s |= {t.strip().strip('"') for t in row.split(",") if t.strip().strip('"')}
    # Second readings shown and played alongside the main one — currently just
    # を, which is typed wo and read o. Third place playable sounds have lived,
    # and the second time this function was the thing that had to change. If a
    # fourth appears, add it here; the unused-clip count is what will tell you.
    alt = re.search(r'const ALT_SOUND = \{(.*?)\};', module_src, re.S)
    if alt:
        s |= {m.group(1) for m in re.finditer(r':\s*"([^"]+)"', alt.group(1))}
    return {x for x in s
            if x and x != "?" and x != "long vowel" and not x.startswith("small ")}


def build_sprite(kana_dir, keys_wanted, bitrate, workdir):
    with open(os.path.join(kana_dir, "manifest.json")) as f:
        doc = json.load(f)

    chosen, offset, seen = [], LEAD, set()
    for c in doc["clips"]:
        key = c["display"]
        if key not in keys_wanted or key in seen:
            continue
        src = os.path.join(kana_dir, c["master"]["path"])
        if not os.path.isfile(src):
            sys.exit(f"error: manifest lists {src} but it is not on disk")
        seen.add(key)
        d = duration(src)
        chosen.append({"key": key, "src": src, "offset": round(offset, 4),
                       "duration": round(d, 4)})
        offset += d + GAP

    missing = sorted(keys_wanted - seen)

    bed = os.path.join(workdir, "bed.wav")
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "lavfi",
         "-i", f"anullsrc=r={SAMPLE_RATE}:cl=mono", "-t", f"{offset:.4f}",
         "-c:a", "pcm_s16le", bed])

    cmd = ["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", bed]
    for e in chosen:
        cmd += ["-i", e["src"]]
    parts, mixin = [], ["[0:a]"]
    for i, e in enumerate(chosen, start=1):
        ms = int(round(e["offset"] * 1000))
        parts.append(f"[{i}:a]aformat=sample_fmts=s16:sample_rates={SAMPLE_RATE}"
                     f":channel_layouts=mono,adelay={ms}|{ms}[d{i}]")
        mixin.append(f"[d{i}]")
    graph = ";".join(parts) + ";" + "".join(mixin) + \
            f"amix=inputs={len(chosen) + 1}:normalize=0:duration=first[out]"
    wav = os.path.join(workdir, "sprite.wav")
    r = run(cmd + ["-filter_complex", graph, "-map", "[out]", "-ac", "1",
                   "-ar", str(SAMPLE_RATE), "-c:a", "pcm_s16le", wav])
    if r.returncode != 0:
        sys.exit(f"error: sprite assembly failed\n{r.stderr[-1500:]}")

    mp3 = os.path.join(workdir, "sprite.mp3")
    r = run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", wav,
             "-c:a", "libmp3lame", "-b:a", bitrate, "-write_xing", "1", mp3])
    if r.returncode != 0:
        sys.exit(f"error: sprite encode failed\n{r.stderr[-1500:]}")

    return chosen, mp3, missing


def bundle(module_path, kana_dir, bitrate):
    name = os.path.basename(module_path)
    src = open(module_path, encoding="utf-8").read()

    if "const SPRITE_INLINE = null;" not in src:
        sys.exit(f"error: {name} has no SPRITE_INLINE hook to substitute — "
                 f"expected the line 'const SPRITE_INLINE = null;'")

    wanted = sounds_used_by(src)
    with tempfile.TemporaryDirectory(prefix="kana-bundle-") as tmp:
        chosen, mp3, missing = build_sprite(kana_dir, wanted, bitrate, tmp)
        raw = open(mp3, "rb").read()

    payload = {
        "clips": {e["key"]: [e["offset"], e["duration"]] for e in chosen},
        "mp3": base64.b64encode(raw).decode("ascii"),
    }
    # separators kills the whitespace json.dumps would otherwise add to a
    # ~650 KB string literal for no benefit.
    line = "const SPRITE_INLINE = " + json.dumps(payload, separators=(",", ":")) + ";"
    out_src = src.replace("const SPRITE_INLINE = null;", line, 1)

    out_path = os.path.join(os.path.dirname(module_path),
                            name.replace(".jsx", "-artifact.jsx"))
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(out_src)

    print(f"{name}")
    print(f"   sounds needed : {len(wanted)}")
    print(f"   embedded      : {len(chosen)} clips, {bitrate}, {len(raw) // 1024} KB "
          f"-> {len(payload['mp3']) // 1024} KB base64")
    if missing:
        print(f"   NO RECORDING  : {', '.join(missing)}  (falls back to speech synthesis)")
    print(f"   bundle        : {os.path.basename(out_path)}  "
          f"{os.path.getsize(out_path) // 1024} KB "
          f"(source was {os.path.getsize(module_path) // 1024} KB)")
    return out_path


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--module", action="append",
                    help="module to bundle (default: both kana modules)")
    ap.add_argument("--kana-dir", default=os.path.join(HERE, "Kana"))
    ap.add_argument("--bitrate", default="96k")
    args = ap.parse_args()

    mods = args.module or [os.path.join(PROJECT, "hiragana-module.jsx"),
                           os.path.join(PROJECT, "katakana-module.jsx")]
    for m in mods:
        if not os.path.isfile(m):
            sys.exit(f"error: no such module: {m}")
        bundle(m, args.kana_dir, args.bitrate)


if __name__ == "__main__":
    main()
