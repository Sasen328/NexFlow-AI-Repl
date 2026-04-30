import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Eye, Send, MousePointerClick, Reply, FormInput, Globe, Heart, Flame,
  TrendingUp, TrendingDown, Linkedin, Twitter, Instagram, Facebook,
  MessageSquare, Mail, ChevronDown, Sparkles, AlertCircle, ArrowRight,
  Phone, Lightbulb, Bot, RefreshCw, Loader2,
} from "lucide-react";
import { apiFetch } from "@/hooks/useApi";

type Campaign = {
  id: string; name: string; status: string;
  channels: string[];
  sent: number; opens: number; clicks: number; replies: number;
  forms: number; site_visits: number; reactions: number;
  conversions: number; cost_usd: number; revenue_usd: number;
  last_published: string;
  benchmark: { name: string; perf: number }[];
  ai_suggestions: string[];
  hot_leads: { id: string; name: string; company: string; signal: string; score: number; channel: string; last: string }[];
};

const CHANNEL_META: Record<string, { icon: any; color: string; label: string }> = {
  linkedin:  { icon: Linkedin,      color: "#0A66C2", label: "LinkedIn" },
  x:         { icon: Twitter,       color: "#000000", label: "X" },
  instagram: { icon: Instagram,     color: "#E4405F", label: "Instagram" },
  facebook:  { icon: Facebook,      color: "#1877F2", label: "Facebook" },
  whatsapp:  { icon: MessageSquare, color: "#25D366", label: "WhatsApp" },
  email:     { icon: Mail,          color: "#88B8B0", label: "Email" },
  sms:       { icon: MessageSquare, color: "#A090C8", label: "SMS" },
};

const FALLBACK_CAMPAIGNS: Campaign[] = [
  {
    id: "c1", name: "Q4 GCC Enterprise Push", status: "live",
    channels: ["linkedin", "email", "whatsapp"],
    sent: 8420, opens: 3984, clicks: 612, replies: 184, forms: 47, site_visits: 1820, reactions: 342,
    conversions: 38, cost_usd: 4200, revenue_usd: 184000,
    last_published: "2 days ago",
    benchmark: [
      { name: "Industry avg open", perf: 28 },
      { name: "Your last campaign", perf: 41 },
      { name: "This campaign", perf: 47 },
    ],
    ai_suggestions: [
      "Open rate is 47% — top quartile. Push Wed 10am send to lock in compounding effect.",
      "WhatsApp reply rate (4.8%) is 2× industry — invest in additional sequence steps for nurturing.",
      "LinkedIn engagement on Day 3 dropped 18% — refresh creative with shorter form video.",
    ],
    hot_leads: [
      { id: "l1", name: "Layla Al-Mutairi", company: "Riyadh Bank", signal: "Opened pricing 4× + booked demo", score: 96, channel: "Web + Form", last: "8m" },
      { id: "l2", name: "Marcus Chen", company: "SkyDeals MENA", signal: "Replied to WhatsApp campaign", score: 94, channel: "WhatsApp", last: "12m" },
      { id: "l3", name: "Hassan Khalifa", company: "GulfNet", signal: "3 LinkedIn views in 1h", score: 91, channel: "LinkedIn", last: "18m" },
    ],
  },
  {
    id: "c2", name: "Riyadh Roadshow Promo", status: "scheduled",
    channels: ["instagram", "whatsapp", "sms"],
    sent: 2120, opens: 894, clicks: 211, replies: 38, forms: 12, site_visits: 612, reactions: 124,
    conversions: 9, cost_usd: 1800, revenue_usd: 42000,
    last_published: "Scheduled in 3 hours",
    benchmark: [
      { name: "Industry avg open", perf: 31 },
      { name: "Your last campaign", perf: 38 },
      { name: "This campaign", perf: 42 },
    ],
    ai_suggestions: [
      "Localised Arabic creative is performing 38% better than English for KSA — keep Arabic-first.",
      "SMS click rate (1.2%) is below benchmark — try a stronger CTA with limited-time offer.",
      "Add a 'Add to wallet' CTA for the event ticket — proven 3× conversion lift.",
    ],
    hot_leads: [
      { id: "l4", name: "Sara Al-Otaibi", company: "Aramco Digital", signal: "Forwarded last invite to 2 colleagues", score: 89, channel: "Email", last: "26m" },
      { id: "l5", name: "Omar Farouk", company: "Cairo Tech Group", signal: "Multiple visits + form fill", score: 87, channel: "Web", last: "33m" },
    ],
  },
  {
    id: "c3", name: "FinTech Cross-Sell — Tier 1", status: "live",
    channels: ["email", "linkedin"],
    sent: 5640, opens: 1912, clicks: 268, replies: 62, forms: 18, site_visits: 720, reactions: 88,
    conversions: 14, cost_usd: 2100, revenue_usd: 96000,
    last_published: "5 days ago",
    benchmark: [
      { name: "Industry avg open", perf: 28 },
      { name: "Your last campaign", perf: 41 },
      { name: "This campaign", perf: 34 },
    ],
    ai_suggestions: [
      "Open rate dropped 7 pts vs your last campaign — likely deliverability. Pre-warm secondary domain.",
      "LinkedIn Sponsored Content is converting at 2.1% — increase budget by 30%.",
      "Add a 5-step nurture sequence for non-responders — historical conversion rate 11%.",
    ],
    hot_leads: [
      { id: "l6", name: "Fatima Al-Sayed", company: "Doha Capital", signal: "Replied + scheduled call", score: 88, channel: "Email", last: "44m" },
    ],
  },
];

export default function CampaignPerformancePage() {
  const [campaigns] = useState<Campaign[]>(FALLBACK_CAMPAIGNS);
  const [selectedId, setSelectedId] = useState<string>(FALLBACK_CAMPAIGNS[0].id);
  const [aiLoading, setAiLoading] = useState(false);
  const [refreshedSuggestions, setRefreshedSuggestions] = useState<Record<string, string[]>>({});

  const c = useMemo(() => campaigns.find((x) => x.id === selectedId)!, [campaigns, selectedId]);

  async function refreshAi() {
    setAiLoading(true);
    try {
      const r: any = await apiFetch("/marketing/assistant-chat", {
        method: "POST",
        body: JSON.stringify({
          message: `Campaign "${c.name}" stats: ${c.sent} sent, ${c.opens} opens, ${c.clicks} clicks, ${c.replies} replies, ${c.conversions} conversions, $${c.cost_usd} spent, $${c.revenue_usd} revenue, channels=${c.channels.join(",")}.
Return ONLY a strict JSON array of 3 short, specific, action-oriented improvement suggestions (each ≤22 words). Format:
{"suggestions": ["...", "...", "..."]}`,
          history: [],
        }),
      });
      const reply = (r?.reply ?? "").trim();
      const match = reply.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed.suggestions)) {
          setRefreshedSuggestions((prev) => ({ ...prev, [c.id]: parsed.suggestions.slice(0, 4).map(String) }));
        }
      }
    } catch {/* ignore */} finally {
      setAiLoading(false);
    }
  }

  const suggestions = refreshedSuggestions[c.id] ?? c.ai_suggestions;
  const openRate = c.sent ? Math.round((c.opens / c.sent) * 1000) / 10 : 0;
  const clickRate = c.sent ? Math.round((c.clicks / c.sent) * 1000) / 10 : 0;
  const replyRate = c.sent ? Math.round((c.replies / c.sent) * 1000) / 10 : 0;
  const roi = c.cost_usd ? Math.round((c.revenue_usd / c.cost_usd) * 10) / 10 : 0;

  return (
    <div className="p-5 space-y-4">
      {/* ── Header + selector ──────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white"/>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Campaign Performance</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold uppercase border border-[#88B8B0]/30">Per campaign</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            Pick a campaign to see channels published, KPIs, hot leads, and AI suggestions.
          </p>
        </div>
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="appearance-none pl-3 pr-9 py-2 rounded-lg text-sm font-semibold border border-[#C8A880]/40 bg-background hover:bg-[#C8A880]/5 cursor-pointer min-w-[280px]"
          >
            {campaigns.map((cc) => (
              <option key={cc.id} value={cc.id}>{cc.name} — {cc.status}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"/>
        </div>
      </div>

      {/* ── Top: campaign meta ─────────────────────────────── */}
      <div className="glass-card rounded-2xl p-4 border border-border/40">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
              c.status === "live" ? "bg-[#88B8B0]/15 text-[#88B8B0] border-[#88B8B0]/30" :
              c.status === "scheduled" ? "bg-[#C8A880]/15 text-[#C8A880] border-[#C8A880]/30" :
              "bg-muted text-muted-foreground border-border/40"
            }`}>{c.status}</span>
            <span className="text-sm text-muted-foreground">Last published: {c.last_published}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Channels published:</span>
            {c.channels.map((ch) => {
              const m = CHANNEL_META[ch];
              if (!m) return null;
              const Icon = m.icon;
              return (
                <span key={ch} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border" style={{ borderColor: `${m.color}40`, background: `${m.color}10`, color: m.color }}>
                  <Icon className="w-3 h-3"/> {m.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── KPI grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-3">
        <Kpi icon={Send} label="Sent" value={c.sent.toLocaleString()} accent="#A090C8"/>
        <Kpi icon={Eye} label="Opens" value={c.opens.toLocaleString()} sub={`${openRate}%`} accent="#88B8B0"/>
        <Kpi icon={MousePointerClick} label="Clicks" value={c.clicks.toLocaleString()} sub={`${clickRate}%`} accent="#C8A880"/>
        <Kpi icon={Reply} label="Replies" value={c.replies.toLocaleString()} sub={`${replyRate}%`} accent="#B8A0C8"/>
        <Kpi icon={FormInput} label="Forms" value={c.forms.toLocaleString()} accent="#C0A0B8"/>
        <Kpi icon={Globe} label="Site visits" value={c.site_visits.toLocaleString()} accent="#90B8B8"/>
        <Kpi icon={Heart} label="Reactions" value={c.reactions.toLocaleString()} accent="#A090C8"/>
      </div>

      {/* ── ROI strip ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-4 border border-border/40">
          <div className="text-[11px] uppercase font-semibold text-muted-foreground">Conversions</div>
          <div className="text-2xl font-bold">{c.conversions}</div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-border/40">
          <div className="text-[11px] uppercase font-semibold text-muted-foreground">Cost / Revenue</div>
          <div className="text-lg font-bold">${c.cost_usd.toLocaleString()} → <span className="text-[#88B8B0]">${c.revenue_usd.toLocaleString()}</span></div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[#88B8B0]/40 bg-[#88B8B0]/5">
          <div className="text-[11px] uppercase font-semibold text-muted-foreground">ROI</div>
          <div className="text-2xl font-bold text-[#88B8B0] flex items-center gap-2">
            {roi}× <TrendingUp className="w-4 h-4"/>
          </div>
        </div>
      </div>

      {/* ── Hot lead alerts (per campaign) ─────────────────── */}
      {c.hot_leads.length > 0 && (
        <div className="glass-card rounded-2xl border border-[#FF6B6B]/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2 bg-[#FF6B6B]/5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B6B]/20 flex items-center justify-center animate-pulse">
              <Flame className="w-4 h-4 text-[#FF6B6B]"/>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold">Hot leads from this campaign — {c.hot_leads.length} digitally active</div>
              <div className="text-[11px] text-muted-foreground">Reps must contact within 60 minutes for best conversion.</div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#FF6B6B]/20 text-[#FF6B6B] text-[10px] font-bold uppercase border border-[#FF6B6B]/40">URGENT</span>
          </div>
          <div className="divide-y divide-border/20">
            {c.hot_leads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FF6B6B]/5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C8A880] to-[#B8A0C8] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {lead.name.split(" ").map(s => s[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold truncate">{lead.name}</div>
                    <div className="text-xs text-muted-foreground truncate">· {lead.company}</div>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{lead.signal}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-[#FF6B6B]">{lead.score}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">{lead.last}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-1.5 py-0.5 rounded bg-muted/50 text-[10px] font-semibold uppercase">{lead.channel}</span>
                  <button className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-white nf-chameleon-bg shadow-sm" title="Notify rep & call now">
                    <Phone className="w-3 h-3"/> Alert rep
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Two-column: AI suggestions + benchmarks ────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 glass-card rounded-2xl p-4 border border-[#C8A880]/30 bg-[#C8A880]/5">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-[#C8A880]"/>
            <div className="text-sm font-bold">AI improvement suggestions</div>
            <span className="px-1.5 py-0.5 rounded bg-[#C8A880]/20 text-[#C8A880] text-[9px] font-bold uppercase border border-[#C8A880]/40">
              {refreshedSuggestions[c.id] ? "Live" : "Sample"}
            </span>
            <button
              onClick={refreshAi} disabled={aiLoading}
              className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold text-white nf-chameleon-bg shadow-sm disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCw className="w-3 h-3"/>}
              Re-analyse
            </button>
          </div>
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed">
                <Lightbulb className="w-3.5 h-3.5 text-[#C8A880] shrink-0 mt-0.5"/>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border/40">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#88B8B0]"/>
            <div className="text-sm font-bold">Benchmark</div>
          </div>
          <div className="space-y-2">
            {c.benchmark.map((b, i) => (
              <div key={i}>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-muted-foreground">{b.name}</span>
                  <span className="font-bold">{b.perf}%</span>
                </div>
                <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(b.perf, 100)}%`, background: i === c.benchmark.length - 1 ? "#88B8B0" : "#C8A880" }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer link ─────────────────────────────────────── */}
      <div className="glass-panel p-3 text-xs text-muted-foreground flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-[#C8A880]"/>
        <span>Need to launch a new campaign?</span>
        <Link href="/campaign-builder" className="font-bold text-[#C8A880] hover:underline flex items-center gap-1">
          Open Campaign Builder <ArrowRight className="w-3 h-3"/>
        </Link>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, accent }: any) {
  return (
    <div className="glass-card rounded-2xl p-3 border border-border/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10" style={{ background: accent, filter: "blur(15px)" }}/>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5" style={{ color: accent }}/>
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</div>
      </div>
      <div className="text-lg font-bold">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
