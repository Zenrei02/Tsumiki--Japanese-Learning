import { useState, useEffect, useRef } from "react";

// ————— Design tokens —————
const T = {
  paper: "#F7F6F2",
  sheet: "#FFFFFF",
  ink: "#22252B",
  sub: "#6E7178",
  hairline: "#E4E2DB",
  shu: "#C7351B", // vermilion — errors, the red pen
  ai: "#3D5A80", // indigo — correct but unnatural
  note: "#907119", // yellow — worth knowing (darkened; 3.2:1 at #B08A1F)
  noteBg: "#FAF3E0",
  ok: "#3E7C4F",
  jpFont: '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif',
  uiFont: '-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Noto Sans JP",sans-serif',
};

// Matches the three tiers in grammar-module.jsx exactly — same type values, same
// labels, same colours. The two tools now share one feedback vocabulary.
const TIER = {
  fix:       { label: "FIX",                    colour: T.shu,  mark: "mark-fix",   html: "err",  count: "to fix" },
  unnatural: { label: "CORRECT, BUT UNNATURAL", colour: T.ai,   mark: "mark-unnat", html: "sug",  count: "unnatural" },
  note:      { label: "WORTH KNOWING",          colour: T.note, mark: "mark-note",  html: "note", count: "worth knowing" },
};
// Unknown or missing type falls back to fix: a mislabelled real error still
// gets seen, where a mislabelled note would be quietly dismissed.
const tierOf = (iss) => TIER[iss && iss.type] || TIER.fix;

const CATEGORY_LABELS = {
  particle: "Particle",
  conjugation: "Conjugation",
  word_choice: "Word choice",
  word_order: "Word order",
  register: "Register",
  naturalness: "Naturalness",
  orthography: "Orthography",
};

const CONTEXTS = [
  { id: "none", label: "No context" },
  { id: "casual", label: "Casual message to a friend" },
  { id: "polite", label: "Polite email" },
  { id: "business", label: "Business writing" },
];

const SAMPLES = [
  "昨日は友達と映画をみりました。とても楽しいでした。",
  "私は昨日私の友達に会いました。私はとても嬉しかったです。",
  "あなたは今週末、暇ですか。あなたと出かけたいです。",
  "寒いので、窓を閉まりました。",
  "私は日本語を話せます。すしを好きです。",
  "週末に海へ行きました。天気がとてもよかったです。",
];

const SYSTEM_PROMPT = `You are the analysis engine for a Japanese writing feedback tool. Your users are adult English speakers learning Japanese. They submit Japanese text they have written; you return corrections and explanations as structured JSON.

## Your task
Analyze the submitted Japanese text and identify issues in these categories:
- "particle" — wrong or missing particle (は/が, に/で, を, etc.)
- "conjugation" — incorrect verb/adjective form (tense, negation, te-form, potential, passive, etc.)
- "word_choice" — wrong word, false friend, or unnatural collocation
- "word_order" — grammatical but unnatural ordering
- "register" — politeness/formality mismatch (plain vs です/ます mixing, keigo errors, tone inappropriate for stated context)
- "naturalness" — grammatically correct but a native speaker wouldn't phrase it this way
- "orthography" — kanji/kana usage errors, wrong kanji homophone

## Critical rules
1. DO NOT invent errors. If the text is correct and natural, return an empty issues array. Over-correcting harms learners more than missing an error.
2. Every issue has a "type":
   - "fix" — grammatically wrong; must be corrected. A learner must be able to trust that "fix" means genuinely wrong.
   - "unnatural" — grammatically CORRECT, but a native speaker would not phrase it this way: stiff or textbook-flavoured wording, direct-translation phrasing, odd collocations, unnecessary pronouns. Acknowledge that it is correct, then show the natural alternative.
   - "note" — neither wrong nor unnatural; a growth opportunity. Examples: a word written in kana where the kanji is standard and at or near the learner's level (e.g. いたい → 痛い, naming the kanji's JLPT level); an optional politeness upgrade that fits the stated context.
   Never mark correct kana usage as a "fix" — kana-for-kanji is always a "note". Choose exactly one type per issue. When torn between "fix" and "unnatural", ask: would this be marked wrong on a grammar test? If not, it is "unnatural".
   "note" IS NOT A BUCKET FOR MARGINAL OBSERVATIONS. Emit one only when the learner would actually do something differently next time. If a note would not change what they write, omit it. Zero notes is the correct output for a good sentence, and text carrying more notes than real issues is over-annotated.
3. Preserve the writer's intended meaning. Never "improve" content, only language. If the intended meaning is ambiguous, say so in the explanation rather than guessing.
4. Explanations are for English speakers: explain WHY in plain English, referencing the underlying pattern, and contrast with English where the error likely came from L1 interference (e.g., direct translation).
5. Assume plain or polite form are both acceptable unless the text mixes them or the user specifies a context.
6. Tag each issue with an approximate JLPT level of the grammar point involved (N5–N1).
7. DO NOT ASSERT A SINGLE RIGHT ANSWER WHEN THE LANGUAGE ALLOWS SEVERAL. Japanese frequently offers more than one valid phrasing, differing in nuance rather than correctness — 〜てもらう vs 〜てくれる, は vs が under contrast, 〜たら/〜ば/〜と/〜なら, plain vs polite, and many verb and collocation choices. When the writer's version is one of several defensible options, say so inside "explanation": name the alternative, and say in one clause WHEN a native would choose each. An alternative without a reason to choose it is noise — the contrast is the teaching, not the second option.
   This changes the TIER, not just the wording. If the writer's version is defensible, it is not a "fix". A "fix" means genuinely wrong, and asserting one answer where the language permits several is the most damaging error this tool can make: it teaches a false rule and it does so confidently. When in doubt between "fix" and "unnatural" on a phrasing that a native might plausibly use, choose "unnatural" and explain the difference.
   Do not manufacture alternatives. Most errors have exactly one correct repair, and inventing a second option for those is worse than offering none.

## The rewrite
"model_rewrite" is not a second opinion about the sentence. It is what the writer would have written had they applied the issues YOU just listed — no more and no less. Four rules govern it.

R1. MAKE THE MINIMUM EDIT THAT RESOLVES THE DIAGNOSIS. Change what your issues require; preserve every token they do not implicate — same words, same order, same script. This is not a licence to leave a diagnosed problem standing, and it is not an instruction to shorten or simplify. A rewrite that resolves nothing is worse than no rewrite at all.

R2. APPLY EVERY "fix" AND "unnatural" ISSUE, AND CHANGE NOTHING ELSE. If you stated a correction, make it. If you did not state it, do not make it. "note" issues are deliberately excluded: a note is a growth observation, not a correction, and silently applying one changes the writer's register without being asked. If the issues array is empty, "model_rewrite" is the input text, character for character.

R3. DECIDE WHETHER THE FAULT IS IN THE FORM OR IN THE WORD. Repair that one and leave the other alone.
   - The right word in the wrong FORM: fix the form, keep the word. If 会い is wanted as a nominalised 会うの, nominalise the writer's own verb — do not reach for 会議 or 待ち合わせ. If 孤立な is wanted as 孤立した, conjugate it — do not swap in 孤独.
   - The wrong WORD: replace it, and say so in the explanation. Do not adjust a particle beside a wrong word and leave the word standing; a sentence whose grammar has been tidied around the wrong word has not been corrected.
   Both directions are real, but they are not equally common. Substituting a different content word where a form of the writer's own word would serve is the more frequent failure and the more damaging one, because it quietly changes what they said.

R4. TREAT KANA AS THE WRITER WROTE IT UNLESS AN ISSUE NAMES THAT EXACT TOKEN. Never convert a run of kana to kanji inside the rewrite on your own initiative. A kana run may be a name — えり and とも are people, not 襟 and 友達 — and you frequently cannot tell which from the sentence alone. This does not disable the "note" tier: a note names the token it is about, and R2 already keeps notes out of the rewrite.

## L1-interference watchlist
English speakers make these errors constantly because English requires structures Japanese does not. Actively check for each of these — they are high priority even when the sentence is technically grammatical:
- PRONOUN OVERUSE: repeated 私/僕 etc. when the subject is clear from context (English requires a subject in every clause; Japanese drops it). Flag as "naturalness". Also flag unnecessary 私の when the possessor is obvious.
- あなた AS "YOU": using あなた to address or refer to someone is usually unnatural and can be disrespectful. The natural choice is the person's name + さん, a title/role, or omitting entirely. Flag as "register" or "naturalness" and explain the social dimension, not just the grammar.
- が VS を TRAPS: constructions that take が where English intuition says "object" — 好き/嫌い, 上手/下手, 欲しい, わかる, できる, and potential verb forms (日本語が話せる). Flag as "particle" with the specific construction named in pattern_name.
- TRANSITIVE/INTRANSITIVE PAIRS: wrong member of pairs like 開ける/開く, 閉める/閉まる, 始める/始まる, 出す/出る, 止める/止まる — including the matching particle (を with transitive, が with intransitive). English uses one verb for both ("open"), so learners default to the transitive form. Flag as "word_choice" and always check the particle agrees with the verb chosen.

## Output format
Respond with ONLY valid JSON, no markdown fences, no preamble:
{
  "overall": {
    "natural_score": <1-5, how natural the full text sounds>,
    "summary": "<one-sentence overall comment in English>"
  },
  "issues": [
    {
      "span": "<the exact substring from the input with the issue>",
      "category": "<one of the categories above>",
      "type": "fix" | "unnatural" | "note",
      "correction": "<the corrected substring>",
      "explanation": "<2-3 sentence English explanation of the rule/pattern>",
      "pattern_name": "<short reusable label, e.g. 'は vs が: new information'>",
      "jlpt": "N5" | "N4" | "N3" | "N2" | "N1"
    }
  ],
  "model_rewrite": "<the full text with your issues applied — see THE REWRITE rules R1-R4 above>",
  "readings": [["<kanji run>", "<hiragana reading>"], ...]
}
The "span" field must match the input text exactly, character for character.
Keep "span" as SHORT as possible — the smallest substring that contains the problem, not the clause or sentence around it. A span covering most of the sentence tells the writer nothing about where to look. For a particle, an ending, or a verb choice this is usually a few characters.
Spans must NOT overlap or nest inside one another. If two issues concern the same stretch of text, either merge them into a single issue or narrow each span so they are disjoint.

## Readings
Populate "readings" so the interface can print furigana. Cover every kanji that appears anywhere in the input text, in any "correction", and in "model_rewrite".
- The first element of each pair is a run of kanji characters ONLY — no kana, no punctuation. Split at the first kana: 食べました gives "食", 大きい gives "大", 昨日 gives "昨日", 友達 gives "友達".
- The second element is that run's reading in hiragana, in this context. Where a kanji's reading changes with context, give the reading it has here.
- One entry per distinct run; do not repeat a run you have already listed.
- Never use furigana markup inside any other field. "span" in particular must stay exactly as the writer typed it.`;

// ————— Furigana —————
// The model returns readings for bare kanji runs, so nothing is injected into
// the text itself: `span` stays byte-identical to the input and buildSegments
// keeps slicing on plain character offsets.
const KANJI_RE = /[\u3400-\u9FFF\u3005]/;

function rubyParts(text, map) {
  const out = [];
  let buf = "";
  const flush = () => { if (buf) { out.push({ t: buf }); buf = ""; } };
  let i = 0;
  while (i < text.length) {
    if (!KANJI_RE.test(text[i])) { buf += text[i]; i++; continue; }
    let j = i;
    while (j < text.length && KANJI_RE.test(text[j])) j++;
    const run = text.slice(i, j);
    // Longest-prefix match inside the run, so 日本語学校 works whether the model
    // returned it whole or as 日本語 + 学校.
    let k = 0;
    while (k < run.length) {
      let hit = null;
      for (let len = run.length - k; len > 0; len--) {
        const cand = run.slice(k, k + len);
        if (map[cand]) { hit = [cand, map[cand]]; break; }
      }
      if (hit) { flush(); out.push({ k: hit[0], r: hit[1] }); k += hit[0].length; }
      else { buf += run[k]; k++; }
    }
    i = j;
  }
  flush();
  return out;
}

// Unreadable kanji render bare rather than with a placeholder — a missing
// reading should be quiet, not a second error mark on the page.
function Ruby({ text, map }) {
  if (!text) return null;
  if (!map) return <>{text}</>;
  return (
    <>
      {rubyParts(text, map).map((p, i) =>
        p.k ? <ruby key={i}>{p.k}<rt>{p.r}</rt></ruby> : <span key={i}>{p.t}</span>
      )}
    </>
  );
}

// ————— Export —————
// Ruby survives an export in two ways: real <ruby> inside a self-contained HTML
// file, or 漢字(かんじ) parenthetical notation for plain text. The parenthetical
// form is the ordinary convention in learner materials and pastes intact into
// Notes, Notion, Anki, or an email.
const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function toPlain(text, map, furi) {
  if (!text) return "";
  if (!furi || !map) return text;
  return rubyParts(text, map).map((p) => (p.k ? `${p.k}(${p.r})` : p.t)).join("");
}

function toRubyHtml(text, map, furi) {
  if (!text) return "";
  if (!furi || !map) return esc(text);
  return rubyParts(text, map)
    .map((p) => (p.k ? `<ruby>${esc(p.k)}<rt>${esc(p.r)}</rt></ruby>` : esc(p.t)))
    .join("");
}

const stamped = () => new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
const fileStamp = () => new Date().toISOString().slice(0, 10);

function buildPlainReport({ text, result, context, furi }) {
  const map = result._readings;
  const ctx = CONTEXTS.find((c) => c.id === context);
  const L = [];
  L.push(`Naoshi — Japanese writing check`);
  L.push(stamped() + (context === "none" ? "" : ` · ${ctx.label}`));
  L.push("");
  L.push("WHAT YOU WROTE");
  L.push(toPlain(text, map, furi));
  L.push("");
  L.push(`NATURALNESS  ${result.overall.natural_score}/5`);
  L.push(result.overall.summary);
  L.push("");
  if (result.issues.length === 0) {
    L.push("No issues found.");
  } else {
    L.push(`ISSUES (${result.issues.length})`);
    result.issues.forEach((iss, i) => {
      const tag = [
        tierOf(iss).label,
        CATEGORY_LABELS[iss.category] || iss.category,
        iss.jlpt,
      ].filter(Boolean).join(" · ");
      L.push("");
      L.push(`${i + 1}. ${tag}`);
      L.push(`   ${toPlain(iss.span, map, furi)} → ${toPlain(iss.correction, map, furi)}`);
      L.push(`   ${iss.explanation}`);
      if (iss.pattern_name) L.push(`   Pattern: ${iss.pattern_name}`);
    });
  }
  if (result.model_rewrite) {
    L.push("");
    L.push("NATURAL VERSION");
    L.push(toPlain(result.model_rewrite, map, furi));
  }
  L.push("");
  L.push("Corrections are AI-generated and can be wrong.");
  return L.join("\n");
}

// One card per issue. Front / Back / Tags, tab-separated — Anki's default
// import shape, and readable as a spreadsheet if they don't use Anki.
function buildAnkiTsv({ result, furi }) {
  const map = result._readings;
  const clean = (s) => String(s ?? "").replace(/[\t\r\n]+/g, " ").trim();
  return result.issues
    .map((iss) => {
      const front = clean(toPlain(iss.span, map, furi));
      const back = clean(
        `${toPlain(iss.correction, map, furi)} — ${iss.explanation}` +
        (iss.pattern_name ? ` [${iss.pattern_name}]` : "")
      );
      const tags = ["naoshi", iss.category, iss.type, iss.jlpt].filter(Boolean).join(" ");
      return [front, back, tags].join("\t");
    })
    .join("\n");
}

function buildHtmlReport({ text, result, context, furi }) {
  const map = result._readings;
  const ctx = CONTEXTS.find((c) => c.id === context);
  const cards = result.issues.map((iss, i) => {
    const t = tierOf(iss);
    const span = toRubyHtml(iss.span, map, furi);
    // Striking through something that is already correct tells the learner it
    // was wrong. Only "fix" gets the line.
    const shown = iss.type === "fix" ? `<s>${span}</s>` : span;
    return `<li class="iss ${t.html}">
      <div class="tag">${t.label} · ${esc(CATEGORY_LABELS[iss.category] || iss.category)}${iss.jlpt ? " · " + esc(iss.jlpt) : ""}</div>
      <div class="jp">${shown} <span class="arrow">→</span> <b>${toRubyHtml(iss.correction, map, furi)}</b></div>
      <p>${esc(iss.explanation)}</p>
      ${iss.pattern_name ? `<div class="pat">Pattern: ${esc(iss.pattern_name)}</div>` : ""}
    </li>`;
  }).join("");

  return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Naoshi — ${esc(stamped())}</title>
<style>
  :root { --paper:#F7F6F2; --sheet:#fff; --ink:#22252B; --sub:#6E7178; --line:#E4E2DB; --shu:#C7351B; --ai:#3D5A80; --ok:#3E7C4F; --note:#907119; --noteBg:#FAF3E0; }
  body { background:var(--paper); color:var(--ink); margin:0; padding:32px 20px 64px;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Noto Sans JP",sans-serif; }
  .wrap { max-width:680px; margin:0 auto; }
  .jp { font-family:"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif; }
  ruby { ruby-position:over; } rt { font-size:.48em; color:var(--sub); line-height:1.2; }
  header { display:flex; align-items:baseline; gap:12px; }
  .logo { font-family:"Hiragino Mincho ProN","Yu Mincho",serif; font-size:30px; color:var(--shu); }
  h1 { font-size:18px; margin:0; } .meta { font-size:13px; color:var(--sub); }
  hr { border:0; border-top:1px solid var(--line); margin:18px 0 24px; }
  .card { background:var(--sheet); border:1px solid var(--line); border-radius:8px; padding:18px 20px; margin-bottom:16px; }
  .label { font-size:11px; letter-spacing:.6px; color:var(--sub); margin-bottom:8px; }
  .body { font-size:19px; line-height:2.5; }
  .score { font-size:14px; color:var(--sub); margin-top:12px; }
  ul { list-style:none; padding:0; margin:0; }
  .iss { background:var(--sheet); border:1px solid var(--line); border-left:3px solid var(--ai);
    border-radius:6px; padding:12px 16px; margin-bottom:10px; }
  .iss.err { border-left-color:var(--shu); }
  .iss.note { border-left-color:var(--note); background:var(--noteBg); }
  .tag { font-size:11px; font-weight:600; letter-spacing:.5px; color:var(--ai); margin-bottom:6px; }
  .iss.err .tag { color:var(--shu); }
  .iss.note .tag { color:var(--note); }
  .iss .jp { font-size:17px; line-height:2.2; margin-bottom:6px; }
  .iss s { color:var(--sub); text-decoration-color:var(--shu); } .arrow { color:var(--sub); margin:0 6px; }
  .iss p { font-size:14px; line-height:1.6; margin:0; }
  .pat { font-size:12px; color:var(--sub); margin-top:6px; }
  .ok { color:var(--ok); font-weight:600; }
  footer { font-size:12px; color:var(--sub); margin-top:24px; }
  @media print {
    body { background:#fff; padding:0; }
    .card,.iss { break-inside:avoid; border-color:#ccc; }
    footer { position:fixed; bottom:0; }
  }
</style></head><body><div class="wrap">
<header><span class="logo">直</span><div><h1>Naoshi</h1>
<div class="meta">${esc(stamped())}${context === "none" ? "" : " · " + esc(ctx.label)}</div></div></header>
<hr>
<div class="card">
  <div class="label">WHAT YOU WROTE</div>
  <div class="jp body">${toRubyHtml(text, map, furi)}</div>
  <div class="score">Naturalness ${esc(result.overall.natural_score)}/5 — ${esc(result.overall.summary)}</div>
</div>
${result.issues.length
  ? `<div class="label">ISSUES (${result.issues.length})</div><ul>${cards}</ul>`
  : `<div class="card"><span class="ok">No issues found.</span></div>`}
${result.model_rewrite
  ? `<div class="card"><div class="label ok">NATURAL VERSION</div><div class="jp body">${toRubyHtml(result.model_rewrite, map, furi)}</div></div>`
  : ""}
<footer>Corrections are AI-generated and can be wrong. Generated by Naoshi.</footer>
</div></body></html>`;
}

// ————— Contribution payload —————
// Paste your Google Form URL here and the "open the form" link appears after a
// successful copy. Left blank, the button still copies; the link just hides.
// Prefills the ref code so the learner pastes once instead of twice, and a
// mistyped code can't orphan a response. Only the code travels in the URL —
// never the payload, which carries the learner's own writing.
const FEEDBACK_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScLA2qaZGuzW20g083uI3pAkLdPKOCxpeAOQdexOzJ-QzW-xw/viewform?usp=pp_url&entry.790968809=";
const feedbackUrlFor = (id) => FEEDBACK_FORM_URL + encodeURIComponent(id || "");

// Bump this whenever SYSTEM_PROMPT changes, so rows in the sheet stay traceable
// to the prompt that produced them.
const SCHEMA_VERSION = "naoshi-5";

// Math.random().toString(36).slice(2, 8) is not fixed-width — 0.5 yields "0.i",
// giving a one-character id, and 0 yields none at all. Always six.
const newSubmissionId = () =>
  Math.floor(Math.random() * 36 ** 6).toString(36).toUpperCase().padStart(6, "0");

// One JSON blob, pretty-printed so a tester can read what they're sending
// before they send it. Nothing identifying is available to collect, and nothing
// is added: this is the check they just ran plus the verdicts they just gave.
function buildContribution({ text, result, context, verdicts, id }) {
  return JSON.stringify(
    {
      schema: SCHEMA_VERSION,
      id,
      submitted_at: new Date().toISOString(),
      writing_context: context,
      learner_text: text,
      naturalness: result.overall.natural_score,
      summary: result.overall.summary,
      issues: result.issues.map((iss, i) => ({
        n: i + 1,
        span: iss.span,
        correction: iss.correction,
        category: iss.category,
        type: iss.type,
        jlpt: iss.jlpt,
        pattern: iss.pattern_name,
        explanation: iss.explanation,
        learner_verdict: verdicts[i] || "unrated",
      })),
      natural_version: result.model_rewrite,
      // Readings are model output too, and a wrong contextual reading
      // (昨日 as さくじつ, 行った as おこなった) is its own failure mode.
      readings: result._readings,
    },
    null,
    2
  );
}

// Locate each issue's span in the text; returns segments for rendering.
function buildSegments(text, issues) {
  const placed = [];
  let cursor = 0;
  const sorted = issues
    .map((iss, i) => ({ ...iss, _idx: i }))
    .filter((iss) => typeof iss.span === "string" && iss.span.length > 0);
  // Greedy left-to-right placement to handle duplicate spans reasonably.
  const positions = new Array(issues.length).fill(null);
  for (const iss of sorted) {
    const at = text.indexOf(iss.span, cursor);
    const found = at >= 0 ? at : text.indexOf(iss.span);
    if (found >= 0) {
      positions[iss._idx] = { start: found, end: found + iss.span.length };
      if (at >= 0) cursor = found + iss.span.length;
    }
  }
  // Build non-overlapping segment list.
  const marks = issues
    .map((iss, i) => ({ iss, i, pos: positions[i] }))
    .filter((m) => m.pos)
    .sort((a, b) => a.pos.start - b.pos.start);
  const segs = [];
  let last = 0;
  const overlapped = [];
  for (const m of marks) {
    if (m.pos.start < last) {
      // Overlapping or nested span. It cannot be drawn without breaking the
      // segment run, but dropping it silently leaves an issue card that no
      // amount of tapping can reach. Treat it as unplaced instead.
      overlapped.push(m.i);
      continue;
    }
    if (m.pos.start > last) segs.push({ text: text.slice(last, m.pos.start) });
    segs.push({ text: text.slice(m.pos.start, m.pos.end), issue: m.iss, index: m.i });
    last = m.pos.end;
  }
  if (last < text.length) segs.push({ text: text.slice(last) });
  const unplaced = issues
    .map((iss, i) => (positions[i] ? null : i))
    .filter((v) => v !== null)
    .concat(overlapped);
  return { segs, unplaced };
}

// ————— Loading personality —————
// A check can run ~10s. Twelve messages at 3s apart covers that with room to
// spare, and the order is reshuffled per run so repeat checks don't replay the
// same sequence — Naoshi is a tool you press many times in a row.
const CHECKING_MESSAGES = [
  "Reading it through once, without the red pen…",
  "Weighing は against が…",
  "Checking whether that を wanted to be a が…",
  "Deciding what's wrong and what's merely unusual…",
  "Resisting the urge to over-correct…",
  "Asking whether a native speaker would put it this way…",
  "Making sure the transitive verbs kept their particles…",
  "Looking for mistakes, hoping to find none…",
  "Reading it a second time, more slowly…",
  "Checking nothing got \"improved\" that was already fine…",
  "Inking the stamp…",
  "Sitting with it a moment before marking…",
];

function useRotating(messages, active, interval = 3000) {
  const [i, setI] = useState(0);
  const [order, setOrder] = useState(() => messages.map((_, n) => n));
  useEffect(() => {
    if (!active) { setI(0); return; }
    const next = messages.map((_, n) => n);
    for (let n = next.length - 1; n > 0; n--) {
      const m = Math.floor(Math.random() * (n + 1));
      [next[n], next[m]] = [next[m], next[n]];
    }
    setOrder(next);
    setI(0);
    const t = setInterval(() => setI((v) => (v + 1) % next.length), interval);
    return () => clearInterval(t);
  }, [active, messages.length, interval]);
  return messages[order[i]] || messages[0];
}

function Stamp({ score }) {
  const { label, colour } =
    score >= 5 ? { label: "NATURAL", colour: T.ok }
    : score === 4 ? { label: "CLOSE", colour: T.ok }
    : score === 3 ? { label: "CLEAR", colour: T.ai }
    : score === 2 ? { label: "REWORK", colour: T.note }
    : { label: "REWORK", colour: T.shu };
  return (
    <div className="stamp" style={{ borderColor: colour, color: colour }}
         aria-label={`Naturalness score ${score} out of 5 — ${label.toLowerCase()}`}>
      <div className="stamp-num">{score}<span className="stamp-of">/5</span></div>
      <div className="stamp-word">{label}</div>
    </div>
  );
}

export default function NaoshiPrototype() {
  const [text, setText] = useState("");
  const [context, setContext] = useState("none");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [checkedText, setCheckedText] = useState("");
  const [active, setActive] = useState(null);
  const [furigana, setFurigana] = useState(true);
  const checkingMsg = useRotating(CHECKING_MESSAGES, loading);
  const [saved, setSaved] = useState(null); // transient "done" label on an export button
  const [manual, setManual] = useState(null); // {payload, filename} when the clipboard is unreachable
  const [verdicts, setVerdicts] = useState({});
  const [submissionId, setSubmissionId] = useState(null);
  const cardRefs = useRef({});

  const runCheck = async () => {
    const input = text.trim();
    if (!input || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setActive(null);
    setSaved(null);
    setVerdicts({});
    setSubmissionId(newSubmissionId());
    try {
      const ctx = CONTEXTS.find((c) => c.id === context);
      const userMsg =
        context === "none"
          ? input
          : `Context: the writer says this is: ${ctx.label.toLowerCase()}.\n\nText:\n${input}`;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-5",
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "API error");
      const raw = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (!parsed.overall || !Array.isArray(parsed.issues)) {
        throw new Error("Unexpected response shape");
      }
      parsed._readings = Object.fromEntries(
        (Array.isArray(parsed.readings) ? parsed.readings : [])
          .filter((r) => Array.isArray(r) && r.length === 2 && r[0] && r[1])
      );
      setCheckedText(input);
      setResult(parsed);
    } catch (e) {
      setError(
        e instanceof SyntaxError
          ? "The model returned something that wasn't clean JSON. Run the check again."
          : `Check failed: ${e.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const focusIssue = (i) => {
    setActive(i);
    const el = cardRefs.current[i];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const flash = (key, ok = true) => {
    setSaved({ key, ok });
    setTimeout(() => setSaved(null), 2200);
  };

  const downloadBlob = (filename, mime, data) => {
    try {
      const url = URL.createObjectURL(new Blob([data], { type: mime }));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return true;
    } catch {
      return false;
    }
  };

  // The async clipboard API needs a clipboard-write permission the published
  // frame is not granted. execCommand is deprecated but gated on user
  // activation rather than permission policy, so it often survives where the
  // modern API does not. Worth trying before giving up.
  const execCopy = (payload) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = payload;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, payload.length);
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  };

  // Three stages, because "Copy blocked" is a dead end and this is the only
  // route the contribution payload has out of the page.
  const copyText = async (key, payload, filename = "naoshi.txt") => {
    try {
      await navigator.clipboard.writeText(payload);
      flash(key);
      return;
    } catch {
      /* fall through */
    }
    if (execCopy(payload)) {
      flash(key);
      return;
    }
    setManual({ payload, filename });
    flash(key, false);
  };

  const exportArgs = () => ({ text: checkedText, result, context, furi: furigana });

  const downloadHtml = async () => {
    const html = buildHtmlReport(exportArgs());
    try {
      const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `naoshi-${fileStamp()}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      flash("html");
    } catch {
      // If even the download is refused, hand the markup over directly rather
      // than routing it through the clipboard, which is likelier to be blocked.
      setManual({ payload: html, filename: `naoshi-${fileStamp()}.html` });
      flash("html", false);
    }
  };

  const segData = result ? buildSegments(checkedText, result.issues) : null;
  // Counted per tier rather than errors-and-everything-else, so a text of pure
  // notes no longer reads as "0 errors · 3 suggestions".
  const tierCounts = ["fix", "unnatural", "note"].map(
    (t) => (result ? result.issues.filter((i) => tierOf(i) === TIER[t]).length : 0)
  );
  const countLine = ["fix", "unnatural", "note"]
    .map((t, i) => (tierCounts[i] ? `${tierCounts[i]} ${TIER[t].count}` : null))
    .filter(Boolean)
    .join(" · ");

  return (
    <div style={{ minHeight: "100vh", background: T.paper, fontFamily: T.uiFont, color: T.ink }}>
      <style>{`
        ruby { ruby-position: over; }
        rt { font-size: .48em; color: ${T.sub}; font-weight: 400; letter-spacing: 0;
          user-select: none; line-height: 1.2; }
        .furi-off rt { display: none; }
        .mark-fix { border-bottom: 2px solid ${T.shu}; cursor: pointer; }
        .mark-unnat { border-bottom: 2px dotted ${T.ai}; cursor: pointer; }
        /* No rule beneath a note — nothing is wrong with the text. A wash of
           colour keeps it tappable without implying an error. */
        .mark-note { background: ${T.noteBg}; border-radius: 2px; cursor: pointer; }
        .mark-active { background: #F4E3DE; }
        .stamp {
          width: 84px; height: 84px; border: 3px solid ${T.shu}; border-radius: 50%;
          color: ${T.shu}; display: flex; flex-direction: column; align-items: center;
          /* borderColor and color are overridden per score in Stamp() */
          justify-content: center; transform: rotate(-6deg); background: ${T.sheet};
          font-family: ${T.jpFont}; flex-shrink: 0;
        }
        .stamp-num { font-size: 26px; font-weight: 700; line-height: 1; }
        .stamp-of { font-size: 13px; font-weight: 400; }
        .stamp-word { font-size: 10px; letter-spacing: 1.2px; margin-top: 4px;
          font-family: ${T.uiFont}; font-weight: 600; }
        .issue-card { border: 1px solid ${T.hairline}; border-left-width: 3px; background: ${T.sheet};
          border-radius: 6px; padding: 14px 16px; cursor: pointer; }
        .issue-card:hover { border-color: #CFCDC4; }
        .issue-card.active { box-shadow: 0 0 0 2px ${T.ink}1a; }
        .chip { display: inline-block; font-size: 11px; letter-spacing: .4px; padding: 2px 8px;
          border-radius: 999px; border: 1px solid ${T.hairline}; color: ${T.sub}; }
        .btn-primary { background: ${T.ink}; color: ${T.paper}; border: none; padding: 10px 22px;
          border-radius: 6px; font-size: 15px; cursor: pointer; font-family: inherit; }
        .btn-primary:disabled { opacity: .5; cursor: default; }
        .btn-ghost { background: none; border: 1px solid ${T.hairline}; color: ${T.sub};
          padding: 6px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: inherit; }
        .btn-ghost:hover { color: ${T.ink}; border-color: #CFCDC4; }
        textarea:focus, select:focus, button:focus-visible { outline: 2px solid ${T.ai}; outline-offset: 2px; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
        .load-msg { font-size: 13px; color: ${T.sub}; font-style: italic; }
        @media (prefers-reduced-motion: no-preference) {
          .stamp { animation: stampIn .25s ease-out; }
          .load-msg { animation: msgIn .5s ease-out; }
          @keyframes msgIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }
          @keyframes stampIn { from { transform: rotate(-6deg) scale(1.25); opacity: 0; } to { transform: rotate(-6deg) scale(1); opacity: 1; } }
        }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Header */}
        <header style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 6 }}>
          <div style={{ fontFamily: T.jpFont, fontSize: 34, color: T.shu, lineHeight: 1 }}>直</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: ".5px" }}>Naoshi</div>
            <div style={{ fontSize: 13, color: T.sub }}>
              Japanese writing feedback for English speakers · prototype
            </div>
          </div>
          <div
            style={{ marginLeft: "auto", display: "flex", border: `1px solid ${T.hairline}`, borderRadius: 999, overflow: "hidden" }}
            role="group"
            aria-label="Furigana"
          >
            {[[true, "Furigana"], [false, "Off"]].map(([v, label]) => (
              <button
                key={String(v)}
                onClick={() => setFurigana(v)}
                aria-pressed={furigana === v}
                style={{
                  border: "none", cursor: "pointer", fontFamily: T.jpFont, fontSize: 13, padding: "6px 12px",
                  background: furigana === v ? T.ink : "none", color: furigana === v ? T.paper : T.sub,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </header>
        <div style={{ height: 1, background: T.hairline, margin: "18px 0 26px" }} />

        {/* Input sheet */}
        <div style={{ background: T.sheet, border: `1px solid ${T.hairline}`, borderRadius: 8, padding: 20 }}>
          <label htmlFor="jp-input" style={{ fontSize: 13, color: T.sub, display: "block", marginBottom: 8 }}>
            Write in Japanese, then check it
          </label>
          <textarea
            id="jp-input"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            placeholder="ここに日本語を書いてください…"
            rows={4}
            style={{
              width: "100%", boxSizing: "border-box", border: `1px solid ${T.hairline}`,
              borderRadius: 6, padding: 12, fontSize: 19, lineHeight: 1.9,
              fontFamily: T.jpFont, color: T.ink, resize: "vertical", background: T.paper,
            }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: 12 }}>
            <select
              aria-label="Writing context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              style={{
                border: `1px solid ${T.hairline}`, borderRadius: 6, padding: "8px 10px",
                fontSize: 13, color: T.ink, background: T.sheet, fontFamily: "inherit",
              }}
            >
              {CONTEXTS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <button className="btn-primary" onClick={runCheck} disabled={loading || !text.trim()}>
              {loading ? "Checking…" : "Check my Japanese"}
            </button>
            <span style={{ fontSize: 12, color: T.sub, marginLeft: "auto" }}>{text.length}/500</span>
          </div>
          {loading && (
            <div style={{ marginTop: 10, minHeight: 20 }}>
              {/* The rotating line is decoration; the live region announces once
                  instead of interrupting a screen reader every three seconds. */}
              <span key={checkingMsg} className="load-msg" aria-hidden="true">{checkingMsg}</span>
              <span className="sr-only" aria-live="polite">Checking your Japanese…</span>
            </div>
          )}
          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: T.sub }}>Try a sample:</span>
            {SAMPLES.map((s, i) => (
              <button key={i} className="btn-ghost" onClick={() => { setText(s); setResult(null); setError(null); }}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            marginTop: 16, padding: "12px 16px", borderRadius: 6, fontSize: 14,
            background: "#FDF1EF", border: `1px solid ${T.shu}55`, color: T.ink,
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {result && segData && (
          <div style={{ marginTop: 28 }}>
            {/* Marked-up sheet with stamp */}
            <div style={{
              background: T.sheet, border: `1px solid ${T.hairline}`, borderRadius: 8,
              padding: 20, display: "flex", gap: 18, alignItems: "flex-start",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: T.sub, marginBottom: 10, letterSpacing: ".4px" }}>
                  {result.issues.length === 0
                    ? "No issues found"
                    : `${countLine} — tap a mark`}
                </div>
                <div
                  className={furigana ? "" : "furi-off"}
                  style={{ fontFamily: T.jpFont, fontSize: 21, lineHeight: furigana ? 2.6 : 2.1, wordBreak: "break-word" }}
                >
                  {segData.segs.map((seg, i) =>
                    seg.issue ? (
                      <span
                        key={i}
                        role="button"
                        tabIndex={0}
                        className={
                          tierOf(seg.issue).mark +
                          (active === seg.index ? " mark-active" : "")
                        }
                        onClick={() => focusIssue(seg.index)}
                        onKeyDown={(e) => e.key === "Enter" && focusIssue(seg.index)}
                      >
                        <Ruby text={seg.text} map={result._readings} />
                      </span>
                    ) : (
                      <span key={i}><Ruby text={seg.text} map={result._readings} /></span>
                    )
                  )}
                </div>
                <div style={{ marginTop: 14, fontSize: 14, color: T.sub }}>{result.overall.summary}</div>
              </div>
              <Stamp score={result.overall.natural_score} />
            </div>

            {/* Issue cards */}
            {result.issues.length > 0 && (
              <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                {result.issues.map((iss, i) => (
                  <div
                    key={i}
                    ref={(el) => (cardRefs.current[i] = el)}
                    className={"issue-card" + (active === i ? " active" : "")}
                    style={{ borderLeftColor: tierOf(iss).colour,
                             background: iss.type === "note" ? T.noteBg : undefined }}
                    onClick={() => setActive(i)}
                  >
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 600, letterSpacing: ".5px",
                        color: tierOf(iss).colour,
                      }}>
                        {tierOf(iss).label}
                      </span>
                      <span className="chip">{CATEGORY_LABELS[iss.category] || iss.category}</span>
                      {iss.jlpt && <span className="chip">{iss.jlpt}</span>}
                      {segData.unplaced.includes(i) && (
                        <span className="chip" title="This issue overlaps another, or its span didn't match the text exactly">not highlighted</span>
                      )}
                    </div>
                    <div className={furigana ? "" : "furi-off"} style={{ fontFamily: T.jpFont, fontSize: 17, marginBottom: 8, lineHeight: furigana ? 2.2 : 1.6 }}>
                      <span style={
                        iss.type === "note" ? { color: T.ink }
                        : iss.type === "unnatural" ? { borderBottom: `2px dotted ${T.ai}`, color: T.ink }
                        : { textDecoration: "line-through", textDecorationColor: T.shu, color: T.sub }
                      }>
                        <Ruby text={iss.span} map={result._readings} />
                      </span>
                      <span style={{ margin: "0 8px", color: T.sub }}>→</span>
                      <span style={{ color: T.ink }}><Ruby text={iss.correction} map={result._readings} /></span>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.6 }}>{iss.explanation}</div>
                    {iss.pattern_name && (
                      <div style={{ fontSize: 12, color: T.sub, marginTop: 8 }}>
                        Pattern: {iss.pattern_name}
                      </div>
                    )}
                    <div
                      style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.hairline}`,
                        display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span style={{ fontSize: 12, color: T.sub }}>Was this right?</span>
                      {[["yes", "Yes"], ["no", "No"], ["unsure", "Not sure"]].map(([v, label]) => {
                        const on = verdicts[i] === v;
                        return (
                          <button
                            key={v}
                            className="btn-ghost"
                            aria-pressed={on}
                            onClick={() => setVerdicts((p) => ({ ...p, [i]: p[i] === v ? undefined : v }))}
                            style={{
                              padding: "3px 10px", fontSize: 12,
                              background: on ? T.ink : "none",
                              color: on ? T.paper : T.sub,
                              borderColor: on ? T.ink : T.hairline,
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Natural rewrite */}
            {result.model_rewrite && (
              <div style={{
                marginTop: 18, background: T.sheet, border: `1px solid ${T.hairline}`,
                borderRadius: 8, padding: "16px 20px",
              }}>
                <div style={{ fontSize: 12, color: T.ok, fontWeight: 600, letterSpacing: ".5px", marginBottom: 8 }}>
                  NATURAL VERSION
                </div>
                <div className={furigana ? "" : "furi-off"} style={{ fontFamily: T.jpFont, fontSize: 19, lineHeight: furigana ? 2.6 : 2 }}>
                  <Ruby text={result.model_rewrite} map={result._readings} />
                </div>
              </div>
            )}

            {manual && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Copy by hand"
                onClick={() => setManual(null)}
                style={{
                  position: "fixed", inset: 0, zIndex: 50, padding: 20,
                  background: "rgba(34,37,43,.45)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: T.sheet, border: `1px solid ${T.hairline}`, borderRadius: 8,
                    padding: "18px 20px", width: "100%", maxWidth: 560,
                  }}
                >
                  <div style={{ fontSize: 12, color: T.sub, fontWeight: 600, letterSpacing: ".5px", marginBottom: 6 }}>
                    COPY BY HAND
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: "0 0 10px" }}>
                    This page can&rsquo;t reach your clipboard. The text below is already selected —
                    press Ctrl+C, or Cmd+C on a Mac. On a phone, long-press it and choose Copy.
                  </p>
                  <textarea
                    readOnly
                    autoFocus
                    value={manual.payload}
                    onFocus={(e) => e.target.select()}
                    style={{
                      width: "100%", height: 150, padding: 10, borderRadius: 4, resize: "vertical",
                      fontFamily: "ui-monospace,Menlo,Consolas,monospace", fontSize: 12, lineHeight: 1.5,
                      border: `1px solid ${T.hairline}`, background: T.paper, color: T.ink,
                    }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button
                      className="btn-ghost"
                      onClick={() => downloadBlob(manual.filename, "text/plain;charset=utf-8", manual.payload)}
                    >
                      Save as a file instead
                    </button>
                    <button className="btn-ghost" style={{ marginLeft: "auto" }} onClick={() => setManual(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Keep a copy */}
            <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: T.sub }}>Keep a copy:</span>
              <button className="btn-ghost" onClick={() => copyText("text", buildPlainReport(exportArgs()), `naoshi-${fileStamp()}.txt`)}>
                {saved?.key === "text" ? (saved.ok ? "Copied ✓" : "Copy by hand ↓") : "Copy as text"}
              </button>
              <button className="btn-ghost" onClick={downloadHtml}>
                {saved?.key === "html" ? (saved.ok ? "Downloaded ✓" : "Copy by hand ↓") : "Download page"}
              </button>
              {result.issues.length > 0 && (
                <button className="btn-ghost" onClick={() => copyText("anki", buildAnkiTsv(exportArgs()), `naoshi-${fileStamp()}.tsv`)}>
                  {saved?.key === "anki"
                    ? (saved.ok ? "Copied ✓" : "Copy by hand ↓")
                    : `Copy ${result.issues.length} flashcard${result.issues.length === 1 ? "" : "s"}`}
                </button>
              )}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: T.sub }}>
              Readings follow the ふりがな setting above — text uses 漢字(かんじ) notation, the downloaded page keeps real furigana and prints cleanly.
            </div>

            {/* Contribute — deliberately separated from the export row above,
                since one is for the learner and one is for us. */}
            <div style={{
              marginTop: 22, background: T.sheet, border: `1px solid ${T.hairline}`,
              borderRadius: 8, padding: "16px 20px",
            }}>
              <div style={{ fontSize: 12, color: T.sub, fontWeight: 600, letterSpacing: ".5px", marginBottom: 8 }}>
                HELP IMPROVE NAOSHI
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" }}>
                Marking the corrections above as right or wrong is the most useful thing you can
                do for us — especially the ones you think Naoshi got wrong. Copy your check and
                paste it into the feedback form.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <button
                  className="btn-ghost"
                  onClick={() =>
                    copyText("contrib", buildContribution({
                      text: checkedText, result, context, verdicts, id: submissionId,
                    }), `naoshi-check-${submissionId}.txt`)
                  }
                >
                  {saved?.key === "contrib" ? (saved.ok ? "Copied ✓" : "Copy by hand ↓") : "Copy this check"}
                </button>
                <button
                  className="btn-ghost"
                  onClick={() =>
                    downloadBlob(
                      `naoshi-check-${submissionId}.txt`,
                      "text/plain;charset=utf-8",
                      buildContribution({ text: checkedText, result, context, verdicts, id: submissionId })
                    )
                  }
                >
                  Save as a file
                </button>
                {FEEDBACK_FORM_URL && (
                  <a
                    href={feedbackUrlFor(submissionId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13, color: T.ai }}
                  >
                    Open the feedback form ↗
                  </a>
                )}
                <span style={{ fontSize: 12, color: T.sub, marginLeft: "auto" }}>
                  ref {submissionId}
                </span>
              </div>
              <p style={{ fontSize: 12, color: T.sub, margin: "10px 0 0", lineHeight: 1.6 }}>
                What gets copied: the Japanese you wrote, the corrections Naoshi gave, and your
                yes/no marks. No name, email, or account details — we have no way to see who you
                are. Copy it or save it as a file — either way you can read it before you send it.
              </p>
            </div>
          </div>
        )}

        {!result && !error && !loading && (
          <div style={{ marginTop: 24, fontSize: 13, color: T.sub, textAlign: "center" }}>
            Corrections are AI-generated and can be wrong — outputs are being reviewed while this prototype is validated.
          </div>
        )}
      </div>
    </div>
  );
}
