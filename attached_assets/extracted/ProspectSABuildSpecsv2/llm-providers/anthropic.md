# Anthropic — Claude Sonnet 4.x

## Identity
- Anthropic Claude, https://anthropic.com. Used two ways: (1) **directly** by AI Chat orchestrator + engine synthesis (`anthropic-service.ts`), model `claude-sonnet-4-6`; (2) via Nexus synthesis tier as `anthropic/claude-sonnet-4-5` **through OpenRouter**.
- Strength: best synthesis/dossier writing, strict instruction-following, fusion arbiter, CAPTCHA vision.
- Weakness: most expensive (3/15 per MTok); rate limits on bursty bulk.

## Env vars
- Required (direct): `ANTHROPIC_API_KEY`. (via Nexus: `OPENROUTER_API_KEY`.)

## Role bindings
- synthesis (#2 after Gemini), writer, planner; **fusion arbitrator [planned]**. AI Chat orchestrator default model.
- Pin priority: synthesis **2**; orchestrator **1**.

## Reasoning / capabilities
- Extended thinking: yes. Tool use: yes (the 9-tool loop). Vision: yes (Masaar CAPTCHA auto-solve). JSON: yes. Streaming: yes (SSE `token`).

## Model-shifting rules
- Escalate UP to Claude when: final dossier, fusion conflict arbitration, factual disagreement.
- De-escalate DOWN from Claude when: bulk classify, budget mode → DeepSeek/Gemini.

## Costs
- claude-sonnet-4-5: in 3.00 / out 15.00 per MTok.

## Routes that touch it
- Direct: `lib/anthropic-service.ts`, `lib/agents/orchestrator.ts` [engine branch], `masaar-engine.ts` (report EN + vision), Company/Person Intel synthesis.
- Indirect: Nexus synthesis tier.

## Fallback chain
- Direct synthesis: Claude → Gemini → GPT-4o → Nexus.
- Plan B (AI Chat, key absent): `nexusRunRole("planner",{pin:"kimi"})` → OpenRouter Claude 3.5 → GPT-4o → Llama 3.3; emit `degraded_mode`.

## Arabic / multilingual
- Native Arabic 4/5; RTL ok; strong code-switching. (AR report often paired with GPT-4o.)

## Notes / gotchas
- Boot-critical for AI Chat + Masaar vision. Without it, Plan B degrades gracefully.
