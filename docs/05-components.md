# NexFlow — Components & Modules

> A map of the major surfaces, components, and shared modules in the codebase.

---

## 1. CRM web app (`artifacts/nexflow`)

### 1.1 Layout components (`src/components/layout/`)

| Component | Role |
|-----------|------|
| `ProtectedAppLayout` | Auth gate + persistent shell (top bar + sidebar) |
| `TopBar` | Global header: persona avatar/switcher, Ask AI button, notifications, language toggle |
| `Sidebar` | Section nav driven by `lib/sections.ts` |
| `MobileSidebar` | Drawer for `<md` viewports |
| `BreadcrumbBar` | Section + page breadcrumbs |

### 1.2 Cross-cutting components

| Component | Role |
|-----------|------|
| `AIAssistantBubble` | Floating Ask AI bubble. STT lang toggle (AR/EN), TTS Gulf voice via `pickVoice()`, listens for `nf:open-assistant` event with `detail.text` auto-submit |
| `VoiceCallModal` | In-call UI with live transcript & summary |
| `briefing-360` | 360° AI briefing card with strict-JSON extraction |
| `briefing-tab-extras` | KPI tile strip, hot-lead alerts, predictive cues |
| `push-to-crm` | "Save to CRM" CTA for captures (business cards, voice notes, OCR) |

### 1.3 Marketing components (`src/components/marketing/`)

| Component | Role |
|-----------|------|
| `CulturalIntelligenceToggle` | Khaleeji aesthetic + Arabic-first + Sun-Wed AM tuning switch |
| `HotLeadAlertsStrip` | URGENT banner with Call/Email/WhatsApp CTAs |
| `KPIGrid` | 7-tile campaign KPI grid |
| `ROIStrip` | Spend vs returned pipeline strip |
| `ChannelPicker` | 7-channel multi-select for publishing |
| `AIBuilderWizard` | 6-step campaign builder w/ per-output Refresh |

### 1.4 Enrichment components (`src/components/enrichment/`)

| Component | Role |
|-----------|------|
| `EnrichmentSourceCard` | Per-connector status & spend |
| `WaterfallTrace` | Visualises which connector returned each field |
| `EnrichButton` | Triggers `/api/lead-enrich` with override options |

### 1.5 UI primitives (`src/components/ui/`)

shadcn-derived primitives, RTL-safe, calm-tuned: `button`, `card`, `dialog`, `dropdown-menu`, `input`, `select`, `tabs`, `toast`, `tooltip`, `popover`, `command`, `sheet`, `accordion`, `badge`, `progress`, `separator`, `skeleton`, `switch`, `textarea`, `avatar`.

### 1.6 Pages (60+; grouped by section)

- **Home / Ask AI**: `briefing.tsx`, `command-center.tsx`, `assistant.tsx`, `predictive.tsx`
- **CRM**: `contacts.tsx`, `contact-profile.tsx`, `companies.tsx`, `company-detail.tsx`, `accounts.tsx`, `deals.tsx`, `activities.tsx`, `activity-capture.tsx`, `calls.tsx`, `call-list.tsx`, `call-redaction.tsx`, `crm-dashboard.tsx`
- **Marketing**: `marketing-dashboard.tsx`, `campaign-builder.tsx`, `campaign-performance.tsx`, `campaigns.tsx`, `audiences.tsx`, `channels.tsx`, `web-forms.tsx`, `cultural-intelligence.tsx`
- **Service**: `callcenter-agent.tsx`, `callcenter-dashboard.tsx`, `callcenter-knowledge-base.tsx`, `callcenter-messages.tsx`, `contact-center-setup.tsx`, `conversation-intelligence.tsx`
- **Engines**: `agent-builder.tsx`, `ai.tsx`, `automation.tsx`, `engines/*` pages
- **Analytics**: `analytics.tsx`, `attribution.tsx`, `dashboards.tsx`, `dashboard.tsx`, `dashboard-detail.tsx`, `datahub-ai-analytics.tsx`
- **Settings**: `account-settings.tsx`, `permissions.tsx`, `capabilities.tsx`, `approvals.tsx`
- **Capture**: `business-cards.tsx`

### 1.7 Hooks & libs

- `hooks/useApi.ts` — `apiFetch(path, init?)` returns parsed JSON, throws on non-2xx
- `lib/voice.ts` — `pickVoice(lang)` chooses Gulf-preferred voice with graceful fallback
- `lib/sections.ts` — section nav per role
- `lib/marketing-auth.ts` — `signInAs(persona)` writes `nf_role`, dispatches `nf:role-change`

---

## 2. API server (`artifacts/api-server`)

### 2.1 lib

- `ai.ts` — multi-agent orchestrator; routes to Researcher / Writer / Strategist / Analyst / Operator
- `autoSeed.ts` — `ensureSchema()` + canonical seed
- `email.ts` — Resend wrapper for transactional + marketing
- `logger.ts` — pino singleton
- `engines/` — runtime for Engines:
  - `lead-finder.ts` · `masaar.ts` · `prosengine-company.ts` · `prosengine-person.ts` · `_ai.ts` · `types.ts`
- `enrichment/` — connector waterfall:
  - `connectors/` (hunter, apollo, lusha, _common)
  - `crypto.ts` (API-key encryption)
  - `sources.ts` (registry seed)
  - `waterfall.ts` (smart fallback chain)
  - `types.ts`

### 2.2 Routes (`src/routes/`)

50+ route files: see Frontend & Backend doc §B.3.

### 2.3 Middlewares

- Auth gate (cookie + persona)
- CORS (allow Replit dev + production domains)
- pino-http logging with PII redaction
- Error normaliser (returns `{ error: { code, message } }`)

---

## 3. Mobile app (`artifacts/mobile`)

- Expo SDK 53 / React Native 0.76
- Calm tab navigation: Briefing · Calls · Capture · Settings
- Voice capture (native mic) → posts to `/api/activity-capture`
- Push notifications (Expo)
- Native dialer integration (Power Dialer hand-off)

---

## 4. Mockup sandbox (`artifacts/mockup-sandbox`)

- Vite preview server with isolated `/preview/<component>` URLs
- Used by the Canvas board to render variants side-by-side
- Skill: `mockup-sandbox` for component preview, `mockup-extract` to lift live components, `mockup-graduate` to integrate approved variants back into nexflow

---

## 5. Decks & video

- `artifacts/investor-deck` — pitch deck (Vite, presented as web slides)
- `artifacts/company-profile-deck` — corporate profile deck
- `artifacts/marketing-demo-video` — animated 90-second product video (GSAP/R3F via `video-js` skill)

---

## 6. Shared libraries (`lib/`)

| Lib | Description |
|-----|-------------|
| `@workspace/db` | Drizzle schema (29 tables, 18 enums) + `pg.Pool` client |
| `@workspace/api-spec` | OpenAPI source (single source of truth) |
| `@workspace/api-zod` | Generated Zod schemas |
| `@workspace/api-react-query` | Generated React Query hooks |

Codegen: `pnpm --filter @workspace/api-spec run codegen` regenerates `api-zod` + `api-react-query` from the spec.

---

## 7. Background workers

- `artifacts/enrichment-scraper` — Playwright + stealth long-running worker that pulls public data into `scraper_cache`
