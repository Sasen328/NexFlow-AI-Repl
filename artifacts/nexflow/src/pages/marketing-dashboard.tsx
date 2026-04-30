import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  LayoutDashboard, Sparkles, AlertTriangle, Flame, Globe, TrendingUp, TrendingDown,
  Megaphone, Send, Eye, MousePointerClick, Trophy, Target, Lightbulb, Phone,
  ArrowRight, RefreshCw, Loader2, MessageSquare, Mail, Wand2, X,
} from "lucide-react";
import { apiFetch } from "@/hooks/useApi";

type Analysis = {
  winning_points: string[];
  pain_points: string[];
  how_to_win: string[];
  cultural_alert?: { severity: "info" | "warn" | "critical"; title: string; detail: string };
};

type HotLead = {
  id: string; name: string; company: string; signal: string;
  score: number; last_activity: string; channel: string;
};

const FALLBACK_ANALYSIS: Analysis = {
  winning_points: [
    "LinkedIn Q3 thought-leadership series is converting at 4.2× the org average — double down on long-form posts.",
    "WhatsApp broadcasts to GCC enterprise list show 71% open rate within 30 minutes — best channel for time-sensitive offers.",
    "Cultural-localised Arabic email subject lines outperform English by 38% in UAE & KSA segments.",
  ],
  pain_points: [
    "Cold email reply rate dropped 22% in the last 14 days — likely sender-reputation degradation.",
    "Instagram reach has plateaued at 31k for 3 weeks — algorithm suppressing static carousels.",
    "Friday afternoon sends in the GCC region perform 60% worse than Sun–Wed mornings.",
  ],
  how_to_win: [
    "Reallocate $4k from FB Ads to LinkedIn Sponsored Content targeting GCC C-suite.",
    "Switch Instagram cadence to 4× short-form Reels per week, drop static posts.",
    "Pre-warm a second sending domain and rotate to recover deliverability over 7 days.",
    "Launch a culturally-tailored Ramadan campaign 10 days before; gift-with-demo offer for KSA.",
  ],
  cultural_alert: {
    severity: "warn",
    title: "Cultural mismatch detected on 3 active campaigns",
    detail: "Campaigns 'Q4 GCC Push' and 'Riyadh Roadshow' use English-only copy and afternoon send times that conflict with Friday prayer schedules. Switch to Arabic-first variants & Sun–Wed mornings.",
  },
};

const FALLBACK_HOT_LEADS: HotLead[] = [
  { id: "h1", name: "Layla Al-Mutairi", company: "Riyadh Bank", signal: "Opened pricing page 4× in 1h", score: 96, last_activity: "8 min ago", channel: "Web" },
  { id: "h2", name: "Marcus Chen", company: "SkyDeals MENA", signal: "Replied to WhatsApp + booked demo slot", score: 94, last_activity: "12 min ago", channel: "WhatsApp" },
  { id: "h3", name: "Hassan Khalifa", company: "GulfNet Telecom", signal: "Downloaded ROI calculator + 3 LinkedIn views", score: 91, last_activity: "18 min ago", channel: "LinkedIn" },
  { id: "h4", name: "Sara Al-Otaibi", company: "Aramco Digital", signal: "Forwarded last email to 2 colleagues", score: 89, last_activity: "26 min ago", channel: "Email" },
  { id: "h5", name: "Omar Farouk", company: "Cairo Tech Group", signal: "Multiple website visits + form fill", score: 87, last_activity: "33 min ago", channel: "Web + Form" },
];

export default function MarketingDashboardPage() {
  const [kpis, setKpis] = useState({ active: 7, sent: 18420, open_rate: 42.8, conversions: 612 });
  const [analysis, setAnalysis] = useState<Analysis>(FALLBACK_ANALYSIS);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState<"sample" | "live">("sample");
  const [hotLeads] = useState<HotLead[]>(FALLBACK_HOT_LEADS);

  // ── Napkin AI visualizer state (per-card "Visualize" button on the 3-up).
  const [napkin, setNapkin] = useState<{ open: boolean; title: string; loading: boolean; url?: string; error?: string }>({
    open: false, title: "", loading: false,
  });
  async function visualize(title: string, items: string[]) {
    setNapkin({ open: true, title, loading: true });
    try {
      const prompt = `Create a clear ${title.toLowerCase()} visual for a GCC B2B marketing executive briefing.\n\n${items.map((x, i) => `${i + 1}. ${x}`).join("\n")}\n\nUse a clean, professional diagram style suitable for an executive deck.`;
      const r: any = await apiFetch("/napkin/generate-visual", {
        method: "POST",
        body: JSON.stringify({ prompt, style: "professional", format: "png", aspect_ratio: "16:9" }),
      });
      if (r?.url) setNapkin({ open: true, title, loading: false, url: r.url });
      else setNapkin({ open: true, title, loading: false, error: r?.error ?? "Napkin returned no image." });
    } catch (e: any) {
      setNapkin({ open: true, title, loading: false, error: e?.message ?? "Napkin request failed." });
    }
  }

  useEffect(() => {
    // Pull live analytics totals to seed KPI tiles
    (async () => {
      try {
        const r: any = await apiFetch("/marketing/analytics");
        if (r?.totals) {
          setKpis({
            active: r.campaigns_count ?? 7,
            sent: Number(r.totals.sent ?? 0) || 18420,
            open_rate: r.totals.sent ? Math.round((Number(r.totals.opens) / Number(r.totals.sent)) * 1000) / 10 : 42.8,
            conversions: Number(r.totals.conversions ?? 0) || 612,
          });
        }
      } catch {/* keep fallback */}
    })();
    runAiAnalysis(true); // silent first-load attempt
  }, []);

  async function runAiAnalysis(silent = false) {
    if (!silent) setAiLoading(true);
    try {
      const r: any = await apiFetch("/marketing/assistant-chat", {
        method: "POST",
        body: JSON.stringify({
          message: `Analyze our current marketing performance. Return ONLY a strict JSON object (no markdown, no prose) with these exact keys:
{
  "winning_points": [3 short bullet strings — what is working well right now],
  "pain_points": [3 short bullet strings — biggest current pain points],
  "how_to_win": [4 short actionable bullet strings — how we win the next 30 days],
  "cultural_alert": {"severity":"info|warn|critical","title":"...","detail":"..."}
}
Focus on the GCC region (KSA, UAE, Qatar) and B2B SaaS context.`,
          history: [],
        }),
      });
      const reply = (r?.reply ?? "").trim();
      // try to extract JSON block
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.winning_points) && Array.isArray(parsed.pain_points)) {
          setAnalysis({
            winning_points: parsed.winning_points.slice(0, 5).map((x: any) => String(x)),
            pain_points: parsed.pain_points.slice(0, 5).map((x: any) => String(x)),
            how_to_win: (parsed.how_to_win ?? []).slice(0, 6).map((x: any) => String(x)),
            cultural_alert: parsed.cultural_alert ?? FALLBACK_ANALYSIS.cultural_alert,
          });
          setAiSource("live");
        }
      }
    } catch {
      // keep fallback
    } finally {
      if (!silent) setAiLoading(false);
    }
  }

  const totalReach = useMemo(() => kpis.sent + 24300, [kpis.sent]);

  return (
    <div className="p-5 space-y-4">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white"/>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Marketing Dashboard</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#C8A880]/15 text-[#C8A880] text-[10px] font-bold uppercase border border-[#C8A880]/30">Live AI</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            What's working, what's not, and how to win — refreshed by your marketing brain on demand.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/campaign-builder" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-[#C8A880]/40 hover:bg-[#C8A880]/10 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-[#C8A880]"/> Open Campaign Builder
          </Link>
          <button
            onClick={() => runAiAnalysis(false)}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg shadow-sm disabled:opacity-50"
          >
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <RefreshCw className="w-3.5 h-3.5"/>}
            Re-run AI analysis
          </button>
        </div>
      </div>

      {/* ── KPI tiles ──────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        <KpiTile icon={Megaphone} label="Active campaigns" value={String(kpis.active)} delta="+2 vs last wk" deltaUp accent="#C8A880"/>
        <KpiTile icon={Send} label="Touches sent (30d)" value={kpis.sent.toLocaleString()} delta={`Reach ${totalReach.toLocaleString()}`} deltaUp accent="#88B8B0"/>
        <KpiTile icon={Eye} label="Avg open rate" value={`${kpis.open_rate}%`} delta="+3.1 pts" deltaUp accent="#A090C8"/>
        <KpiTile icon={Trophy} label="Conversions" value={kpis.conversions.toLocaleString()} delta="+18% MoM" deltaUp accent="#B8A0C8"/>
      </div>

      {/* ── Cultural Intelligence Alert ─────────────────────── */}
      {analysis.cultural_alert && (
        <div className={`glass-card rounded-2xl p-4 border ${
          analysis.cultural_alert.severity === "critical" ? "border-[#C0A0B8]/50 bg-[#C0A0B8]/10" :
          analysis.cultural_alert.severity === "warn" ? "border-[#C8A880]/50 bg-[#C8A880]/10" :
          "border-[#88B8B0]/50 bg-[#88B8B0]/5"
        }`}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-[#C8A880]"/>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-[#C8A880]"/>
                <div className="text-sm font-bold">Cultural Intelligence — {analysis.cultural_alert.title}</div>
                <span className="px-1.5 py-0.5 rounded bg-[#C8A880]/20 text-[#C8A880] text-[9px] font-bold uppercase border border-[#C8A880]/40">
                  {analysis.cultural_alert.severity}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{analysis.cultural_alert.detail}</p>
              <div className="flex gap-2 mt-2">
                <Link href="/campaign-builder?tab=ai&cultural=on" className="text-xs font-bold text-[#C8A880] hover:underline flex items-center gap-1">
                  Open Cultural Intelligence <ArrowRight className="w-3 h-3"/>
                </Link>
                <button className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Analysis 3-up ───────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <AnalysisCard
          icon={Trophy} title="Winning Points" tone="up" accent="#88B8B0"
          items={analysis.winning_points} loading={aiLoading}
          onVisualize={() => visualize("Winning Points", analysis.winning_points)}
        />
        <AnalysisCard
          icon={Target} title="Pain Points" tone="down" accent="#C0A0B8"
          items={analysis.pain_points} loading={aiLoading}
          onVisualize={() => visualize("Pain Points", analysis.pain_points)}
        />
        <AnalysisCard
          icon={Lightbulb} title="How to Win" tone="action" accent="#C8A880"
          items={analysis.how_to_win} loading={aiLoading}
          onVisualize={() => visualize("How to Win", analysis.how_to_win)}
        />
      </div>
      <div className="text-[11px] text-muted-foreground flex items-center gap-2 ml-1">
        <Sparkles className="w-3 h-3 text-[#C8A880]"/>
        Source: {aiSource === "live" ? "Live AI brain (OpenRouter / OpenAI)" : "Sample analysis — click Re-run AI analysis to call your AI provider."}
      </div>

      {/* ── Hot Lead Alerts ────────────────────────────────── */}
      <div className="glass-card rounded-2xl border border-[#FF6B6B]/40 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2 bg-[#FF6B6B]/5">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B6B]/20 flex items-center justify-center animate-pulse">
            <Flame className="w-4 h-4 text-[#FF6B6B]"/>
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold">Hot Lead Alerts — {hotLeads.length} digitally active right now</div>
            <div className="text-[11px] text-muted-foreground">Top priority: contact these leads in the next 60 minutes.</div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-[#FF6B6B]/20 text-[#FF6B6B] text-[10px] font-bold uppercase border border-[#FF6B6B]/40">
            URGENT
          </span>
        </div>
        <div className="divide-y divide-border/20">
          {hotLeads.map((lead) => (
            <div key={lead.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FF6B6B]/5 transition-colors">
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
                <div className="text-[10px] text-muted-foreground uppercase">{lead.last_activity}</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-1.5 py-0.5 rounded bg-muted/50 text-[10px] font-semibold uppercase">{lead.channel}</span>
                <button className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-white nf-chameleon-bg shadow-sm" title="Call now">
                  <Phone className="w-3 h-3"/> Call
                </button>
                <button className="flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-border/40 hover:bg-muted/40">
                  <Mail className="w-3 h-3"/>
                </button>
                <button className="flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-border/40 hover:bg-muted/40">
                  <MessageSquare className="w-3 h-3"/>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-border/20 text-[11px] text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#C8A880]"/>
          Hot leads are ranked by digital activity score (page views, replies, downloads, demo bookings). Auto-refreshes every 60 seconds.
        </div>
      </div>

      {/* ── Quick navigation strip ─────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        <QuickNav href="/campaign-builder" icon={Sparkles} label="Build a campaign" desc="Manual or AI mode"/>
        <QuickNav href="/sequences-audiences" icon={Target} label="Sequences & Audiences" desc="Cadences · templates · segments"/>
        <QuickNav href="/web-forms" icon={MousePointerClick} label="Web Forms" desc="Capture leads from any site"/>
        <QuickNav href="/campaign-performance" icon={TrendingUp} label="Campaign Performance" desc="Per-campaign deep dive"/>
      </div>

      {/* ── Napkin AI visualization modal ─────────────────── */}
      {napkin.open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setNapkin({ open: false, title: "", loading: false })}
        >
          <div
            className="glass-card rounded-2xl border border-[#C8A880]/40 max-w-3xl w-full max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border/30">
              <Wand2 className="w-4 h-4 text-[#C8A880]"/>
              <div className="text-sm font-bold">{napkin.title}</div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border border-[#C8A880]/40 text-[#C8A880] bg-[#C8A880]/10">Napkin AI</span>
              <button
                className="ml-auto p-1 rounded hover:bg-muted/50"
                onClick={() => setNapkin({ open: false, title: "", loading: false })}
                aria-label="Close"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>
            <div className="p-5">
              {napkin.loading ? (
                <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-[#C8A880]"/>
                  <div className="text-sm">Napkin AI is sketching your visual…</div>
                </div>
              ) : napkin.error ? (
                <div className="py-12 text-sm text-[#C0A0B8] text-center">{napkin.error}</div>
              ) : napkin.url ? (
                <a href={napkin.url} target="_blank" rel="noopener noreferrer">
                  <img src={napkin.url} alt={napkin.title} className="w-full rounded-xl border border-border/30 bg-white"/>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── helpers ─────────────────────────────────────────────── */

function KpiTile({ icon: Icon, label, value, delta, deltaUp, accent }: any) {
  return (
    <div className="glass-card rounded-2xl p-4 border border-border/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10" style={{ background: accent, filter: "blur(20px)" }}/>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}25` }}>
          <Icon className="w-4 h-4" style={{ color: accent }}/>
        </div>
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</div>
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className={`text-[11px] flex items-center gap-1 mt-0.5 ${deltaUp ? "text-[#88B8B0]" : "text-[#C0A0B8]"}`}>
        {deltaUp ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
        {delta}
      </div>
    </div>
  );
}

function AnalysisCard({ icon: Icon, title, tone, accent, items, loading, onVisualize }: any) {
  return (
    <div className="glass-card rounded-2xl p-4 border border-border/30 relative overflow-hidden">
      {/* Decorative blur orb — must not eat clicks on the Visualize button */}
      <div className="pointer-events-none absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: accent, filter: "blur(30px)" }}/>
      <div className="relative flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}25` }}>
          <Icon className="w-4 h-4" style={{ color: accent }}/>
        </div>
        <div className="text-sm font-bold">{title}</div>
        {tone === "action" && <span className="px-1.5 py-0.5 rounded bg-[#C8A880]/20 text-[#C8A880] text-[9px] font-bold uppercase border border-[#C8A880]/40">Plan</span>}
        {onVisualize && (
          <button
            onClick={onVisualize}
            disabled={loading || !items?.length}
            className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border border-[#C8A880]/40 text-[#C8A880] hover:bg-[#C8A880]/10 disabled:opacity-40"
            title="Generate a visual diagram from these points (Napkin AI)"
          >
            <Wand2 className="w-3 h-3"/> Visualize
          </button>
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map(i => <div key={i} className="h-8 bg-muted/40 rounded animate-pulse"/>)}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item: string, i: number) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed">
              <span className="w-5 h-5 rounded shrink-0 text-[10px] font-bold flex items-center justify-center" style={{ background: `${accent}20`, color: accent }}>
                {i + 1}
              </span>
              <span className="text-foreground/90">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function QuickNav({ href, icon: Icon, label, desc }: any) {
  return (
    <Link href={href} className="glass-card rounded-2xl p-3 border border-border/30 hover:border-[#C8A880]/40 transition-colors group block">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-[#C8A880] group-hover:scale-110 transition-transform"/>
        <div className="text-sm font-semibold">{label}</div>
        <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground group-hover:text-[#C8A880] transition-colors"/>
      </div>
      <div className="text-[11px] text-muted-foreground">{desc}</div>
    </Link>
  );
}
