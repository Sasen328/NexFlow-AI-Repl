# NexFlow — Documentation Bundle

The engineering-, design-, and product-facing reference for building, deploying, and operating **NexFlow** — the AI-native B2B CRM and sales operating system for the GCC.

Every document is shipped both as Markdown (for in-repo reading and version control) and as a branded PDF (for distribution to non-technical stakeholders).

## Index

| # | Document | What it covers |
| - | --- | --- |
| 01 | [Brand, Palette & Motion Guide](./01-brand-palette-motion.md) — [PDF](./01-brand-palette-motion.pdf) | Chameleon DNA palette, the diamond-mark logo, Living Mesh background, motion conventions, the two motion-logo HTML files. |
| 02 | [Full Tech Stack](./02-tech-stack.md) — [PDF](./02-tech-stack.pdf) | Real, current stack of every artifact (web, mobile, API, libs) with version numbers and a stack-reconciliation appendix vs. the feasibility study. |
| 03 | [Component Inventory](./03-components.md) — [PDF](./03-components.pdf) | Every meaningful component in the web and mobile apps, grouped by the 8 TopBar mega-dropdowns. |
| 04 | [Deployment Plan](./04-deployment-plan.md) — [PDF](./04-deployment-plan.pdf) | dev / staging / prod, Replit Deployments path, AWS me-south-1 (Bahrain) residency path, DB migrations, secrets, observability, backup & DR, costs, release checklist. |
| 05 | [In-App Documentation — All Four Roles](./05-app-documentation.md) — [PDF](./05-app-documentation.pdf) | What each role (CEO, Sales Manager, Sales Team, Marketing) sees, modules they live in, step-by-step workflows, AI features, KPIs. |
| 06 | [Phase 2 — Client Management Spec (Atlas)](./06-phase-2-client-management.md) — [PDF](./06-phase-2-client-management.pdf) | Forward-looking spec for the post-sale relationship intelligence module. |
| 07 | [Phase 3 — Client Onboarding Spec (Threshold)](./07-phase-3-client-onboarding.md) — [PDF](./07-phase-3-client-onboarding.pdf) | Forward-looking spec for the AI-guided client onboarding & go-live module. |

## Re-rendering the PDFs

```bash
python3 docs/render_pdf.py
```

Reads every `docs/*.md`, renders to a branded PDF (NexFlow header, page numbers, palette accents, table of contents) using WeasyPrint. Output goes back into `docs/`.

## Conventions

- The codebase is the authoritative source for technical decisions. When the original feasibility study disagrees (Next.js vs. Vite, Prisma vs. Drizzle, NestJS vs. Express), `02-tech-stack.md` §13 reconciles.
- Color values, motion durations, and brand assets in any new artifact must follow `01-brand-palette-motion.md`.
- Phase 2 (Atlas) and Phase 3 (Threshold) specs are **forward-looking** — they describe modules that are not yet built.

## Repo paths referenced across these docs

```
artifacts/nexflow/                React + Vite web app
artifacts/mobile/                 Expo / React Native mobile app
artifacts/api-server/             Express 5 API
artifacts/marketing-demo-video/   90s animated demo
artifacts/mockup-sandbox/         internal design canvas
lib/db/                           Drizzle schema + migrations
lib/api-spec/                     OpenAPI + Orval codegen
lib/api-zod/                      generated Zod schemas
lib/api-client-react/             generated React Query hooks
attached_assets/                  brand source files (logos, motion HTML, feasibility doc)
docs/                             this folder
docs/assets/                      logo + motion files mirrored for PDF rendering
```
