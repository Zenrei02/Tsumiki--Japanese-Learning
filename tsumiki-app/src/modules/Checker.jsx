// GENERATED from checker-module.jsx by build-vite-app.py — do not hand-edit.
// Edit the source module and re-run. The single-file artifact stays the
// source of truth so the reviewer's grading path keeps working.
import { useEffect, useState } from "react";
import { installStorage } from "../lib/storage.js";
import { T } from "../lib/tokens.js";
import { recordCheck, readHistory, byErrorType } from "../lib/errorHistory.js";
installStorage();

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



// Rewritten by build-vite-app.py to read the Vite env var. Left as a bare
// string here so this file stays loadable outside a bundler.
const CHECKER_URL = import.meta.env?.VITE_CHECKER_URL || "";  // wired by build-vite-app.py

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


// Register is undecidable without knowing the intended reader — "この資料を見て"
// is fine to a friend and rude to a client. Asking is cheaper than guessing,
// and the guess would be wrong in the direction that embarrasses people.
const CONTEXTS = [
  { id: "casual",   label: "Casual",   jp: "友達に",   hint: "a message to a friend" },
  { id: "polite",   label: "Polite",   jp: "ていねい", hint: "someone you don't know well" },
  { id: "business", label: "Business", jp: "仕事で",   hint: "a colleague or client" },
];

const TIER = {
  fix:       { label: "Fix",           color: "#C7351B", bg: "#FBEDEA", rule: "#C7351B" },
  unnatural: { label: "Unnatural",     color: "#3D5A80", bg: "#EDF1F6", rule: "#3D5A80" },
  note:      { label: "Worth knowing", color: "#907119", bg: "#FAF3E0", rule: "#907119" },
};
const tierOf = (t) => TIER[t] || TIER.note;

// ── furigana ────────────────────────────────────────────────────────────────
// The model returns a separate readings map of bare kanji runs rather than
// inline ruby, so the span stays byte-exact — the decision recorded on the
// furigana tracker row. Rendering happens here, over that map.
function Ruby({ text, readings, on }) {
  if (!on || !readings?.length) return <>{text}</>;
  const pairs = [...readings].filter((p) => Array.isArray(p) && p[0] && p[1])
    .sort((a, b) => b[0].length - a[0].length);
  const out = [];
  let i = 0, k = 0;
  while (i < text.length) {
    const hit = pairs.find((p) => text.startsWith(p[0], i));
    if (hit) {
      out.push(
        <ruby key={k++}>{hit[0]}<rt style={{ fontSize: "0.5em", color: T.sub }}>{hit[1]}</rt></ruby>,
      );
      i += hit[0].length;
    } else {
      const next = text.length;
      out.push(<span key={k++}>{text[i]}</span>);
      i += 1;
      if (next < 0) break;
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
        <Ruby key={k++} text={text.slice(cursor, issue.start)} readings={readings} on={furigana} />,
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
          font: "inherit", borderBottom: `2px solid ${tier.rule}`,
        }}
      >
        <Ruby text={issue.span} readings={readings} on={furigana} />
      </button>,
    );
    cursor = issue.end;
  }
  if (cursor < text.length) {
    parts.push(<Ruby key={k++} text={text.slice(cursor)} readings={readings} on={furigana} />);
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
  const tier = tierOf(issue.type);
  const open = active === issue._id;
  return (
    <div style={{
      border: `1px solid ${T.hairline}`, borderLeft: `3px solid ${tier.rule}`,
      borderRadius: 8, background: T.sheet, marginBottom: 10, overflow: "hidden",
    }}>
      <button
        onClick={() => setActive(open ? null : issue._id)}
        aria-expanded={open}
        style={{
          width: "100%", textAlign: "left", background: "none", border: "none",
          cursor: "pointer", padding: "12px 14px", display: "flex",
          alignItems: "baseline", gap: 10, flexWrap: "wrap",
        }}
      >
        <span style={{
          font: `600 0.6875rem ${T.uiFont}`, letterSpacing: "0.06em",
          textTransform: "uppercase", color: tier.color,
        }}>{tier.label}</span>
        <span style={{ font: `1.0625rem ${T.jpFont}`, color: T.ink }}>
          <Ruby text={issue.span} readings={readings} on={furigana} />
        </span>
        {issue.correction && (
          <>
            <span style={{ color: T.sub, font: `0.875rem ${T.uiFont}` }}>→</span>
            <span style={{ font: `1.0625rem ${T.jpFont}`, color: tier.color }}>
              <Ruby text={issue.correction} readings={readings} on={furigana} />
            </span>
          </>
        )}
        {!issue.located && (
          // Honesty rather than silence. The advice may be sound; we simply
          // could not prove where it points, so we do not point.
          <span style={{
            font: `0.6875rem ${T.uiFont}`, color: T.sub, background: T.paper,
            border: `1px solid ${T.hairline}`, borderRadius: 4, padding: "2px 6px",
          }}>not highlighted — couldn't locate this exactly</span>
        )}
      </button>
      {open && (
        <div style={{ padding: "0 14px 14px", font: `0.875rem/1.65 ${T.uiFont}`, color: T.ink }}>
          <p style={{ margin: "0 0 10px" }}>{issue.explanation}</p>
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
              <Ruby text={check.rewrite} readings={check.readings} on={furigana} />
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

  async function check() {
    if (!canCheck) return;
    setBusy(true); setError(null); setResult(null); setActive(null);
    const submitted = text.trim();
    try {
      if (!CHECKER_URL) throw new Error("not-configured");
      const r = await fetch(CHECKER_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: submitted, context }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || `http-${r.status}`);
      // _id keys the highlight ↔ card pairing. Index is stable for one result.
      data.issues = (data.issues || []).map((x, i) => ({ ...x, _id: i }));
      // Render against the text that was SENT, not what is in the box now —
      // the learner may have kept typing, and offsets belong to the submission.
      data.submitted = submitted;
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
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  const ERRORS = {
    "daily-cap": "That's today's free checks used up. They reset tomorrow.",
    "too-long": `That's longer than ${MAX_CHARS} characters. Try one paragraph at a time.`,
    "upstream-timeout": "The check took too long and was stopped. Try again — a shorter piece usually goes through.",
    "upstream-error": "The checker could not be reached just now. Nothing was lost; try again in a moment.",
    "unparseable": "The response came back malformed. This is a bug on our side, not a problem with your Japanese.",
    "not-configured": "The checker isn't connected yet in this build.",
    "empty-text": "Write something first.",
  };

  const btn = (on) => ({
    border: `1px solid ${on ? T.ink : T.hairline}`,
    background: on ? T.ink : T.sheet, color: on ? T.sheet : T.sub,
    borderRadius: 999, padding: "7px 14px", cursor: "pointer",
    font: `0.8125rem ${T.uiFont}`,
  });

  return (
    <div style={{ padding: "18px 16px 60px", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ font: `600 1.375rem ${T.uiFont}`, color: T.ink, margin: "0 0 4px" }}>
        tsumiki <span style={{ font: `1.25rem ${T.jpFont}`, color: T.sub }}>つみき</span>
      </h1>
      <p style={{ font: `0.875rem/1.6 ${T.uiFont}`, color: T.sub, margin: "0 0 20px" }}>
        Write something in Japanese. You'll get back what's wrong, what's
        technically fine but sounds off, and why — in English.
      </p>

      {/* Two views, not two pages. Review is the same module because it is the
          same material — the checker is where you write Japanese and where you
          go back and look at the Japanese you wrote. */}
      <div style={{
        display: "flex", gap: 18, borderBottom: `1px solid ${T.hairline}`,
        margin: "0 0 18px",
      }}>
        {[["write", "Write"], ["review", "Your sentences"]].map(([id, label]) => (
          <button key={id} onClick={() => setView(id)} aria-pressed={view === id}
            style={{
              background: "none", border: "none", padding: "0 0 8px", cursor: "pointer",
              font: `${view === id ? 600 : 400} 0.875rem ${T.uiFont}`,
              color: view === id ? T.ink : T.sub,
              borderBottom: `2px solid ${view === id ? T.ink : "transparent"}`,
              marginBottom: -1,
            }}>{label}</button>
        ))}
      </div>

      {view === "review" && (
        <Review furigana={furigana} setFurigana={setFurigana} btn={btn} />
      )}

      {view === "write" && (<>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {CONTEXTS.map((c) => (
          <button key={c.id} onClick={() => setContext(c.id)}
                  aria-pressed={context === c.id}
                  title={`Written for ${c.hint}`}
                  style={btn(context === c.id)}>
            {c.label}
            <span style={{ font: `0.75rem ${T.jpFont}`, marginLeft: 6, opacity: 0.75 }}>{c.jp}</span>
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="日本語で書いてみてください。"
        rows={5}
        style={{
          width: "100%", boxSizing: "border-box", padding: 14,
          border: `1px solid ${over ? T.shu : T.hairline}`, borderRadius: 10,
          font: `1.125rem/1.9 ${T.jpFont}`, color: T.ink, background: T.sheet,
          resize: "vertical",
        }}
      />

      <div style={{
        display: "flex", alignItems: "center", gap: 12, margin: "10px 0 22px",
      }}>
        <button onClick={check} disabled={!canCheck} style={{
          border: "none", borderRadius: 999, padding: "11px 22px",
          background: canCheck ? T.ink : T.hairline,
          color: canCheck ? T.sheet : T.sub,
          cursor: canCheck ? "pointer" : "default",
          font: `600 0.9375rem ${T.uiFont}`,
        }}>{busy ? "Checking…" : "Check"}</button>
        <span style={{ flex: 1 }} />
        <span style={{ font: `0.75rem ${T.uiFont}`, color: over ? T.shu : T.sub }}>
          {count} / {MAX_CHARS}
        </span>
      </div>

      {busy && (
        <p style={{ font: `0.875rem ${T.uiFont}`, color: T.sub }}>
          Reading it properly — this usually takes a few seconds, sometimes up to a minute
          for longer writing.
        </p>
      )}

      {error && (
        <div role="alert" style={{
          border: `1px solid ${T.hairline}`, borderLeft: `3px solid ${T.shu}`,
          borderRadius: 8, background: T.sheet, padding: "12px 14px",
          font: `0.875rem/1.6 ${T.uiFont}`, color: T.ink,
        }}>{ERRORS[error] || "Something went wrong. Try again in a moment."}</div>
      )}

      {result && (
        <div>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            marginBottom: 14,
          }}>
            <span style={{
              font: `600 0.75rem ${T.uiFont}`, letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: result.verdict === "NONE" ? T.ok : tierOf(
                result.verdict === "FIX" ? "fix"
                  : result.verdict === "UNNATURAL" ? "unnatural" : "note").color,
            }}>
              {result.verdict === "NONE" ? "Nothing to change" : result.verdict}
            </span>
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

          <div style={{
            background: T.sheet, border: `1px solid ${T.hairline}`,
            borderRadius: 10, padding: "16px 16px 12px", marginBottom: 18,
          }}>
            <Marked
              text={result.submitted}
              issues={result.issues}
              readings={result.readings}
              furigana={furigana}
              active={active}
              setActive={setActive}
            />
          </div>

          {result.issues.length === 0 && (
            <div style={{
              background: T.okBg, border: `1px solid ${T.ok}33`, borderRadius: 10,
              padding: "14px 16px", font: `0.9375rem/1.6 ${T.uiFont}`, color: T.ink,
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
              <p style={{
                font: `1.125rem/2 ${T.jpFont}`, color: T.ink, background: T.sheet,
                border: `1px solid ${T.hairline}`, borderRadius: 10,
                padding: "14px 16px", margin: 0,
              }}>
                <Ruby text={result.model_rewrite} readings={result.readings} on={furigana} />
              </p>
              <p style={{ font: `0.8125rem/1.6 ${T.uiFont}`, color: T.sub, margin: "8px 0 0" }}>
                Changed as little as possible — it is one way to say it, not the
                only correct one.
              </p>
            </div>
          )}

          {result.cap && (
            <p style={{ font: `0.75rem ${T.uiFont}`, color: T.sub, marginTop: 22 }}>
              {result.cap.used} of {result.cap.limit} free checks used today.
            </p>
          )}
        </div>
      )}
      </>)}
    </div>
  );
}
