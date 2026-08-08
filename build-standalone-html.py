#!/usr/bin/env python3
"""
build-standalone-html.py — wrap a kana module into one .html file that runs
from disk with no server, no network, and no publishing.

Built for handing a working build to someone directly — the voice contributor
reviewing how her recordings are used, a reviewer, anyone without an account.
They double-click the file and it opens in a browser.

WHY NOT AN ARTIFACT
    A published artifact has to be written out by Claude in a response, and the
    audio-bearing bundle is ~800 KB of mostly base64 — far past what any single
    response can emit. The artifact route therefore drops the recordings, which
    for this audience is the entire point. A local file has no size ceiling and
    puts nothing on a public URL.

WHAT GOES IN
    <module>-artifact.jsx from Audio/build-artifact-bundle.py, which already has
    the kana sprite embedded. React and ReactDOM are bundled in, so the file has
    no external requests at all — it works with the network off.

USAGE
    python3 build-standalone-html.py                     # both modules
    python3 build-standalone-html.py --module hiragana-module-artifact.jsx
    python3 build-standalone-html.py --no-minify         # readable bundle

OUTPUT
    <module>-standalone.html

REQUIRES esbuild, react and react-dom resolvable from --node-modules.
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))

# The modules persist progress through window.storage, which the artifact host
# provides and a plain browser does not. Without a shim loadProgress() quietly
# returns {} on every launch and saveProgress() logs an error on every change —
# the app works but forgets everything, which reads as broken to a reviewer.
# localStorage first, in-memory if the browser refuses it (Chrome blocks
# localStorage on file:// URLs in some configurations).
STORAGE_SHIM = """
<script>
(function () {
  var mem = {}, backing = null;
  try {
    var probe = "__naoshi_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    backing = window.localStorage;
  } catch (e) { backing = null; }
  window.storage = {
    get: function (k) {
      try {
        var v = backing ? backing.getItem(k) : (k in mem ? mem[k] : null);
        return Promise.resolve(v === null || v === undefined ? null : { value: v });
      } catch (e) { return Promise.resolve(null); }
    },
    set: function (k, v) {
      try { if (backing) backing.setItem(k, v); else mem[k] = v; } catch (e) { mem[k] = v; }
      return Promise.resolve();
    },
  };
  if (!backing) {
    console.info("Progress is kept for this session only — this browser blocks "
               + "local storage for files opened directly from disk.");
  }
})();
</script>
"""

SHELL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>
  html, body {{ margin: 0; padding: 0; background: #F7F6F2; }}
  #root {{ min-height: 100vh; }}
</style>
{storage}
</head>
<body>
<div id="root"></div>
<script>
{bundle}
</script>
</body>
</html>
"""

ENTRY = """import { createRoot } from "react-dom/client";
import Mod from "MODULE_PATH";
createRoot(document.getElementById("root")).render(<Mod />);
"""


def build(module_path, node_modules, esbuild, minify):
    name = os.path.basename(module_path)
    src = open(module_path, encoding="utf-8").read()
    if "const SPRITE_INLINE = null;" in src:
        print(f"warning: {name} has no embedded audio — run "
              f"Audio/build-artifact-bundle.py first, or this build will fall "
              f"back to speech synthesis")
    title = re.sub(r"-artifact$", "", name.replace(".jsx", ""))
    title = title.replace("-module", "").replace("-", " ").strip().title() + " — Naoshi"

    with tempfile.TemporaryDirectory(prefix="naoshi-html-") as tmp:
        # Build inside node_modules' directory tree so esbuild resolves react
        # without a symlink dance.
        work = os.path.join(os.path.dirname(node_modules), "_build")
        os.makedirs(work, exist_ok=True)
        mod_copy = os.path.join(work, "mod.jsx")
        shutil.copyfile(module_path, mod_copy)
        entry = os.path.join(work, "entry.jsx")
        with open(entry, "w", encoding="utf-8") as f:
            f.write(ENTRY.replace("MODULE_PATH", "./mod.jsx"))

        out = os.path.join(tmp, "bundle.js")
        cmd = [esbuild, entry, "--bundle", "--format=iife",
               "--loader:.jsx=jsx", "--jsx=automatic",
               "--define:process.env.NODE_ENV=\"production\"",
               f"--outfile={out}"]
        if minify:
            cmd.append("--minify")
        r = subprocess.run(cmd, capture_output=True, text=True)
        shutil.rmtree(work, ignore_errors=True)
        if r.returncode != 0:
            sys.exit(f"error: bundling {name} failed\n{r.stderr[-3000:]}")

        bundle = open(out, encoding="utf-8").read()

    # A literal </script> anywhere in the bundle would close the tag early.
    # Nothing here should contain one, but a silent truncation is a miserable
    # bug to chase, so neutralise it rather than trust that.
    bundle = bundle.replace("</script>", "<\\/script>")

    html = SHELL.format(title=title, storage=STORAGE_SHIM, bundle=bundle)
    out_path = os.path.join(os.path.dirname(module_path),
                            name.replace("-artifact.jsx", "-standalone.html"))
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"{name}")
    print(f"   bundle : {len(bundle) // 1024} KB js"
          f"{' (minified)' if minify else ''}")
    print(f"   output : {os.path.basename(out_path)}  "
          f"{os.path.getsize(out_path) // 1024} KB — open it in any browser")
    return out_path


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--module", action="append")
    ap.add_argument("--node-modules",
                    default=os.environ.get("NAOSHI_NODE_MODULES", ""))
    ap.add_argument("--esbuild", default=os.environ.get("NAOSHI_ESBUILD", "esbuild"))
    ap.add_argument("--no-minify", action="store_true")
    args = ap.parse_args()

    if not args.node_modules or not os.path.isdir(args.node_modules):
        sys.exit("error: --node-modules must point at a directory containing "
                 "react and react-dom (or set NAOSHI_NODE_MODULES)")
    if not shutil.which(args.esbuild) and not os.path.isfile(args.esbuild):
        sys.exit(f"error: esbuild not found at {args.esbuild}")

    mods = args.module or [os.path.join(HERE, "hiragana-module-artifact.jsx"),
                           os.path.join(HERE, "katakana-module-artifact.jsx")]
    for m in mods:
        if not os.path.isfile(m):
            sys.exit(f"error: no such module: {m}")
        build(m, args.node_modules, args.esbuild, not args.no_minify)


if __name__ == "__main__":
    main()
