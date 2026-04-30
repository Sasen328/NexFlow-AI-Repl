# NexFlow — Deployment Plan

> Production is a true twin of dev. One click publishes everything.

---

## 1. Topology

NexFlow ships as a single Replit deployment with **path-based routing** behind the platform's mTLS edge proxy. Each artifact maps to a unique path:

| Path | Artifact | Service kind |
|------|----------|--------------|
| `/` | `nexflow` | Static SPA (`dist/public`) |
| `/api` | `api-server` | Autoscale Node.js |
| `/mobile` | `mobile` (Expo web build) | Static |
| `/company-profile-deck` | `company-profile-deck` | Static |
| `/investor-deck` | `investor-deck` | Static |
| `/marketing-demo-video` | `marketing-demo-video` | Static |

Routing is most-specific-first, so `/api/...` resolves to the API server even though `/` is also registered.

## 2. Build pipeline

```
Single click → Replit publish
   │
   ├─ for each artifact: services.production.build.args
   │     • api-server  : pnpm --filter @workspace/api-server run build
   │                     → esbuild bundles src → dist/index.mjs
   │                     → build.mjs copies seed/ → dist/seed/
   │     • nexflow     : pnpm --filter @workspace/nexflow run build
   │                     → vite → dist/public
   │     • decks/video : pnpm --filter @workspace/<x> run build
   │                     → vite → dist/public
   │
   ├─ pnpm store prune (postBuild hook)
   │
   ├─ deploy autoscale services + register static handlers
   │
   ├─ on cold start of api-server:
   │     • ensureSchema() → SELECT to_regclass('public.contacts')
   │       → if NULL, replay artifacts/api-server/seed/schema.sql
   │     • seedSources()  → idempotent enrichment sources
   │     • autoSeed()     → if contacts < 30, wipe seed tables + reseed
   │     • app.listen(PORT)
   │
   └─ Health probe: GET /api/healthz
```

## 3. Environments

| Env | Where | DATABASE_URL | Domain |
|-----|-------|--------------|--------|
| **Dev** | Replit workspace | Replit-managed dev DB | `*.riker.replit.dev` |
| **Production** | Replit autoscale | Replit-managed prod DB | `*.replit.app` (or custom) |

Both envs are **schema-identical** because `ensureSchema()` runs at boot and replays the same `seed/schema.sql`. Both envs have **the same demo dataset** because `autoSeed()` repopulates whenever it sees fewer than 30 contacts.

## 4. Required secrets

| Secret | Purpose | Required in |
|--------|---------|-------------|
| `DATABASE_URL` | Postgres connection | dev + prod |
| `SESSION_SECRET` | Cookie signing | dev + prod |
| `INVESTOR_PASSCODE` | Investor portal gate | dev + prod |
| `RESEND_API_KEY` | Email send | both (auto via integration) |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | LLM agents | both |
| `PERPLEXITY_API_KEY` | Researcher agent | optional (graceful degrade) |
| `HUNTER_API_KEY` / `APOLLO_API_KEY` / `LUSHA_API_KEY` | Enrichment | optional per connector |

When an optional key is missing, the affected feature degrades gracefully and uses sample data.

## 5. Workflows (dev)

| Workflow | Command |
|----------|---------|
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` |
| `artifacts/nexflow: web` | `pnpm --filter @workspace/nexflow run dev` |
| `artifacts/mobile: expo` | `pnpm --filter @workspace/mobile run dev` |
| `artifacts/company-profile-deck: web` | `pnpm --filter @workspace/company-profile-deck run dev` |
| `artifacts/investor-deck: web` | `pnpm --filter @workspace/investor-deck run dev` |
| `artifacts/marketing-demo-video: web` | `pnpm --filter @workspace/marketing-demo-video run dev` |
| `artifacts/mockup-sandbox: Component Preview Server` | `pnpm --filter @workspace/mockup-sandbox run dev` |
| `Enrichment Scraper` | `pnpm --filter @workspace/enrichment-scraper run dev` |

## 6. Cold-start safety net

The api-server `index.ts` wraps `autoSeed().then(...)` so even if seeding fails, the server still listens. Errors are logged with pino but do not crash the process.

```text
[autoSeed] Empty database detected — bootstrapping schema from .../seed/schema.sql
[autoSeed] Schema bootstrapped.
[autoSeed] Empty database detected — seeding demo data…
[autoSeed] 41 contacts seeded.
INFO Server listening port=8080
```

## 7. Health & observability

- `/api/healthz` → `200 OK` JSON `{ ok: true }`
- pino structured logs streamed via Replit deployment console
- Browser console + workflow logs surfaced in workspace
- Recommended: ship logs to a third-party (Logtail/Datadog) on Business+ plans

## 8. Scaling

- API server runs on autoscale (cold-start < 2s)
- Static artifacts served from edge CDN
- Postgres scales vertically; for Enterprise we deploy a dedicated instance with PITR (point-in-time recovery) enabled
- Background workers (`enrichment-scraper`) are stateless and horizontally scalable

## 9. Rollback

- Replit checkpoints: every commit is a restore point
- Database: built-in PITR; restore by environment
- Front-end: redeploy any prior commit hash; static artifacts re-served immediately

## 10. Security

- TLS terminated at edge with mTLS internally
- Secrets never logged (pino redaction list)
- Investor portal passcode-gated
- Audit log retention per plan (30d → 7y)
- Field-level permissions on Business+
- VPC + private endpoints + SAML SSO on Enterprise

## 11. Known constraints addressed

- **Vite production build needs PORT/BASE_PATH** — defaults provided in every artifact's `vite.config.ts` so build succeeds without runtime env.
- **Production DB starts empty** — `ensureSchema()` replays `seed/schema.sql` baked into the api-server bundle.
- **Schema drift between dev and prod** — refresh the dump with `pg_dump --schema-only` whenever Drizzle schema changes; `seed/schema.sql` is committed to the repo.
