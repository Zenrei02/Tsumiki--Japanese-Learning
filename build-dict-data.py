#!/usr/bin/env python3
"""Build the dictionary's static data — JMdict words and KANJIDIC2 kanji as CDN shards.

Session 34. See dictionary-drawer-design-v1.md; this is its option B.

WHERE THE DATA COMES FROM — TWO SOURCES, DELIBERATELY (Session 34).
edrdg.org is outside the egress allowlist from the sandbox AND from zenpop. What
IS reachable, from zenpop only, is GitHub, where scriptin/jmdict-simplified
republishes JMdict and KANJIDIC2 as JSON every week. That is the CONTENT source:
current words, current senses, current kanji.

    python3 build-dict-data.py --fetch      # latest release → ~/work/jms/

It drops one thing this script needs. JMdict marks frequency with priority tags
(ichi1, news1, nf01…), and jmdict-simplified flattens them to a single
`common: true/false`. The ranking below is built on the tags, so they come from
a second source: the PyPI package `jamdict-data` (dated 2021-04-17), used ONLY
as a table of priority tags keyed by JMdict entry id — ids are stable across
releases. Measured on the 2026-09-14 release: 98.5% of today's common entries
have their 2021 tags; the rest are ranked from the common flag (see RANK).

    pip download jamdict-data --no-deps -d ~/work/pypi
    tar xzf ~/work/pypi/jamdict_data-1.5.tar.gz -C ~/work/pypi
    xz -dk ~/work/pypi/jamdict_data-1.5/jamdict_data/jamdict.db.xz

The first build (Sep 19 morning) read everything from the 2021 database. It
was five years stale; this replaced it the same day.

THE LICENCE, WHICH SHAPES THE CODE. JMdict and KANJIDIC2 are CC BY-SA 4.0 —
commercial use allowed, attribution on every screen that shows the data, and
everything this script writes is a derivative database under the same licence.
EXCEPT: KANJIDIC2's SKIP codes are CC BY-NC-SA — noncommercial. They live in
`queryCodes` in the JSON (and `query_code` in the 2021 database), and this script
reads neither. Not filtered out afterwards; never read. A paid tier cannot ship
what was never in the pipeline.

WHAT IT WRITES (tsumiki-app/public/dict/)
  x/NNN.json    search index: 2-char prefix of every written and kana form
                (katakana folded to hiragana) → previews, most common first
  f/NNN.json    full entries, bucketed by id — one fetch once a preview is chosen
  e/NNN.json    English index: gloss token → previews
  k/NNN.json    kanji: KANJIDIC2 readings/meanings + the words containing it
  meta.json     bucket counts, hash, source version, the attribution line

A preview is [id, headword, reading, gloss, rank(, form)] — see preview(). Buckets are FNV-1a over
UTF-16 code units, mod the bucket count in meta.json — lib code must hash the
same way, and test-dict-hash.py holds both ends to one answer.

RANK — "the most common interpretation". JMdict marks frequency with priority
tags, and the obvious reading of them is wrong for a learner. nf01–nf48 rank
NEWSPAPER frequency, and newspapers write formally: by nf alone 喫する (nf18)
outranks 食べる (nf25), and 行く — which has no nf band at all — lands behind
hundreds of news words. The first version shipped exactly that ordering.

So the tier comes from WHICH list a word is on, and nf only breaks ties inside it:
    tier 0 (+0)    ichi1 or spec1 — the general-vocabulary list, hand-picked core
    tier 1 (+300)  news1 / spec2 / gai1 without the above
    tier 2 (+700)  only a second-tier tag (news2, ichi2, gai2)
    tier 3 (+1500) no priority tag at all
    rank = tier + 5 × nf-band + (archaic/rare ? 500 : 0)
    where a word with no nf band borrows one from its rarest kanji's KANJIDIC2
    frequency (÷50), or 25 if it is all kana — see the comment in main().
An entry with no 2021 tags (new since, or renumbered) that the current release
marks common goes in tier 0 with a borrowed band; one the current release no
longer marks common is held to at least tier 2, whatever 2021 said.
Particles tagged common go to 0: they are the most frequent words in the
language and never the rare sense of anything, and without this は looks up as
"leaf" before it looks up as the topic marker.
Within an entry, JMdict orders senses by how often they are meant, so sense 0 of
the best-ranked entry IS the most common interpretation; the module highlights
exactly that and nothing it had to guess.

    python3 build-dict-data.py --measure            # report, write nothing
    python3 build-dict-data.py                      # write the shards (first time)
    python3 build-dict-data.py --overwrite          # rebuild in place
"""
import argparse, json, os, re, sqlite3, sys, shutil, gzip, pathlib
from collections import defaultdict

HERE = pathlib.Path(__file__).parent
JMS_DIR = pathlib.Path.home() / "work/jms"
PRIORITY_DB = pathlib.Path.home() / "work/pypi/jamdict_data-1.5/jamdict_data/jamdict.db"
JMS_REPO = "https://github.com/scriptin/jmdict-simplified"

# jmdict-simplified gives part-of-speech as JMdict entity codes.
POS_CODES = {
    "n": "noun", "vs": "suru", "vs-s": "suru verb", "vs-i": "suru verb", "vs-c": "suru verb",
    "vz": "zuru verb", "vt": "transitive", "vi": "intransitive", "v1": "ichidan verb",
    "v1-s": "ichidan verb", "vk": "kuru verb", "adj-i": "i-adj", "adj-ix": "i-adj",
    "adj-na": "na-adj", "adj-no": "no-adj", "adj-pn": "pre-noun", "adj-t": "taru-adj",
    "adv": "adverb", "adv-to": "adverb", "exp": "expression", "prt": "particle",
    "pn": "pronoun", "conj": "conjunction", "int": "interjection", "ctr": "counter",
    "suf": "suffix", "n-suf": "suffix", "pref": "prefix", "n-pref": "prefix",
    "aux": "auxiliary", "aux-v": "auxiliary", "aux-adj": "auxiliary", "num": "number",
    "cop": "copula",
}
def pos_label(code):
    if code in POS_CODES: return POS_CODES[code]
    if code.startswith("v5"): return "godan verb"
    if code.startswith(("v2", "v4")): return "classical verb"
    return None
DEMOTE_CODES = {"arch", "obs", "rare", "obsc"}
SEARCH_ONLY = {"sK", "sk"}   # spellings JMdict keeps for search, never as a headword

def newest(pattern):
    found = sorted(JMS_DIR.glob(pattern))
    return found[-1] if found else None

def fetch():
    """Download the latest jmdict-simplified release into JMS_DIR (zenpop only —
    GitHub is not reachable from the sandbox)."""
    import urllib.request, tarfile, urllib.parse
    JMS_DIR.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(JMS_REPO + "/releases/latest", timeout=60) as r:
        tag = urllib.parse.unquote(r.geturl().rsplit("/", 1)[1])
    print("latest release:", tag)
    for name in (f"jmdict-eng-{tag}.json.tgz", f"kanjidic2-en-{tag}.json.tgz"):
        url = f"{JMS_REPO}/releases/download/{urllib.parse.quote(tag)}/{urllib.parse.quote(name)}"
        dst = JMS_DIR / name
        with urllib.request.urlopen(url, timeout=300) as r, open(dst, "wb") as out:
            out.write(r.read())
        with tarfile.open(dst) as t:
            t.extractall(JMS_DIR, filter="data")
        print(f"  {name}: {dst.stat().st_size/1e6:.1f} MB")
OUT = HERE / "tsumiki-app/public/dict"
BUCKETS = {"x": 512, "f": 512, "e": 256, "k": 128}
COMMON = {"news1", "ichi1", "spec1", "spec2", "gai1"}
DEMOTE = {"archaism", "obsolete term", "rare term", "obscure term", "rarely-used kanji form"}
ATTRIBUTION = ("Dictionary data: JMdict and KANJIDIC2, © Electronic Dictionary Research and "
               "Development Group, CC BY-SA 4.0")
WORDS_PER_KANJI = 30
PREVIEWS_PER_TOKEN = 25
GLOSS_CHARS = 48
# English search is for "what's the Japanese for X?", which is a question about
# ordinary words. Rank < 1500 keeps every common word and every non-common word
# JMdict has not flagged archaic/rare; the rest stay findable from Japanese.
EN_RANK_CUTOFF = 1500
# The tiers. FULL is all of JMdict (~191k entries, ~28 MB gzipped): right for a
# reference tool, wrong to commit to git on every rebuild. CORE keeps every
# entry JMdict marks as common or gives a newspaper-frequency band, plus every
# single-kanji word — what a learner meets in real text, and what the checker's
# rewrites are made of. A word outside CORE shows as "not in this dictionary",
# never as an error. Measured numbers for both are in dictionary-drawer-design-v1.md.
CORE_RANK_CUTOFF = 1500   # below this = carries at least one priority tag
STOP = set("a an the of to in on at for by with from as or and be is are was it its "
           "one's someone something oneself etc e.g. i.e. no not".split())

def fnv(s):
    h = 0x811C9DC5
    b = s.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h

def hira(s):
    # Katakana → hiragana, so a reading typed either way finds the word. ー stays.
    return "".join(chr(ord(c) - 0x60) if "ァ" <= c <= "ヶ" else c for c in s)

def key(form):
    f = hira(form)
    return f[:2]

POS = [  # JMdict's pos strings are sentences; the drawer needs a word.
    ("noun or participle which takes the aux. verb suru", "suru"),
    ("noun (common)", "noun"), ("adjectival nouns or quasi-adjectives", "na-adj"),
    ("adjective (keiyoushi)", "i-adj"), ("Godan verb", "godan verb"),
    ("Ichidan verb", "ichidan verb"), ("adverb", "adverb"), ("expressions", "expression"),
    ("pronoun", "pronoun"), ("conjunction", "conjunction"), ("interjection", "interjection"),
    ("counter", "counter"), ("suffix", "suffix"), ("prefix", "prefix"), ("particle", "particle"),
    ("Kuru verb", "kuru verb"), ("suru verb", "suru verb"), ("auxiliary", "auxiliary"),
    ("numeric", "number"), ("nouns which may take the genitive case particle", "no-adj"),
    ("pre-noun adjectival", "pre-noun"), ("intransitive verb", "intransitive"),
    ("transitive verb", "transitive"),
]
def short_pos(p):
    # PREFIX match only. A substring match read "nouns which may take the
    # genitive case PARTICLE 'no'" as a particle, which — through the particle
    # rule in RANK — sent ベテラン and 未経験 to rank 0, above 経験 itself.
    for needle, label in POS:
        if p.startswith(needle):
            return label
    return None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--measure", action="store_true")
    ap.add_argument("--fetch", action="store_true", help="download the latest jmdict-simplified release, then build")
    ap.add_argument("--jmdict", default=None, help="jmdict-eng-*.json (default: newest in ~/work/jms)")
    ap.add_argument("--kanjidic", default=None, help="kanjidic2-en-*.json (default: newest in ~/work/jms)")
    ap.add_argument("--priority", default=str(PRIORITY_DB), help="jamdict.db — priority tags only")
    ap.add_argument("--tier", choices=["core", "full"], default="core")
    ap.add_argument("--overwrite", action="store_true")
    a = ap.parse_args()
    if a.fetch: fetch()
    jm_path = pathlib.Path(a.jmdict) if a.jmdict else newest("jmdict-eng-*.json")
    kd_path = pathlib.Path(a.kanjidic) if a.kanjidic else newest("kanjidic2-en-*.json")
    for label, path in (("jmdict", jm_path), ("kanjidic", kd_path), ("priority", pathlib.Path(a.priority))):
        if not path or not path.exists():
            sys.exit(f"no {label} source at {path} — see the docstring for how to fetch it")
    jm = json.load(open(jm_path, encoding="utf-8"))
    kd = json.load(open(kd_path, encoding="utf-8"))
    TAGS = jm.get("tags", {})

    # Priority tags, 2021, by entry id. Nothing else is read from this file.
    c = sqlite3.connect(a.priority)
    pri21 = defaultdict(set)
    for idseq, t in c.execute("select k.idseq, p.text from Kanji k join KJP p on p.kid = k.id "
                              "union all select k.idseq, p.text from Kana k join KNP p on p.kid = k.id"):
        pri21[idseq].add(t)

    # KANJIDIC2 newspaper frequency per character, 1 (most common) … ~2500.
    # Read first: word rank borrows it when JMdict gives a word no nf band.
    # `queryCodes` is never touched — it carries SKIP.
    kfreq = {ch["literal"]: ch["misc"]["frequency"] for ch in kd["characters"]
             if (ch.get("misc") or {}).get("frequency")}

    # ————— words —————
    entries, hidden = {}, {}
    for w in jm["words"]:
        idseq = int(w["id"])
        ks = [(k["text"], k["common"]) for k in w["kanji"] if not set(k["tags"]) & SEARCH_ONLY]
        rs = [(r["text"], r["common"]) for r in w["kana"] if not set(r["tags"]) & SEARCH_ONLY]
        hid = [x["text"] for x in w["kanji"] + w["kana"] if set(x["tags"]) & SEARCH_ONLY]
        if not rs: continue
        ss, demote, last_pos = [], False, []
        for sense in w["sense"]:
            g = [x["text"] for x in sense["gloss"] if x.get("lang", "eng") == "eng"]
            if not g: continue
            pos = list(dict.fromkeys(x for x in (pos_label(c2) for c2 in sense["partOfSpeech"]) if x))
            pos = pos or last_pos                      # JMdict: pos carries forward
            last_pos = pos
            if not ss and set(sense["misc"]) & DEMOTE_CODES: demote = True
            tags = [TAGS.get(m, m) for m in sense["misc"]]
            tags = [t for t in tags if len(t) <= 40][:3] + [TAGS.get(f2, f2) for f2 in sense["field"]][:2]
            ss.append([pos, g, tags])
        if not ss: continue
        common_now = any(cm for _, cm in ks + rs)
        pri = pri21.get(idseq, set())
        nfs = [int(p[2:]) for p in pri if p.startswith("nf") and p[2:].isdigit()]
        if nfs:
            nf = min(nfs)
        else:
            # No band. JMdict attaches nf to particular spellings, and some of the
            # commonest words in the language — 行く, 本 — end up with none, which
            # the first ranking read as "rare". Borrow the band of the word's
            # rarest kanji instead (freq 20 → band 1); kana-only words sit mid-table.
            kch = [ch for t, _ in ks[:1] for ch in t if "\u4e00" <= ch <= "\u9fff"]
            nf = (min(50, max(1, -(-max(kfreq.get(ch, 2600) for ch in kch) // 50)))
                  if kch else 25)
        if pri:
            tier = (0 if pri & {"ichi1", "spec1"} else 300 if pri & {"news1", "spec2", "gai1"}
                    else 700 if pri & {"news2", "ichi2", "gai2"} else 1500)
            if not common_now: tier = max(tier, 700)   # the current release has demoted it
        else:
            tier = 0 if common_now else 1500           # new since 2021 (or renumbered)
        rank = tier + 5 * nf + (500 if demote else 0)
        if tier < 1500 and "particle" in ss[0][0]: rank = 0
        if a.tier == "core" and rank >= CORE_RANK_CUTOFF and not any(len(t) == 1 for t, _ in ks):
            continue
        entries[idseq] = {
            "i": idseq,
            "k": [[t, 1 if cm else 0] for t, cm in ks],
            "r": [[t, 1 if cm else 0] for t, cm in rs],
            "s": ss, "c": rank,
        }
        if hid: hidden[idseq] = hid

    def preview(e, form):
        # [id, headword, reading, gloss, rank(, form)] — the matched form is only
        # carried when it is neither the headword nor the reading (a secondary
        # spelling), because in the common case it is one of them and the client
        # can fold them itself. Reading is "" when it equals the headword (kana words).
        head = e["k"][0][0] if e["k"] else e["r"][0][0]
        read = e["r"][0][0]
        g = e["s"][0][1][0]
        if len(g) > GLOSS_CHARS: g = g[:GLOSS_CHARS - 1].rstrip() + "…"
        out = [e["i"], head, "" if read == head else read, g, e["c"]]
        if form and form not in (hira(head), hira(read)): out.append(form)
        return out

    x = defaultdict(lambda: defaultdict(list))
    for e in entries.values():
        seen = set()   # one preview per entry per key: テレビ局 and テレビきょく share てれ
        for t, _ in e["k"] + e["r"] + [[h, 0] for h in hidden.get(e["i"], [])]:
            k2 = key(t)
            if k2 in seen: continue
            seen.add(k2)
            x[fnv(k2) % BUCKETS["x"]][k2].append(preview(e, hira(t)))
    for b in x.values():
        for k2 in b: b[k2].sort(key=lambda p: (p[4], len(p[1])))

    f = defaultdict(dict)
    for e in entries.values():
        f[fnv(str(e["i"])) % BUCKETS["f"]][str(e["i"])] = e

    # English ordering: how WELL the gloss matches, then which sense, then rank.
    # Rank alone put 囲碁 first for "go" — the board game is a common word, and
    # it IS "go". But its gloss says "go (board game)": the parenthetical marks
    # a narrowed sense, where 行く's "to go" is the word itself. So:
    #   0  a gloss IS the word ("to go", "book")
    #   1  a gloss is the word plus a qualifier ("go (board game)")
    #   2  the word merely appears in a gloss ("to see off")
    def norm(g):
        g = g.lower().strip().rstrip(".!?")
        return g[3:] if g.startswith("to ") else g
    en = defaultdict(list)
    for e in entries.values():
        if e["c"] >= EN_RANK_CUTOFF: continue
        best = {}
        for si, (_, g, _) in enumerate(e["s"][:2]):
            for gg in g:
                bare = norm(re.sub(r"\(.*?\)", " ", gg)).strip()
                bare = re.sub(r"\s+", " ", bare)
                for w in re.findall(r"[a-z][a-z'\-]+", bare):
                    if w in STOP: continue
                    # "(esp. …)" and "(e.g. …)" clarify rather than narrow —
                    # 水 is "water (esp. cool, fresh water …)" and is still the word.
                    narrowed = re.search(r"\((?!esp\.|e\.g\.|i\.e\.)", gg)
                    q = 0 if (bare == w and not narrowed) else 1 if bare == w else 2
                    best[w] = min(best.get(w, (9, 9)), (q, si))
        for w, (q, si) in best.items():
            en[w].append((q, si, e))
    e_out = defaultdict(dict)
    for w, lst in en.items():
        lst.sort(key=lambda t: (t[0], t[1], t[2]["c"]))
        lst = [(t[1], t[2]) for t in lst]
        e_out[fnv(w) % BUCKETS["e"]][w] = [preview(e, "") for _, e in lst[:PREVIEWS_PER_TOKEN]]

    # ————— kanji (KANJIDIC2) — queryCodes is never read: it carries SKIP —————
    # Grade and the pre-2010 JLPT level are left out on purpose: the module shows
    # neither, and a field that ships is a field someone will one day display.
    kk = {}
    for ch in kd["characters"]:
        misc = ch.get("misc") or {}
        on, kun, mean = [], [], []
        for g in (ch.get("readingMeaning") or {}).get("groups", []):
            for r in g.get("readings", []):
                if r["type"] == "ja_on": on.append(r["value"])
                elif r["type"] == "ja_kun": kun.append(r["value"])
            for m in g.get("meanings", []):
                if m.get("lang") in (None, "en"): mean.append(m["value"])
        kk[ch["literal"]] = {"c": ch["literal"], "s": (misc.get("strokeCounts") or [None])[0],
                             "f": misc.get("frequency"), "on": on, "kun": kun, "m": mean}
    containing = defaultdict(list)
    for e in entries.values():
        for t, _ in e["k"]:
            for ch in set(t):
                if "一" <= ch <= "鿿": containing[ch].append((e, t))
    k_out = defaultdict(dict)
    for info in kk.values():
        ch = info["c"]
        ws = sorted(containing.get(ch, []), key=lambda t: (t[0]["c"], len(t[1])))
        uniq, seen = [], set()
        for e, t in ws:
            if e["i"] in seen: continue
            seen.add(e["i"]); uniq.append(preview(e, ""))
            if len(uniq) >= WORDS_PER_KANJI: break
        info = {k: v for k, v in info.items() if v not in (None, [], "")}
        info["w"] = uniq
        k_out[fnv(ch) % BUCKETS["k"]][ch] = info

    files = {}
    for name, d in (("x", x), ("f", f), ("e", e_out), ("k", k_out)):
        for b, content in d.items():
            files[f"{name}/{b:03d}.json"] = \
                json.dumps(content, ensure_ascii=False, separators=(",", ":"))
    meta = {"tier": a.tier, "buckets": BUCKETS, "hash": "fnv1a32-utf16", "source": f"jmdict-simplified {jm.get('version')} (JMdict {jm.get('dictDate')}, KANJIDIC2 {kd.get('dictDate')}); priority tags from jamdict-data 1.5 (2021-04-17)",
            "entries": len(entries), "kanji": len(kk), "attribution": ATTRIBUTION,
            "links": ["https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project",
                      "https://www.edrdg.org/wiki/index.php/KANJIDIC_Project",
                      "https://www.edrdg.org/edrdg/licence.html"]}
    files["meta.json"] = json.dumps(meta, ensure_ascii=False, indent=1)

    by_kind = defaultdict(lambda: [0, 0, 0, 0])
    for p, s in files.items():
        raw = len(s.encode()); gz = len(gzip.compress(s.encode(), 6))
        kd = by_kind[p.split("/")[0]]
        kd[0] += 1; kd[1] += raw; kd[2] += gz; kd[3] = max(kd[3], gz)
    tot_raw = sum(v[1] for v in by_kind.values()); tot_gz = sum(v[2] for v in by_kind.values())
    print(f"entries {len(entries):,}   kanji {len(kk):,}   files {len(files):,}")
    print(f"{'kind':6}{'files':>7}{'raw MB':>10}{'gzip MB':>10}{'largest gz KB':>15}")
    for k, (n, r, g, mx) in sorted(by_kind.items()):
        print(f"{k:6}{n:>7}{r/1e6:>10.1f}{g/1e6:>10.1f}{mx/1e3:>15.1f}")
    print(f"{'total':6}{len(files):>7}{tot_raw/1e6:>10.1f}{tot_gz/1e6:>10.1f}")
    if a.measure: return

    # Overwrites in place and NEVER deletes. A rebuild with the same bucket
    # counts rewrites every file; anything left in the directory that this run
    # did not write is stale (bucket counts changed) and is REPORTED, not
    # removed — the folder does not grant deletes, and a silent leftover shard
    # would be served forever.
    if OUT.exists() and not a.overwrite:
        sys.exit(f"{OUT} exists — pass --overwrite to rewrite it in place")
    for p, s in files.items():
        dst = OUT / p
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(s, encoding="utf-8")
    stale = [str(q.relative_to(OUT)) for q in OUT.rglob("*.json") if str(q.relative_to(OUT)) not in files]
    print(f"wrote {len(files):,} files to {OUT}")
    if stale:
        print(f"⚠️  {len(stale)} STALE file(s) not written by this run — delete them by hand:")
        for q in stale[:20]: print("   ", q)

if __name__ == "__main__":
    main()
