# Moonshot / Kimi

## Identity
- Moonshot AI (Kimi), native client `https://api.moonshot.cn/v1` [engine branch]. Reachable via OpenRouter too.
- Strength: long-context planning, strong Arabic + Chinese, cheap; designated **planner pin** when key present (plan §5).
- Weakness: regional API latency; not in the current router's default chains on this branch.

## Env vars
- Required: `MOONSHOT_API_KEY` or `KIMI_API_KEY` (or `OPENROUTER_API_KEY`).

## Role bindings **[planned]**
- planner (pinned #1 when key present), arabic secondary. Used by Behavior Agent `/api/behavior/suggest` and AI Chat Plan B (`pin:"kimi"`).
- Pin priority: planner **1 (when present)**.

## Reasoning / capabilities
- Extended thinking: yes. Tool use: yes. Vision: model-dependent. JSON: yes. Streaming: yes.

## Model-shifting
- UP → Claude for final synthesis/arbitration. DOWN → DeepSeek for bulk.

## Costs
- ~0.001–0.004 per MTok (cheapest planner option).

## Routes
- Direct **[planned]**: Behavior Agent suggest, AI Chat Plan B planner. Indirect: planner role → synthesis tier.

## Fallback chain
- Plan B: Kimi → OpenRouter Claude 3.5 → GPT-4o → Llama 3.3.

## Arabic
- Native Arabic 4/5; RTL ok.

## Notes
- This is the model **you are building the swarm on** — kept out of the swarm doc deliberately; here only as the planner/Plan-B provider it plugs into.
