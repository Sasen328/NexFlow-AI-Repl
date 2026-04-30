import "./_group.css";
import {
  Home as HomeIcon, Users, MessageSquare, BarChart3, Settings,
  Search, Command, Sparkles, ChevronRight, Phone, Mail, Calendar,
  ArrowUpRight, CircleDot, MoreHorizontal,
} from "lucide-react";

function Rail({ active = "home" }: { active?: string }) {
  const items = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "crm", label: "CRM", icon: Users },
    { id: "comms", label: "Comms", icon: MessageSquare },
    { id: "insights", label: "Insights", icon: BarChart3 },
  ];
  return (
    <aside
      className="flex flex-col justify-between"
      style={{
        width: 220, padding: "28px 18px",
        borderRight: "1px solid var(--rd-cream)",
        background: "var(--rd-sand)",
      }}
    >
      <div>
        <div className="flex items-center gap-2 mb-10 px-1.5">
          <div
            className="rd-display"
            style={{ fontSize: 22, color: "var(--rd-ink)", lineHeight: 1 }}
          >
            nx
          </div>
          <span style={{ fontSize: 12, color: "var(--rd-mute)", letterSpacing: "0.04em" }}>
            NEXFLOW
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          {items.map((it) => {
            const Icon = it.icon;
            const isActive = it.id === active;
            return (
              <div
                key={it.id}
                className="flex items-center gap-3 cursor-pointer"
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  color: isActive ? "var(--rd-ink)" : "var(--rd-mute)",
                  background: isActive ? "var(--rd-cream)" : "transparent",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                <Icon size={15} strokeWidth={1.6} />
                <span style={{ fontSize: 13 }}>{it.label}</span>
                {isActive && (
                  <div
                    style={{
                      width: 4, height: 4, borderRadius: 999,
                      background: "var(--rd-accent)", marginLeft: "auto",
                    }}
                  />
                )}
              </div>
            );
          })}
        </nav>
      </div>
      <div className="flex flex-col gap-3 px-1.5">
        <div
          className="flex items-center gap-2"
          style={{ color: "var(--rd-mute)", fontSize: 12 }}
        >
          <Settings size={14} strokeWidth={1.6} />
          <span>Settings</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center"
            style={{
              width: 28, height: 28, borderRadius: 999,
              background: "var(--rd-accent)",
              color: "#fff", fontSize: 11, fontWeight: 500,
            }}
          >
            SK
          </div>
          <div style={{ fontSize: 12 }}>
            <div style={{ color: "var(--rd-ink)" }}>Sara Khalid</div>
            <div style={{ color: "var(--rd-mute)", fontSize: 11 }}>Sales Rep</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <div
      className="flex items-center justify-between"
      style={{ padding: "20px 36px 0 36px" }}
    >
      <div className="flex items-center gap-2" style={{ color: "var(--rd-mute)", fontSize: 12 }}>
        <span>Tuesday</span>
        <span>·</span>
        <span>Apr 30, 2026</span>
        <span>·</span>
        <span>Dubai 09:14</span>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2"
          style={{
            padding: "6px 10px",
            borderRadius: 8, border: "1px solid var(--rd-cream)",
            background: "var(--rd-card)", color: "var(--rd-mute)", fontSize: 12,
          }}
        >
          <Search size={13} strokeWidth={1.6} />
          <span>Search anything</span>
          <span className="rd-mono" style={{ fontSize: 10, color: "var(--rd-mute-2)" }}>⌘K</span>
        </div>
      </div>
    </div>
  );
}

function ConductorBubble({ count = 3 }: { count?: number }) {
  return (
    <div
      style={{
        position: "absolute", bottom: 24, right: 28, zIndex: 50,
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8,
      }}
    >
      <div
        className="rd-card flex items-center gap-2"
        style={{
          padding: "6px 10px 6px 8px",
          fontSize: 11, color: "var(--rd-ink-2)",
          boxShadow: "var(--rd-shadow-lift)",
        }}
      >
        <CircleDot size={10} style={{ color: "var(--rd-accent)" }} strokeWidth={2} />
        <span>{count} need you</span>
      </div>
      <div
        className="rd-pulse flex items-center justify-center"
        style={{
          width: 52, height: 52, borderRadius: 999,
          background: "var(--rd-ink)",
          color: "var(--rd-sand)", cursor: "pointer",
          boxShadow: "var(--rd-shadow-lift)",
          position: "relative",
        }}
      >
        <Sparkles size={20} strokeWidth={1.5} />
        <div
          style={{
            position: "absolute", top: -2, right: -2,
            width: 18, height: 18, borderRadius: 999,
            background: "var(--rd-accent)", color: "#fff",
            fontSize: 10, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid var(--rd-sand)",
          }}
        >
          {count}
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const stats = [
    { label: "Open prospects", value: "23", note: "+4 this week" },
    { label: "Today's commitments", value: "5", note: "from Conductor" },
    { label: "Overdue follow-ups", value: "2", note: "needs attention", warn: true },
  ];
  const upNext = [
    {
      time: "10:00",
      who: "Khaled Al-Mansoori",
      role: "CTO · Aramco Digital",
      action: "Discovery call",
      hint: "Yesterday's blocker: Q2 budget. Bring the pilot ROI doc.",
      icon: Phone,
      tone: "accent",
    },
    {
      time: "11:30",
      who: "Layla Hamadi",
      role: "VP Operations · Maersk MENA",
      action: "Send pricing follow-up",
      hint: "Composer drafted it. Awaiting your approval.",
      icon: Mail,
      tone: "amber",
    },
    {
      time: "14:00",
      who: "Faisal Al-Otaibi",
      role: "Director · STC Solutions",
      action: "Calendar nudge",
      hint: "Silent 6 days. Listener flagged risk. Coach suggests 1-line check-in.",
      icon: Calendar,
      tone: "sage",
    },
    {
      time: "16:30",
      who: "Mariam Bouazizi",
      role: "Founder · Tabby Africa",
      action: "Quote review",
      hint: "Dispatcher built v3. Margin stays at 38%. Open?",
      icon: ArrowUpRight,
      tone: "accent",
    },
  ];

  return (
    <div className="rd-root flex" style={{ minHeight: "100vh", height: "100vh", overflow: "hidden", position: "relative" }}>
      <Rail active="home" />
      <main style={{ flex: 1, overflow: "auto" }}>
        <Topbar />

        <section style={{ padding: "28px 36px 12px 36px" }}>
          <h1 className="rd-display" style={{ fontSize: 38, lineHeight: 1.05, color: "var(--rd-ink)" }}>
            Tuesday morning, Sara.
          </h1>
          <p style={{ color: "var(--rd-mute)", marginTop: 8, fontSize: 14 }}>
            Conductor reviewed last night. <span style={{ color: "var(--rd-ink)" }}>3 things</span> need your decision before 11am.
          </p>
        </section>

        {/* Conductor brief hero card */}
        <section style={{ padding: "16px 36px 0 36px" }}>
          <div
            className="rd-card"
            style={{
              padding: "22px 24px",
              background:
                "linear-gradient(135deg, #FFFFFF 0%, #FBF9F4 60%, #F4DACD 220%)",
            }}
          >
            <div className="flex items-center gap-2 mb-3" style={{ color: "var(--rd-mute)", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              <Sparkles size={12} strokeWidth={1.8} style={{ color: "var(--rd-accent)" }} />
              Conductor Brief · synced 7 min ago
            </div>
            <div className="flex items-start justify-between gap-6">
              <div style={{ maxWidth: 540 }}>
                <div className="rd-display" style={{ fontSize: 22, lineHeight: 1.25, color: "var(--rd-ink)" }}>
                  Khaled is the keystone today. He'll close the Aramco pilot if you address the Q2 budget objection in the first 5 minutes.
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    style={{
                      background: "var(--rd-ink)", color: "var(--rd-sand)",
                      padding: "8px 14px", borderRadius: 9,
                      fontSize: 12.5, fontWeight: 500,
                      display: "inline-flex", alignItems: "center", gap: 6, border: 0, cursor: "pointer",
                    }}
                  >
                    Run morning playbook
                    <ChevronRight size={14} strokeWidth={2} />
                  </button>
                  <button
                    style={{
                      background: "transparent", color: "var(--rd-ink)",
                      padding: "8px 14px", borderRadius: 9,
                      fontSize: 12.5, border: "1px solid var(--rd-cream)", cursor: "pointer",
                    }}
                  >
                    Open all 3 in drawer
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, maxWidth: 320, paddingLeft: 24, borderLeft: "1px solid var(--rd-cream-2)" }}>
                <div style={{ fontSize: 11, color: "var(--rd-mute)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                  Yesterday's commitments
                </div>
                {[
                  { ok: true, txt: "Send Q1 case study to Khaled" },
                  { ok: true, txt: "Confirm pricing tier with Layla" },
                  { ok: false, txt: "Schedule pilot kickoff with Faisal" },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5" style={{ padding: "5px 0", fontSize: 12.5 }}>
                    <div
                      style={{
                        width: 14, height: 14, borderRadius: 999,
                        border: "1.5px solid " + (c.ok ? "var(--rd-sage)" : "var(--rd-mute-2)"),
                        background: c.ok ? "var(--rd-sage)" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {c.ok && <div style={{ width: 4, height: 4, background: "#fff", borderRadius: 999 }} />}
                    </div>
                    <span style={{ color: c.ok ? "var(--rd-mute)" : "var(--rd-ink)", textDecoration: c.ok ? "line-through" : "none" }}>
                      {c.txt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats row */}
        <section style={{ padding: "20px 36px 0 36px" }}>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rd-card" style={{ padding: "18px 20px" }}>
                <div style={{ fontSize: 11, color: "var(--rd-mute)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {s.label}
                </div>
                <div className="rd-display flex items-baseline gap-2 mt-1">
                  <span style={{ fontSize: 36, lineHeight: 1, color: "var(--rd-ink)" }}>{s.value}</span>
                </div>
                <div
                  style={{
                    fontSize: 11, marginTop: 8,
                    color: s.warn ? "var(--rd-accent)" : "var(--rd-mute)",
                  }}
                >
                  {s.note}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Up Next timeline */}
        <section style={{ padding: "28px 36px 100px 36px" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-3">
              <h2 className="rd-display" style={{ fontSize: 22, color: "var(--rd-ink)" }}>Up next</h2>
              <span style={{ color: "var(--rd-mute)", fontSize: 12 }}>4 priorities · ordered by Conductor</span>
            </div>
            <button style={{ background: "transparent", border: 0, color: "var(--rd-mute)", fontSize: 12, cursor: "pointer" }}>
              View all <ChevronRight size={11} className="inline" />
            </button>
          </div>
          <div className="rd-card" style={{ padding: 6 }}>
            {upNext.map((u, i) => {
              const Icon = u.icon;
              const dotColor = u.tone === "accent" ? "var(--rd-accent)" : u.tone === "amber" ? "var(--rd-amber)" : "var(--rd-sage)";
              return (
                <div
                  key={i}
                  className="flex items-start gap-4"
                  style={{
                    padding: "14px 16px",
                    borderBottom: i < upNext.length - 1 ? "1px solid var(--rd-cream)" : "none",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="rd-mono"
                    style={{ fontSize: 11, color: "var(--rd-mute)", paddingTop: 2, minWidth: 36 }}
                  >
                    {u.time}
                  </div>
                  <div
                    style={{
                      width: 8, height: 8, borderRadius: 999, background: dotColor,
                      marginTop: 6, flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 13.5, color: "var(--rd-ink)", fontWeight: 500 }}>{u.who}</span>
                      <span style={{ fontSize: 11.5, color: "var(--rd-mute)" }}>· {u.role}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--rd-ink-2)", marginTop: 2 }}>
                      <Icon size={11} strokeWidth={1.8} className="inline" style={{ marginRight: 6, color: dotColor }} />
                      {u.action}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--rd-mute)", marginTop: 4, fontStyle: "italic" }}>
                      {u.hint}
                    </div>
                  </div>
                  <button
                    style={{
                      padding: "5px 10px", borderRadius: 8,
                      background: "transparent", border: "1px solid var(--rd-cream)",
                      fontSize: 11.5, color: "var(--rd-ink-2)", cursor: "pointer",
                    }}
                  >
                    Open
                  </button>
                  <MoreHorizontal size={14} style={{ color: "var(--rd-mute-2)", marginTop: 4 }} />
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <ConductorBubble count={3} />
    </div>
  );
}
