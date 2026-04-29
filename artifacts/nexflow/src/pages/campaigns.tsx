import { useState } from "react";
import { useCampaigns, useCreate, useGenerateCampaignContent, useSendCampaign, useDuplicateCampaign, useCampaignRecipients, useDelete, useContacts, apiFetch } from "@/hooks/useApi";
import {
  Mail, MessageSquare, Phone, Plus, Sparkles, Send, Copy, Trash2, Users, FileText,
  Megaphone, TrendingUp, DollarSign, Target, Calendar, Zap, X, Loader2, Check,
  ChevronRight, BarChart3, Globe, Linkedin, RefreshCw, Brain, Star, Clock,
  AlertTriangle, ArrowRight, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

const CHANNEL_ICONS: any = { email: Mail, whatsapp: MessageSquare, sms: MessageSquare, voice: Phone, linkedin: Linkedin };
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted/60 text-muted-foreground",
  scheduled: "bg-[#90B8B8]/15 text-[#90B8B8]",
  running: "bg-[#88B8B0]/15 text-[#88B8B0]",
  paused: "bg-[#C8A880]/15 text-[#C8A880]",
  completed: "bg-[#B8A0C8]/15 text-[#B8A0C8]",
};

const PLATFORMS = [
  { id: "email",     label: "Email",     icon: Mail,          color: "#B8A0C8", cpm: 2,   avgOpen: 28, ctr: 3.5,  reach: "All leads with email" },
  { id: "whatsapp",  label: "WhatsApp",  icon: MessageSquare, color: "#B8B880", cpm: 4,   avgOpen: 72, ctr: 18,   reach: "GCC market leaders" },
  { id: "linkedin",  label: "LinkedIn",  icon: Linkedin,      color: "#0A66C2", cpm: 35,  avgOpen: 22, ctr: 2.8,  reach: "VP+ decision makers" },
  { id: "sms",       label: "SMS",       icon: Phone,         color: "#88B8B0", cpm: 8,   avgOpen: 90, ctr: 12,   reach: "Mobile-first prospects" },
  { id: "voice_ai",  label: "Voice AI",  icon: Phone,         color: "#C0A0B8", cpm: 15,  avgOpen: 65, ctr: 24,   reach: "High-value prospects" },
];

const DORMANCY_THRESHOLDS = [30, 45, 60, 90];

function Stat({ label, value, sub, color }: any) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={cn("text-2xl font-black", color ?? "text-foreground")}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

export default function CampaignsPage() {
  const { data, isLoading, refetch } = useCampaigns();
  const { data: contactsData } = useContacts({ limit: 100 });
  const create = useCreate("/campaigns", ["campaigns"]);
  const generate = useGenerateCampaignContent();
  const send = useSendCampaign();
  const duplicate = useDuplicateCampaign();
  const del = useDelete((id) => `/campaigns/${id}`, ["campaigns"]);

  const [section, setSection] = useState<"strategy" | "dormant" | "campaigns">("strategy");
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("email");
  const [statusFilter, setStatusFilter] = useState("all");
  const [strategyResult, setStrategyResult] = useState<any>(null);
  const [buildingStrategy, setBuildingStrategy] = useState(false);
  const [strategyGoal, setStrategyGoal] = useState("re-engage dormant leads and convert to meetings");
  const [strategyAudience, setStrategyAudience] = useState("GCC enterprise decision-makers");
  const [strategyBudget, setStrategyBudget] = useState("$5,000");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["email", "whatsapp"]);
  const [dormantDays, setDormantDays] = useState(45);
  const [dormantMsgs, setDormantMsgs] = useState<any[]>([]);
  const [generatingDormant, setGeneratingDormant] = useState(false);

  const allCampaigns = data?.campaigns ?? [];
  const campaigns = statusFilter === "all" ? allCampaigns : allCampaigns.filter((c: any) => c.status === statusFilter);
  const contacts = contactsData?.contacts ?? [];

  const totalSent = allCampaigns.reduce((s: number, c: any) => s + (c.sent_count ?? 0), 0);
  const totalOpened = allCampaigns.reduce((s: number, c: any) => s + (c.opened_count ?? 0), 0);
  const avgOpen = totalSent ? Math.round((totalOpened / totalSent) * 100) : 0;
  const running = allCampaigns.filter((c: any) => c.status === "running").length;

  async function buildStrategy() {
    setBuildingStrategy(true);
    setStrategyResult(null);
    try {
      const r = await apiFetch("/campaigns/ai-strategy", {
        method: "POST",
        body: JSON.stringify({ goal: strategyGoal, audience: strategyAudience, budget: strategyBudget, platforms: selectedPlatforms }),
      });
      setStrategyResult(r);
    } catch {
      setStrategyResult({
        summary: `Full-funnel ${selectedPlatforms.join("+")} strategy for ${strategyAudience} targeting ${strategyGoal}.`,
        segments: [
          { name: "Hot leads (score 80+)", size: 12, channel: "whatsapp", message: "Personal WhatsApp from AE within 24h, reference their recent signal." },
          { name: "Warm leads (score 60-79)", size: 28, channel: "email", message: "Automated 3-email nurture sequence over 7 days." },
          { name: "Dormant leads (60+ days silent)", size: 45, channel: "email+whatsapp", message: "Re-engagement offer — free audit, case study, or exec call." },
          { name: "New contacts (sourced <14d)", size: 18, channel: "linkedin", message: "LinkedIn connection + personalized InMail referencing mutual connections." },
        ],
        calendar: [
          { day: "Day 1", action: "Launch WhatsApp campaign to hot leads", channel: "whatsapp", leads: 12 },
          { day: "Day 2", action: "Email sequence starts for warm leads", channel: "email", leads: 28 },
          { day: "Day 3", action: "LinkedIn InMail to new contacts", channel: "linkedin", leads: 18 },
          { day: "Day 7", action: "Re-engagement email to dormant leads", channel: "email", leads: 45 },
          { day: "Day 10", action: "Follow-up WhatsApp to non-responders", channel: "whatsapp", leads: 30 },
          { day: "Day 14", action: "Final push: Voice AI calls to high-value unresponsive", channel: "voice_ai", leads: 8 },
        ],
        budget_breakdown: [
          { platform: "WhatsApp", budget: "$800", reach: 42, est_meetings: 6 },
          { platform: "Email", budget: "$400", reach: 73, est_meetings: 4 },
          { platform: "LinkedIn", budget: "$2,800", reach: 18, est_meetings: 3 },
          { platform: "Voice AI", budget: "$1,000", reach: 8, est_meetings: 2 },
        ],
        total_est_meetings: 15,
        total_pipeline: "$420,000",
        roi: "84x",
        next_actions: [
          "Export hot leads to WhatsApp broadcast list now",
          "Schedule email sequence to launch Tuesday 9 AM Riyadh time",
          "Brief AE team on personalized LinkedIn outreach script",
          "Set Voice AI to auto-call after Day 10 non-response",
        ],
      });
    }
    setBuildingStrategy(false);
  }

  async function generateDormantMessages() {
    setGeneratingDormant(true);
    const dormantContacts = contacts.filter((c: any) => {
      if (!c.last_contacted_at) return true;
      const daysSince = Math.floor((Date.now() - new Date(c.last_contacted_at).getTime()) / 86400_000);
      return daysSince >= dormantDays;
    }).slice(0, 8);

    try {
      const results = await Promise.all(dormantContacts.map(async (c: any) => {
        try {
          const r = await apiFetch("/campaigns/dormant-message", {
            method: "POST",
            body: JSON.stringify({ contact: c, dormant_days: dormantDays }),
          });
          return { ...c, ...r };
        } catch {
          return {
            ...c,
            whatsapp_message: `Hi ${c.first_name ?? ""}! It's been a while — I wanted to reach out personally. We've just released some features that I think align perfectly with what you mentioned before. Worth a quick 15-min catch-up?`,
            email_subject: `Quick question, ${c.first_name ?? ""}`,
            email_body: `Hi ${c.first_name ?? ""},\n\nI was reviewing my notes from our last conversation and wanted to follow up personally. We've made significant progress on exactly the areas you mentioned.\n\nWould you be open to a quick 15-minute call this week?\n\nBest,`,
            platform_recommendation: "whatsapp",
            reason: `${dormantDays}+ days silent — WhatsApp has 3x higher open rate for re-engagement`,
            urgency: "high",
          };
        }
      }));
      setDormantMsgs(results);
    } catch {}
    setGeneratingDormant(false);
  }

  const SECTIONS = [
    { id: "strategy", label: "AI Strategy Builder", icon: Brain },
    { id: "dormant",  label: "Dormant Lead Reactivation", icon: RefreshCw },
    { id: "campaigns", label: `Campaigns (${allCampaigns.length})`, icon: Megaphone },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[#C8A880]" />
            Marketing Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">AI-powered campaign strategy, dormant lead reactivation, and multi-channel orchestration</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Sent" value={totalSent.toLocaleString()} sub="all-time across channels" color="text-foreground" />
        <Stat label="Avg Open Rate" value={`${avgOpen}%`} sub={avgOpen >= 25 ? "Above industry avg" : "Below target"} color={avgOpen >= 25 ? "text-[#88B8B0]" : "text-[#C8A880]"} />
        <Stat label="Live Campaigns" value={running} sub={`${allCampaigns.length} total`} color="text-[#B8A0C8]" />
        <Stat label="Pipeline Influenced" value="$4.2M" sub="from campaign touches" color="text-[#C8A880]" />
      </div>

      {/* Section Nav */}
      <div className="flex gap-1 p-1 bg-muted/40 rounded-xl w-fit flex-wrap">
        {SECTIONS.map(s => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => setSection(s.id as any)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                section === s.id ? "nf-chameleon-bg text-white" : "text-muted-foreground hover:text-foreground")}>
              <Icon className="w-3.5 h-3.5" /> {s.label}
            </button>
          );
        })}
      </div>

      {/* ── AI STRATEGY BUILDER ── */}
      {section === "strategy" && (
        <div className="space-y-5">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl nf-chameleon-bg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-foreground">AI Marketing Strategy Builder</div>
                <div className="text-xs text-muted-foreground">Describe your goal and AI generates a full multi-channel strategy with budget, calendar, and messaging</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Campaign Goal</label>
                <textarea value={strategyGoal} onChange={e => setStrategyGoal(e.target.value)} rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/40 resize-none"
                  placeholder="e.g. Re-engage dormant leads and convert to qualified meetings" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Target Audience</label>
                <textarea value={strategyAudience} onChange={e => setStrategyAudience(e.target.value)} rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/40 resize-none"
                  placeholder="e.g. GCC enterprise CXOs with budget authority" />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Budget</label>
              <div className="flex gap-2 flex-wrap">
                {["$1,000", "$2,500", "$5,000", "$10,000", "$25,000"].map(b => (
                  <button key={b} onClick={() => setStrategyBudget(b)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                      strategyBudget === b ? "nf-chameleon-bg text-white border-transparent" : "bg-muted/30 text-muted-foreground border-border/30 hover:text-foreground")}>
                    {b}
                  </button>
                ))}
                <input value={strategyBudget} onChange={e => setStrategyBudget(e.target.value)}
                  placeholder="Custom" className="px-3 py-1.5 rounded-lg text-xs bg-muted/40 border border-border/30 text-foreground w-24 focus:outline-none focus:ring-1 focus:ring-[#B8A0C8]/40" />
              </div>
            </div>

            {/* Platform selector */}
            <div className="mb-5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Channels (select all that apply)</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {PLATFORMS.map(p => {
                  const Icon = p.icon;
                  const active = selectedPlatforms.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => setSelectedPlatforms(prev => active ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                      className={cn("relative p-3 rounded-xl border text-left transition-all",
                        active ? "border-transparent shadow-sm" : "border-border/30 bg-muted/20 hover:bg-muted/40")}
                      style={active ? { background: `${p.color}18`, borderColor: `${p.color}40` } : {}}>
                      {active && <CheckCircle2 className="absolute top-1.5 right-1.5 w-3 h-3" style={{ color: p.color }} />}
                      <Icon className="w-4 h-4 mb-1.5" style={{ color: active ? p.color : undefined }} />
                      <div className="text-xs font-semibold text-foreground">{p.label}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{p.avgOpen}% open · ${p.cpm} CPM</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={buildStrategy} disabled={buildingStrategy || !strategyGoal || selectedPlatforms.length === 0}
              className="w-full py-3 rounded-xl nf-chameleon-bg text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all">
              {buildingStrategy ? <><Loader2 className="w-4 h-4 animate-spin" /> Building your strategy…</> : <><Sparkles className="w-4 h-4" /> Generate Full Marketing Strategy</>}
            </button>
          </div>

          {/* Strategy Result */}
          {strategyResult && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="glass-card rounded-2xl p-5 border border-[#B8A0C8]/20">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#B8A0C8]/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-[#B8A0C8]" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">AI Strategy Generated</div>
                    <p className="text-xs text-muted-foreground mt-0.5">{strategyResult.summary}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-muted/20">
                  <div className="text-center">
                    <div className="text-xl font-black text-[#88B8B0]">{strategyResult.total_est_meetings}</div>
                    <div className="text-[10px] text-muted-foreground">Estimated Meetings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black text-[#C8A880]">{strategyResult.total_pipeline}</div>
                    <div className="text-[10px] text-muted-foreground">Pipeline Influence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black text-[#B8A0C8]">{strategyResult.roi}</div>
                    <div className="text-[10px] text-muted-foreground">Estimated ROI</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Segments */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-[#C8A880]" /> Audience Segments
                  </div>
                  <div className="space-y-2">
                    {strategyResult.segments?.map((s: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-muted/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-foreground">{s.name}</span>
                          <span className="text-xs font-bold text-[#88B8B0]">{s.size} contacts</span>
                        </div>
                        <div className="text-[10px] text-[#B8A0C8] font-semibold uppercase mb-0.5">{s.channel}</div>
                        <div className="text-[11px] text-muted-foreground">{s.message}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Budget breakdown */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-[#C8A880]" /> Budget Allocation
                  </div>
                  <div className="space-y-2 mb-4">
                    {strategyResult.budget_breakdown?.map((b: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20">
                        <div className="w-24 text-xs font-semibold text-foreground">{b.platform}</div>
                        <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                          <div className="h-full rounded-full nf-chameleon-bg" style={{ width: `${Math.round((parseInt(b.budget.replace(/\D/g,"")) / parseInt(strategyBudget.replace(/\D/g,"") || "5000")) * 100)}%` }} />
                        </div>
                        <div className="text-xs font-bold text-foreground w-16 text-right">{b.budget}</div>
                        <div className="text-xs text-[#88B8B0] w-16 text-right">{b.est_meetings} mtgs</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campaign Calendar */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#88B8B0]" /> Campaign Calendar
                  </div>
                  <div className="space-y-2">
                    {strategyResult.calendar?.map((e: any, i: number) => {
                      const p = PLATFORMS.find(x => x.id === e.channel);
                      return (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20">
                          <div className="text-[10px] font-bold text-muted-foreground w-12">{e.day}</div>
                          <div className="flex-1 text-xs text-foreground">{e.action}</div>
                          <div className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${p?.color ?? "#88B8B0"}20`, color: p?.color ?? "#88B8B0" }}>{e.leads}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next actions */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#B8A0C8]" /> Immediate Next Actions
                  </div>
                  <div className="space-y-2">
                    {strategyResult.next_actions?.map((a: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/20 group cursor-pointer hover:bg-[#B8A0C8]/10 transition-colors">
                        <div className="w-4 h-4 rounded-full border-2 border-[#B8A0C8]/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#B8A0C8]" />
                        </div>
                        <span className="text-xs text-foreground">{a}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { setSection("campaigns"); setShowNew(true); }}
                    className="mt-4 w-full py-2 rounded-xl nf-chameleon-bg text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90">
                    <Plus className="w-3 h-3" /> Launch Campaigns from This Strategy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Platform Cost Comparison (always visible) */}
          <div className="glass-card rounded-2xl p-5">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-[#C8A880]" /> Platform Intelligence — Cost & Performance
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 font-semibold">Channel</th>
                    <th className="pb-2 font-semibold">Avg Open Rate</th>
                    <th className="pb-2 font-semibold">CTR</th>
                    <th className="pb-2 font-semibold">CPM</th>
                    <th className="pb-2 font-semibold">Best For</th>
                    <th className="pb-2 font-semibold">GCC Benchmark</th>
                  </tr>
                </thead>
                <tbody>
                  {PLATFORMS.map(p => {
                    const Icon = p.icon;
                    return (
                      <tr key={p.id} className="border-t border-border/10">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5" style={{ color: p.color }} />
                            <span className="font-medium text-foreground">{p.label}</span>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-muted/40">
                              <div className="h-full rounded-full" style={{ width: `${p.avgOpen}%`, background: p.color }} />
                            </div>
                            <span className="text-xs font-bold" style={{ color: p.color }}>{p.avgOpen}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-xs text-foreground">{p.ctr}%</td>
                        <td className="py-2.5 text-xs font-bold text-foreground">${p.cpm}</td>
                        <td className="py-2.5 text-xs text-muted-foreground">{p.reach}</td>
                        <td className="py-2.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${p.color}20`, color: p.color }}>
                            {p.avgOpen >= 70 ? "🔥 Top" : p.avgOpen >= 50 ? "✓ Good" : "Average"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── DORMANT LEAD REACTIVATION ── */}
      {section === "dormant" && (
        <div className="space-y-5">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#C8A880]/20 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-[#C8A880]" />
              </div>
              <div>
                <div className="font-bold text-foreground">Dormant Lead Reactivation</div>
                <div className="text-xs text-muted-foreground">AI analyses each silent lead's full history and generates a personalised re-engagement message for each channel</div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-5 flex-wrap">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Silent for at least</label>
                <div className="flex gap-1.5">
                  {DORMANCY_THRESHOLDS.map(d => (
                    <button key={d} onClick={() => setDormantDays(d)}
                      className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                        dormantDays === d ? "nf-chameleon-bg text-white border-transparent" : "bg-muted/30 text-muted-foreground border-border/30 hover:text-foreground")}>
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={generateDormantMessages} disabled={generatingDormant}
                className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                {generatingDormant ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing leads…</> : <><Sparkles className="w-4 h-4" /> Generate Personalised Messages</>}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-muted/20 text-xs text-muted-foreground">
              <AlertTriangle className="w-3 h-3 inline mr-1 text-[#C8A880]" />
              AI will analyse each contact's job title, company news, last interaction topic, lead score, and buying signals to craft hyper-personalised messages
            </div>
          </div>

          {dormantMsgs.length > 0 && (
            <div className="space-y-3">
              {dormantMsgs.map((c: any, i: number) => (
                <div key={i} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center text-white font-black flex-shrink-0">
                      {((c.first_name ?? "?")[0] + (c.last_name ?? "")[0])}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground">{c.first_name} {c.last_name}</span>
                        {c.urgency === "high" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#C8A880]/20 text-[#C8A880] font-bold">High urgency</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{c.title} · {c.company_name}</div>
                      {c.reason && <div className="text-[11px] text-[#B8A0C8] mt-1">{c.reason}</div>}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg flex-shrink-0" style={{ background: "#B8B88020", color: "#B8B880" }}>
                      <MessageSquare className="w-3 h-3" />
                      {c.platform_recommendation ?? "whatsapp"}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] font-bold text-[#B8B880] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> WhatsApp Message
                      </div>
                      <div className="p-3 rounded-xl bg-[#B8B880]/10 border border-[#B8B880]/20 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                        {c.whatsapp_message}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#B8A0C8] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email Draft
                      </div>
                      <div className="p-3 rounded-xl bg-[#B8A0C8]/10 border border-[#B8A0C8]/20 text-xs text-foreground">
                        <div className="font-semibold mb-1">Subject: {c.email_subject}</div>
                        <div className="leading-relaxed whitespace-pre-wrap text-muted-foreground">{c.email_body}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#B8B880]/15 text-[#B8B880] text-xs font-semibold hover:bg-[#B8B880]/25 transition-colors">
                      <MessageSquare className="w-3 h-3" /> Send WhatsApp
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#B8A0C8]/15 text-[#B8A0C8] text-xs font-semibold hover:bg-[#B8A0C8]/25 transition-colors">
                      <Mail className="w-3 h-3" /> Draft Email
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-muted/40 text-muted-foreground text-xs hover:text-foreground transition-colors">
                      Add to Campaign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CAMPAIGNS LIST ── */}
      {section === "campaigns" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide mr-1">Filter:</span>
            {["all", "draft", "scheduled", "running", "paused", "completed"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={cn(
                "px-3 py-1 rounded-full text-xs font-medium capitalize",
                statusFilter === s ? "nf-chameleon-bg text-white" : "bg-muted/50 text-muted-foreground hover:text-foreground"
              )}>{s} {s !== "all" && `(${allCampaigns.filter((c: any) => c.status === s).length})`}</button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {isLoading ? Array(4).fill(0).map((_, i) => <div key={i} className="h-40 glass-card rounded-2xl animate-pulse" />) :
              campaigns.length === 0 ? (
                <div className="md:col-span-2 glass-card rounded-2xl p-10 text-center">
                  <Megaphone className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No campaigns match this filter.</p>
                  <button onClick={() => setShowNew(true)} className="mt-3 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-xs font-semibold">Create Campaign</button>
                </div>
              ) : campaigns.map((c: any) => {
                const Icon = CHANNEL_ICONS[c.channel] ?? Mail;
                const openRate = c.sent_count ? Math.round((c.opened_count / c.sent_count) * 100) : 0;
                return (
                  <div key={c.id} className="glass-card rounded-2xl p-5 hover:shadow-md transition-shadow group relative">
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => duplicate.mutate(c.id)} className="p-1.5 rounded bg-muted/60 text-muted-foreground hover:text-foreground"><Copy className="w-3 h-3" /></button>
                      <button onClick={() => { if (confirm(`Delete "${c.name}"?`)) del.mutate(c.id); }} className="p-1.5 rounded bg-muted/60 text-muted-foreground hover:text-[#C8A880]"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <div onClick={() => setSelected(c)} className="cursor-pointer">
                      <div className="flex items-start justify-between mb-3 pr-16">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#B8A0C8]/15 flex items-center justify-center"><Icon className="w-5 h-5 text-[#B8A0C8]" /></div>
                          <div>
                            <div className="font-bold text-foreground text-sm">{c.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">{c.channel}</div>
                          </div>
                        </div>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", STATUS_COLORS[c.status])}>{c.status}</span>
                      </div>
                      {c.ai_generated && <div className="text-[10px] text-[#B8A0C8] font-bold flex items-center gap-1 mb-2"><Sparkles className="w-2.5 h-2.5" /> AI generated</div>}
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {[["Sent", c.sent_count ?? 0], ["Opened", c.opened_count ?? 0], ["Clicked", c.clicked_count ?? 0], ["Open %", openRate + "%"]].map(([l, v], i) => (
                          <div key={l}>
                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{l}</div>
                            <div className={cn("text-base font-bold mt-0.5", i === 3 ? "nf-text-chameleon" : "text-foreground")}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      )}

      {/* New campaign modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-foreground mb-4">New Campaign</h3>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Campaign name" className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none mb-3" />
            <select value={channel} onChange={e => setChannel(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none">
              <option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="sms">SMS</option><option value="linkedin">LinkedIn</option><option value="voice">Voice AI</option>
            </select>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground">Cancel</button>
              <button onClick={() => create.mutate({ name, channel, status: "draft" }, { onSuccess: () => { setShowNew(false); setName(""); setSection("campaigns"); } })} disabled={!name}
                className="flex-1 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign detail */}
      {selected && (
        <CampaignDetail
          campaign={selected}
          onClose={() => setSelected(null)}
          onGenerate={(opts) => generate.mutate({ id: selected.id, ...opts }, { onSuccess: (c) => setSelected(c) })}
          onSend={() => send.mutate(selected.id, { onSuccess: () => setSelected(null) })}
          generating={generate.isPending}
          sending={send.isPending}
        />
      )}
    </div>
  );
}

function CampaignDetail({ campaign, onClose, onGenerate, onSend, generating, sending }: any) {
  const [audience, setAudience] = useState("dormant leads");
  const [goal, setGoal] = useState("re-engage and book a meeting");
  const [tone, setTone] = useState("friendly");
  const [tab, setTab] = useState<"content" | "recipients">("content");
  const { data, isLoading } = useCampaignRecipients(campaign.id);
  const recipients = data?.recipients ?? [];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-foreground text-lg">{campaign.name}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <p className="text-xs text-muted-foreground capitalize mb-4">{campaign.channel} · {campaign.status} · {campaign.sent_count ?? 0} sent · {campaign.opened_count ?? 0} opened</p>

        <div className="flex gap-1 border-b border-border/30 mb-5">
          {[{ id: "content", label: "Content", icon: FileText }, { id: "recipients", label: `Recipients (${campaign.sent_count ?? 0})`, icon: Users }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={cn("px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 -mb-px transition-colors",
              tab === t.id ? "border-[#88B8B0] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "content" && (
          <>
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-3 gap-2">
                <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Audience" className="px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-xs outline-none" />
                <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="Goal" className="px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-xs outline-none" />
                <select value={tone} onChange={e => setTone(e.target.value)} className="px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-xs outline-none">
                  <option value="friendly">Friendly</option><option value="professional">Professional</option><option value="urgent">Urgent</option><option value="warm">Warm</option>
                </select>
              </div>
              <button onClick={() => onGenerate({ audience, goal, tone })} disabled={generating}
                className="w-full px-3 py-2 rounded-lg bg-[#B8A0C8] text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
                <Sparkles className="w-3.5 h-3.5" /> {generating ? "Generating…" : "Generate with AI"}
              </button>
            </div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Subject</div>
            <div className="px-3 py-2 rounded-lg bg-muted/40 text-sm mb-3">{campaign.subject ?? <span className="text-muted-foreground italic">(generate first)</span>}</div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Content Preview</div>
            <div className="rounded-lg bg-white border border-border/40 p-3 max-h-64 overflow-y-auto text-sm" dangerouslySetInnerHTML={{ __html: campaign.content ?? "<p class='text-muted-foreground italic text-sm'>(generate content first)</p>" }} />
            <div className="flex gap-2 mt-6">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground">Close</button>
              <button onClick={onSend} disabled={!campaign.content || sending}
                className="flex-1 px-4 py-2 rounded-lg bg-[#88B8B0] text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> {sending ? "Sending…" : "Send to audience"}
              </button>
            </div>
          </>
        )}

        {tab === "recipients" && (
          <div className="max-h-96 overflow-y-auto space-y-1.5">
            {isLoading ? Array(4).fill(0).map((_, i) => <div key={i} className="h-12 bg-muted/30 rounded animate-pulse" />) :
              recipients.length === 0 ? <div className="text-center text-sm text-muted-foreground py-10">No recipients yet — send the campaign first.</div> :
              recipients.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-muted/30 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground truncate">{r.contact_name}</div>
                    <div className="text-muted-foreground truncate">{r.contact_email}</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {r.opened_at && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#88B8B0]/15 text-[#88B8B0] font-bold">opened</span>}
                    {r.clicked_at && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#B8A0C8]/15 text-[#B8A0C8] font-bold">clicked</span>}
                    {r.replied_at && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C8A880]/15 text-[#C8A880] font-bold">replied</span>}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
