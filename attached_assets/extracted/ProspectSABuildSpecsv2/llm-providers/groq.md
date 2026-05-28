# Groq (Llama 3.x + Orpheus Arabic)

## Identity
- Groq LPU inference, OpenAI SDK `baseURL https://api.groq.com/openai/v1`. Models: `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `canopylabs/orpheus-arabic-saudi`.
- Strength: ~800 tok/s (realtime), **$0** cost, dedicated Saudi-Arabic model.
- Weakness: context limits; occasional capacity 503s.

## Env vars
- Required: `GROQ_API_KEY`.

## Role bindings
- realtime (#1 llama-3.3), arabic (#1 orpheus-arabic-saudi), extraction (#2 llama-3.3), bulk (#3 llama-3.1-8b). researcher/realtime + arabic roles.
- Pin priority: realtime **1**, arabic **1**.

## Reasoning / capabilities
- Extended thinking: no. Tool use: limited. Vision: no. JSON: yes. Streaming: yes.

## Model-shifting
- UP → synthesis tier when output > ~2k or reasoning needed. DOWN → llama-3.1-8b-instant for bulk.

## Costs
- $0.00 / $0.00 (all three models in the cost table).

## Routes
- Direct: Nexus realtime/arabic/extraction/bulk chains. Indirect: signal classification, fast extraction.

## Fallback chain
- realtime: Groq → OpenRouter deepseek → Gemini.

## Arabic
- orpheus-arabic-saudi: native Saudi Arabic 5/5, RTL ok; best dialect handling in the fabric.

## Notes
- Free tier → ideal first-try for cheap bulk; keep OpenRouter as the paid safety net on 503.
