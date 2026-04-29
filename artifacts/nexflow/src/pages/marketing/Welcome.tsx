import { Link } from "wouter";
import { ArrowRight, Sparkles, Globe2, Lock, Brain, TrendingUp } from "lucide-react";
import { NexFlowLogo } from "@/components/layout/NexFlowLogo";

const COMPETITORS = [
  { name: "Salesforce",       revenue: "$34.9B", year: "FY25", note: "No KSA region" },
  { name: "Microsoft D365",   revenue: "~$6.5B", year: "Est.", note: "No KSA region" },
  { name: "HubSpot",          revenue: "$2.63B", year: "FY24", note: "EU/US only" },
  { name: "Zoho",             revenue: "$1.30B", year: "2024", note: "India-hosted" },
  { name: "Freshworks",       revenue: "$720M",  year: "FY24", note: "India/US"     },
  { name: "Pipedrive",        revenue: "$169M",  year: "FY23", note: "EU-hosted"    },
];

const NUMBERS = [
  { value: "$3.6B", label: "GCC CRM market by 2030", sub: "Up from $1.8B in 2026" },
  { value: "$2.4B", label: "KSA alone by 2030",       sub: "Vision 2030 push"     },
  { value: "0",     label: "GCC-native CRMs today",   sub: "All incumbents foreign" },
  { value: "1%",    label: "Of GCC SAM = ~$36M ARR",  sub: "Our Year-5 wedge"     },
];

const DIFFERENTIATORS = [
  {
    icon: Globe2,
    accent: "#88B8B0",
    title: "Bilingual at the schema level",
    body: "Arabic + English are native data types — RTL by default, Khaleeji dialect, Hijri calendars, Al-/bin/ibn name parsing. Not a translation layer.",
  },
  {
    icon: Lock,
    accent: "#B8A0C8",
    title: "In-Kingdom data residency",
    body: "KSA-resident from day one. NCA-compliant deployment available on Sovereign tier. No more sending GCC customer data to EU/US/India regions.",
  },
  {
    icon: Brain,
    accent: "#C0A0B8",
    title: "AI Workforce included — not an upsell",
    body: "Voice agent, briefing, scoring, forecasting, enrichment — all bundled in every plan. No Einstein / Copilot / Breeze SKU lottery.",
  },
  {
    icon: TrendingUp,
    accent: "#C8A880",
    title: "SAR-priced, per seat, no hub balkanization",
    body: "One product, one seat price. Marketing + sales + service + calls + enrichment share the same record and the same automation engine.",
  },
];

export default function WelcomePage() {
  return (
    <div className="space-y-24 pb-12">
      {/* HERO — motion logo + headline */}
      <section className="px-4 pt-12 sm:pt-20 max-w-[1100px] mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-40 animate-pulse"
              style={{ background: "radial-gradient(circle,#B8A0C8 0%,#88B8B0 60%,transparent 80%)" }}
            />
            <div className="relative animate-[spin_18s_linear_infinite]">
              <NexFlowLogo size={144} />
            </div>
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-ping"
              style={{ background: "radial-gradient(circle,#C0A0B8,transparent 70%)", animationDuration: "3s" }}
            />
          </div>
        </div>
        <div className="text-[10px] font-black tracking-[0.25em] uppercase text-[#B8A0C8] mb-3">
          NexFlow · The Universal AI-Native CRM
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-5 leading-[1.05]">
          Built for the way the GCC <span className="bg-gradient-to-r from-[#B8A0C8] via-[#88B8B0] to-[#C8A880] bg-clip-text text-transparent">actually sells</span>.
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Bilingual. KSA-resident. Voice-first. Sovereign-ready.
          One CRM that replaces the Salesforce + HubSpot + Aircall + Apollo + Clay stack — priced in SAR, with AI bundled in every plan.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link href="/signup">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all"
              style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}
            >
              Start Free <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/about">
            <button className="px-6 py-3 rounded-xl text-sm font-bold border border-border/60 hover:bg-muted/40 transition-all">
              See what's inside
            </button>
          </Link>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="px-4 max-w-[1100px] mx-auto">
        <div className="text-[10px] font-black tracking-[0.25em] uppercase text-[#88B8B0] mb-2 text-center">Who we are</div>
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">A CRM the GCC was always going to build for itself</h2>
        <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed text-center">
          NexFlow is a Riyadh-headquartered, KSA-incorporated company building the first AI-native CRM designed from
          the ground up for Gulf enterprises — bilingual reps, regulated data, voice-heavy outreach, and AI baked into
          every workflow rather than bolted on as an upsell SKU.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          {[
            { k: "HQ",         v: "Riyadh, KSA"          },
            { k: "Languages",  v: "Arabic + English"     },
            { k: "Stage",      v: "Pre-revenue, founder-led" },
            { k: "Focus",      v: "GCC enterprise B2B"   },
          ].map((c) => (
            <div key={c.k} className="glass-card rounded-xl p-4 border border-border/30 text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{c.k}</div>
              <div className="text-sm font-black mt-1">{c.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPETITION LANDSCAPE — 2x2 + revenue table */}
      <section className="px-4 max-w-[1100px] mx-auto">
        <div className="text-[10px] font-black tracking-[0.25em] uppercase text-[#C0A0B8] mb-2 text-center">Competition landscape</div>
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">The 2×2 nobody else is sitting in</h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto text-center mb-8">
          Plotted on the two axes that matter for GCC buyers — how local the product actually is, and how AI-native the architecture actually is.
        </p>

        {/* 2x2 grid */}
        <div className="grid grid-cols-2 grid-rows-2 gap-3 max-w-3xl mx-auto mb-12">
          {/* Top-left: AI-native + Generic */}
          <div className="glass-card rounded-xl p-5 border border-border/30">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">AI-native · Generic</div>
            <div className="text-sm font-bold">HubSpot</div>
            <div className="text-xs text-muted-foreground mt-1">Some AI, no GCC posture</div>
          </div>
          {/* Top-right: AI-native + Local — OUR WEDGE */}
          <div className="rounded-xl p-5 border-2 relative overflow-hidden"
            style={{ borderColor: "#B8A0C8", background: "linear-gradient(135deg,#B8A0C815,#88B8B015)" }}
          >
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white"
              style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}>
              Our wedge
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[#B8A0C8] font-black mb-1">AI-native · Local</div>
            <div className="text-base font-black">NexFlow</div>
            <div className="text-xs text-muted-foreground mt-1">Empty quadrant. Until now.</div>
          </div>
          {/* Bottom-left: Bolted-on AI + Generic */}
          <div className="glass-card rounded-xl p-5 border border-border/30">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">AI bolted on · Generic</div>
            <div className="text-sm font-bold">Salesforce, Microsoft D365, Zoho, Freshworks, Pipedrive</div>
            <div className="text-xs text-muted-foreground mt-1">USD-priced. No KSA region.</div>
          </div>
          {/* Bottom-right: Bolted-on AI + Local */}
          <div className="glass-card rounded-xl p-5 border border-border/30">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">AI bolted on · Local</div>
            <div className="text-sm font-bold">Local Zoho clones · Odoo resellers</div>
            <div className="text-xs text-muted-foreground mt-1">Cheap to license, weak on AI</div>
          </div>
        </div>

        {/* Revenue table */}
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2 text-center">Real competitor revenue (most recent reported FY)</div>
        <div className="glass-card rounded-xl border border-border/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left px-4 py-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">Competitor</th>
                <th className="text-right px-4 py-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">Revenue (USD)</th>
                <th className="text-left px-4 py-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">Year</th>
                <th className="text-left px-4 py-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">GCC posture</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITORS.map((c) => (
                <tr key={c.name} className="border-t border-border/20">
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

      {/* DATA IN NUMBERS */}
      <section className="px-4 max-w-[1100px] mx-auto">
        <div className="text-[10px] font-black tracking-[0.25em] uppercase text-[#B8B880] mb-2 text-center">Data in numbers</div>
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-8">The market is real. The wedge is bigger.</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {NUMBERS.map((n, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-5 border border-border/30 text-center"
              style={{ background: `linear-gradient(135deg,${["#B8A0C8","#88B8B0","#C0A0B8","#C8A880"][i]}10,transparent)` }}
            >
              <div className="text-3xl sm:text-4xl font-black tracking-tight"
                style={{ color: ["#B8A0C8","#88B8B0","#C0A0B8","#C8A880"][i] }}>
                {n.value}
              </div>
              <div className="text-sm font-bold mt-2">{n.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{n.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT MAKES US DIFFERENT */}
      <section className="px-4 max-w-[1100px] mx-auto">
        <div className="text-[10px] font-black tracking-[0.25em] uppercase text-[#C8A880] mb-2 text-center">What makes us different</div>
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-8">Four bets nobody else is making</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DIFFERENTIATORS.map((d, i) => {
            const Icon = d.icon;
            return (
              <div key={i} className="glass-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${d.accent}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: d.accent }} />
                  </div>
                  <div className="text-base font-black">{d.title}</div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 max-w-[900px] mx-auto">
        <div
          className="rounded-3xl p-10 text-center border border-border/30"
          style={{ background: "linear-gradient(135deg,#B8A0C815,#88B8B015,#C8A88015)" }}
        >
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-[#B8A0C8]" />
          <h3 className="text-2xl sm:text-3xl font-black mb-3">
            One product. One seat price. Everything in.
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
            Start free with up to 5 seats. Upgrade when you grow. SAR-priced. KSA-resident. AI included.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/pricing">
              <button className="px-6 py-3 rounded-xl text-white text-sm font-bold shadow-lg"
                style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}>
                See pricing
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-6 py-3 rounded-xl text-sm font-bold border border-border/60 hover:bg-muted/40">
                Create account
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
