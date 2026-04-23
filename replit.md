# NexFlow CRM

## Overview

NexFlow is an AI-native B2B CRM built as a React + Vite frontend with an Express/Drizzle/PostgreSQL backend in a pnpm monorepo.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (artifact: `nexflow`, port 18153, preview path `/`)
- **Backend**: Express 5 (artifact: `api-server`, port 8080, routes at `/api/...`)
- **Database**: PostgreSQL + Drizzle ORM (`lib/db`)
- **Validation**: Zod v4, drizzle-zod
- **API codegen**: Orval (OpenAPI → typed hooks, `lib/api-spec/`)
- **Build**: esbuild (API server)

## Architecture

```
artifacts/
  nexflow/          → React + Vite frontend (CRM UI)
  api-server/       → Express API backend (REST)
lib/
  db/               → Drizzle schema + migrations
  api-spec/         → OpenAPI spec + Orval codegen
  api-zod/          → Generated Zod schemas
```

## Dev Proxy

The Vite dev server proxies `/api-server` → `http://localhost:8080`, rewriting the path.
In the frontend, API calls go to `${origin}/api-server/api/<endpoint>`.

## 17 Modules & Pages

| Route | Page | Backend Route |
|-------|------|--------------|
| `/` | Dashboard | `/api/dashboard/*` |
| `/contacts` | Contacts | `/api/contacts` |
| `/companies` | Companies | `/api/companies` |
| `/deals` | Deals Kanban | `/api/deals` |
| `/signals` | Buying Signals | `/api/signals` |
| `/activities` | Activity Timeline | `/api/activities` |
| `/calls` | Call Intelligence | `/api/calls` |
| `/scripts` | Sales Scripts | `/api/scripts` |
| `/segments` | Segments | `/api/segments` |
| `/notifications` | Notifications | `/api/notifications` |
| `/analytics` | Analytics | `/api/analytics/*` |
| `/ai` | AI Agents | `/api/ai/agents` |

## 10 AI Agents

Signal Scanner, Lead Scorer, Call Coach, Script Writer, Prospect Researcher, Deal Predictor, Objection Handler, Follow-up Writer, Segment Builder, Compliance Checker

## Database Schema (9 tables)

`contacts`, `companies`, `deals`, `activities`, `signals`, `segments`, `calls`, `scripts`, `notifications`

## Brand System — NexFlow Full Blend

- **Palette (Chameleon)**: `#B8A0C8` (primary), `#C0A0B8`, `#88B8B0` (growth), `#C8A880` (wealth), `#90B8B8`, `#B8B880`
- **Living Mesh**: 10 animated radial gradient nodes (CSS classes `.n1`–`.n10`)
- **Animations**: Chameleon text/bg/border, Pulse logo mark, glassmorphism cards
- **CSS classes**: `.nf-chameleon-text`, `.nf-chameleon-bg`, `.nf-chameleon-border`, `.glass-card`, `.glass-panel`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Seed Data

Rich sample data pre-seeded: 8 contacts (GCC-focused), 6 companies (Saudi/UAE), 7 deals ($9.5M+ pipeline), 6 signals, 8 activities, 4 calls, 4 scripts (including Arabic), 6 notifications, 4 segments.

## HubSpot-class Upgrade (April 2026)

### Phase A — AI Foundation
- `users` table with `owner_id` FK on contacts/companies/deals
- Companies are clickable → `/companies/:id` showing **AI Company Intelligence** (summary, news, buying signals, key people, tech stack, competitors, outreach angles, risks). Cached 24h with concurrent-request dedupe.
- AI plumbing: `lib/ai.ts` routes via OpenRouter → OpenAI fallback; `lib/email.ts` uses Resend (org-managed connector).

### Phase B — Records & Filters
- `custom_properties` + `custom_property_values` tables; `/properties` UI with type-aware editor (text/number/date/select/multiselect/etc.)
- `static_lists` + `static_list_members`; `/lists` and `/lists/:id` with member add/remove
- `saved_views` + `/views` API for re-usable filtered views
- `/api/ai/contacts/bulk-enrich` capped at 50 per request

### Phase C — Pipeline Intelligence
- `/funnel` with stage-by-stage conversion + value (`/api/ai/funnel`)
- `/api/ai/auto-advance-stages` moves qualified→proposal when a meeting completes
- `/call-list` page with AI-prioritized contacts categorized hot/warm/retry/cold using SQL: `lead_score * 0.5 + recency + signal velocity`

### Phase D — Reporting
- `dashboards` + `dashboard_widgets`; `/dashboards` and `/dashboards/:id` with widget renderer (metric, funnel, leaderboard)
- `/api/dashboards/widget-data` aggregator backs every widget
- AI report builder (`/api/ai/report-builder`) converts NL → widget spec
- `/insights` page with `/api/ai/insights/daily` generating 5 cached daily AI briefings (categories: pipeline, conversion, engagement, market_context, risk)

### Phase E — Engagement Engine
- `campaigns` + `campaign_recipients`; `/campaigns` page with multi-channel support
- `/api/campaigns/:id/generate-content` produces subject + HTML body via AI
- `/api/campaigns/:id/send` delivers via Resend with tracking pixel injection
- `/api/tracking/{pixel,visit,form-submit}` updates `last_engaged_at` and creates signals
- `automation_rules` + `automation_runs`; `/api/automations/:id/run` executes
- `/api/ai/post-call/:callId` orchestrator generates next-best-action activities (WhatsApp, retry tasks, follow-up emails)
- `ai_agents` + `ai_agent_runs`; `/agents` Agent Builder lets users define custom system prompts and run them

### Architecture notes
- All new tables use uuid PKs (`gen_random_uuid()`) matching existing schema
- All AI calls degrade gracefully — fallbacks ensure routes never crash if a provider is unavailable
- New nav groups in sidebar: Records (Lists/Properties), Engage (Campaigns/Today's Calls), AI Workforce (Agent Builder/Daily Insights), Insights & Ops (Dashboards)

### Phase F — Mobile Live Data
- `artifacts/mobile/lib/api.ts` provides `apiFetch` + TanStack Query hooks (useContacts, useContact, useDeals, useAgents, useDashboardSummary, useTopContacts, usePipelineByStage, useSignalSummary, useContactActivities)
- API base URL derived from `EXPO_PUBLIC_DOMAIN` → `https://${domain}/api-server/api`
- All four tabs (Briefing, Pipeline, Contacts, Agents) + Contact Detail now consume live API instead of mockData
- CORS workaround: `apiFetch` omits `Content-Type` on GETs to keep them as "simple" requests and skip preflight (the workspace proxy strips `Access-Control-Allow-Origin` from OPTIONS responses)
- `artifacts/api-server/src/app.ts` updated to `cors({ origin: true })` so the GET response reflects the request origin

### Phase G — Mobile Mutations + AI Quick Log
- First mobile→API write loop: tapping "Call" on a contact opens a Quick Log bottom sheet (`QuickLogSheet` in `app/contact/[id].tsx`) with outcome chips, duration presets, and a notes field
- New `useLogCall` mutation hook in `lib/api.ts` posts to `/api/calls/log`; on success it switches the active tab to "Activity" and invalidates the activities query
- `apiPost` helper sends bodies as `text/plain;charset=UTF-8` — a CORS-safe content type — so POSTs stay "simple" requests and bypass the workspace proxy's broken OPTIONS preflight
- `app.use(express.json({ type: ["application/json", "text/plain"] }))` lets the API server parse those bodies as JSON
- `/api/calls/log` now: (1) inserts the call row, (2) calls AI to polish raw notes into a concise activity title + body, (3) inserts an `activities` row of type `call`, (4) when `run_orchestrator: true`, asks AI to generate next-best actions and inserts each as a pending `activities` row (whatsapp/task/email/meeting). All AI calls have safe fallbacks.
- Result: rep types brain-dump notes on mobile → AI produces a polished activity entry + 2-3 follow-up tasks, all visible in the contact timeline immediately
