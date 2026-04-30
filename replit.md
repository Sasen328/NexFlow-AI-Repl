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

## Workflows

Run via the Replit workflow panel — never `pnpm dev` at root.
`artifacts/nexflow: web` is the main app; restart it after Vite-relevant changes.
