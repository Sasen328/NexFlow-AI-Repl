# 07 — Phase 3: Client Onboarding System (Spec)

> **Status:** forward-looking design spec. Not built yet. Sequenced after Phase 2 (Atlas). Target: ship behind a feature flag in Q1 2027; GA Q2 2027.
>
> **Module name:** *NexFlow Threshold* (working name) — the AI-guided client onboarding & go-live operating system.
>
> **Why this exists:** the gap between "deal closed" and "first value delivered" is where most B2B SaaS bleeds revenue and trust. In the GCC, where buying decisions involve multiple stakeholders and procurement teams, this gap is even longer and more political. Generic CRMs hand off to a checklist. *Threshold* runs the entire crossing — AI-guided playbooks per industry, automated data import from 50+ GCC enrichment sources, Arabic-native onboarding video tours, and a "go-live readiness" score that is honest about where the customer is.

---

## 1. Goals

1. **Cut time-to-first-value (TTFV) by 50%** vs. the customer's previous CRM. Most NexFlow buyers come from "we used Excel + Salesforce" — the comparison is brutal but real.
2. **Make the onboarding observable.** Both sides see the same "Threshold" board with the same readiness score.
3. **Be industry-fluent on day one.** A bank, a real-estate developer, an automotive distributor, and a consulting firm should each get a different onboarding playbook automatically.
4. **Be Arabic-native.** Onboarding tutorials, video walk-throughs, and emails default to the customer's preferred language and dialect.
5. **Branch white-glove vs. self-serve cleanly.** Same product surface, different intensity of human involvement.
6. **Auto-detect integrations** so the customer doesn't have to enumerate "what tools do we use?" — we discover from email signatures, domain MX, public stack data, and on-site SDKs.

### Anti-goals

- Threshold is *not* a project-management tool — we don't replace Asana / Jira; we *integrate* with them when the customer brings one.
- It is *not* a billing module — invoicing remains in Quote-to-Cash.

---

## 2. User journey (target experience)

| Day | Customer experience | NexFlow internal |
| --- | --- | --- |
| **D-1 (deal closed)** | Customer receives a personalized welcome email in their preferred language. CTA: "Open your Threshold board". | AE clicks **"Hand off to Onboarding"** in the deal; the playbook auto-selects based on industry + segment. |
| **D-0 (kick-off)** | 15-minute kick-off call. Their Threshold board already shows: their stakeholders, their integrations (auto-detected, see §3.6), their proposed go-live date, three suggested playbook variants. | Onboarding manager picks the variant; customer can edit. |
| **D-1 to D-7** | Daily 60-second AI-generated video tutorial in Arabic (or their preferred language) covering the features they actually need (industry-aware, see §3.4). Data is imported from 50+ GCC sources (see §3.3). | Threshold runs imports in background; queues up cleanup tasks. |
| **D-7 to D-14** | Customer's data is in. Customer enters live usage; Threshold tracks readiness signals. | Onboarding manager works the "stuck" queue. |
| **D-14 (go-live)** | Go-live ceremony when Readiness Score ≥ 85. Hand-off to Atlas (Phase 2) is automatic. | The CSM / AE / OM all see the hand-off. |

Self-serve customers (sub $X ARR) skip the human OM but follow the same Threshold board and the same readiness scoring.

---

## 3. The differentiated angle

### 3.1 Industry-aware playbooks

Onboarding is **not generic**. Threshold ships with playbooks for:

- **GCC banking & financial services** (data residency by default, KYC-aware property layout, regulator-friendly audit log on day 0)
- **Real estate developers & brokerages** (units / leads / mortgage-handler integration, Arabic property naming conventions)
- **Automotive distribution** (dealer-network multi-org, parts vs. service lines)
- **B2B SaaS** (typical product-led growth setup)
- **Professional services / consulting** (project + utilization tracking)
- **Healthcare** (HIPAA-equivalent / NPHIES-aware property layout)
- **Retail & QSR chains** (multi-location org tree)

Each playbook is a YAML in `lib/db/seeds/playbooks/` + a set of pre-built dashboards, properties, sequences, and integration templates that get auto-installed into the customer's tenant.

### 3.2 Go-Live Readiness Score (transparent)

A **0–100** score per onboarding, refreshed in real-time. Customer and OM see the **same** score with the **same** breakdown.

| Signal | Default weight |
| --- | --- |
| Data imported (contacts ≥ 80% of expected, companies ≥ 80%, deals ≥ 60%) | 25% |
| Integrations connected (per playbook) | 20% |
| Stakeholders trained (≥ 1 admin + ≥ 2 reps trained per playbook) | 15% |
| Custom properties confirmed | 10% |
| First real user activity (≥ 50 logged activities by real users in last 7 days) | 10% |
| Sequences / workflows enabled | 10% |
| Branding / domain set up (custom subdomain, email sender domain verified) | 5% |
| Compliance items signed off (DPA, residency choice) | 5% |

When the score crosses 85, Threshold offers "Schedule go-live ceremony". Below 60 after 14 days, it auto-escalates to the OM with a recommended fix.

### 3.3 Automated import from 50+ GCC enrichment sources

A library of connectors / scrapers / public-API clients to **populate the customer's CRM on day 1**:

- Local chambers of commerce (KSA, UAE, Bahrain, Oman, Kuwait, Qatar) for company registries.
- Tadawul / DFM / ADX listed-company databases.
- Aramco / Sabic / Maaden contractor registries (when relevant to a B2B sales target).
- LinkedIn Sales Navigator (customer-supplied seat).
- Crunchbase / Apollo (NexFlow-supplied).
- Company website crawl (about, leadership, careers).
- Email signature parser on inbound emails (the source of truth for stakeholder titles).
- Press releases / news (last 12 months, Arabic + English).

Customer chooses the sources to enable; each source has a clear "what is collected" disclosure to keep their privacy review easy.

### 3.4 Arabic-native onboarding video tours, generated per customer

Each day in week 1, Threshold sends the customer's admin a **60-second video tutorial** in their preferred language and dialect (KSA / Khaleeji / Levantine / Egyptian / English). Generated per customer:

- Voice-over from OpenAI TTS (using the Arabic voices) — male/female toggle.
- Footage stitched from a bank of recorded UI flows, with the customer's actual data overlaid.
- Subtitle track in both languages.
- Outro: "Your Readiness Score is now X. Next: do Y."

The script is written by an LLM constrained by the day's onboarding milestones. Video is rendered in `artifacts/marketing-demo-video/` engine (Framer Motion + WebAudio) — same toolchain we use for marketing.

### 3.5 White-glove vs. self-serve branching

Same product, two intensities:

| Tier | Trigger | Difference |
| --- | --- | --- |
| **White-glove** | Contract ARR ≥ $25K **or** strategic flag | Dedicated Onboarding Manager. Daily check-in. Data imports run by NexFlow ops. SLA on each step. |
| **Self-serve** | Default | Same Threshold board. Async chat with onboarding pool. Customer runs imports themselves with one-click connectors. |

The Threshold UI is identical; the difference is who owns each task and the SLA.

### 3.6 Integration auto-detection from email signatures + public stack data

When the customer signs in for the first time, Threshold:

1. Reads inbound email signatures to detect tools (Outlook → Microsoft 365; Calendly → meeting tool; HubSpot signature footer → past CRM).
2. Hits BuiltWith / Wappalyzer-style fingerprints on their public site to detect analytics / chat / forms.
3. Inspects MX records on the customer's domain to confirm email provider.
4. Suggests a pre-populated **Integration Plan** in the Threshold board.

The customer accepts / rejects each suggested integration with one click. No "integrations checklist" survey.

---

## 4. Key screens (described, not designed)

### Screen A — Threshold Board (customer view)

The single landing page when the customer logs in during onboarding. Replaces `/` (Command Center) until graduated.

- Hero: Readiness Score ring (chameleon gradient), days-until-go-live, "What's next" card.
- Lanes: **Data** | **People** | **Integrations** | **Configuration** | **Training** | **Compliance**.
- Each lane has tasks: status (todo / in-progress / blocked / done), owner (us / them), ETA.
- Right rail: AI assistant ("How do I add a custom property?") + today's video tutorial.

### Screen B — Threshold Board (OM view)

Same board with extra columns for OM:

- "Why is X stuck?" auto-generated.
- Suggested next message to the customer.
- "Force-import" / "Skip and revisit".

### Screen C — Industry Playbook Picker

At kick-off, the OM (or self-serve admin) picks an industry. Threshold shows the playbook preview: properties, dashboards, sequences, suggested integrations.

### Screen D — Import Wizard

Per-source import. Shows: source, # records expected, # records imported, # cleanup actions queued. One-click "Run cleanup with AI" to dedupe + normalize.

### Screen E — Daily Tutorial

Modal that shows the customer's tutorial for the day, with subtitles, "translate" button, and a "watched" checkbox that updates the Readiness Score.

### Screen F — Go-Live Ceremony

A celebratory modal at score ≥ 85. Captures sign-off (e-signature) on the DPA + residency choice + AUP. Schedules the hand-off call to CSM (Atlas).

---

## 5. Data model additions

### `onboardings`
```
id, org_id, account_id (→ companies),
playbook_key (banking | real_estate | automotive | saas | services | healthcare | retail),
tier (white_glove | self_serve),
status (kickoff | active | stuck | ready | live),
readiness_score integer,
target_go_live_date,
actual_go_live_date,
om_id (→ users), customer_admin_contact_id (→ contacts),
created_at, updated_at
```

### `onboarding_tasks`
```
id, onboarding_id, lane (data | people | integrations | configuration | training | compliance),
title, description, status (todo | doing | blocked | done | skipped),
owner_side (us | them), assignee_id, due_at, completed_at,
metadata (jsonb), playbook_step_key,
created_at, updated_at
```

### `import_jobs`
```
id, onboarding_id, source_key, source_label,
status (queued | running | done | failed),
records_expected, records_imported, dedup_actions_queued,
started_at, completed_at, error
```

### `integration_suggestions`
```
id, onboarding_id, vendor_key, source_of_detection (signature | mx | site_fingerprint | manual),
confidence (0-1), accepted boolean, accepted_at, accepted_by_id,
created_at
```

### `tutorial_videos`
```
id, onboarding_id, day_number, language (en | ar | ar-sa | ar-ae | …),
script (text), narration_url, video_url, watched_at,
created_at
```

### `readiness_snapshots`
```
id, onboarding_id, score integer, contributions jsonb,
captured_at
```

### Seeds

`lib/db/seeds/playbooks/*.yaml` — one per industry. Each defines properties, dashboards, sequences, integration suggestions, default tasks per lane.

---

## 6. AI components

| Component | What it does | Backing model |
| --- | --- | --- |
| **Industry inferrer** | At kick-off, suggests a playbook from the company name + domain + website crawl. | gpt-4o-mini. |
| **Integration auto-detector** | Parses email signatures + site fingerprints. | Heuristics + gpt-4o-mini for ambiguous cases. |
| **Import cleanup agent** | Dedupes contacts, normalizes phones (+966 / +971 / …), splits Latin-Arabic names. | Deterministic rules + Claude 3.5 Sonnet for edge cases. |
| **Tutorial scriptwriter** | Generates the day's 60 s script in customer's preferred language and dialect. | Claude 3.5 Sonnet. |
| **TTS narration** | OpenAI TTS, Arabic voices. | OpenAI `tts-1` / `tts-1-hd`. |
| **"Why am I stuck" explainer** | OM-side card. | gpt-4o-mini. |
| **Email drafter** | Drafts the daily customer-facing email. | Claude 3.5 Sonnet. |

All call out via existing `aiChat` / `aiJson` in `artifacts/api-server/src/lib/ai.ts`. Threshold adds `artifacts/api-server/src/lib/threshold.ts` for higher-level prompts and a new `routes/onboarding.ts`.

---

## 7. APIs to add

Mounted under `/api/onboarding`:

```
POST   /onboardings                         → create from a deal
GET    /onboardings/:id                     → board payload
GET    /onboardings/:id/readiness           → latest score + contributions
GET    /onboardings/:id/readiness/history   → time-series
PUT    /onboardings/:id/playbook            → switch playbook
POST   /onboardings/:id/tasks/:taskId/done  → mark complete
POST   /onboardings/:id/import-jobs         → kick off import from a source
GET    /onboardings/:id/integrations        → suggestions
POST   /onboardings/:id/integrations/:sid/accept
POST   /onboardings/:id/tutorials/today     → generate or fetch today's video
POST   /onboardings/:id/go-live             → ceremony
```

OpenAPI definitions added to `lib/api-spec/`; codegen regenerates Zod schemas + React Query hooks.

---

## 8. Integrations needed

| Integration | Purpose |
| --- | --- |
| **Microsoft 365 / Google Workspace** | Read inbound email signatures (read-only scope). |
| **Site fingerprint API** (BuiltWith / Wappalyzer-style) | Detect customer's web stack. |
| **GCC chamber / registry APIs** | Company import. |
| **Apollo / Crunchbase / Clearbit / ZoomInfo** | Generic company + people enrichment. |
| **DocuSign / Adobe Sign** | DPA + AUP e-signature. |
| **Calendly / Microsoft Bookings** | Schedule the kick-off & go-live ceremony. |
| **OpenAI TTS** (already wired) | Tutorial narration. |
| **Slack / Teams** | Post readiness updates into the customer's channel (opt-in). |

---

## 9. Success metrics for Threshold itself

| Metric | Target (12 mo. post-GA) |
| --- | --- |
| Median TTFV (deal closed → 50 logged activities by real users) | ≤ 14 days |
| % of customers reaching go-live within target date | ≥ 85% |
| Onboarding NPS | ≥ 60 |
| Self-serve completion rate (no human handholding) | ≥ 60% of self-serve cohort |
| Average integrations connected per onboarding | ≥ 4 |
| % of imports auto-cleaned without manual edits | ≥ 70% |
| Arabic-native tutorials viewed (GCC customers) | ≥ 75% |
| Onboarding hours saved per customer (vs. previous baseline) | ≥ 30 h |

---

## 10. 90-day build outline

> Two-week sprints, two engineers + one designer + 0.5 PM. Sequenced after Atlas (so we can re-use Atlas's Success Score plumbing for the Readiness Score).

| Sprint | Scope |
| --- | --- |
| **S1 (wks 1-2)** | Spec lock, data model PR, migration. `onboardings` + `onboarding_tasks` shipped. Hand-off button on the deal page. |
| **S2 (wks 3-4)** | Threshold Board v1 (lanes, tasks, owner-side). Two playbooks live: SaaS + Real Estate. |
| **S3 (wks 5-6)** | Readiness Score v1 + contributions. Score on board hero. |
| **S4 (wks 7-8)** | Import Wizard — three sources live (CSV, Apollo, customer's existing CRM via standard CSV export). AI cleanup agent for dedup + phone normalize. |
| **S5 (wks 9-10)** | Integration auto-detector (email signature + MX). Suggestion accept-flow. Five more playbooks (banking, automotive, services, healthcare, retail). |
| **S6 (wks 11-12)** | Tutorial videos: scriptwriter + TTS + render pipeline. English + Arabic-KSA voices. Internal beta with two design-partner customers. |

GA after a 6-week design-partner phase + a single dedicated hardening sprint + signed legal review of the auto-import sources per region.

---

## 11. Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Email-signature reading triggers privacy concern | Read-only scope, customer-tenant-scoped, transparent disclosure on first use. |
| Auto-imports surface incorrect data and erode trust | Always show source + confidence; require explicit accept on cleanup actions. |
| Tutorial videos sound robotic in Arabic | Use OpenAI tts-1-hd Arabic voices; have a native-speaker reviewer in the loop for the first 10 customers. |
| Industry playbooks become stale | Each playbook owner inside NexFlow (named) is responsible for quarterly updates. |
| Self-serve customers stall at 60-70 readiness and never hit GA | Auto-escalation path at day 14; one free 30-min consult included in self-serve. |
| White-glove cost balloons | Cap OM hours per onboarding; surface overage to the AE for re-pricing. |
