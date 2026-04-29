import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Sparkles, Briefcase, Headphones, Phone, Database, Megaphone,
  ArrowRight, CheckCircle2, ChevronLeft, ChevronRight as ChevRight, Play, Pause,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInView } from "@/lib/use-marketing-anim";

interface Feature {
  key: string;
  accent: string;
  icon: typeof Sparkles;
  title: string;
  shortLabel: string;
  tagline: string;
  bullets: string[];
  /** Tiny mock-UI strip for the right preview pane */
  mock: { kind: "kpi" | "list" | "chart" | "calls" | "kanban" | "grid"; data: any };
}

const FEATURES: Feature[] = [
  {
    key: "home", shortLabel: "Home",
    accent: "#B8A0C8", icon: Sparkles,
    title: "Home — Daily AI Briefing",
    tagline: "Open NexFlow, see what to do today. Not a dashboard — a briefing.",
    bullets: [
      "Nightly AI briefing summarizing yesterday's calls, emails, deal moves, and signals — written in plain language.",
      "4 KPI tiles: calls today, AI-completed conversations, active leads, deals at risk — re-computed in real time.",
      "Re-engagement queue surfaces leads silent ≥90 days who triggered an external signal.",
      "Tasks · Insights · AI Assistant sub-tabs for the rep's open tasks and a chat surface against the workspace.",
    ],
    mock: {
      kind: "kpi",
      data: [
        { label: "Calls today",    value: "23",  delta: "+5"  },
        { label: "AI conversations", value: "11",  delta: "+3"  },
        { label: "Active leads",   value: "847", delta: "+24" },
        { label: "Deals at risk",  value: "6",   delta: "−2"  },
      ],
    },
  },
  {
    key: "crm", shortLabel: "CRM",
    accent: "#88B8B0", icon: Briefcase,
    title: "CRM — Pipeline with stall diagnosis baked in",
    tagline: "Visual kanban + per-deal AI diagnosis + account-based whitespace.",
    bullets: [
      "Drag-and-drop pipeline across LEAD → QUALIFIED → PROPOSAL → NEGOTIATION → CLOSED-WON.",
      "Run Auto-Advance: AI scans every open deal, recommends next-stage action, one-tap promotes.",
      "Per-deal stall diagnosis when a deal sits >7 days — written explanation with supporting evidence.",
      "Forecasting & health scores combine engagement, response rate, and signal velocity into a single number.",
      "Account Hub (ABM) groups contacts and deals under a parent account for multi-thread campaigns.",
    ],
    mock: {
      kind: "kanban",
      data: [
        { col: "Qualified",  count: 12, total: "SAR 2.4M" },
        { col: "Proposal",   count: 7,  total: "SAR 4.1M" },
        { col: "Negotiation",count: 4,  total: "SAR 6.8M", glow: true },
      ],
    },
  },
  {
    key: "calls", shortLabel: "Contact Center",
    accent: "#C0A0B8", icon: Headphones,
    title: "Contact Center — Power Dialer + AI Voice Agent",
    tagline: "Power Dialer that prioritizes. AI Voice Agent that calls. Intelligence on every conversation.",
    bullets: [
      "Lead-scoring model ranks every open contact (intent + recency + persona) — reps work top-down.",
      "AI Voice Agent (Khaleeji) dials qualified leads, runs a discovery script, books meetings, pushes summary back.",
      "Live AI Coach surfaces real-time tips on every connected call.",
      "Bilingual transcription (Whisper + custom Khaleeji LM) — every call recorded, summarized, scored.",
      "Conversation Intelligence trends: top objections, talk-listen ratios, sentiment by stage, competitor mentions.",
      "WhatsApp / Messages / Email — unified inbox with thread-level deal context.",
    ],
    mock: {
      kind: "calls",
      data: [
        { name: "Khalid Al-Otaibi · Aramco",   score: 94, status: "live"     },
        { name: "Sara Al-Mansouri · STC",       score: 88, status: "queued"   },
        { name: "Faisal Al-Harbi · Tabby",      score: 82, status: "queued"   },
        { name: "Reem Al-Qahtani · ACWA Power", score: 79, status: "queued"   },
      ],
    },
  },
  {
    key: "transcripts", shortLabel: "Calls & Transcripts",
    accent: "#A0C0B8", icon: Phone,
    title: "Calls & Transcripts — From hangup to deal-updated in <30s",
    tagline: "The pipeline that runs the moment a call hangs up.",
    bullets: [
      "Audio captured natively via SIP / WebRTC.",
      "Transcribed in ~10s with Whisper-large + custom Khaleeji LM, bilingual + dialect + code-switching in one pass.",
      "Speakers diarized; deal value, decision-makers, next-step, blockers, competitors auto-extracted.",
      "Deal updated, tasks created, notes attached — all deterministic.",
      "AI score logged (talk-ratio, discovery quality, objection handling); coaching tips queued.",
      "Voice library + playbooks: top-performing snippets clipped for onboarding and AI coaching prompts.",
    ],
    mock: {
      kind: "chart",
      data: { score: 87, label: "Discovery score", talkRatio: 42, sentiment: "Positive", duration: "14:22" },
    },
  },
  {
    key: "enrich", shortLabel: "Enrichment",
    accent: "#B8B880", icon: Database,
    title: "Enrichment — Clay-style waterfall, GCC-first",
    tagline: "Pre-wired for KSA/UAE data sources, not US LinkedIn-only ones.",
    bullets: [
      "Filter by region, industry, seniority, headcount, intent — sourced from LinkedIn + Lusha + Apollo + Crunchbase + Wamda + Saudi MoCI + UAE chamber data.",
      "Each prospect shows match % and provenance ('via Lusha + Crunchbase') — required under PDPL.",
      "Quick Enrich: paste a domain or LinkedIn URL → AI fans out, returns unified person + company profile in <8s.",
      "Buying Signals layer continuously polls funding, hiring, news, exec moves, RFPs (Etimad, ADGM).",
      "Lead Intelligence scoring: ICP fit + engagement + signal velocity → 0–100 score per contact, refreshed nightly.",
    ],
    mock: {
      kind: "list",
      data: [
        { src: "Lusha",      label: "Verified mobile",   ok: true },
        { src: "Apollo",     label: "Email + role",      ok: true },
        { src: "Crunchbase", label: "Funding ($45M B)",  ok: true },
        { src: "Wamda",      label: "GCC press mention", ok: true },
        { src: "MoCI KSA",   label: "Legal entity",      ok: true },
      ],
    },
  },
  {
    key: "marketing", shortLabel: "Marketing",
    accent: "#C8A880", icon: Megaphone,
    title: "Marketing — Describe the campaign, AI returns the plan",
    tagline: "Strategy, cadence, budget split — generated, not built.",
    bullets: [
      "AI Strategy Builder: describe a goal + budget + channels → AI returns messaging, calendar, segments, projected pipeline.",
      "Dormant lead reactivation continuously identifies leads silent ≥90 days, segments by reason of silence.",
      "Multi-channel sequences (email → WhatsApp → SMS → call) with branching by reply, click, or signal.",
      "Cultural Intelligence layer auto-applies KSA/UAE/BH norms: Hijri-aware send times, Ramadan windows, Khaleeji vs Levantine.",
      "Attribution to pipeline: every campaign touch wired into deal records — 'Pipeline Influenced' KPI is real revenue.",
      "Web Forms + Document Tracking: lead-capture writes directly to CRM with enrichment on submit.",
    ],
    mock: {
      kind: "grid",
      data: [
        { ch: "Email",    sent: "1,240", reply: "8.2%",  glow: false },
        { ch: "WhatsApp", sent: "612",   reply: "21.4%", glow: true  },
        { ch: "SMS",      sent: "488",   reply: "11.7%", glow: false },
        { ch: "Call",     sent: "211",   reply: "47.9%", glow: true  },
      ],
    },
  },
];

const FLOW_STEPS = [
  { n: 1, surface: "Enrichment",          title: "Signal detected",    text: "Crunchbase update: target closes Series B. Buying Signals fires, creates a high-priority lead.", color: "#B8B880" },
  { n: 2, surface: "Enrichment",          title: "Auto-enriched",      text: "Waterfall runs across Lusha + Apollo + LinkedIn — returns CFO email, mobile, persona, with provenance.", color: "#B8B880" },
  { n: 3, surface: "Automation",          title: "Routed + scored",    text: "Lead Routing assigns to KSA enterprise rep. Lead Intelligence scores 91/100. Lands top of Power Dialer.", color: "#88B8B0" },
  { n: 4, surface: "Contact Center",      title: "AI Voice call",      text: "Rep dials. Live AI Coach surfaces 3 objection-handlers in real time. 14-min discovery call recorded.", color: "#C0A0B8" },
  { n: 5, surface: "Conversation Intel",  title: "Transcribed + logged", text: "Bilingual transcript, summary, score 88/100. Deal auto-created at $520K, decision-makers extracted.", color: "#A0C0B8" },
  { n: 6, surface: "CRM + Marketing",     title: "Closed-won",         text: "Quote sent via CPQ, opens tracked, contract e-signed in 11 days. Marketing attribution credits original signal.", color: "#C8A880" },
];

function FeatureMock({ f }: { f: Feature }) {
  const m = f.mock;
  if (m.kind === "kpi") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {m.data.map((k: any, i: number) => (
          <div key={i} className="rounded-lg p-3 border border-border/30 bg-background/40 backdrop-blur"
            style={{ animation: `fadeInUp .5s ease ${i * 0.06}s both` }}>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{k.label}</div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black tabular-nums">{k.value}</span>
              <span className="text-[10px] font-bold" style={{ color: f.accent }}>{k.delta}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (m.kind === "kanban") {
    return (
      <div className="grid grid-cols-3 gap-2">
        {m.data.map((c: any, i: number) => (
          <div key={i} className={cn(
            "rounded-lg p-3 border bg-background/40 backdrop-blur transition-all",
            c.glow ? "border-2 shadow-md" : "border-border/30",
          )} style={c.glow ? { borderColor: f.accent } : undefined}>
            <div className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: f.accent }}>{c.col}</div>
            <div className="text-lg font-black tabular-nums">{c.count}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{c.total}</div>
            {c.glow && <div className="mt-2 h-1 rounded-full overflow-hidden bg-muted/30">
              <div className="h-full rounded-full animate-pulse" style={{ width: "73%", background: f.accent }} />
            </div>}
          </div>
        ))}
      </div>
    );
  }
  if (m.kind === "calls") {
    return (
      <div className="space-y-1.5">
        {m.data.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 rounded-lg p-2.5 border border-border/30 bg-background/40 backdrop-blur"
            style={{ animation: `fadeInUp .4s ease ${i * 0.07}s both` }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
              style={{ background: f.accent }}>
              {p.score}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate">{p.name}</div>
            </div>
            {p.status === "live" ? (
              <div className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
              </div>
            ) : (
              <div className="text-[10px] text-muted-foreground font-semibold">queued</div>
            )}
          </div>
        ))}
      </div>
    );
  }
  if (m.kind === "chart") {
    const d = m.data;
    return (
      <div className="space-y-3">
        <div className="rounded-xl p-4 border border-border/30 bg-background/40 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{d.label}</div>
            <div className="text-2xl font-black" style={{ color: f.accent }}>{d.score}</div>
          </div>
          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${d.score}%`, background: `linear-gradient(90deg,${f.accent},#B8A0C8)` }} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { k: "Talk ratio", v: `${d.talkRatio}%`  },
            { k: "Sentiment",  v: d.sentiment        },
            { k: "Duration",   v: d.duration         },
          ].map((s, i) => (
            <div key={i} className="rounded-lg p-2 border border-border/30 bg-background/40 backdrop-blur text-center">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">{s.k}</div>
              <div className="text-xs font-black mt-0.5">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (m.kind === "list") {
    return (
      <div className="space-y-1.5">
        {m.data.map((r: any, i: number) => (
          <div key={i} className="flex items-center gap-2 rounded-lg p-2 border border-border/30 bg-background/40 backdrop-blur"
            style={{ animation: `fadeInUp .4s ease ${i * 0.06}s both` }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: f.accent }} />
            <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: f.accent }}>{r.src}</div>
            <div className="flex-1 text-xs font-semibold truncate">{r.label}</div>
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: f.accent }} />
          </div>
        ))}
      </div>
    );
  }
  if (m.kind === "grid") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {m.data.map((g: any, i: number) => (
          <div key={i} className={cn(
            "rounded-lg p-3 border bg-background/40 backdrop-blur transition-all",
            g.glow ? "border-2 shadow-md" : "border-border/30",
          )} style={g.glow ? { borderColor: f.accent } : undefined}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] font-black uppercase tracking-wider">{g.ch}</div>
              {g.glow && <Sparkles className="w-3 h-3 animate-pulse" style={{ color: f.accent }} />}
            </div>
            <div className="text-[10px] text-muted-foreground">Sent {g.sent}</div>
            <div className="text-base font-black tabular-nums" style={{ color: g.glow ? f.accent : undefined }}>{g.reply}</div>
            <div className="text-[9px] text-muted-foreground">reply rate</div>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function AboutPage() {
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);
  const flow = useInView<HTMLDivElement>(0.2);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setStep((s) => (s + 1) % FLOW_STEPS.length), 1800);
    return () => clearInterval(id);
  }, [auto]);

  const current = FEATURES[active];
  const Icon = current.icon;

  return (
    <div className="space-y-20 pb-12 pt-12 overflow-x-clip">
      <style>{`
        @keyframes fadeInUp { 0% { opacity:0; transform: translateY(8px); } 100% { opacity:1; transform: translateY(0); } }
      `}</style>

      {/* Hero */}
      <section className="px-4 max-w-[1100px] mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#88B8B0]/10 border border-[#88B8B0]/30 mb-4">
          <Sparkles className="w-3 h-3 text-[#88B8B0]" />
          <span className="text-[11px] font-black tracking-wider uppercase text-[#88B8B0]">What is NexFlow</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 leading-[1.05]">
          One product. <span className="bg-gradient-to-r from-[#88B8B0] to-[#B8A0C8] bg-clip-text text-transparent">Six surfaces.</span>
          <br />Production-grade today.
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Click through six product surfaces below. Each is deep enough to replace a dedicated tool — not 45 shallow apps balkanized into separate Hubs.
        </p>
      </section>

      {/* INTERACTIVE FEATURE EXPLORER */}
      <section className="px-4 max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Left: vertical tabs */}
          <div className="space-y-1.5">
            {FEATURES.map((f, i) => {
              const FIcon = f.icon;
              const isActive = i === active;
              return (
                <button
                  key={f.key}
                  onClick={() => setActive(i)}
                  className={cn(
                    "w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl border transition-all",
                    isActive
                      ? "shadow-md scale-[1.02]"
                      : "border-border/30 glass-card hover:border-border/60 hover:translate-x-1",
                  )}
                  style={isActive
                    ? { borderColor: f.accent, background: `linear-gradient(135deg,${f.accent}18,transparent)` }
                    : undefined}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform"
                    style={{ background: `${f.accent}25`, transform: isActive ? "rotate(-6deg)" : undefined }}
                  >
                    <FIcon className="w-4 h-4" style={{ color: f.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: f.accent }}>
                      Surface {i + 1}
                    </div>
                    <div className={cn("text-sm font-bold truncate", isActive && "font-black")}>{f.shortLabel}</div>
                  </div>
                  {isActive && (
                    <div className="w-1 h-8 rounded-full" style={{ background: f.accent }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: active feature */}
          <div className="glass-card rounded-2xl border border-border/30 overflow-hidden"
            style={{ background: `linear-gradient(135deg,${current.accent}10,transparent)` }}
          >
            <div className="p-6 border-b border-border/20">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${current.accent}25` }}>
                  <Icon className="w-6 h-6" style={{ color: current.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: current.accent }}>
                    Surface {active + 1} of {FEATURES.length}
                  </div>
                  <div className="text-xl font-black">{current.title}</div>
                  <div className="text-sm text-muted-foreground italic mt-0.5">{current.tagline}</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 p-6">
              <ul className="space-y-2.5">
                {current.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm" style={{ animation: `fadeInUp .4s ease ${j * 0.05}s both` }}>
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: current.accent }} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="rounded-xl p-4 border border-border/30 bg-muted/10" key={active}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Live preview</div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/60" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400/60" />
                  </div>
                </div>
                <FeatureMock f={current} />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border/20 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => setActive((a) => (a - 1 + FEATURES.length) % FEATURES.length)}
                className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <Link href="/signup">
                <button className="group inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
                  style={{ background: `linear-gradient(135deg,${current.accent},#B8A0C8)` }}
                >
                  Try it free <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <button
                onClick={() => setActive((a) => (a + 1) % FEATURES.length)}
                className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Next <ChevRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE END-TO-END FLOW */}
      <section className="px-4 max-w-[1100px] mx-auto" ref={flow.ref}>
        <div className="text-center mb-2">
          <div className="text-[10px] font-black tracking-[0.25em] uppercase text-[#C0A0B8] mb-2">End-to-end</div>
          <h2 className="text-3xl sm:text-4xl font-black mb-3">
            One contact. Six touchpoints. Zero manual logging.
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Step through a worked example — a CFO at a Riyadh holding group, picked up by a buying signal, becomes a closed-won deal.
          </p>
          <button
            onClick={() => setAuto((a) => !a)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/40 hover:bg-muted/40 text-xs font-bold"
          >
            {auto ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {auto ? "Pause" : "Auto-play"}
          </button>
        </div>

        {/* Stepper bar */}
        <div className="mt-6 flex items-center gap-1.5 max-w-3xl mx-auto">
          {FLOW_STEPS.map((s, i) => (
            <button
              key={s.n}
              onClick={() => setStep(i)}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all",
                i <= step ? "" : "bg-muted/30",
              )}
              style={i <= step ? { background: s.color } : undefined}
              aria-label={`Step ${s.n}: ${s.title}`}
            />
          ))}
        </div>

        {/* Step pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap mt-4">
          {FLOW_STEPS.map((s, i) => (
            <button
              key={s.n}
              onClick={() => setStep(i)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all",
                i === step ? "text-white scale-110 shadow-lg" : "bg-muted/30 text-muted-foreground hover:scale-105",
              )}
              style={i === step ? { background: `linear-gradient(135deg,${s.color},#B8A0C8)` } : undefined}
            >
              {s.n}
            </button>
          ))}
        </div>

        {/* Active step card */}
        <div
          key={step}
          className="glass-card rounded-2xl border border-border/30 p-7 mt-6 max-w-2xl mx-auto"
          style={{
            background: `linear-gradient(135deg,${FLOW_STEPS[step].color}15,transparent)`,
            animation: "fadeInUp .35s ease both",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${FLOW_STEPS[step].color},#B8A0C8)` }}
            >
              {FLOW_STEPS[step].n}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: FLOW_STEPS[step].color }}>
                {FLOW_STEPS[step].surface}
              </div>
              <div className="text-xl font-black">{FLOW_STEPS[step].title}</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{FLOW_STEPS[step].text}</p>
        </div>

        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-border/40 hover:bg-muted/40 text-xs font-bold disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
          <button
            onClick={() => setStep((s) => Math.min(FLOW_STEPS.length - 1, s + 1))}
            disabled={step === FLOW_STEPS.length - 1}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-40"
            style={{ background: `linear-gradient(135deg,${FLOW_STEPS[step].color},#B8A0C8)` }}
          >
            Next step <ChevRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 max-w-[1000px] mx-auto">
        <div className="relative rounded-3xl p-10 sm:p-14 text-center border border-border/30 overflow-hidden"
          style={{ background: "linear-gradient(135deg,#88B8B015,#B8A0C815)" }}
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-30 animate-pulse"
            style={{ background: "radial-gradient(circle,#B8A0C8,transparent 70%)" }} />
          <div className="relative">
            <h3 className="text-3xl sm:text-4xl font-black mb-3">
              Ready to see it in your tenant?
            </h3>
            <p className="text-sm text-muted-foreground mb-7 max-w-xl mx-auto">
              Start free with 5 seats. No credit card. AI Workforce included from the first login.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup">
                <button className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-sm font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
                  style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}>
                  Create account <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <Link href="/pricing">
                <button className="px-7 py-3.5 rounded-xl text-sm font-bold border border-border/60 hover:bg-muted/40 hover:scale-105 transition-all">
                  See pricing
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
