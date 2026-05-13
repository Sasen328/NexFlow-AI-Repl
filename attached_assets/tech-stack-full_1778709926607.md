# ProspectSA — Complete Tech Stack & Source Breakdown

---

## Monorepo Structure

```
workspace/
├── artifacts/
│   ├── prospect-sa/          ← Frontend (React + Vite)
│   ├── api-server/           ← Backend (Express + TypeScript)
│   └── mockup-sandbox/       ← Component preview server
├── packages/
│   ├── db/                   ← Drizzle ORM schema + migrations
│   ├── api-zod/              ← Shared Zod validation schemas (FE + BE)
│   ├── api-client-react/     ← Typed React Query hooks + axios client
│   └── integrations-openai-ai-server/
```

---

## Frontend — `artifacts/prospect-sa`

### Runtime & Build

| Package | Version | Role |
|---|---|---|
| React | 18 (catalog) | UI framework |
| Vite | catalog | Dev server + build |
| TypeScript | catalog | Type safety |
| `wouter` | ^3.3.5 | Client-side routing (no React Router) |

### UI Components

| Package | Role |
|---|---|
| Radix UI (full suite, 20+ primitives) | Headless accessible primitives |
| `class-variance-authority` + `clsx` + `tailwind-merge` | CVA/shadcn component variants |
| `lucide-react` | Primary icon set |
| `react-icons` | Supplemental icons |
| `cmdk` | Command palette |
| `sonner` | Toast notifications |
| `vaul` | Drawer |
| `embla-carousel-react` | Carousel |
| `input-otp` | OTP input |
| `react-resizable-panels` | Split-pane layouts |

### Styling

| Package | Role |
|---|---|
| Tailwind CSS v4 (catalog) | Utility CSS |
| `@tailwindcss/typography` | Prose styling |
| `tw-animate-css` | Animation utilities |
| `framer-motion` | Page transitions + animated UI |
| `next-themes` | Dark/light mode |

### Data & Forms

| Package | Role |
|---|---|
| `@tanstack/react-query` | Server-state caching (catalog) |
| `@workspace/api-client-react` | Typed hooks generated from Zod schemas |
| `react-hook-form` + `@hookform/resolvers` | Form management |
| `zod` | Schema validation (catalog) |
| `recharts` | Data visualisation charts |
| `date-fns` + `react-day-picker` | Date utilities + picker |

### Pages Structure

```
pages/
├── Dashboard.tsx
├── masaar/                   → index.tsx                (Masaar Engine UI)
├── database-builder/         → index.tsx, database.tsx  (AI Database Builder)
├── prospecting/              → index.tsx, company.tsx, person.tsx,
│                                seeder.tsx, website.tsx  (ProsEngine)
├── orcengine/                → index.tsx
├── leads/                    → index.tsx
├── companies/                → executives.tsx, shareholders.tsx
├── MeshBase.tsx / MeshBaseCompanies.tsx / MeshBaseCompanyProfile.tsx
├── MeshBaseExecutives.tsx / MeshBaseExecutiveProfile.tsx
├── ProsEngineChat.tsx
├── sa-market/                → index.tsx
└── not-found.tsx
```

### Components Structure

```
components/
├── ui/               ← ~40 shadcn-style primitives (button, card, dialog,
│                         table, badge, chart, input, form, select, etc.)
└── layout/           ← AppSidebar.tsx, Layout.tsx
```

---

## Backend — `artifacts/api-server`

### Runtime & Framework

| Package | Version | Role |
|---|---|---|
| Node.js + `tsx` | catalog | TypeScript execution |
| Express | ^5 | HTTP server |
| `cors` | ^2 | CORS middleware |
| `cookie-parser` | ^1.4.7 | Cookie sessions |
| `uuid` | ^13.0.0 | Job IDs |
| `drizzle-orm` | catalog | PostgreSQL ORM |

### AI Models (priority waterfall: Gemini → Claude → GPT-4o)

| Package | Model | Role |
|---|---|---|
| `@google/genai` ^1.47.0 | Gemini 2.5 / 2.0 Flash | PRIMARY search + synthesis |
| `@anthropic-ai/sdk` ^0.78.0 | Claude 3.5 / claude-opus-4 | SECONDARY + report compiler + CAPTCHA Vision |
| `openai` ^6.29.0 | GPT-4o | TERTIARY fallback |
| `axios` (direct) | Perplexity `sonar` | Deep research (5 parallel queries) |
| `axios` (stub) | OpenRouter (deepseek-r1, llama-3.3-70b, moonshot) | Activates via `OPENROUTER_API_KEY` |
| `axios` (stub) | Groq | Activates via `GROQ_API_KEY` |

### Scraping / Crawling Stack

| Package | Version | Role |
|---|---|---|
| `playwright` | ^1.58.2 | Headless Chromium (stealth browser + crawl4ai) |
| `cheerio` | ^1.2.0 | HTML parsing + data extraction |
| `node-html-parser` | ^7.1.0 | Fast DOM parsing |
| `axios` | ^1.13.6 | HTTP fetches (web seeder, free sources) |
| `turndown` | ^7.2.2 | HTML → Markdown conversion |
| `pdf-parse` | ^2.4.5 | AOA PDF text extraction |

### Document Export

| Package | Role |
|---|---|
| `docx` ^9.6.1 | Word document generation |
| `exceljs` ^4.4.0 | Excel export |
| `pptxgenjs` ^4.0.1 | PowerPoint export |
| `xlsx` ^0.18.5 | Spreadsheet read/write |
| `pdfkit` ^0.18.0 | PDF generation |

### Routes

```
routes/
├── company-intel.ts      ← ProsEngine: company intelligence endpoint
├── person-intel.ts       ← ProsEngine: person intelligence endpoint
├── masaar.ts             ← Masaar Engine: 5-agent pipeline
├── masar-database.ts     ← AI Database Builder: harvest + upsert
├── companies.ts          ← Company CRUD
├── leads.ts / lead-lists.ts
├── prospecting.ts
├── meshbase.ts
├── orcengine.ts
├── prosengine-chat.ts
├── sa-market.ts
├── builder.ts
└── health.ts
```

### Lib Directory

```
lib/
├── masaar-engine.ts       (1782 lines)  5-agent Masaar pipeline
├── masar-harvester.ts     (2967 lines)  AI Database Builder harvester
├── web-seeder.ts          (325 lines)   Background web seeder
├── stealth-browser.ts     (569 lines)   Playwright anti-detect browser
├── free-sources.ts        (600+ lines)  9 free API sources
├── mooresrowland-scraper.ts             8 chamber scrapers
├── bluepages-scraper.ts                 Bluepages directory scraper
├── scraper.ts             (197 lines)   Generic HTTP scraper
├── enrichment-engine.ts                 Enrichment orchestration
├── builder-engine.ts                    AI Database Builder engine
├── anthropic-service.ts                 Claude wrapper
├── openai.ts                            OpenAI shared instance
├── apollo-service.ts                    Apollo.io integration
├── explorium-service.ts                 Explorium integration
├── huggingface-service.ts
├── perplexity-enrichment.ts
├── prospecting-engine.ts
├── meshbase-seed.ts
├── data-sources.ts
└── blocklist.ts
```

---

## Engine 1 — Masaar Database & Engine

**Route:** `masaar.ts` → **Engine:** `lib/masaar-engine.ts` (1782 lines)

### Architecture: 5 Sequential AI Agents with SSE streaming (EventEmitter)

| Agent | Source | Scraping Method | AI |
|---|---|---|---|
| **1 — MC.gov.sa Registry** | `mc.gov.sa/ar/eservices/Pages/Commercial-data.aspx` | StealthBrowser (Playwright anti-fingerprint), CAPTCHA auto-solve via Claude Vision | Claude 3.5 (CAPTCHA decode) |
| **2 — Amaaly AOA Intelligence** | `emagazine.aamaly.sa` | StealthBrowser + Cloudflare bypass + pdf-parse (AOA PDF) | Claude (OCR + Arabic→English translate) |
| **3 — Deep Research** | Perplexity ×5, Gemini ×4, Claude, GPT-4o, OpenRouter/Groq stubs | axios parallel requests | Perplexity `sonar` + Gemini + Claude + GPT-4o |
| **4 — Compliance & Sanctions** | OFAC, UN SC, EU, CMA, SAMA, ZATCA, Maroof, Najiz | axios REST + Cheerio | Claude risk synthesis |
| **5 — Bilingual Report** | Compiled from agents 1–4 | — | Claude (primary) + GPT-4o (fallback) → EN + AR |

### Built-in Scraping Layer Detail

**StealthBrowser** (`stealth-browser.ts`, Playwright Chromium):

- Full JS anti-fingerprinting injected on every page load:
  - `navigator.webdriver = false`, plugin count spoof, platform/language spoof
  - Canvas `getImageData`/`toDataURL` noise injection
  - WebGL vendor + renderer strings spoofed
  - Timing API (`performance.now`, `Date.now`) jitter
- Bézier curve mouse paths (3-control-point random curves)
- Gaussian typing delays (mean 120ms, σ 40ms)
- Cloudflare/Turnstile challenge detection + wait loop
- **CAPTCHA auto-solve:** screenshot → base64 → Claude Vision → parse code → 3 attempts → human fallback if confidence low
- Session persistence: saves/restores cookies + localStorage per domain
- Methods: `start()`, `goto()`, `fillFirst()`, `clickFirst()`, `screenshot()`, `getContent()`, `detectChallenge()`, `waitForCloudflare()`

**Supporting helpers:**
- `crawl4ai-engine.ts` (199 lines): Playwright page load → TurndownService HTML→Markdown
- `browser-helper.ts` (101 lines): Cheerio-based content extraction helpers

---

## Engine 2 — AI Database Builder

**Route:** `masar-database.ts` → **Engine:** `lib/masar-harvester.ts` (2967 lines)

### NexFlow Waterfall — 40+ Sources by Priority

| Priority | Source | Method |
|---|---|---|
| 10 | MC.gov.sa CR lookup | StealthBrowser + CAPTCHA |
| 14 | Maroof.sa profile | axios + Cheerio |
| 16 | Aamaly AOA PDF | StealthBrowser + pdf-parse |
| 18 | GLEIF API | axios REST (free, no key) |
| 20 | Hunter.io | axios REST (needs key) |
| 26 | Tadawul / Argaam | axios REST (public) |
| 28 | OpenCorporates | axios REST (free) |
| 30 | Gemini Search synthesis | `@google/genai` |
| 32 | Wikidata SPARQL | axios → SPARQL endpoint |
| 34 | Clearbit Logo CDN | axios HEAD (no key) |
| 36 | GitHub Org API | axios REST (60/hr free) |
| 38 | Wappalyzer | axios REST |
| 40 | Claude synthesis | `@anthropic-ai/sdk` |
| 44 | GPT-4o fallback | `openai` |
| 46 | Perplexity `sonar` | axios direct |
| 50 | Moores Rowland + 8 chambers | axios + Cheerio (mooresrowland-scraper.ts) |
| 52 | OpenCorporates SA harvest | axios paginated |
| 60 | Email Permutator | pure JS computation |
| Post-enrich | **Web Seeder** (background `setImmediate`) | axios Saudi-UA + Cheerio + Claude |

### AI Enrichment Stack

- **Gemini 2.5 Flash** — field-level extraction prompts (PRIMARY)
- **Claude 3.5** — synthesis, Arabic translation (SECONDARY)
- **GPT-4o** — fallback for any failed field (TERTIARY)
- **pdf-parse** — extracts raw text from AOA PDFs before AI processes them

---

## Engine 3 — ProsEngine

**Routes:** `company-intel.ts` (500 lines) + `person-intel.ts` (774 lines)  
**Background:** `lib/web-seeder.ts` (325 lines)

### Company Intel (`company-intel.ts`) — Source Waterfall

| Source | Method | AI |
|---|---|---|
| **Source 1 — Web Seeder** | `lib/web-seeder.ts` — Saudi UA axios GET, Cheerio link discovery (5 pages), Claude extraction | Claude 3.5 Haiku (1024 tok per page, 3000 tok aggregate) |
| **Source 2 — Gemini Search** | `gemini-search.ts` — Gemini 2.5 Flash grounded web search | Gemini |
| **Source 3 — Claude Synthesis** | All sources aggregated → Claude opus/sonnet | Claude |
| **Source 4 — Perplexity** | `perplexity-service.ts` — `sonar` model, 1500 tok + citations | Perplexity |
| **Source 5 — Free Sources** | `free-sources.ts` — GLEIF, OpenCorporates, Wikidata, Clearbit, GitHub, Hunter, Tadawul, Wappalyzer (all parallel) | None (pure REST) |

### Person Intel (`person-intel.ts`) — Source Waterfall

| Source | Method | AI |
|---|---|---|
| **Source 1 — Crawl4AI** | `crawl4ai-engine.ts` — Playwright headless, HTML→Markdown | Gemini parse |
| **Source 2 — Company Crawl Agent** | StealthBrowser crawl on company domain — finds staff pages, extracts bios | Claude Vision + Cheerio |
| **Source 3 — Gemini Search** | `gemini-search.ts` — person-name + company query | Gemini |
| **Source 4 — Claude Synthesis** | All sources merged → structured JSON | Claude |
| **Source 5 — LinkedIn Simulation** | Gemini grounded search (LinkedIn profile data extraction) | Gemini |

### Web Seeder (`lib/web-seeder.ts`)

- **HTTP:** axios with Saudi Chrome Windows UA + `Accept-Language: ar,en`
- **Link discovery:** Cheerio parses homepage → collects internal links → deduplicates → visits first 5
- **Per-page extraction:** Claude 3.5 Haiku, 1024 tokens, 20s timeout, Saudi business prompt
- **Aggregation:** Claude 3.5, 3000 tokens, 45s timeout, merges all pages
- **Background mode:** called via `setImmediate()` in masar-harvester post-enrichment; re-fetches current DB row before writing to avoid race stomping

---

## Database Layer (`packages/db`)

- **PostgreSQL** (Replit managed)
- **Drizzle ORM** — schema-first, type-safe, migration runner
- Tables: `masaarCompanies`, `masarCompanies` (AI builder), `leads`, `leadLists`, `meshbaseCompanies`, `meshbaseExecutives`, `prospectingSessions`, `webSeederCache`
- Shared across all three engines via `@workspace/db` workspace package

---

## Key Environment Variables to Replicate

```bash
ANTHROPIC_API_KEY          # Claude — required (PRIMARY AI)
GEMINI_API_KEY             # Gemini — required (PRIMARY search)
OPENAI_API_KEY             # GPT-4o — optional (tertiary fallback)
PERPLEXITY_API_KEY         # Perplexity sonar — optional
DATABASE_URL               # PostgreSQL connection string
HUNTER_API_KEY             # Hunter.io — optional
WAPPALYZER_API_KEY         # Wappalyzer — optional
OPENROUTER_API_KEY         # OpenRouter stub — optional
GROQ_API_KEY               # Groq stub — optional
DISABLE_PERPLEXITY         # "true" to disable Perplexity fallback
```

---

## Scraping Layer Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SCRAPING / CRAWLING LAYERS                      │
│                                                                       │
│  Layer 1: StealthBrowser (stealth-browser.ts)                        │
│    └─ Playwright Chromium, anti-fingerprint JS, Bézier mouse,        │
│       Gaussian typing, Cloudflare bypass, Claude Vision CAPTCHA      │
│                                                                       │
│  Layer 2: Crawl4AI Engine (crawl4ai-engine.ts)                       │
│    └─ Playwright headless, HTML→Markdown (TurndownService)           │
│                                                                       │
│  Layer 3: Web Seeder (lib/web-seeder.ts)                             │
│    └─ axios Saudi-UA, Cheerio link graph, Claude per-page agent      │
│                                                                       │
│  Layer 4: Free Sources REST (lib/free-sources.ts)                    │
│    └─ GLEIF, OpenCorporates, Wikidata SPARQL, Clearbit CDN,          │
│       GitHub API, Hunter.io, Tadawul/Argaam, Wappalyzer              │
│                                                                       │
│  Layer 5: Chamber Scrapers (lib/mooresrowland-scraper.ts)            │
│    └─ axios + Cheerio, 8 sources: Moores Rowland, Arab-British,      │
│       AmCham, SBBC, JCC, FCC, German-Arab, GCC Chambers              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Source Files Quick Reference

| File | Lines | Engine | Role |
|---|---|---|---|
| `routes/company-intel.ts` | 500 | ProsEngine | Company intel API endpoint |
| `routes/person-intel.ts` | 774 | ProsEngine | Person intel API endpoint |
| `lib/masar-harvester.ts` | 2967 | AI Database Builder | Full 40+ source harvest pipeline |
| `lib/masaar-engine.ts` | 1782 | Masaar Engine | 5-agent pipeline + SSE streaming |
| `lib/web-seeder.ts` | 325 | ProsEngine / AI DB | Background Saudi web crawler |
| `lib/stealth-browser.ts` | 569 | All engines | Anti-detect Playwright browser |
| `crawl4ai-engine.ts` | 199 | ProsEngine | Playwright HTML→Markdown crawler |
| `gemini-search.ts` | 237 | All engines | Gemini grounded search wrapper |
| `perplexity-service.ts` | 144 | All engines | Perplexity sonar REST wrapper |
| `lib/free-sources.ts` | 600+ | AI DB / ProsEngine | 9 free REST data sources |
| `lib/mooresrowland-scraper.ts` | 700+ | AI Database Builder | 8 chamber directory scrapers |
| `browser-helper.ts` | 101 | All engines | Cheerio extraction helpers |
