# Perplexity (Sonar — live web research)

## Identity
- Perplexity, native (`PERPLEXITY_API_KEY`, `https://api.perplexity.ai`), model `sonar`. Used **directly** by engines for real-time web research (NOT in the Nexus `buildAttemptChain` tiers on this branch).
- Strength: live web + citations; deep company/person research; Saudi market coverage.
- Weakness: **paid + spend-prone** (the $60 runaway) → gated by `paid-api-guard`.

## Env vars
- Required: `PERPLEXITY_API_KEY`. Controls: `DISABLE_PERPLEXITY`, `PERPLEXITY_JOB_BUDGET`.

## Role bindings
- researcher (realtime intent) — but invoked directly, not via tier routing here.
- Pin priority: research **1** when a real job is active.

## Reasoning / capabilities
- Extended thinking: no. Tool use: built-in web. Vision: no. JSON: partial. Streaming: yes.

## Model-shifting
- Only fires inside a budgeted job (`enterJob`/`runInJob`). On budget exhaustion → skip, fall back to free sources (Tavily/SearXNG/Google RSS) + Nexus realtime.

## Costs
- ~$0.004–0.02 per query (varies by model/tokens).

## Routes
- Direct: `perplexity-enrichment.ts`, `perplexity-service.ts`, Company Intel (×4), Person Intel (×4), Masaar Agent 3 (×5), signal-monitor, builder/masaar enrich.

## Fallback chain
- Perplexity → free web search (Tavily→SearXNG→Google) → Nexus realtime.

## Arabic
- 4/5 with AR queries; pair with Saudi RSS.

## Notes
- **Cost discipline:** every caller is wrapped in `paid-api-guard`. Set `PERPLEXITY_JOB_BUDGET`, and `DISABLE_PERPLEXITY=true` to hard-off. `NEXUS_PREFER_FREE_MODELS=true` reduces reliance.
