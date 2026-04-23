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
