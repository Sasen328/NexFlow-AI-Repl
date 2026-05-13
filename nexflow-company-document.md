# NexFlow — Comprehensive Company & Product Document
**Universal AI-native B2B CRM for GCC Markets**
Version 2.0 · May 2026 · Confidential

---

## Table of Contents

1. [Company & Mission](#1-company--mission)
2. [The Problem](#2-the-problem)
3. [Pain Points → NexFlow Answers](#3-pain-points--nexflow-answers)
4. [GCC-Exclusive Layer](#4-gcc-exclusive-layer)
5. [Engine 01 — CRM](#5-engine-01--crm)
6. [Engine 02 — Call Center](#6-engine-02--call-center)
7. [Engine 03 — Enrichment](#7-engine-03--enrichment)
8. [Engine 04 — Marketing](#8-engine-04--marketing)
9. [Home & Command Center](#9-home--command-center)
10. [Market Analysis](#10-market-analysis)
11. [Competitive Analysis](#11-competitive-analysis)
12. [Feasibility Analysis](#12-feasibility-analysis)
13. [3-Year Financial Projections](#13-3-year-financial-projections)
14. [Pricing Model](#14-pricing-model)
15. [GCC Expansion Plan](#15-gcc-expansion-plan)
16. [Tech Stack](#16-tech-stack)
17. [Components & Architecture](#17-components--architecture)
18. [Deployment](#18-deployment)
19. [Local Dev Setup](#19-local-dev-setup)
20. [Role Journeys](#20-role-journeys)

---

## 1. Company & Mission

**NexFlow** is the first AI-native B2B CRM built specifically for GCC markets. While global CRMs translate their UI, NexFlow translates the work — the data model, the outreach rhythm, the compliance requirements, and the cultural context that Gulf revenue teams operate in every day.

### Mission
Equip every GCC revenue team with the AI infrastructure to find, qualify, close, and retain customers — in Arabic and English, on WhatsApp and phone, across Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, and Oman — without stitching together seven tools from three vendors.

### What We Build
Three engines, one schema, one price, one login:

- **CRM Engine** — Pipeline, ICP scoring, forecasting, CPQ, sequences
- **Call Center Engine** — Power Dialer, Arabic AI Voice Agents, post-call automation
- **Enrichment Engine** — 16-agent research, Saudi CR lookup, GCC buying signals
- **Marketing Engine** — AI campaign builder, 7 channels, Cultural Intelligence

### Headquarters
Riyadh · Khobar · Dubai

---

## 2. The Problem

Gulf revenue teams are running on tools that were never built for them. Every workaround costs hours. Every workaround compounds. The best teams in Saudi, UAE, and Kuwait are losing deals not because they can't sell — but because their stack fights them at every step.

### Pain 01 — No Arabic. Anywhere That Matters.
RTL is cosmetic. Arabic search breaks on diacritics. Gulf naming conventions (Al-, bin, ibn) are misclassified. Hijri dates don't exist. Bilingual records (Arabic name + English name on the same contact) are impossible. Salesforce, HubSpot, and Pipedrive were designed for English-first pipelines and have never genuinely solved Arabic data.

### Pain 02 — Manual Entry Kills Seller Time
After every call, every WhatsApp, every meeting — a rep spends 20+ minutes typing notes, manually sending a follow-up WhatsApp, setting a reminder, and updating the CRM. No AI capture. No auto-created follow-ups. No post-call WhatsApp automation. Just copy-paste across three apps.

### Pain 03 — GCC Data Sources Are Invisible
Saudi CR checks are done manually on the MOCI website and entered by hand. Wamda startup news, MoCI commercial registry filings, and Argaam financial signals don't exist in Salesforce or HubSpot. No buying-signal layer for the GCC exists in any global CRM — just generic Crunchbase data that misses 90% of the GCC market.

### Pain 04 — Three Vendors. Three Bills. Zero Integration.
CRM from Salesforce. Dialer from a separate vendor. Enrichment from a third. Data never syncs cleanly. Forecasts built on three broken data pipes that managers can't trust. The bill arrives in USD, with per-seat add-ons for features that should be standard.

---

## 3. Pain Points → NexFlow Answers

| Real Pain — Heard in Every GCC Sales Team | NexFlow — Ships Today, Not a Roadmap Promise |
|---|---|
| Arabic search breaks. Gulf names misclassified. No bilingual records. | Normalized Arabic search with diacritic + dialect tolerance. Bilingual record fields (AR/EN per contact). Gulf naming model (Al-, bin, ibn, double surnames) built into the data layer. |
| Post-call: rep spends 20 min typing notes, manually sends WhatsApp, sets reminder. | 1-click post-call panel: logs note + creates task + sets reminder + drafts WhatsApp + drafts email simultaneously. Post-call automation fires an AI-drafted Arabic/English WhatsApp within 5 min of no-answer — zero rep action. |
| Saudi CR lookup done manually. No GCC buying-signal monitoring. | Masaar engine: real-time Saudi Commercial Registry — CR number, legal name, directors, license type. GCC Buying Signals monitors Wamda, MoCI, Argaam, Reuters Arabic, PR Newswire — none of which appear in ZoomInfo or Clearbit. |
| No Arabic voice agents. English-only AI calling — useless for Gulf enterprise. | 6 AI voice personas: Layla (Gulf Arabic female), Faisal (KSA male), Noor (bilingual AR/EN), Reem (Levantine), Omar (Egyptian), Adam (English). Make and receive calls autonomously. No competitor has this in Arabic. |
| Stale leads sit silent. Reps don't know when to re-engage. | Forgotten Leads engine: surfaces contacts silent 90+ days only when a real buying signal fires (funding, MoCI filing, hiring spike, news). ICP score + signal score combined. Bulk enrich or hand directly to AI Voice Agent. |
| Outreach sent during Ramadan, on Fridays, during Eid — ignored or offensive. | Cultural Intelligence Engine: per-country event calendar with blackout dates, optimal outreach windows, messaging themes. Pre-Ramadan GOLD window, post-Iftar evening hours, Fri/Sat weekend awareness. AI Cultural Advisor answers any GCC outreach question. |
| Forecasts nobody trusts. No explainability. Reps game the numbers. | Per-deal AI win-rate with written rationale + leading indicators. Pipeline → Best Case → Commit → Closed Won waterfall. AI variance analysis explains why a number moved — not just that it did. |
| Data leaves the region. USD pricing. Per-seat add-ons for everything. | In-Kingdom data residency. SAR-anchored pricing. CRM + Call Center + Enrichment in one plan — no integration tax, no add-on stack. |

---

## 4. GCC-Exclusive Layer

**12 capabilities no single competitor can match. Not roadmap items. Native, shipped, running in production today.**

### 1. Saudi Commercial Registry (Masaar Engine)
Real-time CR number, legal name, establishment date, license type, and registered directors lookup. Mandatory step in KSA enterprise sales that no global CRM even knows exists. Salesforce doesn't know this data source exists.

### 2. Arabic AI Voice — 6 Dialects
- **Layla** — Gulf Arabic female
- **Faisal** — KSA Arabic male
- **Noor** — Bilingual AR/EN
- **Reem** — Levantine Arabic
- **Omar** — Egyptian Arabic
- **Adam** — English

Make and receive calls autonomously. Salesforce Einstein Agentforce is English-only and a paid add-on. HubSpot has zero voice agents. Zoho has zero voice agents.

### 3. 16-Agent Person Research
Perplexity ×9, Gemini ×5, Claude ×1, GPT-4o-mini ×1 running in parallel. Full intelligence dossier in 76–90 seconds. No CRM in the world ships this.

### 4. GCC Buying Signals
Monitors: Wamda (MENA startup news), MoCI (Saudi Ministry of Commerce filings), Argaam (Saudi financial news), Reuters Arabic, PR Newswire, LinkedIn, X, custom RSS. A completely different data universe from ZoomInfo, Clearbit, or Apollo.

### 5. Cultural Intelligence Engine
Per-country event calendar: Ramadan (with pre-Ramadan GOLD window + post-Iftar evening hours), Eid Al-Adha, Eid Al-Fitr, Saudi National Day, UAE National Day, Kuwait National Day. Per-event: blackout dates, optimal outreach window, messaging themes, % of contacts affected. AI Cultural Advisor answers any GCC outreach question. Friday/Saturday weekend awareness for outreach scheduling.

### 6. Post-Call WhatsApp in 5 Minutes
After no-answer, voicemail, or AI Agent handoff — AI drafts a context-aware Arabic/English WhatsApp message and fires it automatically within 5 minutes. Nobody does this. Not Salesforce. Not HubSpot. Not any GCC competitor.

### 7. KSA PDPL Call Redaction
Auto-redacts from transcripts: Saudi IBAN (SA04...), Iqama numbers, credit cards, SSN, phones, emails. PCI DSS + KSA PDPL compliant. No global CRM has these regex patterns.

### 8. GCC Payment Rails Baked In
Tap, HyperPay, Mada (1% fee — lowest in market), PayTabs, Stripe. Multi-currency: SAR, AED, QAR, KWD, BHD, OMR. Quote-to-cash closes deals in region.

### 9. Forgotten Leads + Signal Trigger
Resurfaces 90-day-silent contacts only when a real GCC buying signal fires — not just a timer. ICP score + signal score combined. No equivalent exists in any CRM.

### 10. CEO Situation Room
Multi-office dashboard (Dubai / Riyadh / Doha / Kuwait / Manama / Muscat). Revenue vs target per office, strategic initiatives tracker, news signals affecting accounts, funnel leakage, untaken action ledger.

### 11. Business Card → Enriched Lead in 30 Seconds
5-agent pipeline: Gemini Vision OCR → Claude validation → Perplexity live search → website scraper → GPT-4o-mini ICP scoring. Card photo → fully enriched, scored lead in ~30 seconds. Built for Saudi majlis meetings and GITEX booths.

### 12. AI Playbooks Per Persona × Country
Generated playbooks for CIO in Saudi Government vs CFO in UAE Banking vs CMO in Qatar Retail. Not generic templates — role × industry × country × deal size matrix.

---

## 5. Engine 01 — CRM

### Pipeline + Deal Kanban
Stage-based pipeline, deal probability, drag-drop cards. Per-rep views and manager aggregate views.

### ICP Rules Engine
Admin builds custom hard/soft scoring rules across any field — country, industry, title, company size, score — with any operator. Infinite flexibility, not preset dropdowns.

### Lead Scoring — 6 Dimensions
| Dimension | Weight |
|---|---|
| Title authority | 25% |
| Company fit | 20% |
| Engagement | 20% |
| Signal score | 15% |
| Deal velocity | 10% |
| Response rate | 10% |

**Output levels:** Buying Now / High Intent / Evaluating / Researching / Cold

### Health Scores
Real-time per-contact health computed from: engagement activity, activity count in last 30 days, deal stage progression, meetings held.
**Levels:** Healthy / Stable / At Risk / Critical

### Forecasting Waterfall
Pipeline → Best Case → Commit → Closed Won per rep. Weighted forecast with AI variance analysis that explains why a number moved — not just that it did.

### Predictive Analytics
- Deal close probability per deal
- Churn risk per contact
- Next Best Action surface
- AI query box for ad-hoc analysis

### Forgotten Leads
Surfaces contacts silent 90+ days where a fresh GCC buying signal just fired (funding, MoCI filing, hiring spike, news). Actions: bulk enrich / add to sequence / hand to AI Voice Agent.

### Lead Routing
Rules-based auto-assignment by: country, industry, company size, score, title — no manual triage required.

### Document Tracking
Embed pixel in quotes/proposals. See exact open + click events per contact. Know when they re-read the proposal at 11pm.

### Quote-to-Cash / CPQ
Generate quote → customer pays online → deal auto-closes.
**GCC payment rails:** Tap, HyperPay, Mada (Saudi), PayTabs, Stripe.
**Multi-currency:** SAR, AED, QAR, KWD, BHD, OMR.

### Contact Network Tab
Mutual connections, relationship type (co-investors, conference speaker, portfolio), tech stack detected, full work history per contact.

### Sequences
Multi-step automated cadences:
Email → LinkedIn → AI Voice Call → WhatsApp → Breakup email

AI Voice Agent step is native, not an integration with a third-party dialer.

---

## 6. Engine 02 — Call Center

### Power Dialer — 3 Modes
| Mode | How it works |
|---|---|
| Manual | Rep controls each call, full pre-call brief shown |
| Auto-Dial | Advances queue automatically, logs voicemail/no-answer outcomes |
| AI Agent | Fully autonomous calling — no rep required |

### Pre-Call AI Brief
Score-based talking points generated per contact before each call. Adapts to high-intent vs cold vs warm approach — not a generic script.

### Live Streaming Transcript
Real-time line-by-line transcript during the call. Bilingual Arabic/English. Fully searchable after the call ends.

### LiveCoachPanel
- Detects objections in real-time: budget, incumbent, timing
- Pushes coaching suggestions mid-call to rep
- Flags buying signals as they're spoken

### Post-Call 1-Click Panel
Logs note + creates follow-up task + sets reminder + drafts WhatsApp + drafts email — all simultaneously in one click after the call ends. Zero manual data entry.

### Post-Call Automation (Cadence Rules)
| Trigger | Automated action |
|---|---|
| Call · No answer | AI-drafted WhatsApp in 5 min |
| Call · Voicemail | Email draft sent |
| AI Agent handoff | WhatsApp booking link |

Approval queue with edit/reject. Arabic RTL drafts included.

### AI Voice Agents — 6 Voices
| Persona | Dialect |
|---|---|
| Layla | Gulf Arabic female |
| Faisal | KSA Arabic male |
| Noor | Bilingual AR/EN |
| Reem | Levantine Arabic |
| Omar | Egyptian Arabic |
| Adam | English |

Make and receive calls autonomously. Handle objections, qualify leads, book meetings.

### AI Agent Builder
Describe role → AI improves the prompt → deploy → run on demand → review run history. Build custom agents for any use case without engineering involvement.

### Conversation Intelligence
Per-call analysis:
- Sentiment score
- Talk/listen ratio
- Topic extraction
- Objection tracking
- Next steps extracted
- Bilingual Arabic/English analysis

### Call Recording Redaction
Auto-redacts from transcripts: credit cards, Saudi IBAN (SA04...), Iqama numbers, SSN, phones, emails. **PCI DSS + KSA PDPL compliant.**

### WhatsApp Business
Native shared inbox, bilingual AI bot (switches Arabic ↔ English mid-conversation), broadcast templates, Arabic quick-reply buttons.

### Knowledge Base
- Scripts library
- Objection Handlers
- AI Playbooks (generated per persona × industry × country × deal size)
- Company Insights tab
- Call Dashboard: team analytics, per-rep scoring, call outcomes

---

## 7. Engine 03 — Enrichment

### 4 Intelligence Engines

#### Masaar — Saudi Commercial Registry
- **Time:** ~5 seconds
- **What it returns:** CR number, legal name, establishment date, license type, registered directors
- **Why it matters:** Mandatory step in KSA enterprise sales. No global CRM offers this. Companies must verify CR before signing contracts with government or semi-government entities.

#### Person Intel (ProsEngine)
- **Time:** 76–90 seconds
- **Agents:** 16 parallel (Perplexity ×9, Gemini ×5, Claude ×1, GPT-4o-mini ×1)
- **Output:** Full intelligence dossier — professional history, social presence, network connections, buying signals, tech stack, news mentions
- **Synthesis:** Gemini → Claude → GPT waterfall fallback

#### Company Intel
- **Time:** ~45 seconds
- **Output:** Funding history, team size, tech stack, buying signals, news, CR data, financials, competitive positioning

#### Lead Finder
- **Time:** ~30 seconds
- **Agents:** 10 parallel + Cheerio/Playwright web crawls
- **Output:** Net-new leads from a target persona + market brief. Aggressive synthesis with 0-leads retry pass.

### Enrichment Tools

| Tool | What it does |
|---|---|
| Prospecting | Search by company OR person. 15 signal types: Contact, Profile, Company, Buying Signals, Social. Per-row Enrich + bulk Enrich-All |
| GCC Buying Signals | Monitors Wamda, MoCI filings, Argaam, Reuters Arabic, PR Newswire, LinkedIn, X, custom RSS |
| Quick Lead Enrich | Single-contact enrichment on demand |
| Business Card Scanner | 5-agent pipeline: Gemini Vision OCR → Claude validation → Perplexity search → website scraper → GPT-4o-mini ICP scoring. Photo → enriched lead in ~30s |
| Bulk Enrichment | Upload list → auto-dedup → 5-question config wizard → queue for enrichment |
| Deduplication | Fuzzy match on name, company, phone, email. Runs at upload stage |
| Search History | Full history of every Prospecting, Company, Person, List, and Card scan search. Re-run or delete |

---

## 8. Engine 04 — Marketing

### Marketing Dashboard
- AI 3-up analysis: Winning / Pain / How-to-Win
- KPI tiles: pipeline influenced, MQLs, campaign conversions, CAC
- Hot Lead Alerts strip with Call/Email/WhatsApp CTAs
- Cultural Intelligence alert banner (upcoming Ramadan/Eid/holiday)

### AI Campaign Builder — 6-Step Wizard
1. Define campaign objective and target audience
2. AI generates key messages
3. AI generates 7 per-channel variants:
   - LinkedIn (professional, long-form)
   - X/Twitter (concise, hook-driven)
   - Instagram (visual-first, lifestyle)
   - Facebook (community, engagement)
   - WhatsApp (conversational, personal)
   - Email (structured, CTA-driven)
   - SMS (ultra-short, action-focused)
4. Cultural Intelligence toggle injects: Khaleeji aesthetic, Arabic-first copy, Sun–Wed optimal timing
5. AI-generated campaign visual
6. Per-output Refresh re-runs AI for any individual channel

### Campaign Performance
- 7 KPI grid per campaign
- ROI strip
- Hot-lead URGENT banner with "Alert rep" CTA
- AI improvement suggestions with Re-analyse button
- Campaign dropdown selector for multi-campaign view

### Sequences & Audiences
Multi-touch cadences: Email → LinkedIn → AI Voice Call → WhatsApp steps. Audience segmentation with ICP-based filtering.

### Web Forms + AI Form Creator
AI drafts form fields from a brief. Predictive Analysis card shows: health grade, predicted open/conversion rate, pricing and channel suggestions.

### Attribution
Revenue attribution across 7 channels. Deal-level attribution trace showing which campaign touched which contact at which step.

### Campaign Publishing
7-channel publishing with datetime scheduling. Publish flow with results synthesis for end-to-end demo capability.

---

## 9. Home & Command Center

### Persona-Aware Daily Briefing
The AI briefing fully changes based on the signed-in role:

| Persona | What they see |
|---|---|
| Sales rep (Khalid) | Call queue, hot leads, next actions, missed follow-ups |
| Sales manager (Layla) | Team performance, coaching gaps, pipeline health |
| CEO (Faisal) | Multi-office P&L, strategic initiatives, macro signals |
| Marketing (Reem) | Campaign performance, MQL flow, channel attribution |
| Admin (Sara) | CRM health, data quality, automation status |

### CEO Situation Room
Multi-office dashboard:
- Revenue vs target per office (Dubai / Riyadh / Doha / Kuwait / Manama / Muscat)
- Strategic initiatives tracker with status
- News signals affecting key accounts
- Funnel leakage by stage
- Untaken action ledger (overdue tasks with owner)

### Command Center
**Live Scorecards:** Every recently-contacted lead shown with: score, last touch date, open deal value, and inline action buttons (Call, WhatsApp, Email, Follow-up, AI Voice Call).

**Quick Actions:** Search by name or phone → push any command directly:
- Log Call Note
- Send WhatsApp
- Send Email
- Schedule Follow-up
- AI Voice Call
- Coaching Session
- Generate List
- Scoring & Gaps Report

### AI Assistant
Floating bubble, draggable, snaps to nearest edge on release. Persists position across sessions. Available on every page. Answers questions about contacts, deals, pipeline, and next actions.

---

## 10. Market Analysis

### Market Size

| Metric | Value | Notes |
|---|---|---|
| Global CRM market (2024) | $98B | Growing at 13.8% CAGR through 2030 |
| GCC CRM addressable market | $3.4B | KSA + UAE + Qatar + Kuwait + Bahrain + Oman |
| GCC B2B companies in ICP | 180K+ | 10–500 employee companies with sales teams |
| CRM adoption in GCC (SMB) | <18% | vs 67% in North America — massive whitespace |
| CRM users — KSA alone | 2.1M | Licensed seats across all vendors (2024 est.) |
| AI CRM premium willingness | 3.4× | GCC buyers pay more for AI-native vs retrofitted |

### Structural Market Drivers

**1. Vision 2030 / D33 Mandates**
KSA and UAE national digitisation mandates are forcing enterprise sales teams off spreadsheets. Government procurement now favours local-data-residency vendors. NexFlow's KSA-hosted architecture is a prerequisite for government and semi-government contracts.

**2. Arabic-First Regulation**
New Saudi data and communications regulations require Arabic UI parity. Global CRMs are scrambling to retrofit Arabic support — NexFlow ships Arabic-native from the data model up.

**3. WhatsApp as Primary B2B Channel**
90%+ of GCC B2B outreach happens on WhatsApp. No global CRM has a native WhatsApp engine with bilingual AI bot + broadcast + shared inbox. NexFlow's WhatsApp Business integration is native, not a Zapier connection.

**4. Salesforce / HubSpot Price Fatigue**
A 50-seat GCC team pays USD $85K–$180K/year with add-ons. Dollar-denominated pricing, US tax treatment, data leaving the region. NexFlow is SAR-priced, region-hosted, all-in-one.

---

## 11. Competitive Analysis

### Feature Comparison Matrix

| Capability | NexFlow | Salesforce | HubSpot | Zoho | Pipedrive |
|---|---|---|---|---|---|
| Arabic-native data model | ✅ Built-in | ❌ Cosmetic RTL | ❌ None | ⚠️ Partial | ❌ None |
| Gulf naming conventions | ✅ Full support | ❌ Misclassified | ❌ Misclassified | ❌ None | ❌ None |
| Arabic AI Voice Agents | ✅ 6 dialects | ❌ English only (paid add-on) | ❌ None | ❌ None | ❌ None |
| Saudi CR lookup | ✅ Real-time | ❌ Unknown | ❌ Unknown | ❌ Unknown | ❌ Unknown |
| GCC buying signals | ✅ Wamda, MoCI, Argaam | ❌ None | ❌ None | ❌ None | ❌ None |
| Post-call WhatsApp automation | ✅ 5-min auto-fire | ❌ None | ❌ None | ❌ None | ❌ None |
| Cultural Intelligence Engine | ✅ Full calendar | ❌ None | ❌ None | ❌ None | ❌ None |
| 16-agent person research | ✅ 76–90s dossier | ❌ None | ❌ None | ❌ None | ❌ None |
| Business card → lead in 30s | ✅ 5-agent pipeline | ⚠️ Basic OCR | ⚠️ Basic OCR | ⚠️ Basic OCR | ❌ None |
| KSA PDPL call redaction | ✅ Iqama + IBAN | ❌ None | ❌ None | ❌ None | ❌ None |
| GCC payment rails (Mada/Tap) | ✅ Native CPQ | ❌ None | ❌ None | ❌ None | ❌ None |
| SAR pricing | ✅ All tiers | ❌ USD only | ❌ USD only | ⚠️ USD-based | ❌ USD only |
| In-Kingdom data residency | ✅ Designed-in | ⚠️ Add-on cost | ❌ None | ⚠️ Partial | ❌ None |
| CRM + Dialer + Enrichment native | ✅ One plan | ❌ 3 products | ❌ 3 products | ⚠️ Separate | ❌ Separate |

### What No Single Competitor Can Match
1. Three engines, one schema — CRM + Call Center + Enrichment in one platform, one price, one login
2. Arabic AI Voice Agents — autonomous calling in Gulf Arabic, Levantine, Egyptian dialects
3. 16-parallel-agent person research — full intelligence dossier in 90 seconds
4. Saudi Commercial Registry lookup — built in, global CRMs don't know this source exists
5. GCC Cultural Calendar with AI advisor — Ramadan blackouts, Eid windows, Fri/Sat weekend
6. Post-call WhatsApp automation — context-aware Arabic/English message within 5 minutes of no-answer
7. Business card → enriched lead in 30 seconds — built for GITEX booths and Saudi majlis meetings
8. GCC buying signals (Wamda, MoCI, Argaam) — different data universe from Western providers
9. Forgotten Leads + buying signal trigger — resurfaces stale leads only when a real signal fires
10. Persona-aware CEO Situation Room — GCC multi-office executive dashboard
11. KSA PDPL-compliant call redaction — Iqama numbers and Saudi IBANs
12. AI Playbooks per persona × industry × country — generated for specific buyer archetypes

---

## 12. Feasibility Analysis

### Technical Feasibility — 9/10
- Full-stack monorepo in production: React, Node, PostgreSQL, 4 AI providers
- 16-agent parallel research pipeline live and tested
- 4 AI intelligence engines (Masaar, Person Intel, Company Intel, Lead Finder) running
- 5-agent business card scanner in production
- Call redaction, post-call automation, WhatsApp bot — all shipped
- Arabic AI Voice Agents in 6 dialects — deployed

### Market Feasibility — 8/10
- $3.4B GCC CRM market, <18% SMB penetration — massive whitespace
- Vision 2030 and D33 mandates accelerating enterprise digitisation
- Salesforce/HubSpot price fatigue in GCC is well-documented
- WhatsApp B2B channel dominant — no global CRM serves it natively
- Arabic-first regulation creating compliance urgency for local vendors

### Operational Feasibility — 8/10
- Product built, not wireframed — deck demonstrates live product features
- 5 demo personas showing real role-specific AI briefings
- Persona-aware Command Center, CEO Situation Room, per-role daily briefing
- Saudi PDPL compliance (call redaction, IBAN/Iqama redaction) built in
- In-Kingdom data residency architecture designed from day one

### Risk Analysis — 7/10

| Risk | Mitigation |
|---|---|
| AI provider dependency | 4-provider waterfall (OpenAI/Anthropic/Gemini/Perplexity). No single point of failure |
| Competition from Salesforce | Resources but not GCC-native data. Saudi CR, Arabic voice, cultural calendar are structural moats |
| Regulatory (KSA PDPL) | NexFlow's PDPL posture is a moat, not a risk — built in from day one |
| Enterprise sales cycle (60–120 days) | Managed via AI-powered sequence engine and persona-aware nurturing |
| FX risk (AI API costs in USD) | SAR-priced, SAR-settled. Dollar exposure only on AI API costs — manageable margin lever |

---

## 13. 3-Year Financial Projections

### Year 1 — KSA + UAE Launch
| Metric | Value |
|---|---|
| ARR | SAR 3.6M |
| Customers | 120 |
| Average ACV | SAR 30,000/year |
| Average seats | 5 seats per company |
| Revenue | SAR 3.6M |
| Operating costs | SAR 2.8M |
| EBITDA | SAR 0.8M (22% margin) |

**Key milestones:**
- KSA + UAE launch (Riyadh, Jeddah, Dubai)
- First 120 paying customers
- Seed round close
- Saudi PDPL certification

### Year 2 — Qatar + Kuwait Expansion
| Metric | Value |
|---|---|
| ARR | SAR 14.4M |
| Customers | 480 |
| Average ACV | SAR 30,000/year |
| Total seats | 2,400 |
| Revenue | SAR 14.4M |
| Operating costs | SAR 9.2M |
| EBITDA | SAR 5.2M (36% margin) |

**Key milestones:**
- Qatar + Kuwait office launch
- Series A close (SAR 25M target)
- Arabic AI Voice GA
- 10 GCC reseller partners onboarded

### Year 3 — Full GCC Coverage
| Metric | Value |
|---|---|
| ARR | SAR 86M |
| Customers | 2,400 |
| Average ACV | SAR 36,000/year |
| Total seats | 14,400 |
| Revenue | SAR 86M |
| Operating costs | SAR 48M |
| EBITDA | SAR 38M (44% margin) |

**Key milestones:**
- All 6 GCC markets live
- Series B close (SAR 80M target)
- 1,000+ enterprise seat tier
- White-label partner revenue stream

### Unit Economics
| Metric | Value |
|---|---|
| CAC (blended) | SAR 8,400 |
| LTV (3-year) | SAR 90,000 |
| LTV:CAC ratio | 10.7× |
| Payback period | 8 months |
| Gross margin (SaaS) | 72% |
| Net Revenue Retention (Year 2 target) | 118% |

---

## 14. Pricing Model

### Tier 1 — Starter (SAR 299/seat/month)
*For growing teams who need CRM + WhatsApp from day one.*

**Includes:**
- CRM Core (pipeline, contacts, deals)
- WhatsApp Business inbox
- Email + basic sequences
- AI Daily Briefing
- Up to 10 seats
- Saudi data residency

### Tier 2 — Growth (SAR 699/seat/month)
*Full CRM + Call Center + Marketing for scaling revenue teams.*

**Includes everything in Starter, plus:**
- Power Dialer (3 modes)
- Conversation Intelligence
- AI Campaign Builder (7 channels)
- Post-call automation
- ICP scoring + Forgotten Leads
- Cultural Intelligence Engine
- Up to 100 seats

### Tier 3 — Enterprise (SAR 1,299/seat/month)
*All three engines. Arabic AI Voice. 16-agent research. Sovereign deployment.*

**Includes everything in Growth, plus:**
- AI Voice Agents — 6 Arabic dialects
- All 4 Intelligence Engines (Masaar, Person Intel, Company Intel, Lead Finder)
- CEO Situation Room
- Multi-office dashboards
- KSA PDPL redaction + compliance pack
- Mada / Tap / HyperPay Quote-to-Cash
- Custom AI Playbooks
- White-glove onboarding
- Unlimited seats

### Usage Add-Ons
| Item | Price |
|---|---|
| AI Voice Agent calls | SAR 0.45/minute |
| Enrichment credits | SAR 2.50/contact |
| Intelligence Engine run | SAR 35/run |
| Business Card scan | SAR 1.20/card |
| WhatsApp broadcast | SAR 0.08/message |
| Mada payment processing | 1.0% (lowest in market) |

---

## 15. GCC Expansion Plan

### Phase 1 — Months 1–12: KSA + UAE (Anchor Markets)
**Markets:** Saudi Arabia · United Arab Emirates

**Actions:**
- Riyadh + Jeddah direct sales team (4 reps)
- Dubai office, DIFC entity for UAE billing
- Saudi PDPL certification + KSA data residency live
- GITEX 2025 launch event — 500 booth demos
- First 120 paying customers. ARR: SAR 3.6M
- Arabic AI Voice GA — Layla + Faisal voices
- Masaar Saudi CR engine GA

**KSA Compliance Requirements:**
Saudi PDPL · Data residency (SDAIA) · CR number · Mada payment license · Arabic UI parity

**UAE Compliance Requirements:**
DIFC / ADGM entity · TDRA compliance · UAE Pass integration consideration · AED pricing

### Phase 2 — Months 13–24: Qatar + Kuwait (Gulf Extension)
**Markets:** Qatar · Kuwait

**Actions:**
- Doha office, QFC entity for Qatar billing
- Kuwait City partner-led go-to-market
- QAR + KWD pricing tiers live
- Wamda + MoCI + Argaam signal sources full coverage
- Series A close — SAR 25M target
- Partner channel: 10 GCC resellers onboarded
- 480 customers. ARR: SAR 14.4M

**Qatar Compliance Requirements:**
QFC registration · PDPPL compliance · QAR pricing · Government procurement pre-qual

**Kuwait Compliance Requirements:**
CITRA compliance · Kuwait data localisation · Partner-led GTM · KWD pricing

### Phase 3 — Months 25–36: Bahrain + Oman (Full GCC Coverage)
**Markets:** Bahrain · Oman

**Actions:**
- Manama (fintech hub) + Muscat offices
- BHD + OMR pricing live
- White-label offering for GCC banks and telcos
- Arabic Levantine + Egyptian voice personas GA
- Government sector vertical — Vision 2030 procurement
- Series B close — SAR 80M target
- 2,400 customers. ARR: SAR 86M

**Bahrain Compliance Requirements:**
CBB fintech compliance · EDB registration · BHD pricing · FinTech Bay partnership

**Oman Compliance Requirements:**
TRA Oman · ITA registration · OMR pricing · Government sector vertical entry

---

## 16. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework, strict mode |
| TypeScript | 5.x | Full type coverage |
| Vite | 7.x | Build tool, HMR, path routing |
| Tailwind CSS | v4 | Utility-first, custom design tokens |
| shadcn/ui + Radix | Latest | Accessible component primitives |
| Framer Motion | 11.x | Animations, layout transitions |
| TanStack Query | v5 | Server state, caching, optimistic UI |
| Wouter | 3.x | Lightweight client-side router |
| Recharts | 2.x | Data visualisation, KPI charts |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22.x | Runtime |
| Express | 5.x | REST API, middleware stack |
| Drizzle ORM | Latest | Type-safe SQL, schema-as-code |
| PostgreSQL | 16.x | Primary data store, full-text search |
| Zod | 3.x | Runtime validation, OpenAPI schema |
| Pino | Latest | Structured JSON logging (req.log in routes) |
| pnpm workspaces | 9.x | Monorepo — web, API, mobile, slides |
| OpenAPI + Orval | Latest | Contract-first codegen, React Query hooks |
| Resend | Latest | Transactional email delivery |
| esbuild | Latest | Fast server bundling (build.mjs) |

### AI Layer
| Provider | Models | Use Case |
|---|---|---|
| OpenAI | GPT-4o, GPT-4o-mini | Synthesis, campaign copy, lead scoring, fallback |
| Anthropic | Claude 3.5 Sonnet | Validation, complex reasoning, waterfall step 2 |
| Google | Gemini 1.5 Pro | Vision OCR, multi-agent primary (5 agents), waterfall step 1 |
| Perplexity | pplx-70b-online | Live web research — 9 parallel agents |
| OpenRouter | Multiple | Model routing + fallback waterfall |
| Cheerio | N/A | Fast HTML scraping for enrichment |
| Playwright | Latest | JavaScript-rendered page crawls |

### AI Architecture
- **fanOut engine:** 16 parallel agents, 55-second timeout per agent
- **synthesizeJson waterfall:** Gemini → Claude → GPT → sample data fallback
- **5-agent card scanner:** Gemini Vision → Claude validation → Perplexity search → BS4 scraper → GPT-4o-mini scoring

---

## 17. Components & Architecture

### Monorepo Structure
```
nexflow/
├── artifacts/
│   ├── nexflow/          # Main React web app (path: /)
│   ├── api-server/       # Node/Express API (path: /api)
│   ├── mobile/           # Expo React Native
│   ├── company-profile-deck/  # React slide deck
│   ├── investor-deck/    # React slide deck (passcode-gated)
│   ├── marketing-demo-video/  # Remotion video
│   └── mockup-sandbox/   # Vite component previews
├── lib/                  # Shared TypeScript libraries
├── scripts/              # Utility scripts
├── pnpm-workspace.yaml   # Workspace config, catalog pins
├── tsconfig.base.json    # Shared strict TS defaults
└── package.json          # Root orchestration
```

### API Server Routes
| Route prefix | Handler | Description |
|---|---|---|
| `/api/contacts` | contacts.ts | CRUD contacts, bilingual fields |
| `/api/deals` | deals.ts | Pipeline deals, stage management |
| `/api/activities` | activities.ts | Calls, meetings, notes, filtered by contact_id |
| `/api/companies` | companies.ts | Company records, CR data |
| `/api/marketing/*` | marketing.ts | Campaign, assistant-chat, generate-image, publish |
| `/api/power-dialer/*` | power-dialer.ts | Dialer sessions, voice-agent-call |
| `/api/engines/*` | engines.ts | Masaar, Person Intel, Company Intel, Lead Finder |
| `/api/business-cards/*` | business-cards.ts | 5-agent card scanner pipeline |
| `/api/enrichment/*` | enrichment.ts | Prospecting, signals, bulk enrich |

### Key Frontend Pages
| Route | Page | Description |
|---|---|---|
| `/briefing` | briefing.tsx | Home: Daily Briefing + Command Center |
| `/pipeline` | pipeline.tsx | Lead pipeline + AI gap analysis |
| `/deal-pipeline` | deal-pipeline.tsx | Kanban deal board |
| `/power-dialer` | power-dialer.tsx | 3-mode dialer, live transcript, coach panel |
| `/enrichment-engine` | enrichment-engine.tsx | 7-tab enrichment hub |
| `/marketing-dashboard` | marketing-dashboard.tsx | Marketing KPIs + AI analysis |
| `/campaign-builder` | campaign-builder.tsx | 4-tab campaign creation |
| `/campaign-performance` | campaign-performance.tsx | Per-campaign analytics |
| `/call-analytics` | call-analytics.tsx | Team call dashboard |
| `/post-call-automation` | post-call-automation.tsx | Approval queue + cadence rules |
| `/contact-center-setup` | contact-center-setup.tsx | AI agent config + knowledge base |

### Database Schema (Key Tables)
- `contacts` — bilingual fields (firstName, lastName, firstNameAr, lastNameAr), ICP score, health score, signal score
- `companies` — CR number, legal name Arabic/English, funding stage, employees
- `deals` — stage, probability, weighted value, AI win-rate, close date
- `activities` — type (call/meeting/note/email/whatsapp), contact_id FK, outcome, transcript
- `sequences` — multi-step cadences with AI Voice step
- `engine_runs` — id, kind, durationMs, sourcesUsed, report (JSONB)
- `campaigns` — status, channels, metrics JSONB
- `users` — persona role, session management

---

## 18. Deployment

### Service Architecture
| Service | Type | Path | Port |
|---|---|---|---|
| artifacts/nexflow | React + Vite SPA | `/` | PORT env var |
| artifacts/api-server | Node + Express API | `/api` | 8080 |
| artifacts/mobile | Expo React Native | REPLIT_EXPO_DEV_DOMAIN | Expo managed |
| artifacts/company-profile-deck | React slides | `/company-profile-deck` | PORT env var |
| artifacts/investor-deck | React slides (gated) | `/investor-deck` | PORT env var |

### Routing
A global reverse proxy routes traffic by path using each artifact's `artifact.toml`. Paths are matched most-specific-first. Services must handle their full base path themselves. Never call service ports directly — always go through `localhost:80`.

### Environment Secrets Required
| Secret | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Replit managed) |
| `SESSION_SECRET` | Express session signing key |
| `INVESTOR_PASSCODE` | Investor deck access gate |
| `OPENAI_API_KEY` | GPT-4o + GPT-4o-mini |
| `ANTHROPIC_API_KEY` | Claude 3.5 |
| `GEMINI_API_KEY` | Gemini 1.5 Pro |
| `PERPLEXITY_API_KEY` | Live web research |
| `RESEND_API_KEY` | Transactional email |

### Build Commands
```bash
# Web app
pnpm --filter @workspace/nexflow run build

# API server
pnpm --filter @workspace/api-server run build

# Company profile deck
pnpm --filter @workspace/company-profile-deck run build

# Run database migrations
pnpm --filter @workspace/api-server run db:push

# Full typecheck
pnpm run typecheck
```

### Production Checklist
- [ ] All 8 environment secrets set in production environment
- [ ] Database migrations applied (`db:push`)
- [ ] KSA data residency region selected in deployment config
- [ ] Saudi PDPL compliance documentation submitted
- [ ] Arabic UI parity verified (RTL, bilingual fields, search)
- [ ] Mada payment gateway credentials configured
- [ ] AI provider API keys tested (all 4 providers)
- [ ] Call recording redaction rules verified

---

## 19. Local Dev Setup

### Prerequisites
- Node.js 22+
- pnpm 9+
- PostgreSQL 16+ (or use Replit's managed DB)
- Git

### Step-by-Step Setup

```bash
# Step 1 — Clone the repo
git clone <repo-url>
cd nexflow-crm

# Step 2 — Install pnpm globally
npm install -g pnpm

# Step 3 — Install all workspace dependencies
pnpm install

# Step 4 — Copy and fill environment variables
cp .env.example .env
# Fill in: DATABASE_URL, OPENAI_API_KEY, ANTHROPIC_API_KEY,
#          GEMINI_API_KEY, PERPLEXITY_API_KEY, SESSION_SECRET,
#          INVESTOR_PASSCODE, RESEND_API_KEY

# Step 5 — Run database migrations
pnpm --filter @workspace/api-server run db:push

# Step 6 — Start the API server (terminal 1)
pnpm --filter @workspace/api-server run dev

# Step 7 — Start the web app (terminal 2)
pnpm --filter @workspace/nexflow run dev

# Step 8 — Open the app
open http://localhost:5173
# Click any persona pill on /signin to sign in instantly
```

### Demo Personas (Instant Sign-In)
| Key | Name | Role |
|---|---|---|
| `sales` | Khalid Al-Otaibi | Senior Sales Executive |
| `manager` | Layla Al-Sabah | Head of Sales · Gulf Region |
| `ceo` | Faisal Al-Harbi | CEO |
| `admin` | Sara Al-Mansouri | CRM Operations Lead |
| `marketing` | Reem Al-Qahtani | Head of Marketing |

### Troubleshooting
| Issue | Fix |
|---|---|
| Port already in use | `fuser -k 5173/tcp 8080/tcp` then restart |
| Database connection failed | Check `DATABASE_URL` in `.env` |
| AI responses are sample data | Add valid API keys — app falls back to samples gracefully |
| Arabic text not rendering | Ensure font (Noto Sans Arabic) is loading from CDN |
| Mobile Expo won't start | Set `REPLIT_EXPO_DEV_DOMAIN` env var |

---

## 20. Role Journeys

### Khalid Al-Otaibi — Senior Sales Executive

**7:45 AM** — Opens NexFlow on his phone. AI Daily Briefing reads: "3 high-intent leads went silent yesterday — Forgotten Leads surfaced 2 of them with fresh MoCI signals. Call queue has 8 contacts. Best window: 9–11 AM."

**8:30 AM** — Starts Power Dialer (Auto-Dial mode). Pre-call brief shows: "Abdullah Al-Rashidi, CFO at Tamimi Markets. High Intent (score 84). Last touch: 12 days ago. Objection history: pricing. Suggested opener: acknowledge the budget concern, lead with Mada 1% fee advantage."

**9:15 AM** — Call connected. LiveCoachPanel detects "competitor mention — Salesforce" and pushes: "Remind him: 3 tools vs 1, SAR pricing vs USD, no add-ons." Call ends positive.

**9:17 AM** — 1-click post-call panel: note logged, follow-up task created, reminder set for Thursday, WhatsApp drafted in Arabic. Done in 12 seconds.

**11:00 AM** — Business card from last week's GITEX — scans it. 30 seconds later: contact created, ICP score 76, company profile enriched, LinkedIn URL found.

**2:00 PM** — Campaign Builder: builds a Ramadan outreach campaign. Cultural Intelligence toggle on. AI generates Arabic-first WhatsApp copy scheduled for Tues/Wed post-Iftar.

---

### Layla Al-Sabah — Head of Sales, Gulf Region

**8:00 AM** — Manager briefing: team attainment 67% vs target. 3 reps haven't logged a call in 2 days. Forecast variance: Deal "Almarai renewal" dropped from Commit to Best Case — AI says "no activity in 9 days, new contact added on their side."

**9:30 AM** — Reviews Conversation Intelligence dashboard. Ahmed's call scored 6.2/10 — talk ratio 78% (too much talking). Coaching session scheduled for 2pm.

**11:00 AM** — Runs Lead Finder: "FinTech companies, KSA, 50–200 employees, Series A+, hiring sales ops." 30 seconds, 14 net-new leads returned. Bulk-adds to enrichment queue.

**2:00 PM** — Coaching session with Ahmed. Plays back 2-minute clip where objection was raised. LiveCoachPanel had suggested the right response — Ahmed didn't use it. Action plan set.

**4:00 PM** — Pipeline review. AI gap analysis: "Stage 3 → Stage 4 conversion is 31% — 19pts below benchmark. Primary cause: proposals going out without document tracking pixel. 6 proposals sent this month with zero open data."

---

### Faisal Al-Harbi — CEO

**7:30 AM** — CEO Situation Room. Riyadh office: 88% vs target. Dubai: 71%. Doha (new): 45% — expected. Strategic initiative "Q2 Government Vertical": 3 of 5 contacts engaged. News signal: "Saudi Aramco announced digital procurement expansion" — 2 open deals with Aramco suppliers flagged.

**10:00 AM** — Investor meeting prep. Pulls financial projections: SAR 3.6M ARR at end of Year 1, 120 customers, 22% EBITDA. Feasibility score 9/10 — product is live, not planned.

**2:00 PM** — Reviews untaken action ledger: 4 C-level contacts who responded positively but haven't been followed up in 7+ days. Assigns each to a senior rep via Lead Routing rules.

**4:30 PM** — AI Assistant query: "Which open deals over SAR 200K have had no activity in 14+ days?" Answer: 3 deals, total SAR 1.1M. Triggers AI Voice Agent to attempt re-engagement on 2 of them.

---

### Sara Al-Mansouri — CRM Operations Lead

**9:00 AM** — Data quality review. ICP Rules Engine: updates scoring model — adds "company size 200+" as a hard rule for Enterprise tier. Rebuilds scores for all 4,800 contacts.

**10:30 AM** — List upload: 340 contacts from last month's conference. Deduplication runs — 47 duplicates found, survivor preference set to "keep most recently enriched." Questionnaire completed. Queued for enrichment.

**1:00 PM** — Post-call automation audit: 3 cadence rules active. Reviews approval queue — 12 AI-drafted WhatsApps pending. Approves 10, edits 2 (adjusts Arabic greeting from formal to informal for two relationship accounts).

**3:00 PM** — Contact Center Setup: updates Knowledge Base with new Q4 pricing objection script. Enables "AI Agent authority" to book meetings autonomously without approval for leads scored 80+.

---

### Reem Al-Qahtani — Head of Marketing

**8:30 AM** — Marketing Dashboard. Cultural Intelligence alert: "Ramadan starts in 11 days. Pre-Ramadan GOLD window: next 7 days. Recommended: push value-focused campaigns before the slowdown. 68% of your contacts are in affected countries."

**9:30 AM** — AI Campaign Builder. Brief: "Re-engage fintech CFOs in KSA who went cold in Q3." AI generates: 7 channel variants, Khaleeji aesthetic, Arabic-first copy, scheduled for Sunday–Wednesday mornings. Campaign visual generated. Publishes to WhatsApp + Email + LinkedIn.

**11:00 AM** — Web Forms: uses AI Form Creator. Brief: "Lead gen form for CFOs interested in AI-powered forecasting." AI drafts 6 fields. Predictive Analysis: predicted conversion rate 4.2%, recommended channel: LinkedIn. Health grade: A.

**2:00 PM** — Campaign Performance review. Last campaign: 340 opens, 67 clicks, 12 MQLs, 3 deals in pipeline. Hot lead: "Mohammed Al-Qahtani opened proposal 4 times in last 48 hours." Triggers "Alert rep" — Khalid gets a WhatsApp notification instantly.

---

*NexFlow — Where revenue learns to flow.*
*Riyadh · Khobar · Dubai · Confidential · 2026*
