# NexFlow — Role-by-Role User Journey Plan

This document describes the ideal screen flow through NexFlow for each of the
five primary personas, using the new 6-tab top navigation (**Home · CRM ·
Contact Center · Enrichment · Marketing · More**). Hover any top-tab to reveal
its sub-tabs; click to land on that section's primary screen.

The point of the new IA is that every role gets to its daily work in **one or
two clicks** from the top bar, and never has to hunt for a "Dashboard" tab
that shows nothing.

---

## Top-bar map (shared across all roles)

| Top tab | Sub-tabs (visible on hover) | Primary landing page on click |
| :--- | :--- | :--- |
| **Home** | Command Center · Daily Insights · AI Assistant | `/` (Command Center) |
| **CRM** | Pipeline & Deals · Contacts · Companies · Account Hub · Quotes & CPQ · Forecasting · Health Scores | `/funnel` (Pipeline) |
| **Contact Center** | Call Dashboard · Power Dialer · Calls & Transcripts · Conversation Intel · AI Voice Agent · Knowledge Base · Email · Messages · WhatsApp | `/call-list` (Call Dashboard) |
| **Enrichment** | Bulk Enrichment · Quick Enrich Lead · Card Scanner · Buying Signals · Lead Intelligence | `/sourcing` (Bulk Enrichment) |
| **Marketing** | Campaigns · Sequences · Marketing AI · Meetings · Templates · Audiences · Web Forms · Document Tracking · Quote-to-Cash · Cultural Intelligence | `/campaigns` |
| **More ▾** | Automation · AI Hub · Insights & Analytics · Data Tools · Settings (each is a categorised group) | (dropdown only — pick a section) |

> **Why six tabs.** Five named buckets plus a "More" overflow keeps the top
> bar scannable on every viewport — phones, 13" laptops, 27" displays — and
> matches the mental model people bring from Gmail, Notion, Linear, and HubSpot.

---

## Persona 1 — CEO / Founder

**Goal:** know the state of the business in 60 seconds, get pinged when
something breaks the plan.

### Daily landing
- **Home → Command Center** (one click — already where you land at sign-in).
- The hero AI briefing is the first thing they read: pipeline weather,
  at-risk deals, AI agent activity overnight.
- The KPI strip below the hero shows Calls Today / Hot Signals / AI Sessions
  / At-Risk Deals — all clickable through to the underlying screens.

### Weekly cadence
| When | Where | Why |
| :--- | :--- | :--- |
| Mon AM | Home → Command Center | Read the AI briefing, scan "What NexFlow AI noticed for you" |
| Mon AM | CRM → Forecasting | Pipeline → Best-Case → Commit waterfall, AI risk callouts |
| Wed | More → Insights & Analytics → Team Performance | Rep leaderboards, velocity vs target |
| Fri | More → Insights & Analytics → Attribution | Where this week's pipeline came from |
| Any time a notification fires | bell icon | Single-click to the source incident |

### Single-click escape hatches
- **AI Assistant** in Home → ask anything ("how is Aramco trending?"). The
  AI links its answers back into the relevant screens.
- **More → Settings → Capabilities** for a guided tour to share with the board.

### Screens they should rarely need
- Card Scanner, Power Dialer, Sequences, Web Forms — these are operator
  tools, not exec tools. They're still reachable in one hop, just not pinned.

---

## Persona 2 — Sales Rep / Account Executive

**Goal:** start the day knowing exactly who to call, why, and what to say;
keep the pipeline clean as deals move.

### Daily landing
- **Home → Command Center**: Re-Engagement Opportunities and Next Best Actions
  drive the first hour. Tasks tab carries today's reminders.
- **Contact Center → Power Dialer** (newly position 2 — was buried at #4
  before): kick off the morning call block. The dialer auto-prioritises the
  list using AI scoring.

### Hourly flow
| Step | Where | Outcome |
| :--- | :--- | :--- |
| 1. Wake-up | Home → Command Center | Read briefing, accept/dismiss Next Best Actions |
| 2. Calls | Contact Center → Power Dialer | Run AI-prioritised dialer queue |
| 3. Live calls | Contact Center → Call Dashboard | See queue + live transcripts |
| 4. Post-call | Contact Center → Calls & Transcripts | Review AI summary, tag follow-ups |
| 5. Update deals | CRM → Pipeline & Deals | Drag deals across stages |
| 6. New leads | Enrichment → Quick Enrich Lead | Single-shot AI enrichment in 6 sec |
| 7. Field-trip leads | Enrichment → Card Scanner | Snap a business card on mobile, lands enriched in CRM |
| 8. Outbound nudges | Contact Center → WhatsApp / Email / Messages | 1-to-1 follow-up in the customer's preferred channel |
| 9. Day-end | CRM → Forecasting | Confirm what they're committing this week |

### Why the IA helps this role
- **Power Dialer at position 2** means the most-used outbound tool is two
  clicks from anywhere instead of four.
- **Card Scanner moved to Enrichment** matches the rep's mental model — it
  turns a card *into a fully enriched lead*; it's not a "Sales" tool, it's
  the front door for new data.
- **No more empty "Dashboard" duplicate** in Contact Center — the strip now
  starts with **Call Dashboard**, which is the actual operational hub.

---

## Persona 3 — Sales Manager / VP Sales

**Goal:** coach the team, unblock deals, hit the number.

### Daily landing
- **Home → Command Center** filtered to their team (KPIs roll up to the team).
- **CRM → Pipeline & Deals** — instantly see deals stalled > 14 days.

### Coaching flow
| Step | Where | Outcome |
| :--- | :--- | :--- |
| 1. Pulse | Home → Command Center | Team briefing, at-risk count |
| 2. Deal review | CRM → Pipeline & Deals | Filter "stalled" / "at risk" |
| 3. Deal-level coach | CRM → Pipeline & Deals → click a deal | Open deal drawer, AI-suggested next steps |
| 4. Call coaching | Contact Center → Conversation Intel | Listen to a rep's call with AI sentiment, talk-listen ratio, objection trends |
| 5. 1:1 prep | More → Insights & Analytics → Team Performance | Per-rep velocity, win-rate trend |
| 6. Forecast | CRM → Forecasting | Best-Case → Commit waterfall before the Friday roll-up |
| 7. Approvals | bell icon → notifications | Quote / discount approvals in one click |

### Routing & Automation
- **More → Automation → Lead Routing** to tweak the auto-assign rules when
  a rep takes leave or a region heats up.
- **More → Automation → Workflow Builder** to instrument a new "Series B
  raised → CIO outreach" play once and let it run.

---

## Persona 4 — Marketing / Demand Gen

**Goal:** ship campaigns, measure impact, hand qualified leads to sales.

### Daily landing
- **Marketing → Campaigns** (one click — was previously two clicks past an
  empty "Dashboard" tab).
- The Campaigns page is the dashboard: active campaigns, sends today, open
  rates, pipeline sourced.

### Production flow
| Step | Where | Outcome |
| :--- | :--- | :--- |
| 1. Pulse | Marketing → Campaigns | Today's sends, open rates, pipeline sourced |
| 2. Build a campaign | Marketing → Campaigns → "New" | Multi-channel campaign builder |
| 3. Compose content | Marketing → Marketing AI | AI generates Khaleeji / MSA / English copy |
| 4. Lift cultural relevance | Marketing → Cultural Intelligence | Auto-pause Maghrib, Ramadan greeting templates |
| 5. Pick the audience | Marketing → Audiences | Smart segments built from CRM signals |
| 6. Pick the template | Marketing → Templates | Reusable content blocks |
| 7. Lead capture | Marketing → Web Forms | Drop a form on the site, leads stream into CRM |
| 8. Document tracking | Marketing → Document Tracking | Who opened the proposal, how long for |
| 9. Booking | Marketing → Meetings | Calendar widget, time-zone-aware for GCC |
| 10. Attribution | More → Insights & Analytics → Attribution | Multi-touch revenue attribution |

### Cross-functional moments
- **Enrichment → Buying Signals** to find net-new accounts to target.
- **Contact Center → Conversation Intel** to mine "voice of customer"
  themes and turn them into campaign messaging.

---

## Persona 5 — IT / Admin

**Goal:** keep the platform running, configured, secure, integrated.

### Daily landing
- **More → Settings → Account Settings** — most admin work starts here.
- The bell icon for any system / billing notifications.

### Admin tasks by where they live
| Task | Where |
| :--- | :--- |
| Add or remove users | More → Settings → Account Settings → Users |
| Change permissions / roles | More → Settings → Permissions |
| Audit security & compliance | More → Settings → Trust Center |
| Define custom fields | More → Data Tools → Properties |
| Merge duplicate contacts | More → Data Tools → Deduplication |
| Bulk import / export | More → Data Tools → Migration |
| Build / edit lists | More → Data Tools → Lists |
| Build / edit segments | More → Data Tools → Segments |
| Configure routing rules | More → Automation → Lead Routing |
| Build a workflow | More → Automation → Workflow Builder |
| Set up an AI agent | More → Automation → Agent Builder |
| Activity capture (auto-log emails / calls) | More → Automation → Activity Capture |
| Capabilities tour for onboarding new users | More → Settings → Capabilities |
| Investor data-room access | `/investors` (out-of-shell, passcode gated) |

### Why "More" works for admins
- Admin work is *episodic* — done in batches, not every hour. Tucking
  Automation, AI Hub, Insights, Data Tools, and Settings under **More**
  keeps the top bar uncluttered for the operators (CEO / Sales / Marketing)
  who use it constantly.
- Inside the More dropdown, the sections are **categorised** with their own
  small headers so admins can scan the full surface area in one glance.

---

## Cross-role IA principles applied

| Principle | How it's applied | Who benefits |
| :--- | :--- | :--- |
| One front door per role | The first sub-tab of each section is the role's daily landing | Everyone |
| No empty hub pages | Removed the auto-generated "Dashboard" sub-tab everywhere it duplicated a real one | Everyone — fixes the "Why is there a blank Dashboard?" complaint |
| Most-used tools first | Power Dialer moved to position 2 in Contact Center; Pipeline & Deals first in CRM | Sales reps + managers |
| Tools belong with their job-to-be-done | Card Scanner moved from Sales → Enrichment because it's a data-entry tool, not a sales workflow | Reps in the field |
| Hide infrequent surfaces | Automation, AI Hub, Insights, Data Tools, Settings all under More | Operators get a clean nav; admins still have one-hop access |
| Hover ≠ click | Hovering reveals sub-tabs as a tooltip dropdown so power users can jump anywhere in two clicks; clicking a top-tab still navigates to that section's daily landing | Power users |

---

## What changed (vs the previous nav)

| Before | After |
| :--- | :--- |
| 9 visible top sections (Home, Sales, Call Center, Marketing, Enrichment, Automation, AI Hub, Insights, Data) | 6 visible top buttons (Home, CRM, Contact Center, Enrichment, Marketing, More) |
| Every section started with an auto "Dashboard" sub-tab pointing at `/section/<key>` — often empty | Auto-Dashboard removed everywhere; section's primary screen is the dashboard |
| Contact Center order: Dashboard, Call Dashboard, Calls & Transcripts, Power Dialer, ... | Call Dashboard, **Power Dialer**, Calls & Transcripts, Conversation Intel, ... |
| Card Scanner was the 7th tab under Sales | Card Scanner is the 3rd tab under Enrichment |
| "Sales" + "Data" were two separate top tabs with overlapping concerns | CRM rolls up customer-facing work; Data Tools (Lists, Segments, Properties, Dedup, Migration) live under More for admins |
| No hover preview — clicking a section took you to the hub page even if you wanted a sub-tab | Hovering any top tab shows the section's sub-tabs in a dropdown — power users jump in one extra click |
