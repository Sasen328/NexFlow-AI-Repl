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

From the repo root:

```bash
pnpm run docs:pdf
```

That shells out to `python3 docs/render_pdf.py`, which reads every `docs/*.md` (plus `docs/business/*.md` and `docs/investor/*.md`) and renders a branded PDF — NexFlow header, page numbers, palette accents, table of contents — using WeasyPrint. Output goes back into the same folder as the source markdown.

### Drift check

To verify every markdown source has an up-to-date PDF sibling (useful as a pre-commit hook or CI check):

```bash
pnpm run docs:pdf:check
```

It exits non-zero if any `*.md` is newer than its matching `*.pdf` (or the PDF is missing). When that happens, run `pnpm run docs:pdf` and commit the regenerated PDFs alongside your markdown edits.

### System dependencies

WeasyPrint needs the following native libraries available on the host: `pango`, `cairo`, `harfbuzz`, `fontconfig`, `freetype`, `gdk-pixbuf`, `glib`. They are already installed in this Replit environment; on a fresh clone, install them via your platform's package manager before running `pnpm run docs:pdf`.

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
