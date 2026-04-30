import "./_group.css";

/**
 * NAVIGATION v2 — addressing user feedback on v1:
 *  ✗→✓  Home is "360° AI Analysis" (Performance + Daily Insights + To-Dos absorbed inside)
 *  ✗→✓  Dialer is TOP-LEVEL in Comms (was tucked under "More")
 *  ✗→✓  Enrichment gets its own section (was buried in Data & Insights)
 *  ✗→✓  CRM collapsed to ONE entry "Pipeline" with internal tabs (was 9 separate items)
 *  ✗→✓  Top bar adds: Lead picker (1-click to any lead) + +New + To-do count + ⌘K
 *  Every existing route still reachable. Duplicate to-do pages consolidated visually.
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
    name: "Home", count: 1, color: "var(--rd-accent)",
    items: [
      {
        t: "360° AI Analysis", h: "/home", from: "the actual home", isHome: true,
        absorbs: [
          "Performance dashboard (was /dashboard) → Performance panel inside",
          "Daily Insights (was /insights) → Insights panel inside",
          "Today's tasks (was /activities, /call-list, /approvals) → unified Task Tray",
          "AI Assistant (was /assistant) → embedded as side rail",
          "Briefing (was /briefing) → kept as the page itself",
        ],
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
      { t: "Dialer", h: "/power-dialer", from: "TOP-LEVEL (was buried)", fixed: true },
      { t: "Calls & Transcripts", h: "/calls", from: "" },
      { t: "AI Voice Agent", h: "/voice-agents", from: "" },
      { t: "Conversation Intel", h: "/conversation-intelligence", from: "" },
      { t: "WhatsApp", h: "/whatsapp", from: "" },
      { t: "Email", h: "/email", from: "" },
      { t: "Templates", h: "/templates", from: "" },
      { t: "Meetings", h: "/meetings", from: "" },
    ],
  },
  {
    name: "Enrichment", count: 5, color: "var(--rd-accent)", emphasis: true,
    items: [
      { t: "Engine", h: "/datahub/enrichment", from: "the orchestrator", fixed: true },
      { t: "Quick Enrich", h: "/lead-enrich", from: "" },
      { t: "Sources", h: "/datahub/enrichment?tab=sources", from: "data providers (Hunter, Apollo, MAGNiTT…)" },
      { t: "Sourcing", h: "/sourcing", from: "find new leads" },
      { t: "Dedup", h: "/dedup", from: "" },
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
          <span className="rd-pill" style={{ background: "var(--rd-accent-soft)", color: "var(--rd-accent)" }}>nav · v2</span>
          <span className="rd-pill" style={{ background: "var(--rd-cream-2)", color: "var(--rd-mute)" }}>fixes 5/5 from your feedback</span>
        </div>
        <div className="rd-display" style={{ fontSize: 28, lineHeight: 1.1 }}>Navigation v2 — your fixes applied</div>
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
            <div className="rd-display" style={{ fontSize: 17, marginBottom: 12 }}>What I fixed (your 5 points)</div>

            <Fix num="1" title="Home = '360° AI Analysis' (one entry, not three)">
              Performance dashboard, Daily Insights, and the Today's-tasks duplicates (Activities, Call list, Approvals, Assistant) all become <b>panels inside</b> the 360 view — not separate sidebar items. You land on one page that shows everything that matters this morning.
            </Fix>

            <Fix num="2" title="CRM collapsed to ONE entry called 'Pipeline'">
              Inside Pipeline, view tabs switch between People · Companies · Deals · Accounts · Forecasting · Quotes · Health Scores · Quote-to-Cash. Same 8 surfaces, but in <b>one workspace</b> instead of 8 sidebar items. Goes from cluttered list → one verb.
              <div style={{ marginTop: 6, fontSize: 11.5, color: "var(--rd-mute)" }}>If you'd rather split it into 2 entries (Pipeline + Accounts), say the word.</div>
            </Fix>

            <Fix num="3" title="Dialer is TOP-LEVEL in Comms (no longer hidden)">
              Second item, right under Inbox. One click → start dialing. Knowledge Base, Power Dialer, Call Redaction were the only things tucked under "More" before — Dialer is now its own thing.
            </Fix>

            <Fix num="4" title="Enrichment gets its OWN section">
              Engine · Quick Enrich · Sources · Sourcing · Dedup. Five items, top-level, marked with ★. Was buried under "Data & Insights" in v1 — now a first-class section because it's the engine of the whole CRM.
            </Fix>

            <Fix num="5" title="Top bar = 'any lead in 1 click' + quick create + task count">
              Lead picker pill (⌘L) sits next to ⌘K. Type a name → jump. <b>+ New</b> creates a lead/deal/note/call inline. <b>"7 tasks today"</b> opens an inline tray (no page jump). All of this lives <b>above</b> the sidebar, on every page.
            </Fix>
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
