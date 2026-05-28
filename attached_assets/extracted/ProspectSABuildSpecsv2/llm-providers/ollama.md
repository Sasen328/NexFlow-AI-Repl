# Ollama (local / offline)

## Identity
- Local LLM server, OpenAI SDK `baseURL ${OLLAMA_BASE_URL}/v1` (default `http://localhost:11434`), model `OLLAMA_MODEL` (default `llama3.1`).
- Strength: **$0**, private/offline, no rate limits; bulk-tier first-try.
- Weakness: quality below frontier; throughput bound by local hardware.

## Env vars
- Optional: `OLLAMA_BASE_URL`, `OLLAMA_MODEL`. (Always "configured" in `getLLMStatus`.)

## Role bindings
- bulk (#1). validator/bulk roles.
- Pin priority: bulk **1**.

## Reasoning / capabilities
- Extended thinking: model-dependent. Tool use: no. Vision: no. JSON: best-effort. Streaming: yes.

## Model-shifting
- UP → OpenRouter deepseek-v3-5 / Groq when local quality insufficient or server down. Never escalates automatically beyond the bulk chain.

## Costs
- $0 (self-hosted compute).

## Routes
- Direct: Nexus bulk tier. Indirect: mass classification, privacy-sensitive batches.

## Fallback chain
- bulk: Ollama → OpenRouter deepseek-chat-v3-5 → Groq llama-3.1-8b-instant.

## Arabic
- Depends on local model; llama3.1 ~3/5.

## Notes
- If no Ollama server is running, the bulk attempt simply fails fast and falls through to OpenRouter/Groq.
