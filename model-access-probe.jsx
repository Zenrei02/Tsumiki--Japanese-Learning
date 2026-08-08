import React, { useState } from "react";

// Naoshi's own tokens — this is an internal instrument for the project, so it
// should look like it belongs to it rather than inventing a second identity.
const T = {
  paper: "#F7F6F2",
  sheet: "#FFFFFF",
  ink: "#22252B",
  sub: "#6E7178",
  hairline: "#E4E2DB",
  shu: "#C7351B",
  ai: "#3D5A80",
  ok: "#3E7C4F",
  note: "#907119",
  noteBg: "#FAF3E0",
  jpFont: '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif',
  uiFont:
    '-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Noto Sans JP",sans-serif',
};

// sonnet-4-6 is the documented default for artifact API calls and acts as the
// control. Without it a run of four failures is uninterpretable: it could mean
// the model is pinned, or that the whole call path is broken.
const MODELS = [
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6", role: "control — the documented default" },
  { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5", role: "bake-off" },
  { id: "claude-sonnet-5", label: "Sonnet 5", role: "bake-off" },
  { id: "claude-opus-5", label: "Opus 5", role: "bake-off" },
];

const VERDICTS = {
  honoured: { label: "HONOURED", colour: T.ok, gloss: "returned the model that was asked for" },
  substituted: { label: "SUBSTITUTED", colour: T.note, gloss: "answered, but as a different model" },
  refused: { label: "REFUSED", colour: T.shu, gloss: "the request did not go through" },
};

export default function ModelAccessProbe() {
  const [rows, setRows] = useState([]);
  const [running, setRunning] = useState(false);

  async function probe(m) {
    const started = Date.now();
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: m.id,
          max_tokens: 1000,
          messages: [{ role: "user", content: "Reply with exactly: OK" }],
        }),
      });
      const ms = Date.now() - started;
      const data = await res.json();

      if (!res.ok || data.error) {
        return {
          ...m, verdict: "refused", ms,
          detail: data?.error?.message || `HTTP ${res.status}`,
        };
      }

      // The important comparison. A pinned proxy may not error at all — it may
      // quietly answer as whatever model it decided to use, which would corrupt
      // a bake-off silently rather than loudly.
      const returned = data.model || "(none reported)";
      const text = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join(" ")
        .trim();

      return {
        ...m,
        verdict: returned === m.id ? "honoured" : "substituted",
        ms,
        detail: returned === m.id ? text || "(empty reply)" : `answered as ${returned}`,
        returned,
      };
    } catch (e) {
      return { ...m, verdict: "refused", ms: Date.now() - started, detail: e.message };
    }
  }

  async function runAll() {
    setRunning(true);
    setRows([]);
    // Sequential on purpose — four parallel calls risk a rate limit that would
    // read as a model refusal and send you chasing the wrong problem.
    for (const m of MODELS) {
      const r = await probe(m);
      setRows((prev) => [...prev, r]);
    }
    setRunning(false);
  }

  const done = rows.length === MODELS.length;
  const control = rows.find((r) => r.role.startsWith("control"));
  const bake = rows.filter((r) => r.role === "bake-off");

  let reading = null;
  if (done) {
    if (control?.verdict === "refused") {
      reading = "The control failed too, so this says nothing about model access — the call path itself is broken. Fix that before reading anything else here.";
    } else if (bake.every((r) => r.verdict === "honoured")) {
      reading = "Arbitrary models are honoured. The bake-off can run as a runner artifact.";
    } else if (bake.every((r) => r.verdict !== "honoured")) {
      reading = "The model is pinned. The bake-off cannot run in-artifact — it needs a harness against your own API key.";
    } else {
      reading = "Mixed. Only the models marked HONOURED can be trusted in the bake-off; treat the rest as unavailable rather than assuming they will settle down.";
    }
  }

  return (
    <div style={{ minHeight: "100%", background: T.paper, fontFamily: T.uiFont, color: T.ink, padding: "28px 20px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <div style={{ fontFamily: T.jpFont, fontSize: 22, marginBottom: 4 }}>模型確認</div>
        <h1 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 6px" }}>Model access probe</h1>
        <p style={{ fontSize: 13.5, color: T.sub, lineHeight: 1.6, margin: "0 0 18px" }}>
          Asks each model to say OK, then checks the model named on the reply against the one
          requested. A pinned proxy may answer normally as a substitute rather than refusing, so a
          successful call is not on its own evidence that the request was honoured.
        </p>

        <button
          onClick={runAll}
          disabled={running}
          style={{
            fontFamily: T.uiFont, fontSize: 14, padding: "9px 18px", borderRadius: 3,
            border: `1px solid ${T.ink}`, background: running ? T.hairline : T.ink,
            color: running ? T.sub : T.paper, cursor: running ? "default" : "pointer",
          }}
        >
          {running ? "Running…" : "Run the probe"}
        </button>

        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((r) => {
            const v = VERDICTS[r.verdict];
            return (
              <div
                key={r.id}
                style={{
                  background: T.sheet, border: `1px solid ${T.hairline}`,
                  borderLeft: `3px solid ${v.colour}`, borderRadius: 3, padding: "11px 13px",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{r.label}</span>
                  <span style={{ fontSize: 10.5, letterSpacing: ".7px", color: v.colour, fontWeight: 600 }}>
                    {v.label}
                  </span>
                  <span style={{ fontSize: 11.5, color: T.sub, marginLeft: "auto" }}>{r.ms} ms</span>
                </div>
                <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2 }}>
                  {r.id} · {r.role}
                </div>
                <div style={{ fontSize: 12.5, color: T.ink, marginTop: 6, wordBreak: "break-word" }}>
                  {r.detail}
                </div>
              </div>
            );
          })}
          {running && (
            <div style={{ fontSize: 12.5, color: T.sub }}>
              {MODELS[rows.length]?.label}…
            </div>
          )}
        </div>

        {reading && (
          <div
            style={{
              marginTop: 18, background: T.noteBg, border: `1px solid ${T.hairline}`,
              borderLeft: `3px solid ${T.note}`, borderRadius: 3, padding: "12px 14px",
              fontSize: 13.5, lineHeight: 1.6,
            }}
          >
            <div style={{ fontSize: 10.5, letterSpacing: ".7px", color: T.note, fontWeight: 600, marginBottom: 4 }}>
              WHAT THIS MEANS
            </div>
            {reading}
          </div>
        )}
      </div>
    </div>
  );
}
