#!/usr/bin/env python3
"""
split-kana-audio.py — cut a single kana recording into per-clip WAV masters
and MP3 delivery files, using settings identical to the Aug 6 2026 あかさたな batch.

Consistency across recording batches is the whole point of this script. Do not
hand-tune per batch: if a batch needs different settings, change them here so
every future batch gets them too.

USAGE
    python3 split-kana-audio.py SOURCE_AUDIO --kana a i u e o ka ki ...
    python3 split-kana-audio.py SOURCE_AUDIO --preset a-ka-sa-ta-na
    python3 split-kana-audio.py SOURCE_AUDIO --preset ha-ma-ya-ra-wa --dry-run

    --dry-run   detect and report segments without writing files. ALWAYS run
                this first on a new recording.

OUTPUT
    <outdir>/<romaji>.wav          masters, 44.1k mono 16-bit, 80 ms lead-in
    <outdir>/mp3/<romaji>.mp3      delivery, 96 kbps mono,     40 ms lead-in
    <outdir>/manifest.json         merged, not overwritten

NAMING (decided Aug 6 2026, see Notion "Kana audio recordings + source decision")
    Hepburn: shi, chi, tsu, fu, ja, sha — not si/ti/tu/hu.
    Collisions ぢ/づ/ぢゃ/ぢゅ/ぢょ use INTERNAL keys dji/dzu/dja/dju/djo.
    These are filename keys only. ぢ is a homophone of じ, づ of ず, and
    ぢゃぢゅぢょ of じゃじゅじょ. Never render these keys in the UI — display
    them as ji, zu, ja, ju, jo (see DISPLAY_OVERRIDE).

REQUIRES ffmpeg + ffprobe on PATH.
"""

import argparse
import json
import os
import re
import shutil
import statistics
import subprocess
import sys
import tempfile

# ---------------------------------------------------------------- settings --
# Silence gate. Revised Aug 7 2026 after the はまやらわ batch: that recording
# sits ~3 dB quieter with a higher noise floor, and at the original
# -35 dB / 0.25 s the inter-kana gaps never crossed the gate — adjacent kana
# merged and only 14 of 21 segments were found. Swept both parameters across
# all three recordings; -30 dB / 0.15 s is the one setting that reads every
# batch correctly, and it sits mid-plateau rather than on an edge:
#   あかさたな  25/25 clean from -22 to -30 dB at any tested duration
#   はまやらわ  21/21 clean from -22 to -32 dB at 0.15 s (fails at 0.20 s+)
#   濁音etc     61/61 clean from -22 to -28 dB, and at -30/0.15
# Tighter than -30 starts clipping fricative onsets; longer than 0.15 s
# re-merges the quiet batch. Do not hand-tune per batch — change it here.
SILENCE_DB = -30          # threshold for silence detection
SILENCE_MIN = 0.15        # min silence duration to count as a gap (s)
MIN_SEG_LEN = 0.08        # segments shorter than this are artifacts (s)
# Reject segments this far below the median segment RMS. Use RMS, not peak:
# a breath's peak sits only ~4 dB below a spoken kana, but its RMS sits ~16 dB
# below, because the energy is spread thin across the segment. Measured on the
# あかさたな batch: breath -40.6 dB vs median -24.3 dB, with every real kana
# inside 2.6 dB of median. 10 dB leaves a wide margin on both sides.
ARTIFACT_DB_BELOW = 10.0
TARGET_RMS = -22.0        # per-clip loudness target (dBFS)
PEAK_CEIL = -1.5          # never let a clip peak above this (dBFS)
MASTER_PAD = (0.08, 0.12)  # (lead-in, tail) for WAV masters
DELIVERY_PAD = (0.04, 0.10)  # (lead-in, tail) for MP3 delivery
MP3_BITRATE = "96k"
SAMPLE_RATE = 44100

# ------------------------------------------------------------------ presets --
PRESETS = {
    "a-ka-sa-ta-na": "a i u e o ka ki ku ke ko sa shi su se so "
                     "ta chi tsu te to na ni nu ne no".split(),
    "ha-ma-ya-ra-wa": "ha hi fu he ho ma mi mu me mo ya yu yo "
                      "ra ri ru re ro wa wo n".split(),
    "dakuten": "ga gi gu ge go za ji zu ze zo da dji dzu de do "
               "ba bi bu be bo pa pi pu pe po".split(),
    # 12 sets, chart order. ぢゃ/ぢゅ/ぢょ sits tenth, straight after じゃ,
    # mirroring the が ざ だ ば ぱ order the dakuten batch uses.
    "youon": "kya kyu kyo sha shu sho cha chu cho nya nyu nyo "
             "hya hyu hyo mya myu myo rya ryu ryo "
             "gya gyu gyo ja ju jo dja dju djo bya byu byo pya pyu pyo".split(),
}
# 濁音etc.m4a holds both tables in one take: 25 dakuten/handakuten then 36 yōon.
PRESETS["dakuten-youon"] = PRESETS["dakuten"] + PRESETS["youon"]

# Expected series shape per preset. Diagnostic only: labels are assigned by
# order, not by group. Grouping splits on the N-1 largest gaps, so it is only
# meaningful when between-row pauses are longer than within-row ones. Known
# false alarm: in the はまやらわ take the 3-kana rows (や, わ) are spoken with
# ~0.85 s between kana, as wide as the row breaks, so the shape reads
# [10,1,2,5,3] while every label is correct. Treat a shape mismatch as a
# prompt to eyeball the segment list, not as a failure.
PRESET_SHAPE = {
    "a-ka-sa-ta-na": [5] * 5,
    "ha-ma-ya-ra-wa": [5, 5, 3, 5, 3],   # や row has 3, わ row is wa/wo/n
    "dakuten": [5] * 5,
    "youon": [3] * 12,
    "dakuten-youon": [5] * 5 + [3] * 12,
}
PRESET_GROUPS = {k: len(v) for k, v in PRESET_SHAPE.items()}

KANA_MAP = {
    "a": ("あ", "ア"), "i": ("い", "イ"), "u": ("う", "ウ"), "e": ("え", "エ"), "o": ("お", "オ"),
    "ka": ("か", "カ"), "ki": ("き", "キ"), "ku": ("く", "ク"), "ke": ("け", "ケ"), "ko": ("こ", "コ"),
    "sa": ("さ", "サ"), "shi": ("し", "シ"), "su": ("す", "ス"), "se": ("せ", "セ"), "so": ("そ", "ソ"),
    "ta": ("た", "タ"), "chi": ("ち", "チ"), "tsu": ("つ", "ツ"), "te": ("て", "テ"), "to": ("と", "ト"),
    "na": ("な", "ナ"), "ni": ("に", "ニ"), "nu": ("ぬ", "ヌ"), "ne": ("ね", "ネ"), "no": ("の", "ノ"),
    "ha": ("は", "ハ"), "hi": ("ひ", "ヒ"), "fu": ("ふ", "フ"), "he": ("へ", "ヘ"), "ho": ("ほ", "ホ"),
    "ma": ("ま", "マ"), "mi": ("み", "ミ"), "mu": ("む", "ム"), "me": ("め", "メ"), "mo": ("も", "モ"),
    "ya": ("や", "ヤ"), "yu": ("ゆ", "ユ"), "yo": ("よ", "ヨ"),
    "ra": ("ら", "ラ"), "ri": ("り", "リ"), "ru": ("る", "ル"), "re": ("れ", "レ"), "ro": ("ろ", "ロ"),
    "wa": ("わ", "ワ"), "wo": ("を", "ヲ"), "n": ("ん", "ン"),
    "ga": ("が", "ガ"), "gi": ("ぎ", "ギ"), "gu": ("ぐ", "グ"), "ge": ("げ", "ゲ"), "go": ("ご", "ゴ"),
    "za": ("ざ", "ザ"), "ji": ("じ", "ジ"), "zu": ("ず", "ズ"), "ze": ("ぜ", "ゼ"), "zo": ("ぞ", "ゾ"),
    "da": ("だ", "ダ"), "dji": ("ぢ", "ヂ"), "dzu": ("づ", "ヅ"), "de": ("で", "デ"), "do": ("ど", "ド"),
    "ba": ("ば", "バ"), "bi": ("び", "ビ"), "bu": ("ぶ", "ブ"), "be": ("べ", "ベ"), "bo": ("ぼ", "ボ"),
    "pa": ("ぱ", "パ"), "pi": ("ぴ", "ピ"), "pu": ("ぷ", "プ"), "pe": ("ぺ", "ペ"), "po": ("ぽ", "ポ"),
    # youon — one file per pair; do not compose at playback, きゃ is one mora
    "kya": ("きゃ", "キャ"), "kyu": ("きゅ", "キュ"), "kyo": ("きょ", "キョ"),
    "sha": ("しゃ", "シャ"), "shu": ("しゅ", "シュ"), "sho": ("しょ", "ショ"),
    "cha": ("ちゃ", "チャ"), "chu": ("ちゅ", "チュ"), "cho": ("ちょ", "チョ"),
    "nya": ("にゃ", "ニャ"), "nyu": ("にゅ", "ニュ"), "nyo": ("にょ", "ニョ"),
    "hya": ("ひゃ", "ヒャ"), "hyu": ("ひゅ", "ヒュ"), "hyo": ("ひょ", "ヒョ"),
    "mya": ("みゃ", "ミャ"), "myu": ("みゅ", "ミュ"), "myo": ("みょ", "ミョ"),
    "rya": ("りゃ", "リャ"), "ryu": ("りゅ", "リュ"), "ryo": ("りょ", "リョ"),
    "gya": ("ぎゃ", "ギャ"), "gyu": ("ぎゅ", "ギュ"), "gyo": ("ぎょ", "ギョ"),
    "ja": ("じゃ", "ジャ"), "ju": ("じゅ", "ジュ"), "jo": ("じょ", "ジョ"),
    "dja": ("ぢゃ", "ヂャ"), "dju": ("ぢゅ", "ヂュ"), "djo": ("ぢょ", "ヂョ"),
    "bya": ("びゃ", "ビャ"), "byu": ("びゅ", "ビュ"), "byo": ("びょ", "ビョ"),
    "pya": ("ぴゃ", "ピャ"), "pyu": ("ぴゅ", "ピュ"), "pyo": ("ぴょ", "ピョ"),
}

# Internal filename keys that must never reach the UI. See Notion.
DISPLAY_OVERRIDE = {"dji": "ji", "dzu": "zu",
                    "dja": "ja", "dju": "ju", "djo": "jo"}


# ------------------------------------------------------------------ helpers --
def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def require_tools():
    for t in ("ffmpeg", "ffprobe"):
        if not shutil.which(t):
            sys.exit(f"error: {t} not found on PATH")


def duration(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", path])
    return float(r.stdout.strip())


def levels(path, start=None, length=None):
    """Return (mean_dB, max_dB) for a file or a slice of it."""
    cmd = ["ffmpeg", "-nostdin", "-hide_banner"]
    if start is not None:
        cmd += ["-ss", str(start)]
    if length is not None:
        cmd += ["-t", str(length)]
    cmd += ["-i", path, "-af", "volumedetect", "-f", "null", os.devnull]
    err = run(cmd).stderr
    mean = re.search(r"mean_volume:\s*(-?[\d.]+)", err)
    peak = re.search(r"max_volume:\s*(-?[\d.]+)", err)
    if not mean or not peak:
        return None, None
    return float(mean.group(1)), float(peak.group(1))


def detect_segments(src):
    """Find speech regions via silence detection, then reject artifacts."""
    err = run(["ffmpeg", "-nostdin", "-i", src, "-af",
               f"silencedetect=noise={SILENCE_DB}dB:d={SILENCE_MIN}",
               "-f", "null", os.devnull]).stderr

    starts = [float(m) for m in re.findall(r"silence_start:\s*(-?[\d.]+)", err)]
    ends = [float(m) for m in re.findall(r"silence_end:\s*([\d.]+)", err)]
    total = duration(src)

    # Speech runs from each silence_end to the next silence_start.
    bounds = []
    for e in ends:
        nxt = [s for s in starts if s > e]
        bounds.append((e, min(nxt) if nxt else total))

    segs = [(s, e) for s, e in bounds if e - s >= MIN_SEG_LEN]
    if not segs:
        return [], []

    # Reject breaths / mouth noise by RMS relative to the median segment.
    measured = []
    for s, e in segs:
        rms, pk = levels(src, s, e - s)
        measured.append((rms if rms is not None else -99.0,
                         pk if pk is not None else -99.0))
    median_rms = statistics.median(r for r, _ in measured)

    kept, rejected = [], []
    for (s, e), (rms, pk) in zip(segs, measured):
        if median_rms - rms > ARTIFACT_DB_BELOW:
            rejected.append((s, e, rms))
        else:
            kept.append((s, e, rms))
    return kept, rejected


def group_by_gaps(segs, expected_groups=5):
    """Split segments into series using the largest inter-segment gaps."""
    if len(segs) < 2:
        return [segs]
    gaps = sorted(
        ((segs[i + 1][0] - segs[i][1], i) for i in range(len(segs) - 1)),
        reverse=True,
    )[: expected_groups - 1]
    cuts = sorted(i for _, i in gaps)
    groups, prev = [], 0
    for c in cuts:
        groups.append(segs[prev:c + 1])
        prev = c + 1
    groups.append(segs[prev:])
    return groups


def cut(src, dst, start, end, pad, gain, mp3=False):
    lead, tail = pad
    ss = max(0.0, start - lead)
    dur = (end - start) + lead + tail
    fade_out_at = round(dur - (0.05 if mp3 else 0.06), 4)
    fade_in = 0.015 if mp3 else 0.02
    fade_out = 0.05 if mp3 else 0.06
    af = (f"volume={gain}dB,"
          f"afade=t=in:st=0:d={fade_in},"
          f"afade=t=out:st={fade_out_at}:d={fade_out},"
          f"alimiter=limit=0.85")
    cmd = ["ffmpeg", "-nostdin", "-v", "error", "-y",
           "-ss", f"{ss:.4f}", "-t", f"{dur:.4f}", "-i", src,
           "-af", af, "-ac", "1", "-ar", str(SAMPLE_RATE)]
    if mp3:
        cmd += ["-c:a", "libmp3lame", "-b:a", MP3_BITRATE, "-write_xing", "1",
                "-metadata", f"title={os.path.basename(dst).rsplit('.', 1)[0]}",
                "-metadata", "album=Naoshi Kana"]
    else:
        cmd += ["-c:a", "pcm_s16le"]
    cmd.append(dst)
    r = run(cmd)
    if r.returncode != 0:
        sys.exit(f"error: ffmpeg failed on {dst}\n{r.stderr}")


# --------------------------------------------------------------------- main --
def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source", help="source recording (m4a/wav/mp3/...)")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--kana", nargs="+", help="expected romaji keys, in spoken order")
    g.add_argument("--preset", choices=sorted(PRESETS), help="a named kana batch")
    ap.add_argument("--outdir", default=None,
                    help="output dir (default: <source dir>/../Kana)")
    ap.add_argument("--groups", type=int, default=None,
                    help="expected number of series in the recording "
                         "(default: inferred from --preset, else 5)")
    ap.add_argument("--dry-run", action="store_true",
                    help="detect and report only; write nothing")
    args = ap.parse_args()

    require_tools()
    if not os.path.isfile(args.source):
        sys.exit(f"error: no such file: {args.source}")

    expected = args.kana or PRESETS[args.preset]
    unknown = [k for k in expected if k not in KANA_MAP]
    if unknown:
        sys.exit(f"error: unknown romaji key(s): {', '.join(unknown)}\n"
                 f"       add them to KANA_MAP, and check Hepburn naming.")

    outdir = args.outdir or os.path.join(os.path.dirname(os.path.abspath(args.source)),
                                         os.pardir, "Kana")
    outdir = os.path.normpath(outdir)

    print(f"source   : {args.source}")
    print(f"expected : {len(expected)} clips — {' '.join(expected)}")

    segs, rejected = detect_segments(args.source)
    for s, e, pk in rejected:
        print(f"  rejected artifact at {s:6.3f}s ({e - s:.3f}s, peak {pk:.1f} dB) "
              f"— breath or mouth noise")

    print(f"detected : {len(segs)} clips")

    if len(segs) != len(expected):
        print("\n!! COUNT MISMATCH — not writing files.")
        print("   Detected segments:")
        for i, (s, e, pk) in enumerate(segs):
            print(f"     {i + 1:3d}  {s:7.3f} → {e:7.3f}  ({e - s:.3f}s, RMS {pk:5.1f} dB)")
        print("\n   Likely causes: a retake left in the recording, two kana run "
              "together,\n   a cough above the artifact threshold, or the wrong "
              "--preset.\n   Fix the recording or pass an explicit --kana list.")
        sys.exit(1)

    ngroups = args.groups or PRESET_GROUPS.get(args.preset, 5)
    groups = group_by_gaps(segs, ngroups)
    shape = [len(g) for g in groups]
    expect = PRESET_SHAPE.get(args.preset)
    if expect is not None:
        note = ("matches expected" if shape == expect
                else f"expected {expect} — eyeball the segment list below")
    else:
        note = "even" if len(set(shape)) == 1 else "UNEVEN — check this"
    print(f"grouping : {shape} ({note})")

    if args.dry_run:
        print("\ndry run — nothing written.")
        for (s, e, pk), k in zip(segs, expected):
            print(f"  {k:5s} {s:7.3f} → {e:7.3f}  ({e - s:.3f}s, RMS {pk:5.1f} dB)")
        return

    os.makedirs(outdir, exist_ok=True)
    os.makedirs(os.path.join(outdir, "mp3"), exist_ok=True)

    # Pass 1: measure each segment at master padding so gain matches the
    # original batch's method exactly.
    print("\nnormalising and writing…")
    written = []
    # Probe files go to the system temp dir, never to outdir: some mounts
    # (Cowork's, for one) allow create but not unlink, which left .probe-*.wav
    # droppings next to the masters and aborted the run on the first clip.
    probedir = tempfile.mkdtemp(prefix="kana-probe-")
    for (s, e, _pk), key in zip(segs, expected):
        tmp = os.path.join(probedir, f"probe-{key}.wav")
        cut(args.source, tmp, s, e, MASTER_PAD, 0.0)
        mean, peak = levels(tmp)
        os.remove(tmp)
        gain = round(min(TARGET_RMS - mean, PEAK_CEIL - peak), 2)

        wav = os.path.join(outdir, f"{key}.wav")
        mp3 = os.path.join(outdir, "mp3", f"{key}.mp3")
        cut(args.source, wav, s, e, MASTER_PAD, gain)
        cut(args.source, mp3, s, e, DELIVERY_PAD, gain, mp3=True)

        m2, p2 = levels(wav)
        flag = "" if abs(m2 - TARGET_RMS) < 1.0 else "  <-- CHECK"
        print(f"  {key:5s} gain {gain:+6.2f} dB  ->  {m2:.1f} dB RMS, "
              f"peak {p2:.1f} dB{flag}")
        written.append((key, wav, mp3))
    shutil.rmtree(probedir, ignore_errors=True)

    # Merge into manifest rather than overwriting other batches.
    mpath = os.path.join(outdir, "manifest.json")
    doc = {}
    if os.path.exists(mpath):
        with open(mpath) as f:
            doc = json.load(f)
    clips = {c["romaji"]: c for c in doc.get("clips", [])}

    for key, wav, mp3 in written:
        hira, kata = KANA_MAP[key]
        clips[key] = {
            "romaji": key,
            "display": DISPLAY_OVERRIDE.get(key, key),
            "hiragana": hira,
            "katakana": kata,
            "master": {"path": os.path.basename(wav),
                       "duration": round(duration(wav), 3),
                       "bytes": os.path.getsize(wav)},
            "delivery": {"path": f"mp3/{os.path.basename(mp3)}",
                         "duration": round(duration(mp3), 3),
                         "bytes": os.path.getsize(mp3)},
        }
        if key in DISPLAY_OVERRIDE:
            clips[key]["note"] = ("internal filename key only; homophone of "
                                  f"'{DISPLAY_OVERRIDE[key]}' — never render "
                                  "this key in the UI")

    ordered = list(clips.values())
    doc.update({
        "formats": {
            "master": "WAV 44.1 kHz mono 16-bit PCM — archive, never re-encode from lossy",
            "delivery": f"MP3 {MP3_BITRATE} mono — ship this to the app",
        },
        "processing": {
            "master_lead_in_ms": int(MASTER_PAD[0] * 1000),
            "delivery_lead_in_ms": int(DELIVERY_PAD[0] * 1000),
            "loudness": f"per-clip gain to {TARGET_RMS} dB RMS, peak-capped at {PEAK_CEIL} dBFS",
            "script": "split-kana-audio.py",
        },
        "totals": {
            "master_bytes": sum(c["master"]["bytes"] for c in ordered),
            "delivery_bytes": sum(c["delivery"]["bytes"] for c in ordered),
        },
        "clips": ordered,
    })
    doc.setdefault("sources", [])
    src_name = os.path.basename(args.source)
    if src_name not in doc["sources"]:
        doc["sources"].append(src_name)

    with open(mpath, "w") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)

    print(f"\n{len(written)} clips written to {outdir}")
    print(f"manifest now holds {len(ordered)} clips "
          f"({doc['totals']['delivery_bytes'] // 1024} KB delivery, "
          f"{doc['totals']['master_bytes'] // 1024} KB masters)")


if __name__ == "__main__":
    main()
