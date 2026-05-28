# OpenRouter (primary aggregator + Fusion host)

## Identity
- OpenRouter — multi-model API gateway, https://openrouter.ai. Client: OpenAI SDK with `baseURL https://openrouter.ai/api/v1`, headers `HTTP-Referer: https://prospectsa.app`, `X-Title: ProspectSA NEXUS Engine`.
- Strength: one key → DeepSeek/Llama/Qwen/Mistral/Claude/Gemini; `:free` variants; cheapest extraction workhorse.
- Weakness: variable per-model latency; some `:free` models rate-limited.

## Env vars
- Required: `OPENROUTER_API_KEY`
- Optional: `NEXUS_PREFER_FREE_MODELS` (prepend `:free` variants)

## Role bindings (which tiers route here)
- extraction (deepseek-chat #1, qwen-2.5-72b #3) · arabic (qwen #2, deepseek #4) · realtime (deepseek #2) · bulk (deepseek-chat-v3-5 #2) · synthesis (claude-sonnet-4-5 via OR #2, deepseek-v3-5 #4).
- Pin priority: extraction **1**, synthesis **2–4**.

## Reasoning / capabilities
- Extended thinking: model-dependent (deepseek-r1 yes). Tool use: model-dependent. Vision: model-dependent (not used here). JSON mode: yes (extraction prompts force JSON). Streaming: yes.

## Model-shifting rules
- Escalate UP (→ synthesis: claude-sonnet-4-5 / gpt-4o): output > ~4k tokens, factual disagreement, "Show trace" on.
- De-escalate DOWN (→ deepseek-chat / qwen): bulk classify, budget mode, `NEXUS_PREFER_FREE_MODELS=true`.

## Fusion behaviour **[planned — `nexusFusion`, engine branch]**
- Ensemble: two cheap models (`deepseek-v3` + `llama-3.3-70b`) run in parallel → **Claude arbitrates** conflicts.
- Voting: pick first valid JSON; on disagreement Claude merges + flags the conflict (feeds verdict layer §7).
- Latency budget: ~8s for the ensemble, +Claude arbitration.

## Costs (per 1M tok)
deepseek-chat 0.27/0.27 · qwen-2.5-72b 0.40/0.40 · mistral-large 2.00/6.00 · claude-sonnet-4-5 3.00/15.00 · gemini-2.5-flash-preview 0.15/0.60.

## Routes that touch it
- Direct: `nexus/llm-router.ts` (`getOpenRouterClient`). Indirect: every engine via Nexus.

## Fallback chain
- If OR 4xx/5xx/timeout → next provider in the tier chain (Groq / Gemini / OpenAI / Ollama).

## Arabic / multilingual
- Via qwen-2.5-72b: native Arabic 4/5, RTL ok, strong code-switching.

## Notes / gotchas
- `:free` models can 429 under load — keep paid fallbacks configured.
- Anthropic is reached **through** OpenRouter here (`anthropic/claude-sonnet-4-5`), so an OR key also unlocks Claude in synthesis.
