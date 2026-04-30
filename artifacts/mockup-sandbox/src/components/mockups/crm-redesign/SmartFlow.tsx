import "./_group.css";
import {
  Home as HomeIcon, Users, MessageSquare, Settings,
  Search, Sparkles, ChevronDown, ChevronRight, Plus,
  Flame, AlertTriangle, CircleDot, TrendingUp, TrendingDown,
  Eye, Mail, Phone, Calendar, Bell, Activity, Lightbulb,
  Play, ArrowUp,
} from "lucide-react";

function Rail({ active = "crm" }: { active?: string }) {
  const items = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "crm", label: "CRM", icon: Users },
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
      </div>
      <div className="flex flex-col gap-3 px-1.5">
        <div className="flex items-center gap-2" style={{ color: "var(--rd-mute)", fontSize: 12 }}>
          <Settings size={14} strokeWidth={1.6} /><span>Settings</span>
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
        <span>CRM</span><span>·</span><span style={{ color: "var(--rd-ink)" }}>AI SmartFlow</span>
      </div>
      <div className="flex items-center gap-2" style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--rd-cream)", background: "var(--rd-card)", color: "var(--rd-mute)", fontSize: 12 }}>
        <Search size={13} strokeWidth={1.6} /><span>Search anything</span>
        <span className="rd-mono" style={{ fontSize: 10, color: "var(--rd-mute-2)" }}>⌘K</span>
      </div>
    </div>
  );
}

function Tabs() {
  return (
    <div style={{ padding: "20px 36px 0 36px" }}>
      <div className="flex items-baseline gap-6" style={{ borderBottom: "1px solid var(--rd-cream)" }}>
        {[
          { l: "People" },
          { l: "Companies" },
          { l: "Deals" },
          { l: "AI SmartFlow", active: true, accent: true },
        ].map((t) => (
          <div key={t.l} style={{ paddingBottom: 12, position: "relative" }}>
            <span className="rd-display flex items-center gap-1.5" style={{ fontSize: 22, color: t.active ? "var(--rd-ink)" : "var(--rd-mute-2)" }}>
              {t.accent && <Sparkles size={13} strokeWidth={1.8} style={{ color: "var(--rd-accent)" }} />}
              {t.l}
            </span>
            {t.active && <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 2, background: "var(--rd-accent)" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiChip({ icon: Icon, label, value, tone, expanded }: { icon: any; label: string; value: string; tone: "accent" | "amber" | "sage"; expanded?: boolean }) {
  const c = tone === "accent" ? "var(--rd-accent)" : tone === "amber" ? "var(--rd-amber)" : "var(--rd-sage)";
  const bg = tone === "accent" ? "var(--rd-accent-soft)" : tone === "amber" ? "#F8E7C8" : "var(--rd-sage-soft)";
  return (
    <div
      className="rd-card"
      style={{ padding: "12px 14px", flex: 1, cursor: "pointer", borderColor: expanded ? c : "var(--rd-cream)" }}
    >
      <div className="flex items-center gap-2.5">
        <div style={{ width: 28, height: 28, borderRadius: 999, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={13} strokeWidth={2} style={{ color: c }} />
        </div>
        <div className="flex-1">
          <div style={{ fontSize: 11, color: "var(--rd-mute)" }}>{label}</div>
          <div className="rd-display" style={{ fontSize: 22, color: "var(--rd-ink)", lineHeight: 1.1 }}>{value}</div>
        </div>
        <ChevronRight size={13} strokeWidth={1.6} style={{ color: "var(--rd-mute-2)", transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
      </div>
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--rd-cream)", fontSize: 11.5, color: "var(--rd-ink-2)", lineHeight: 1.55 }}>
          <div className="flex items-center gap-2"><div style={{ width: 4, height: 4, borderRadius: 999, background: c }} /> Re-engage Faisal · 6d silent</div>
          <div className="flex items-center gap-2 mt-1"><div style={{ width: 4, height: 4, borderRadius: 999, background: c }} /> Aramco intent surge · 3 site visits</div>
          <div className="flex items-center gap-2 mt-1"><div style={{ width: 4, height: 4, borderRadius: 999, background: c }} /> Hala opened pricing · twice today</div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, delta, up }: { label: string; value: string; delta: string; up: boolean }) {
  return (
    <div className="rd-card" style={{ padding: "16px 18px" }}>
      <div style={{ fontSize: 11, color: "var(--rd-mute)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div className="rd-display" style={{ fontSize: 30, color: "var(--rd-ink)", lineHeight: 1.1, marginTop: 4 }}>{value}</div>
      <div className="flex items-center gap-1.5 mt-2" style={{ fontSize: 11, color: up ? "var(--rd-sage)" : "var(--rd-accent)" }}>
        {up ? <TrendingUp size={11} strokeWidth={2} /> : <TrendingDown size={11} strokeWidth={2} />}
        <span>{delta}</span>
        <span style={{ color: "var(--rd-mute)" }}>vs prior period</span>
      </div>
    </div>
  );
}

function FunnelStage({ label, count, value, conv, widthPct, isLast }: { label: string; count: number; value: string; conv?: string; widthPct: number; isLast?: boolean }) {
  return (
    <div style={{ marginBottom: isLast ? 0 : 10 }}>
      <div className="flex items-center justify-between mb-1.5" style={{ fontSize: 11.5, color: "var(--rd-ink-2)" }}>
        <div className="flex items-center gap-2">
          <span style={{ fontWeight: 500 }}>{label}</span>
          <span className="rd-mono" style={{ color: "var(--rd-mute)", fontSize: 10.5 }}>{count} leads</span>
        </div>
        <div className="flex items-center gap-2">
          {conv && <span style={{ fontSize: 10.5, color: "var(--rd-mute)" }}>{conv} conv</span>}
          <span className="rd-mono" style={{ fontSize: 11, color: "var(--rd-ink)" }}>{value}</span>
        </div>
      </div>
      <div style={{ position: "relative", height: 28, borderRadius: 6, background: "var(--rd-sand-2)", overflow: "hidden", border: "1px solid var(--rd-cream)" }}>
        <div
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${widthPct}%`,
            background: "linear-gradient(90deg, var(--rd-accent) 0%, #D17B5A 100%)",
            borderRadius: 5,
          }}
        />
      </div>
    </div>
  );
}

function AnalysisBullet({ kind, text, lateral }: { kind: string; text: React.ReactNode; lateral?: boolean }) {
  const tone = lateral ? "var(--rd-accent)" : "var(--rd-sage)";
  return (
    <div className="flex items-start gap-2.5" style={{ padding: "8px 0" }}>
      <div style={{ width: 6, height: 6, borderRadius: 999, background: tone, marginTop: 7, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="flex items-center gap-2 mb-0.5">
          <span style={{ fontSize: 10, color: tone, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{kind}</span>
          {lateral && (
            <span className="rd-pill" style={{ background: "var(--rd-accent-soft)", color: "#8C3B22", fontSize: 9.5, fontWeight: 500, padding: "1px 6px" }}>lateral</span>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--rd-ink-2)", lineHeight: 1.5 }}>{text}</div>
      </div>
    </div>
  );
}

function WatchlistItem({ name, co, reason, score, tone }: { name: string; co: string; reason: string; score: number; tone: "accent" | "amber" | "sage" }) {
  const c = tone === "accent" ? "var(--rd-accent)" : tone === "amber" ? "var(--rd-amber)" : "var(--rd-sage)";
  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid var(--rd-cream)" }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2.5">
          <div style={{ width: 26, height: 26, borderRadius: 999, background: "var(--rd-cream)", color: "var(--rd-ink-2)", fontSize: 10, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {name.split(" ").map(n => n[0]).slice(0,2).join("")}
          </div>
          <div>
            <div style={{ fontSize: 12.5, color: "var(--rd-ink)", fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 10.5, color: "var(--rd-mute)" }}>{co}</div>
          </div>
        </div>
        <div className="flex items-center gap-1" style={{ fontSize: 11, color: c }}>
          <ArrowUp size={10} strokeWidth={2} /><span className="rd-mono">{score}</span>
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--rd-mute)", lineHeight: 1.45, paddingLeft: 36, fontStyle: "italic" }}>
        <Sparkles size={9} className="inline" style={{ color: c, marginRight: 4 }} strokeWidth={1.8} />
        {reason}
      </div>
    </div>
  );
}

function SignalRow({ icon: Icon, time, body, tone }: { icon: any; time: string; body: string; tone: "accent" | "amber" | "sage" }) {
  const c = tone === "accent" ? "var(--rd-accent)" : tone === "amber" ? "var(--rd-amber)" : "var(--rd-sage)";
  return (
    <div className="flex items-start gap-2.5" style={{ padding: "9px 0", borderBottom: "1px solid var(--rd-cream)" }}>
      <div style={{ width: 22, height: 22, borderRadius: 999, background: "var(--rd-sand-2)", border: "1px solid var(--rd-cream)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={10} strokeWidth={1.8} style={{ color: c }} />
      </div>
      <div style={{ flex: 1, fontSize: 11.5, color: "var(--rd-ink-2)", lineHeight: 1.5 }}>{body}</div>
      <span className="rd-mono" style={{ fontSize: 10, color: "var(--rd-mute-2)", paddingTop: 4 }}>{time}</span>
    </div>
  );
}

export function SmartFlow() {
  return (
    <div className="rd-root flex" style={{ minHeight: "100vh", height: "100vh", overflow: "hidden", position: "relative" }}>
      <Rail active="crm" />
      <main style={{ flex: 1, overflow: "auto" }}>
        <Topbar />
        <Tabs />

        {/* 70/30 split */}
        <div style={{ padding: "20px 36px 100px 36px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

          {/* LEFT 70% */}
          <div>
            {/* AI 2-line overview */}
            <div className="rd-card" style={{ padding: "16px 18px", background: "linear-gradient(135deg, #FFFFFF 0%, #FBF9F4 60%, #F4DACD 240%)" }}>
              <div className="flex items-center gap-2 mb-2" style={{ fontSize: 10.5, color: "var(--rd-mute)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <Sparkles size={11} strokeWidth={1.8} style={{ color: "var(--rd-accent)" }} />
                Today's overview · synced 4 min ago
              </div>
              <div className="rd-display" style={{ fontSize: 19, lineHeight: 1.4, color: "var(--rd-ink)" }}>
                Your pipeline added <span style={{ color: "var(--rd-accent)" }}>$84k</span> in motion this week — driven by 3 enterprise reactivations. Two SLA breaches need attention before EOD; both are <span style={{ fontStyle: "italic" }}>Riyadh-based</span>.
              </div>
            </div>

            {/* 3 KPI chips — click expands inline */}
            <div className="flex items-stretch gap-3 mt-4">
              <KpiChip icon={CircleDot}     label="Tasks Today"    value="8"  tone="accent" expanded />
              <KpiChip icon={Flame}         label="Hot Signals"    value="5"  tone="amber" />
              <KpiChip icon={AlertTriangle} label="SLA Breaches"   value="2"  tone="accent" />
            </div>

            {/* Pipeline Overview Dashboard */}
            <div className="flex items-center justify-between mt-7 mb-3">
              <div className="flex items-baseline gap-3">
                <h2 className="rd-display" style={{ fontSize: 22, color: "var(--rd-ink)" }}>Pipeline Overview</h2>
                <span style={{ fontSize: 11.5, color: "var(--rd-mute)" }}>4.2 · since inception</span>
              </div>
              <button
                style={{ padding: "5px 11px", borderRadius: 8, background: "var(--rd-card)", border: "1px solid var(--rd-cream)", fontSize: 11.5, color: "var(--rd-ink-2)", display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}
              >
                Since Inception
                <ChevronDown size={11} strokeWidth={1.8} style={{ color: "var(--rd-mute)" }} />
              </button>
            </div>

            {/* 4 KPI cards */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              <KpiCard label="Total Leads"         value="1,847" delta="+12%" up />
              <KpiCard label="Total Engagements"   value="6,294" delta="+8%"  up />
              <KpiCard label="Missed Opportunities" value="46"   delta="−5%"  up />
              <KpiCard label="Active Pipeline"     value="$2.4M" delta="+18%" up />
            </div>

            {/* Funnel chart */}
            <div className="rd-card" style={{ padding: "20px 22px" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="rd-display" style={{ fontSize: 17, color: "var(--rd-ink)" }}>Funnel</div>
                <div className="flex items-center gap-3" style={{ fontSize: 11, color: "var(--rd-mute)" }}>
                  <span><span className="rd-mono" style={{ color: "var(--rd-ink)" }}>10.7%</span> overall conversion</span>
                </div>
              </div>
              <FunnelStage label="Lead"        count={1847} value="$5.8M" widthPct={100}             conv="42% →" />
              <FunnelStage label="Qualified"   count={776}  value="$3.6M" widthPct={(776/1847)*100}  conv="58% →" />
              <FunnelStage label="Proposal"    count={450}  value="$2.4M" widthPct={(450/1847)*100}  conv="49% →" />
              <FunnelStage label="Negotiation" count={221}  value="$1.5M" widthPct={(221/1847)*100}  conv="89% →" />
              <FunnelStage label="Closed Won"  count={197}  value="$1.3M" widthPct={(197/1847)*100}  isLast />
            </div>

            {/* AI Analysis card */}
            <div className="rd-card" style={{ padding: "20px 22px", marginTop: 16 }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} strokeWidth={1.8} style={{ color: "var(--rd-accent)" }} />
                  <div className="rd-display" style={{ fontSize: 17, color: "var(--rd-ink)" }}>AI Analysis</div>
                  <span className="rd-pill" style={{ background: "var(--rd-sand-2)", color: "var(--rd-mute)", border: "1px solid var(--rd-cream)", fontSize: 10 }}>5 insights · 1 lateral</span>
                </div>
                <button
                  style={{ padding: "7px 13px", borderRadius: 9, background: "var(--rd-ink)", color: "var(--rd-sand)", border: 0, fontSize: 12, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}
                >
                  <Play size={11} strokeWidth={2} fill="var(--rd-sand)" /> Run Analysis
                </button>
              </div>

              <AnalysisBullet
                kind="Conversion"
                text={<>Negotiation → Closed Won is at <span style={{ color: "var(--rd-ink)", fontWeight: 500 }}>89%</span> — your strongest stage. Bottleneck is Qualified → Proposal at 58%.</>}
              />
              <AnalysisBullet
                kind="Velocity"
                text={<>Average deal cycle dropped <span style={{ color: "var(--rd-sage)", fontWeight: 500 }}>11 days</span> since enabling Conductor's morning brief. ROI on AI cost: 4.7×.</>}
              />
              <AnalysisBullet
                kind="Risk"
                text={<>Riyadh-based deals are 2.3× more likely to slip in Q2 due to Ramadan budget cycles. <span style={{ color: "var(--rd-ink)", fontWeight: 500 }}>3 deals at risk</span>: Aramco, STC, ADNOC.</>}
              />
              <AnalysisBullet
                kind="Cohort"
                text={<>Leads from MAGNiTT enrichment close at 1.6× the rate of LinkedIn-sourced leads — but cost 4× more per lead. Net ROI still favors MAGNiTT for Enterprise.</>}
              />
              <AnalysisBullet
                lateral
                kind="Lateral correlation"
                text={<>Deals where Sara made the <span style={{ fontWeight: 500 }}>first call before 10am</span> close 38% faster regardless of stage entered. <span style={{ color: "var(--rd-mute)", fontStyle: "italic" }}>Hypothesis: morning calls catch decision-makers in receptive state.</span></>}
              />
            </div>
          </div>

          {/* RIGHT 30% sticky */}
          <aside style={{ position: "sticky", top: 20 }}>
            {/* Watchlist */}
            <div className="rd-card" style={{ padding: "16px 18px" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Eye size={13} strokeWidth={1.8} style={{ color: "var(--rd-accent)" }} />
                  <div style={{ fontSize: 12.5, color: "var(--rd-ink)", fontWeight: 500 }}>AI Watchlist</div>
                </div>
                <span className="rd-pill" style={{ background: "var(--rd-accent-soft)", color: "#8C3B22", padding: "2px 7px", fontSize: 10, fontWeight: 500 }}>5</span>
              </div>
              <p style={{ fontSize: 11, color: "var(--rd-mute)", marginBottom: 4 }}>Accounts AI is monitoring right now</p>
              <WatchlistItem name="Khaled Al-Mansoori" co="Aramco Digital" reason="3 visits to pricing today + opened Q2 ROI doc" score={92} tone="accent" />
              <WatchlistItem name="Hala Mansour"        co="Etisalat by e&" reason="CFO opened security brief twice — buying signal" score={84} tone="amber" />
              <WatchlistItem name="Faisal Al-Otaibi"   co="STC Solutions" reason="Silent 6d. Listener: nudge or risk losing slot" score={71} tone="accent" />
              <WatchlistItem name="Tariq Bensalem"      co="OCP Group" reason="LinkedIn engagement spike from competitor news" score={66} tone="sage" />
              <button style={{ marginTop: 6, padding: "5px 0", background: "transparent", border: 0, color: "var(--rd-mute)", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                <Plus size={10} strokeWidth={2} /> Add to watchlist
              </button>
            </div>

            {/* Live signals feed */}
            <div className="rd-card" style={{ padding: "16px 18px", marginTop: 12 }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity size={13} strokeWidth={1.8} style={{ color: "var(--rd-sage)" }} />
                  <div style={{ fontSize: 12.5, color: "var(--rd-ink)", fontWeight: 500 }}>Live signals</div>
                </div>
                <div className="flex items-center gap-1.5" style={{ fontSize: 10.5, color: "var(--rd-mute)" }}>
                  <div style={{ width: 5, height: 5, borderRadius: 999, background: "var(--rd-sage)" }} className="rd-blink" /> live
                </div>
              </div>
              <SignalRow icon={Eye}      time="2m"  body={<><span style={{ color: "var(--rd-ink)", fontWeight: 500 }}>Khaled</span> opened pricing page · 3rd visit today</>} tone="accent" />
              <SignalRow icon={Mail}     time="9m"  body={<><span style={{ color: "var(--rd-ink)", fontWeight: 500 }}>Layla</span> replied to your email · sentiment positive</>} tone="sage" />
              <SignalRow icon={Phone}    time="14m" body={<><span style={{ color: "var(--rd-ink)", fontWeight: 500 }}>Yusuf</span> missed call · auto-rescheduled by Conductor</>} tone="amber" />
              <SignalRow icon={Bell}     time="22m" body={<><span style={{ color: "var(--rd-ink)", fontWeight: 500 }}>Hala</span> opened security brief twice in 5 min</>} tone="accent" />
              <SignalRow icon={Calendar} time="38m" body={<><span style={{ color: "var(--rd-ink)", fontWeight: 500 }}>Mariam</span> accepted Quote v3 calendar invite</>} tone="sage" />
              <SignalRow icon={Lightbulb} time="1h" body={<>Coach surfaced new objection pattern in 3 calls today</>} tone="amber" />
            </div>
          </aside>
        </div>
      </main>

      {/* Conductor bubble */}
      <div
        className="rd-pulse flex items-center justify-center"
        style={{ position: "absolute", bottom: 28, right: 32, zIndex: 50, width: 52, height: 52, borderRadius: 999, background: "var(--rd-ink)", color: "var(--rd-sand)", boxShadow: "var(--rd-shadow-lift)", cursor: "pointer" }}
      >
        <Sparkles size={20} strokeWidth={1.5} />
      </div>
    </div>
  );
}
