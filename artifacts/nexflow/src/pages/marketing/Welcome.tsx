import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight, Sparkles, Globe2, Lock, Brain, TrendingUp,
  Play, ChevronDown, Star, Zap,
} from "lucide-react";
import { NexFlowLogo } from "@/components/layout/NexFlowLogo";
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
  { value: 3.6, prefix: "$", suffix: "B", label: "GCC CRM market by 2030", sub: "Up from $1.8B in 2026", color: "#B8A0C8" },
  { value: 2.4, prefix: "$", suffix: "B", label: "KSA alone by 2030",       sub: "Vision 2030 push",      color: "#88B8B0" },
  { value: 0,   prefix: "",  suffix: "",  label: "GCC-native CRMs today",   sub: "All incumbents foreign",   color: "#C0A0B8", display: "0" },
  { value: 36,  prefix: "$", suffix: "M", label: "1% of GCC SAM in ARR",    sub: "Our Year-5 wedge",         color: "#C8A880" },
];

const DIFFERENTIATORS = [
  { icon: Globe2,     accent: "#88B8B0", title: "Bilingual at the schema level",   body: "Arabic + English are native data types — RTL by default, Khaleeji dialect, Hijri calendars, Al-/bin/ibn name parsing. Not a translation layer." },
  { icon: Lock,       accent: "#B8A0C8", title: "In-Kingdom data residency",        body: "KSA-resident from day one. NCA-compliant deployment available on Sovereign tier. Your customer data never leaves the region." },
  { icon: Brain,      accent: "#C0A0B8", title: "AI Workforce included — not an upsell", body: "Voice agent, briefing, scoring, forecasting, enrichment — all bundled in every plan. No Einstein / Copilot / Breeze SKU lottery." },
  { icon: TrendingUp, accent: "#C8A880", title: "SAR-priced. Per seat. No hub balkanization.", body: "One product, one seat price. Marketing + sales + service + calls + enrichment share the same record and same automation engine." },
];

const QUADRANTS = [
  { row: 0, col: 0, label: "AI-native · Generic",     name: "HubSpot",                                                       note: "Some AI, no GCC posture", color: "#9CA3AF" },
  { row: 0, col: 1, label: "AI-native · Local",       name: "NexFlow",                                                       note: "Empty quadrant. Until now.", color: "#B8A0C8", us: true },
  { row: 1, col: 0, label: "AI bolted on · Generic",  name: "Salesforce, Microsoft D365, Zoho, Freshworks, Pipedrive",       note: "USD-priced. No KSA region.", color: "#9CA3AF" },
  { row: 1, col: 1, label: "AI bolted on · Local",    name: "Local Zoho clones · Odoo resellers",                            note: "Cheap to license, weak on AI", color: "#9CA3AF" },
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
  const numbers = useInView<HTMLDivElement>(0.2);
  const competition = useInView<HTMLDivElement>(0.15);
  const [hoveredQ, setHoveredQ] = useState<number | null>(null);

  return (
    <div className="space-y-24 pb-12 overflow-x-clip">
      {/* HERO */}
      <section className="relative px-4 pt-12 sm:pt-20 pb-6 max-w-[1100px] mx-auto text-center">
        {/* Floating background blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-10 -left-20 w-72 h-72 rounded-full blur-3xl opacity-30 animate-pulse"
            style={{ background: "radial-gradient(circle,#B8A0C8,transparent 70%)", animationDuration: "4s" }} />
          <div className="absolute top-32 -right-20 w-72 h-72 rounded-full blur-3xl opacity-30 animate-pulse"
            style={{ background: "radial-gradient(circle,#88B8B0,transparent 70%)", animationDuration: "5s", animationDelay: "1s" }} />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full blur-3xl opacity-25 animate-pulse"
            style={{ background: "radial-gradient(circle,#C8A880,transparent 70%)", animationDuration: "6s", animationDelay: "2s" }} />
        </div>

        {/* Animated logo */}
        <div className="flex justify-center mb-7">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 -m-8 rounded-full border-2 border-dashed opacity-25 animate-[spin_25s_linear_infinite]"
              style={{ borderColor: "#B8A0C8", width: 200, height: 200, marginLeft: -28, marginTop: -28 }} />
            {/* Glow */}
            <div className="absolute inset-0 rounded-full blur-3xl opacity-50 animate-pulse"
              style={{ background: "radial-gradient(circle,#B8A0C8 0%,#88B8B0 60%,transparent 80%)", width: 144, height: 144 }} />
            {/* Logo with subtle bounce */}
            <div className="relative animate-[bounce_3s_ease-in-out_infinite]" style={{ animationDuration: "3.5s" }}>
              <NexFlowLogo size={144} />
            </div>
            {/* Inner ping */}
            <div className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-ping"
              style={{ background: "radial-gradient(circle,#C0A0B8,transparent 70%)", animationDuration: "3s" }} />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B8A0C8]/10 border border-[#B8A0C8]/30 mb-4">
          <Star className="w-3 h-3 text-[#B8A0C8] fill-[#B8A0C8]" />
          <span className="text-[11px] font-black tracking-wider uppercase text-[#B8A0C8]">
            The Universal AI-Native CRM · Built in Riyadh
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-5 leading-[1.02]">
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
          Bilingual. KSA-resident. Voice-first. Sovereign-ready. One CRM that replaces the
          Salesforce + HubSpot + Aircall + Apollo + Clay stack — priced in SAR, with AI bundled in every plan.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-9">
          <Link href="/signup">
            <button className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-sm font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}
            >
              Start Free <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          <Link href="/about">
            <button className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold border border-border/60 hover:bg-muted/40 transition-all hover:scale-105 active:scale-95">
              <Play className="w-3.5 h-3.5 transition-transform group-hover:scale-125" /> See what's inside
            </button>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="mt-14 inline-flex flex-col items-center text-muted-foreground animate-bounce" style={{ animationDuration: "2s" }}>
          <span className="text-[10px] uppercase tracking-widest font-bold mb-1">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="px-4 max-w-[1100px] mx-auto">
        <SectionEyebrow color="#88B8B0">Who we are</SectionEyebrow>
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
          A CRM the GCC was always going to build for itself
        </h2>
        <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed text-center">
          NexFlow is a Riyadh-headquartered, KSA-incorporated company building the first AI-native CRM
          designed from the ground up for Gulf enterprises — bilingual reps, regulated data, voice-heavy
          outreach, and AI baked into every workflow rather than bolted on as an upsell SKU.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          {[
            { k: "HQ",        v: "Riyadh, KSA",            c: "#B8A0C8" },
            { k: "Languages", v: "Arabic + English",       c: "#88B8B0" },
            { k: "Stage",     v: "Pre-revenue, founder-led", c: "#C0A0B8" },
            { k: "Focus",     v: "GCC enterprise B2B",     c: "#C8A880" },
          ].map((c) => (
            <div key={c.k}
              className="group glass-card rounded-xl p-4 border border-border/30 text-center hover:border-transparent transition-all hover:-translate-y-1 cursor-default"
              style={{ borderImage: `linear-gradient(135deg,${c.c},${c.c}00) 1` }}
            >
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

      {/* COMPETITION LANDSCAPE — interactive 2x2 */}
      <section className="px-4 max-w-[1100px] mx-auto" ref={competition.ref}>
        <SectionEyebrow color="#C0A0B8">Competition landscape</SectionEyebrow>
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
          The 2×2 nobody else is sitting in
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto text-center mb-8">
          Hover any quadrant. Plotted on the two axes that matter for GCC buyers — how local the product actually is, and how AI-native the architecture actually is.
        </p>

        {/* axes labels */}
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            ← AI-native · AI bolted on →
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            ← Generic · Local →
          </div>

          <div className="grid grid-cols-2 grid-rows-2 gap-3">
            {QUADRANTS.map((q, i) => (
              <div
                key={i}
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

        {/* Revenue table */}
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2 text-center mt-12">
          Real competitor revenue (most recent reported FY)
        </div>
        <div className="glass-card rounded-xl border border-border/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left px-4 py-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">Competitor</th>
                <th className="text-right px-4 py-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">Revenue</th>
                <th className="text-left px-4 py-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">Year</th>
                <th className="text-left px-4 py-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">GCC posture</th>
              </tr>
            </thead>
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

        <div className="text-center mt-6">
          <Link href="/about">
            <button className="inline-flex items-center gap-2 text-sm font-bold text-[#C0A0B8] hover:underline">
              See the product comparison <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </section>

      {/* DATA IN NUMBERS — animated counters */}
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

        <div className="text-center mt-8">
          <Link href="/pricing">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-[#B8B880]/40 bg-[#B8B880]/10 hover:bg-[#B8B880]/20 transition-all">
              See pricing <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </section>

      {/* WHAT MAKES US DIFFERENT — tilt cards */}
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

        <div className="text-center mt-8">
          <Link href="/about">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-[#C8A880]/40 bg-[#C8A880]/10 hover:bg-[#C8A880]/20 transition-all">
              How it works in the product <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </section>

      {/* FINAL CTA */}
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
            <h3 className="text-3xl sm:text-4xl font-black mb-3">
              One product. One seat price. Everything in.
            </h3>
            <p className="text-sm text-muted-foreground mb-7 max-w-xl mx-auto">
              Start free with up to 5 seats. Upgrade when you grow. SAR-priced. KSA-resident. AI included.
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
