# 03 — Component & Page Inventory

> **Document scope:** every reusable component and every routed page that exists today in the NexFlow web app (`artifacts/nexflow/src/`) and the mobile app (`artifacts/mobile/`). The doc is split into two parts:
>
> - **Part A — Component inventory.** Every file under `artifacts/nexflow/src/components/` and `artifacts/mobile/components/`, with key props, behavior, and primary callers. This is the canonical "component tree" view.
> - **Part B — Pages by TopBar section.** Every routed page in `artifacts/nexflow/src/pages/`, grouped by the eight TopBar mega-dropdown sections (matching the actual `NAV_GROUPS` array in `src/components/layout/TopBar.tsx`). Pages are listed here because each page is itself a top-level component, but the bespoke building blocks they use are catalogued in Part A.

The web app uses [shadcn/ui](https://ui.shadcn.com) (Radix primitives + Tailwind) plus a small set of bespoke layout / brand components. The mobile app uses Expo + React Native with hand-rolled UI primitives (no shadcn there). Pages are routed via `wouter` on web and `expo-router` on mobile.

---

# Part A — Component inventory

## A.1 Web — bespoke components

### `src/components/layout/TopBar.tsx` (384 lines)

Sticky glassmorphism header. The single source of truth for navigation: the `NAV_GROUPS` array at the top of the file declares the eight mega-dropdowns (`home`, `sales`, `call-center`, `marketing`, `automation`, `ai-hub`, `insights`, `data`) and every link inside each. Each group renders as a click-triggered overlay with one tile per route; tiles include an icon (lucide-react), a label, and a one-line `desc`.

- **Props:** `{ dark: boolean; onDark: (v: boolean) => void }` — receives the light/dark mode flag from `App.tsx` and the toggle handler.
- **A11y:** every trigger button has `aria-haspopup="true"`, `aria-expanded`, `aria-controls={panelId}`; every panel has `role="menu"` and labelled tile buttons.
- **Dismissal:** outside click (mousedown listener), route change (`useLocation` from `wouter`), Escape key, and clicking a tile.
- **Right-hand affordances:** global search input slot, notifications bell driven by `useNotifications()` from `src/hooks/useApi.ts` (badge with unread count), dark-mode toggle, avatar dropdown linking to `/account-settings` and a sign-out item.
- **Mobile:** below `lg` breakpoint the header collapses to a burger that opens a full-screen overlay listing every group + every link.
- **Imported by:** `src/App.tsx` (always, above the routed page).

### `src/components/layout/Sidebar.tsx`

Legacy left-rail nav, kept in the repo as a fallback for narrow drawer scenarios but **not mounted anywhere in the current `App.tsx`**. Safe to delete once the responsive design has been signed off; left in for now to preserve the option of a side-drawer mode.

### `src/components/layout/LivingMesh.tsx`

The brand background. 10 absolute-positioned blurred radial gradient nodes in the chameleon palette (Lavender, Rose-Mauve, Seafoam, Sand, Mist, Olive). Each node has its own animation duration in the 22–34 second range, deliberately coprime so the composition never visually loops within a single user session. Mounted once at app root with `z-[-1]` so all UI floats above it.

- **Props:** none.
- **Imported by:** `src/App.tsx`.

### `src/components/layout/NexFlowLogo.tsx`

Two named exports:

- `NexFlowLogo({ size?: number })` — the diamond mark only. Default size `36`. Renders inline SVG with the chameleon stroke gradient.
- `NexFlowWordmark({ className?: string })` — the full lockup (mark + "NexFlow" wordmark + tagline `ORCHESTRATING SUPREME MARKET CLARITY`). Fixed wordmark width of 160 px in the SVG.

Imported by: `TopBar`, the auth shell, error boundary, and any "branded" page header. The mobile app uses its own hand-rolled equivalent in `artifacts/mobile/app/_layout.tsx`.

### `src/components/VoiceCallModal.tsx` (544 lines)

Full-screen "live call" overlay. Used from the call center, contact profile, and power-dialer flows.

- **Props:** `{ contact: { id, first_name?, last_name?, title?, company_name? }, onClose: () => void, onCallSaved?: (callId: string) => void }`.
- **Speech pipeline (browser-side):** `window.SpeechRecognition || window.webkitSpeechRecognition` captures each user utterance; `window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))` speaks the AI reply. There is no PSTN, no Twilio, and no server-side Whisper involved — see `docs/02-tech-stack.md` §7 for the full clarification.
- **AI round-trip:** every captured utterance is appended to a local `messages: Message[]` array and POSTed to `POST /api/calls/voice-response`, which returns `{ reply: string }`. The system prompt branches on `language === "ar"` to produce a Gulf-Arabic reply when the contact is Arabic-language.
- **Persistence:** the full transcript is saved to the `calls` table on hangup via `apiFetch("/api/calls/log")`.
- **UI:** mic on/off, end-call, live transcript pane, AI assistant suggestion column, post-call scorecard (calls `POST /api/calls/scorecard`).

### `src/components/ui/*.tsx`

A complete shadcn/ui install of Radix-based primitives. Each file is a thin wrapper that adds Tailwind classes and the chameleon design tokens.

Files present (54 total):

`accordion.tsx`, `alert-dialog.tsx`, `alert.tsx`, `aspect-ratio.tsx`, `avatar.tsx`, `badge.tsx`, `breadcrumb.tsx`, `button-group.tsx`, `button.tsx`, `calendar.tsx`, `card.tsx`, `carousel.tsx`, `chart.tsx`, `checkbox.tsx`, `collapsible.tsx`, `command.tsx`, `context-menu.tsx`, `dialog.tsx`, `drawer.tsx`, `dropdown-menu.tsx`, `empty.tsx`, `field.tsx`, `form.tsx`, `hover-card.tsx`, `input-group.tsx`, `input-otp.tsx`, `input.tsx`, `item.tsx`, `kbd.tsx`, `label.tsx`, `menubar.tsx`, `navigation-menu.tsx`, `pagination.tsx`, `popover.tsx`, `progress.tsx`, `radio-group.tsx`, `resizable.tsx`, `scroll-area.tsx`, `select.tsx`, `separator.tsx`, `sheet.tsx`, `sidebar.tsx`, `skeleton.tsx`, `slider.tsx`, `sonner.tsx`, `spinner.tsx`, `switch.tsx`, `table.tsx`, `tabs.tsx`, `textarea.tsx`, `toast.tsx`, `toaster.tsx`, `toggle-group.tsx`, `toggle.tsx`, `tooltip.tsx`.

Most-used in the codebase: `Card` / `CardHeader` / `CardContent`, `Button`, `Input`, `Select`, `Tabs`, `Dialog`, `DropdownMenu`, `Badge`, `Tooltip`. Variants are wired via `class-variance-authority` and the chameleon CSS variables (`--nf-primary`, `--nf-secondary`, etc. — see `docs/01-brand-palette-motion.md` §2).

## A.2 Web — hooks

`src/hooks/`:

- `useApi.ts` — wraps the generated hooks from `@workspace/api-client-react` (e.g. `useNotifications`, `useContacts`, `useDeals`, `useCompanies`, `useDealsForUser`). Adds the in-app conventions: toast-on-error, query invalidation on mutations, and the `apiFetch(path, init)` escape hatch for calls that aren't yet in the OpenAPI spec.

## A.3 Mobile — `artifacts/mobile/components/`

The mobile app (Expo SDK 54, React Native, expo-router) has its own minimal component set — no shadcn, no Radix.

| File | Lines | Purpose | Notable props |
| --- | --- | --- | --- |
| `ErrorBoundary.tsx` | 54 | Top-level React error boundary that swaps the tree for `ErrorFallback` on crash. Reports the error via `console.error` (mobile is allowed `console.*`; the server is not). | `{ children: ReactNode }` |
| `ErrorFallback.tsx` | 278 | The user-visible crash screen. Branded with the chameleon gradient, includes a "Try again" CTA (`onReset`), a copy-to-clipboard "Copy diagnostic" button, and a NexFlow lockup. | `{ error: Error; resetError: () => void }` |
| `KeyboardAwareScrollViewCompat.tsx` | 29 | Cross-platform compatibility shim around `react-native-keyboard-aware-scroll-view`. Avoids iOS-vs-Android keyboard avoidance regressions on form-heavy screens like the call-log composer. | accepts standard `ScrollView` props |
| `ui/Card.tsx` | 34 | Base card surface with the chameleon glass background and rounded corners. Used as the wrapper for every list item, every detail header. | `{ children, style? }` |
| `ui/Avatar.tsx` | 21 | Round avatar with initials fallback. | `{ name?: string; uri?: string; size?: number }` |
| `ui/Badge.tsx` | 28 | Pill-shaped status indicator with palette variants (`primary`, `secondary`, `seafoam`, `sand`, `mist`, `olive`). | `{ variant?, children }` |
| `ui/StatTile.tsx` | 35 | KPI tile with a label, a large value, and a delta chip. Used on the mobile dashboard / briefing screen. | `{ label, value, delta?, variant? }` |

## A.4 Other artifacts (sandbox / video)

For completeness — not used by the production CRM:

- `artifacts/mockup-sandbox/src/components/ui/*` — a separate, smaller shadcn copy used by the design canvas. Independent of the nexflow web app.
- `artifacts/marketing-demo-video/src/components/video/` — `VideoTemplate.tsx`, `VideoWithControls.tsx`, `ReplitLoadingScene.tsx`, `ScreenshotFrame.tsx` — components specific to the 90-second marketing demo video artifact. Not reusable inside the CRM.

---

# Part B — Pages by TopBar section

The eight section headings below correspond exactly to the eight entries in the `NAV_GROUPS` array at the top of `artifacts/nexflow/src/components/layout/TopBar.tsx`. Each row is a routed page (a top-level component that lives in `src/pages/`).

## B.1 Home

> Landing & always-on AI surfaces. TopBar paths: `/`, `/insights`, `/assistant`.

| Page / component | Path | What it does |
| --- | --- | --- |
| **Command Center** (`/`) | `src/pages/briefing.tsx` | Daily briefing: morning agenda, top deals to push today, AI-flagged risks, weather-style summary of the pipeline. Hero card uses the chameleon gradient. |
| **Daily Insights** (`/insights`) | `src/pages/insights.tsx` | Stream of AI-generated insight cards (`opportunity`, `warning`, `critical` per the `insightSeverityEnum`). Each card has accept / dismiss / "do it for me" actions. |
| **AI Assistant** (`/assistant`) | `src/pages/assistant.tsx` | Conversational chat. Suggestion chips for "Brief me", "Draft follow-ups", "Find at-risk deals". Bilingual (English / Arabic). |
| `Dashboard` (`/dashboard`) | `src/pages/dashboard.tsx` | The default dashboard payload from `/api/dashboard`. Tile widgets for pipeline value, this-week activities, top reps. |

---

## B.2 Sales

> Pipeline + accounts. TopBar paths: `/funnel`, `/contacts`, `/companies`, `/accounts`, `/quotes`, `/forecasting`, `/business-cards`, `/health-scores`.

| Page / component | Path | What it does |
| --- | --- | --- |
| **Pipeline & Deals** (`/funnel`) | `src/pages/funnel.tsx`, supporting `src/pages/deals.tsx` | Drag-and-drop kanban over `dealStageEnum`. Each card shows owner avatar, value, probability, days-in-stage. Spring-snappy reorders. |
| **Contacts** (`/contacts`) | `src/pages/contacts.tsx` | Virtualized table view with saved-view tabs, filter chips, bulk actions, "AI enrich" button. |
| **Contact Profile** (`/contacts/:id`) | `src/pages/contact-profile.tsx` | Header (avatar, lead score, status), 4 tabs (Overview, Activities, Deals, Notes), and the new **PROPERTIES** card (owner, lead stage, score, company link, title, tags, last engaged, created/updated). |
| **Companies** (`/companies`) | `src/pages/companies.tsx` + `company-detail.tsx` | Account-level table + drill-in. Pulls cached `intelligence` JSONB from the company row. |
| **Account Hub (ABM)** (`/accounts`) | `src/pages/accounts.tsx` | Account-based selling view — a target list with multi-stakeholder cards per account. |
| **Quotes & CPQ** (`/quotes`) | `src/pages/quotes.tsx` | Quote list, line-item editor, send-via-email action. |
| **Quote-to-Cash** (`/quote-to-cash`) | `src/pages/quote-to-cash.tsx` | The Marketing dropdown also exposes this; it bridges accepted quotes → invoice → payment provider stub (Mada / Tap / HyperPay / PayTabs). |
| **Forecasting** (`/forecasting`) | `src/pages/forecasting.tsx` | Pipeline + commit + best-case rollup with confidence chips. |
| **Card Scanner** (`/business-cards`) | `src/pages/business-cards.tsx` | Camera / upload → OCR (server in `routes/business-cards.ts`) → auto-create contact. |
| **Health Scores** (`/health-scores`) | `src/pages/health-scores.tsx` | Per-account health score with contributing signals. Reads from `/api/health-scores`. |

---

## B.3 Call Center

> Voice + messaging hub. TopBar paths: `/call-list`, `/calls`, `/power-dialer`, `/conversation-intelligence`, `/voice-agents`, `/scripts`, `/email`, `/messages`, `/whatsapp`.

| Page / component | Path | What it does |
| --- | --- | --- |
| **Call Dashboard** (`/call-list`) | `src/pages/call-list.tsx` | Live call activity, predictive conversion metrics, connection rates, AI post-call orchestrator toggles. |
| **Calls & Transcripts** (`/calls`) | `src/pages/calls.tsx` | Full call history; click-through reveals transcript, sentiment, AI insights, coaching notes. |
| **Power Dialer** (`/power-dialer`) | `src/pages/power-dialer.tsx` | AI-prioritized outbound queue. Auto-skips no-answers, surfaces best call time per contact. |
| **Conversation Intelligence** (`/conversation-intelligence`) | `src/pages/conversation-intelligence.tsx` | Coaching: keywords, talk-listen ratio, objection handling, AI-suggested follow-ups. |
| **AI Voice Agent** (`/voice-agents`) | `src/pages/voice-agents.tsx` | Configures AI agents that dial autonomously. Bilingual (English / Arabic). |
| **Knowledge Base / Scripts** (`/scripts`) | `src/pages/scripts.tsx` | Script library across `scriptTypeEnum` (cold_call, follow_up, demo, objection_handling, closing) and language (en/ar/both). |
| **Email** (`/email`) | `src/pages/email.tsx` | 1-to-1 email composer hooked to Resend. |
| **Messages** (`/messages`) | `src/pages/messages.tsx` | Unified inbox across email / WhatsApp / SMS. |
| **WhatsApp** (`/whatsapp`) | `src/pages/whatsapp.tsx` | WhatsApp Business UI. Conversation thread + template picker. |
| `VoiceCallModal` | `src/components/VoiceCallModal.tsx` | Shared modal opened from any of the above. |

---

## B.4 Marketing

> Campaigns + content + GCC localization. TopBar paths: `/campaigns`, `/sequences`, `/marketing-assistant`, `/meetings`, `/templates`, `/audiences`, `/web-forms`, `/document-tracking`, `/quote-to-cash`, `/cultural-intelligence`.

| Page / component | Path | What it does |
| --- | --- | --- |
| **Campaigns** (`/campaigns`) | `src/pages/campaigns.tsx` | Campaign list across the `campaignChannelEnum` (email, whatsapp, sms, linkedin, voice). |
| **Sequences** (`/sequences`) | `src/pages/sequences.tsx` | Multi-step automated cadences. |
| **Marketing AI** (`/marketing-assistant`) | `src/pages/marketing-assistant.tsx` | Conversational assistant for campaigns. Generates copy, hero images, subject lines, GCC-localized variants. |
| **Meetings** (`/meetings`) | `src/pages/meetings.tsx` | Booked-meeting list. |
| **Templates** (`/templates`) | `src/pages/templates.tsx` | Reusable email / message templates. |
| **Audiences** (`/audiences`) | `src/pages/audiences.tsx` | Built segments for outreach. |
| **Web Forms** (`/web-forms`) | `src/pages/web-forms.tsx` | Lead-capture form builder + embed snippet. |
| **Document Tracking** (`/document-tracking`) | `src/pages/document-tracking.tsx` | Per-document open / scroll / forward analytics. |
| **Cultural Intelligence** (`/cultural-intelligence`) | `src/pages/cultural-intelligence.tsx` | GCC-specific cultural calendar, naming, dialect, payment-method, and Hijri-aware send-time guidance. |

---

## B.5 Automation

> Build flows + auto-routing. TopBar paths: `/workflows`, `/automation`, `/agents`, `/lead-routing`, `/activity-capture`.

| Page / component | Path | What it does |
| --- | --- | --- |
| **Workflow Builder** (`/workflows`) | `src/pages/workflows.tsx` | Visual node-and-edge builder. Trigger nodes from `automationTriggerEnum` (stage_change, activity_completed, signal_received, no_answer, form_submitted, score_threshold, schedule, campaign_open). |
| **Automation Rules** (`/automation`) | `src/pages/automation.tsx` | If-this-then-that list view of the same triggers, simpler to author. |
| **Agent Builder** (`/agents`) | `src/pages/agent-builder.tsx` | Custom AI agent author — system prompt + variables + templates (Quote Wizard, Discovery Coach). "Improve with AI" rewrites the prompt. Each agent persists to `ai_agents`; runs persist to `ai_agent_runs`. |
| **Lead Routing** (`/lead-routing`) | `src/pages/lead-routing.tsx` | Round-robin / weighted / territory-based assignment to reps. |
| **Activity Capture** (`/activity-capture`) | `src/pages/activity-capture.tsx` | Auto-log emails & calls; toggles for which channels are captured. |

---

## B.6 AI Hub

> AI-first surfaces beyond the always-on assistant. TopBar paths: `/intelligence`, `/ai`, `/predictive`, `/sourcing`, `/lead-enrich`, `/signals`, `/playbooks`.

| Page / component | Path | What it does |
| --- | --- | --- |
| **Lead Intelligence** (`/intelligence`) | `src/pages/intelligence.tsx` | Cross-signal scoring + prioritization queue. |
| **AI Workforce** (`/ai`) | `src/pages/ai.tsx` | Catalog of pre-built AI workers (SDR, researcher, coach, redactor). |
| **Predictive** (`/predictive`) | `src/pages/predictive.tsx` | Forecasts, churn risk, deal slip probability. |
| **Enrichment** (`/sourcing`) | `src/pages/sourcing.tsx` | Bulk lead-source AI flow. |
| **Quick Enrich Lead** (`/lead-enrich`) | `src/pages/lead-enrich.tsx` | Single-shot AI enrichment for one contact. |
| **Signals** (`/signals`) | `src/pages/signals.tsx` | Buying-intent feed. Reads `signals` table, color-coded by `signalTypeEnum`. |
| **Sales Playbooks** (`/playbooks`) | `src/pages/playbooks.tsx` | Battle-tested plays per industry / vertical. |
| `VoiceAgents` (cross-listed) | `src/pages/voice-agents.tsx` | Also reachable from Call Center; the AI Hub view focuses on agent-team management. |

---

## B.7 Insights

> Dashboards + reports. TopBar paths: `/dashboards`, `/reports`, `/analytics`, `/team`, `/attribution`, `/report-builder`.

| Page / component | Path | What it does |
| --- | --- | --- |
| **Dashboards** (`/dashboards`) | `src/pages/dashboards.tsx` + `dashboard-detail.tsx` | List + drill-in. Widgets are persisted to `dashboard_widgets`. AI Dashboard Generator from a natural-language prompt. |
| **Reports** (`/reports`) | `src/pages/reports.tsx` | Saved reports. |
| **Analytics** (`/analytics`) | `src/pages/analytics.tsx` | Funnel + KPI deep-dive with time-series charts (Recharts). |
| **Team Performance** (`/team`) | `src/pages/team.tsx` | Rep leaderboards. Activity volume + conversion + sentiment. |
| **Attribution** (`/attribution`) | `src/pages/attribution.tsx` | Multi-touch revenue attribution (first-touch, last-touch, U-shape, W-shape, custom). |
| **Report Builder** (`/report-builder`) | `src/pages/report-builder.tsx` | Drag-and-drop report author. |

---

## B.8 Data

> Records, segments, custom fields, migration. TopBar paths: `/lists`, `/segments`, `/dedup`, `/migration`, `/account-settings/properties`.

| Page / component | Path | What it does |
| --- | --- | --- |
| **Lists** (`/lists`) | `src/pages/lists.tsx` + `list-detail.tsx` | Static + dynamic lists. Static lists persist to `static_lists` + `static_list_members`. |
| **Segments** (`/segments`) | `src/pages/segments.tsx` | Smart segments backed by saved filter queries. |
| **Deduplication** (`/dedup`) | `src/pages/dedup.tsx` | Scanner + merge UI. Server in `routes/dedup.ts`. |
| **Migration** (`/migration`) | `src/pages/migration.tsx` | CSV import / export wizard. |
| **Properties** (`/account-settings/properties`) | `src/pages/properties.tsx` | Custom property registry across `propertyObjectEnum` and `propertyTypeEnum`. |

---

## B.9 Account Settings hub

Routes: `/account-settings` and `/account-settings/:section`. Single tabbed page (`src/pages/account-settings.tsx`) consolidating:

| Section | Page module |
| --- | --- |
| Settings | `settings.tsx` |
| Permissions | `permissions.tsx` (field-level matrix + approval rules) |
| Properties | `properties.tsx` |
| Trust Center | `trust-center.tsx` |
| Public Trust | `public-trust.tsx` (linked, not embedded) |
| Capabilities | `capabilities.tsx` |
| Migration | `migration.tsx` |

Side-nav groups: ACCOUNT / DATA & FIELDS / SECURITY & TRUST / PLATFORM. Lazy-loaded. Invalid section keys redirect to `/account-settings/settings`.

---

## B.10 Mobile pages (expo-router)

Source: `artifacts/mobile/`.

### App / routing (Expo Router)

| File | Route | Purpose |
| --- | --- | --- |
| `app/_layout.tsx` | root | Theme + providers (`@tanstack/react-query`, fonts). |
| `app/(tabs)/_layout.tsx` | tabs container | Bottom tab bar. |
| `app/(tabs)/index.tsx` | `/` | Dashboard tile feed. |
| `app/(tabs)/contacts.tsx` | `/contacts` | Contact list. |
| `app/(tabs)/calls.tsx` | `/calls` | Call history + log-call action. |
| `app/(tabs)/pipeline.tsx` | `/pipeline` | Mobile-friendly pipeline kanban. |
| `app/(tabs)/agents.tsx` | `/agents` | Manage AI agents on the go. |
| `app/contact/[id].tsx` | `/contact/:id` | Contact detail. |
| `app/sourcing.tsx` | `/sourcing` | Quick-enrich flow. |
| `app/notifications.tsx` | `/notifications` | Notification feed. |
| `app/+not-found.tsx` | 404 | Fallback. |

The mobile app reuses the typed API client from `@workspace/api-client-react` so there's no duplicate request layer. For the per-file mobile component reference, see Part A.3 above.

---

## B.11 Cross-section: AI surfaces

Components that render AI behavior live across the dropdowns; for clarity:

- **Always-on**: `assistant.tsx` (conversational), `briefing.tsx` (daily morning brief).
- **Author**: `agent-builder.tsx` (define agents), `marketing-assistant.tsx` (campaign copy + assets), `report-builder.tsx` (NL → report), AI Dashboard Generator inside `dashboards.tsx`.
- **Apply**: `intelligence.tsx`, `predictive.tsx`, `signals.tsx`, `lead-enrich.tsx`, `sourcing.tsx`, `playbooks.tsx`, `conversation-intelligence.tsx`, `voice-agents.tsx`.
- **Govern**: `redaction` (PII out of recordings; server in `routes/redaction.ts`), `permissions.tsx` (who sees AI-derived fields), `trust-center.tsx`.

All AI surfaces ultimately call `aiChat` / `aiJson` in `artifacts/api-server/src/lib/ai.ts`. See `docs/02-tech-stack.md` §7.
