# NexFlow Pricing & Packaging

> **Document scope:** Definitive pricing reference for the NexFlow platform — seat tiers, packaging variants, usage credits, and frequently asked commercial questions. All numbers are in USD per user per month, billed monthly unless stated otherwise. SAR pricing tracks at 3.75 SAR / USD with optional locked-in annual SAR rates.

---

## How NexFlow is sold

NexFlow is sold three ways, and customers can mix them:

1. **Full Platform** — the standard CRM Suite (CRM Core, AI Forecast, Conversation Capture, Workflows, Analytics) priced per seat across seven tiers. This is how 80% of customers buy.
2. **Packaging variants** — six packaging variants in total: the **Full Platform** (variant 1, priced via the seat tiers below) plus five subset variants for customers who only need part of the surface area — **CRM-Only**, **Marketing-Only**, **Cloud-Calls-Only**, **Data-Enrichment-Only**, and **Tailored / Custom Solutions** (scoped + quoted on a per-engagement basis).
3. **Usage credits** — Cloud Calls minutes, Data Enrichment lookups, AI tokens, and SMS / WhatsApp message credits, sold as monthly buckets and burst overages. Every plan includes an opening credit allowance.

All tiers include: in-Kingdom data residency, bilingual UI (Arabic/English), Hijri+Gregorian calendar, role-based access control, audit log, REST + Webhooks, and the public mobile app.

---

## Seat tiers — Full Platform

The seven tiers below are the canonical price list. Annual billing saves 17% (two months free). Volume pricing kicks in at 25, 100, and 500 seats.

| Tier | Audience | List price (per user / mo) | Included AI credits | Included call mins | Enrichment lookups | Storage | Support |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | :--- |
| **Free** | Solo / starter | **$0** | 200 / mo | 30 / mo | 25 / mo | 1 GB | Community |
| **Starter** | 1–5 users, SMB | **$19** | 1,500 / mo | 200 / mo | 250 / mo | 10 GB | Email |
| **Professional** | 5–25 users, growth SMB | **$79** | 8,000 / mo | 800 / mo | 1,500 / mo | 50 GB | Email + chat |
| **Business** | 25–100 users, mid-market | **$129** | 25,000 / mo | 2,500 / mo | 5,000 / mo | 250 GB | 8×5, 4h SLA |
| **Enterprise T1** | 100–250 users | **$199** | 75,000 / mo | 8,000 / mo | 15,000 / mo | 1 TB | 24×5, 2h SLA, CSM |
| **Enterprise T2** | 250–1,000 users | **$249** | 200,000 / mo | 25,000 / mo | 50,000 / mo | 5 TB | 24×7, 1h SLA, CSM + TAM |
| **Enterprise T3** | 1,000+ users | **$299** | Unlimited (fair-use) | 75,000 / mo | 150,000 / mo | 25 TB | 24×7, 30-min SLA, dedicated TAM, sovereign deployment option |

### What's gated by tier

| Capability | Free | Starter | Professional | Business | Ent T1 | Ent T2 | Ent T3 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| CRM Core, deals, pipelines | Y | Y | Y | Y | Y | Y | Y |
| Bilingual records, true RTL | Y | Y | Y | Y | Y | Y | Y |
| AI Forecast (per-deal, written rationale) | — | Y | Y | Y | Y | Y | Y |
| Conversation Capture (calls, WhatsApp, email) | — | Y | Y | Y | Y | Y | Y |
| Marketing journeys (email, WhatsApp, SMS) | — | Limited | Y | Y | Y | Y | Y |
| Cloud Calls (built-in dialer + numbers) | — | — | Y | Y | Y | Y | Y |
| Data Enrichment (regional) | — | — | Y | Y | Y | Y | Y |
| Workflows & Automation | — | Limited | Y | Y | Y | Y | Y |
| Analytics & BI dashboards | Basic | Basic | Y | Y | Y | Y | Y |
| Custom objects | — | — | 5 | 25 | 100 | 250 | Unlimited |
| Sandboxes | — | — | 1 | 2 | 3 | 5 | 10 |
| SSO (SAML / OIDC) | — | — | — | Y | Y | Y | Y |
| SCIM provisioning | — | — | — | — | Y | Y | Y |
| Audit log retention | 30 d | 90 d | 1 y | 2 y | 5 y | 7 y | 10 y |
| In-Kingdom data residency | Y | Y | Y | Y | Y | Y | Y |
| Sovereign deployment (single-tenant) | — | — | — | — | — | Add-on | Y |
| Customer-managed keys (BYOK) | — | — | — | — | Y | Y | Y |

### Seat-tier minimums and ramps

- **Free** is permanent, capped at 3 users per workspace.
- **Starter** has no minimum.
- **Professional** has a 5-seat minimum.
- **Business** has a 25-seat minimum.
- **Enterprise T1** and above are quoted with annual commitments and ramp schedules. Multi-year deals carry an additional 8–12% discount.

---

## Packaging variants

NexFlow ships **six packaging variants**. Variant 1 (Full Platform) is the standard CRM Suite priced through the seven seat tiers above. Variants 2–5 are pre-bundled subsets for customers who only need part of the surface area, and Variant 6 covers tailored / custom solutions for buyers whose needs do not fit either model. All variants share the platform schema, so customers can move between variants — or upgrade to the Full Platform — later without data migration.

### 1. Full Platform (all-in-one)

**Includes:** CRM Core, AI Forecast, Conversation Capture, Workflows, Analytics, Marketing, Cloud Calls, Data Enrichment, and Mobile. **Excludes:** sovereign single-tenant deployment (Enterprise T1+), BYOK (add-on), and white-label OEM (Enterprise T3 only).

**Price:** the seven seat-tier prices above — Free $0 → Enterprise T3 $299 / user / mo.

**Who it's for:** mid-market and enterprise sales organizations in KSA, the wider GCC, and regional MENA that want one system of record instead of stitching CRM + a marketing platform + a dialer + an enrichment provider together. This is how roughly 80% of NexFlow customers buy.

**How it stacks against alternatives:** comparable to Salesforce Sales Cloud + Marketing Cloud + Sales Engagement (typically $250–$500 / user / mo combined when you add Pardot/Marketo and an outbound dialer like Outreach or Salesloft) or HubSpot Sales Hub + Marketing Hub + Service Hub Enterprise (typically $150–$330 / user / mo combined plus contact-tier overages). NexFlow lands at $129–$299 / user / mo with bilingual Arabic AI, in-Kingdom data residency, and embedded GCC payment + identity rails — none of which the global suites ship by default.

### 2. CRM-Only Bundle

**Includes:** CRM Core, AI Forecast, basic Workflows, basic Analytics, mobile. **Excludes:** Conversation Capture, Marketing, Cloud Calls, Data Enrichment.

| Tier | Price (per user / mo) | Notes |
| :--- | ---: | :--- |
| Starter | **$9** | Up to 5 users, basic CRM only |
| Professional | **$39** | Adds AI Forecast |
| Business | **$59** | Adds custom objects + sandboxes |
| Enterprise | **$99** | Adds SSO, SCIM, sovereign option |

**Who it's for:** teams that already own a marketing platform, a dialer, and an enrichment vendor and just need a modern Arabic-first CRM as the system of record — typically 10–250-seat sales orgs in KSA and the GCC migrating off spreadsheets, Zoho CRM, or legacy Microsoft Dynamics.

**How it stacks against alternatives:** Salesforce Sales Cloud Professional is $80 / user / mo, HubSpot Sales Hub Professional is $90 / user / mo, Pipedrive Professional is $49 / user / mo, Zoho CRM Enterprise is $40 / user / mo. NexFlow CRM-Only Professional ($39) is the only option in that band with native bilingual UI, in-Kingdom data residency, and Hijri / Gregorian dual-calendar workflows.

### 3. Marketing-Only Bundle

**Includes:** Email + WhatsApp + SMS journeys, audience builder, attribution, landing pages, plus a read-only contact mirror of any external CRM the customer already runs. **Excludes:** CRM write access, Cloud Calls, Sequences, AI Forecast.

| Tier | Price (per seat / mo) | Contacts included | Sends included |
| :--- | ---: | ---: | ---: |
| Starter | **$29** | 5,000 | 25,000 / mo |
| Growth | **$79** | 50,000 | 250,000 / mo |
| Scale | **$199** | 250,000 | 1,500,000 / mo |

Marketing-only buyers can attach a single seat at the CRM-Only tier for $9 to view sourced pipeline.

**Who it's for:** marketing teams inside companies that already have a CRM they intend to keep (Salesforce, Dynamics, Zoho) but need GCC-aware lifecycle marketing — WhatsApp Business as a first-class channel, Arabic copy + RTL templates, and PDPL-compliant consent capture.

**How it stacks against alternatives:** HubSpot Marketing Hub Professional is $890 / mo + $50 / 1,000 contacts. Mailchimp Standard at 50,000 contacts is roughly $385 / mo (email only — WhatsApp and SMS are extra). Klaviyo at 50,000 contacts is $720 / mo. NexFlow Marketing-Only Growth lands at $79 / seat / mo for 50,000 contacts and 250,000 sends with WhatsApp Business included by default and locally-routed SMS via STC, Mobily, and Zain.

### 4. Cloud-Calls-Only Bundle

**Includes:** Built-in dialer, regional numbers (KSA, UAE, Egypt, Jordan, Bahrain, Kuwait, Oman, Qatar), recording, transcription, and call analytics. **Excludes:** CRM, Marketing, Sequences, AI Forecast.

| Tier | Price (per user / mo) | Included minutes | Local numbers |
| :--- | ---: | ---: | ---: |
| Starter | **$15** | 300 | 1 |
| Professional | **$45** | 1,200 | 3 |
| Business | **$89** | 4,000 | 10 |

Per-minute overage: **$0.04 / minute** inbound, **$0.06 / minute** outbound (regional rates apply for cross-border).

**Who it's for:** inside-sales, telesales, and customer-support teams that already own a CRM and just want a regional dialer with local numbers, Arabic transcription, and CITC-compliant recording. Common in real-estate, automotive, banking, and field-service sales orgs across the GCC.

**How it stacks against alternatives:** Aircall starts at $40 / user / mo for 4,000 outbound minutes but charges separately for local GCC numbers and does not transcribe Arabic. RingCentral MVP Standard is $30 / user / mo without recording or transcription. JustCall is $29 / user / mo with English-only transcription. NexFlow Cloud-Calls Professional ($45) ships with bundled GCC numbers, native Arabic transcription, and CITC-aligned recording retention.

### 5. Data-Enrichment-Only Bundle

**Includes:** Regional company + person enrichment with full provenance — sources cited per attribute, refresh dates, and confidence scoring. **Excludes:** CRM write-back, sequencing, dialer, marketing.

Sold as monthly credit packs; one credit = one successful lookup (no charge for empty results).

| Pack | Price / mo | Credits | Effective price / lookup |
| :--- | ---: | ---: | ---: |
| Free | **$0** | 25 | — |
| Starter | **$19** | 500 | $0.038 |
| Professional | **$79** | 2,500 | $0.032 |
| Business | **$199** | 8,000 | $0.025 |
| Scale | **$499** | 25,000 | $0.020 |

Bulk lookups (>50,000 / mo) are quoted directly.

**Who it's for:** sales-development, RevOps, and account-research teams that want a regional enrichment source for KSA, GCC, and broader MENA companies — segments that ZoomInfo and Apollo cover poorly. Often bought alongside an existing global enrichment vendor as the GCC-specific tier.

**How it stacks against alternatives:** ZoomInfo entry pricing starts at roughly $15,000 / yr for ~12,000 credits ($1.25 / lookup) with thin Middle East coverage. Apollo's $79 / user / mo plan includes 1,200 credits ($0.066 / lookup) and similarly limited GCC depth. Lusha Pro is $36 / user / mo for ~480 credits ($0.075 / lookup). NexFlow Enrichment Professional is $79 / mo for 2,500 credits ($0.032 / lookup) and is the only one that resolves Saudi commercial registration numbers, UAE trade licenses, and Egyptian tax IDs as first-class identifiers with provenance.

### 6. Tailored / Custom Solutions

**Includes:** scoped at engagement-time. Common bases: Full Platform with custom modules, an industry vertical (real-estate, banking, automotive, government), a sovereign single-tenant deployment, or a white-label OEM. **Excludes:** anything explicitly out of scope in the signed Statement of Work.

#### How NexFlow scopes and quotes a tailored engagement

1. **Discovery (week 0–1, free).** A solutions architect runs a 2–3 hour workshop with the customer's revenue, IT, and compliance leads to map: business outcomes, in-scope teams and seat counts, integration surface (ERP, billing, BI, telephony, identity), data-residency requirements, and regulatory constraints (PDPL, CITC, SAMA, NCA ECC).
2. **Scoping document (week 1–2).** NexFlow returns a written scope with: target architecture, in-scope modules, custom-development items broken into priced line items, integration list with effort estimates, deployment topology (multi-tenant Riyadh, sovereign single-tenant Riyadh, sovereign UAE, hybrid), SLA tier, and a phased delivery timeline.
3. **Pricing model.** Tailored engagements are priced on three transparent line items so customers can compare to in-house build or system-integrator alternatives:
   - **Platform license** — a per-seat tier from Enterprise T1 ($199), T2 ($249), or T3 ($299) for 12-, 24-, or 36-month terms. Multi-year discounts of 8% / 15% apply.
   - **One-time delivery fee** — fixed-fee for implementation, data migration, custom modules, and integrations. Typical bands: $25k–$60k for a single-region rollout (10–50 seats), $60k–$150k for a multi-country rollout (50–250 seats), $150k–$500k for a sovereign deployment with custom modules (250+ seats). Payment is milestone-based (30% kickoff, 40% UAT, 30% go-live).
   - **Optional managed services** — administration, training, and adoption support priced at 12–18% of annual license value.
4. **Commercial terms.** All tailored engagements include a written acceptance plan, source-code escrow at Enterprise T3, a 30-day post-go-live warranty period, and the standard NexFlow data-portability guarantee (full export in CSV + JSON at any time).
5. **Quote validity.** Quotes are valid for 60 days. Pricing assumptions (seat count, integration list, residency model) are itemised so the customer sees exactly what changes the price if scope shifts.

**Who it's for:** government and semi-government buyers, regulated financial institutions, large family-conglomerate revenue organisations, and ISVs / agencies that want to white-label NexFlow under their own brand. Anyone whose deployment, compliance, integration, or commercial terms cannot be served by a self-serve plan.

**How it stacks against alternatives:** the realistic alternatives are (a) a Salesforce or Microsoft Dynamics implementation through a regional system integrator (typical first-year all-in: $300k–$1.5M for the same scope, with 6–12 month timelines and no native Arabic AI), or (b) an in-house build (typical first-year cost: $500k–$2M plus 9–18 months before the team has anything in production). NexFlow tailored engagements ship in 6–14 weeks, are priced 40–70% below the SI route at comparable scope, and avoid the in-house build risk entirely.

---

## Usage credits & overages (all plans)

| Resource | Unit | Standard rate | Notes |
| :--- | :--- | ---: | :--- |
| AI tokens | 1,000 tokens | **$0.012** | Pooled across CRM, Marketing, and CS |
| Cloud Calls (inbound) | minute | **$0.04** | Regional GCC; international quoted |
| Cloud Calls (outbound) | minute | **$0.06** | Regional GCC; international quoted |
| Local DID number | per number / mo | **$3.00** | KSA, UAE, EG, JO, BH, KW, OM, QA |
| SMS (KSA, UAE) | message | **$0.04** | Includes carrier fee |
| WhatsApp Business conversation | conversation | **$0.06** | Per Meta's session model |
| Data Enrichment lookup | credit | **$0.025–$0.038** | Tier-dependent |
| Storage (over plan) | GB / mo | **$0.20** | |
| Sandbox (over plan) | sandbox / mo | **$49** | |

Overages are billed at the end of each cycle. Customers can set hard caps to block overages entirely.

---

## Add-ons

| Add-on | Price | Notes |
| :--- | ---: | :--- |
| Sovereign deployment (single-tenant, in-Kingdom or in-region) | **From $4,500 / mo** | Required at Enterprise T1, included at Enterprise T3 |
| Premier support (15-min SLA, 24×7) | **+15% of license** | Available from Enterprise T1 |
| Implementation — Quickstart | **$4,900 one-time** | 2–3 weeks, up to 25 seats |
| Implementation — Standard | **$14,900 one-time** | 4–6 weeks, up to 100 seats |
| Implementation — Enterprise | **From $39,000** | Scoped engagement |
| Custom AI model fine-tuning | **From $7,500** | One-time per model |
| BYOK (customer-managed keys) | **$1,200 / mo** | Included at Enterprise T2+ |
| Compliance pack (SOC 2 Type II + ISO 27001 letters, audited reports) | **$3,000 / yr** | Included at Enterprise T2+ |

---

## Annual, multi-year, and partner pricing

- **Annual billing** — 17% discount (two months free) on all paid tiers.
- **Two-year commit** — additional 8% discount.
- **Three-year commit** — additional 12% discount.
- **Vision-2030-aligned program** — qualifying SMBs in Saudi Arabia receive Free → Starter → Professional credits during onboarding (limited annual cap).
- **Reseller / SI partners** — tiered margin (10% / 18% / 25%) based on certified consultants and pipeline contribution.

---

## FAQ

### How does NexFlow pricing compare with Salesforce, HubSpot, Zoho, and Pipedrive?

For the equivalent functional surface area, NexFlow is typically **30–55% lower** than Salesforce, **20–35% lower** than HubSpot Professional bundles, in line with **Zoho One** on price but with a meaningfully more capable AI and forecasting layer, and **10–20% above Pipedrive base** but bundled with marketing, calls, and enrichment that Pipedrive sells only as add-ons.

### What's actually free in the Free tier?

Permanent free for up to 3 users. CRM Core, basic pipelines, bilingual UI, mobile app, 200 AI credits, 30 call minutes, and 25 enrichment lookups per month. No credit card required. Designed for solo founders and very small teams to use NexFlow as their primary CRM, not as a trial.

### How are AI credits consumed?

AI credits cover model inference for Forecast, Conversation Capture summaries, suggested next-best-actions, AI-drafted emails and WhatsApp replies, and bilingual translation. Heavy actions (long call transcription, full-account briefs) cost more credits; lightweight actions (suggested replies) cost very few. The product surfaces estimated cost before each action.

### What happens when I run out of credits?

By default, the workspace continues at standard overage rates. Admins can set a **hard cap** that pauses credit-consuming AI features at the limit, or a **soft cap** that emails a warning at a configurable threshold. Calls and SMS / WhatsApp messages always honor hard caps to prevent surprise telephony charges.

### Is data residency really in-Kingdom?

Yes — by default, all customer data for KSA-headquartered tenants is stored and processed in Saudi Arabia. UAE-headquartered tenants get UAE residency. Other GCC and regional tenants can elect KSA, UAE, or EU residency. Sovereign single-tenant deployments are available from Enterprise T1.

### Can I pay in SAR?

Yes. Annual contracts can lock the SAR rate at signing. Monthly contracts use the prevailing SAR / USD rate at billing.

### What GCC payment methods do you accept (Mada, STC Pay, PayTabs)?

NexFlow bills natively in SAR through Saudi-licensed payment infrastructure so customers do not have to put corporate purchases on a USD international card. The supported rails are:

- **Mada** — the Saudi national debit network. Supported for both monthly and annual SAR-billed plans on every tier from Free → Enterprise. Mada is the default card option for KSA-headquartered tenants and is processed through a Saudi acquirer with full PDPL-aligned tokenisation; PAN data never leaves the Kingdom.
- **STC Pay** — supported for SMB tiers (Free, Starter, Professional, Business) on monthly billing. Suitable for self-serve sign-ups, owner-operator and small-team accounts, and any customer who does not have a corporate card. Enterprise tiers are quoted on annual SAR contracts and use bank transfer or Mada by default; STC Pay can be enabled on request.
- **PayTabs** — used as the gateway for international cards (Visa, Mastercard, Amex), Apple Pay, and recurring SAR card billing across the GCC. PayTabs is the default rail for AED, QAR, BHD, KWD, and OMR card payments in Phase 2 markets, and is what we use to support multi-country procurement teams.

Beyond cards, NexFlow accepts **SAR / AED bank transfer** for annual contracts (standard for Enterprise T1+), **purchase-order billing** with NET-30 / NET-60 terms (Enterprise tiers, subject to credit check), and **SADAD** invoicing for KSA government and semi-government customers on request. Monthly plans renew automatically on the saved rail; annual plans send an invoice 30 days before renewal and accept payment by any supported rail. Failed-charge retries follow a Mada-then-card-then-bank-transfer cascade with a 14-day grace period before suspension; data is preserved (read-only) for a further 60 days during which any rail above can reinstate the account without re-implementation.

### Can I switch from a packaging variant to the Full Platform later?

Yes. There is no data migration — variants share the platform schema. Switching is a billing change; no re-implementation is required.

### What about WhatsApp Business and Meta fees?

NexFlow's per-conversation pricing includes Meta's WhatsApp Business platform fees. Customers do not need a separate Meta billing account.

### How are seats counted?

A seat = one named active user with login access. Read-only viewers (e.g. executives consuming dashboards only) on Business and above tiers are billed at **20% of the seat price**. Service / API users are not seats.

### Is there a setup fee?

Not for Free, Starter, or Professional. Business tier includes a guided onboarding at no charge. Enterprise tiers are scoped with a Quickstart, Standard, or Enterprise implementation as listed above.

### What's the cancellation policy?

Monthly plans cancel anytime (effective end of cycle). Annual and multi-year plans are non-refundable for the committed term but can be downgraded at renewal. We do not lock customer data — full data export (CSV + JSON) is available from every tier.

### Do you have nonprofit, government, or education pricing?

Yes. Qualifying nonprofits and accredited educational institutions in the GCC receive a 50% discount on Professional and Business tiers. Government entities are quoted directly with sovereign deployment defaults.

---

*All prices effective from January 2026. NexFlow may revise list prices with 30 days' notice; existing committed contracts are honored at the rates in effect at signing.*
