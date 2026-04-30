# NexFlow — Frontend & Backend

> Two TypeScript codebases joined by an OpenAPI contract.

---

## A. Frontend (`artifacts/nexflow`)

### A.1 Stack

- **React 18** + **TypeScript 5**
- **Vite 7** build → static SPA served at `/`
- **Tailwind v4** + **shadcn/ui** components
- **wouter** for routing
- **TanStack Query v5** + generated hooks from `@workspace/api-react-query`
- **Framer Motion** for calm transitions
- **Recharts** for KPI / attribution / forecast charts
- **Web Speech API** (with `lib/voice.ts` Gulf voice selection)

### A.2 Folder layout

```
artifacts/nexflow/
├── public/                  # Logos, favicons
├── src/
│   ├── App.tsx              # Routes + ProtectedAppLayout auth gate
│   ├── main.tsx             # Vite entry
│   ├── index.css            # Tailwind + tokens
│   ├── pages/               # 60+ pages (one per route)
│   ├── components/
│   │   ├── AIAssistantBubble.tsx     # Floating bubble; STT/TTS lang toggle
│   │   ├── briefing-360.tsx          # 360° AI briefing card
│   │   ├── briefing-tab-extras.tsx   # Briefing tab supplementary widgets
│   │   ├── enrichment/               # Enrichment UI cards
│   │   ├── layout/                   # TopBar, Sidebar, ProtectedAppLayout
│   │   ├── marketing/                # Marketing-specific cards
│   │   ├── push-to-crm.tsx           # CTA for converting captures to records
│   │   ├── ui/                       # shadcn primitives
│   │   └── VoiceCallModal.tsx        # In-call UI
│   ├── hooks/
│   │   └── useApi.ts        # apiFetch contract (parses JSON, throws on non-2xx)
│   ├── lib/
│   │   ├── voice.ts         # pickVoice() Gulf voice selection
│   │   ├── sections.ts      # Section nav definitions per role
│   │   ├── marketing-auth.ts # signInAs(persona) demo flow
│   │   └── ...
│   └── styles/
└── vite.config.ts           # PORT/BASE_PATH defaults to 3000 / "/"
```

### A.3 Routing

- **Public**: `/`, `/welcome`, `/about`, `/pricing`, `/signin`, `/signup`, `/investors`
- Everything else → `ProtectedAppLayout` redirects to `/signin` if not signed-in
- Section structure in `lib/sections.ts`:
  - **Home** — Briefing, Command Center, Predictive
  - **CRM** — Contacts, Companies, Deals, Activities, Calls, Pipelines
  - **Marketing** — Workspace, Dashboard, Campaign Builder, Sequences/Audiences, Web Forms, Performance
  - **Service** — Call Center (Agent, Dashboard, Knowledge Base, Messages), Conversation Intelligence
  - **Engines** — Lead Finder, Masaar, Prosengine Person/Company, Cultural Intelligence
  - **Analytics** — Dashboards, Attribution, DataHub
  - **Automations** — Builder, Approvals, Audit
  - **Settings** — Account, Permissions, Capabilities, Channels

### A.4 The Ask AI surface (unified)

- `AIAssistantBubble` listens for the `nf:open-assistant` CustomEvent and accepts an optional `detail.text` to auto-submit
- Command Center's "Ask AI" button dispatches `nf:open-assistant`
- Predictive page hosts an inline panel wired to the same `/api/ai/assistant` orchestrator via `apiFetch`
- AR/EN toggle in the bubble toolbar persists `nf:assistant:lang` in localStorage and switches both STT (`en-US` ↔ `ar-AE`) and TTS voice
- Gulf TTS voices preferred via `pickVoice()` — Zariyah/Hala/Layla (female), Tarik/Naayf/Omar (male)

### A.5 Build

```bash
pnpm --filter @workspace/nexflow run dev    # dev (workflow injects PORT/BASE_PATH)
pnpm --filter @workspace/nexflow run build  # production build → dist/public
```

`vite.config.ts` defaults `PORT` to `3000` and `BASE_PATH` to `/` so production builds succeed without runtime env vars.

---

## B. Backend (`artifacts/api-server`)

### B.1 Stack

- **Node 22** (ESM) + **TypeScript 5**
- **Express 5** + **pino-http** structured logging
- **Drizzle ORM** + **Postgres 16**
- **Zod** validation (generated from OpenAPI)
- **esbuild** bundle → single `dist/index.mjs`
- **Resend** for email · **Playwright** in scraper artifact

### B.2 Folder layout

```
artifacts/api-server/
├── build.mjs                # esbuild builder; copies seed/ → dist/seed/
├── seed/
│   └── schema.sql           # Schema dump used for prod bootstrap
├── src/
│   ├── index.ts             # Boot: ensureSchema → autoSeed → app.listen
│   ├── app.ts               # Express app, middlewares, route mount
│   ├── lib/
│   │   ├── ai.ts            # Multi-agent orchestrator
│   │   ├── autoSeed.ts      # ensureSchema + seed demo data on cold start
│   │   ├── email.ts         # Resend wrapper
│   │   ├── logger.ts        # pino singleton
│   │   ├── engines/         # Engine runtimes (Lead Finder, Masaar, Prosengine, AI helpers)
│   │   └── enrichment/      # Connectors (Hunter/Apollo/Lusha) + waterfall
│   ├── middlewares/         # Auth, CORS, request logging
│   └── routes/              # 50+ route files (REST endpoints)
└── .replit-artifact/artifact.toml
```

### B.3 Routes (selected)

| Route | Purpose |
|-------|---------|
| `/api/healthz` | Health probe |
| `/api/ai/assistant` | Multi-agent orchestrator entry |
| `/api/marketing/assistant-chat` | Marketing Ask AI (JSON-strict) |
| `/api/marketing/generate-image` | Campaign visual generator |
| `/api/marketing/publish/:campaignId` | Multi-channel publisher |
| `/api/contacts` · `/api/companies` · `/api/deals` | Core CRM CRUD |
| `/api/activities` · `/api/calls` · `/api/notifications` | Engagement |
| `/api/agents` · `/api/agent-runs` | Agent registry + run history |
| `/api/dashboards` · `/api/widgets` | Dashboards |
| `/api/automations` · `/api/automation-runs` | Automations |
| `/api/engines` · `/api/lead-enrich` | Engines & enrichment |
| `/api/enrichment-sources` | Connector registry |
| `/api/signals` · `/api/health-scores` | Signals + health |
| `/api/segments` · `/api/lists` · `/api/views` | Segmentation |
| `/api/campaigns` · `/api/campaign-recipients` | Campaigns |
| `/api/playbooks` · `/api/scripts` | Sales playbooks |
| `/api/power-dialer` | Dialer queue |
| `/api/conversation-intelligence` · `/api/redaction` | Call analytics |
| `/api/business-cards` | OCR business card capture |
| `/api/investors` | Investor portal (passcode-gated) |
| `/api/seed-extra` | Demo data extender |

### B.4 Boot sequence

1. `ensureSchema()` — checks if `contacts` table exists with `to_regclass`; if missing, replays `seed/schema.sql`
2. `seedSources()` — idempotent ON CONFLICT DO NOTHING for enrichment sources
3. `autoSeed()` — counts contacts; if `< 30` rows, wipes seed tables and reseeds the canonical demo dataset
4. `app.listen(PORT)` — server starts handling requests
5. Logs via pino: `INFO Server listening port=8080`

### B.5 Build & run

```bash
pnpm --filter @workspace/api-server run dev    # Local dev
pnpm --filter @workspace/api-server run build  # esbuild → dist/index.mjs + dist/seed/
node dist/index.mjs                            # Production (driven by artifact.toml)
```

### B.6 Logging convention

- **Never** use `console.log` in server code
- Inside route handlers: `req.log.info({ ... }, "message")`
- Outside requests: `import { logger } from "./lib/logger"; logger.info(...)`

### B.7 Database access

- All queries via Drizzle (`@workspace/db`)
- `DATABASE_URL` is the only required env; `pg.Pool` connection cached
- Schema, types and re-exports come from `@workspace/db/schema`
