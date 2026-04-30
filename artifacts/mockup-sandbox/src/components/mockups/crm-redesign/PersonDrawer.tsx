import "./_group.css";
import {
  Home as HomeIcon, Users, MessageSquare,
  Search, Sparkles, X, Phone, Mail, Calendar,
  FileText, ChevronRight, CornerDownLeft, ArrowRight,
  CircleDot,
} from "lucide-react";

function MiniRail() {
  const items = [HomeIcon, Users, MessageSquare];
  return (
    <aside
      className="flex flex-col justify-between"
      style={{ width: 220, padding: "28px 18px", borderRight: "1px solid var(--rd-cream)", background: "var(--rd-sand)" }}
    >
      <div>
        <div className="flex items-center gap-2 mb-10 px-1.5">
          <div className="rd-display" style={{ fontSize: 22 }}>nx</div>
          <span style={{ fontSize: 12, color: "var(--rd-mute)", letterSpacing: "0.04em" }}>NEXFLOW</span>
        </div>
        <nav className="flex flex-col gap-1">
          {items.map((Icon, i) => {
            const isActive = i === 1;
            return (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{
                  padding: "8px 10px", borderRadius: 8,
                  color: isActive ? "var(--rd-ink)" : "var(--rd-mute)",
                  background: isActive ? "var(--rd-cream)" : "transparent",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                <Icon size={15} strokeWidth={1.6} />
                <span style={{ fontSize: 13 }}>{["Home","CRM","Comms"][i]}</span>
                {isActive && <div style={{ width: 4, height: 4, borderRadius: 999, background: "var(--rd-accent)", marginLeft: "auto" }} />}
              </div>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-2.5 px-1.5">
        <div className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 999, background: "var(--rd-accent)", color: "#fff", fontSize: 11, fontWeight: 500 }}>SK</div>
        <div style={{ fontSize: 12 }}>
          <div>Sara Khalid</div>
          <div style={{ color: "var(--rd-mute)", fontSize: 11 }}>Sales Rep</div>
        </div>
      </div>
    </aside>
  );
}

function FadedTable() {
  // visual ghost of the CRM table
  const ghost = [
    "Khaled Al-Mansoori", "Layla Hamadi", "Faisal Al-Otaibi", "Mariam Bouazizi", "Omar Habibi", "Noor El-Sayed",
  ];
  return (
    <div style={{ padding: "20px 36px 0 36px", filter: "blur(0.5px)", opacity: 0.55, pointerEvents: "none" }}>
      <div className="flex items-baseline gap-6" style={{ borderBottom: "1px solid var(--rd-cream)", marginBottom: 18 }}>
        <span className="rd-display" style={{ fontSize: 22 }}>People</span>
        <span className="rd-display" style={{ fontSize: 22, color: "var(--rd-mute-2)" }}>Companies</span>
        <span className="rd-display" style={{ fontSize: 22, color: "var(--rd-mute-2)" }}>Deals</span>
      </div>
      <div className="rd-card">
        {ghost.map((n, i) => (
          <div key={n} className="grid items-center" style={{ gridTemplateColumns: "24px 2fr 1.5fr 1fr 1fr", padding: "11px 16px", borderBottom: i < ghost.length - 1 ? "1px solid var(--rd-cream)" : "none" }}>
            <div style={{ width: 12, height: 12, borderRadius: 999, background: "var(--rd-cream)" }} />
            <div className="flex items-center gap-2.5">
              <div style={{ width: 26, height: 26, borderRadius: 999, background: "var(--rd-cream)" }} />
              <div>
                <div style={{ fontSize: 13 }}>{n}</div>
                <div style={{ fontSize: 11, color: "var(--rd-mute)" }}>—</div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--rd-ink-2)" }}>—</div>
            <div style={{ fontSize: 12, color: "var(--rd-mute)" }}>—</div>
            <div style={{ fontSize: 12, color: "var(--rd-mute)" }}>—</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineEvent({ kind, time, who, body, ai }: { kind: string; time: string; who: string; body: string; ai?: string }) {
  const kindMap: Record<string, { color: string; icon: any }> = {
    call:    { color: "var(--rd-accent)", icon: Phone },
    email:   { color: "var(--rd-amber)", icon: Mail },
    meeting: { color: "var(--rd-sage)", icon: Calendar },
    note:    { color: "var(--rd-mute)", icon: FileText },
  };
  const k = kindMap[kind] ?? kindMap.note;
  const Icon = k.icon;
  return (
    <div className="flex items-start gap-3" style={{ padding: "12px 0" }}>
      <div style={{ width: 8, height: 8, borderRadius: 999, background: k.color, marginTop: 7, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="flex items-center gap-2">
          <Icon size={11} strokeWidth={1.8} style={{ color: k.color }} />
          <span style={{ fontSize: 12.5, color: "var(--rd-ink)", fontWeight: 500 }}>{who}</span>
          <span style={{ fontSize: 11, color: "var(--rd-mute)" }}>· {time}</span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--rd-ink-2)", marginTop: 3 }}>{body}</div>
        {ai && (
          <div className="flex items-start gap-1.5 mt-2" style={{ padding: "8px 10px", background: "var(--rd-sand-2)", borderRadius: 8, border: "1px solid var(--rd-cream)" }}>
            <Sparkles size={10} strokeWidth={1.8} style={{ color: "var(--rd-accent)", marginTop: 3, flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: "var(--rd-mute)", fontStyle: "italic" }}>{ai}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function PersonDrawer() {
  const drawerW = 640;
  return (
    <div className="rd-root flex" style={{ minHeight: "100vh", height: "100vh", overflow: "hidden", position: "relative" }}>
      <MiniRail />
      <main style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Topbar (faded) */}
        <div style={{ padding: "20px 36px 0 36px", opacity: 0.5 }}>
          <div className="flex items-center justify-between">
            <div style={{ color: "var(--rd-mute)", fontSize: 12 }}>CRM · People</div>
            <div className="flex items-center gap-2" style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--rd-cream)", background: "var(--rd-card)", color: "var(--rd-mute)", fontSize: 12 }}>
              <Search size={13} strokeWidth={1.6} /><span>Search anything</span>
              <span className="rd-mono" style={{ fontSize: 10 }}>⌘K</span>
            </div>
          </div>
        </div>
        <FadedTable />

        {/* dim overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(31,27,22,0.18)", backdropFilter: "blur(0.5px)" }} />

        {/* Drawer */}
        <div
          style={{
            position: "absolute", top: 0, right: 0, bottom: 0,
            width: drawerW, background: "var(--rd-card)",
            borderLeft: "1px solid var(--rd-cream)",
            boxShadow: "-20px 0 40px -10px rgba(31,27,22,0.18)",
            display: "flex", flexDirection: "column",
          }}
        >
          {/* Drawer header */}
          <div style={{ padding: "22px 24px 16px 24px", borderBottom: "1px solid var(--rd-cream)" }}>
            <div className="flex items-center justify-between mb-4" style={{ fontSize: 11, color: "var(--rd-mute)" }}>
              <div className="flex items-center gap-2">
                <CornerDownLeft size={11} /> <span>Press</span>
                <span className="rd-mono" style={{ background: "var(--rd-sand-2)", padding: "1px 5px", borderRadius: 4, border: "1px solid var(--rd-cream)" }}>Esc</span>
                <span>to close</span>
              </div>
              <X size={14} strokeWidth={1.6} style={{ color: "var(--rd-mute)", cursor: "pointer" }} />
            </div>
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center"
                style={{ width: 56, height: 56, borderRadius: 999, background: "var(--rd-accent)", color: "#fff", fontSize: 18, fontWeight: 500 }}
              >KM</div>
              <div style={{ flex: 1 }}>
                <div className="rd-display" style={{ fontSize: 26, lineHeight: 1.1 }}>Khaled Al-Mansoori</div>
                <div style={{ fontSize: 12.5, color: "var(--rd-mute)", marginTop: 3 }}>
                  CTO · <span style={{ color: "var(--rd-ink-2)" }}>Aramco Digital</span> · Riyadh
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="rd-pill" style={{ background: "#F4DACD", color: "#8C3B22", fontWeight: 500 }}>Negotiation</span>
                  <span className="rd-pill" style={{ background: "var(--rd-sand-2)", color: "var(--rd-mute)", border: "1px solid var(--rd-cream)" }}>Enterprise</span>
                  <span className="rd-pill" style={{ background: "var(--rd-sand-2)", color: "var(--rd-mute)", border: "1px solid var(--rd-cream)" }}>$240k ARR</span>
                </div>
              </div>
            </div>

            {/* Health */}
            <div className="flex items-center gap-3 mt-4">
              <div style={{ flex: 1, height: 6, borderRadius: 999, background: "var(--rd-cream)", position: "relative", overflow: "hidden" }}>
                <div className="rd-health-track" style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "87%", borderRadius: 999 }} />
              </div>
              <span className="rd-mono" style={{ fontSize: 11, color: "var(--rd-ink-2)" }}>87 healthy</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4">
              <button
                style={{ flex: 1, padding: "9px 12px", borderRadius: 9, background: "var(--rd-ink)", color: "var(--rd-sand)", border: 0, fontSize: 12.5, fontWeight: 500, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}
              >
                <Phone size={13} strokeWidth={1.8} /> Call
              </button>
              <button
                style={{ flex: 1, padding: "9px 12px", borderRadius: 9, background: "transparent", color: "var(--rd-ink)", border: "1px solid var(--rd-cream)", fontSize: 12.5, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}
              >
                <Mail size={13} strokeWidth={1.8} /> Email
              </button>
              <button
                style={{ flex: 1, padding: "9px 12px", borderRadius: 9, background: "transparent", color: "var(--rd-ink)", border: "1px solid var(--rd-cream)", fontSize: 12.5, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}
              >
                <Calendar size={13} strokeWidth={1.8} /> Schedule
              </button>
            </div>
          </div>

          {/* AI Brief */}
          <div style={{ padding: "14px 24px", background: "var(--rd-sand-2)", borderBottom: "1px solid var(--rd-cream)" }}>
            <div className="flex items-center gap-2 mb-2" style={{ fontSize: 10.5, color: "var(--rd-mute)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <Sparkles size={11} strokeWidth={1.8} style={{ color: "var(--rd-accent)" }} /> Conductor brief
            </div>
            <div style={{ fontSize: 13, color: "var(--rd-ink)", lineHeight: 1.55 }}>
              Owns enterprise digital transformation. Last call ended on Q2 budget concern.
              <span style={{ color: "var(--rd-accent)", fontWeight: 500 }}> Next move:</span> send Pilot ROI doc and confirm decision timeline.
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-5" style={{ padding: "10px 24px 0 24px", borderBottom: "1px solid var(--rd-cream)", fontSize: 12.5 }}>
            {["Timeline", "Notes", "Deal", "Files"].map((t, i) => (
              <div key={t} style={{ paddingBottom: 10, position: "relative", color: i === 0 ? "var(--rd-ink)" : "var(--rd-mute)", fontWeight: i === 0 ? 500 : 400, cursor: "pointer" }}>
                {t}
                {i === 0 && <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 2, background: "var(--rd-ink)" }} />}
              </div>
            ))}
            <div style={{ marginLeft: "auto", paddingBottom: 10, fontSize: 11, color: "var(--rd-mute)" }}>
              <CircleDot size={9} className="inline" style={{ color: "var(--rd-sage)", marginRight: 4 }} />
              7 enriched fields
            </div>
          </div>

          {/* Timeline */}
          <div style={{ flex: 1, overflow: "auto", padding: "8px 24px" }}>
            <TimelineEvent
              kind="call" who="Sara · 24 min call"
              time="yesterday 16:05"
              body="Discussed Q2 procurement timing. Khaled raised concern about budget cycle alignment with pilot start."
              ai="Scribe extracted 3 commitments: send ROI doc, confirm pilot scope by Friday, intro to CFO."
            />
            <TimelineEvent
              kind="email" who="Composer · drafted on Sara's behalf"
              time="yesterday 18:22"
              body="Pilot ROI doc with Aramco-specific savings model. Drafted, awaiting Sara's review."
              ai="Dispatcher held send (autonomy: ask before sending). Open to review →"
            />
            <TimelineEvent
              kind="meeting" who="Discovery call"
              time="Apr 21"
              body="60 min with Khaled + 2 architects. Mapped 4 workflows, agreed on success criteria."
            />
            <TimelineEvent
              kind="email" who="Khaled (inbound)"
              time="Apr 18"
              body="Replied to outreach. 'Interesting timing — we're scoping Q2 initiatives.'"
            />
            <TimelineEvent
              kind="note" who="Sara"
              time="Apr 14"
              body="Researched org chart. Decision committee: CTO, CFO, Head of Procurement."
            />
          </div>

          {/* Quote button (deal context) */}
          <div style={{ padding: "12px 24px", borderTop: "1px solid var(--rd-cream)", background: "var(--rd-sand-2)" }}>
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: 11, color: "var(--rd-mute)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active deal</div>
                <div style={{ fontSize: 13, color: "var(--rd-ink)" }}>Aramco Pilot · 18-month · $240k ARR</div>
              </div>
              <button
                style={{ padding: "8px 12px", borderRadius: 9, background: "var(--rd-card)", border: "1px solid var(--rd-cream)", fontSize: 12, color: "var(--rd-ink)", display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer" }}
              >
                Build quote <ArrowRight size={12} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>

        {/* Conductor bubble (still present) */}
        <div
          className="rd-pulse flex items-center justify-center"
          style={{
            position: "absolute", bottom: 28, right: drawerW + 32, zIndex: 60,
            width: 52, height: 52, borderRadius: 999, background: "var(--rd-ink)", color: "var(--rd-sand)",
            boxShadow: "var(--rd-shadow-lift)", cursor: "pointer",
          }}
        >
          <Sparkles size={20} strokeWidth={1.5} />
        </div>
      </main>
    </div>
  );
}
