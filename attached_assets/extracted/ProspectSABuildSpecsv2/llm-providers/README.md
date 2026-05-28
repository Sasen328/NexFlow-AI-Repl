# LLM Providers — Index & Routing Truth

> Grounded in `artifacts/api-server/src/lib/nexus/llm-router.ts` (real, this branch).
> Role→tier bindings and `nexusFusion` are the target design (live on the engine
> branch); they are marked **[planned]** where the current router doesn't yet implement them.

## Tiers (real — `TaskTier`)
`extraction` · `arabic` · `synthesis` · `bulk` · `realtime`. Entry points: `nexusGenerate(prompt,{tier})`, `nexusExtract`, `nexusSynthesize`, `nexusRealtime`. Forced override via `forceModel` / `forceProvider`. Usage + cost tracked in `sessionUsageLog`.

## Real fallback chains (from `buildAttemptChain`)
| Tier | Order (first → last; only configured providers included) |
|---|---|
| extraction | OpenRouter `deepseek/deepseek-chat` → Groq `llama-3.3-70b-versatile` → OpenRouter `qwen/qwen-2.5-72b-instruct` → Gemini `gemini-2.5-flash` → OpenAI `gpt-4o-mini` |
| arabic | Groq `canopylabs/orpheus-arabic-saudi` → OpenRouter `qwen-2.5-72b` → Gemini `2.5-flash` → OpenRouter `deepseek-chat` → Groq `llama-3.3-70b` |
| realtime | Groq `llama-3.3-70b-versatile` → OpenRouter `deepseek-chat` → Gemini `2.5-flash` |
| bulk | Ollama (`OLLAMA_MODEL`/llama3.1) → OpenRouter `deepseek-chat-v3-5` → Groq `llama-3.1-8b-instant` |
| synthesis (default) | Gemini `2.5-flash` → Anthropic `claude-sonnet-4-5` (via OpenRouter) → OpenAI `gpt-4o` → OpenRouter `deepseek-chat-v3-5` |

## Role → tier map **[planned, engine branch]**
planner→synthesis · researcher→realtime · extractor→extraction · arabic→arabic · writer→synthesis · validator→bulk · bulk→bulk · signal→extraction · tree→extraction. (`nexusRunRole(role, task, opts)`.)

## Cost table (per 1M tok, from `COST_PER_MTOK`)
deepseek-chat 0.27/0.27 · deepseek-r1 0.55/2.19 · llama-3.1-70b 0.10/0.10 · llama-3.3-70b 0.12/0.12 · mistral-large 2.00/6.00 · qwen-2.5-72b 0.40/0.40 · qwen3-32b 0.10/0.10 · gemini-2.5-flash 0.15/0.60 · claude-sonnet-4-5 3.00/15.00 · gpt-4o 5.00/15.00 · groq llama/orpheus 0.00/0.00.

Provider files: `anthropic.md` · `openrouter.md` · `moonshot-kimi.md` · `deepseek.md` · `groq.md` · `perplexity.md` · `gemini.md` · `openai.md` · `ollama.md`.
