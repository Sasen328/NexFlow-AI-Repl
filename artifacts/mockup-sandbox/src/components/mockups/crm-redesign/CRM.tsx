import "./_group.css";
import {
  Home as HomeIcon, Users, MessageSquare, Settings,
  Search, Sparkles, Plus, Filter, ArrowUpDown, ChevronRight,
  CircleDot, Star, TrendingUp, AlertTriangle, Flame,
} from "lucide-react";

function Rail({ active = "crm" }: { active?: string }) {
  const items = [
    { id: "home",  label: "Home",  icon: HomeIcon },
    { id: "crm",   label: "CRM",   icon: Users },
    { id: "comms", label: "Comms", icon: MessageSquare },
  ];
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
          {items.map((it) => {
            const Icon = it.icon;
            const isActive = it.id === active;
            return (
              <div
                key={it.id}
                className="flex items-center gap-3 cursor-pointer"
                style={{ padding: "8px 10px", borderRadius: 8, color: isActive ? "var(--rd-ink)" : "var(--rd-mute)", background: isActive ? "var(--rd-cream)" : "transparent", fontWeight: isActive ? 500 : 400 }}
              >
                <Icon size={15} strokeWidth={1.6} />
                <span style={{ fontSize: 13 }}>{it.label}</span>
                {isActive && <div style={{ width: 4, height: 4, borderRadius: 999, background: "var(--rd-accent)", marginLeft: "auto" }} />}
              </div>
            );
          })}
        </nav>

        {/* Smart Lists */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 10.5, color: "var(--rd-mute)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 10px 8px 10px" }}>
            Smart Lists
          </div>
          <div className="flex flex-col">
            {[
              { name: "My open prospects", count: 23, active: true },
              { name: "Follow-ups due today", count: 5 },
              { name: "Hot · stage 4+", count: 8 },
              { name: "Closing this week", count: 3 },
              { name: "Silent 7+ days", count: 6 },
              { name: "By segment · Enterprise", count: 14 },
            ].map((l) => (
              <div
                key={l.name}
                className="flex items-center justify-between cursor-pointer"
                style={{ padding: "6px 10px", borderRadius: 7, fontSize: 12.5, color: l.active ? "var(--rd-ink)" : "var(--rd-mute)", background: l.active ? "var(--rd-sand-2)" : "transparent" }}
              >
                <span style={{ fontWeight: l.active ? 500 : 400 }}>{l.name}</span>
                <span className="rd-mono" style={{ fontSize: 10.5, color: "var(--rd-mute-2)" }}>{l.count}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 cursor-pointer" style={{ padding: "8px 10px", fontSize: 12, color: "var(--rd-mute)" }}>
              <Plus size={11} strokeWidth={2} /> New smart list
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 px-1.5">
        <div className="flex items-center gap-2" style={{ color: "var(--rd-mute)", fontSize: 12 }}>
          <Settings size={14} strokeWidth={1.6} />
          <span>Settings</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 999, background: "var(--rd-accent)", color: "#fff", fontSize: 11, fontWeight: 500 }}>SK</div>
          <div style={{ fontSize: 12 }}>
            <div>Sara Khalid</div>
            <div style={{ color: "var(--rd-mute)", fontSize: 11 }}>Sales Rep</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <div className="flex items-center justify-between" style={{ padding: "20px 36px 0 36px" }}>
      <div className="flex items-center gap-2" style={{ color: "var(--rd-mute)", fontSize: 12 }}>
        <span>CRM</span><span>·</span><span style={{ color: "var(--rd-ink)" }}>People</span>
      </div>
      <div
        className="flex items-center gap-2"
        style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--rd-cream)", background: "var(--rd-card)", color: "var(--rd-mute)", fontSize: 12 }}
      >
        <Search size={13} strokeWidth={1.6} />
        <span>Search anything</span>
        <span className="rd-mono" style={{ fontSize: 10, color: "var(--rd-mute-2)" }}>⌘K</span>
      </div>
    </div>
  );
}

function ConductorBubble() {
  return (
    <div
      className="rd-pulse flex items-center justify-center"
      style={{ position: "absolute", bottom: 28, right: 32, zIndex: 50, width: 52, height: 52, borderRadius: 999, background: "var(--rd-ink)", color: "var(--rd-sand)", boxShadow: "var(--rd-shadow-lift)", cursor: "pointer" }}
    >
      <Sparkles size={20} strokeWidth={1.5} />
    </div>
  );
}

const rows = [
  { name: "Khaled Al-Mansoori", co: "Aramco Digital", title: "CTO", stage: "Negotiation", touch: "yesterday · call", health: 0.87, next: "Send pilot ROI doc", star: true },
  { name: "Layla Hamadi", co: "Maersk MENA", title: "VP Operations", stage: "Proposal", touch: "2d · email", health: 0.72, next: "Approve Composer draft", star: true },
  { name: "Faisal Al-Otaibi", co: "STC Solutions", title: "Director", stage: "Discovery", touch: "6d · silent", health: 0.34, next: "Listener: nudge today", star: false },
  { name: "Mariam Bouazizi", co: "Tabby Africa", title: "Founder", stage: "Quote", touch: "today · WhatsApp", health: 0.81, next: "Quote v3 ready", star: false },
  { name: "Omar Habibi", co: "Careem", title: "Head of Growth", stage: "Discovery", touch: "1d · meeting", health: 0.66, next: "Schedule demo", star: false },
  { name: "Noor El-Sayed", co: "Talabat", title: "VP Product", stage: "Closed Won", touch: "today · contract", health: 0.94, next: "Onboarding handoff", star: false },
  { name: "Yusuf Al-Rashid", co: "ADNOC Distribution", title: "Procurement Lead", stage: "Negotiation", touch: "3d · call", health: 0.58, next: "Counter on payment terms", star: false },
];

function StageChip({ stage }: { stage: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    Discovery:    { bg: "#EFEAE0", fg: "#8A8175" },
    Proposal:     { bg: "#F4DACD", fg: "#8C3B22" },
    Quote:        { bg: "#F8E7C8", fg: "#8A6020" },
    Negotiation:  { bg: "#F4DACD", fg: "#8C3B22" },
    "Closed Won": { bg: "#DBE3D5", fg: "#4F6A4B" },
  };
  const c = map[stage] ?? { bg: "#EFEAE0", fg: "#8A8175" };
  return <span className="rd-pill" style={{ background: c.bg, color: c.fg, fontWeight: 500 }}>{stage}</span>;
}

function HealthBar({ v }: { v: number }) {
  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 56, height: 5, borderRadius: 999, background: "var(--rd-cream)", position: "relative", overflow: "hidden" }}>
        <div className="rd-health-track" style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${v * 100}%`, borderRadius: 999 }} />
      </div>
      <span className="rd-mono" style={{ fontSize: 10.5, color: "var(--rd-mute)" }}>{Math.round(v * 100)}</span>
    </div>
  );
}

function PulseChip({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "accent" | "amber" | "sage" }) {
  const c = tone === "accent" ? "var(--rd-accent)" : tone === "amber" ? "var(--rd-amber)" : "var(--rd-sage)";
  return (
    <div
      className="flex items-center gap-2.5"
      style={{ padding: "8px 12px", borderRadius: 999, background: "var(--rd-card)", border: "1px solid var(--rd-cream)", cursor: "pointer" }}
    >
      <div style={{ width: 22, height: 22, borderRadius: 999, background: tone === "accent" ? "var(--rd-accent-soft)" : tone === "amber" ? "#F8E7C8" : "var(--rd-sage-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={11} strokeWidth={2} style={{ color: c }} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="rd-display" style={{ fontSize: 17, color: "var(--rd-ink)", lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 11.5, color: "var(--rd-mute)" }}>{label}</span>
      </div>
    </div>
  );
}

export function CRM() {
  return (
    <div className="rd-root flex" style={{ minHeight: "100vh", height: "100vh", overflow: "hidden", position: "relative" }}>
      <Rail active="crm" />
      <main style={{ flex: 1, overflow: "auto" }}>
        <Topbar />

        {/* Tabs */}
        <div style={{ padding: "20px 36px 0 36px" }}>
          <div className="flex items-baseline gap-6" style={{ borderBottom: "1px solid var(--rd-cream)", marginBottom: 18 }}>
            {[
              { l: "People", active: true },
              { l: "Companies" },
              { l: "Deals" },
              { l: "AI SmartFlow", accent: true },
            ].map((t) => (
              <div key={t.l} style={{ paddingBottom: 12, position: "relative", cursor: "pointer" }}>
                <span
                  className="rd-display flex items-center gap-1.5"
                  style={{ fontSize: 22, color: t.active ? "var(--rd-ink)" : "var(--rd-mute-2)" }}
                >
                  {t.accent && <Sparkles size={13} strokeWidth={1.8} style={{ color: "var(--rd-accent)" }} />}
                  {t.l}
                </span>
                {t.active && <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 2, background: "var(--rd-accent)" }} />}
              </div>
            ))}
            <div style={{ marginLeft: "auto", paddingBottom: 12, color: "var(--rd-mute)", fontSize: 12 }}>
              <span style={{ color: "var(--rd-ink)" }}>23</span> people · <span className="rd-mono">My open</span>
            </div>
          </div>

          {/* AI Pulse band — combines table view with dashboard energy */}
          <div
            className="rd-card"
            style={{ padding: "14px 18px", marginBottom: 14, background: "linear-gradient(135deg, #FFFFFF 0%, #FBF9F4 60%, #F4DACD 240%)" }}
          >
            <div className="flex items-start gap-4">
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2 mb-1.5" style={{ fontSize: 10.5, color: "var(--rd-mute)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <Sparkles size={11} strokeWidth={1.8} style={{ color: "var(--rd-accent)" }} />
                  Today's pulse
                </div>
                <div style={{ fontSize: 13.5, color: "var(--rd-ink)", lineHeight: 1.5, maxWidth: 640 }}>
                  Pipeline is healthy — <span style={{ color: "var(--rd-accent)", fontWeight: 500 }}>3 hot signals</span> from yesterday's activity. Your highest-leverage move: re-engage <span style={{ fontWeight: 500 }}>Faisal</span> before tomorrow.
                </div>
              </div>
              <button style={{ padding: "6px 11px", borderRadius: 8, background: "var(--rd-card)", border: "1px solid var(--rd-cream)", fontSize: 11.5, color: "var(--rd-ink)", display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                Open SmartFlow <ChevronRight size={11} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <PulseChip icon={CircleDot}      label="tasks today"     value="8" tone="accent" />
              <PulseChip icon={Flame}          label="hot signals"     value="5" tone="amber" />
              <PulseChip icon={AlertTriangle}  label="SLA breaches"    value="2" tone="accent" />
              <PulseChip icon={TrendingUp}     label="pipeline at risk" value="$120k" tone="sage" />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 mb-4">
            {[
              { l: "Open", on: true },
              { l: "Hot · stage 4+" },
              { l: "Pending follow-up" },
              { l: "Health < 50" },
              { l: "Segment · Enterprise" },
            ].map((c) => (
              <span
                key={c.l}
                className="rd-pill"
                style={{ background: c.on ? "var(--rd-ink)" : "transparent", color: c.on ? "var(--rd-sand)" : "var(--rd-mute)", border: c.on ? "0" : "1px solid var(--rd-cream)", fontSize: 11.5, padding: "4px 10px", cursor: "pointer" }}
              >
                {c.l}
              </span>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, color: "var(--rd-mute)", fontSize: 11.5 }}>
              <button style={{ background: "transparent", border: 0, display: "inline-flex", alignItems: "center", gap: 5, color: "var(--rd-mute)", cursor: "pointer" }}>
                <Filter size={12} strokeWidth={1.8} /> Filter
              </button>
              <button style={{ background: "transparent", border: 0, display: "inline-flex", alignItems: "center", gap: 5, color: "var(--rd-mute)", cursor: "pointer" }}>
                <ArrowUpDown size={12} strokeWidth={1.8} /> Sort
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ padding: "0 36px 100px 36px" }}>
          <div className="rd-card" style={{ overflow: "hidden" }}>
            <div
              className="grid items-center"
              style={{ gridTemplateColumns: "24px 2fr 1.5fr 1.2fr 1.4fr 1fr 1.6fr", padding: "10px 16px", fontSize: 11, color: "var(--rd-mute)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--rd-cream)" }}
            >
              <span></span><span>Person</span><span>Company</span><span>Stage</span><span>Last touch</span><span>Health</span><span>Next action</span>
            </div>
            {rows.map((r, i) => (
              <div
                key={r.name}
                className="grid items-center"
                style={{ gridTemplateColumns: "24px 2fr 1.5fr 1.2fr 1.4fr 1fr 1.6fr", padding: "11px 16px", borderBottom: i < rows.length - 1 ? "1px solid var(--rd-cream)" : "none", background: i === 0 ? "var(--rd-sand-2)" : "transparent", cursor: "pointer" }}
              >
                <Star size={12} strokeWidth={1.5} fill={r.star ? "var(--rd-accent)" : "transparent"} style={{ color: r.star ? "var(--rd-accent)" : "var(--rd-mute-2)" }} />
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center" style={{ width: 26, height: 26, borderRadius: 999, background: "var(--rd-cream)", color: "var(--rd-ink-2)", fontSize: 10.5, fontWeight: 500 }}>
                    {r.name.split(" ").map((p) => p[0]).slice(0,2).join("")}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "var(--rd-ink)" }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "var(--rd-mute)" }}>{r.title}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--rd-ink-2)" }}>{r.co}</div>
                <div><StageChip stage={r.stage} /></div>
                <div style={{ fontSize: 11.5, color: "var(--rd-mute)" }}>{r.touch}</div>
                <HealthBar v={r.health} />
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 12, color: "var(--rd-ink-2)" }}>{r.next}</span>
                  {i === 0 && (
                    <span className="flex items-center gap-1" style={{ fontSize: 10.5, color: "var(--rd-accent)" }}>
                      Open <ChevronRight size={11} />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3" style={{ fontSize: 11, color: "var(--rd-mute)" }}>
            <span>Showing 7 of 23 · click any row to open the drawer</span>
            <div className="flex items-center gap-1.5">
              <CircleDot size={9} style={{ color: "var(--rd-sage)" }} /> 3 enriched in last hour
            </div>
          </div>
        </div>

        {/* Floating add button */}
        <button
          style={{ position: "absolute", bottom: 28, left: 248, background: "var(--rd-accent)", color: "#fff", padding: "10px 16px", borderRadius: 999, border: 0, cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 6px 20px -4px rgba(199,90,61,0.4)" }}
        >
          <Plus size={14} strokeWidth={2.2} /> Add person
        </button>
      </main>
      <ConductorBubble />
    </div>
  );
}
