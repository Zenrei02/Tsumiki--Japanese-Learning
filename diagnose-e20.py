#!/usr/bin/env python3
"""Throwaway diagnostic — capture what Haiku 4.5 (M1) actually returns for
E20 (`参考書をご覧になりますか？`). The bake-off harness discards the raw body on
a json.loads failure, so four failed runs taught us nothing about the cause.
This calls the same endpoint the same way and prints the raw text every time,
parse failure or not, so we can see: markdown fence, truncation, malformed
JSON, or refusal.

Reads ANTHROPIC_API_KEY from the environment. Never logs or writes the key.
Run N times in a row (default 6) since the failure is intermittent.
"""
import json, os, re, sys, time, pathlib, urllib.request

HERE = pathlib.Path(__file__).parent
API = "https://api.anthropic.com/v1/messages"
MODEL = "claude-haiku-4-5-20251001"
SENTENCE = "参考書をご覧になりますか？"
N = int(sys.argv[1]) if len(sys.argv) > 1 else 6

def load_prompt():
    src = (HERE / "naoshi-prototype.jsx").read_text(encoding="utf-8")
    m = re.search(r"const SYSTEM_PROMPT = `(.*?)`;", src, re.S)
    if not m:
        sys.exit("Could not extract SYSTEM_PROMPT from naoshi-prototype.jsx")
    return m.group(1)

def call(key, system_prompt):
    body = {
        "model": MODEL,
        "max_tokens": 8000,
        "temperature": 0,
        "system": [{"type": "text", "text": system_prompt,
                    "cache_control": {"type": "ephemeral"}}],
        "messages": [{"role": "user", "content": SENTENCE}],
    }
    req = urllib.request.Request(
        API, data=json.dumps(body).encode(), method="POST",
        headers={"x-api-key": key, "anthropic-version": "2023-06-01",
                 "content-type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)

def main():
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        sys.exit("ANTHROPIC_API_KEY is not set.")
    system_prompt = load_prompt()
    for i in range(1, N + 1):
        print(f"\n===== attempt {i}/{N} =====")
        try:
            resp = call(key, system_prompt)
        except urllib.error.HTTPError as e:
            print(f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')}")
            continue
        stop_reason = resp.get("stop_reason")
        text = "".join(b.get("text", "") for b in resp.get("content", []))
        u = resp.get("usage", {})
        print(f"model_answered={resp.get('model')} stop_reason={stop_reason} "
              f"out_tokens={u.get('output_tokens')} chars={len(text)}")
        print("--- raw text ---")
        print(text)
        print("--- end raw text ---")
        stripped = re.sub(r"^```(json)?|```$", "", text.strip(), flags=re.M).strip()
        try:
            json.loads(stripped)
            print("PARSE: OK")
        except json.JSONDecodeError as e:
            print(f"PARSE: FAILED — {e}")
        if i < N:
            time.sleep(1)

if __name__ == "__main__":
    main()
