# Wiring the kanji module to Grammar Practice

Two modules, two curricula, one shared state. Neither imports the other — they meet at two `window.storage` keys.

| Key | Written by | Read by |
|---|---|---|
| `known-kanji-v1` | Kanji module | Grammar module |
| `n5-progress-v1` | Grammar module | Kanji module (to gate the sentence prompt) |

The kanji module already does its half. Grammar Practice needs three changes.

---

## 1. Replace the hardcoded kanji set

`n5-practice.jsx` line 85 currently freezes the learner's kanji knowledge at build time:

```js
const N5_KANJI = "一二三四五六七八九十百千万円日月火水木金土曜年時分半間今…";
```

Replace with live state. Add near the other storage helpers:

```js
async function loadKnownKanji() {
  try {
    const r = await window.storage.get("known-kanji-v1");
    const v = r ? JSON.parse(r.value) : [];
    return new Set(Array.isArray(v) ? v : []);
  } catch { return new Set(); }
}
```

Load it in `GrammarPractice` alongside progress, hold it in state, and thread it down to `JPText`. `levelForWord` becomes:

```js
function levelForWord(word, knownKanji) {
  for (const ch of word) {
    if (KANJI_RE.test(ch) && !knownKanji.has(ch)) return "LATER";
  }
  return "KNOWN";
}
```

Note the rename: `"N5"` → `"KNOWN"`. The old name conflated *this kanji is N5-level* with *this learner can read it*. Those are different facts and only the second one matters here.

## 2. Annotate instead of substituting

`wordDisplay` currently swaps the whole word to kana when any kanji is unknown, so the learner never sees 食べます until 食 is taught. Switch to furigana so the kanji form is visible from day one and simply loses its reading later:

```js
function wordDisplay(entry, mode, kanaFluent) {
  const [kj, kana, , lvl] = entry;
  if (lvl === "UNK") return kj;
  if (mode === "kana" || !kanaFluent) return kana;   // pre-kana learners only
  if (lvl === "KNOWN") return kj;                     // plain kanji
  return { ruby: kj, rt: kana };                      // kanji + furigana
}
```

And render the ruby case in `JPText`:

```jsx
typeof disp === "object"
  ? <ruby>{disp.ruby}<rt style={{ fontSize: ".5em", color: T.sub }}>{disp.rt}</rt></ruby>
  : disp
```

`kanaFluent` should come from the hiragana/katakana module's own completion state. Furigana is worthless to someone who has to decode it, so this gate is real, not defensive.

## 3. Update the popup copy

The tap popup at line 1365 says *"This kanji arrives after Stage 1 — kana is perfect for now."* With furigana in place the honest line is different:

```jsx
{popup[3] === "KNOWN" ? "You know this one" :
 popup[3] === "UNK" ? "Not in dictionary yet" : "Reading shown for now"}
```

---

## What this buys you

The learner finishes 食 in the kanji module, opens Step 4, and the furigana over 食べます is gone. No new content, no new mechanic, no authoring — the retroactive upgrade falls straight out of the shared key.

## Still open

- **Order is placeholder.** `KANJI` in `kanji-module.jsx` is hand-sequenced to demonstrate the shape. Generate the real one: centrality (`frequency ÷ cost`) → topological sort → contrastive post-pass. Source frequency from a merged multi-source list, not the Wikipedia list.
- **Coverage curve is interpolated** from published anchor points. Recompute against the real order before showing the percentage as fact — it's currently the most confident-looking number in the UI and the least earned.
- **No SRS yet.** When you add one, keep passive sightings in grammar sentences out of the scheduler. Recognising 食 inside 食べます with the sentence around it is an easier task than cold recall, and letting it extend intervals will overstate retention.
- **Components aren't gated.** 校 currently lists 交 as a part, which isn't taught anywhere. The topological pass fixes this by construction; until then a few breakdowns reference characters the learner hasn't met.
