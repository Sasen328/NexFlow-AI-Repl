# NexFlow — App Documentation

> A user-facing tour of every section, with keyboard shortcuts, AI surfaces, and demo personas.

---

## 1. Demo personas (one-click sign-in)

`artifacts/nexflow/src/lib/marketing-auth.ts` ships 5 personas you can switch between in the top bar avatar menu.

| Persona | Name | Role | Best for |
|---------|------|------|----------|
| `sales` | Khalid Al-Otaibi | Senior Sales Executive | Day-in-the-life of a closer |
| `manager` | Layla Al-Sabah | Head of Sales · Gulf Region | Pipeline + team views |
| `ceo` | Faisal Al-Harbi | CEO | Forecast, attribution, board view |
| `admin` | Sara Al-Mansouri | CRM Operations Lead | Permissions, automations, audit |
| `marketing` | Reem Al-Qahtani | Head of Marketing | Marketing dashboard, builder |

`signInAs(key)` writes `nf_role` + `nf:signedIn=1` and dispatches `nf:role-change` so the whole app re-renders for the new role.

## 2. Auth gate

- **Public**: `/`, `/welcome`, `/about`, `/pricing`, `/signin`, `/signup`, `/investors`
- Everything else flows through `ProtectedAppLayout` → redirects to `/signin` when not authenticated.

## 3. Home

### 3.1 Briefing (`/briefing`)

Today's pre-meeting brief, persona-tuned via `PERSONA_BRIEFINGS`. Shows:

- Top 3 priorities for today
- Hot leads with reason
- Deals at risk
- AI-suggested next 3 actions
- One-tap voice playback in the persona's preferred Gulf voice

### 3.2 Command Center (`/command-center`)

A single search/command bar plus:

- "Ask AI" button → dispatches `nf:open-assistant` to the floating bubble
- Recent activity feed
- Critical signals strip

### 3.3 Predictive (`/predictive`)

Inline AI panel wired to `/api/ai/assistant` via `apiFetch`:

- Predicted close dates per deal
- Deal health (red/amber/green) with reason
- Account whitespace recommendations

## 4. CRM

| Page | What it does |
|------|--------------|
| `Contacts` (`/contacts`) | List + filters + 360° contact profile (`/contact-profile/:id`) |
| `Companies` (`/companies`) | Account list + 360° company detail (`/company-detail/:id`) |
| `Accounts` (`/accounts`) | ABM-style account view |
| `Deals` (`/deals`) | Kanban + table, drag stage, AI deal coach |
| `Activities` (`/activities`) | Logged engagements |
| `Activity Capture` (`/activity-capture`) | Voice → AI summary → activity record |
| `Calls` (`/calls`) | Call list, redaction (`/call-redaction`) |
| `CRM Dashboard` (`/crm-dashboard`) | Pipeline KPIs |

## 5. Marketing

| Page | What it does |
|------|--------------|
| **Marketing Workspace** (`/section/marketing`) | Section landing |
| **Marketing Dashboard** (`/marketing-dashboard`) | KPI tiles · 3-up AI analysis (Winning / Pain / How-to-Win) via `/api/marketing/assistant-chat` · Cultural Intelligence banner · Hot Lead Alerts |
| **Campaign Builder** (`/campaign-builder`) | Tabs: *Sales Funnel*, *AI Builder* (6-step wizard, per-channel variants, image gen via `/api/marketing/generate-image`), *Manual Builder*, *Publishing* (7 channels, schedule, POST `/api/marketing/publish/:campaignId`) |
| **Sequences & Audiences** (`/sequences-audiences`) | Sub-tabs lazy-load `SequencesPage`, `TemplatesPage`, `AudiencesPage` |
| **Web Forms** (`/web-forms`) | AI Form Creator + Predictive Analysis card + edit / embed / submissions |
| **Campaign Performance** (`/campaign-performance`) | Per-campaign 7-KPI grid · ROI strip · hot-lead URGENT banner · AI improvement suggestions w/ Re-analyse |

All AI calls extract JSON via `reply.match(/\{[\s\S]*\}/)` and gracefully fall back to sample data when the AI provider isn't configured.

## 6. Service

| Page | What it does |
|------|--------------|
| `Call Center · Agent` (`/callcenter-agent`) | Live agent console |
| `Call Center · Dashboard` (`/callcenter-dashboard`) | Queue and SLA KPIs |
| `Call Center · Knowledge Base` (`/callcenter-knowledge-base`) | Articles + AI search |
| `Call Center · Messages` (`/callcenter-messages`) | Omnichannel inbox |
| `Contact Center Setup` (`/contact-center-setup`) | IVR + routing |
| `Conversation Intelligence` (`/conversation-intelligence`) | Call transcript analysis |

## 7. Engines

| Engine | What it does |
|--------|--------------|
| **Lead Finder** | Generates a fresh prospect list from a brief |
| **Masaar** | Plans the next 7-touch path for an account |
| **Prosengine — Person** | Deep-research a single contact (Researcher agent) |
| **Prosengine — Company** | Deep-research a company |
| **Cultural Intelligence** | Tone presets per market & persona |
| **Agent Builder** (`/agent-builder`) | Build custom agents with tools |
| **Automation** (`/automation`) | If-this-then-that with approvals |

## 8. Analytics

| Page | What it does |
|------|--------------|
| `Dashboards` (`/dashboards`) | Built-in + custom dashboards |
| `Dashboard Detail` (`/dashboard-detail/:id`) | Drill in, share, export |
| `Attribution` (`/attribution`) | Multi-touch attribution |
| `DataHub AI Analytics` (`/datahub-ai-analytics`) | Ask the warehouse in natural language |

## 9. Settings

| Page | What it does |
|------|--------------|
| `Account Settings` (`/account-settings`) | Profile, language, voice preference |
| `Permissions` (`/permissions`) | Roles, field-level (Business+) |
| `Capabilities` (`/capabilities`) | Feature flags per workspace |
| `Approvals` (`/approvals`) | Pending agent / automation approvals |

## 10. Floating Ask AI bubble

Available on every page once signed in.

- Click bubble → opens panel
- Mic icon → STT in current language (AR/EN toggle on toolbar)
- Speaker icon → TTS playback in matched Gulf voice
- AR/EN toggle → switches both STT (`en-US` ↔ `ar-AE`) and TTS voice; preference saved as `nf:assistant:lang`
- The bubble listens for `nf:open-assistant` CustomEvent — any page can dispatch with `detail.text` to open and auto-submit

## 11. Voice

`lib/voice.ts pickVoice(lang)`:

- `ar-SA` / `ar-AE` → prefers Zariyah, Hala, Layla (female) and Tarik, Naayf, Omar (male)
- Falls back to any available Arabic voice, then any voice in the requested language, then default
- Choice persists per-tab; user preference in account settings overrides

## 12. Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd / Ctrl + K` | Open Command Center search |
| `Cmd / Ctrl + Shift + A` | Open Ask AI bubble |
| `Cmd / Ctrl + Shift + L` | Toggle AR/EN |
| `?` | Open shortcut cheat sheet |

## 13. Mobile companion

- Expo iOS/Android app shares auth and data with web
- Tabs: Briefing · Calls · Capture · Settings
- Native voice capture posts to `/api/activity-capture`
- Push notifications for hot signals
