# DeepSeek (V3 / V3.5 / R1)

## Identity
- DeepSeek, reached via OpenRouter (`deepseek/deepseek-chat`, `deepseek-chat-v3-5`, `deepseek-r1`); native client optional (`DEEPSEEK_API_KEY`, `https://api.deepseek.com/v1`) [engine branch].
- Strength: cheapest capable extractor/classifier; R1 = reasoning; default bulk workhorse.
- Weakness: slower first token than Groq; Arabic 3/5 (use qwen/gemini for AR).

## Env vars
- Required: `OPENROUTER_API_KEY` (or `DEEPSEEK_API_KEY` native).

## Role bindings
- extraction (#1), realtime (#2), bulk (v3-5 #2), synthesis (v3-5 last-resort #4). extractor/bulk/signal/tree roles.
- Pin priority: extraction **1**, bulk **2**.

## Reasoning / capabilities
- Extended thinking: R1 yes (CoT). Tool use: limited. Vision: no. JSON: yes. Streaming: yes.

## Model-shifting
- UP → Claude/Gemini for synthesis or on disagreement. DOWN → deepseek-chat for bulk/budget.

## Costs
- deepseek-chat 0.27/0.27 · deepseek-r1 0.55/2.19 per MTok.

## Routes
- Direct: Nexus extraction/bulk chains. Indirect: every enrich/dedup/validate path via Nexus.

## Fallback chain
- extraction: deepseek-chat → Groq llama-3.3 → qwen → gemini → gpt-4o-mini.

## Arabic
- 3/5; defer to qwen/gemini/orpheus for AR-heavy.

## Notes
- The `:free` deepseek variants are prepended when `NEXUS_PREFER_FREE_MODELS=true`.
