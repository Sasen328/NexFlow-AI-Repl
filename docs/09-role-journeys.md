# NexFlow — Role Journeys

> A walk-through of a typical day for each of the five demo personas.

---

## 1. Khalid Al-Otaibi — Senior Sales Executive (`sales`)

**Goal:** Hit quota with the least context-switching.

### Morning (Sun-Thu, 8:30 AM Riyadh)

1. Opens NexFlow on mobile during commute → **Briefing** tab.
2. AI brief in Khaleeji male voice (Tarik) reads the top 3 priorities, hot leads and at-risk deals.
3. Tapping a hot lead opens the contact 360° with last-touch context.
4. Khalid says "Send Sara at Gulf Ventures the Q2 proposal in Arabic" → Operator agent drafts the email, attaches the latest proposal, queues it for approval.

### Mid-morning (in office)

5. Switches to web. **Command Center** → "Ask AI": "What changed on the Aramco deal yesterday?"
6. Reply summarises: pricing approved, technical eval scheduled, Reem flagged as new champion.
7. Opens **Deals** kanban → drags Aramco from *Proposal* to *Negotiation*. Deal coach suggests next 3 moves.

### Afternoon

8. **Calls** → joins a call from the Power Dialer queue. NexFlow records, transcribes, redacts PII.
9. Post-call, the Conversation Intelligence card highlights pricing objections; AI proposes a counter and logs the activity.

### End of day

10. Mobile push: "3 leads went hot today." Khalid taps → quick-replies via WhatsApp before dinner.

**Surfaces used:** Briefing, Command Center, Contact 360°, Deals, Calls, Power Dialer, Mobile.

---

## 2. Layla Al-Sabah — Head of Sales · Gulf Region (`manager`)

**Goal:** Forecast accurately, coach reps, unblock deals.

### Morning

1. Opens **Briefing** (manager-tuned): team-level KPIs, deals at risk per AE, coverage ratio vs target.
2. **CRM Dashboard** → 3-week rolling forecast vs commit; AI variance commentary.
3. Drills into Khalid's pipeline → reviews Aramco deal coach, pings him in Sequence Comments.

### Mid-day

4. **Predictive** page → asks "Which deals will slip past quarter end?" → ranked list with probability scores and AI-suggested interventions.
5. Approves two stalled-deal automations (auto-escalate to manager when X days of no activity).

### Afternoon

6. **1:1 with Khalid** — opens his rep view, pulls call summaries from Conversation Intelligence, sets a coaching task.
7. **Approvals** → reviews 4 agent-drafted proposals; approves 3, rewrites one.

### Weekly

8. Friday QBR pull-down: clicks "Generate weekly board pack" → AI compiles a deck with attribution, top 5 wins, top 5 risks.

**Surfaces used:** Briefing, CRM Dashboard, Predictive, Approvals, Conversation Intelligence, Dashboards.

---

## 3. Faisal Al-Harbi — CEO (`ceo`)

**Goal:** Trust the forecast, see the company's pulse in 90 seconds.

### Morning

1. Opens **CEO Home** (`/ceo-home`) on iPad. Single calm screen: pipeline, MRR, churn, NPS, cash runway, top 5 deals.
2. Brief in Arabic via Hala voice: "Pipeline is up 12% week-on-week, two deals slipped from June to July, marketing CAC down 8%."
3. Asks "Who needs my help today?" → AI suggests a personal nudge to QNB CDO and a thank-you to the Mubadala team.

### Mid-day

4. **Attribution** → reviews multi-touch contribution to Q2 wins; spends two minutes, not two hours.
5. **Dashboards** → sees a custom board-pack dashboard auto-refreshed.

### Strategic moments

6. Asks Ask AI: "Build me an account expansion plan for Saudi Arabia top 50 banks." → Strategist agent returns a phased plan with named accounts, ICP fit, and a rollout calendar.
7. One tap → schedule a follow-up with the head of partnerships.

**Surfaces used:** CEO Home, Briefing, Attribution, Ask AI, Dashboards.

---

## 4. Sara Al-Mansouri — CRM Operations Lead (`admin`)

**Goal:** Keep data clean, automations safe, permissions correct.

### Daily

1. **Account Settings** → checks workspace health (data quality score, dedup queue, missing fields).
2. **Permissions** → reviews access change requests; field-level permissions audit.
3. **Automation** builder → ships a new "Hot Lead Routing" rule with a 1-step approval gate.
4. **Approvals** → clears the agent approval queue (any agent action above $X requires admin sign-off).

### Weekly

5. **DataHub AI Analytics** → asks "Show contacts created this week without a phone number." Bulk-edits.
6. **Capabilities** → flips on the new Service Cloud beta for two pilot teams.
7. Audit log export to compliance.

**Surfaces used:** Settings, Permissions, Automation, Approvals, DataHub, Capabilities, Audit Log.

---

## 5. Reem Al-Qahtani — Head of Marketing (`marketing`)

**Goal:** Generate qualified pipeline with content the GCC actually responds to.

### Monday

1. **Marketing Workspace** → AI Briefing identifies the highest-performing content theme last week.
2. **Marketing Dashboard** → 3-up AI analysis (Winning / Pain / How-to-Win) gives a one-screen snapshot.

### Building a campaign

3. **Campaign Builder** → 6-step AI Builder wizard:
   - Step 1 — paste brief
   - Step 2 — Cultural Intelligence ON (Khaleeji aesthetic, Sun-Wed mornings, Arabic-first)
   - Step 3 — pick channels (LinkedIn, WhatsApp, Email, IG)
   - Step 4 — AI drafts key messages and per-channel variants in the local tone
   - Step 5 — image generator produces brand-tuned visuals
   - Step 6 — schedule + publish
4. Approval routes to Layla (sales sign-off on offers).

### Mid-week

5. **Campaign Performance** → 7-KPI grid; URGENT banner shows hot leads needing rep follow-up; "Alert rep" CTA notifies the AE on mobile.
6. **Web Forms** → AI Form Creator drafts a new gated-content form with predicted conversion analysis.

### End of week

7. **Sequences & Audiences** → builds a 5-step nurture for cold-pivot accounts.
8. Reviews **Attribution** with Layla and Faisal.

**Surfaces used:** Marketing Workspace, Dashboard, Campaign Builder, Campaign Performance, Web Forms, Sequences & Audiences, Attribution.

---

## Cross-role flows

- **Hot Lead handoff**: Marketing campaign → contact crosses score threshold → automation routes to AE → push notification on mobile → Khalid calls within 5 minutes; Conversation Intelligence updates Layla's dashboard in real time.
- **Approval chain**: Operator agent drafts email → admin approval queue (if above threshold) → manager approval (if above $X) → CEO notified on close.
- **Cultural override**: Reem flags an Arabic-first audience in Cultural Intelligence; downstream sequences auto-switch tone, cadence and send windows for everyone targeting that audience.
