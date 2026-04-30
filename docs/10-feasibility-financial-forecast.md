# NexFlow — Feasibility & 3-Year Financial Forecast

> Bottom-up GCC-first plan. Conservative case unless noted. All amounts USD.

---

## 1. Market sizing

| Region | SAM (CRM SaaS, 2026e) | NexFlow share target by Y3 |
|--------|----------------------:|---------------------------:|
| KSA | $620M | 1.5% → ~$9.3M ARR potential |
| UAE | $410M | 2.0% → ~$8.2M ARR |
| Qatar + Kuwait + Bahrain + Oman | $290M | 1.0% → ~$2.9M |
| Egypt + Jordan | $230M | 0.5% → ~$1.2M |
| **Total addressable (Year 3)** | **$1.55B** | **~$21.6M** |

The bigger TAM unlocks in Phase 2/3 as we expand Service Cloud + Field Ops + verticals (Banking, Real Estate, Government, Health).

## 2. ICP & pricing assumptions

- ICP: 25-2,000 employee revenue teams in BFSI, Telco, Real Estate, VC, Family Office, Government, Healthcare.
- Average ARPA (per account / yr): Y1 **$14k** → Y2 **$22k** → Y3 **$34k** as we add Service + Field-Ops + AI overage.
- Net revenue retention: Y1 110% → Y2 118% → Y3 125%.
- Gross margin: Y1 68% → Y2 74% → Y3 78% (improves as AI fair-use absorbs fewer overages and infra unit cost falls).

## 3. Three-year P&L (Conservative)

All figures in USD '000.

| | **Year 1 (FY26)** | **Year 2 (FY27)** | **Year 3 (FY28)** |
|---|---:|---:|---:|
| **New logos / yr** | 28 | 90 | 220 |
| **Active paying accounts** | 28 | 110 | 305 |
| **Avg ARPA ($)** | 14,000 | 22,000 | 34,000 |
| **ARR (end of year)** | 392 | 2,420 | 10,370 |
| **Revenue (recognised)** | 220 | 1,400 | 6,200 |
| **COGS (hosting + AI + 3rd-party APIs + CSM cost-of-serve)** | 70 | 365 | 1,365 |
| **Gross profit** | 150 | 1,035 | 4,835 |
| **Gross margin %** | 68% | 74% | 78% |
| **R&D (engineering + AI)** | 720 | 1,650 | 3,200 |
| **S&M (GTM + marketing)** | 380 | 1,150 | 2,950 |
| **G&A (ops + finance + legal)** | 180 | 420 | 850 |
| **Operating loss / (profit)** | (1,130) | (2,185) | (2,165) |
| **Cash burn (cash basis)** | (1,250) | (2,400) | (2,300) |
| **Cumulative burn** | (1,250) | (3,650) | (5,950) |

### Notes

- **Year 1**: design-partner heavy; ARR << recognised revenue because contracts ramp mid-year.
- **Year 2**: launch Service Cloud beta + Egypt/Jordan; magic number ~0.7.
- **Year 3**: vertical clouds and field-ops drive ARPA; magic number ~1.0.
- Operating loss compresses despite rapid growth — typical efficient SaaS S-curve.

## 4. Optimistic case (10% upside on win-rate, 25% larger ARPA)

| | **Y1** | **Y2** | **Y3** |
|---|---:|---:|---:|
| ARR | 540 | 3,800 | 17,200 |
| Revenue | 305 | 2,200 | 10,300 |
| Operating loss | (1,000) | (1,650) | (1,200) |

## 5. Pessimistic case (sales cycles +6 mo, retention 95%)

| | **Y1** | **Y2** | **Y3** |
|---|---:|---:|---:|
| ARR | 220 | 1,420 | 5,800 |
| Revenue | 130 | 820 | 3,500 |
| Operating loss | (1,180) | (2,500) | (3,100) |

## 6. Funding plan

| Round | When | Amount | Use of funds |
|-------|------|-------:|--------------|
| **Pre-seed (closed)** | Q1 2026 | $0.6M | MVP, design partners, IP |
| **Seed** | Q4 2026 | $4.0M | Product velocity, KSA + UAE GTM, SOC2 |
| **Series A** | Q4 2027 | $14.0M | Service Cloud, Field-Ops, Egypt/Jordan launch, Vertical Cloud (Banking) |

Total three-year burn ~$5.95M (conservative). Seed + Series A leave 18 months runway after Series A close.

## 7. Unit economics (Year 2 mid-cohort)

| Metric | Value |
|--------|------:|
| Avg ARPA | $22,000 |
| Gross margin | 74% |
| **Gross-profit per account** | $16,280 |
| CAC (blended) | $11,500 |
| **Payback (months)** | **8.5** |
| LTV (5-yr at 118% NRR, 78% GM in steady state) | ~$110,000 |
| **LTV : CAC** | **9.6x** |

## 8. Operational feasibility

| Risk | Mitigation |
|------|-----------|
| **AI provider cost spike** | Multi-provider abstraction (`lib/ai.ts`), per-tier routing, customer overage pricing, sovereign LLM option in Phase 3 |
| **Talent (AR-fluent eng + GTM)** | Hire from KSA/UAE + remote MENA pool; partner with King Abdulaziz / KFUPM / AUS for grad pipeline |
| **Long enterprise cycles (BFSI/gov)** | Design-partner pricing + co-build approach; deploy in 30 days, expand quarterly |
| **Channel API changes (Meta, X, LinkedIn)** | Provider abstraction; alternate channels (SMS + email) always operational |
| **Data residency** | Replit multi-region today; sovereign-cloud option in Phase 3 (G42 / SCAI) |
| **Compliance (SAMA, NCA, CBUAE, NDMO)** | SOC2 + ISO 27001 in Y2; sector-specific accreditations in Y3 |
| **Currency volatility** | USD-denominated contracts where possible; FX hedging on AED/SAR receivables > $250k |

## 9. KPIs we'll publish to investors

- New ARR added / qtr · Net new logos · Logo retention · NRR · Gross margin · CAC payback · Magic number · Rule of 40
- AI consumption per account (tokens, voice min, images) and overage % of ARR
- Mobile DAU / web WAU
- Time-to-first-value (target < 7 days)

## 10. Why this is feasible

1. **Cheap to build** — pnpm monorepo + Replit + LLM APIs lets a small team ship like a 50-person team did in 2022.
2. **Right time** — GCC governments (Vision 2030, We the UAE 2031) actively underwrite digital transformation budgets.
3. **Right wedge** — Arabic + AI agents + Khaleeji culture is a *defensible* niche the US incumbents can't ship in under three years.
4. **Healthy unit economics** even in the conservative case (LTV:CAC > 9x by Y2).
5. **Modular product** — every Phase 2/3 module ships against the same data backbone; expansion is product-led, not platform-replatforming.
