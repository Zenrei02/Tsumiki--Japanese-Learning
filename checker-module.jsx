// tsumiki — the checker. The sixth door, and the one the product is named for.
//
// The learner writes Japanese; this returns corrections that TEACH rather than
// merely fix. Every issue carries a pattern_name, which is the pedagogical
// backbone: it is what will later let the app say "your particle errors are
// down forty percent since May" instead of correcting the same mistake forever.
//
// THREE TIERS, and the middle one is the product. FIX is wrong. WORTH KNOWING
// is a note. CORRECT-BUT-UNNATURAL — grammatical, comprehensible, and not what
// anyone would actually say — is the tier a proofreader cannot give you and a
// textbook cannot either, and it is why this exists.
//
// NO API KEY LIVES HERE. This module calls the tsumiki backend on Supabase,
// which holds the key. build-vite-app.py's purity check refuses to build if
// this file names the model vendor's endpoint or key variable at all — and it
// caught this very comment block on the first attempt, which is the check
// earning its keep rather than a false alarm to be silenced. The browser talks
// to our own endpoint and nothing else.
//
// SPANS ARE PLACED SERVER-SIDE. Each issue arrives with start/end already
// verified character-for-character against the submitted text, or with
// located:false. This module NEVER computes an offset itself — a misplaced
// highlight attaches an explanation to the wrong characters, and the learner
// cannot catch that, because not being able to judge their own Japanese is why
// they are here.

const T = {
  ai: "#3D5A80",
  hairline: "#E4E2DB",
  ink: "#22252B",
  jpFont: '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif',
  note: "#907119",
  noteBg: "#FAF3E0",
  ok: "#3E7C4F",
  okBg: "#EDF5EE",
  paper: "#F7F6F2",
  sheet: "#FFFFFF",
  shu: "#C7351B",
  sub: "#6E7178",
  uiFont: '-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Noto Sans JP",sans-serif',
};

// Rewritten by build-vite-app.py to read the Vite env var. Left as a bare
// string here so this file stays loadable outside a bundler.
const CHECKER_URL = "";

const MAX_CHARS = 600;

// One-shot navigation flag, written by Progress and cleared the moment it is
// read. UI state, not progress — deliberately absent from storage.js KEYS, and
// listed in check-storage-keys.py's IGNORE for the same reason
// tsumiki-open-challenge is: exporting it would carry "jump to Review" into
// someone else's restore.
const OPEN_REVIEW = "tsumiki-open-review";

// ————— Error history —————
// NO-OPS HERE, ON PURPOSE. build-vite-app.py deletes these three declarations
// and imports the real ones from lib/errorHistory.js, so there is exactly ONE
// implementation and it cannot drift from a second copy living in this file.
//
// They stay inert in the standalone artifact because that build is the
// reviewer's grading path: no account, no history, nothing to keep. Review
// therefore renders its empty state there, which is true rather than broken.
// What they must never do is throw — a store that cannot record is not a
// reason to fail a check the learner already paid for.
async function recordCheck() { /* replaced by build-vite-app.py */ }
async function readHistory() { return {}; /* replaced by build-vite-app.py */ }
function byErrorType() { return []; /* replaced by build-vite-app.py */ }


// Register is undecidable without knowing the intended reader — "この資料を見て"
// is fine to a friend and rude to a client. Asking is cheaper than guessing,
// and the guess would be wrong in the direction that embarrasses people.
const CONTEXTS = [
  { id: "casual",   label: "Casual",   jp: "友達に",   hint: "a message to a friend" },
  { id: "polite",   label: "Polite",   jp: "ていねい", hint: "someone you don't know well" },
  { id: "business", label: "Business", jp: "仕事で",   hint: "a colleague or client" },
];

// `name` is the tatami rework's card label (docs/design/rework/03-checker.html),
// drawn in capitals by CSS rather than typed in them: the text stays a phrase
// for screen readers, and a card can never be mistaken for the verdict line,
// which is the one place the capitalised tier word is the actual text.
// `wavy` is whether the span is underlined in the tier colour — WORTH KNOWING
// is a note about something that is not wrong, so it points without marking.
const TIER = {
  fix:       { label: "Fix",           name: "Fix",                    jp: "直す", wavy: true,  color: "#C7351B", bg: "#FBEDEA", rule: "#C7351B" },
  unnatural: { label: "Unnatural",     name: "Correct, but unnatural", jp: "",     wavy: true,  color: "#3D5A80", bg: "#EDF1F6", rule: "#3D5A80" },
  note:      { label: "Worth knowing", name: "Worth knowing",          jp: "",     wavy: false, color: "#907119", bg: "#FAF3E0", rule: "#907119" },
};
const tierOf = (t) => TIER[t] || TIER.note;

// ── furigana ────────────────────────────────────────────────────────────────
// The model returns a separate readings map of bare kanji runs rather than
// inline ruby, so the span stays byte-exact — the decision recorded on the
// furigana tracker row. Rendering happens here, over that map.
// ————— Lookups go to the dictionary (Session 34) —————
// Inside the app the shell listens for this and opens the dictionary drawer
// from the right; as a standalone artifact nothing listens, lookUp() returns
// false, and the caller falls back to whatever it did before. Byte-identical
// in grammar, kanji and checker — one protocol, three callers.
function lookUp(detail) {
  if (typeof window === "undefined" || !window.__tsumikiLookup) return false;
  window.dispatchEvent(new CustomEvent("tsumiki:lookup", { detail }));
  return true;
}

function Ruby({ text, readings, on, tap }) {
  // `tap` (Session 34): each kanji run the model gave a reading for becomes a
  // lookup — the checker's rewrite is the one place in the app that routinely
  // shows the learner a word nobody chose for them. Runs, not words: the
  // readings map is bare kanji, so 食 finds 食べる through the dictionary's own
  // prefix search. Only outside the issue buttons (a tap target inside a button
  // is two actions on one press), and only when a dictionary is listening —
  // with furigana off the runs are still split, just drawn without the ruby.
  const canTap = tap && typeof window !== "undefined" && !!window.__tsumikiLookup;
  if ((!on && !canTap) || !readings?.length) return <>{text}</>;
  const pairs = [...readings].filter((p) => Array.isArray(p) && p[0] && p[1])
    .sort((a, b) => b[0].length - a[0].length);
  const out = [];
  let i = 0, k = 0;
  while (i < text.length) {
    const hit = pairs.find((p) => text.startsWith(p[0], i));
    if (hit) {
      const face = on
        ? <ruby>{hit[0]}<rt style={{ fontSize: "0.5em", color: T.sub }}>{hit[1]}</rt></ruby>
        : hit[0];
      out.push(canTap ? (
        <span key={k++} role="button" tabIndex={0} data-lookup={hit[0]}
              onClick={(e) => { e.stopPropagation(); lookUp({ q: hit[0] }); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); lookUp({ q: hit[0] }); } }}
              style={{ borderBottom: `1px dashed ${T.sub}`, cursor: "pointer" }}>{face}</span>
      ) : on ? <ruby key={k++}>{hit[0]}<rt style={{ fontSize: "0.5em", color: T.sub }}>{hit[1]}</rt></ruby>
        : <span key={k++}>{hit[0]}</span>);
      i += hit[0].length;
    } else {
      out.push(<span key={k++}>{text[i]}</span>);
      i += 1;
    }
  }
  return <>{out}</>;
}

// ── the marked-up text ──────────────────────────────────────────────────────
function Marked({ text, issues, readings, furigana, active, setActive }) {
  const placed = issues.filter((x) => x.located).sort((a, b) => a.start - b.start);
  const parts = [];
  let cursor = 0, k = 0;
  for (const issue of placed) {
    if (issue.start > cursor) {
      parts.push(
        <Ruby key={k++} text={text.slice(cursor, issue.start)} readings={readings} on={furigana} tap />,
      );
    }
    const tier = tierOf(issue.type);
    const isActive = active === issue._id;
    parts.push(
      <button
        key={k++}
        onClick={() => setActive(isActive ? null : issue._id)}
        aria-label={`${tier.label}: ${issue.span}`}
        style={{
          background: isActive ? tier.rule : tier.bg,
          color: isActive ? T.sheet : "inherit",
          border: "none", padding: "1px 2px", borderRadius: 3, cursor: "pointer",
          font: "inherit",
          textDecoration: tier.wavy && !isActive ? `underline wavy ${tier.rule}` : "none",
          textUnderlineOffset: 5, textDecorationThickness: 1.5,
        }}
      >
        <Ruby text={issue.span} readings={readings} on={furigana} />
      </button>,
    );
    cursor = issue.end;
  }
  if (cursor < text.length) {
    parts.push(<Ruby key={k++} text={text.slice(cursor)} readings={readings} on={furigana} tap />);
  }
  return (
    <p style={{
      font: `1.1875rem/2.1 ${T.jpFont}`, color: T.ink, margin: 0,
      wordBreak: "break-all",
    }}>{parts}</p>
  );
}

// ── one issue ───────────────────────────────────────────────────────────────
function IssueCard({ issue, active, setActive, readings, furigana }) {
  // Tatami rework: a washi card with a 6px bar in the tier colour — the one
  // place a left bar is allowed, because it IS the tier. The explanation is
  // always open now, as on the board; tapping the card still lights its span
  // in the sentence above, which is why the header stays a button.
  const tier = tierOf(issue.type);
  const on = active === issue._id;
  return (
    <div data-issue className="ts-tier" style={{
      "--tier": tier.rule, marginBottom: 10,
      outline: on ? `2px solid ${tier.rule}` : "none", outlineOffset: 2,
    }}>
      <button
        onClick={() => setActive(on ? null : issue._id)}
        aria-pressed={on}
        title="Show where this is in your sentence"
        style={{
          width: "100%", textAlign: "left", background: "none", border: "none",
          cursor: "pointer", padding: 0, display: "flex", flexDirection: "column",
          gap: 6, font: "inherit", color: "inherit",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            font: `900 0.6875rem ${T.uiFont}`, letterSpacing: "0.08em",
            textTransform: "uppercase", color: tier.color,
          }}>{tier.name}</span>
          {tier.jp && <span style={{ font: `0.8125rem ${T.jpFont}`, color: tier.color }}>{tier.jp}</span>}
          {!issue.located && (
            // Honesty rather than silence. The advice may be sound; we simply
            // could not prove where it points, so we do not point.
            <span style={{
              font: `0.6875rem ${T.uiFont}`, color: T.sub, background: T.paper,
              border: `1px solid ${T.hairline}`, borderRadius: 4, padding: "2px 6px",
            }}>not highlighted — couldn't locate this exactly</span>
          )}
        </span>
        {issue.span && (
          <span style={{ font: `1.125rem/1.6 ${T.jpFont}`, color: T.ink }}>
            <span style={tier.wavy ? {
              textDecoration: `underline wavy ${tier.rule}`, textUnderlineOffset: 4,
            } : undefined}>
              <Ruby text={issue.span} readings={readings} on={furigana} />
            </span>
            {issue.correction && (
              <>
                <span style={{ color: T.sub, font: `0.875rem ${T.uiFont}` }}> → </span>
                <Ruby text={issue.correction} readings={readings} on={furigana} />
              </>
            )}
          </span>
        )}
      </button>
      {issue.explanation && (
        <p style={{ margin: 0, font: `0.875rem/1.6 ${T.uiFont}`, color: "#4A463D" }}>{issue.explanation}</p>
      )}
      {(issue.pattern_name || issue.jlpt) && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {issue.pattern_name && (
            <span style={{
              font: `0.75rem ${T.uiFont}`, color: tier.color, background: tier.bg,
              borderRadius: 999, padding: "3px 10px",
            }}>{issue.pattern_name}</span>
          )}
          {issue.jlpt && (
            <span style={{
              font: `0.75rem ${T.uiFont}`, color: T.sub, background: T.paper,
              border: `1px solid ${T.hairline}`, borderRadius: 999, padding: "3px 10px",
            }}>{issue.jlpt}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── review: the learner's own back catalogue ────────────────────────────────
//
// ⭐ ORGANISED BY ERROR TYPE, NOT BY DATE, and a sentence with three kinds of
// error appears under all three. The repetition is the feature. Someone asking
// "what do I keep doing wrong with particles" is not helped by a chronological
// list they have to hunt through — they should open the particle group and find
// their own particle sentences in it.
//
// Chronology is still one tap away, because "what did I write last week" is a
// different and equally real question. It is the second view, not the first.

// Stored issues are compact (see foldCheck). Marked and IssueCard want the
// shape the API returns, so one rehydrate lives here rather than two shapes
// living in the renderers.
function rehydrate(check) {
  return (check.issues || []).map((x, i) => ({
    _id: i,
    type: x.t,
    pattern_name: x.p,
    span: x.span,
    correction: x.corr,
    explanation: x.exp,
    start: x.start,
    end: x.end,
    located: !!x.loc && Number.isFinite(x.start) && Number.isFinite(x.end),
  }));
}

const niceDay = (d) => {
  const t = new Date(d + "T00:00:00");
  return Number.isNaN(t.getTime()) ? d
    : t.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

// One past submission, rendered the way it was when it came back. `focus` is
// the issue this card is being shown FOR — inside an error-type group the
// learner is looking for one particular thing, and highlighting all six issues
// equally would make them find it again by eye.
function PastCheck({ check, focus = null, furigana }) {
  const [open, setOpen] = useState(focus != null);
  const issues = rehydrate(check);
  const ctx = CONTEXTS.find((c) => c.id === check.c);
  const shown = focus != null && issues[focus] ? [issues[focus]] : issues;

  return (
    <div style={{
      border: `1px solid ${T.hairline}`, borderRadius: 10, background: T.sheet,
      padding: "12px 14px", marginBottom: 10,
    }}>
      <div style={{
        display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap",
        marginBottom: 8, font: `0.75rem ${T.uiFont}`, color: T.sub,
      }}>
        <span>{niceDay(check.d)}</span>
        {ctx && <span>· written for {ctx.hint}</span>}
        {check.score != null && <span>· sounds natural {check.score} / 5</span>}
      </div>

      <Marked
        text={check.text}
        issues={shown}
        readings={check.readings}
        furigana={furigana}
        active={null}
        setActive={() => {}}
      />

      {focus != null && issues[focus] && (
        <div style={{ marginTop: 10 }}>
          <IssueCard issue={issues[focus]} active={issues[focus]._id}
                     setActive={() => {}} readings={check.readings}
                     furigana={furigana} />
        </div>
      )}

      {focus == null && (
        <>
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} style={{
            marginTop: 10, background: "none", border: "none", cursor: "pointer",
            padding: 0, font: `0.8125rem ${T.uiFont}`, color: T.sub,
          }}>
            {open ? "Hide" : issues.length
              ? `Show ${issues.length} ${issues.length === 1 ? "note" : "notes"}`
              : "Nothing was flagged"}
          </button>
          {open && issues.map((issue) => (
            <div key={issue._id} style={{ marginTop: 8 }}>
              <IssueCard issue={issue} active={issue._id} setActive={() => {}}
                         readings={check.readings} furigana={furigana} />
            </div>
          ))}
          {open && check.rewrite && check.rewrite !== check.text && (
            <p style={{
              font: `1.0625rem/2 ${T.jpFont}`, color: T.ink, background: T.paper,
              border: `1px solid ${T.hairline}`, borderRadius: 8,
              padding: "10px 12px", margin: "8px 0 0",
            }}>
              <span style={{
                display: "block", font: `600 0.6875rem ${T.uiFont}`, letterSpacing: ".06em",
                textTransform: "uppercase", color: T.sub, marginBottom: 4,
              }}>One natural version</span>
              <Ruby text={check.rewrite} readings={check.readings} on={furigana} tap />
            </p>
          )}
        </>
      )}
    </div>
  );
}

function ErrorTypeGroup({ group, furigana }) {
  const [open, setOpen] = useState(false);
  const tier = tierOf(group.tier);
  return (
    <div style={{
      border: `1px solid ${T.hairline}`, borderLeft: `3px solid ${tier.rule}`,
      borderRadius: 8, background: T.sheet, marginBottom: 10, overflow: "hidden",
    }}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} style={{
        width: "100%", textAlign: "left", background: "none", border: "none",
        cursor: "pointer", padding: "12px 14px", display: "flex",
        alignItems: "baseline", gap: 10, flexWrap: "wrap",
      }}>
        <span style={{
          font: `600 0.6875rem ${T.uiFont}`, letterSpacing: "0.06em",
          textTransform: "uppercase", color: tier.color,
        }}>{tier.label}</span>
        <span style={{ font: `0.9375rem ${T.uiFont}`, color: T.ink }}>{group.pattern}</span>
        <span style={{ flex: 1 }} />
        <span style={{ font: `0.8125rem ${T.uiFont}`, color: T.sub }}>
          {group.total}{group.total === 1 ? " time" : " times"} · last {niceDay(group.last)}
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 14px 12px" }}>
          {group.examples.map((ex) => (
            <PastCheck key={ex.entry.id} check={ex.check} focus={ex.ix}
                       furigana={furigana} />
          ))}
          {/* Said plainly rather than left as a silently shorter list. The
              count above is the truth; the examples are only what is still
              kept, and a group that quietly shrank would read as an error
              that stopped happening. */}
          {group.missing > 0 && (
            <p style={{ font: `0.75rem/1.6 ${T.uiFont}`, color: T.sub, margin: "2px 0 0" }}>
              {group.missing} older {group.missing === 1 ? "sentence is" : "sentences are"} no
              longer kept — the count above still includes {group.missing === 1 ? "it" : "them"}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Review({ furigana, setFurigana, btn }) {
  const [history, setHistory] = useState(null);
  const [mode, setMode] = useState("type");   // type | time

  useEffect(() => { readHistory().then(setHistory); }, []);

  if (history === null) {
    return <p style={{ font: `0.875rem ${T.uiFont}`, color: T.sub }}>Looking…</p>;
  }

  const groups = byErrorType(history);
  const checks = [...(history._checks || [])].reverse();

  if (!checks.length) {
    return (
      <div style={{
        border: `1px solid ${T.hairline}`, borderRadius: 10, background: T.sheet,
        padding: "18px 16px", font: `0.9375rem/1.7 ${T.uiFont}`, color: T.ink,
      }}>
        <p style={{ margin: "0 0 8px" }}>Nothing here yet.</p>
        <p style={{ margin: 0, color: T.sub, font: `0.875rem/1.7 ${T.uiFont}` }}>
          Everything you check is kept here — the sentence you wrote and what came
          back — grouped by the kind of thing it was. It is your own writing, so
          you can clear it whenever you like from Progress.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <button onClick={() => setMode("type")} aria-pressed={mode === "type"}
                style={btn(mode === "type")}>By what went wrong</button>
        <button onClick={() => setMode("time")} aria-pressed={mode === "time"}
                style={btn(mode === "time")}>By when</button>
        <span style={{ flex: 1 }} />
        <button onClick={() => setFurigana((f) => !f)} style={btn(furigana)}>ふりがな</button>
      </div>

      {mode === "type" ? (
        groups.length ? (
          <>
            <p style={{ font: `0.8125rem/1.7 ${T.uiFont}`, color: T.sub, margin: "0 0 12px" }}>
              A sentence appears under every kind of thing that was flagged in it,
              so whichever one you came looking for, your own examples are there.
            </p>
            {groups.map((g) => (
              <ErrorTypeGroup key={g.pattern} group={g} furigana={furigana} />
            ))}
          </>
        ) : (
          <p style={{ font: `0.9375rem/1.7 ${T.uiFont}`, color: T.ink }}>
            Nothing has been flagged in what you have written so far. Your
            sentences are still under <em>By when</em>.
          </p>
        )
      ) : (
        checks.map((c) => <PastCheck key={c.id} check={c} furigana={furigana} />)
      )}
    </div>
  );
}

// ── streaming: the client half ──────────────────────────────────────────────
//
// The endpoint has streamed since Aug 19 (Session 16.5) — opt-in via
// `"stream": true` — and until Session 32 nothing asked it to. It emits its
// OWN events, never the model's: `overall`, one `issue` per issue with the
// span already placed server-side, `rewrite`, `readings`, then `done`; a
// failure after the headers have gone out travels in-band as `error`.
//
// TWO CONTRACTS, and the first is the one that matters.
//
//   1. A STREAM THAT ENDS WITHOUT `done` IS A FAILURE, NOT A SHORT RESULT.
//      Once headers are sent the HTTP status is 200 whatever happens next, so
//      a dropped connection looks, to a status check, exactly like a finished
//      one. Rendered naively that is "no issues found" — the one thing this
//      product must never say by accident. `done` is sent only when the
//      model's JSON actually closed; nothing below trusts anything less.
//   2. Issues arrive in MODEL order, because you cannot sort a list you have
//      not finished receiving. The buffered path sorts on the way out
//      (document order, unlocatable last); this path sorts on `done`, with
//      the same comparator, so the two paths agree once the stream is over.
//      `_id` is the ARRIVAL index and stays put through the sort — it keys
//      the highlight the learner may already have open.
//
// What it buys is honest and bounded (Session 32): the model thinks before it
// writes, and thinking is most of the wait, so the first event lands late in
// the check and the rest arrive over a few seconds. Progressive rendering
// shortens the wait for the first thing to read; it does not shorten the check.

// SSE frames out of bytes. ONE TextDecoder in stream mode, kept across pushes:
// the payload is Japanese, a chunk boundary lands mid-character constantly,
// and decoding chunks independently yields U+FFFD — silent corruption of the
// learner's own sentence, surfacing as a span that no longer matches.
function sseDecoder() {
  const dec = new TextDecoder("utf-8");
  let buf = "";
  const parseBlock = (block) => {
    let event = "message";
    const data = [];
    for (const line of block.split("\n")) {
      if (!line || line[0] === ":") continue;
      const i = line.indexOf(":");
      const field = i === -1 ? line : line.slice(0, i);
      const value = i === -1 ? "" : line.slice(i + 1).replace(/^ /, "");
      if (field === "event") event = value;
      else if (field === "data") data.push(value);
    }
    return data.length ? { event, data: data.join("\n") } : null;
  };
  const drain = (final) => {
    const out = [];
    // Line endings: CRLF, LF or a lone CR are all legal. A CR that ends the
    // buffer is held back rather than converted — the LF that completes it may
    // be in the next chunk, and converting early turned "\r" + "\n" into a
    // blank line, which ended the frame before its data arrived. Found by the
    // every-byte split in test-sse-decoder.mjs at byte 141, first run.
    buf = buf.replace(/\r\n/g, "\n").replace(/\r(?!$)/g, "\n");
    if (final) buf = buf.replace(/\r$/, "\n");
    for (;;) {
      const cut = buf.indexOf("\n\n");
      if (cut === -1) break;
      const frame = parseBlock(buf.slice(0, cut));
      buf = buf.slice(cut + 2);
      if (frame) out.push(frame);
    }
    return out;
  };
  return {
    push: (bytes) => { buf += dec.decode(bytes, { stream: true }); return drain(false); },
    // A trailing block with no terminator is a frame the connection cut in
    // half. It is dropped, not guessed at — and the absence of `done` is what
    // then decides the outcome.
    flush: () => { buf += dec.decode(); return drain(true); },
  };
}

// The buffered endpoint's render order, reproduced so both paths agree.
// Stable sort, so unlocatable issues keep their arrival order among themselves
// — which is also what the server does.
const byDocumentOrder = (a, b) => {
  if (a.located && b.located) return a.start - b.start;
  if (a.located) return -1;
  if (b.located) return 1;
  return 0;
};

// Consume the endpoint's stream. `onPartial` receives the result so far after
// every chunk that changed it; the resolved value has the SAME shape the
// buffered path returns, so nothing downstream knows which path ran. Throws on
// any failure — and if content had already arrived, the error carries it as
// `partial`, so the UI can keep it on screen and say that it is incomplete.
async function readStream(body, submitted, onPartial) {
  const reader = body.getReader();
  const frames = sseDecoder();
  const draft = {
    overall: {}, issues: [], model_rewrite: "", readings: [],
    submitted, streaming: true,
  };
  let failure = null;
  let done = null;

  const apply = (frame) => {
    let payload;
    try { payload = JSON.parse(frame.data); } catch { return false; }
    switch (frame.event) {
      case "overall":
        draft.overall = payload && typeof payload === "object" ? payload : {};
        return true;
      case "issue":
        draft.issues = [...draft.issues, { ...payload, _id: draft.issues.length }];
        return true;
      case "rewrite":
        draft.model_rewrite = payload?.model_rewrite ?? "";
        return true;
      case "readings":
        draft.readings = Array.isArray(payload?.readings) ? payload.readings : [];
        return true;
      case "error":
        failure = payload?.error || "upstream-error";
        return false;
      case "done":
        done = payload && typeof payload === "object" ? payload : {};
        return false;
      default:
        // An event this build does not know. Ignored, not fatal — a newer
        // endpoint must not break an older client.
        return false;
    }
  };

  try {
    for (;;) {
      const { done: closed, value } = await reader.read();
      if (closed) break;
      let changed = false;
      for (const f of frames.push(value)) changed = apply(f) || changed;
      if (changed && !failure && !done) onPartial({ ...draft });
    }
    for (const f of frames.flush()) apply(f);
  } catch (e) {
    failure = failure || (e?.name === "AbortError" ? "aborted" : "cut-off");
  }

  if (failure || !done) {
    const err = new Error(failure || "cut-off");
    if (draft.issues.length || draft.overall?.summary) err.partial = { ...draft };
    throw err;
  }
  return {
    schema: done.schema,
    model: done.model,
    verdict: done.verdict,
    overall: draft.overall,
    issues: [...draft.issues].sort(byDocumentOrder),
    model_rewrite: draft.model_rewrite,
    readings: draft.readings,
    spans: done.spans,
    usage: done.usage,
    cap: done.cap ?? null,
    submitted,
  };
}

// ── the module ──────────────────────────────────────────────────────────────
export default function CheckerModule() {
  const [text, setText] = useState("");
  const [context, setContext] = useState("polite");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(null);
  const [furigana, setFurigana] = useState(true);
  const [view, setView] = useState("write");   // write | review
  // The daily cap as last reported by the backend. Shown in the writing card
  // (tatami rework) rather than under the results, so it is visible BEFORE a
  // check is spent — which is when it is useful. Unknown until the first check.
  const [cap, setCap] = useState(null);
  useEffect(() => { if (result?.cap) setCap(result.cap); }, [result?.cap]);

  // Progress sends learners straight here — "show me my particle mistakes" is
  // a question you ask from a progress screen, and landing them on a blank
  // writing box would make them navigate twice for one thought. Same one-shot
  // flag pattern Home already uses to open the grammar challenge, and read
  // through `storage` rather than localStorage directly (Session 21: the
  // adapter falls back to memory where site data is blocked, and reading
  // around it is how Home once showed START HERE to someone mid-course).
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const r = await window.storage.get(OPEN_REVIEW);
        if (!r?.value) return;
        // Cleared on arrival, not on leaving: a flag that survives the visit
        // hijacks every later one.
        await window.storage.set(OPEN_REVIEW, "");
        if (live) setView("review");
      } catch { /* no flag, no problem */ }
    })();
    return () => { live = false; };
  }, []);

  const count = [...text].length;
  const over = count > MAX_CHARS;
  const canCheck = text.trim().length > 0 && !over && !busy;

  // Aborting on the way out is not tidiness: the endpoint cancels its upstream
  // call when the client hangs up, and tokens nobody will read stop being
  // paid for.
  // Held in state rather than a ref so the standalone artifact — where hooks
  // are ambient and this module imports nothing — needs no new global.
  const [abortRef] = useState({ current: null });
  useEffect(() => () => abortRef.current?.abort(), []);

  async function check() {
    if (!canCheck) return;
    setBusy(true); setError(null); setResult(null); setActive(null);
    const submitted = text.trim();
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    abortRef.current = controller;
    try {
      if (!CHECKER_URL) throw new Error("not-configured");
      const r = await fetch(CHECKER_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: submitted, context, stream: true }),
        signal: controller?.signal,
      });
      // A refusal before the stream opens — daily cap, too long, upstream down
      // on the handshake — is still a real HTTP status with a JSON body,
      // exactly as before. Only a 200 carrying an event stream takes the new
      // path; everything else takes the buffered path unchanged, which is also
      // what a stubbed or older backend gets.
      const type = r.headers?.get?.("content-type") || "";
      let data;
      if (r.ok && r.body && type.includes("text/event-stream")) {
        data = await readStream(r.body, submitted, setResult);
      } else {
        data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || `http-${r.status}`);
        // _id keys the highlight ↔ card pairing. Index is stable for one result.
        data.issues = (data.issues || []).map((x, i) => ({ ...x, _id: i }));
        // Render against the text that was SENT, not what is in the box now —
        // the learner may have kept typing, and offsets belong to the submission.
        data.submitted = submitted;
      }
      setResult(data);
      // AFTER the result is on screen, and never on the error path: a check
      // that failed to reach the backend is not evidence about anyone's
      // Japanese. Awaited so the store is written before the learner can
      // navigate away — commitIfWorked() reads it on the way out.
      // The WHOLE result, not a summary of it — Review re-renders what the
      // learner saw rather than a lossy retelling of it. Lloyd's call, and the
      // reasoning is in the header of lib/errorHistory.js.
      try { await recordCheck(context, submitted, data); }
      catch (e) { console.error("error history not recorded", e); }
    } catch (e) {
      // A stream that failed after content had arrived keeps that content on
      // screen, marked incomplete, and is NOT recorded: half a check is not
      // evidence about anyone's Japanese, and the copy must not say "nothing
      // was lost" when a cap slot was spent on what is showing.
      if (e?.partial) {
        setResult({ ...e.partial, streaming: false, incomplete: true });
        setError("cut-off");
      } else {
        setError(String(e.message || e));
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  }

  const ERRORS = {
    "daily-cap": "That's today's free checks used up. They reset tomorrow.",
    "cut-off": "The check was cut off partway. What is showing is real but may be incomplete, and it was not saved to your sentences.",
    "too-long": `That's longer than ${MAX_CHARS} characters. Try one paragraph at a time.`,
    "upstream-timeout": "The check took too long and was stopped. Try again — a shorter piece usually goes through.",
    "upstream-error": "The checker could not be reached just now. Nothing was lost; try again in a moment.",
    "unparseable": "The response came back malformed. This is a bug on our side, not a problem with your Japanese.",
    "not-configured": "The checker isn't connected yet in this build.",
    "empty-text": "Write something first.",
  };

  // Quiet washi chips (tatami rework). Selected reads as ink, not red: red
  // on this screen belongs to FIX and to the one Check button.
  const btn = (on) => ({
    border: "none", borderRadius: 10, padding: "0 14px", minHeight: 40, cursor: "pointer",
    font: `${on ? 700 : 500} 0.8125rem ${T.uiFont}`,
    background: on ? "#2C2A26" : "#FBF7EE", color: on ? "#FBF7EE" : "#2C2A26",
    boxShadow: on ? "0 2px 0 #000000" : "inset 0 0 0 1.5px #D9CFB8, 0 2px 0 #CFC4A8",
  });
  const LABEL = { font: `700 0.6875rem ${T.uiFont}`, letterSpacing: "0.08em", color: "#6E6A60" };

  return (
    <div style={{ padding: "16px 16px 60px", maxWidth: 720, margin: "0 auto" }}>
      {/* The shell's header already says 直し Checker, so the old in-page
          title went; the one line of what-this-is stays. */}
      <p style={{ font: `0.875rem/1.6 ${T.uiFont}`, color: "#4A463D", margin: "0 0 14px" }}>
        Write something in Japanese. You'll get back what's wrong, what's
        technically fine but sounds off, and why — in English.
      </p>

      {/* Two views, not two pages. Review is the same module because it is the
          same material — the checker is where you write Japanese and where you
          go back and look at the Japanese you wrote. */}
      <div className="ts-seg" role="group" aria-label="View" style={{ display: "inline-flex", margin: "0 0 16px" }}>
        {[["write", "Write"], ["review", "Your sentences"]].map(([id, label]) => (
          <button key={id} onClick={() => setView(id)} aria-pressed={view === id}>{label}</button>
        ))}
      </div>

      {view === "review" && (
        <Review furigana={furigana} setFurigana={setFurigana} btn={btn} />
      )}

      {view === "write" && (<>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {CONTEXTS.map((c) => (
          <button key={c.id} onClick={() => setContext(c.id)}
                  aria-pressed={context === c.id}
                  title={`Written for ${c.hint}`}
                  style={btn(context === c.id)}>
            {c.label}
            <span style={{ font: `0.75rem ${T.jpFont}`, marginLeft: 6, opacity: 0.8 }}>{c.jp}</span>
          </button>
        ))}
      </div>

      {/* The writing sheet: washi with ruled lines, as on the board. The
          lines scroll with the text (background-attachment: local). */}
      <div className="ts-card" style={{
        padding: "16px 18px 12px", display: "flex", flexDirection: "column", gap: 10,
        marginBottom: 16, boxShadow: over ? "inset 0 0 0 2px #C7351B, 0 3px 0 #CFC4A8" : undefined,
      }}>
        <label htmlFor="ts-checker-draft" style={LABEL}>YOUR JAPANESE</label>
        <textarea
          id="ts-checker-draft"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="日本語で書いてみてください。"
          rows={4}
          style={{
            width: "100%", boxSizing: "border-box", resize: "vertical", border: 0,
            outline: "none", padding: 0, color: T.ink,
            font: `1.25rem/2.375rem ${T.jpFont}`,
            background: "repeating-linear-gradient(180deg, rgba(0,0,0,0) 0 calc(2.375rem - 1px), #D9CFB8 calc(2.375rem - 1px) 2.375rem)",
            backgroundAttachment: "local",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ font: `0.75rem/1.4 ${T.uiFont}`, color: "#6E6A60", flex: 1, minWidth: 0 }}>
            {cap ? `${cap.used} of ${cap.limit} free checks used today` : ""}
          </span>
          <span style={{ font: `0.75rem ${T.uiFont}`, color: over ? T.shu : "#6E6A60", whiteSpace: "nowrap" }}>
            {count} / {MAX_CHARS}
          </span>
          <button className="ts-btn ts-btn-washi" onClick={() => { setText(""); setError(null); }}
                  disabled={!text || busy} style={{ minHeight: 36, fontSize: "0.8125rem" }}>Clear</button>
        </div>
      </div>

      <button onClick={check} disabled={!canCheck} className="ts-btn ts-btn-shu"
              style={{ width: "100%", marginBottom: 22 }}>
        {busy ? "Checking…" : (<><span style={{ font: `700 1.25rem ${T.jpFont}` }}>直す</span> Check it</>)}
      </button>

      {busy && !result && (
        <p style={{ font: `0.875rem ${T.uiFont}`, color: T.sub }}>
          Reading it properly — this usually takes a few seconds, sometimes up to a minute
          for longer writing.
        </p>
      )}

      {busy && result?.streaming && (
        <p style={{ font: `0.875rem ${T.uiFont}`, color: T.sub }}>
          Still writing up — the notes below are filling in.
        </p>
      )}

      {error && (
        // A neutral bar, not 朱: this is the app failing, not the learner's
        // Japanese, and red on this screen means FIX.
        <div role="alert" className="ts-tier" style={{
          "--tier": "#8E8A80", font: `0.875rem/1.6 ${T.uiFont}`, color: T.ink,
        }}>{ERRORS[error] || "Something went wrong. Try again in a moment."}</div>
      )}

      {result && (
        <div>
          <div style={{ ...LABEL, color: "#4A463D", marginBottom: 10 }}>WHAT WE FOUND</div>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            marginBottom: 14,
          }}>
            {/* The verdict is a statement about the WHOLE piece, and it only
                exists once the whole piece has been read. Never while the
                stream is open, never on a result that was cut short. */}
            {!result.streaming && !result.incomplete && (
              <span style={{
                font: `600 0.75rem ${T.uiFont}`, letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: result.verdict === "NONE" ? T.ok : tierOf(
                  result.verdict === "FIX" ? "fix"
                    : result.verdict === "UNNATURAL" ? "unnatural" : "note").color,
              }}>
                {result.verdict === "NONE" ? "Nothing to change" : result.verdict}
              </span>
            )}
            {result.overall?.natural_score != null && (
              <span style={{ font: `0.8125rem ${T.uiFont}`, color: T.sub }}>
                Sounds natural: {result.overall.natural_score} / 5
              </span>
            )}
            <span style={{ flex: 1 }} />
            <button onClick={() => setFurigana((f) => !f)} style={btn(furigana)}>
              ふりがな
            </button>
          </div>

          {result.overall?.summary && (
            <p style={{
              font: `0.9375rem/1.65 ${T.uiFont}`, color: T.ink, margin: "0 0 16px",
            }}>{result.overall.summary}</p>
          )}

          <div className="ts-card" style={{ padding: "16px 16px 12px", marginBottom: 18 }}>
            <Marked
              text={result.submitted}
              issues={result.issues}
              readings={result.readings}
              furigana={furigana}
              active={active}
              setActive={setActive}
            />
          </div>

          {/* Contract 1, in the render: an empty list is only "nothing to
              correct" once `done` has said so. Mid-stream it is "nothing yet";
              after a cut-off it is "unknown". */}
          {result.issues.length === 0 && !result.streaming && !result.incomplete && (
            <div className="ts-tier" style={{
              "--tier": T.ok, font: `0.9375rem/1.6 ${T.uiFont}`, color: T.ink,
            }}>
              Nothing to correct here. That is a real result, not a shrug — the
              checker is built to return nothing when there is nothing wrong.
            </div>
          )}

          {result.issues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} active={active}
                       setActive={setActive} readings={result.readings}
                       furigana={furigana} />
          ))}

          {result.model_rewrite && result.model_rewrite !== result.submitted && (
            <div style={{ marginTop: 18 }}>
              <h2 style={{
                font: `600 0.75rem ${T.uiFont}`, letterSpacing: "0.06em",
                textTransform: "uppercase", color: T.sub, margin: "0 0 8px",
              }}>One natural version</h2>
              <p className="ts-card" style={{
                font: `1.125rem/2 ${T.jpFont}`, color: T.ink, padding: "14px 16px", margin: 0,
              }}>
                <Ruby text={result.model_rewrite} readings={result.readings} on={furigana} tap />
              </p>
              <p style={{ font: `0.8125rem/1.6 ${T.uiFont}`, color: T.sub, margin: "8px 0 0" }}>
                Changed as little as possible — it is one way to say it, not the
                only correct one.
              </p>
            </div>
          )}

        </div>
      )}
      </>)}
    </div>
  );
}
