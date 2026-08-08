#!/usr/bin/env python3
"""
patch-kana-audio.py — wire the recorded kana sprite into both kana modules.

Applies the same four edits to hiragana-module.jsx and katakana-module.jsx:
  1. an audio engine block after the existing speak() helper
  2. a "Hear it" control in StrokePanel (covers every chart and trap tap)
  3. the same control in CharacterWalk (the guided first pass)
  4. an honest rewrite of the "prototype audio" section comment

Every anchor is asserted to appear exactly once before anything is written, so
a partial apply is not possible. Run once; re-running is a no-op that reports
the modules are already wired.
"""
import sys

FILES = ["hiragana-module.jsx", "katakana-module.jsx"]

OLD_HEADER = """// ————— Speech (prototype audio) —————
// On-device synthesis via the browser, not recorded or cached audio. That
// sidesteps the redistribution terms attached to cloud TTS, and costs nothing.
// Quality varies by device and pitch-accent is unreliable — recorded native
// audio replaces this before launch. See the kana audio tracker row."""

NEW_HEADER = """// ————— Speech (word playback) —————
// On-device synthesis via the browser. This sidesteps the redistribution terms
// attached to cloud TTS, and costs nothing. Quality varies by device and
// pitch-accent is unreliable.
//
// Single kana no longer come from here — see the recorded audio block below.
// Whole words still do, deliberately: stitching recorded mora into a word gives
// flat, evenly spaced syllables with no pitch accent and no coarticulation,
// which would teach the wrong prosody in the one activity that is specifically
// about hearing a real word. Recorded word audio is its own recording session."""

ENGINE = '''

// ————— Recorded kana audio —————
// Native recordings, cut and loudness-matched by Audio/split-kana-audio.py and
// packed into a single sprite by Audio/build-kana-sprite.py: 102 distinct
// sounds in ~736 KB, one fetch, decoded once, played by offset.
//
// Keyed by sound, not by character, so じ and ぢ share a clip — they are
// homophones and the sprite folds them onto one key.
//
// Degrades quietly. If the sprite cannot be fetched (a published artifact frame
// blocks relative fetches) or a sound has no clip yet, playback falls through to
// speech synthesis and nothing in the UI changes. Currently unrecorded: the
// katakana extended set — vu, fa, fo, ti, tu, che.
const SPRITE_BASE = "./audio";   // where kana-sprite.mp3 and .json are served

let _actx = null, _abuf = null, _amap = null, _aload = null;

function loadKanaSprite() {
  if (_aload) return _aload;
  _aload = (async () => {
    if (typeof window === "undefined") return false;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    const [spec, audio] = await Promise.all([
      fetch(SPRITE_BASE + "/kana-sprite.json"),
      fetch(SPRITE_BASE + "/kana-sprite.mp3"),
    ]);
    if (!spec.ok || !audio.ok) return false;
    const json = await spec.json();
    const bytes = await audio.arrayBuffer();
    _actx = new AC();
    _abuf = await _actx.decodeAudioData(bytes);
    _amap = json.clips || null;
    return !!_amap;
  })().catch(() => false);
  return _aload;
}

// Characters that are real but have no sound of their own: a small っ is a beat
// of silence, small ゃゅょ never stand alone, ー only lengthens what precedes it.
// These get no play control rather than a control that does nothing.
function isSilentUnit(ch) {
  const s = soundFor(ch);
  return !s || s === "?" || s === "long vowel" || s.indexOf("small ") === 0;
}

function playRecorded(sound) {
  if (!_actx || !_abuf || !_amap) return false;
  const at = _amap[sound];
  if (!at) return false;
  if (_actx.state === "suspended") _actx.resume();
  const src = _actx.createBufferSource();
  src.buffer = _abuf;
  src.connect(_actx.destination);
  src.start(0, at[0], at[1]);
  return true;
}

function useKanaAudio() {
  const [ready, setReady] = useState(!!_amap);
  const { voice, supported } = useJapaneseVoice();
  useEffect(() => {
    let live = true;
    loadKanaSprite().then((ok) => { if (live) setReady(ok); });
    return () => { live = false; };
  }, []);
  // Returns what actually happened, so a caller can tell recorded from synth.
  const play = (ch) => {
    if (isSilentUnit(ch)) return "silent";
    if (playRecorded(soundFor(ch))) return "recorded";
    speak(ch, voice);
    return "synth";
  };
  const canPlay = (ch) => !isSilentUnit(ch) && (ready || supported);
  return { play, canPlay, ready };
}
'''

PANEL_HOOK_OLD = """function StrokePanel({ ch, onClose }) {
  const [numbers, setNumbers] = useState(false);
  if (!ch) return null;"""
PANEL_HOOK_NEW = """function StrokePanel({ ch, onClose }) {
  const [numbers, setNumbers] = useState(false);
  const { play, canPlay } = useKanaAudio();
  if (!ch) return null;"""

PANEL_BTN_OLD = """        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn-ghost" onClick={() => setNumbers((v) => !v)}>
            {numbers ? "Hide numbers" : "Show numbers"}
          </button>"""
PANEL_BTN_NEW = """        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {canPlay(ch) && (
            <button className="btn-ghost" onClick={() => play(ch)}>▶ Hear it</button>
          )}
          <button className="btn-ghost" onClick={() => setNumbers((v) => !v)}>
            {numbers ? "Hide numbers" : "Show numbers"}
          </button>"""

WALK_HOOK_OLD = """function CharacterWalk({ chars, modId, progress, onProgress, onDone }) {
  const cleared = (progress[modId] || {}).walked || [];"""
WALK_HOOK_NEW = """function CharacterWalk({ chars, modId, progress, onProgress, onDone }) {
  const { play: playKana, canPlay: canPlayKana } = useKanaAudio();
  const cleared = (progress[modId] || {}).walked || [];"""

WALK_BTN_OLD = """        <span style={{ fontSize: 15 }}>{soundFor(ch)}</span>"""
WALK_BTN_NEW = """        <span style={{ fontSize: 15 }}>{soundFor(ch)}</span>
        {canPlayKana(ch) && (
          <button className="btn-ghost" style={{ padding: "2px 10px", fontSize: 12 }}
            onClick={() => playKana(ch)}>▶ hear it</button>
        )}"""

EDITS = [
    ("section comment", OLD_HEADER, NEW_HEADER),
    ("StrokePanel hook", PANEL_HOOK_OLD, PANEL_HOOK_NEW),
    ("StrokePanel button", PANEL_BTN_OLD, PANEL_BTN_NEW),
    ("CharacterWalk hook", WALK_HOOK_OLD, WALK_HOOK_NEW),
    ("CharacterWalk button", WALK_BTN_OLD, WALK_BTN_NEW),
]

SPEAK_END = """  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}"""


def patch(path):
    with open(path, encoding="utf-8") as f:
        src = f.read()

    if "useKanaAudio" in src:
        print(f"{path}: already wired — nothing to do")
        return False

    problems = []
    for name, old, _ in EDITS:
        n = src.count(old)
        if n != 1:
            problems.append(f"{name}: found {n} matches, expected exactly 1")
    if src.count(SPEAK_END) != 1:
        problems.append(f"engine insertion point: found {src.count(SPEAK_END)}, expected 1")
    if problems:
        print(f"{path}: NOT PATCHED")
        for p in problems:
            print("   ", p)
        return None

    for _name, old, new in EDITS:
        src = src.replace(old, new, 1)
    src = src.replace(SPEAK_END, SPEAK_END + ENGINE, 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(src)
    print(f"{path}: patched — {len(EDITS)} edits + audio engine")
    return True


if __name__ == "__main__":
    results = [patch(p) for p in FILES]
    sys.exit(1 if None in results else 0)
