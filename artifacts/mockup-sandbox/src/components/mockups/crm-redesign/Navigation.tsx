import "./_group.css";

/**
 * NAVIGATION — Before vs After.
 * Keeps EVERY existing item. Only restructures grouping + adds "More" expanders
 * for niche/power-user items so the rail feels calm at rest.
 *
 * Current: 9 sections, ~57 items, Marketing mixes comms with growth, AI/Data/Insights muddled.
 * Proposed: 6 sections + Settings, every item preserved, comms split off, AI+Data clarified.
 */

const BEFORE = [
  { name: "Home", count: 2, items: ["Command Center", "Daily Insights"] },
  { name: "Sales", count: 8, items: ["Pipeline & Deals", "Contacts", "Companies", "Account Hub (ABM)", "Quotes & CPQ", "Forecasting", "Card Scanner", "Health Scores"] },
  { name: "Call Center", count: 8, items: ["Call Dashboard", "Calls & Transcripts", "Conversation Intel", "AI Voice Agent", "Knowledge Base", "Messages", "WhatsApp", "Call Redaction"] },
  { name: "Marketing", count: 10, items: ["Sequences", "Campaigns", "Marketing AI", "Meetings", "Templates", "Cultural Intelligence", "Audiences", "Web Forms", "Document Tracking", "Quote-to-Cash"] },
  { name: "Automation", count: 5, items: ["Workflow Builder", "Automation Rules", "Agent Builder", "Lead Routing", "Activity Capture"] },
  { name: "AI Hub", count: 8, items: ["Lead Intelligence", "AI Workforce", "Predictive", "Enrichment", "Quick Enrich Lead", "Power Dialer", "Signals", "Sales Playbooks"] },
  { name: "Insights", count: 6, items: ["Dashboards", "Reports", "Analytics", "Team Performance", "Attribution", "Report Builder"] },
  { name: "Data Hub", count: 5, items: ["Lists", "Properties", "Segments", "Deduplication", "Migration"] },
  { name: "Trust & Admin", count: 5, items: ["Trust Center", "Public Trust", "Permissions", "Capabilities", "Settings"] },
];

const AFTER = [
  {
    name: "Home", count: 3,
    items: [
      { t: "Today's Briefing", h: "/home", from: "Command Center" },
      { t: "Studio", h: "/studio", from: "NEW · all-in-one workspace", isNew: true },
      { t: "Daily Insights", h: "/insights", from: "(unchanged)" },
    ],
  },
  {
    name: "CRM", count: 9,
    items: [
      { t: "Pipeline & Deals", h: "/funnel", from: "(unchanged)" },
      { t: "People", h: "/contacts", from: "Contacts → renamed" },
      { t: "Companies", h: "/companies", from: "(unchanged)" },
      { t: "Account Hub (ABM)", h: "/accounts", from: "(unchanged)" },
      { t: "Forecasting", h: "/forecasting", from: "(unchanged)" },
      { t: "Health Scores", h: "/health-scores", from: "(unchanged)" },
      { t: "Quotes & CPQ", h: "/quotes", from: "(unchanged)" },
      { t: "Quote-to-Cash", h: "/quote-to-cash", from: "← was Marketing" },
      { t: "▾ More · Card Scanner, Lead Lists, Sourcing, Investors", h: "", from: "tucked under expander", more: true },
    ],
  },
  {
    name: "Comms", count: 8,
    items: [
      { t: "Unified Inbox", h: "/comms", from: "NEW · calls+email+WA in one stream", isNew: true },
      { t: "Calls & Transcripts", h: "/calls", from: "(unchanged)" },
      { t: "AI Voice Agent", h: "/voice-agents", from: "(unchanged)" },
      { t: "Conversation Intel", h: "/conversation-intelligence", from: "(unchanged)" },
      { t: "Email", h: "/email", from: "← was Marketing" },
      { t: "WhatsApp", h: "/whatsapp", from: "← was Call Center" },
      { t: "Meetings", h: "/meetings", from: "← was Marketing" },
      { t: "Templates", h: "/templates", from: "← was Marketing" },
      { t: "▾ More · Knowledge Base, Power Dialer, Call Redaction, Messages, Channels", h: "", from: "tucked under expander", more: true },
    ],
  },
  {
    name: "Growth", count: 6,
    items: [
      { t: "Sequences", h: "/sequences", from: "(unchanged)" },
      { t: "Campaigns", h: "/campaigns", from: "(unchanged)" },
      { t: "Marketing AI", h: "/marketing-assistant", from: "(unchanged)" },
      { t: "Audiences", h: "/audiences", from: "(unchanged)" },
      { t: "Cultural Intelligence", h: "/cultural-intelligence", from: "(unchanged)" },
      { t: "Web Forms", h: "/web-forms", from: "(unchanged)" },
      { t: "▾ More · Document Tracking, Campaign Builder, Performance", h: "", from: "tucked under expander", more: true },
    ],
  },
  {
    name: "AI Hub", count: 7,
    items: [
      { t: "Conductor", h: "/conductor", from: "NEW · the AI Gang dashboard", isNew: true },
      { t: "Workflows", h: "/workflows", from: "← was Automation" },
      { t: "Automation Rules", h: "/automation", from: "← was Automation" },
      { t: "Agent Builder", h: "/agents", from: "← was Automation" },
      { t: "Lead Routing", h: "/lead-routing", from: "← was Automation" },
      { t: "Approvals", h: "/approvals", from: "(unchanged)" },
      { t: "Signals", h: "/signals", from: "(unchanged)" },
      { t: "▾ More · Lead Intelligence, AI Workforce, Predictive, Sales Playbooks, Activity Capture", h: "", from: "tucked under expander", more: true },
    ],
  },
  {
    name: "Data & Insights", count: 8,
    items: [
      { t: "Dashboards", h: "/insights/dashboards", from: "← was Insights" },
      { t: "Reports", h: "/insights/reports", from: "← was Insights" },
      { t: "Analytics", h: "/analytics", from: "← was Insights" },
      { t: "Lead Enrich", h: "/lead-enrich", from: "← was AI Hub" },
      { t: "Enrichment Engine", h: "/datahub/enrichment", from: "(unchanged)" },
      { t: "Lists", h: "/lists", from: "← was Data Hub" },
      { t: "Properties", h: "/properties", from: "← was Data Hub" },
      { t: "Segments", h: "/segments", from: "← was Data Hub" },
      { t: "▾ More · Dedup, Migration, Team Perf, Attribution, Report Builder, ICP Rules", h: "", from: "tucked under expander", more: true },
    ],
  },
];

const SETTINGS = ["Settings", "Notifications", "Permissions", "Trust Center", "Public Trust", "Capabilities", "Account"];

export default function Navigation() {
  return (
    <div className="rd-root" style={{ minHeight: "100vh", background: "var(--rd-sand)", padding: "30px 36px" }}>
      <div style={{ marginBottom: 28 }}>
        <div className="rd-display" style={{ fontSize: 30, lineHeight: 1.1 }}>Navigation restructure</div>
        <div style={{ color: "var(--rd-mute)", fontSize: 14, marginTop: 6 }}>
          Every existing page kept. 9 sections → 6 + Settings. Comms split off. "More" expanders absorb power-user items so the rail breathes.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* BEFORE */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span className="rd-pill" style={{ background: "var(--rd-cream-2)", color: "var(--rd-mute)" }}>before · today</span>
            <span style={{ fontSize: 12.5, color: "var(--rd-mute)" }}>9 sections · ~57 items</span>
          </div>
          <div className="rd-card" style={{ padding: 18, background: "var(--rd-card)" }}>
            {BEFORE.map((sec, i) => (
              <div key={sec.name} style={{ marginBottom: i < BEFORE.length - 1 ? 14 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)", fontWeight: 600 }}>{sec.name}</div>
                  <span className="rd-mono" style={{ fontSize: 11, color: "var(--rd-mute-2)" }}>{sec.count}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {sec.items.map(it => (
                    <span key={it} style={{ fontSize: 11.5, padding: "3px 8px", background: "var(--rd-sand-2)", color: "var(--rd-ink-2)", borderRadius: 6, border: "1px solid var(--rd-cream)" }}>{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AFTER */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span className="rd-pill" style={{ background: "var(--rd-accent-soft)", color: "var(--rd-accent)" }}>after · proposed</span>
            <span style={{ fontSize: 12.5, color: "var(--rd-mute)" }}>6 sections + Settings · same ~57 items, regrouped</span>
          </div>

          {/* Search bar at the top of every page */}
          <div className="rd-card" style={{ padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10, background: "var(--rd-card)" }}>
            <span style={{ fontSize: 13, color: "var(--rd-mute)" }}>🔍</span>
            <span style={{ fontSize: 12.5, color: "var(--rd-mute)", flex: 1 }}>Jump to anything · people, deals, settings, commands…</span>
            <span className="rd-pill rd-mono" style={{ background: "var(--rd-cream-2)", color: "var(--rd-mute)" }}>⌘K</span>
          </div>

          <div className="rd-card" style={{ padding: 18, background: "var(--rd-card)" }}>
            {AFTER.map((sec, i) => (
              <div key={sec.name} style={{ marginBottom: i < AFTER.length - 1 ? 16 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-ink)", fontWeight: 700 }}>{sec.name}</div>
                  <span className="rd-mono" style={{ fontSize: 11, color: "var(--rd-mute-2)" }}>{sec.count}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {sec.items.map(it => (
                    <div key={it.t} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "6px 10px",
                      background: it.more ? "var(--rd-sand-2)" : "transparent",
                      borderRadius: 7,
                      border: it.more ? "1px dashed var(--rd-cream)" : "1px solid transparent",
                    }}>
                      <span style={{ fontSize: 12.5, color: it.more ? "var(--rd-mute)" : "var(--rd-ink)", fontStyle: it.more ? "italic" : "normal" }}>
                        {it.t}
                        {it.isNew && <span className="rd-pill" style={{ marginLeft: 8, background: "var(--rd-accent-soft)", color: "var(--rd-accent)", fontSize: 10 }}>NEW</span>}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--rd-mute-2)", fontStyle: "italic" }}>{it.from}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Settings strip */}
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--rd-cream)" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)", fontWeight: 600, marginBottom: 8 }}>Bottom rail</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {SETTINGS.map(s => (
                  <span key={s} style={{ fontSize: 11.5, padding: "3px 8px", background: "var(--rd-sand-2)", color: "var(--rd-ink-2)", borderRadius: 6, border: "1px solid var(--rd-cream)" }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WHAT CHANGED */}
      <div className="rd-card" style={{ padding: 22, marginTop: 28, background: "var(--rd-card)" }}>
        <div className="rd-display" style={{ fontSize: 20, marginBottom: 14 }}>What actually changed</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-accent)", fontWeight: 600, marginBottom: 10 }}>Renamed only · 1</div>
            <Bullet>Sales → CRM (clearer for managers + ops, "Sales" felt like just one role)</Bullet>

            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-accent)", fontWeight: 600, marginBottom: 10, marginTop: 18 }}>New sections · 1</div>
            <Bullet><b>Comms</b> — split off from Call Center + Marketing. Calls, voice agent, email, WhatsApp, meetings, templates all in one place. Fixes the "is messaging in marketing or call center?" confusion.</Bullet>

            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-accent)", fontWeight: 600, marginBottom: 10, marginTop: 18 }}>Merged · 2</div>
            <Bullet><b>AI Hub absorbs Automation.</b> Workflows, automation rules, agent builder, lead routing, approvals, signals — all AI-driven anyway. Was an artificial split.</Bullet>
            <Bullet><b>Data Hub merges with Insights.</b> Dashboards, reports, lists, segments, properties, enrichment, lead-enrich — they're the same job: working with the data layer.</Bullet>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-accent)", fontWeight: 600, marginBottom: 10 }}>New items · 3</div>
            <Bullet><b>Studio</b> — the all-in-one workspace (under Home)</Bullet>
            <Bullet><b>Unified Inbox</b> — one stream for all incoming comms (under Comms)</Bullet>
            <Bullet><b>Conductor</b> — the AI Gang control panel (under AI Hub)</Bullet>

            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-accent)", fontWeight: 600, marginBottom: 10, marginTop: 18 }}>Tucked under "▾ More" · ~14</div>
            <Bullet>Power-user items (Card Scanner, Power Dialer, Capabilities, Migration, Dedup, Attribution, Report Builder, ICP Rules, Activity Capture, Sales Playbooks, Lead Intelligence, AI Workforce, Knowledge Base, Channels) collapse by default. One click to expand. Reduces visual weight by ~40% without removing anything.</Bullet>

            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-accent)", fontWeight: 600, marginBottom: 10, marginTop: 18 }}>Removed · 0</div>
            <Bullet style={{ color: "var(--rd-sage)" }}>Zero. Every page reachable from today's sidebar is reachable from the new one. All routes preserved.</Bullet>
          </div>
        </div>

        <div style={{ marginTop: 22, padding: 14, background: "var(--rd-sand-2)", borderRadius: 10, border: "1px solid var(--rd-cream)" }}>
          <div style={{ fontSize: 12.5, color: "var(--rd-ink-2)", lineHeight: 1.6 }}>
            <b>Implementation plan:</b> rewrite only <code style={{ background: "var(--rd-cream-2)", padding: "1px 5px", borderRadius: 3, fontSize: 11.5 }}>artifacts/nexflow/src/components/layout/Sidebar.tsx</code> with this new grouping. Routes in <code style={{ background: "var(--rd-cream-2)", padding: "1px 5px", borderRadius: 3, fontSize: 11.5 }}>App.tsx</code> stay 100% as-is. No pages deleted. No URLs broken. ⌘K palette added on top so frequent navigation bypasses the sidebar entirely.
          </div>
        </div>
      </div>
    </div>
  );
}

function Bullet({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, lineHeight: 1.5, color: "var(--rd-ink-2)", ...style }}>
      <span style={{ color: "var(--rd-accent)", marginTop: 2 }}>•</span>
      <span style={{ flex: 1 }}>{children}</span>
    </div>
  );
}
