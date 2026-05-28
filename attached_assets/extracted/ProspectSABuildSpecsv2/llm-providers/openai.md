# OpenAI (GPT-4o / GPT-4o-mini / o4-mini-deep-research)

## Identity
- OpenAI, native client (`OPENAI_API_KEY`). Models: `gpt-4o` (synthesis tertiary), `gpt-4o-mini` (extraction last-resort), `o4-mini-deep-research-2025-06-26` (ProsEngine deep_research intent).
- Strength: reliable JSON/function-calling, strong Arabic report writing (Masaar AR), deep-research model.
- Weakness: priciest alongside Claude (5/15); deep-research model slow.

## Env vars
- Required: `OPENAI_API_KEY`.

## Role bindings
- synthesis (#3 gpt-4o), extraction (#5 gpt-4o-mini), writer (AR). 
- Pin priority: synthesis **3**.

## Reasoning / capabilities
- Extended thinking: o-series yes. Tool use: yes. Vision: yes (gpt-4o; Data Seeder EVAL vision option). JSON: yes (json mode). Streaming: yes.

## Model-shifting
- UP → o4-mini-deep-research for ProsEngine "deep research" intent. DOWN → gpt-4o-mini for cheap extraction.

## Costs
- gpt-4o: 5.00 / 15.00 per MTok. gpt-4o-mini: ~0.15/0.60.

## Routes
- Direct: Masaar Agent 5 (AR report), Company/Person Intel synthesis tertiary, ProsEngine chat deep_research, Data Seeder EVAL (GPT-4o-vision option).
- Indirect: Nexus synthesis/extraction tiers.

## Fallback chain
- synthesis: after Gemini + Claude. deep_research: o4-mini → Perplexity fallback.

## Arabic
- Native Arabic 4/5; commonly paired with Claude for bilingual EN/AR reports.

## Notes
- Rotate the key if leaked (one was exposed earlier in dev).
