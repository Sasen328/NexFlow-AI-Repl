import { useRoute, Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import {
  Sparkles, ArrowRight, RefreshCw, TrendingUp, TrendingDown, Phone, Mail,
  Building2, Users, GitBranch, Calendar, Megaphone, Database, Workflow, Bot,
  BarChart3, Globe, CreditCard, Activity, Zap, Eye, Target, Layers,
  CheckCircle2, AlertTriangle, Clock, Mic, Wand2, Headphones, Briefcase,
  type LucideIcon,
} from "lucide-react";
import { SECTIONS, type SectionDef } from "@/lib/sections";

interface KPI {
  label: string;
  value: string;
  sub: string;
  trend?: { dir: "up" | "down"; pct: string };
  icon: LucideIcon;
  color: string;
}

interface SectionContent {
  briefing: string;
  kpis: KPI[];
  highlights: { icon: LucideIcon; color: string; title: string; body: string; tag: string }[];
}

const CONTENT: Record<string, SectionContent> = {
  crm: {
    briefing:
      "Pipeline at $2.34M across 47 active deals — up 18% WoW. 3 deals in Negotiation are <7 days old with strong engagement (push for close). 2 deals at risk need re-engagement today.",
    kpis: [
      { label: "Pipeline Value",  value: "$2.34M", sub: "47 active deals",   trend: { dir: "up", pct: "18%" },   icon: TrendingUp, color: "#88B8B0" },
      { label: "Win Rate",        value: "31%",    sub: "Last 30 days",      trend: { dir: "up", pct: "4pt" },    icon: Target,     color: "#B8A0C8" },
      { label: "Avg Deal Size",   value: "$49.7K", sub: "vs $42K last Qtr",  trend: { dir: "up", pct: "18%" },   icon: BarChart3,  color: "#C8A880" },
      { label: "At-Risk Deals",   value: "2",      sub: "$240K exposure",   trend: { dir: "down", pct: "1" },    icon: AlertTriangle, color: "#C0A0B8" },
    ],
    highlights: [
      { icon: TrendingUp,    color: "#88B8B0", title: "Pipeline acceleration in KSA",        body: "Riyadh and Jeddah accounts are progressing 2.1× faster than last quarter — push 3 deals to Negotiation this week.", tag: "Sales" },
      { icon: AlertTriangle, color: "#C8A880", title: "Layla Hassan needs immediate attention", body: "Lead score dropped 72 → 65 over 9 days of silence. Recommended action: Power Dialer call before EOD.",          tag: "At-Risk" },
      { icon: Sparkles,      color: "#B8A0C8", title: "AI Voice Agent qualified 4 overnight",   body: "12 outbound calls run by AI Voice Agent in last 8h. 4 hot leads added to your queue. Recommended: call Nora Al-Faisal first.", tag: "AI" },
    ],
  },
  marketing: {
    briefing:
      "8 active campaigns reached 12,400 GCC contacts this week. Open rate 38% (vs 24% global SaaS benchmark). Cultural Intelligence auto-paused 3 sends during Maghrib — recovered $180K in attributed pipeline.",
    kpis: [
      { label: "Active Campaigns", value: "8",       sub: "3 launching this week",          trend: { dir: "up", pct: "2" },    icon: Megaphone, color: "#C8A880" },
      { label: "Sends Today",      value: "1,847",   sub: "4 channels active",              trend: { dir: "up", pct: "12%" },  icon: Mail,      color: "#88B8B0" },
      { label: "Open Rate",        value: "38.2%",   sub: "vs 24% benchmark",                trend: { dir: "up", pct: "5pt" },  icon: Eye,       color: "#B8A0C8" },
      { label: "Pipeline Sourced", value: "$486K",   sub: "MTD · 31 SQLs",                  trend: { dir: "up", pct: "22%" },  icon: TrendingUp, color: "#B8B880" },
    ],
    highlights: [
      { icon: Globe,    color: "#88B8B0", title: "Cultural Intelligence paused 3 Maghrib sends", body: "Auto-rescheduled around prayer times in Riyadh, Jeddah, and Khobar — preserved $180K attributed pipeline this week.", tag: "Cultural" },
      { icon: Sparkles, color: "#B8A0C8", title: "Top performing template: Khaleeji formal",      body: "The 'Ramadan Greeting + Offer' Khaleeji-Arabic template is converting at 3.2× the MSA equivalent. Promote across all GCC sequences.", tag: "AI" },
      { icon: Calendar, color: "#C8A880", title: "Best send window this week",                    body: "Tue-Thu 09:30-11:00 Riyadh time has the highest engagement. 'Ramadan: After Fajr' window also performing well — schedule batch 2 there.", tag: "Timing" },
    ],
  },
  enrichment: {
    briefing:
      "284 leads enriched in last 24h via Clay-style waterfall (Lusha → Apollo → ZoomInfo → Cognism). 91% match rate. 17 high-intent buying signals fired today — all routed to Sales reps.",
    kpis: [
      { label: "Leads Enriched 24h", value: "284",   sub: "+ 91% match rate",         trend: { dir: "up", pct: "23%" }, icon: Wand2,    color: "#B8B880" },
      { label: "Buying Signals",     value: "17",    sub: "Funding, hiring, intent",   trend: { dir: "up", pct: "6" },   icon: Zap,      color: "#C8A880" },
      { label: "Provider Cost / Lead", value: "$0.31", sub: "vs $1.20 single-provider", trend: { dir: "down", pct: "74%" }, icon: Database, color: "#88B8B0" },
      { label: "Hot Leads Routed",   value: "23",    sub: "AI score ≥ 85",            trend: { dir: "up", pct: "18%" }, icon: Target,   color: "#B8A0C8" },
    ],
    highlights: [
      { icon: Zap,      color: "#C8A880", title: "Gulf Ventures · Series B funding signal", body: "Sara Al-Mansouri's company closed $50M Series B 6h ago. NexFlow auto-enriched, scored 96, and pushed to your call list.", tag: "Signal" },
      { icon: Database, color: "#B8B880", title: "Waterfall saved $24,310 vs ZoomInfo solo", body: "By cascading providers, enrichment costs dropped from $1.20/lead to $0.31/lead while keeping the 91% match rate.",          tag: "Cost" },
      { icon: Sparkles, color: "#B8A0C8", title: "GCC-focused enrichment beating global tools", body: "For KSA + UAE prospects, NexFlow's GCC-tuned enrichment recall is 27% higher than Apollo and 41% higher than HubSpot.",        tag: "Coverage" },
    ],
  },
  callcenter: {
    briefing:
      "Voice AI Agent handled 12 outbound conversations overnight (32% qualification rate). Live call queue at 5 ready for human reps. Avg talk time 7m12s — up from 4m48s last month (deeper discovery).",
    kpis: [
      { label: "Calls Today",       value: "47",      sub: "5 confirmed live now",      trend: { dir: "up", pct: "11%" }, icon: Phone,        color: "#C0A0B8" },
      { label: "AI Voice Sessions", value: "12",      sub: "4 qualified · 32% rate",    trend: { dir: "up", pct: "5" },   icon: Bot,          color: "#B8A0C8" },
      { label: "Avg Talk Time",     value: "7m 12s",  sub: "Discovery quality up",      trend: { dir: "up", pct: "50%" }, icon: Clock,        color: "#88B8B0" },
      { label: "Connection Rate",   value: "68%",     sub: "Tue–Thu 09:30 window",      trend: { dir: "up", pct: "27pt" }, icon: TrendingUp,   color: "#C8A880" },
    ],
    highlights: [
      { icon: Bot,       color: "#B8A0C8", title: "AI Voice Agent: 4 qualified overnight",   body: "12 outbound calls in 8h. Top result: Nora Al-Faisal (score 91) — added to your call list with full transcript + suggested talk track.", tag: "AI" },
      { icon: Mic,       color: "#88B8B0", title: "Top objection trend: 'Price vs HubSpot'", body: "Conversation Intelligence flagged this objection on 5 calls this week. Sales Playbook updated with 3 winning rebuttals.",                tag: "Coaching" },
      { icon: Calendar,  color: "#C8A880", title: "Best call window: Tue–Thu 09:30 Riyadh",  body: "Connection rate is 68% in this window vs 41% average. Power Dialer auto-prioritizes accordingly.",                                       tag: "Timing" },
    ],
  },
  automation: {
    briefing:
      "14 active workflows · 9 automation rules fired 2,310 times this week. Saved your team an estimated 47 hours of manual work. Custom AI Agent 'GCC SDR' handled 142 prospect responses without human touch.",
    kpis: [
      { label: "Active Workflows",   value: "14",     sub: "+ 3 launching today",       trend: { dir: "up", pct: "2" },    icon: Workflow,  color: "#90B8B8" },
      { label: "Rules Fired (week)", value: "2,310",  sub: "9 rules active",            trend: { dir: "up", pct: "31%" }, icon: Zap,       color: "#88B8B0" },
      { label: "Hours Saved",        value: "47h",    sub: "vs manual baseline",        trend: { dir: "up", pct: "8h" },   icon: Activity,  color: "#B8A0C8" },
      { label: "AI Agent Replies",   value: "142",    sub: "GCC SDR agent · 87% acc",   trend: { dir: "up", pct: "23" },   icon: Bot,       color: "#C8A880" },
    ],
    highlights: [
      { icon: Workflow, color: "#90B8B8", title: "Your top workflow: 'Series B → CIO outreach'", body: "Triggers when a target account raises ≥$25M. Enriches founders/CIOs, generates Khaleeji-Arabic outreach, books meeting. 31% reply rate.", tag: "Workflow" },
      { icon: Bot,       color: "#B8A0C8", title: "GCC SDR Agent now handles tier-3 inbound",     body: "87% accuracy on intent classification. Routes hot leads to your queue, books meetings for warm, nurtures cold. Handled 142 messages this week.", tag: "AI" },
      { icon: Zap,       color: "#88B8B0", title: "Rule: 'Pause on Maghrib' fired 18 times",      body: "Auto-paused outbound campaigns 30min before sunset prayer in 3 cities. Recovered $180K in attributed pipeline.",                              tag: "Cultural" },
    ],
  },
  ai: {
    briefing:
      "Your AI workforce ran 36 sessions in the last 24h. Predictive model flagged 8 deals likely to slip and 4 likely to close early. New playbook 'Ramadan Acceleration' generated automatically.",
    kpis: [
      { label: "AI Sessions 24h",   value: "36",   sub: "Voice + chat + enrich",  trend: { dir: "up", pct: "12" },  icon: Bot,        color: "#A090C8" },
      { label: "Predictive Slips",  value: "8",    sub: "Avg confidence 78%",    trend: { dir: "down", pct: "3" },  icon: TrendingDown, color: "#C0A0B8" },
      { label: "Likely Early Wins", value: "4",    sub: "Push to close this wk",  trend: { dir: "up", pct: "2" },   icon: TrendingUp,  color: "#88B8B0" },
      { label: "Playbooks Active",  value: "9",    sub: "+ 1 auto-generated",    trend: { dir: "up", pct: "1" },   icon: Sparkles,   color: "#B8A0C8" },
    ],
    highlights: [
      { icon: Sparkles, color: "#A090C8", title: "New playbook: 'Ramadan Acceleration'",        body: "Auto-generated from top 12 winning deals during Ramadan 2025. Includes Khaleeji-Arabic openers, after-Fajr send schedule, and 7 winning rebuttals.", tag: "Playbook" },
      { icon: TrendingDown, color: "#C0A0B8", title: "8 deals likely to slip — act today",      body: "Predictive flagged 8 deals showing engagement decay. Top risk: Aramco Digital (Q2 budget signal cooling). Suggest: in-person visit Tuesday.", tag: "Predictive" },
      { icon: Bot,      color: "#B8A0C8", title: "AI Workforce: 4 reps' worth of output",       body: "Voice + email + WhatsApp agents combined produced output equivalent to ~4 SDRs this week. Estimated saved cost: $11,200.",                       tag: "Workforce" },
    ],
  },
  insights: {
    briefing:
      "12 dashboards, 47 saved reports, 6 attribution models active. Top insight this week: WhatsApp-first sequences are converting 2.4× better than email-first for KSA enterprise prospects.",
    kpis: [
      { label: "Dashboards",      value: "12",    sub: "3 viewed today",       trend: { dir: "up", pct: "1" },  icon: BarChart3, color: "#88B8B0" },
      { label: "Saved Reports",   value: "47",    sub: "9 scheduled weekly",    trend: { dir: "up", pct: "4" },  icon: Layers,    color: "#B8A0C8" },
      { label: "Attribution Models", value: "6",  sub: "Multi-touch + view-thru", trend: { dir: "up", pct: "1" }, icon: Target,    color: "#C8A880" },
      { label: "Team Performance", value: "112%", sub: "of monthly target",     trend: { dir: "up", pct: "12pt" }, icon: TrendingUp, color: "#B8B880" },
    ],
    highlights: [
      { icon: BarChart3,   color: "#88B8B0", title: "WhatsApp-first sequences: 2.4× conversion",    body: "For KSA enterprise prospects, sequences that open with WhatsApp instead of email convert 2.4× better. Recommend: switch top 5 sequences.", tag: "Insight" },
      { icon: TrendingUp,  color: "#B8A0C8", title: "Team velocity up 18% week-over-week",          body: "Call volume, email opens, and WhatsApp reply rates are all trending up. On track for 112% of monthly target.",                              tag: "Performance" },
      { icon: Target,      color: "#C8A880", title: "Attribution: Marketing AI is your #1 source", body: "12% of new pipeline this month was sourced by Marketing AI generating Khaleeji content. ROI: $24 in pipeline per $1 of AI cost.",              tag: "Attribution" },
    ],
  },
  data: {
    briefing:
      "31,420 contacts · 4,210 companies · 24 active segments. Deduplication queue at 47 (recommend: review today). Last CSV import: 1,247 contacts from Aramco event, all enriched.",
    kpis: [
      { label: "Contacts",       value: "31,420", sub: "+ 1,247 this week",   trend: { dir: "up", pct: "4%" },  icon: Users,      color: "#C0A0B8" },
      { label: "Companies",      value: "4,210",  sub: "GCC-focused",         trend: { dir: "up", pct: "112" }, icon: Building2,  color: "#88B8B0" },
      { label: "Active Segments", value: "24",    sub: "Smart + static",      trend: { dir: "up", pct: "3" },   icon: Target,     color: "#B8A0C8" },
      { label: "Dedup Queue",    value: "47",     sub: "Awaiting review",     trend: { dir: "down", pct: "12" }, icon: GitBranch, color: "#C8A880" },
    ],
    highlights: [
      { icon: Database,   color: "#C0A0B8", title: "Last import: 1,247 Aramco event contacts", body: "All enriched within 4 minutes via Clay-style waterfall. 91% match rate. 14 contacts already engaged — added to active sequences.",         tag: "Import" },
      { icon: GitBranch,  color: "#C8A880", title: "47 duplicates suggested for merge",        body: "Mostly from event imports + LinkedIn webhooks. Recommend: review and bulk-merge today to keep your CRM clean.",                              tag: "Dedup" },
      { icon: Target,     color: "#88B8B0", title: "Top performing segment: 'KSA · CIO · ≥500 staff'", body: "Highest reply rate (38%) and largest avg deal ($142K). Recommend: clone this segment for UAE and Qatar.",                            tag: "Segment" },
    ],
  },
  home: {
    briefing:
      "You have 3 high-intent prospects ready for outreach today, combined pipeline $42K. AI Voice Agent qualified 4 leads overnight. 2 deals at risk need attention before EOD.",
    kpis: [
      { label: "Calls Today",     value: "5",   sub: "3 confirmed",       icon: Phone,        color: "#88B8B0" },
      { label: "Hot Signals",     value: "3",   sub: "Last 24h",          icon: Zap,          color: "#B8B880" },
      { label: "AI Sessions",     value: "12",  sub: "4 qualified",       icon: Bot,          color: "#B8A0C8" },
      { label: "At-Risk Deals",   value: "2",   sub: "$240K exposure",   icon: AlertTriangle, color: "#C0A0B8" },
    ],
    highlights: [
      { icon: Sparkles, color: "#B8A0C8", title: "Most urgent: Sara Al-Mansouri",          body: "Gulf Ventures closed $50M Series B 6h ago. Score 96. Recommend: call within 24h.", tag: "Signal" },
      { icon: AlertTriangle, color: "#C8A880", title: "2 deals overdue follow-up",          body: "Khalid Al-Hamdan (14 days silent, $145K) and Layla Hassan (score dropped 72→65).", tag: "Risk" },
      { icon: Bot,       color: "#88B8B0", title: "AI Voice Agent: 4 qualified overnight", body: "12 outbound calls in 8h. Recommend: call Nora Al-Faisal first.",                  tag: "AI" },
    ],
  },
};

export default function SectionHubPage() {
  const [, params] = useRoute("/section/:key");
  const [, navigate] = useLocation();
  const sectionKey = params?.key ?? "home";
  const [refreshing, setRefreshing] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  // /section/home would duplicate the Command Center — redirect to /.
  // Legacy /section/sales bookmarks should now land on the CRM hub (/funnel).
  useEffect(() => {
    if (sectionKey === "home") navigate("/", { replace: true });
    else if (sectionKey === "sales") navigate("/funnel", { replace: true });
  }, [sectionKey, navigate]);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setRefreshedAt(new Date());
    }, 800);
  }

  const section = SECTIONS.find((s) => s.key === sectionKey);
  if (!section || sectionKey === "home") return null;

  const content = CONTENT[sectionKey] ?? CONTENT.home;
  const Icon = section.icon;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Hero with AI briefing — same shape as Command Center */}
      <div
        className="relative rounded-3xl overflow-hidden p-8"
        style={{
          background: `linear-gradient(135deg, ${section.accent}18 0%, #f0f9f8 40%, #fff8f0 80%, ${section.accent}10 100%)`,
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-25"
            style={{ background: `radial-gradient(circle, ${section.accent}, transparent)` }}
          />
          <div
            className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(circle, #88B8B0, transparent)" }}
          />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ background: `${section.accent}30` }}
              >
                <Icon className="w-6 h-6" style={{ color: section.accent }} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">{today} · Riyadh</div>
                <h1 className="text-3xl font-black text-foreground leading-tight">
                  {section.label} Dashboard
                </h1>
                <div className="text-sm font-semibold mt-0.5" style={{ color: section.accent }}>
                  {section.tagline}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/60 border border-white/80 text-xs text-muted-foreground hover:text-foreground shadow-sm backdrop-blur-sm disabled:opacity-60"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : refreshedAt ? `Refreshed ${refreshedAt.toLocaleTimeString()}` : "Refresh briefing"}
            </button>
          </div>

          {/* AI Briefing — matches Command Center pattern */}
          <div
            className="mt-4 p-5 rounded-2xl backdrop-blur-sm border"
            style={{
              background: "rgba(255,255,255,0.6)",
              borderColor: `${section.accent}40`,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${section.accent}, #B8A0C8)` }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div
                  className="text-xs font-bold uppercase tracking-wider mb-1"
                  style={{ color: section.accent }}
                >
                  Your {section.label} AI Briefing
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed">{content.briefing}</p>
              </div>
            </div>
          </div>

          {/* KPI cards — same shape as Command Center */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {content.kpis.map((s) => {
              const KIcon = s.icon;
              const TrendIcon = s.trend?.dir === "up" ? TrendingUp : TrendingDown;
              return (
                <div
                  key={s.label}
                  className="rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm"
                  style={{
                    background: "rgba(255,255,255,0.55)",
                    border: "1px solid rgba(255,255,255,0.7)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${s.color}20` }}
                  >
                    <KIcon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xl font-black text-foreground leading-none">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      {s.sub}
                      {s.trend && (
                        <span
                          className="inline-flex items-center gap-0.5 ml-1 font-bold"
                          style={{ color: s.trend.dir === "up" ? "#88B8B0" : "#C0A0B8" }}
                        >
                          <TrendIcon className="w-2.5 h-2.5" />
                          {s.trend.pct}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tools grid — every tool in the section as a clickable card */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4" style={{ color: section.accent }} />
            {section.label} Tools · {section.items.length}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {section.items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className="rounded-xl p-3 cursor-pointer transition-all border border-transparent hover:border-border/50 hover:bg-muted/30 group"
                  style={{ background: "rgba(255,255,255,0.4)" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${section.accent}20` }}
                    >
                      <ItemIcon className="w-4 h-4" style={{ color: section.accent }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground truncate flex items-center gap-1">
                        {item.label}
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Highlights / AI insights — matches Command Center pattern */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: section.accent }} />
            What NexFlow AI noticed for you
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {content.highlights.map((h) => {
            const HIcon = h.icon;
            return (
              <div
                key={h.title}
                className="rounded-xl p-4 backdrop-blur-sm transition-all hover:shadow-md"
                style={{
                  background: `${h.color}10`,
                  border: `1px solid ${h.color}30`,
                }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${h.color}25` }}
                  >
                    <HIcon className="w-3.5 h-3.5" style={{ color: h.color }} />
                  </div>
                  <div className="flex-1">
                    <span
                      className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: `${h.color}20`, color: h.color }}
                    >
                      {h.tag}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-bold text-foreground leading-tight mb-1">{h.title}</div>
                <p className="text-xs text-foreground/75 leading-relaxed">{h.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SectionNotFound() {
  return (
    <div className="rounded-2xl p-10 text-center glass-card">
      <h1 className="text-2xl font-black mb-2">Section not found</h1>
      <p className="text-muted-foreground mb-4">That section doesn't exist.</p>
      <Link href="/">
        <button className="px-4 py-2 rounded-lg nf-chameleon-bg text-white font-semibold">
          Back to Command Center
        </button>
      </Link>
    </div>
  );
}
