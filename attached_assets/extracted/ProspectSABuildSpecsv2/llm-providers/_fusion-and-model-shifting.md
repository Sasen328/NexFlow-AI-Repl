# Nexus Fusion + Model-Shifting Decision Tree

> Two mechanisms sit on top of the tier router. **Tier routing + fallback chains
> are real** (`llm-router.ts`). **`nexusFusion` is target design** (engine branch);
> documented here so the swarm/builder can implement it identically.

---

## 1. Model-shifting (escalate / de-escalate)

The router picks a tier; shifting decides when to move *between* tiers mid-task.

```
                 ┌─────────────── incoming task ───────────────┐
                 │  tag? (bulk/classify) ──────────► BULK tier   │  Ollama → deepseek → groq-8b
                 │  needs live web? ───────────────► REALTIME    │  groq → deepseek → gemini
                 │  Arabic-dominant? ──────────────► ARABIC      │  orpheus → qwen → gemini
                 │  parse fields/JSON? ────────────► EXTRACTION  │  deepseek → groq → qwen → gemini → 4o-mini
                 │  final dossier / reasoning? ────► SYNTHESIS   │  gemini → claude → gpt-4o → deepseek-v3-5
                 └──────────────────────────────────────────────┘

ESCALATE UP (→ synthesis frontier: Claude / GPT-4o) when:
  • requested output > ~4k tokens
  • two sources / two models disagree on a fact  → arbitration needed
  • user toggles "Show trace" / high-stakes report
  • verdict layer returns certainty "unverified" and a recheck is requested

DE-ESCALATE DOWN (→ deepseek / groq / ollama) when:
  • task tagged "bulk classify" or signal-scan
  • budget mode on / PERPLEXITY disabled / NEXUS_PREFER_FREE_MODELS=true
  • a cheap model already returned valid, schema-conformant JSON
```

Headers (target): response carries `X-Provider-Used` and `X-Shifted-From` when an escalation occurred; request honours `X-Nexus-Tier` and `X-Reasoning-Mode: extended`.

---

## 2. `nexusFusion(role, prompt, models[])` **[planned]**

Ensemble for facts that must be right (financials, ownership, CR data).

```
prompt ──► model A (deepseek-v3)  ─┐
      └──► model B (llama-3.3-70b) ─┤──► collect candidates
                                    │
            ┌───────────────────────┘
            ▼
   arbitrator = Claude (or Gemini):
     • if A == B (normalised)         → accept, certainty boost
     • if A != B                       → Claude picks + writes rationale (conflict logged)
     • if neither valid JSON           → escalate to synthesis tier
            │
            ▼
   emit { value, agreedBy[], arbitratedBy, rationale } ──► verdict layer (§7)
```

- **Voting strategy:** first valid JSON wins on agreement; Claude arbitrates conflicts.
- **Latency budget:** ~8s ensemble + arbitration; skip fusion when budget mode is on.
- **Verdict coupling:** agreement across 2 models raises `trustScore`; a `source_enforcement` `trust_weight` multiplies in.

Verification:
```bash
curl -X POST /api/nexus/fusion \
  -d '{"role":"extractor","prompt":"...","models":["deepseek-v3","llama-3.3-70b"],"arbitrator":"claude"}'
# → { value, arbitratedBy:"claude", agreedBy:[...], rationale }
```

---

## 3. Where each engine taps fusion/shifting
- **Masaar** Agent 1b (CR parse) + Agent 3 (research) → fusion on conflicting fields.
- **Company/Person Intel** → synthesis tier + verdict; escalate on disagreement.
- **Signals** → extraction tier (cheap) for bulk classification; never escalates.
- **Lead Factory** Agent 6 scoring → synthesis; Agent 3 enrichment → extraction.
