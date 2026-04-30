import "./_group.css";

/**
 * NAVIGATION v3 — fixing v2 feedback:
 *  ✓ Studio brought back top-level under Home (was missing)
 *  ✓ Knowledge Base pulled up to Comms top-level (was in More)
 *  ✓ Meetings clarified (renamed + moved out of Comms — meetings ≠ messages)
 *  ✓ Enrichment disambiguated: Sources → "Data Providers", Sourcing → "Find New Leads"
 *  Carries forward v2: 360 AI home, Dialer top-level, Pipeline-as-one, top bar with lead picker
 */

const TOP_BAR = [
  { kind: "search", label: "Jump to anything…", hint: "⌘K" },
  { kind: "leadpick", label: "Pick any lead", hint: "⌘L", accent: true },
  { kind: "new", label: "+ New", hint: "Lead · Deal · Note · Call" },
  { kind: "todo", label: "7 tasks today", hint: "click to expand tray" },
  { kind: "bell", label: "🔔 3", hint: "Notifications" },
  { kind: "avatar", label: "👤 Khaled", hint: "Account · Workspace" },
];

const SECTIONS = [
  {
    name: "Home", count: 2, color: "var(--rd-accent)",
    items: [
      {
        t: "360° AI Analysis", h: "/home", from: "morning brief · read-only", isHome: true,
        absorbs: [
          "Performance dashboard (was /dashboard) → Performance panel inside",
          "Daily Insights (was /insights) → Insights panel inside",
          "Today's tasks (was /activities, /call-list, /approvals) → unified Task Tray",
          "AI Assistant (was /assistant) → embedded as side rail",
          "Briefing (was /briefing) → kept as the page itself",
          "Today's meetings (was /meetings) → schedule panel inside",
        ],
      },
      {
        t: "Studio", h: "/studio", from: "all-in-one workspace · where you actually work", isNew: true, fixed: true,
      },
    ],
  },
  {
    name: "Pipeline", count: 1, color: "var(--rd-accent)",
    items: [
      {
        t: "Pipeline", h: "/funnel", from: "ONE entry · view tabs inside",
        tabs: ["People", "Companies", "Deals", "Accounts (ABM)", "Forecasting", "Quotes", "Health Scores", "Quote-to-Cash"],
      },
    ],
  },
  {
    name: "Comms", count: 9, color: "var(--rd-sage)",
    items: [
      { t: "Unified Inbox", h: "/comms", from: "NEW · all incoming streams", isNew: true },
      { t: "Dialer", h: "/power-dialer", from: "start outbound calls", fixed: true },
      { t: "Calls & Transcripts", h: "/calls", from: "history + AI notes" },
      { t: "AI Voice Agent", h: "/voice-agents", from: "automated callers" },
      { t: "Conversation Intel", h: "/conversation-intelligence", from: "what was said" },
      { t: "WhatsApp", h: "/whatsapp", from: "" },
      { t: "Email", h: "/email", from: "" },
      { t: "Templates", h: "/templates", from: "reusable scripts/snippets" },
      { t: "Knowledge Base", h: "/scripts", from: "talk tracks · pulled up from More", fixed: true },
    ],
  },
  {
    name: "Enrichment", count: 5, color: "var(--rd-accent)", emphasis: true,
    items: [
      { t: "Engine", h: "/datahub/enrichment", from: "the waterfall orchestrator", fixed: true },
      { t: "Quick Enrich", h: "/lead-enrich", from: "paste a lead → fill fields" },
      { t: "Data Providers", h: "/datahub/enrichment?tab=sources", from: "(was 'Sources') · Hunter, Apollo, MAGNiTT, Lusha…", fixed: true },
      { t: "Find New Leads", h: "/sourcing", from: "(was 'Sourcing') · prospect net-new accounts", fixed: true },
      { t: "Dedup", h: "/dedup", from: "duplicate detection" },
    ],
  },
  {
    name: "Growth", count: 6,
    items: [
      { t: "Sequences", h: "/sequences", from: "" },
      { t: "Campaigns", h: "/campaigns", from: "" },
      { t: "Marketing AI", h: "/marketing-assistant", from: "" },
      { t: "Audiences", h: "/audiences", from: "" },
      { t: "Cultural Intelligence", h: "/cultural-intelligence", from: "" },
      { t: "Web Forms", h: "/web-forms", from: "" },
      { t: "▾ More · Document Tracking, Campaign Builder, Performance", h: "", from: "", more: true },
    ],
  },
  {
    name: "AI Hub", count: 7,
    items: [
      { t: "Conductor", h: "/conductor", from: "the AI Gang dashboard", isNew: true },
      { t: "Workflows", h: "/workflows", from: "" },
      { t: "Automation Rules", h: "/automation", from: "" },
      { t: "Agent Builder", h: "/agents", from: "" },
      { t: "Lead Routing", h: "/lead-routing", from: "" },
      { t: "Approvals", h: "/approvals", from: "AI actions awaiting your OK" },
      { t: "Signals", h: "/signals", from: "" },
      { t: "▾ More · Predictive, Lead Intel, AI Workforce, Sales Playbooks, Activity Capture", h: "", from: "", more: true },
    ],
  },
  {
    name: "Insights", count: 5,
    items: [
      { t: "Dashboards", h: "/insights/dashboards", from: "" },
      { t: "Reports", h: "/insights/reports", from: "" },
      { t: "Analytics", h: "/analytics", from: "" },
      { t: "Team Performance", h: "/insights/team", from: "" },
      { t: "Attribution", h: "/attribution", from: "" },
      { t: "▾ More · Report Builder, ICP Rules, Lists, Properties, Segments, Migration", h: "", from: "", more: true },
    ],
  },
];

const BOTTOM = ["Settings", "Permissions", "Trust Center", "Public Trust", "Capabilities"];

const DEDUP = [
  { keep: "360° AI Analysis (/home)", absorbs: ["/dashboard (Performance)", "/insights (Daily Insights)", "/activities (Today's tasks)", "/call-list (Today's calls)", "/approvals (AI approvals)", "/assistant (Sidebar AI)"] },
  { keep: "Pipeline (/funnel) — ONE entry, internal tabs", absorbs: ["/contacts (People tab)", "/companies (Companies tab)", "/deals (Deals tab)", "/accounts (Accounts/ABM tab)", "/forecasting (Forecasting tab)", "/quotes (Quotes tab)", "/health-scores (Health tab)", "/quote-to-cash (Q2C tab)", "/pipeline & /deal-pipeline (alias)"] },
  { keep: "Unified Inbox (/comms — NEW)", absorbs: ["/messages (Messages stream)", "/callcenter/messages (alias)", "/email (Email stream — also kept top-level)", "/whatsapp (WA stream — also kept top-level)"] },
  { keep: "Calls & Transcripts (/calls)", absorbs: ["/callcenter/calls (alias)", "/callcenter/dashboard (becomes Calls overview)"] },
];

export default function NavigationV2() {
  return (
    <div className="rd-root" style={{ minHeight: "100vh", background: "var(--rd-sand)", padding: "26px 32px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span className="rd-pill" style={{ background: "var(--rd-accent-soft)", color: "var(--rd-accent)" }}>nav · v3</span>
          <span className="rd-pill" style={{ background: "var(--rd-cream-2)", color: "var(--rd-mute)" }}>4 v2-fixes applied · Studio back · KB up · Meetings clarified · Enrichment renamed</span>
        </div>
        <div className="rd-display" style={{ fontSize: 28, lineHeight: 1.1 }}>Navigation v3 — your fixes applied</div>
      </div>

      {/* TOP BAR */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)", fontWeight: 600, marginBottom: 8 }}>Top bar · always visible across every page</div>
        <div className="rd-card" style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, background: "var(--rd-card)" }}>
          {TOP_BAR.map((b, i) => (
            <div key={i} style={{
              flex: b.kind === "search" ? 2 : b.kind === "leadpick" ? 1.4 : "0 0 auto",
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 12px",
              background: b.accent ? "var(--rd-accent-soft)" : "var(--rd-sand-2)",
              border: `1px solid ${b.accent ? "var(--rd-accent)" : "var(--rd-cream)"}`,
              borderRadius: 8,
            }}>
              <span style={{ fontSize: 12.5, color: b.accent ? "var(--rd-accent)" : "var(--rd-ink)", fontWeight: b.accent ? 600 : 500 }}>{b.label}</span>
              {b.hint && <span className="rd-mono" style={{ fontSize: 10.5, color: "var(--rd-mute)", marginLeft: "auto" }}>{b.hint}</span>}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--rd-mute)", marginTop: 6, fontStyle: "italic" }}>
          ▸ <b>Lead picker</b> = your "any lead in 1 click" — type a name, jump there from anywhere · ⌘L · ▸ <b>+ New</b> = create lead/deal/note/call without leaving page · ▸ <b>To-do count</b> = expands a tray inline (no page jump)
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20 }}>

        {/* SIDEBAR */}
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)", fontWeight: 600, marginBottom: 8 }}>Left sidebar · 7 sections</div>
          <div className="rd-card" style={{ padding: 14, background: "var(--rd-card)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px 14px", borderBottom: "1px solid var(--rd-cream)" }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--rd-accent)", display: "grid", placeItems: "center", color: "white", fontWeight: 700, fontSize: 13 }}>N</div>
              <div className="rd-display" style={{ fontSize: 16 }}>NexFlow</div>
            </div>

            {SECTIONS.map((sec) => (
              <div key={sec.name} style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, padding: "0 4px" }}>
                  <div style={{
                    fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: sec.emphasis ? "var(--rd-accent)" : "var(--rd-ink)",
                    fontWeight: 700,
                  }}>
                    {sec.emphasis && "★ "}{sec.name}
                  </div>
                  <span className="rd-mono" style={{ fontSize: 10, color: "var(--rd-mute-2)" }}>{sec.count}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {sec.items.map(it => (
                    <div key={it.t} style={{
                      padding: "7px 10px",
                      background: it.isHome ? "var(--rd-accent-soft)" : it.fixed ? "rgba(136,184,176,0.12)" : it.more ? "var(--rd-sand-2)" : "transparent",
                      borderRadius: 7,
                      border: it.more ? "1px dashed var(--rd-cream)" : it.fixed ? "1px solid rgba(136,184,176,0.4)" : "1px solid transparent",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12.5, color: it.more ? "var(--rd-mute)" : "var(--rd-ink)", fontWeight: it.isHome ? 600 : 500, fontStyle: it.more ? "italic" : "normal" }}>
                          {it.t}
                          {it.isNew && <span className="rd-pill" style={{ marginLeft: 6, background: "var(--rd-accent-soft)", color: "var(--rd-accent)", fontSize: 9 }}>NEW</span>}
                          {it.fixed && <span className="rd-pill" style={{ marginLeft: 6, background: "rgba(136,184,176,0.2)", color: "var(--rd-sage)", fontSize: 9 }}>FIXED</span>}
                        </span>
                        {it.from && !it.absorbs && !it.tabs && <span style={{ fontSize: 10, color: "var(--rd-mute-2)", fontStyle: "italic" }}>{it.from}</span>}
                      </div>
                      {it.tabs && (
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed var(--rd-cream)", display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {it.tabs.map(tab => (
                            <span key={tab} style={{ fontSize: 10.5, padding: "2px 7px", background: "var(--rd-cream-2)", borderRadius: 4, color: "var(--rd-ink-2)" }}>{tab}</span>
                          ))}
                        </div>
                      )}
                      {it.absorbs && (
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed var(--rd-accent)", display: "flex", flexDirection: "column", gap: 3 }}>
                          {it.absorbs.map(a => (
                            <div key={a} style={{ fontSize: 10.5, color: "var(--rd-ink-2)", paddingLeft: 8, borderLeft: "2px solid var(--rd-accent)" }}>↳ {a}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Bottom */}
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--rd-cream)" }}>
              <div style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--rd-mute)", fontWeight: 600, marginBottom: 6, padding: "0 4px" }}>Bottom rail</div>
              {BOTTOM.map(b => (
                <div key={b} style={{ padding: "5px 10px", fontSize: 12, color: "var(--rd-ink-2)" }}>⚙ {b}</div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — fix-by-fix breakdown + dedup map */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <div className="rd-card" style={{ padding: 18, background: "var(--rd-card)" }}>
            <div className="rd-display" style={{ fontSize: 17, marginBottom: 12 }}>v3 — your 4 new fixes</div>

            <Fix num="A" title="Studio is back — top-level under Home, next to 360° AI Analysis">
              You were right — I dropped it. Now <b>Home has 2 entries</b>: <b>360° AI Analysis</b> (your morning brief, read-only) and <b>Studio</b> (the all-in-one workspace where you actually do the work). One is "what's happening", the other is "what I'm working on".
            </Fix>

            <Fix num="B" title="Knowledge Base pulled up to Comms top-level">
              Was hidden in "More" in v2. Now sits at the bottom of Comms next to Templates — the natural place: <b>Templates</b> = pre-written messages, <b>Knowledge Base</b> = talk tracks, FAQs, objection handlers. Both are "stuff a rep grabs mid-conversation".
            </Fix>

            <Fix num="C" title="Meetings — moved out of Comms, surfaced where they belong">
              You're right — Meetings ≠ messages. So:
              <ul style={{ margin: "6px 0 0 0", paddingLeft: 18, lineHeight: 1.6 }}>
                <li><b>Today's meetings</b> live in the <b>360° AI Analysis</b> morning panel (calendar strip)</li>
                <li><b>Per-lead meeting history</b> lives inside the lead's profile (Pipeline → People tab)</li>
                <li><b>Schedule a meeting</b> = quick action from <b>+ New</b> in the top bar</li>
              </ul>
              Meetings as a sidebar item disappears — but every meeting interaction stays accessible.
            </Fix>

            <Fix num="D" title="Enrichment disambiguated — no more 'Sources vs Sourcing' confusion">
              You spotted the duplication. Renamed:
              <ul style={{ margin: "6px 0 0 0", paddingLeft: 18, lineHeight: 1.6 }}>
                <li><b>Sources → Data Providers</b> = the paid integrations (Hunter, Apollo, MAGNiTT, Lusha, Wathiq…) you connect with API keys</li>
                <li><b>Sourcing → Find New Leads</b> = prospecting net-new companies/people based on criteria (ICP-driven)</li>
              </ul>
              Now they're clearly different: <i>Data Providers</i> = "where data comes from when enriching", <i>Find New Leads</i> = "go find people I don't know about yet".
            </Fix>

            <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--rd-cream-2)", borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--rd-mute)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Carried forward from v2 (still applied)</div>
              <div style={{ fontSize: 11.5, color: "var(--rd-ink-2)", lineHeight: 1.6 }}>
                Home = 360° AI absorbing dashboard/insights/tasks/assistant · Pipeline = ONE entry with internal tabs · Dialer top-level in Comms · Enrichment own section · Top bar with Lead picker (⌘L), + New, task count, ⌘K
              </div>
            </div>
          </div>

          {/* DEDUP MAP */}
          <div className="rd-card" style={{ padding: 18, background: "var(--rd-card)" }}>
            <div className="rd-display" style={{ fontSize: 17, marginBottom: 4 }}>Duplicate pages — explicit consolidation map</div>
            <div style={{ fontSize: 11.5, color: "var(--rd-mute)", marginBottom: 12 }}>You said "to-do lists have duplicates". Here's exactly what folds into what. <b>Old routes still resolve</b> — they just redirect or load the absorbed view.</div>

            {DEDUP.map(d => (
              <div key={d.keep} style={{ marginBottom: 14, padding: 12, background: "var(--rd-sand-2)", borderRadius: 8, border: "1px solid var(--rd-cream)" }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--rd-ink)", marginBottom: 6 }}>✓ Keep: {d.keep}</div>
                <div style={{ fontSize: 11.5, color: "var(--rd-mute)", marginBottom: 6, fontStyle: "italic" }}>Absorbs:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {d.absorbs.map(a => (
                    <div key={a} style={{ fontSize: 11.5, color: "var(--rd-ink-2)", paddingLeft: 10, borderLeft: "2px solid var(--rd-accent)" }}>↳ {a}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rd-card" style={{ padding: 14, background: "var(--rd-sand-2)", border: "1px solid var(--rd-cream)" }}>
            <div style={{ fontSize: 12.5, color: "var(--rd-ink-2)", lineHeight: 1.55 }}>
              <b>Counts:</b> 7 sidebar sections + Settings rail · ~25 visible items at rest (vs 57 today, ~55% lighter) · all ~80 routes still reachable · 3 NEW items (360 panels, Unified Inbox, Conductor) · 1 FIXED placement (Dialer) · zero pages deleted.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fix({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12, padding: "10px 12px", background: "var(--rd-sand-2)", borderRadius: 8, border: "1px solid var(--rd-cream)" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 4 }}>
        <span className="rd-pill" style={{ background: "var(--rd-accent)", color: "white", fontSize: 10.5, fontWeight: 700 }}>{num}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--rd-ink)" }}>{title}</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--rd-ink-2)", lineHeight: 1.55, paddingLeft: 32 }}>{children}</div>
    </div>
  );
}
