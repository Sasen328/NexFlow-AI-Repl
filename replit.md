# NexFlow

Universal AI-native B2B CRM for GCC markets. pnpm monorepo with multiple artifacts:
web app (`nexflow`), API server, mobile (Expo), mockup sandbox, two slide decks,
and a marketing video.

## Demo personas (Marketing Lead's path-of-least-resistance)

The web app ships with 5 click-to-sign-in personas defined in
`artifacts/nexflow/src/lib/marketing-auth.ts`. Each persona re-tunes the
`/home` AI Briefing copy and KPI tiles via `PERSONA_BRIEFINGS` in
`artifacts/nexflow/src/pages/briefing.tsx`.

| Key       | Name              | Role                           |
| --------- | ----------------- | ------------------------------ |
| sales     | Khalid Al-Otaibi  | Senior Sales Executive         |
| manager   | Layla Al-Sabah    | Head of Sales · Gulf Region    |
| ceo       | Faisal Al-Harbi   | CEO                            |
| admin     | Sara Al-Mansouri  | CRM Operations Lead            |
| marketing | Reem Al-Qahtani   | Head of Marketing              |

- `signInAs(key)` writes `nf_role` + `nf:signedIn=1` and dispatches a
  `nf:role-change` CustomEvent so all open components re-render.
- `TopBar` avatar shows the active persona and exposes a switcher.
- `Auth.tsx` shows the persona pills above the email/password form.

## Auth gate

Public routes: `/`, `/welcome`, `/about`, `/pricing`, `/signin`, `/signup`,
`/investors`. Everything else falls through to `ProtectedAppLayout` in
`App.tsx`, which redirects to `/signin` when `isSignedIn()` is false.

## Marketing section (in-app)

`lib/sections.ts` defines the Marketing tab. Meetings and Quote-to-Cash were
removed; a new "Channels & Publishing" page (`pages/channels.tsx`) lets the
user push a single composition to LinkedIn / X / Instagram / Facebook /
WhatsApp / Email / SMS in one click. The Composer modal is fully accessible
(`role="dialog"`, `aria-modal`, focus trap, Escape to close, focus restoration).

## CRM section structure (revised April 2026)

`lib/sections.ts` defines section nav. CRM section now has, in order:

- CRM Workspace (`/section/crm`) — workspace landing page (auto-rendered by `section-hub.tsx`)
- CRM Dashboard (`/crm-dashboard`) — KPIs + AI briefing + lead-stage strip + quick actions
- Pipeline (`/pipeline`) — pre-SAL lead funnel + AI gap analysis + stuck leads + drill-down panel
- Deal Pipeline (`/deal-pipeline`) — wraps existing `DealsPage` kanban with AI stage analysis header
- Contacts
- Engagement Activities (`/engagement`) — sub-tabs (All / Calls / Meetings) reusing `ActivitiesPage` / `CallsPage` / `MeetingsPage` + channel quick-jump
- Companies & Accounts (`/companies`) — internal tab switcher: Companies grid (beefed-up with employees, funding stage, deals count, last engagement) + Account Hub (embeds `AccountsPage`)
- Forecasting

Quotes & CPQ and Health Scores moved to "Data Tools / More".
CRM, Contact Center, and Enrichment all `defaultHref` to `/section/{key}`
with a "Workspace Home" first item that points back to the section landing.

`/funnel`, `/deals`, `/accounts`, `/activities`, `/calls`, `/meetings`
are kept as aliases so legacy links and the old hubs still resolve.

## Home: Daily Briefing + Command Center

`pages/briefing.tsx` (mounted at `/briefing` and shown as Home) now has just
two tabs:

- **Daily Briefing** — AI summary, performance KPIs, agenda, signals,
  re-engagement opportunities, "Next Best Action" call cards.
- **Command Center** — `CommandLauncher` action grid (Log Call Note, Send
  WhatsApp, Send Email, Schedule Follow-up, AI Voice Call, Coaching Session,
  Generate List, Scoring & Gaps Report) followed by the AI tasks list and AI
  insights.

Action launcher buttons either deep-link (`/voice-agents`, `/coaching`,
`/lists`, `/pipeline`) or POST a synthetic activity to `/activities` so the
launcher is instantly demoable.

## Contact Center section (revised April 2026)

`lib/sections.ts` Contact Center now has 5 items (in order):

- **Workspace** (`/section/callcenter`) — section landing
- **Power Dialer** (`/power-dialer`) — `pages/power-dialer.tsx`. Three modes
  (Manual / Auto-Dial / AI Agent), pre-call brief w/ score-based tips, ringing
  → connected → ended phases, live streaming transcript (TRANSCRIPT_SCRIPT mock
  played line-by-line), `LiveCoachPanel` sidebar with objection detection, and
  a post-call AI panel that one-click pushes a call note + follow-up task +
  reminder + WhatsApp draft + email draft. AI Agent mode calls
  `/power-dialer/voice-agent-call` then renders the live transcript view.
  Auto-dial mode auto-logs voicemail/no-answer outcomes and advances the queue.
- **Calls & Transcripts** (`/calls`) — `CallsPage` wraps the original call
  scoring view (`CallScoringView`) with two top-level tabs: "Call Scoring &
  Action Plans" and "Conversation Intel" (lazy-loads
  `pages/conversation-intelligence.tsx`).
- **Post-Call Automation** (`/post-call-automation`) — NEW
  `pages/post-call-automation.tsx`. Sub-tabs: Approval Queue (AI-drafted
  WhatsApp/Email cards with Approve / Edit / Reject and Arabic RTL support),
  Cadence Rules (toggleable triggers like "Call · No answer → AI WhatsApp"),
  and embedded Email / WhatsApp / Unified Inbox tabs that lazy-load existing
  pages.
- **Call Dashboard** (`/call-analytics`)
- **Contact Center Setup** (`/contact-center-setup`) — NEW
  `pages/contact-center-setup.tsx`. Sub-tabs: Overview (3 health cards + voice
  library + AI agent authority toggles), AI Voice Agent (lazy-embeds
  `voice-agents.tsx`), Knowledge Base (lazy-embeds `scripts.tsx`'s
  `KnowledgeBasePage`), Guardrails & Redaction (lazy-embeds
  `call-redaction.tsx`).

Legacy routes `/voice-agents`, `/scripts`, `/call-redaction`, `/email`,
`/messages`, `/whatsapp`, `/conversation-intelligence` remain mounted in
`App.tsx` for direct deep-links and so the embedded sub-tabs resolve.

## Enrichment section (revised April 2026)

`lib/sections.ts` Enrichment section now exposes only **2** items:

- **Enrichment Workspace** (`/section/enrichment`) — the section landing /
  dashboard, auto-rendered by `section-hub.tsx` from `CONTENT.enrichment`.
- **Enrichment Engine** (`/enrichment-engine`) — NEW
  `pages/enrichment-engine.tsx`. Single consolidated page with 7 sub-tabs:
  - **Prospecting** — search the seed database by company OR persona;
    multi-select dropdown of enrichment signals to pull (grouped by Contact /
    Profile / Company / Buying signals / Social) plus a custom-signal input;
    company search returns the people-grid with per-row Enrich + Enrich-all.
    Switching mode clears stale results; the result header reads from the
    stored mode (not the live mode toggle).
  - **Buying Signals** — channel-mapping panel (LinkedIn, X, Wamda, MoCI, PR
    Newswire, Reuters, Argaam, custom RSS) with on/off toggles and an
    add-channel form, followed by the lazy-loaded existing `SignalsPage` feed.
  - **Quick Lead Enrich** — lazy-embeds `lead-enrich.tsx`.
  - **Card Scanner** — lazy-embeds `business-cards.tsx`.
  - **List Upload** — phase machine `upload → deduping → questionnaire →
    queued`. After dedup runs, a 5-question droplist (data fields needed,
    profiling depth, signal pack, dedup-survivor preference, optional batch
    tag) gates the "Queue for enrichment" action.
  - **Deduplication** — lazy-embeds `dedup.tsx`.
  - **Search History** — filterable seed list (All / Company / Person / List /
    Card scans). Re-run pipes the query back into the matching tab via the
    parent's `prospectSeed` state and a `useEffect` consumer in
    `ProspectingTab`. Delete is row-local.

Bulk Enrichment, Quick Enrich Lead, Card Scanner, Buying Signals, and Lead
Intelligence are **no longer separate nav items**. The standalone routes
(`/sourcing`, `/signals`, `/lead-enrich`, `/business-cards`, `/dedup`,
`/intelligence`) remain mounted in `App.tsx` so legacy deep-links resolve and
so the Engine's lazy embeds work.

## Workflows

Run via the Replit workflow panel — never `pnpm dev` at root.
`artifacts/nexflow: web` is the main app; restart it after Vite-relevant changes.
