import { useState } from "react";
import {
  Building2, Users, TrendingUp, Activity, AlertTriangle, Star, Search,
  Mail, Phone, MessageSquare, Calendar, ArrowUpRight, Sparkles, Crown,
  Network, Target, Briefcase, ChevronRight, MapPin, DollarSign, Shield, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

type Persona = "champion" | "decision_maker" | "influencer" | "blocker" | "user" | "unknown";

const ACCOUNTS = [
  {
    id: "neom-tech",
    name: "NEOM Tech & Digital Holdings",
    industry: "Government / Smart City",
    region: "KSA · Tabuk",
    employees: "5,000-10,000",
    revenue: "$8.4B",
    arr: 1280000,
    pipeline: 3400000,
    healthScore: 87,
    engagement: 92,
    multithreadCount: 7,
    multithreadTarget: 8,
    intentSignals: 12,
    stage: "Active expansion",
    csm: "Layla Hassan",
    lastTouch: "Today, 09:30",
    contracts: 3,
    color: "#88B8B0",
  },
  {
    id: "aramco-digital",
    name: "Aramco Digital",
    industry: "Energy / Tech",
    region: "KSA · Dhahran",
    employees: "10,000+",
    revenue: "$15.2B",
    arr: 2100000,
    pipeline: 5600000,
    healthScore: 94,
    engagement: 88,
    multithreadCount: 11,
    multithreadTarget: 12,
    intentSignals: 18,
    stage: "Renewal Q3",
    csm: "Mohammed Al-Otaibi",
    lastTouch: "Yesterday",
    contracts: 5,
    color: "#B8A0C8",
  },
  {
    id: "gulf-ventures",
    name: "Gulf Ventures",
    industry: "Investment / VC",
    region: "UAE · Dubai",
    employees: "200-500",
    revenue: "$1.2B AUM",
    arr: 480000,
    pipeline: 1800000,
    healthScore: 76,
    engagement: 81,
    multithreadCount: 4,
    multithreadTarget: 6,
    intentSignals: 9,
    stage: "Series B closed",
    csm: "Sara Al-Mansouri",
    lastTouch: "2 days ago",
    contracts: 1,
    color: "#C8A880",
  },
  {
    id: "qnb",
    name: "Qatar National Bank",
    industry: "Banking",
    region: "Qatar · Doha",
    employees: "20,000+",
    revenue: "$22B",
    arr: 1640000,
    pipeline: 2400000,
    healthScore: 68,
    engagement: 64,
    multithreadCount: 5,
    multithreadTarget: 10,
    intentSignals: 4,
    stage: "At risk · low usage",
    csm: "Ahmed Al-Rashidi",
    lastTouch: "9 days ago",
    contracts: 2,
    color: "#C0A0B8",
  },
];

const BUYING_COMMITTEE: { name: string; title: string; persona: Persona; engagement: number; lastTouch: string; channel: string }[] = [
  { name: "Ahmed Al-Rashidi",  title: "CIO",                 persona: "champion",       engagement: 96, lastTouch: "today",     channel: "WhatsApp" },
  { name: "Fatima Al-Khalid",  title: "VP Engineering",      persona: "decision_maker", engagement: 88, lastTouch: "2 days",    channel: "Email" },
  { name: "Mohammed Al-Saif",  title: "CTO",                 persona: "decision_maker", engagement: 72, lastTouch: "1 week",    channel: "Meeting" },
  { name: "Reem Al-Dossari",   title: "Head of Procurement", persona: "blocker",        engagement: 45, lastTouch: "3 weeks",   channel: "Email" },
  { name: "Khalid Al-Hamdan",  title: "Director of Sales Ops", persona: "user",         engagement: 61, lastTouch: "5 days",    channel: "WhatsApp" },
  { name: "Nora Al-Faisal",    title: "VP Customer Success", persona: "influencer",     engagement: 78, lastTouch: "4 days",    channel: "Email" },
  { name: "Abdullah Al-Thani", title: "CFO",                 persona: "decision_maker", engagement: 38, lastTouch: "2 weeks",   channel: "Meeting" },
  { name: "Hessa Al-Nahyan",   title: "Chief Data Officer",  persona: "unknown",        engagement: 12, lastTouch: "never",     channel: "—" },
];

const PERSONA_CONFIG: Record<Persona, { label: string; color: string; bg: string; icon: any }> = {
  champion:       { label: "Champion",       color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/15", icon: Star },
  decision_maker: { label: "Decision-maker", color: "text-[#B8A0C8]", bg: "bg-[#B8A0C8]/15", icon: Crown },
  influencer:     { label: "Influencer",     color: "text-[#90B8B8]", bg: "bg-[#90B8B8]/15", icon: Sparkles },
  blocker:        { label: "Blocker",        color: "text-[#C0A0B8]", bg: "bg-[#C0A0B8]/15", icon: AlertTriangle },
  user:           { label: "End user",       color: "text-[#C8A880]", bg: "bg-[#C8A880]/15", icon: Users },
  unknown:        { label: "Not engaged",    color: "text-muted-foreground", bg: "bg-muted/40", icon: Target },
};

const HEATMAP_DAYS = 14;
const HEATMAP_CHANNELS = ["Email", "WhatsApp", "Calls", "Meetings", "Site visits"];
function genHeat(): number[][] {
  return HEATMAP_CHANNELS.map(() =>
    Array.from({ length: HEATMAP_DAYS }, () => Math.floor(Math.random() * 10))
  );
}
const HEATMAP_DATA = genHeat();

const ACTIVITY_TIMELINE = [
  { id: "a1", time: "Today 09:30",   actor: "Ahmed Al-Rashidi", action: "Replied to MSA proposal — '3 questions on data residency'", channel: "Email",     icon: Mail,        color: "#B8A0C8" },
  { id: "a2", time: "Today 08:15",   actor: "AI Voice Agent",   action: "Discovery call with Fatima Al-Khalid · sentiment 87%", channel: "AI Call",    icon: Phone,       color: "#88B8B0" },
  { id: "a3", time: "Yesterday 16:42", actor: "Layla Hassan",   action: "Sent QBR deck (12 slides, opened in 4 minutes)",       channel: "Email",      icon: Mail,        color: "#B8A0C8" },
  { id: "a4", time: "Yesterday 11:00", actor: "Mohammed Al-Saif", action: "Attended product roadmap session · 4 questions",      channel: "Meeting",    icon: Calendar,    color: "#C8A880" },
  { id: "a5", time: "2 days ago",     actor: "Buyer signal",    action: "5 colleagues visited /pricing in 2-day window",        channel: "Intent",     icon: Zap,         color: "#B8B880" },
  { id: "a6", time: "3 days ago",     actor: "Reem Al-Dossari", action: "Forwarded compliance docs to legal team",               channel: "Email",      icon: Mail,        color: "#B8A0C8" },
];

export default function AccountsPage() {
  const [selected, setSelected] = useState(ACCOUNTS[0]);
  const totalPipeline = ACCOUNTS.reduce((s, a) => s + a.pipeline, 0);
  const totalArr = ACCOUNTS.reduce((s, a) => s + a.arr, 0);
  const heatMax = 10;

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Account Hub</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#B8A0C8]/15 text-[#B8A0C8] text-[10px] font-bold uppercase tracking-wide">ABM</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            Account-based view: buying-committee mapping, multi-thread coverage, and engagement heatmaps.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="pl-7 pr-3 py-1.5 rounded-lg text-xs bg-muted/40 border border-border/40 focus:outline-none focus:border-[#B8A0C8]/50 w-48" placeholder="Search accounts…" />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg shadow-sm">
            <Briefcase className="w-3.5 h-3.5" /> New account
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Target accounts",      value: ACCOUNTS.length.toString(), trend: "+2 added",    color: "#B8A0C8", icon: Building2 },
          { label: "Total pipeline",       value: `$${(totalPipeline / 1000000).toFixed(1)}M`, trend: "+18% MoM", color: "#88B8B0", icon: TrendingUp },
          { label: "Active ARR",           value: `$${(totalArr / 1000000).toFixed(1)}M`,    trend: "+$240k Q",  color: "#C8A880", icon: DollarSign },
          { label: "Avg health",           value: `${Math.round(ACCOUNTS.reduce((s, a) => s + a.healthScore, 0) / ACCOUNTS.length)}`, trend: "1 at risk", color: "#90B8B8", icon: Activity },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-panel rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">{s.label}</div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-muted-foreground">{s.trend}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Accounts list */}
        <div className="col-span-3">
          <div className="glass-panel rounded-xl p-2.5 max-h-[700px] overflow-y-auto">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2 px-1.5">Target accounts</div>
            <div className="space-y-1.5">
              {ACCOUNTS.map((a) => (
                <button key={a.id} onClick={() => setSelected(a)} className={cn(
                  "w-full text-left p-2.5 rounded-lg border transition",
                  selected.id === a.id ? "border-[#B8A0C8]/60 bg-[#B8A0C8]/8" : "border-border/30 hover:bg-muted/40"
                )}>
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[11px] font-black"
                      style={{ background: a.color }}>{a.name.split(" ").slice(0, 2).map(w => w[0]).join("")}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{a.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{a.industry}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-[#88B8B0]">${(a.pipeline / 1000000).toFixed(1)}M</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className={cn("text-[10px] font-bold",
                          a.healthScore >= 80 ? "text-[#88B8B0]" :
                          a.healthScore >= 70 ? "text-[#C8A880]" : "text-[#C0A0B8]")}>
                          {a.healthScore}h
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Account detail */}
        <div className="col-span-9 space-y-3">
          {/* Account header card */}
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-base font-black"
                  style={{ background: selected.color }}>{selected.name.split(" ").slice(0, 2).map(w => w[0]).join("")}</div>
                <div>
                  <div className="text-base font-bold">{selected.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{selected.industry}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selected.region}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{selected.employees}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold">{selected.stage.toUpperCase()}</span>
                    <span className="text-[10px] text-muted-foreground">CSM: <span className="font-semibold text-foreground/80">{selected.csm}</span></span>
                    <span className="text-[10px] text-muted-foreground">· Last touch: {selected.lastTouch}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="p-2 rounded-md hover:bg-muted/50 text-muted-foreground" title="Email"><Mail className="w-4 h-4" /></button>
                <button className="p-2 rounded-md hover:bg-muted/50 text-muted-foreground" title="WhatsApp"><MessageSquare className="w-4 h-4" /></button>
                <button className="p-2 rounded-md hover:bg-muted/50 text-muted-foreground" title="Schedule"><Calendar className="w-4 h-4" /></button>
                <button className="ml-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> AI account brief
                </button>
              </div>
            </div>

            {/* Account-level metrics */}
            <div className="grid grid-cols-5 gap-2 mt-4">
              {[
                { label: "Health",        value: selected.healthScore, suffix: "",    color: selected.healthScore >= 80 ? "#88B8B0" : selected.healthScore >= 70 ? "#C8A880" : "#C0A0B8" },
                { label: "Engagement",    value: selected.engagement,  suffix: "",    color: "#B8A0C8" },
                { label: "Multi-thread",  value: `${selected.multithreadCount}/${selected.multithreadTarget}`, suffix: "", color: "#90B8B8" },
                { label: "Intent signals (7d)", value: selected.intentSignals, suffix: "", color: "#B8B880" },
                { label: "Active contracts", value: selected.contracts, suffix: "", color: "#C8A880" },
              ].map((m) => (
                <div key={m.label} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">{m.label}</div>
                  <div className="text-xl font-bold mt-1" style={{ color: m.color }}>{m.value}{m.suffix}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Buying committee + heatmap */}
          <div className="grid grid-cols-12 gap-3">
            {/* Buying committee */}
            <div className="col-span-7 glass-panel rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold">Buying committee map</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {selected.multithreadCount} of {selected.multithreadTarget} stakeholders engaged · <span className="text-[#C0A0B8] font-semibold">{selected.multithreadTarget - selected.multithreadCount} coverage gaps</span>
                  </div>
                </div>
                <button className="px-2 py-1 rounded-md text-[10px] font-bold text-[#B8A0C8] bg-[#B8A0C8]/10 hover:bg-[#B8A0C8]/15">+ Add stakeholder</button>
              </div>
              <div className="space-y-1.5">
                {BUYING_COMMITTEE.map((c) => {
                  const cfg = PERSONA_CONFIG[c.persona];
                  const Icon = cfg.icon;
                  return (
                    <div key={c.name} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/40 group">
                      <div className="w-7 h-7 rounded-full nf-chameleon-bg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                        {c.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/contacts/${encodeURIComponent(c.name)}`}>
                            <span className="text-xs font-semibold cursor-pointer hover:text-[#B8A0C8]">{c.name}</span>
                          </Link>
                          <div className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold", cfg.bg, cfg.color)}>
                            <Icon className="w-2.5 h-2.5" />
                            {cfg.label}
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground">{c.title}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[10px] text-muted-foreground">Engagement</div>
                          <div className="w-16 h-1.5 rounded-full bg-muted/50 overflow-hidden mt-1">
                            <div className="h-full rounded-full" style={{
                              width: `${c.engagement}%`,
                              backgroundColor: c.engagement >= 70 ? "#88B8B0" : c.engagement >= 40 ? "#C8A880" : "#C0A0B8"
                            }} />
                          </div>
                        </div>
                        <div className="text-right w-16">
                          <div className="text-[10px] text-muted-foreground">{c.lastTouch}</div>
                          <div className="text-[10px] font-semibold text-foreground/70">{c.channel}</div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-[#B8A0C8]">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Engagement heatmap */}
            <div className="col-span-5 glass-panel rounded-xl p-3.5">
              <div className="text-sm font-bold mb-1">Engagement heatmap</div>
              <div className="text-[11px] text-muted-foreground mb-3">Touchpoints per channel · last {HEATMAP_DAYS} days</div>
              <div className="space-y-1.5">
                {HEATMAP_CHANNELS.map((channel, ci) => (
                  <div key={channel} className="flex items-center gap-2">
                    <div className="text-[10px] text-muted-foreground font-semibold w-16 text-right">{channel}</div>
                    <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: `repeat(${HEATMAP_DAYS}, 1fr)` }}>
                      {HEATMAP_DATA[ci].map((v, di) => (
                        <div key={di} className="aspect-square rounded-sm" style={{
                          backgroundColor: v === 0 ? "rgba(180,180,200,0.08)" : `rgba(184,160,200,${0.15 + (v / heatMax) * 0.85})`,
                        }} title={`${v} ${channel.toLowerCase()} on day ${di + 1}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                <span>14 days ago</span>
                <div className="flex items-center gap-1">
                  <span>Less</span>
                  {[0.15, 0.35, 0.55, 0.75, 1].map((o, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `rgba(184,160,200,${o})` }} />
                  ))}
                  <span>More</span>
                </div>
                <span>Today</span>
              </div>

              <div className="mt-4 pt-3 border-t border-border/30">
                <div className="text-[11px] font-bold text-muted-foreground uppercase mb-2">AI account insights</div>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 text-[11px]">
                    <Sparkles className="w-3 h-3 text-[#B8A0C8] flex-shrink-0 mt-0.5" />
                    <span><span className="font-semibold">CFO unengaged</span> — recommend exec-to-exec intro from your CEO this week.</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px]">
                    <Shield className="w-3 h-3 text-[#88B8B0] flex-shrink-0 mt-0.5" />
                    <span><span className="font-semibold">Compliance docs forwarded</span> — likely procurement review starting; prep DPA.</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px]">
                    <Zap className="w-3 h-3 text-[#B8B880] flex-shrink-0 mt-0.5" />
                    <span><span className="font-semibold">Buying intent up 32%</span> — pricing page visits from 5 colleagues in 48h.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity timeline */}
          <div className="glass-panel rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold">Account activity timeline</div>
              <div className="flex items-center gap-1.5">
                {["All", "Email", "Calls", "Meetings", "Intent"].map((f, i) => (
                  <button key={f} className={cn("px-2 py-1 rounded-md text-[10px] font-semibold",
                    i === 0 ? "bg-[#B8A0C8]/15 text-[#B8A0C8]" : "text-muted-foreground hover:bg-muted/40")}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {ACTIVITY_TIMELINE.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/40">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${a.color}20`, color: a.color }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{a.actor}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: `${a.color}20`, color: a.color }}>{a.channel}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{a.action}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground flex-shrink-0">{a.time}</div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
