# Naoshi — practice app

Four modules in one site: **Hiragana → Katakana → Kanji → Vocabulary.**
No account, no API key, no cost. Progress saves in the learner's browser.

Written for someone who has not used npm before. You will type two commands.

---

## First time only

You need **Node.js** — that is the thing that runs the build. Check what you have:

```
node --version
```

**18.x or newer will build this project.** Vite 6 accepts `^18 || ^20 || >=22`,
so if you see a number there, skip ahead — do not upgrade before you have to.

If it says *command not found*, or you want to move off an unsupported version,
see **Upgrading Node** at the bottom.

Then, once, from inside this `naoshi-app` folder:

```
npm install
```

That downloads the tools into a `node_modules` folder. It takes a minute and you
never need to do it again unless you move the project to a new machine.

---

## To see it on your own machine

```
npm run dev
```

It prints a web address — usually `http://localhost:5173`. Open that in your
browser. Leave the command running; **edits appear instantly**, no rebuild.

Press `Ctrl+C` in the terminal to stop it.

## To make the version you put on the internet

```
npm run build
```

That creates a **`dist`** folder. That folder *is* the website — plain files, no
server needed. Everything below is about getting `dist` somewhere your testers
can reach.

---

## Putting it online

Free, and no card needed for any of these at this size.

**Easiest — drag and drop.** Go to [app.netlify.com/drop](https://app.netlify.com/drop)
and drag the `dist` folder onto the page. You get a URL immediately. Good for
"try this tonight." The URL is ugly and it is not connected to anything, so to
update it you drag again.

**Better once you are past the first try — connect a repo.** Put the project on
GitHub and point Netlify at it. **There is a `netlify.toml` at the repository
root and it already carries every build setting** — base directory, build
command, publish directory, Node version. Connect the repo and deploy; you
should not have to type anything into the build-settings form.

> ⚠️ **The one thing that trips this up.** The app lives in `naoshi-app/`, not at
> the repository root. Without a **base directory** of `naoshi-app`, Netlify runs
> `npm run build` from the root, finds no `package.json`, and fails with `ENOENT`
> before the build starts. That is what `netlify.toml` exists to prevent — and
> `netlify.toml` overrides anything set in the UI, so if the two disagree, the
> file wins.

**For Vercel or Cloudflare Pages instead**, they will not read `netlify.toml`.
Set it by hand: root/base directory `naoshi-app`, build command `npm run build`,
output directory `dist`.

After that, every change you push updates the site by itself.

---

## What your testers will experience

- **Nothing to install, nothing to sign up for.** They open a link.
- **Progress lives in their browser**, on that device. Clearing site data loses
  it; a different phone is a fresh start. This is why **Save progress** exists in
  the top bar — it downloads a small file they can keep, and **Restore** puts it
  back. It is also the only way you get to see what they actually did, so it is
  worth telling them about.
- **The modules are connected.** Learning a kanji in the Kanji module is what
  makes words appear in Vocabulary. A tester who opens Vocabulary first will
  correctly see an empty screen — send them to Hiragana or Kanji first.
- **It works offline** after the first load, and on phones.

---

## Things that will look broken and are not

**A blank page after deploying.** Almost always the site is served from a
subfolder and the asset paths are wrong. This is already handled — `vite.config.js`
sets `base: "./"` — but if you change that line, this is the symptom.

**"It didn't save my progress."** Private/incognito windows block storage. The
app falls back to remembering things only until the tab closes and logs a warning
in the browser console. Ask which window they used.

**Vocabulary is empty.** Working as designed, until some kanji are learned. See
above.

**The Kanji module's "use it in a sentence" section says to come back later.**
Correct here. That feature needs the grammar module and the checker, neither of
which is in this build. It is what keeps this app free.

**No sound at all.** The sprite is one 750 KB fetch on first use; a slow
connection delays the first tap rather than breaking it. If it never arrives,
audio fails quietly by design and everything else keeps working. Check the
browser console for a 404 on `audio/kana-sprite.mp3`.

---

## How this folder is made

Do not hand-edit `src/modules/*.jsx`, `src/App.jsx` or `src/main.jsx` — they are
**generated**, and your changes will vanish on the next build.

The single-file modules in the parent folder are the source of truth, because the
reviewer is still grading through the published artifacts. To regenerate after
editing one of them:

```
cd ..
python3 build-vite-app.py
```

`src/lib/tokens.js`, `src/lib/strokeEngine.jsx`, `src/lib/strokeData.js`,
`src/lib/json.js` and `src/data/*` are generated too — the design tokens and the
handwriting engine now exist **once** and every module imports them, instead of
each carrying its own copy.

Hand-written and safe to edit: `src/lib/storage.js`, `index.html`,
`vite.config.js`, this file.

The generator also **removes the API-calling code** rather than relying on it
being switched off, so a network call is not merely unreachable in this build —
it is not present. That is checked on every run.

---

## Upgrading Node

Not required to build this — see the top. Worth doing when convenient, because
**Node 18 reached end-of-life on 30 April 2025** and gets no updates at all,
including security patches. Node 20 followed on 30 April 2026. The supported
lines are **22 (Maintenance LTS), 24 (Active LTS)** and **26 (Current)**.
Aim for **24**.

**Option A — nvm (recommended).** Installs Node into your home folder: no
`sudo`, no system packages touched, and reversible in one command if anything
misbehaves. Get the current install line from
[github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm#installing-and-updating) —
it has a version number in the URL that changes, so copy it from there. Close and
reopen your terminal, then:

```
nvm install 24
nvm use 24
nvm alias default 24
```

The third line is the one that makes it stick for new terminals. To undo the
whole thing: `nvm use system`.

**Option B — system-wide, two commands.** Simpler, but it replaces the Node your
whole machine uses:

```
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**After either one**, from inside `naoshi-app`: delete the `node_modules` folder
and run `npm install` again. This project has no native dependencies so it would
probably survive without it, but it takes thirty seconds and rules out a whole
category of confusing errors.
