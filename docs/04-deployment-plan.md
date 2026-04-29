# 04 — Deployment Plan

> **Document scope:** how to ship NexFlow to production. Two paths are described — Replit Deployments (recommended default for speed) and AWS me-south-1 (Bahrain) for GCC customers with hard data-residency requirements. Includes environments, DB strategy, secrets, domains/TLS, observability, backups, cost, and a release checklist.

---

## 1. Environments

| Env | Purpose | Target audience | Branch / source |
| --- | --- | --- | --- |
| **dev** | Day-to-day engineering. Auto-seeded sample data. | Engineers, designers. | The active Replit workspace. |
| **staging** | Pre-prod customer demos, regression testing, integration acceptance. Production-shaped data, sanitized. | Solutions engineering, customer pilots. | Mirror of `main` deployed to a separate Replit Deployment / AWS account. |
| **prod** | Live, paying customers. | Customers. | Tagged release from `main`. |

For each env we run:

| Service | dev | staging | prod |
| --- | --- | --- | --- |
| Web (`artifacts/nexflow`) | Vite dev server | Static build behind Replit proxy | Static build behind CDN |
| API (`artifacts/api-server`) | Express on `$PORT` | Always-on Replit deployment | Reserved-VM Replit deployment / ECS service |
| Mobile (`artifacts/mobile`) | Expo dev | EAS preview channel | EAS production channel + App Store / Play Store |
| Marketing demo | Vite dev | Static build | Static build |
| DB | Replit Postgres | Replit Postgres (separate) | Replit Postgres (prod) **or** AWS RDS Postgres me-south-1 |

---

## 2. Recommended path A — Replit Deployments

Best for first 12 months. Lowest operational overhead, fastest time-to-customer.

### 2.1 What gets deployed

Each artifact is published as its own deployment behind the workspace shared proxy, routed by path (see `docs/02-tech-stack.md` §11):

- `/` → web app (static)
- `/api` → API server (autoscale)
- `/marketing-demo-video/` → demo video (static)

Mobile is shipped via **EAS Build → App Store / Play Store**, not Replit Deployments.

### 2.2 Deployment types per artifact

| Artifact | Type | Why |
| --- | --- | --- |
| Web (`artifacts/nexflow`) | **Static** | It's a Vite SPA — pure assets. CDN-cached, near-zero ongoing cost. |
| API (`artifacts/api-server`) | **Autoscale** | Express app; bursts during the workday. Autoscale keeps costs flat outside business hours. Set min instances ≥1 for paying customers to avoid cold starts. |
| Marketing demo | **Static** | Built bundle. |
| Mobile | n/a (EAS) | Native app stores. |

### 2.3 Pre-deploy checklist

1. Confirm catalog versions are pinned in `pnpm-workspace.yaml`.
2. Run `pnpm run typecheck` at the repo root — must pass.
3. Run `pnpm --filter @workspace/nexflow run build` and `pnpm --filter @workspace/api-server run build` locally.
4. Apply DB migrations against the target environment (see §4).
5. Set all required secrets via the workspace secrets UI (see §5).
6. Ensure `autoSeed` is **disabled** for prod (gate it with `NODE_ENV !== "production"` or feature flag) — sample data is for dev only.

### 2.4 Domains & TLS

- Replit issues HTTPS automatically via the proxy domains in `$REPLIT_DOMAINS` (comma-separated).
- Custom domains: bind in the Deployment settings. Replit handles cert issuance and renewal.
- Production recommendation: `app.nexflow.ai` → web; `api.nexflow.ai` → API.

---

## 3. Alternate path B — AWS me-south-1 (Bahrain) for GCC residency

Some GCC customers (banks, government, regulated insurers) require data to physically reside in-region. Use this path when the contract demands it.

### 3.1 Reference architecture

```
         Route 53 (app.nexflow.sa)
                  │
            CloudFront (web bundle, cached)
                  │
        ┌─────────┴──────────┐
   ALB (api.nexflow.sa)   S3 + OAC (web static)
        │
        ECS Fargate cluster (api-server)  ◀── Secrets Manager (KMS-encrypted)
        │
   RDS Postgres (Multi-AZ, me-south-1)    ◀── Automated backups
        │
   Daily snapshot → S3 me-south-1 (cross-AZ)
```

### 3.2 What changes vs. path A

| Concern | Path A (Replit) | Path B (AWS me-south-1) |
| --- | --- | --- |
| API host | Replit Autoscale | ECS Fargate (2× t-shirt sized tasks) behind ALB |
| Web host | Replit Static | S3 + CloudFront with Origin Access Control |
| DB | Replit Postgres | RDS Postgres (`db.t4g.medium` to start; Multi-AZ) |
| Secrets | Replit Secrets | AWS Secrets Manager |
| Logging | Replit logs | CloudWatch Logs + Logs Insights |
| Region | Global Replit edge | `me-south-1` (Bahrain) only |
| Mobile | EAS | Same — EAS |

### 3.3 IaC

Maintain a small **Terraform** module per env in `infra/aws/` (not yet checked in). One module per: VPC, RDS, ECS cluster, ALB, CloudFront + S3, Route 53. Apply via GitHub Actions. CD pushes container images to ECR; ECS rolling-deploys.

### 3.4 Migration playbook (Replit → AWS, when a customer triggers it)

1. Snapshot Replit Postgres to a `pg_dump`.
2. Restore into RDS Postgres me-south-1.
3. Build & push the API image to ECR.
4. Apply Terraform.
5. Cut DNS over.
6. Disable the Replit deployment (keep the workspace as the dev environment).

---

## 4. Database provisioning & migrations

- Source of truth: `lib/db/src/schema/index.ts` (Drizzle).
- Migrations: generated with `drizzle-kit generate` to `lib/db/drizzle/`. Apply with `drizzle-kit migrate` (or `push` in dev).
- The workspace shared `database` skill is the dev-side path; the production DB is provisioned per env (Replit Postgres or RDS).
- **Migration policy:** every PR that touches `schema/index.ts` must:
  1. Generate a new migration file.
  2. Be backward-compatible for at least one release (additive columns; no destructive renames in a single deploy).
  3. Be smoke-tested against staging before prod.
- **Auto-seed:** the boot-time `autoSeed()` in `artifacts/api-server/src/lib/autoSeed.ts` populates the "default" org with sample CRM data. **Must be gated off in prod** (e.g. `if (process.env.NODE_ENV === "production") return;`).

---

## 5. Secrets management

All secrets must come from the platform secrets store, never from code.

| Variable | Where it's set | Required by |
| --- | --- | --- |
| `DATABASE_URL` | Replit Secrets / AWS Secrets Manager | api-server, lib/db |
| `AI_INTEGRATIONS_OPENROUTER_BASE_URL` / `_API_KEY` | Replit Connectors (preferred) | api-server |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` / `_API_KEY` | Replit Connectors | api-server |
| Resend key | Replit `resend` connector or `RESEND_API_KEY` | api-server |
| Twilio Account SID / Auth Token | Set when telephony goes live | api-server (`routes/calls.ts`) |
| WhatsApp Business token | Set when WhatsApp goes live | api-server (`routes/marketing.ts`, `messages` UI) |
| Payment provider keys (Mada / Tap / HyperPay / PayTabs) | Set when Quote-to-Cash goes live | api-server |
| `REPL_IDENTITY` / `WEB_REPL_RENEWAL` / `REPLIT_CONNECTORS_HOSTNAME` | Auto-injected by Replit | api-server |

When migrating to AWS, secrets move from Replit Secrets to **AWS Secrets Manager** and are injected into ECS task definitions via `secrets:` blocks (KMS-encrypted at rest, in transit via the ECS agent).

### 5.1 Auth (planned, not yet wired)

The app currently runs in demo mode (no auth wall). Before the first paying customer:

- **Default:** Replit Auth (OpenID Connect with PKCE). Wire via the workspace `replit-auth` skill — adds auth routes, middleware, web hook, and mobile auth in one pass.
- **Enterprise / SAML / SSO:** Clerk (per the workspace `clerk-auth` skill) — needed if a customer requires SAML or SCIM provisioning.

Scope this work into a dedicated PR before any GA launch.

---

## 6. Observability & logging

| Concern | Path A (Replit) | Path B (AWS) |
| --- | --- | --- |
| App logs | Pino → stdout → Replit log viewer | Pino → stdout → CloudWatch Logs |
| HTTP request logs | `pino-http` (already wired in `app.ts`) | Same |
| Errors | Inline `try/catch` + `logger.error`. AI route `try/catch` returns empty rather than crashing. | Same. Forward to Sentry (org-wide DSN). |
| Uptime | Replit health check on `/api/healthz` | Route 53 health check + CloudWatch alarm |
| Metrics | Replit deployment metrics | CloudWatch + Container Insights |
| AI cost | OpenRouter dashboard | Same — OpenRouter is provider-agnostic to the host |

Add **Sentry** (`@sentry/node` for the API, `@sentry/react` for the web) before paying-customer launch. One DSN per env.

---

## 7. Backup & disaster recovery

| Tier | RPO | RTO | Mechanism |
| --- | --- | --- | --- |
| **A: Replit Postgres** | 24 h | 4 h | Daily snapshot. Restore via Replit DB UI. |
| **B: RDS Postgres me-south-1** | 5 min (PITR) | 1 h | Automated backups + Multi-AZ failover. Cross-region snapshot copy to `eu-west-1` weekly for catastrophic-region recovery. |

Quarterly DR drill: restore yesterday's snapshot into a scratch DB, run a Drizzle migration, verify a known query.

For object storage (call recordings, business-card images, AI-generated assets), use the workspace `object-storage` skill (S3-compatible). Versioning **on**; lifecycle rule deletes after 90 days unless tagged `legal-hold`.

---

## 8. Cost-by-environment estimate (monthly)

> Order-of-magnitude only. Re-baseline at every contract.

### Path A — Replit Deployments

| Item | dev | staging | prod (10 customers, ~50 reps) |
| --- | --- | --- | --- |
| Web (Static) | $0 | $0 | ~$10 |
| API (Autoscale, min 1) | n/a | ~$25 | ~$120 |
| Postgres | included | included | ~$25 |
| Object storage | $0 | ~$5 | ~$20 |
| OpenRouter (LLM usage) | $50 | $100 | ~$600 (heavy AI org) |
| Resend | $0 | $20 (Pro) | $20–$80 |
| **Subtotal** | **~$50** | **~$150** | **~$800–900** |

### Path B — AWS me-south-1

| Item | prod (single customer, ~50 reps) |
| --- | --- |
| ECS Fargate (2 tasks, t-shirt small) | ~$60 |
| ALB | ~$20 |
| RDS Postgres `db.t4g.medium` Multi-AZ | ~$160 |
| CloudFront + S3 (web) | ~$10 |
| CloudWatch Logs | ~$10 |
| Secrets Manager | ~$5 |
| Backups (snapshots + cross-region) | ~$15 |
| OpenRouter | ~$300–600 |
| Resend | ~$20 |
| **Subtotal** | **~$600–900** |

Costs grow linearly with seats; LLM usage is the variable item.

---

## 9. Release checklist

For every production push (web + API + DB):

- [ ] CI green: `pnpm run typecheck` + builds for all artifacts.
- [ ] DB migrations are additive and reviewed.
- [ ] `autoSeed` confirmed off in prod (or gated).
- [ ] Secrets present in target env (DB, OpenRouter, OpenAI, Resend, Twilio when live).
- [ ] Smoke test on staging:
  - [ ] Sign in (when auth is live).
  - [ ] Open `/`, `/funnel`, `/calls`, `/assistant`.
  - [ ] Send a test campaign email through Resend.
  - [ ] Trigger an AI assistant chat.
  - [ ] Run one workflow.
- [ ] Sentry release tag created.
- [ ] Mobile EAS build promoted to the matching channel.
- [ ] Changelog updated; customer-facing release note drafted.
- [ ] Roll-back plan: previous Replit deployment kept warm for 24 h; previous container image kept in ECR for 7 days.

---

## 10. Routine ops cadence

| Cadence | Task |
| --- | --- |
| Daily | Triage new errors in Sentry. Spot-check OpenRouter spend. |
| Weekly | Review API p95 latency. Ensure auto-seed didn't run in prod. |
| Monthly | Rotate Resend / Twilio / payment-provider keys if customer compliance requires it. |
| Quarterly | DR drill (§7). Cost review. Catalog version refresh. |
