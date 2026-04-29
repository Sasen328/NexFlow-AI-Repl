# 06 — Phase 2: Client Management System (Spec)

> **Status:** forward-looking design spec. Not built yet. Target: ship behind a feature flag in Q3 2026; GA Q4 2026.
>
> **Module name:** *NexFlow Atlas* (working name) — the post-sale relationship intelligence layer.
>
> **Why this exists:** every generic CRM can store a "customer" record after a deal closes. Almost none of them are *post-sale operating systems* and almost none of them treat a GCC client relationship as the multi-stakeholder, multi-generational, multi-channel, Hijri-calendar-aware engagement that it actually is. *Atlas* fills that gap.

---

## 1. Goals

1. **One source of truth for "what is the relationship?"** Beyond contracts and tickets — relationship strength, decision-maker map, family / wasta context, last meaningful touch.
2. **Predict churn 90 days early.** A unified Success Score fed by support tickets, product usage, sentiment from logged calls, response latency, and contract milestones.
3. **Make every QBR write itself.** Auto-assemble a draft QBR doc from call intelligence, signals, and product usage.
4. **Be culturally fluent.** Hijri-aware account cadences. AI-suggested check-ins around Ramadan / Eid / National Days. Right-of-Center proper-name handling.
5. **Be Arabic-native.** Bilingual everywhere; client-facing artifacts (QBRs, emails, success summaries) generated in Arabic by default for KSA / GCC clients.

### Anti-goals

- This module is *not* a help-desk replacement (we integrate with Zendesk / Freshdesk / Intercom rather than re-build).
- It is *not* a Customer Data Platform (segmentation lives in `/audiences`).

---

## 2. Target users

| Role | Primary use of Atlas |
| --- | --- |
| **Customer Success Manager (CSM)** | Daily home base. Health, action queue, QBR prep. |
| **Account Executive** | Pre-renewal expansion plays. Stakeholder map for upsell. |
| **VP Sales / VP CS** | Portfolio dashboard, churn risk forecast. |
| **CEO** | Top-20-account heatmap. |
| **Implementation / Onboarding** | Hand-off → Atlas timeline; sees go-live readiness (Phase 3). |

---

## 3. The differentiated angle

Five things competitors don't do well; *Atlas* does:

### 3.1 Relationship Graph view

A force-directed graph where nodes are **stakeholders** (not "contacts") and edges are **relationship signals**:

- "Reports to" / "Hired by" (org structure)
- "Champion" / "Detractor" / "Decision-maker" / "Influencer" / "Procurement gatekeeper"
- "Spoke to in the last 30 days" (auto-derived)
- "Family relation" *(opt-in field, GCC context)*
- "Same university / same regiment / same chamber" (wasta context, opt-in)

Each node carries a small avatar, a sentiment ring, and a "last touch" age halo. The graph is the **landing screen** of the account in Atlas.

### 3.2 Hijri-aware account cadence

Customer Success cadences (e.g. "QBR every 90 days", "monthly health check") respect the Hijri calendar:

- A scheduled monthly check-in shifts out of Ramadan working hours.
- A QBR is suggested in the week *after* Eid, not during it.
- National Day weeks are auto-blocked.
- "Last touch was Ramadan? Doesn't count toward dormancy timer."

### 3.3 AI-suggested check-ins around Ramadan / Eid / National Days

Atlas surfaces a **culturally-warm reach-out** prompt:
- "It's the last Friday before Ramadan. Send the champion a short personal note."
- "Eid Al-Fitr falls 14 days from now. Suggest a brief Eid greeting in Arabic with the customer's preferred dialect (KSA / Khaleeji)."
- The AI drafts the message; CSM edits and sends in one click.

### 3.4 Auto-generated QBR

When a CSM opens "Prepare QBR" on an account, Atlas assembles in 30 seconds:
- Executive summary (in client's preferred language)
- Last 90 days: usage trend, NPS / CSAT pulse, support volume, key wins
- Risk register, with mitigations
- Roadmap of pending feature commitments
- Suggested next-90-days plan
- A printable, branded PPTX export *(uses the same brand system as `docs/01-brand-palette-motion.md`)*

QBR draft is a **structured document** the CSM edits in-place, not a static PDF.

### 3.5 Success Score model (transparent)

A **0–100** score per account, refreshed daily, with an **explanation card** so it's not a black box.

Inputs (weights tunable per org in Account Settings):

| Signal | Default weight | Source |
| --- | --- | --- |
| Product usage trend (DAU / WAU) | 25% | `usage_events` (new) |
| Support ticket sentiment & volume | 20% | help-desk integration |
| Call sentiment (last 90 days) | 15% | `calls.sentiment_score` |
| Response latency (their side → ours) | 10% | activity timeline |
| Champion engagement (last touch) | 10% | activities + signals |
| Stakeholder coverage (≥ 3 stakeholders engaged) | 10% | relationship graph |
| Renewal time horizon | 5% | `subscriptions` (new) |
| Open invoices / payment health | 5% | Quote-to-Cash |

Each contribution is shown with a delta arrow ("+3 because product usage is up week-over-week"). When the score drops > 5 points in a week, Atlas creates a `notification` typed `ai`.

---

## 4. Key screens (described, not designed)

> All wireframe-level. Each respects the brand system (Living Mesh background, glass-panels, chameleon palette, motion tokens from `docs/01`).

### Screen A — Atlas Portfolio

Default landing for CSMs and CS leaders.
- Top KPI bar: NRR, GRR, churn risk count, expansion pipeline, NPS.
- Heat-map grid of accounts colored by Success Score.
- Side filters: segment, ARR band, owner, region, language.
- Click an account → Screen B.

### Screen B — Account: Relationship Graph (default tab)

- Big force-directed graph (zoom + pan).
- Right rail: account profile, current Success Score with explanation, ARR, renewal date, open commitments, outstanding tickets, next QBR date, **culturally-warm reach-out card** (§3.3).
- Tabs across the top: **Graph** | **Timeline** | **Health** | **Commitments** | **Tickets** | **QBR** | **Files**.

### Screen C — Account: Health

- Success Score over time, with annotation pins for big events (CSM change, exec sponsor leaves, etc.).
- Per-signal breakdown chart.
- Recommended actions (AI-generated).

### Screen D — Account: QBR

- Document editor with auto-generated sections.
- "Regenerate" button per section.
- "Export as PPTX / PDF" — branded.
- Comments / approval workflow with the AE.

### Screen E — Cadences

- All recurring touches: monthly check-ins, quarterly QBRs, annual exec briefings.
- Each cadence shows next-fire date, Hijri-aware shifts, owner.
- Bulk-edit per segment.

### Screen F — At-Risk Queue

- Triaged list of accounts with Success Score declining.
- Each row: top reason, suggested play, ETA to recovery.
- One-click "Open play" → starts the right workflow.

---

## 5. Data model additions

New Drizzle tables in `lib/db/src/schema/`. All `org_id`-scoped.

### `subscriptions`
```
id, org_id, account_id (→ companies), plan, currency,
arr_amount, started_at, renews_at, terms_url, autorenew,
created_at, updated_at
```

### `usage_events`
```
id, org_id, account_id, user_email, event_name,
event_value (jsonb), occurred_at
```
*(Ingested via API from the customer's product or via warehouse sync.)*

### `success_scores`
```
id, org_id, account_id, score (0–100), version,
contributions (jsonb — per-signal deltas), captured_at
```
*(One row per snapshot — daily.)*

### `stakeholders`
```
id, org_id, account_id, contact_id (→ contacts),
role (champion | dm | influencer | gatekeeper | detractor),
tenure_in_role_months, sentiment_label,
notes, opt_in_relationship_context boolean,
created_at, updated_at
```

### `stakeholder_relations`
```
id, org_id, source_stakeholder_id, target_stakeholder_id,
relation_type (reports_to | hired_by | family | university | chamber | other),
opt_in boolean, notes,
created_at
```

### `cadences`
```
id, org_id, account_id, type (qbr | monthly | weekly | annual_exec),
next_fire_at, hijri_aware boolean, last_fired_at,
owner_id (→ users), active boolean
```

### `qbrs`
```
id, org_id, account_id, status (draft | shared | signed_off),
document (jsonb — sections), generated_by (ai | human),
created_at, updated_at
```

### `commitments`
```
id, org_id, account_id, title, owner_side (us | them),
due_at, status (open | done | overdue), source (call | email | qbr),
created_at, updated_at
```

### Schema additions to existing tables

- `companies`: add `arr_amount integer`, `renewal_date timestamp`, `csm_id uuid → users`, `success_score integer` (denormalized latest), `success_score_updated_at`.
- `notifications.notification_type`: extend the enum with `cs` (customer success), `qbr`, `cadence`.

---

## 6. AI components

| Component | What it does | Backing model |
| --- | --- | --- |
| **Relationship-graph builder** | Suggests new edges (champion / detractor / influencer) from call sentiment, email patterns, and meeting attendance. | Claude 3.5 Sonnet via OpenRouter. |
| **Cultural cadence advisor** | Decides when to shift / hold a touchpoint. | Rule-based (Hijri calendar) + LLM for nuance ("the customer's CFO is performing Hajj, push by 3 weeks"). |
| **Reach-out drafter** | Drafts Eid / Ramadan / National Day greetings in customer's preferred language and dialect. | Claude 3.5 Sonnet, with a Saudi-Arabic style prompt. |
| **Success Score explainer** | Generates the human-readable explanation card. | gpt-4o-mini. |
| **QBR auto-author** | Generates each section from the underlying data (usage trend, sentiment, commitments). | Claude 3.5 Sonnet for narrative; deterministic compositor for structure. |
| **At-risk play recommender** | Picks the right play from the Sales Playbooks library + customizes to the account context. | gpt-4o-mini. |

All call out via existing `aiChat` / `aiJson` in `artifacts/api-server/src/lib/ai.ts`. Atlas adds a new file `artifacts/api-server/src/lib/atlas.ts` for higher-level prompts.

---

## 7. APIs to add

Mounted under `/api/atlas`:

```
GET    /accounts/:id/graph                  → relationship graph nodes + edges
GET    /accounts/:id/success-score          → latest score + explanation
GET    /accounts/:id/success-score/history  → time-series
POST   /accounts/:id/qbr/generate           → returns draft QBR document
PUT    /accounts/:id/qbr/:qbrId             → save edits
POST   /accounts/:id/qbr/:qbrId/share       → email it (Resend) and mark shared
GET    /cadences                            → list (filterable)
POST   /cadences                            → create
PUT    /cadences/:id                        → edit / shift
GET    /atlas/portfolio                     → CSM dashboard payload
GET    /atlas/at-risk                       → triaged at-risk queue
```

OpenAPI definitions added to `lib/api-spec/`; codegen regenerates Zod schemas + React Query hooks for the web + mobile.

---

## 8. Integrations needed

| Integration | What we use it for | Notes |
| --- | --- | --- |
| **Help-desk** (Zendesk / Freshdesk / Intercom) | Ticket sentiment + volume into Success Score. | Use connector pattern from `query-integration-data` skill. |
| **Product usage** (warehouse: BigQuery / Snowflake / Databricks; or direct webhook) | DAU / WAU / event counts. | Ship a NexFlow JS SDK for direct event ingest as well. |
| **Hijri calendar** | Cadence shifting. | Use `umm-al-qura` calendar lib (npm). |
| **Translation / Arabic NLP** | Language polish on AI drafts. | Goes through OpenRouter (Claude 3.5 handles Arabic well). |
| **Payment health** | Open invoices into Success Score. | Reuse Quote-to-Cash data. |

---

## 9. Success metrics for Atlas itself

| Metric | Target (12 mo. post-GA) |
| --- | --- |
| % of paying NexFlow customers with Atlas turned on | ≥ 70% |
| Avg Success Score lift across active orgs | +12 points y/y |
| Churn rate among Atlas-tracked accounts | ≤ 6% (vs. 10% control) |
| QBRs auto-generated per CSM per quarter | ≥ 8 |
| Time saved per QBR | ≥ 4 hours |
| % of QBRs sent in Arabic to GCC clients | ≥ 60% |
| NPS of CSMs using Atlas | ≥ 50 |

---

## 10. 90-day build outline

> Two-week sprints, two engineers + one designer + 0.5 PM.

| Sprint | Scope |
| --- | --- |
| **S1 (wks 1-2)** | Spec lock, data model PR, migration, seed sample data. Read-only `companies.arr_amount` + `csm_id` fields shipped. |
| **S2 (wks 3-4)** | Success Score v1 (signals: call sentiment, response latency, ticket count via help-desk webhook). Daily cron snapshots. Score on company detail page. |
| **S3 (wks 5-6)** | Cadences module + Hijri awareness. Monthly check-in cadence ships. Atlas Portfolio screen v1. |
| **S4 (wks 7-8)** | Relationship Graph (read-only). Stakeholder roles + manual edit. Account detail tabs scaffold. |
| **S5 (wks 9-10)** | QBR auto-author v1 (structured doc). PPTX export reusing brand system. Reach-out drafter for Ramadan / Eid. |
| **S6 (wks 11-12)** | At-Risk Queue + recommended plays. Mobile app: Atlas tab with Portfolio + account detail. Internal beta with two design-partner customers. |

GA after a 6-week design-partner phase and a single dedicated hardening sprint.

---

## 11. Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Customers don't use opt-in family / wasta fields | Make them optional and clearly value-add. Lead with org-structure edges. |
| Hijri calendar bugs around lunar visibility | Defer hard cutoffs to Umm al-Qura; allow per-account override. |
| LLM-drafted QBRs feel generic | Train on top-quartile real QBRs; CSM always edits before send. |
| Success Score gamed | Show the contribution breakdown; orgs can re-weight. |
| Help-desk integration sluggish | Cache last 24 h of ticket signals; fall back to manual entry. |
