# Google Gemini 2.5 Flash

## Identity
- Google Gemini, via `gemini-search.js` (`generateWithGemini`), model `gemini-2.5-flash`.
- Strength: synthesis-tier **primary** (cheap + grounded search), multilingual, high throughput for parallel research fan-out (×5 Company Intel, ×4 Masaar).
- Weakness: occasional JSON drift; safety filters can blank sensitive queries.

## Env vars
- Required: `GEMINI_API_KEY`.

## Role bindings
- synthesis (#1), arabic (#3), extraction (#4), realtime (#3). researcher/writer/arabic.
- Pin priority: synthesis **1**.

## Reasoning / capabilities
- Extended thinking: limited. Tool use: native grounding. Vision: yes (not wired here). JSON: yes. Streaming: yes.

## Model-shifting
- UP → Claude/GPT-4o when Gemini returns null/low-confidence or for final arbitration. DOWN → used as the cheap default before paid frontier.

## Costs
- gemini-2.5-flash: 0.15 / 0.60 per MTok.

## Routes
- Direct: Company Intel (×5), Person Intel (×2), Masaar Agent 3 (×4), `nexusGenerate` synthesis #1.
- Indirect: synthesis/arabic/extraction tiers.

## Fallback chain
- synthesis: Gemini → Claude → GPT-4o → OpenRouter deepseek-v3-5.

## Arabic
- Native Arabic 4/5; RTL ok; good code-switching.

## Notes
- Strongly recommended alongside Anthropic as a boot key — it's the synthesis #1 and the cheapest grounded researcher.
