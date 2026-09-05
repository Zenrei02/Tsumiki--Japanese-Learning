# Module drift check

## Stroke engine

- ✅ **`strokeStart()`** — identical across 4 modules
- ✅ **`resample()`** — identical across 4 modules
- ✅ **`samplePath()`** — identical across 4 modules
- ✅ **`scoreStroke()`** — identical across 4 modules
- ✅ **`tolerancesFor()`** — identical across 4 modules
- ✅ **`thinPoints()`** — identical across 4 modules

## Shared scaffolding


- design tokens: 12 keys across 6 modules; **0 hold conflicting values**
    - ✅ no key holds two different values — divergence is additive only
- ✅ **`loadJSON()`** — identical across 2 modules
- ✅ **`saveJSON()`** — identical across 2 modules

## Storage keys

A key renamed in one module silently orphans that learner's progress in
every other module that reads it. These are the real seams.

| Key | Modules |
|---|---|
| `stroke-data-v1` | hiragana-module.jsx, kanji-module.jsx, katakana-module.jsx, vocabulary-module.jsx ⚠️ shared |
| `known-kanji-v1` | grammar-module.jsx, kanji-module.jsx, vocabulary-module.jsx ⚠️ shared |
| `n5-progress-v1` | grammar-module.jsx, kanji-module.jsx, vocabulary-module.jsx ⚠️ shared |
| `achievement-points-v1` | grammar-module.jsx, vocabulary-module.jsx ⚠️ shared |
| `hiragana-progress-v2` | grammar-module.jsx, hiragana-module.jsx ⚠️ shared |
| `katakana-progress-v1` | katakana-module.jsx, vocabulary-module.jsx ⚠️ shared |
| `kanji-progress-v1` | kanji-module.jsx |
| `known-words-v1` | vocabulary-module.jsx |
| `learner-depth-v1` | grammar-module.jsx |

6 of 9 keys are shared across modules.


## Kana audio sprite

- ✅ `kana-sprite.mp3` identical in both locations (`719c93c0`)
- ✅ `kana-sprite.json` identical in both locations (`8931e55e`)

If these diverge, re-run `Audio/build-kana-sprite.py` and copy the result to
both locations, rather than editing either by hand.
## Verdict

**No drift.** Every shared block is byte-identical across every module
that carries it. The duplication is currently costing disk space and
nothing else, which is why porting is not yet urgent on these grounds.

Re-run after any edit to the stroke engine, the design tokens, or a
storage key. The first failure here is the trigger.
