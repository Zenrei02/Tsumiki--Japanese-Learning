# Handover to Claude Code — finish the lesson arc build-out

*Session 17, Cowork. Supersedes `HANDOVER-lesson-arcs-preview.md`, whose main job is
done. Paste this whole file as the opening prompt.*

---

## ⚠️ THE ONE HARD RULE

**Do not deploy. Do not push to `main`.** Netlify charges **15 credits per production
deploy** and every push to `main` triggers one; ten pushes burned ~150 credits on
Aug 13 2026. Lloyd's standing rule is **one push per session, made by him**. Commit freely
— commits are free. Do not push and do not suggest pushing.

---

## What is already done — do not redo it

Commit **`65ccf5c`** landed the integration and it is good work. Verified just now:

- `ARCS` exists in `grammar-module.jsx` between `// @@ARCS-START` / `// @@ARCS-END`,
  **120 KB, all 112 entries**, none missing against `lesson-arcs-v1.json`.
- **Reviewer fields are correctly stripped** — no `claims`, `sources`, `flags` or `review`
  anywhere in the bundle. That was the right call and it must stay that way.
- `Walkthrough` builds the page list properly: `setting` when an arc exists, one page per
  extension, wrinkles an extension claimed move off `watch`, leftovers stay on it, and the
  page index is clamped rather than rendering nothing.
- The comment block above `Walkthrough` explains the sequence accurately.

**Your job is not to rebuild any of that.** It is the bug below, then a standalone build.

---

## 🔴 THE BUG: 26 of the 112 arcs cannot render

`grammar-module.jsx` line **4429**:

```jsx
{tab === "learn" && deep && deep.seg && (
  <Walkthrough point={point} deep={deep} … />
)}
{tab === "learn" && !(deep && deep.seg) && (
  <div><Explanation exp={point.exp} … /></div>
)}
```

**The Learn tab gates `Walkthrough` on `deep.seg`.** Twenty-six authored points have no
`seg`, so they fall to the plain `Explanation` branch and **their entire arc — setting,
flip, wrinkles — never appears.** The data is present in the bundle and invisible.

It is almost exactly the class of failure this folder keeps writing down: `check-arcs.py`
is green because it validates the data against the module's *points*, and it has no way to
know the *renderer* is gated on a different field. A green check that does not test the
thing you think it tests.

### What is blocked

**A — no `DEEP` entry at all (4).** `Walkthrough` would throw today on `deep.wr`:

`prim-shape`, `prim-drop`, `sb-suruverbs`, `sb-ganotwo`

**B — `DEEP` exists, no `seg` (22).** The `apart` page would throw on `deep.seg.map`:

`sb-kosoado`, `sb-negq`, `sb-yone`, `sb-waga`, `sb-kanaparticles`, `sb-nide`, `sb-no`,
`sb-pronouns`, `sb-counters`, `sb-slots`, `sb-verbtypes`, `sb-transitive`, `sb-future`,
`sb-register`, `sb-nounmod`, `sb-must`, `sb-nide2`, `sb-transitive2`, `sb-orthography`,
`sb-waga2`, `sb-pronouns2`, `sb-omou`

**`prim-shape` and `prim-drop` are the first two lessons in the entire course.** A learner
opening tsumiki for the first time gets the one screen where none of this shows.

The pattern is not random: these are the `sb-` skill lessons, which drill a distinction
rather than dissect one sentence, so they never had a `seg`. That is correct authoring —
the gate is what is wrong.

### The fix, precisely

Three small changes. **`apart` must become conditional; do not fake a `seg`.**

1. **Make `Walkthrough` safe without `deep`:**
   ```js
   function Walkthrough({ point, deep, … }) {
     const d = deep || {};
     const wr = d.wr || [];
   ```
   and use `d.seg` / `d.note` / `d.hl` throughout.

2. **Drop `apart` from the page list when there is nothing to take apart:**
   ```js
   const pages = [
     ...(arc ? ["setting"] : []),
     "idea",
     ...(d.seg ? ["apart"] : []),
     ...(point.ex.length > 1 ? ["again"] : []),
     ...exts.map((_, i) => "ext" + i),
     ...(exp.watch || leftover.length ? ["watch"] : []),
     "try",
   ];
   ```

3. **Open the gate to arcs as well as segs**, at line 4429:
   ```jsx
   {tab === "learn" && (( deep && deep.seg ) || ARCS[point.id]) && ( <Walkthrough … /> )}
   {tab === "learn" && !(( deep && deep.seg ) || ARCS[point.id]) && ( <div><Explanation … /></div> )}
   ```

Points with neither a `seg` nor an arc keep the plain `Explanation` exactly as today.

### Prove it, and make it stay proved

Add the guard to **`check-arcs.py`** so this cannot regress silently: parse the gate
condition out of `grammar-module.jsx` and fail if any point in `lesson-arcs-v1.json` would
not reach `Walkthrough`. A data checker that cannot see the renderer is half a checker,
and this bug is the proof.

Spot-check by opening **`prim-shape`** and **`sb-must`** in the Learn tab. Both should now
open on the situation.

---

## Then: the standalone build

Lloyd's deliverable is **a single `.html` file he can double-click** — not a dev server he
has to keep alive, and not a deploy. `build-standalone-html.py` already does this for the
kana modules; use it rather than inventing a second mechanism.

### ⚠️ The trap that makes a standalone build lie to you

**Standalone builds need a `window.storage` shim.** The artifact host provides one; a
plain browser does not. Without it `loadProgress()` silently returns `{}` — the app runs,
looks completely fine, and forgets everything. Back it with `localStorage`, falling back
to an in-memory object, because **Chrome blocks `localStorage` on `file://` in some
configurations** and that failure is also silent.

Verify by paging a lesson to `try`, closing the file, reopening it, and checking the
`walked` flag survived. If it did not, the shim is not working and nothing you tested is
verified.

---

## Reference: what the pages should feel like

`lesson-arc-preview.html` (from `build-arc-preview.py`) renders the same sequence straight
from the JSON plus the module's own prose. Lloyd has seen it and approved the format.

It is a **shape preview, not the app** — no drill, no progress, no kanji toggle. Use it as
the reference for page order and as a cross-check on your own build: if a lesson reads
differently in the real module, one of you has the data wrong and it is worth knowing
which before Lloyd looks.

Two details it settled, both already correct in your integration:

- The `apart` page shows the **real `DEEP.seg`** per-word cards with `THE POINT` marked.
  86 of 112 points have one.
- **Reviewer fields never render.** In the preview they are behind a toggle that is off by
  default; in the app they must not be present at all, and currently are not.

---

## Conventions that will bite you

- **Whole-file deliverables, never patches.** A patch caused a white screen in Session 3.
- **Read the modules, not the specs.** Spec documents here drift within days.
  `grammar-module.jsx` is the truth — which is how the gate bug above was found.
- **`npm run smoke` builds the bundle first.** Running `node test/smoke.mjs` directly
  reads whatever is already at `/tmp/test-bundle.js`; in Session 10 that produced green
  passes for code that had never been built. In the sandbox build to `$HOME` and run
  `SMOKE_BUNDLE=$HOME/test-bundle.js node test/smoke.mjs`.
- **No lesson counts in the UI.** Ruled out as discouraging. Page dots are fine — position,
  not workload. **Do not add "page 3 of 8".**
- **Do not touch `SYSTEM_PROMPT`** while Phase 0 evaluation is live.
- **Do not hand-edit the `@@ARCS-START` block.** Regenerate with `build-arcs.py`.
- **Do not edit `lesson-arcs-v1.json` content** to make rendering easier. If a lesson does
  not fit, say so — the data has been reviewed for register and level and the fix belongs
  in the renderer.

---

## Definition of done

1. `python3 check-arcs.py` exits 0, **including the new renderer-reachability guard**.
2. All **112** points reach `Walkthrough`; `prim-shape` and `sb-must` verified by eye.
3. Points with neither `seg` nor arc still render the plain `Explanation`.
4. `build-arcs.py` still idempotent — run it twice, nothing changes.
5. The app builds; `npm run smoke` passes against a **freshly built** bundle.
6. A standalone `.html` exists that Lloyd can double-click, and **progress survives a
   close-and-reopen**.
7. **Nothing pushed.** Report the file path and stop.

## What to tell Lloyd

The file path, the two points you spot-checked, and anything in the data that looked wrong
from the rendering side — particularly any Japanese line too long for a phone at the
module's font size. **Seventeen lines carry kanji outside `KANJI_DICT`** and are flagged in
the JSON for a furigana decision that has not been made; if any render badly, say so.
