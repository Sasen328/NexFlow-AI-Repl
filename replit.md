# NexFlow CRM

## Overview

NexFlow is an AI-native B2B CRM built as a React + Vite frontend with an Express/Drizzle/PostgreSQL backend in a pnpm monorepo.

## UI Theme

- **Light mode default** with a vibrant cotton candy / pastel mesh gradient
- Background: near-white with lavender hue (HSL 280 30% 99%)
- 10 animated mesh gradient nodes in lavender, teal, amber, and mint
- Glassmorphism cards: rgba(255,253,255,0.78) with blur and soft border
- Chameleon gradient: #B8A0C8 → #C0A0B8 → #88B8B0 → #90B8B8 → #B8B880 → #C8A880
- Dark mode available via toggle

## Auto-Seed (Production Data)

`artifacts/api-server/src/lib/autoSeed.ts` runs on every API server cold-start.
It checks if the `contacts` table is empty and, if so, inserts a full set of demo data:
- 4 users, 6 companies, 8 contacts (with lead scores 58–92)
- 7 deals across all pipeline stages, 6 signals, 8 activities, 5 calls, 6 notifications
- 3 AI agents, 3 campaigns, 3 automation rules, 7 custom properties, 4 static lists, 1 dashboard

This ensures the production database is never empty after a fresh deploy.
The guard is idempotent — it does nothing if data already exists.

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

### Phase H — Mobile Pipeline Mutations (Tap-to-Advance)
- New endpoint `POST /api/deals/:id/advance` in `artifacts/api-server/src/routes/deals.ts`. Accepts optional `{to_stage}`; if omitted, advances to the next stage in `lead → qualified → proposal → negotiation → closed_won`. Auto-sets probability per stage (20/40/60/80/100, closed_lost=0) and inserts an `activities` row (type `note`, source `deal_advance`) on the contact's timeline (`Stage advanced: X → Y`, `Deal won:`, or `Deal lost:`).
- New `useAdvanceDeal` mutation hook in `artifacts/mobile/lib/api.ts` invalidates `deals`, `dashboard`, and `pipeline-by-stage` queries on success.
- `artifacts/mobile/app/(tabs)/pipeline.tsx`: deal cards are now tappable. Tap opens a `DealActionSheet` modal showing the deal title, stage, value, and probability. Two CTAs: "Advance to <NextStage>" (teal primary) and "Mark Closed Lost" (muted secondary). Terminal-stage deals show a non-actionable confirmation. Errors surface inline. Sheet uses the same text/plain CORS workaround via `apiPost`.
- Verified e2e (runTest passed): advancing moves a deal between columns with the correct new probability, marking closed lost removes it from all five visible stage columns, and the corresponding activity row appears on the contact timeline.

### Phase I — AI Everywhere + Working CRUD (Web)
- New backend routes in `artifacts/api-server/src/routes/ai-extra.ts`:
  - `POST /api/ai/lists/generate` — AI generates a contact list with explanation
  - `POST /api/ai/properties/suggest` — Suggests custom properties from a NL prompt (one-click add)
  - `POST /api/ai/segments/generate` — Translates NL criteria → Postgres WHERE; saves as a segment
  - `GET /api/ai/segments/:id/members` — Returns up to 100 contacts matching the stored filter
  - `POST /api/ai/companies/draft` — Drafts industry/size/description/HQ/tech from name+domain
  - `POST /api/ai/contacts/import-csv` — Parses pasted CSV, AI-enriches each row, bulk-inserts
  - `POST /api/ai/calls/:id/analyze` — Generates transcript, objections, topics, talk-ratio, coaching
  - `GET /api/ai/forgotten-leads` — High-score contacts gone silent ≥14d, with one-line AI risk summary
  - `POST /api/ai/agents/draft` — Drafts a full agent (system prompt, schedule, tools) from a description
- Safety: `isSafeFilter()` blocks `;`, comments, DDL/DML keywords, `union select` in AI-generated SQL filters; queries are wrapped in `(...)` and validated with a count probe before persisting.
- Web pages got working modals + AI on every CRUD button:
  - `companies.tsx` NewCompanyModal (auto-enrich button); empty enum strings now stripped client-side
  - `deals.tsx` NewDealModal + DealDetailDrawer with stage-move + delete; reads flattened `contact_name` / `company_name` (legacy nested still supported)
  - `segments.tsx` AI NewSegmentModal + SegmentDrawer
  - `lists.tsx` AiGenerateListModal
  - `properties.tsx` AiSuggestModal with one-click add
  - `intelligence.tsx` CSV import + ForgottenLeadsPanel
  - `voice-agents.tsx` NewAgentModal (AI draft) + AgentRunDrawer using real `useAgents`
  - `calls.tsx` CallDetailModal with `useAnalyzeCall` (transcript / objections / talk-ratio / coaching)
  - `briefing.tsx` (home `/`) Forgotten-Leads panel + Regenerate AI insights
- `useApi.ts`: `useCreate/useUpdate/useDelete` now invalidate each query key separately (multi-key arrays work correctly).
