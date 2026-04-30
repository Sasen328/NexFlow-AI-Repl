# NexFlow — Tech Stack

> One TypeScript codebase, contract-first APIs, calm UI, agent-native AI.

---

## 1. Top-level architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                  Replit Edge Proxy (mTLS, path routing)          │
└──────────────────────────────────────────────────────────────────┘
        │ /                  │ /api               │ /mobile
        ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  NexFlow CRM     │  │  API Server       │  │  NexFlow Mobile  │
│  React + Vite    │  │  Express + Pino   │  │  Expo / RN       │
│  (static SPA)    │  │  Drizzle ORM      │  │  React Native    │
└──────────────────┘  └────────┬──────────┘  └──────────────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
          ┌──────────┐  ┌──────────┐  ┌──────────────────┐
          │ Postgres │  │ AI       │  │ Channel          │
          │ (Replit) │  │ Providers│  │ Providers        │
          └──────────┘  │ OpenAI   │  │ Resend, Twilio,  │
                        │ Anthropic│  │ Meta WA, LI, X   │
                        │ Perplex. │  └──────────────────┘
                        └──────────┘
```

## 2. Monorepo layout (pnpm workspace)

```
nexflow/
├── artifacts/                # Deployable apps
│   ├── nexflow/              # CRM web (React + Vite)
│   ├── api-server/           # Express + Drizzle backend
│   ├── mobile/               # Expo React Native app
│   ├── company-profile-deck/ # Slide deck (Vite)
│   ├── investor-deck/        # Slide deck (Vite)
│   ├── marketing-demo-video/ # Animated video (Vite + GSAP/R3F)
│   ├── mockup-sandbox/       # Component preview server
│   └── enrichment-scraper/   # Long-running scraper worker
├── lib/
│   ├── db/                   # Drizzle schema + Postgres client
│   ├── api-spec/             # OpenAPI source
│   ├── api-zod/              # Zod schemas (codegen output)
│   └── api-react-query/      # Generated React Query hooks
├── scripts/                  # Shared utility scripts
├── docs/                     # ← You are here
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## 3. Frontend

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | **React 18** | Strict mode |
| Build | **Vite 7** | Per-artifact `vite.config.ts` |
| Styling | **Tailwind v4** + **shadcn/ui** | Calm OS palette |
| State | **TanStack Query v5** + Zustand for UI state | Generated hooks from OpenAPI |
| Routing | **wouter** | Light SPA router |
| Forms | **react-hook-form** + Zod resolvers | |
| Charts | **Recharts** | KPI, attribution, forecast |
| Animation | **Framer Motion** + **GSAP** (video artifact) | |
| Voice | Web Speech API · `lib/voice.ts` `pickVoice()` | Gulf voices preferred |
| Mobile | **Expo SDK 53** + React Native 0.76 | Native dialer, push, contacts |
| Icons | lucide-react | |

## 4. Backend

| Layer | Choice | Notes |
|-------|--------|-------|
| Runtime | **Node 22** (ESM) | |
| Framework | **Express 5** | Pino HTTP logging |
| ORM | **Drizzle** | Postgres dialect |
| Database | **Postgres 16** (Replit-managed) | 29 tables, 18 enums, 56 FKs |
| Validation | **Zod** | Codegen'd from OpenAPI |
| Bundler | **esbuild** (`build.mjs`) | Single `dist/index.mjs` |
| Logger | **pino** + pino-http | Never `console.log` |
| Email | **Resend** (integration) | Templated transactional + marketing |
| Voice TTS | Web Speech API client-side · cloud TTS via add-on | Gulf voices Zariyah/Hala/Layla/Tarik/Naayf/Omar |
| Voice STT | Web Speech API · cloud STT add-on (ar-AE/en-US) | |
| Scraper | **Playwright** + stealth plugin (`enrichment-scraper`) | |

## 5. AI layer

| Capability | Provider(s) | How invoked |
|-----------|-------------|-------------|
| Multi-agent orchestrator | OpenAI / Anthropic via `/api/ai/assistant` | `lib/ai.ts` |
| Researcher agent | Perplexity Sonar | Inside orchestrator |
| Writer agent | OpenAI / Anthropic | Inside orchestrator |
| Strategist agent | OpenAI / Anthropic | Inside orchestrator |
| Analyst agent | OpenAI · structured output | Inside orchestrator |
| Operator agent | OpenAI · function calling | Triggers DB writes via internal tools |
| Marketing assistant | `/api/marketing/assistant-chat` | JSON-strict prompts |
| Image generation | OpenAI Images + brand-tuned variants | `/api/marketing/generate-image` |
| Voice (TTS) | Browser SpeechSynthesis · Azure/ElevenLabs add-on | `lib/voice.ts pickVoice()` |
| Voice (STT) | Browser SpeechRecognition · cloud add-on | `AIAssistantBubble.tsx` |

## 6. Contract-first APIs

- Single OpenAPI source in `lib/api-spec/`
- One command regenerates everything: `pnpm --filter @workspace/api-spec run codegen`
- Outputs:
  - `lib/api-zod/` — runtime Zod schemas (server-side validation, client parsing)
  - `lib/api-react-query/` — typed query / mutation hooks
- Server uses Zod schemas to validate inputs and outputs
- Client uses generated hooks — no hand-written `fetch()` wrappers

## 7. Data layer

- **Postgres 16** as the single source of truth
- **Drizzle ORM** with strongly-typed enums and JSON columns
- 29 tables incl. `contacts`, `companies`, `deals`, `signals`, `activities`, `calls`, `notifications`, `ai_agents`, `ai_agent_runs`, `ai_insights`, `campaigns`, `campaign_recipients`, `automation_rules`, `automation_runs`, `dashboards`, `dashboard_widgets`, `static_lists`, `static_list_members`, `engine_runs`, `enrichment_runs`, `enrichment_sources`, `scraper_cache`
- Schema bootstrap on cold start (`autoSeed.ts ensureSchema()`) so production matches dev
- 41 demo contacts + 30+ deals seeded automatically

## 8. Auth & security

- Public marketing routes + `signInAs(persona)` demo flow
- Production: Clerk-ready (or Replit Auth alt) for SSO/SAML on Business+
- Investor portal protected by passcode (`INVESTOR_PASSCODE` secret)
- Session secret rotated, never logged
- Cookie-parser + httpOnly + Secure + SameSite=Lax
- Pino redacts PII fields (`password`, `token`, `authorization`)
- Field-level permission checks on Business+ via `lib/sections.ts` role map

## 9. Observability

- Pino structured logs (JSON) for all server requests
- Replit deployment logs aggregated and queryable
- LSP diagnostics in dev
- Browser console logs streamed back via the Replit workflow surface

## 10. Tooling

| Tool | Purpose |
|------|---------|
| pnpm | Workspace + dependency manager |
| TypeScript 5.7 | All code |
| Prettier + ESLint | Format + lint at root |
| Vitest | Unit tests (where present) |
| Playwright | Browser automation in `enrichment-scraper` |
| esbuild | Server bundling |
| drizzle-kit | Schema sync (`db push`) |
| openapi-codegen | API spec → Zod + RQ |
