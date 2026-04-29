import { Link } from "wouter";
import {
  Sparkles, Briefcase, Headphones, Phone, Database, Megaphone,
  ArrowRight, CheckCircle2,
} from "lucide-react";

const FEATURES = [
  {
    accent: "#B8A0C8",
    icon: Sparkles,
    title: "Home — Daily AI Briefing",
    tagline: "Open NexFlow, see what to do today. Not a dashboard — a briefing.",
    bullets: [
      "Nightly AI briefing summarizing yesterday's calls, emails, deal moves, and signals — written in plain language.",
      "4 KPI tiles: calls today, AI-completed conversations, active leads, deals at risk — re-computed in real time.",
      "Re-engagement queue surfaces leads silent ≥90 days who triggered an external signal.",
      "Tasks · Insights · AI Assistant sub-tabs for the rep's open tasks and a chat surface against the workspace.",
    ],
  },
  {
    accent: "#88B8B0",
    icon: Briefcase,
    title: "CRM — Pipeline with stall diagnosis baked in",
    tagline: "Visual kanban + per-deal AI diagnosis + account-based whitespace.",
    bullets: [
      "Drag-and-drop pipeline across LEAD → QUALIFIED → PROPOSAL → NEGOTIATION → CLOSED-WON.",
      "Run Auto-Advance: AI scans every open deal, recommends next-stage action, one-tap promotes.",
      "Per-deal stall diagnosis when a deal sits >7 days — written explanation with supporting evidence.",
      "Forecasting & health scores combine engagement, response rate, and signal velocity into a single number.",
      "Account Hub (ABM) groups contacts and deals under a parent account for multi-thread campaigns.",
    ],
  },
  {
    accent: "#C0A0B8",
    icon: Headphones,
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
  },
  {
    accent: "#A0C0B8",
    icon: Phone,
    title: "Calls & Transcripts — From hangup to deal-updated in <30s",
    tagline: "The pipeline that runs the moment a call hangs up.",
    bullets: [
      "Audio captured natively via SIP / WebRTC.",
      "Transcribed in ~10s with Whisper-large + custom Khaleeji LM, bilingual + dialect + code-switching in one pass.",
      "Speakers diarized, deal value / decision-makers / next-step / blockers / competitors auto-extracted.",
      "Deal updated, tasks created, notes attached — all deterministic.",
      "AI score logged (talk-ratio, discovery quality, objection handling), coaching tips queued.",
      "Voice library + playbooks: top-performing snippets clipped for onboarding and AI coaching prompts.",
    ],
  },
  {
    accent: "#B8B880",
    icon: Database,
    title: "Enrichment — Clay-style waterfall, GCC-first",
    tagline: "Pre-wired for KSA/UAE data sources, not US LinkedIn-only ones.",
    bullets: [
      "Filter by region, industry, seniority, headcount, intent — sourced from LinkedIn + Lusha + Apollo + Crunchbase + Wamda + Saudi MoCI + UAE chamber data.",
      "Each prospect shows match % and provenance ('via Lusha + Crunchbase') — required under PDPL.",
      "Quick Enrich: paste a domain or LinkedIn URL → AI fans out, returns unified person + company profile in <8s.",
      "Buying Signals layer continuously polls funding, hiring, news, exec moves, RFPs (Etimad, ADGM).",
      "Lead Intelligence scoring: ICP fit + engagement + signal velocity → 0–100 score per contact, refreshed nightly.",
    ],
  },
  {
    accent: "#C8A880",
    icon: Megaphone,
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
  },
];

const FLOW_STEPS = [
  { n: 1, title: "Signal detected",    surface: "Enrichment",            text: "Crunchbase update: target closes Series B. Buying Signals fires, creates a high-priority lead." },
  { n: 2, title: "Auto-enriched",      surface: "Enrichment",            text: "Waterfall runs across Lusha + Apollo + LinkedIn — returns CFO email, mobile, persona, with provenance." },
  { n: 3, title: "Routed + scored",    surface: "Automation",            text: "Lead Routing assigns to KSA enterprise rep. Lead Intelligence scores 91/100. Lands top of Power Dialer." },
  { n: 4, title: "AI Voice call",      surface: "Contact Center",        text: "Rep dials. Live AI Coach surfaces 3 objection-handlers in real time. 14-min discovery call recorded." },
  { n: 5, title: "Transcribed + logged", surface: "Conversation Intel",  text: "Bilingual transcript, summary, score 88/100. Deal auto-created at $520K, decision-makers extracted." },
  { n: 6, title: "Closed-won",         surface: "CRM + Marketing",       text: "Quote sent via CPQ, opens tracked, contract e-signed in 11 days. Marketing attribution credits original signal." },
];

export default function AboutPage() {
  return (
    <div className="space-y-20 pb-12 pt-12">
      {/* Hero */}
      <section className="px-4 max-w-[1000px] mx-auto text-center">
        <div className="text-[10px] font-black tracking-[0.25em] uppercase text-[#88B8B0] mb-3">
          What is NexFlow
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-[1.1]">
          One product. <span className="bg-gradient-to-r from-[#88B8B0] to-[#B8A0C8] bg-clip-text text-transparent">Six surfaces.</span> Production-grade today.
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          NexFlow ships as a single CRM with six top-level surfaces, each deep enough to replace a dedicated tool — not 45 shallow apps balkanized into separate Hubs.
        </p>
      </section>

      {/* 6 feature deep-dives */}
      <section className="px-4 max-w-[1100px] mx-auto space-y-6">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="glass-card rounded-2xl border border-border/30 overflow-hidden">
              <div
                className="px-6 py-4 border-b border-border/20"
                style={{ background: `linear-gradient(135deg,${f.accent}18,transparent)` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${f.accent}25` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: f.accent }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: f.accent }}>
                      Surface {i + 1}
                    </div>
                    <div className="text-xl font-black">{f.title}</div>
                    <div className="text-sm text-muted-foreground italic mt-0.5">{f.tagline}</div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5">
                <ul className="space-y-2">
                  {f.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: f.accent }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </section>

      {/* End-to-end worked example */}
      <section className="px-4 max-w-[1100px] mx-auto">
        <div className="text-[10px] font-black tracking-[0.25em] uppercase text-[#C0A0B8] mb-2 text-center">End-to-end</div>
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">One contact. Six touchpoints. Zero manual logging.</h2>
        <p className="text-base text-muted-foreground text-center max-w-2xl mx-auto mb-8">
          A worked example — a CFO at a Riyadh holding group, picked up by a buying signal, becomes a closed-won deal.
        </p>
        <div className="space-y-2">
          {FLOW_STEPS.map((s) => (
            <div key={s.n} className="glass-card rounded-xl p-4 border border-border/30 flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-base"
                style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}
              >
                {s.n}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <div className="text-base font-black">{s.title}</div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-[#B8A0C8]">{s.surface}</div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{s.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 max-w-[900px] mx-auto">
        <div className="rounded-3xl p-10 text-center border border-border/30"
          style={{ background: "linear-gradient(135deg,#88B8B015,#B8A0C815)" }}
        >
          <h3 className="text-2xl sm:text-3xl font-black mb-3">Ready to see it in action?</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
            Start free with 5 seats. No credit card. AI Workforce included from the first login.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-lg"
                style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}>
                Create account <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/pricing">
              <button className="px-6 py-3 rounded-xl text-sm font-bold border border-border/60 hover:bg-muted/40">
                See pricing
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
