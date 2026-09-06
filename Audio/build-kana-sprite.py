#!/usr/bin/env python3
"""
build-kana-sprite.py — pack every cut kana clip into one MP3 sprite plus an
offset table, so a module fetches one file instead of 107.

WHY THIS IS A SEPARATE SCRIPT
    split-kana-audio.py runs once per recording. The sprite is a property of
    the whole set — it has to be rebuilt from all 107 clips whenever any batch
    changes. Folding it into the splitter would either rebuild it three times
    during a full re-cut or need a separate invocation anyway, so it lives here
    and reads the splitter's manifest as its input.

    Run it after any split. It is cheap and idempotent.

USAGE
    python3 build-kana-sprite.py                    # reads ../Audio/Kana
    python3 build-kana-sprite.py --kana-dir Kana --outdir Kana/sprite
    python3 build-kana-sprite.py --verify           # rebuild, then check offsets

OUTPUT
    <outdir>/kana-sprite.mp3    all clips, in manifest order, gap-separated
    <outdir>/kana-sprite.json   { key: [offset_s, duration_s] } + metadata

KEYING
    Keyed by DISPLAY sound, not by filename. ぢ and じ are homophones, so both
    map to the same audio; the UI asks for "ji" and never needs to know that
    dji.wav exists. Where two filename keys share a display key the first in
    manifest order wins and the duplicate is skipped — they are the same sound.

WHY MASTERS, NOT THE DELIVERY MP3s
    Concatenating already-encoded MP3s splices encoder padding into the middle
    of the stream and smears clip boundaries. The sprite is built from the WAV
    masters and encoded exactly once, which is also why the masters exist.

REQUIRES ffmpeg + ffprobe on PATH.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile

# Silence inserted between clips. Wide enough that the ~26 ms of encoder delay
# LAME adds at the head of the stream can never bleed one clip into the next,
# and wide enough to absorb seek imprecision if a caller ever plays the sprite
# through an <audio> element instead of the Web Audio path.
GAP = 0.15
LEAD = 0.25          # silence before the first clip, same reasoning
MP3_BITRATE = "96k"
SAMPLE_RATE = 44100


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def duration(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", path])
    return float(r.stdout.strip())


def levels(path, start=None, length=None):
    cmd = ["ffmpeg", "-nostdin", "-hide_banner"]
    if start is not None:
        cmd += ["-ss", f"{start:.4f}"]
    if length is not None:
        cmd += ["-t", f"{length:.4f}"]
    cmd += ["-i", path, "-af", "volumedetect", "-f", "null", os.devnull]
    err = run(cmd).stderr
    mean = re.search(r"mean_volume:\s*(-?[\d.]+)", err)
    peak = re.search(r"max_volume:\s*(-?[\d.]+)", err)
    if not mean or not peak:
        return None, None
    return float(mean.group(1)), float(peak.group(1))


def build(kana_dir, outdir):
    manifest = os.path.join(kana_dir, "manifest.json")
    if not os.path.isfile(manifest):
        sys.exit(f"error: no manifest at {manifest} — run split-kana-audio.py first")
    with open(manifest) as f:
        doc = json.load(f)

    entries, skipped, offset = [], [], LEAD
    seen = set()
    for c in doc["clips"]:
        key = c["display"]
        src = os.path.join(kana_dir, c["master"]["path"])
        if not os.path.isfile(src):
            sys.exit(f"error: manifest lists {src} but it is not on disk")
        if key in seen:
            skipped.append((c["romaji"], key))
            continue
        seen.add(key)
        d = duration(src)
        entries.append({"key": key, "src": src, "offset": round(offset, 4),
                        "duration": round(d, 4)})
        offset += d + GAP

    total = offset
    os.makedirs(outdir, exist_ok=True)

    # Lay the clips onto one silent bed with adelay, rather than concat +
    # silence files: one filter graph, one decode of each master, and the
    # offsets are stated rather than accumulated so they cannot drift.
    with tempfile.TemporaryDirectory(prefix="kana-sprite-") as tmp:
        bed = os.path.join(tmp, "bed.wav")
        run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "lavfi",
             "-i", f"anullsrc=r={SAMPLE_RATE}:cl=mono", "-t", f"{total:.4f}",
             "-c:a", "pcm_s16le", bed])

        cmd = ["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", bed]
        for e in entries:
            cmd += ["-i", e["src"]]
        parts, mixin = [], ["[0:a]"]
        for i, e in enumerate(entries, start=1):
            ms = int(round(e["offset"] * 1000))
            parts.append(f"[{i}:a]aformat=sample_fmts=s16:sample_rates={SAMPLE_RATE}"
                         f":channel_layouts=mono,adelay={ms}|{ms}[d{i}]")
            mixin.append(f"[d{i}]")
        graph = ";".join(parts) + ";" + "".join(mixin) + \
                f"amix=inputs={len(entries) + 1}:normalize=0:duration=first[out]"
        cmd += ["-filter_complex", graph, "-map", "[out]",
                "-ac", "1", "-ar", str(SAMPLE_RATE)]

        wav = os.path.join(tmp, "sprite.wav")
        r = run(cmd + ["-c:a", "pcm_s16le", wav])
        if r.returncode != 0:
            sys.exit(f"error: sprite assembly failed\n{r.stderr[-2000:]}")

        mp3 = os.path.join(outdir, "kana-sprite.mp3")
        r = run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", wav,
                 "-c:a", "libmp3lame", "-b:a", MP3_BITRATE, "-write_xing", "1",
                 "-metadata", "album=tsumiki Kana", "-metadata", "title=kana sprite",
                 mp3])
        if r.returncode != 0:
            sys.exit(f"error: sprite encode failed\n{r.stderr[-2000:]}")

    table = {e["key"]: [e["offset"], e["duration"]] for e in entries}
    spec = {
        "_note": ("Offsets in seconds into kana-sprite.mp3. Decode once with "
                  "Web Audio and play [offset, offset+duration]. Keyed by "
                  "display sound: ji covers じ and ぢ, zu covers ず and づ, "
                  "ja/ju/jo cover じゃ and ぢゃ."),
        "format": f"MP3 {MP3_BITRATE} mono {SAMPLE_RATE} Hz",
        "gap": GAP,
        "lead": LEAD,
        "duration": round(duration(os.path.join(outdir, "kana-sprite.mp3")), 3),
        "count": len(entries),
        "bytes": os.path.getsize(os.path.join(outdir, "kana-sprite.mp3")),
        "clips": table,
    }
    with open(os.path.join(outdir, "kana-sprite.json"), "w") as f:
        json.dump(spec, f, ensure_ascii=False, indent=2)

    print(f"sprite  : {len(entries)} clips, {spec['duration']:.2f}s, "
          f"{spec['bytes'] // 1024} KB -> {outdir}/kana-sprite.mp3")
    if skipped:
        print(f"homophones folded onto an existing key: "
              f"{', '.join(f'{r}->{k}' for r, k in skipped)}")
    return entries, os.path.join(outdir, "kana-sprite.mp3")


def verify(entries, sprite):
    """Play each clip back out of the encoded sprite and compare to its master.

    This is the check that matters: MP3 encoder delay shifts the whole stream,
    and a silent drift would leave every clip clipped at the front by a few
    milliseconds. Comparing RMS at the stated offset catches it.
    """
    print("\nverifying offsets against the encoded sprite…")
    bad = []
    for e in entries:
        want_rms, _ = levels(e["src"])
        got_rms, _ = levels(sprite, e["offset"], e["duration"])
        if got_rms is None:
            bad.append(f"{e['key']}: nothing decoded at {e['offset']:.3f}s")
            continue
        # Head/tail silence in the padded master makes an exact match unlikely;
        # anything beyond 1.5 dB means the window is off the clip, not near it.
        if abs(got_rms - want_rms) > 1.5:
            bad.append(f"{e['key']}: sprite {got_rms:.1f} dB vs master "
                       f"{want_rms:.1f} dB at {e['offset']:.3f}s")
    if bad:
        print(f"FAIL — {len(bad)} clip(s) off:")
        for b in bad[:20]:
            print("   ", b)
        sys.exit(1)
    print(f"PASS — all {len(entries)} clips sit at their stated offsets.")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    here = os.path.dirname(os.path.abspath(__file__))
    ap.add_argument("--kana-dir", default=os.path.join(here, "Kana"))
    ap.add_argument("--outdir", default=None)
    ap.add_argument("--verify", action="store_true",
                    help="after building, decode the sprite and check every offset")
    args = ap.parse_args()
    outdir = args.outdir or os.path.join(args.kana_dir, "sprite")
    entries, sprite = build(args.kana_dir, outdir)
    if args.verify:
        verify(entries, sprite)


if __name__ == "__main__":
    main()
