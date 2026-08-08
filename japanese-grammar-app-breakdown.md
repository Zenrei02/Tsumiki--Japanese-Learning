# Japanese Writing Feedback App — Project Breakdown

*Working document · July 2026*

## The concept

A Grammarly-style feedback tool for adult English speakers learning Japanese. The learner writes Japanese; the app highlights issues inline and explains, in plain English, why each one is wrong and what pattern it belongs to. Unlike a proofreader, the goal is pedagogical: every correction teaches the underlying rule, and repeated errors become visible patterns the learner can work on deliberately.

The engine is an LLM analysis pipeline rather than hand-built NLP. Each check sends the learner's text plus a carefully engineered system prompt to the Claude API and receives structured JSON: issues tagged by category (particle, conjugation, word choice, word order, register, naturalness, orthography), severity (error vs. suggestion), an English explanation, a reusable pattern name, and an approximate JLPT level. The app renders this as highlighted text with margin-note explanations.

## Why this and why now

There is no dominant "Grammarly for Japanese learners." LanguageTool's Japanese support is thin, Japanese proofreading tools like Shodo target native business writers, and learner apps such as Bunpro teach grammar but do not check the learner's own writing. Meanwhile, frontier LLMs are now strong enough at Japanese that the hard language-intelligence problem no longer has to be built — it can be rented per request, which puts the product within reach of a solo builder.

The founder position here is learner-first rather than expert-first: the idea comes from the direct experience of not knowing why one's own Japanese sentences sound off. That is a product-insight advantage, and it shapes both the pedagogy (explanations written for the confused learner, not the linguist) and the marketing (build-in-public learner content rather than expert lectures). The corresponding gap — inability to personally verify Japanese output — is covered by a native-capable reviewer who grades the tool's corrections. This reviewer is on the critical path for validation and periodic quality checks thereafter.

## What differentiates it from Grammarly

Grammarly tells you what is wrong; this tool tracks what you keep getting wrong and teaches the pattern. The `pattern_name` field in every correction (for example, "は vs が: new information") is the pedagogical backbone: it lets the app count repeated patterns per user, surface them as focus areas, and eventually trigger targeted practice. The tone of explanations assumes an English-speaking adult and explicitly addresses L1 interference — the predictable errors that come from translating English structures directly.

## Architecture at a glance

Three layers. The input layer is a web app with a text box and an optional context setting (casual message, polite email, business), since register errors are undecidable without knowing the intended audience. The analysis layer is a single API call to Claude (Sonnet-class to start, with Haiku tested later for cheap short checks), using a static system prompt that benefits fully from prompt caching. The presentation layer highlights each issue's exact span in the text, color-coded by severity, with tap-to-expand explanations, an overall naturalness score, and a minimally-edited natural rewrite.

Two engineering rules from day one. First, verify that every returned span exists character-for-character in the input, and fall back gracefully when it does not — models occasionally paraphrase spans. Second, the free tier has a hard daily check cap, which converts worst-case API cost from unbounded to a chosen number.

## Phases

### Phase 0 — Prompt validation (now; zero cash)

Runs entirely on the existing Claude subscription, no API credits. An artifact prototype on claude.ai wires the system prompt to a working interface: paste a sentence, see highlighted corrections. Alongside it, an eval set of thirty to fifty sentences is written by hand — roughly one third correct (to measure false positives) and the rest seeded with realistic English-speaker errors across the category list, spread over JLPT N5–N2. The reviewer grades the tool's output blind: they mark up the sentences independently first, then compare against the tool. The bar to proceed is roughly ninety percent agreement with the reviewer and a low rate of invented errors. If the tool falls short, the prompt is tuned and the set rerun before any product code is written.

### Phase 1 — MVP (four to eight weeks part-time)

A standalone web app built with Claude Code: accounts, the checker with inline highlights, per-user error history keyed by pattern name, the context selector, and the tuned prompt behind a small backend that holds the API key. Hosting on free tiers (Vercel or Railway plus Supabase) until traffic demands otherwise. The reviewer spot-checks real outputs periodically. Success here is the founder and a handful of beta users choosing to use it for their own study.

### Phase 2 — Beta and first users (two to three months)

Open the app to learner communities with a capped free tier. Begin the acquisition engine: build-in-public posts documenting the founder's own Japanese study using the tool, plus learner-perspective articles reviewed by the native-speaker checker before publishing, each with an embedded "try it on your sentence" widget. Instrument the basics: checks per user, return rate, which patterns recur most. This phase answers whether strangers come back without being reminded.

### Phase 3 — Paid tier and retention features (three to six months)

Stripe integration, a paid tier that lifts the daily cap and unlocks progress features, and the retention layer described below. Business housekeeping lands here too: sole-proprietor registration in Japan is sufficient at first, with incorporation deferred until revenue justifies it. Before charging money, two Japan-specific items must be confirmed — that the founder's residence status permits side-business income (or the relevant permission is obtained) and that the employment contract allows side work.

## Future feature directions (to be designed after validation)

**Stats and progress tracking.** Every check already produces structured data, so tracking is mostly a matter of storing it: errors per hundred characters over time, naturalness score trend, a breakdown of which categories and pattern names dominate, and streaks of checks per week. The emotionally important number for a learner is visible improvement — "your particle errors are down forty percent since May" is worth more than any dashboard.

**Practice suggestions.** The pattern-name counts make weaknesses machine-readable. When a pattern recurs past a threshold, the app can generate a short targeted drill: a mini-explanation of the rule, then a handful of produce-a-sentence exercises checked by the same engine. This closes the loop from "you keep making this mistake" to "here is five minutes of practice on exactly that," which no general proofreader offers.

**Check-in reminders and tips.** Retention nudges should carry content, not guilt: a weekly email or push with the learner's top recurring pattern and a one-paragraph tip about it, a gentle streak note, and occasionally a single sentence to correct right inside the notification. The principle is that every reminder teaches something even if the user never opens the app that day.

## Costs

Building costs are effectively the founder's time plus tools already owned: a domain (~$12/year), free-tier hosting rising to roughly $20–45/month with real traffic, Stripe with no upfront fee, and the existing Claude subscription covering Claude Code. The variable cost is the API: at current pricing (Sonnet $3/$15 per million tokens in/out, Haiku $1/$5, with prompt caching cutting repeated system-prompt input by ninety percent), a typical check costs about one cent on Sonnet and a third of that or less on Haiku. An active free user at twenty checks a month costs pennies; a thousand active free users land around $60–200/month, bounded by the daily cap. Reviewer QA is budgeted at a few hundred dollars across the first months if paid rather than partnered.

Six-month totals: a shoestring path runs roughly $500–1,500 all-in with acquisition done entirely through content and community presence; a comfortable path of $3,000–5,000 adds paid-ad experiments (only after conversion can be measured), a design pass, and incorporation if circumstances require it.

## Risks and mitigations

The dominant product risk is feedback quality: an LLM will sometimes invent errors or miss real ones, and learners cannot judge this themselves — that is why they came. Mitigation is the blind-graded eval set as a launch gate, ongoing reviewer spot checks, a prompt that explicitly rewards returning zero issues on correct text, and severity labels the user can trust. The dominant business risk is the solo-founder trap of building features instead of finding users; the mitigation is treating content and community hours as equal in priority to product hours from Phase 2 onward. Cost risk is handled structurally by the free-tier cap. Legal and administrative risk is the visa and employment-contract check, which is cheap to resolve early and expensive to discover late.

## Immediate next steps

Test the artifact prototype personally, then draft the eval set (with an answer key the reviewer verifies rather than trusts), run the blind grading session, and make the go or tune decision. Everything else in this document waits on that result.
