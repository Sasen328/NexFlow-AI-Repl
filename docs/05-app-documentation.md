# 05 — In-App Documentation (All Four Roles)

> **Document scope:** the user-facing walkthrough of NexFlow, organized by role. For each of the four primary roles (CEO/VP Sales, Sales Manager, Sales Team rep — AE / SDR, Marketing) we describe what they see on login, the modules they live in, the workflows step-by-step, the AI features available to them, and the KPIs they should track.
>
> Module names and paths follow the actual TopBar in `artifacts/nexflow/src/components/layout/TopBar.tsx`.

---

## 0. Common: what every role sees

After signing in, every user lands on the **Command Center** (`/`). The shell is identical across roles; it's the *content priority* and *field permissions* that change per role (configured in **Account Settings → Permissions**, see §A).

**The persistent header (`TopBar`)** has eight grouped mega-dropdowns:

1. **Home** — Command Center, Daily Insights, AI Assistant
2. **Sales** — Pipeline & Deals, Contacts, Companies, Account Hub (ABM), Quotes & CPQ, Forecasting, Card Scanner, Health Scores
3. **Call Center** — Call Dashboard, Calls & Transcripts, Power Dialer, Conversation Intel, AI Voice Agent, Knowledge Base, Email, Messages, WhatsApp
4. **Marketing** — Campaigns, Sequences, Marketing AI, Meetings, Templates, Audiences, Web Forms, Document Tracking, Quote-to-Cash, Cultural Intelligence
5. **Automation** — Workflow Builder, Automation Rules, Agent Builder, Lead Routing, Activity Capture
6. **AI Hub** — Lead Intelligence, AI Workforce, Predictive, Enrichment, Quick Enrich Lead, Signals, Sales Playbooks
7. **Insights** — Dashboards, Reports, Analytics, Team Performance, Attribution, Report Builder
8. **Data** — Lists, Segments, Deduplication, Migration, Properties

Right-cluster: global search (`⌘K`), notifications bell (red dot when unread > 0), dark-mode toggle, avatar menu with Account Settings / Capabilities / Sign out / DEMO MODE chip.

> 📷 *Screenshot placeholder:* `/` — Command Center landing with TopBar visible, Living Mesh background, daily-briefing hero card.

---

## 1. CEO / VP Sales

### 1.1 What they see on login

The Command Center hero shows a one-glance "state of the business":
- This week's revenue vs target (Sand `#C8A880` accent)
- Top 5 deals expected to close (with risk pill)
- Top risks flagged by AI (deals slipping, cold accounts)
- Team activity heatmap (calls + emails + meetings, last 7 days)

### 1.2 The modules they live in

| Frequency | Modules | Why |
| --- | --- | --- |
| **Daily** | Home → Command Center, Insights → Analytics, Insights → Dashboards | Pulse of the business. |
| **Weekly** | Sales → Forecasting, Insights → Team Performance, Insights → Attribution | Forecast accuracy, rep performance, marketing ROI. |
| **Monthly** | AI Hub → Predictive, Account Settings → Permissions | QBR prep + governance. |
| **As needed** | Sales → Account Hub, Call Center → Conversation Intel | Drill into a single account or a single call when something looks off. |

### 1.3 Key workflows (step-by-step)

#### Workflow 1.A — Morning briefing
1. Open `/`. Read the AI-generated briefing card at the top.
2. Click **"Open Insights"** → review any `critical` severity insight.
3. Click **"Brief me"** chip in the assistant if you want a 30-second voice summary.

> 📷 *Screenshot placeholder:* `/insights` — feed of severity-coded insight cards.

#### Workflow 1.B — Friday forecast review
1. Open **Sales → Forecasting**. Confirm the **Commit** number.
2. Drill into any deal flagged "high slip risk".
3. Open **Insights → Team Performance**, scan rep leaderboards.
4. From the Team page, click any underperforming rep's row → review their last 5 calls in **Conversation Intel**.

#### Workflow 1.C — QBR prep (quarterly)
1. Open **Insights → Attribution**, set window to "Last 90 days".
2. Switch model (first-touch / last-touch / U-shape) to compare.
3. Export the dashboard as PDF (top-right action).

### 1.4 AI features available to the CEO

- **Conversational assistant** (Home → AI Assistant). Ask: "What changed in my pipeline this week?" / "Which deals have lost momentum?"
- **AI Dashboard Generator** (Insights → Dashboards). Type "Show me revenue by segment, last 4 quarters" → instant dashboard.
- **Predictive** (AI Hub → Predictive). Quarter-end forecast with confidence band.
- **Insights feed** (Home → Daily Insights). Auto-flagged deal slips, cold accounts, hot signals.

### 1.5 KPIs to track

| KPI | Target | Where to find it |
| --- | --- | --- |
| Pipeline coverage (3× target) | ≥ 3.0 | Forecasting |
| Win rate | ≥ 25% | Analytics → Funnel |
| Avg sales cycle | trending down | Analytics → Cycle |
| CAC payback | ≤ 12 months | Attribution |
| Forecast accuracy | ±5% | Forecasting |
| Rep ramp time | ≤ 90 days | Team Performance |

### 1.6 Permissions (CEO / Admin)

By default the **Admin** role has `edit` on every field (deal value, commission %, recording URL, discount %). See **Account Settings → Permissions** matrix.

---

## 2. Sales Manager

### 2.1 What they see on login

Command Center filtered to **their team**: pipeline, deals stalled > 14 days, calls scheduled today, approvals pending (from the Permissions approval workflows), at-risk reps.

### 2.2 The modules they live in

| Frequency | Modules |
| --- | --- |
| **Daily** | Home → Command Center, Sales → Pipeline & Deals, Call Center → Call Dashboard |
| **Weekly** | Insights → Team Performance, Sales → Forecasting, Automation → Lead Routing |
| **As needed** | Call Center → Conversation Intel (rep coaching), Account Settings → Permissions (approvals) |

### 2.3 Key workflows (step-by-step)

#### Workflow 2.A — Morning standup prep
1. Open `/`. Confirm yesterday's deal movements.
2. Open **Sales → Pipeline & Deals**. Filter `Owner = my team`.
3. Hover any "stuck" deal — read the AI risk reason.
4. Tag deals to discuss in standup → bulk-create tasks for owners.

> 📷 *Screenshot placeholder:* `/funnel` — kanban with stage chips, owner avatars, AI risk pills.

#### Workflow 2.B — Approve a discount > 20%
1. Bell icon shows "1 approval pending" → click.
2. Approval card shows: deal, discount %, requesting rep, AI assessment of margin impact.
3. Approve / reject inline (one click). The originating quote auto-updates.

#### Workflow 2.C — Coach a rep on a call
1. Open **Call Center → Conversation Intel** → click rep.
2. Pick a recent low-sentiment call.
3. Read AI summary, talk-listen ratio, missed objections.
4. Click **"Send coaching note"** → rep gets a notification with timestamps.

#### Workflow 2.D — Routing change
1. Open **Automation → Lead Routing**.
2. Adjust round-robin weights or territory map.
3. Save → effective immediately on new inbound leads.

### 2.4 AI features available to Sales Managers

- **Conversation Intelligence** with AI talk-listen, sentiment, missed-objection detection.
- **Power Dialer** auto-prioritization (so the manager can hand a queue to a struggling rep).
- **Predictive** for individual deal slip probability.
- **Agent Builder** to create a "Discovery Coach" agent that auto-shadows reps.

### 2.5 KPIs to track

| KPI | Target | Where |
| --- | --- | --- |
| Team pipeline coverage | ≥ 3.0 | Forecasting |
| Activities per rep per day | ≥ 30 | Team Performance |
| Avg call sentiment | trend up | Conversation Intel |
| Approval response time | ≤ 4 h | Permissions / Notifications |
| Stalled deals (> 14 d) | ≤ 10% of pipeline | Pipeline filter |

### 2.6 Permissions (Sales Manager)

Default `edit` on every field — same as Admin. The Sales Manager is the named approver for **Discount > 20%**.

---

## 3. Sales Team — Account Executive (AE) and SDR

The two sub-roles share most of the surface but have different default permissions: AEs see deal values; **SDRs do not** see deal values, commission, or call recording URLs (per `permissions.tsx` defaults).

### 3.1 What they see on login

Command Center filtered to **them personally**:
- Today's call queue
- Today's meetings
- Top 3 priority leads (ranked by AI Lead Intelligence)
- New signals on accounts they own
- AI assistant invitation: "Want a 60-second briefing?"

### 3.2 The modules they live in

| Role | Daily | Weekly |
| --- | --- | --- |
| **AE** | Sales → Pipeline, Sales → Contacts, Call Center → Calls + Power Dialer, Home → AI Assistant | Sales → Forecasting (their slice), Sales → Quotes & CPQ, Marketing → Sequences |
| **SDR** | Call Center → Power Dialer, Sales → Contacts, AI Hub → Lead Intelligence + Quick Enrich Lead, Home → AI Assistant | AI Hub → Sales Playbooks, Marketing → Sequences |

### 3.3 Key workflows (step-by-step) — AE

#### Workflow 3.A — Working a deal
1. **Sales → Pipeline & Deals**. Drag the card to the next stage when criteria are met.
2. Open the deal, scroll the timeline (auto-populated by Activity Capture).
3. Click **"Generate next-best action"** → AI suggests a call, a follow-up email, or a stakeholder to involve.
4. From the AI suggestion, click **"Send"** → the email is drafted in the composer with the right template.

#### Workflow 3.B — Sending a quote
1. Open the deal → **Quotes & CPQ** tab.
2. Add line items. The system applies the role's discount limit (capped at 20% before approval).
3. Click **"Send quote"** → email goes via Resend; opens are tracked in **Document Tracking**.

#### Workflow 3.C — Logging a call
1. **Call Center → Power Dialer** → click "Start session".
2. Dialer auto-loads the prioritized list.
3. After the call, the AI fills the disposition + summary; AE confirms / edits.
4. Sentiment + transcript are saved to the contact's timeline.

> 📷 *Screenshot placeholder:* `/power-dialer` — queue card, in-call panel, post-call AI summary.

### 3.4 Key workflows (step-by-step) — SDR

#### Workflow 3.D — Working the queue
1. **Call Center → Power Dialer** → start session.
2. Hit numbers; if no-answer, move on.
3. After every connect: AI auto-disposition; SDR confirms BANT chips (Budget / Authority / Need / Timeline).
4. Qualified leads → click **"Hand to AE"** → routing rule fires.

#### Workflow 3.E — Quick enrichment
1. **AI Hub → Quick Enrich Lead**. Paste a name + company.
2. AI returns enriched profile (LinkedIn URL, role, tenure, recent posts, open headcount).
3. SDR clicks **"Add to CRM"** → contact created with enrichment metadata.

### 3.5 AI features available to the Sales Team

- **AI Assistant** — first stop for any "what should I do next?" question.
- **Lead Intelligence** — ranks today's calls.
- **Power Dialer** AI dispositioning + post-call summary.
- **Conversation Intelligence** for self-coaching (rep can re-listen with AI commentary).
- **Sales Playbooks** — pick a play, the AI customizes it to the account.
- **Marketing AI** for sequences (AE-only) — generate email variants.
- **Quick Enrich Lead** — single-shot AI enrichment.

### 3.6 KPIs to track

#### AE
| KPI | Target | Where |
| --- | --- | --- |
| Pipeline coverage (personal) | ≥ 3× quota | Forecasting (my slice) |
| Win rate | ≥ 25% | Analytics |
| Calls per day | ≥ 20 | Team Performance (self) |
| Deal velocity (days/stage) | trending down | Analytics → Cycle |

#### SDR
| KPI | Target | Where |
| --- | --- | --- |
| Dials/day | ≥ 80 | Power Dialer summary |
| Connects/day | ≥ 12 | Power Dialer |
| Qualified handoffs/week | ≥ 8 | Lead Routing log |
| Avg call sentiment | ≥ 0.4 | Conversation Intel |

### 3.7 Permissions (AE / SDR)

Per `permissions.tsx` defaults:

| Field | AE | SDR |
| --- | --- | --- |
| Deal value | `edit` | **`hidden`** |
| Win probability | `edit` | `view` |
| Contact email / phone | `edit` | `view` |
| Quote discount | `view` (manager edits) | `view` |
| Call recording URL | `edit` | **`hidden`** |
| User commission % | **`hidden`** | **`hidden`** |

---

## 4. Marketing

### 4.1 What they see on login

Command Center for marketing: campaigns running today, open / click rates last 7 days, leads generated by source, AI insights about underperforming sequences, top content by engagement.

### 4.2 The modules they live in

| Frequency | Modules |
| --- | --- |
| **Daily** | Marketing → Marketing AI, Marketing → Campaigns, Marketing → Sequences |
| **Weekly** | Insights → Attribution, Marketing → Audiences, Marketing → Document Tracking |
| **Monthly** | Marketing → Cultural Intelligence (calendar planning), Marketing → Templates |

### 4.3 Key workflows (step-by-step)

#### Workflow 4.A — Launch an email campaign
1. **Marketing → Campaigns** → "New campaign".
2. Pick the **Audience** (from Audiences module) or build one inline.
3. Open **Marketing AI** → ask "Write 3 subject-line variants for [audience]" → pick winner.
4. Generate hero image with AI (chameleon-aware so brand stays on tone).
5. Schedule → Resend dispatches.

> 📷 *Screenshot placeholder:* `/marketing-assistant` — chat panel with subject-line variants and a generated hero.

#### Workflow 4.B — Cultural intelligence aware send
1. **Marketing → Cultural Intelligence**. Confirm the next 30-day calendar (Ramadan, Eid, National Days).
2. Marketing AI auto-blocks send-times during prayer windows for KSA / UAE / Bahrain audiences.
3. Send-time AI chooses optimal slot in the audience's local TZ.

#### Workflow 4.C — Build a sequence
1. **Marketing → Sequences** → "New sequence".
2. Define steps (Day 0 email, Day 3 follow-up, Day 7 LinkedIn task, Day 10 SDR call).
3. Variant A/B subject lines via Marketing AI.
4. Plug into a workflow (Automation → Workflow Builder) so a form submission auto-enrolls.

#### Workflow 4.D — Attribution review
1. **Insights → Attribution** → choose model (W-shape recommended for B2B).
2. Filter by campaign / source.
3. Identify highest-yield channel; reallocate next month's budget.

### 4.4 AI features available to Marketing

- **Marketing AI** (`/marketing-assistant`) — assistant that writes copy, subject lines, segments, and generates hero images.
- **AI Dashboard Generator** — same NL→dashboard as the CEO uses.
- **Cultural Intelligence** — region-aware send rules + content review.
- **Marketing Extras API** — segment-level AI insights (best send-time, predicted open).
- **Audience builder** with AI-suggested filters.

### 4.5 KPIs to track

| KPI | Target | Where |
| --- | --- | --- |
| MQLs / month | per plan | Campaigns + Audiences |
| Email open rate | ≥ 35% | Campaigns |
| Email click-through | ≥ 5% | Campaigns |
| Cost per MQL | trending down | Attribution |
| Marketing-sourced pipeline | ≥ 40% of total | Attribution |
| Sequence completion rate | ≥ 50% | Sequences |

### 4.6 Permissions (Marketing)

Marketing reps see contact + company data and campaign metrics. By default they `view` deal values (don't edit). Adjustable in **Account Settings → Permissions**.

---

## A. Cross-cutting: Account Settings & approval workflows

Path: `/account-settings`. Sections grouped as ACCOUNT / DATA & FIELDS / SECURITY & TRUST / PLATFORM, with a search filter at the top.

- **Permissions** (`/account-settings/permissions`) — field-level matrix per role: `edit / view / hidden`. Click any cell to cycle modes. Save persists to `localStorage` (today) → server persistence is a Phase-1.5 hardening item.
- **Approval workflows** — high-value actions require named approvers:
  | Action | Approver | Default |
  | --- | --- | --- |
  | Discount > 20% | Sales Manager | active |
  | Quote > $250K | VP Sales | active |
  | Custom MSA terms | Legal + VP Sales | active |
  | Refund > $5K | Finance | active |
  | Delete contact | Admin | active |
  | Bulk export > 1000 rows | Admin | off (toggle on) |
- **Properties** — register custom fields (text, long_text, number, date, boolean, select, multiselect, url, email, phone) on contact / company / deal.
- **Trust Center / Public Trust** — internal compliance overview + customer-facing trust page (opens in new tab, not embedded).
- **Migration** — CSV import/export wizard.
- **Capabilities** — what's enabled vs. roadmap.

---

## B. Cross-cutting: AI assistant invocation patterns

The AI assistant is reachable from three places in every role:

1. **Home → AI Assistant** (`/assistant`) — full chat surface with suggestion chips.
2. **TopBar `⌘K`** — inline command palette; can pivot a question to chat.
3. **Inline "Generate" / "Improve" buttons** — on Marketing AI, Agent Builder, Report Builder, Dashboards, Quotes.

All paths converge on `aiChat` / `aiJson` in `artifacts/api-server/src/lib/ai.ts` (see `docs/02-tech-stack.md` §7). All AI calls degrade gracefully — if the upstream provider is down, the UI falls back to a non-AI flow rather than throwing.

---

## C. Mobile companion

The mobile app (`artifacts/mobile`) reuses the typed API client from `@workspace/api-client-react`. Bottom tabs: Home / Contacts / Pipeline / Calls / Agents. The most-common on-the-go actions:

- Log a call (Calls tab).
- Move a deal stage (Pipeline tab).
- Quick-enrich a contact via name / business card (Contacts tab → +).
- Receive push notifications for AI insights and approval requests.

Same role-based field permissions apply.
