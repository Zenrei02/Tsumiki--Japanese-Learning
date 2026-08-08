# Kana audio

`kana-sprite.mp3` and `kana-sprite.json` — 102 clips, ~750 KB, one file fetched
once and played by offset. Built by `Audio/build-kana-sprite.py` from the WAV
masters, encoded exactly once (concatenating already-encoded MP3s splices
encoder padding into the middle of the stream and smears clip boundaries).

**These ship.** The voice contributor approved use in the app in conversation;
Lloyd is retaining that exchange as the record and will collect the written
signature later — they are in different countries.

## Still open on the paper agreement

Not blockers, but worth closing while it is fresh:

- **Article 5 — compensation.** Blank.
- **Article 8 — credit preference.** Blank, and this one is time-sensitive in a
  small way: it is better to have her name in the app the first time her voice
  is on a public URL than to add it afterwards. Ask how she wants to be credited.
- **Article 2 — scope.** Session 8 found two mismatches. 拗音 was scoped at 33
  and 36 were delivered — the extra three are ぢゃ/ぢゅ/ぢょ, which the timing
  predicted before anyone listened. And the **extended katakana set**
  (`vu, fa, fo, ti, tu, che`) is not in Article 2 at all, so recording it is a
  scope conversation rather than a request that can simply be sent.

## If it ever needs to come back out

Delete these two files, and audio degrades gracefully — the loader does
`if (!spec.ok || !audio.ok) return false` inside a `.catch(() => false)`.
Nothing throws; the "Hear it" controls just produce no sound, and every other
part of the module works normally. Verified both ways.

## Unused, deliberately

- **`wo`** — the わ row labels を as `o`, which is right for the particle and is
  what the particles lesson teaches. She recorded it in chart context, where it
  is conventionally recited "wo". Needs a listen before it goes near a learner.
- **ぢゃ/ぢゅ/ぢょ** — folded onto じゃ/じゅ/じょ as homophones, so her take of
  these is archived rather than used. One-line change if it should win instead.
