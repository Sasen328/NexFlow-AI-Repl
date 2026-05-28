import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight, Sparkles, Globe2, Lock, Brain, TrendingUp,
  Play, ChevronDown, Star, Zap, Mic, BarChart3, Workflow,
  Users, Building2, LineChart, ShieldCheck, PhoneCall,
  MessageSquare, Megaphone, CheckCircle2, ChevronRight,
} from "lucide-react";
import { NexFlowWordmark } from "@/components/layout/NexFlowLogo";
import { useInView, useCountUp, useTilt } from "@/lib/use-marketing-anim";
import { cn } from "@/lib/utils";

const COMPETITORS = [
  { name: "Salesforce",     revenue: "$34.9B", year: "FY25", note: "No KSA region" },
  { name: "Microsoft D365", revenue: "~$6.5B", year: "Est.", note: "No KSA region" },
  { name: "HubSpot",        revenue: "$2.63B", year: "FY24", note: "EU/US only"    },
  { name: "Zoho",           revenue: "$1.30B", year: "2024", note: "India-hosted"  },
  { name: "Freshworks",     revenue: "$720M",  year: "FY24", note: "India/US"      },
  { name: "Pipedrive",      revenue: "$169M",  year: "FY23", note: "EU-hosted"     },
];

const NUMBERS = [
  { value: 3.6, prefix: "$", suffix: "B", label: "GCC CRM market by 2030",  sub: "Up from $1.8B in 2026",     color: "#B8A0C8" },
  { value: 2.4, prefix: "$", suffix: "B", label: "KSA alone by 2030",        sub: "Vision 2030 push",          color: "#88B8B0" },
  { value: 0,   prefix: "",  suffix: "",  label: "GCC-native CRMs today",    sub: "All incumbents foreign",    color: "#C0A0B8", display: "0" },
  { value: 36,  prefix: "$", suffix: "M", label: "1% of GCC SAM in ARR",     sub: "Our Year-5 wedge",          color: "#C8A880" },
];

const DIFFERENTIATORS = [
  { icon: Globe2,     accent: "#88B8B0", title: "Bilingual at the schema level",        body: "Arabic + English are native data types — RTL by default, Khaleeji dialect, Hijri calendars, Al-/bin/ibn name parsing. Not a translation layer." },
  { icon: Lock,       accent: "#B8A0C8", title: "In-Kingdom data residency",             body: "KSA-resident from day one. NCA-compliant deployment available on Sovereign tier. Your customer data never leaves the region." },
  { icon: Brain,      accent: "#C0A0B8", title: "AI Workforce included — not an upsell", body: "Voice agent, briefing, scoring, forecasting, enrichment — all bundled in every plan. No Einstein / Copilot / Breeze SKU lottery." },
  { icon: TrendingUp, accent: "#C8A880", title: "SAR-priced. Per seat. No balkanisation.",body: "One product, one seat price. Marketing + sales + service + calls + enrichment share the same record and the same automation engine." },
];

const QUADRANTS = [
  { row: 0, col: 0, label: "AI-native · Generic",     name: "HubSpot",                                                 note: "Some AI, no GCC posture",    color: "#9CA3AF" },
  { row: 0, col: 1, label: "AI-native · Local",       name: "NexFlow",                                                 note: "Empty quadrant. Until now.", color: "#B8A0C8", us: true },
  { row: 1, col: 0, label: "AI bolted on · Generic",  name: "Salesforce, Microsoft D365, Zoho, Freshworks, Pipedrive", note: "USD-priced. No KSA region.", color: "#9CA3AF" },
  { row: 1, col: 1, label: "AI bolted on · Local",    name: "Local Zoho clones · Odoo resellers",                      note: "Cheap to license, weak on AI", color: "#9CA3AF" },
];

const FEATURES = [
  { icon: Mic,         color: "#B8A0C8", label: "Gulf Voice AI",           desc: "Arabic Gulf TTS & STT. Zariyah, Hala, Layla, Tarik, Naayf, Omar — native Khaleeji voices in every workflow." },
  { icon: Brain,       color: "#88B8B0", label: "Multi-Agent Orchestrator",desc: "Five specialised agents — Researcher, Writer, Strategist, Analyst, Operator — work together on every task." },
  { icon: Globe2,      color: "#C0A0B8", label: "Cultural Intelligence",   desc: "Khaleeji aesthetic, Arabic-first content, Sun–Wed morning cadence, Hijri-aware scheduling built in." },
  { icon: Workflow,    color: "#C8A880", label: "Automation & Approvals",  desc: "If-this-then-that automations with a human-in-the-loop approval queue for every high-stakes action." },
  { icon: Megaphone,   color: "#88B8B0", label: "7-Channel Publishing",    desc: "LinkedIn, X, Instagram, Facebook, WhatsApp, Email, SMS — one campaign brief, seven adapted outputs." },
  { icon: BarChart3,   color: "#B8A0C8", label: "Real-Time Analytics",     desc: "Multi-touch attribution, DataHub natural-language queries, AI-generated weekly board packs." },
  { icon: PhoneCall,   color: "#C0A0B8", label: "Power Dialer & Calls",    desc: "Built-in dialer, live transcription, PII redaction, Conversation Intelligence — no Aircall subscription needed." },
  { icon: ShieldCheck, color: "#C8A880", label: "Enterprise-Ready",        desc: "SOC2-ready, SAML SSO, field-level permissions, 7-year audit logs, private VPC on Enterprise." },
];

const PERSONAS = [
  { key: "sales",     name: "Sales Executive",   arabic: "مندوب المبيعات",   color: "#B8A0C8", wins: ["Morning voice briefing in Khaleeji dialect", "AI drafts proposals on command", "Power Dialer with live transcripts"] },
  { key: "manager",   name: "Sales Manager",     arabic: "مدير المبيعات",    color: "#88B8B0", wins: ["Honest AI-powered forecast", "Rep coaching from call summaries", "One-click weekly board pack"] },
  { key: "ceo",       name: "CEO",               arabic: "الرئيس التنفيذي",  color: "#C8A880", wins: ["Company pulse in 90 seconds", "Attribution across every channel", "Expansion planning via Ask AI"] },
  { key: "admin",     name: "CRM Operations",    arabic: "عمليات نظام CRM",  color: "#C0A0B8", wins: ["Data quality scoring & dedup", "Field-level permissions", "Automation builder with approval gates"] },
  { key: "marketing", name: "Head of Marketing", arabic: "رئيسة التسويق",    color: "#B8B880", wins: ["6-step AI campaign wizard", "Cultural Intelligence toggle", "Campaign performance with AI coaching"] },
];

const PLANS = [
  { name: "Starter",    price: "$29",  badge: "", color: "#9CA3AF", features: ["3+ seats", "200 AI requests / user / mo", "1 pipeline", "3 channels", "Community support"] },
  { name: "Growth",     price: "$79",  badge: "Most popular", color: "#88B8B0", features: ["5+ seats", "1,500 AI requests / user / mo", "5 pipelines", "All 7 channels", "Power Dialer", "Enrichment waterfall"] },
  { name: "Business",   price: "$149", badge: "", color: "#B8A0C8", features: ["10+ seats", "5,000 AI requests / user / mo", "25 pipelines", "All engines + DataHub", "SSO + field permissions", "Named CSM"] },
  { name: "Enterprise", price: "Custom", badge: "", color: "#C8A880", features: ["25+ seats", "Unlimited AI", "Private VPC", "SAML + SCIM", "99.99% SLA", "On-site QBR"] },
];

const SURFACES = [
  { icon: Users,       color: "#B8A0C8", name: "CRM",         desc: "Contacts, Companies, Deals, Activities, Calls" },
  { icon: Megaphone,   color: "#88B8B0", name: "Marketing",   desc: "Campaigns, Sequences, Audiences, Performance" },
  { icon: PhoneCall,   color: "#C0A0B8", name: "Service",     desc: "Call Centre, Knowledge Base, Conversation Intelligence" },
  { icon: Brain,       color: "#C8A880", name: "Engines",     desc: "Masaar, ProsEngine, Masar Database, AI Database Builder" },
  { icon: BarChart3,   color: "#B8B880", name: "Analytics",   desc: "Attribution, DataHub, Custom Dashboards" },
  { icon: Building2,   color: "#88B8C8", name: "Mobile",      desc: "Expo iOS + Android companion app" },
];

function StatCard({ n, idx, start }: { n: typeof NUMBERS[number]; idx: number; start: boolean }) {
  const animated = useCountUp(n.value, start, 1600);
  const display = n.display ?? `${n.prefix}${animated.toFixed(n.value < 10 && n.value !== 0 ? 1 : 0)}${n.suffix}`;
  const tilt = useTilt(6);
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={{ ...tilt.style, background: `linear-gradient(135deg,${n.color}10,transparent)` }}
      className="glass-card rounded-2xl p-6 border border-border/30 text-center cursor-default"
    >
      <div
        className={cn("text-4xl sm:text-5xl font-black tracking-tight transition-all duration-1000", start ? "opacity-100" : "opacity-0")}
        style={{ color: n.color }}
      >
        {display}
      </div>
      <div className="text-sm font-bold mt-2">{n.label}</div>
      <div className="text-xs text-muted-foreground mt-1">{n.sub}</div>
    </div>
  );
}

function DiffCard({ d, idx }: { d: typeof DIFFERENTIATORS[number]; idx: number }) {
  const tilt = useTilt(8);
  const Icon = d.icon;
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className="group glass-card rounded-2xl p-6 border border-border/30 cursor-default relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${d.accent}15, transparent 70%)` }}
      />
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
            style={{ background: `${d.accent}20` }}
          >
            <Icon className="w-6 h-6" style={{ color: d.accent }} />
          </div>
          <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: d.accent }}>
            Bet #{idx + 1}
          </div>
        </div>
        <div className="text-lg font-black mb-2">{d.title}</div>
        <p className="text-sm text-muted-foreground leading-relaxed">{d.body}</p>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  const numbers  = useInView<HTMLDivElement>(0.2);
  const features = useInView<HTMLDivElement>(0.1);
  const competition = useInView<HTMLDivElement>(0.15);
  const [hoveredQ, setHoveredQ] = useState<number | null>(null);
  const [activePersona, setActivePersona] = useState(0);

  return (
    <div className="space-y-28 pb-16 overflow-x-clip">

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative px-4 pt-14 sm:pt-24 pb-6 max-w-[1100px] mx-auto text-center">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-10 -left-20 w-72 h-72 rounded-full blur-3xl opacity-30 animate-pulse"
            style={{ background: "radial-gradient(circle,#B8A0C8,transparent 70%)", animationDuration: "4s" }} />
          <div className="absolute top-32 -right-20 w-72 h-72 rounded-full blur-3xl opacity-30 animate-pulse"
            style={{ background: "radial-gradient(circle,#88B8B0,transparent 70%)", animationDuration: "5s", animationDelay: "1s" }} />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full blur-3xl opacity-25 animate-pulse"
            style={{ background: "radial-gradient(circle,#C8A880,transparent 70%)", animationDuration: "6s", animationDelay: "2s" }} />
        </div>

        <div className="flex justify-center mb-8">
          <div className="relative" style={{ width: 340, height: 90 }}>
            <div className="absolute inset-0 blur-3xl opacity-40 pointer-events-none"
              style={{ background: "radial-gradient(circle, #B8A0C8 0%, #88B8B0 50%, transparent 75%)" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <NexFlowWordmark height={90} />
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B8A0C8]/10 border border-[#B8A0C8]/30 mb-5">
          <Star className="w-3 h-3 text-[#B8A0C8] fill-[#B8A0C8]" />
          <span className="text-[11px] font-black tracking-wider uppercase text-[#B8A0C8]">
            The Universal AI-Native CRM · Built in Riyadh
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-[1.02]">
          Built for the way <br className="hidden sm:block" />
          the GCC{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-[#B8A0C8] via-[#88B8B0] to-[#C8A880] bg-clip-text text-transparent">
              actually sells.
            </span>
            <svg className="absolute -bottom-2 left-0 w-full" height="14" viewBox="0 0 200 14" preserveAspectRatio="none">
              <path d="M2 8 Q 50 0, 100 6 T 198 8" stroke="url(#u)" strokeWidth="3" fill="none" strokeLinecap="round" />
              <defs>
                <linearGradient id="u" x1="0" x2="1">
                  <stop offset="0" stopColor="#B8A0C8" />
                  <stop offset="0.5" stopColor="#88B8B0" />
                  <stop offset="1" stopColor="#C8A880" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Bilingual. KSA-resident. Voice-first. Sovereign-ready.{" "}
          <strong className="text-foreground">One calm OS</strong> that replaces the
          Salesforce + HubSpot + Aircall + Apollo + Clay stack — priced in SAR,
          with AI bundled in every plan.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-9">
          <Link href="/signup">
            <button className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-sm font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}>
              Start Free Trial <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          <Link href="/enterprise">
            <button className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-sm font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg,#C8A880,#B8A0C8)" }}>
              Enterprise Setup <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          <Link href="/about">
            <button className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold border border-border/60 hover:bg-muted/40 transition-all hover:scale-105 active:scale-95">
              <Play className="w-3.5 h-3.5 transition-transform group-hover:scale-125" /> See what's inside
            </button>
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {["14-day free trial", "No credit card", "5 demo personas", "Bilingual from day one"].map((t) => (
            <span key={t} className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#88B8B0]" /> {t}
            </span>
          ))}
        </div>

        <div className="mt-12 inline-flex flex-col items-center text-muted-foreground animate-bounce" style={{ animationDuration: "2s" }}>
          <span className="text-[10px] uppercase tracking-widest font-bold mb-1">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* ── PRODUCT SURFACES STRIP ─────────────────────────── */}
      <section className="px-4 max-w-[1100px] mx-auto">
        <SectionEyebrow color="#88B8B0">One platform. Six surfaces.</SectionEyebrow>
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
          Everything your revenue team needs — in one calm workspace
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto text-center mb-8">
          60+ pages. A mobile companion. Five demo personas. Zero context-switching between tools.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SURFACES.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.name}
                className="group glass-card rounded-xl p-5 border border-border/30 hover:-translate-y-1 transition-all cursor-default"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: s.color }} />
                  </div>
                  <span className="font-black text-sm">{s.name}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-6">
          <Link href="/signin">
            <button className="inline-flex items-center gap-2 text-sm font-bold text-[#88B8B0] hover:underline">
              Explore the app <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── WHO WE ARE ─────────────────────────────────────── */}
      <section className="px-4 max-w-[1100px] mx-auto">
        <SectionEyebrow color="#88B8B0">Who we are</SectionEyebrow>
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
          A CRM the GCC was always going to build for itself
        </h2>
        <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed text-center">
          QPulse is a Riyadh-headquartered, KSA-incorporated company building the first AI-native CRM
          designed from the ground up for Gulf enterprises — bilingual reps, regulated data, voice-heavy
          outreach, and AI baked into every workflow rather than bolted on as an upsell SKU.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          {[
            { k: "HQ",        v: "Riyadh, KSA",           c: "#B8A0C8" },
            { k: "Languages", v: "Arabic + English",       c: "#88B8B0" },
            { k: "Stage",     v: "Pre-revenue, founder-led", c: "#C0A0B8" },
            { k: "Focus",     v: "GCC enterprise B2B",     c: "#C8A880" },
          ].map((c) => (
            <div key={c.k}
              className="group glass-card rounded-xl p-4 border border-border/30 text-center hover:border-transparent transition-all hover:-translate-y-1 cursor-default">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{c.k}</div>
              <div className="text-sm font-black mt-1 transition-colors" style={{ color: c.c }}>{c.v}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-7">
          <Link href="/about">
            <button className="inline-flex items-center gap-2 text-sm font-bold text-[#88B8B0] hover:underline">
              Read the full story <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── FEATURES GRID ──────────────────────────────────── */}
      <section className="px-4 max-w-[1100px] mx-auto" ref={features.ref}>
        <SectionEyebrow color="#C0A0B8">Capabilities</SectionEyebrow>
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
          The whole stack. One seat price.
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto text-center mb-8">
          Every plan ships with Gulf voice AI, the multi-agent orchestrator, Cultural Intelligence,
          and 7-channel publishing. No bolt-on add-ons for things that should be table stakes.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i}
                className={cn(
                  "group glass-card rounded-2xl p-5 border border-border/30 cursor-default relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg",
                  features.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
                style={{ transitionDelay: `${i * 60}ms`, transitionDuration: "500ms" }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${f.color}12, transparent 70%)` }} />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                    style={{ background: `${f.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <div className="text-sm font-black mb-1.5">{f.label}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── WHO USES NEXFLOW — PERSONAS ────────────────────── */}
      <section className="px-4 max-w-[1100px] mx-auto">
        <SectionEyebrow color="#C8A880">Five roles. One OS.</SectionEyebrow>
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
          Everyone on the revenue team wins
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto text-center mb-8">
          QPulse ships with five demo personas — click any tab to see the app re-tune itself for that role.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {PERSONAS.map((p, i) => (
            <button
              key={p.key}
              onClick={() => setActivePersona(i)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                activePersona === i
                  ? "text-white border-transparent shadow-md"
                  : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border/60"
              )}
              style={activePersona === i ? { background: `linear-gradient(135deg,${p.color},${p.color}88)` } : undefined}
            >
              {p.name}
            </button>
          ))}
        </div>

        {PERSONAS.map((p, i) => (
          <div key={p.key}
            className={cn(
              "glass-card rounded-2xl border p-7 transition-all duration-300",
              activePersona === i ? "opacity-100 scale-100" : "hidden"
            )}
            style={{ borderColor: `${p.color}40`, background: `linear-gradient(135deg,${p.color}08,transparent)` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-lg"
                    style={{ background: `linear-gradient(135deg,${p.color},${p.color}88)` }}>
                    {p.name[0]}
                  </div>
                  <div>
                    <div className="font-black text-base">{p.name}</div>
                    <div className="text-sm font-bold" style={{ color: p.color }} dir="rtl">{p.arabic}</div>
                  </div>
                </div>
                <ul className="space-y-2.5 mt-4">
                  {p.wins.map((w) => (
                    <li key={w} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: p.color }} />
                      <span className="text-muted-foreground">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sm:self-center">
                <Link href="/signin">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg whitespace-nowrap"
                    style={{ background: `linear-gradient(135deg,${p.color},${p.color}88)` }}>
                    Try as {p.name.split(" ")[0]} <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── COMPETITION LANDSCAPE ──────────────────────────── */}
      <section className="px-4 max-w-[1100px] mx-auto" ref={competition.ref}>
        <SectionEyebrow color="#C0A0B8">Competition landscape</SectionEyebrow>
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
          The 2×2 nobody else is sitting in
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto text-center mb-8">
          Plotted on the two axes that matter for GCC buyers — how local the product actually is,
          and how AI-native the architecture actually is.
        </p>

        <div className="relative max-w-3xl mx-auto">
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            ← AI-native · AI bolted on →
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            ← Generic · Local →
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-3">
            {QUADRANTS.map((q, i) => (
              <div key={i}
                onMouseEnter={() => setHoveredQ(i)}
                onMouseLeave={() => setHoveredQ(null)}
                className={cn(
                  "rounded-xl p-5 border transition-all cursor-pointer relative overflow-hidden",
                  q.us ? "border-2 shadow-lg" : "border-border/30 glass-card",
                  hoveredQ === i && "scale-[1.03] shadow-xl",
                )}
                style={q.us
                  ? { borderColor: q.color, background: `linear-gradient(135deg,${q.color}18,#88B8B018)` }
                  : undefined}
              >
                {q.us && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white animate-pulse"
                    style={{ background: `linear-gradient(135deg,${q.color},#88B8B0)` }}>
                    Our wedge
                  </div>
                )}
                <div className="text-[10px] uppercase tracking-wider font-black mb-1" style={{ color: q.color }}>
                  {q.label}
                </div>
                <div className={cn("font-black", q.us ? "text-base" : "text-sm")}>{q.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{q.note}</div>
                {q.us && (
                  <div className="mt-3 pt-3 border-t border-border/20">
                    <Link href="/about">
                      <button className="text-[11px] font-bold text-[#B8A0C8] hover:underline inline-flex items-center gap-1">
                        See what we built <ArrowRight className="w-3 h-3" />
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl border border-border/30 overflow-hidden mt-12">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold px-4 py-2.5 bg-muted/30 border-b border-border/20">
            Real competitor revenue (most recent reported FY)
          </div>
          <table className="w-full text-sm">
            <tbody>
              {COMPETITORS.map((c) => (
                <tr key={c.name} className="border-t border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2 font-semibold">{c.name}</td>
                  <td className="px-4 py-2 text-right font-mono font-bold">{c.revenue}</td>
                  <td className="px-4 py-2 text-muted-foreground">{c.year}</td>
                  <td className="px-4 py-2 text-muted-foreground">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── DATA IN NUMBERS ────────────────────────────────── */}
      <section className="px-4 max-w-[1100px] mx-auto" ref={numbers.ref}>
        <SectionEyebrow color="#B8B880">Data in numbers</SectionEyebrow>
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-8">
          The market is real. The wedge is bigger.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {NUMBERS.map((n, i) => (
            <StatCard key={i} n={n} idx={i} start={numbers.inView} />
          ))}
        </div>
      </section>

      {/* ── WHAT MAKES US DIFFERENT ────────────────────────── */}
      <section className="px-4 max-w-[1100px] mx-auto">
        <SectionEyebrow color="#C8A880">What makes us different</SectionEyebrow>
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-8">
          Four bets nobody else is making
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DIFFERENTIATORS.map((d, i) => (
            <DiffCard key={i} d={d} idx={i} />
          ))}
        </div>
      </section>

      {/* ── PRICING PREVIEW ────────────────────────────────── */}
      <section className="px-4 max-w-[1100px] mx-auto">
        <SectionEyebrow color="#88B8B0">Pricing</SectionEyebrow>
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
          Transparent. Per seat. AI included.
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto text-center mb-8">
          All plans include the Ask AI bubble, Gulf voices, Cultural Intelligence, and 7-channel publishing.
          No SKU lottery. No AI upsell.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div key={plan.name}
              className="glass-card rounded-2xl border p-6 flex flex-col relative overflow-hidden hover:-translate-y-1 transition-all"
              style={{ borderColor: plan.badge ? `${plan.color}60` : "hsl(var(--border) / 0.3)" }}
            >
              {plan.badge && (
                <div className="absolute top-0 left-0 right-0 py-1 text-center text-[10px] font-black uppercase tracking-wider text-white"
                  style={{ background: plan.color }}>
                  {plan.badge}
                </div>
              )}
              <div className={plan.badge ? "mt-5" : ""}>
                <div className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: plan.color }}>{plan.name}</div>
                <div className="text-3xl font-black mb-0.5">{plan.price}</div>
                {plan.price !== "Custom" && (
                  <div className="text-[11px] text-muted-foreground mb-4">/ user / month · billed annually</div>
                )}
                {plan.price === "Custom" && (
                  <div className="text-[11px] text-muted-foreground mb-4">from $250 / user / month</div>
                )}
                <ul className="space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: plan.color }} />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.price === "Custom" ? "/about" : "/signup"}>
                  <button
                    className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                    style={plan.badge
                      ? { background: `linear-gradient(135deg,${plan.color},${plan.color}99)`, color: "#fff" }
                      : { border: `1px solid ${plan.color}50`, color: plan.color }
                    }
                  >
                    {plan.price === "Custom" ? "Talk to us" : "Start free trial"}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/pricing">
            <button className="inline-flex items-center gap-2 text-sm font-bold text-[#88B8B0] hover:underline">
              Full pricing details including AI add-ons <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────── */}
      <section className="px-4 max-w-[1000px] mx-auto">
        <div className="relative rounded-3xl p-10 sm:p-14 text-center border border-border/30 overflow-hidden"
          style={{ background: "linear-gradient(135deg,#B8A0C815,#88B8B015,#C8A88015)" }}
        >
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-40 animate-pulse"
            style={{ background: "radial-gradient(circle,#B8A0C8,transparent 70%)" }} />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-40 animate-pulse"
            style={{ background: "radial-gradient(circle,#88B8B0,transparent 70%)", animationDelay: "1s" }} />
          <div className="relative">
            <Sparkles className="w-9 h-9 mx-auto mb-3 text-[#B8A0C8] animate-pulse" />
            <h3 className="text-3xl sm:text-4xl font-black mb-2">
              One product. One seat price. Everything in.
            </h3>
            <p className="text-sm text-muted-foreground mb-2 max-w-xl mx-auto">
              Start free. Upgrade when you grow. SAR-priced. KSA-resident. AI included.
            </p>
            <p className="text-sm font-bold mb-7 max-w-xl mx-auto" style={{ color: "#B8A0C8" }} dir="rtl">
              ابدأ مجانًا. طوّر عند النمو. بالريال السعودي. مضيف في المملكة. الذكاء الاصطناعي مشمول.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup">
                <button className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-sm font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}>
                  Create free account <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <Link href="/pricing">
                <button className="px-7 py-3.5 rounded-xl text-sm font-bold border border-border/60 hover:bg-muted/40 hover:scale-105 active:scale-95 transition-all">
                  See pricing
                </button>
              </Link>
              <Link href="/signin">
                <button className="px-7 py-3.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all inline-flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" /> Already a customer? Sign in
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function SectionEyebrow({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-black tracking-[0.25em] uppercase mb-2 text-center" style={{ color }}>
      {children}
    </div>
  );
}
