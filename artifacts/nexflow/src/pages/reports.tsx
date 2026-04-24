import { useState } from "react";
import { BarChart3, Download, Plus, TrendingUp, Users, Phone, Target, Calendar, ChevronDown, Sparkles, RefreshCw, Filter } from "lucide-react";
import { useAnalytics } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

const REPORT_TEMPLATES = [
  {
    id: "r1", name: "Pipeline Health Report", category: "Sales", icon: TrendingUp, color: "#B8A0C8",
    description: "Stage-by-stage breakdown of deals, conversion rates, and time-in-stage analysis.",
    metrics: ["Total pipeline value", "Deals by stage", "Conversion rates", "Stuck deals (30d+)"],
    lastRun: "2h ago", schedule: "Daily",
  },
  {
    id: "r2", name: "Call Performance Summary", category: "Call Center", icon: Phone, color: "#88B8B0",
    description: "Call volume, outcomes, duration, and AI coaching score trends over time.",
    metrics: ["Total calls", "Outcome breakdown", "Avg duration", "AI score trend"],
    lastRun: "6h ago", schedule: "Weekly",
  },
  {
    id: "r3", name: "Lead Source Analysis", category: "Marketing", icon: Target, color: "#C8A880",
    description: "Where your best leads come from, cost-per-lead, and lead-to-close rates by source.",
    metrics: ["Leads by source", "Conversion by channel", "CPL analysis", "Lead velocity"],
    lastRun: "1d ago", schedule: "Weekly",
  },
  {
    id: "r4", name: "Team Activity Report", category: "Team", icon: Users, color: "#90B8B8",
    description: "Per-rep breakdown of calls made, deals advanced, and pipeline contribution.",
    metrics: ["Calls per rep", "Deals per rep", "Win rate per rep", "Response time"],
    lastRun: "1d ago", schedule: "Weekly",
  },
  {
    id: "r5", name: "Signal Intelligence Report", category: "Intelligence", icon: Sparkles, color: "#B8B880",
    description: "Buying signals captured, signal-to-opportunity conversion, and top signal sources.",
    metrics: ["Signals detected", "Signal score distribution", "Conversion rate", "Top companies"],
    lastRun: "3h ago", schedule: "Daily",
  },
  {
    id: "r6", name: "Monthly Revenue Snapshot", category: "Finance", icon: BarChart3, color: "#C0A0B8",
    description: "Closed won, pipeline value, forecast vs actuals, and month-over-month growth.",
    metrics: ["Revenue closed", "Pipeline value", "Forecast accuracy", "MoM growth"],
    lastRun: "1d ago", schedule: "Monthly",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Sales: "bg-[#B8A0C8]/15 text-[#B8A0C8]",
  "Call Center": "bg-[#88B8B0]/15 text-[#88B8B0]",
  Marketing: "bg-[#C8A880]/15 text-[#C8A880]",
  Team: "bg-[#90B8B8]/15 text-[#90B8B8]",
  Intelligence: "bg-[#B8B880]/15 text-[#B8B880]",
  Finance: "bg-[#C0A0B8]/15 text-[#C0A0B8]",
};

const DATE_RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "This quarter", "Last quarter", "This year"];

export default function ReportsPage() {
  const { data: analyticsData } = useAnalytics();
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [category, setCategory] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState("");
  const [runningReport, setRunningReport] = useState<string | null>(null);

  const categories = Array.from(new Set(REPORT_TEMPLATES.map(r => r.category)));
  const filtered = category ? REPORT_TEMPLATES.filter(r => r.category === category) : REPORT_TEMPLATES;

  const overview = analyticsData?.overview;

  function runReport(id: string) {
    setRunningReport(id);
    setTimeout(() => setRunningReport(null), 1500);
  }

  function generateAiReport() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      setAiReport(`Report generated: "${aiPrompt}"\n\nKey findings:\n• Pipeline velocity has increased 18% this month\n• Top rep Sara Al-Mansouri closed 3 deals worth $63K\n• Funding signals converted at 34% — highest of all signal types\n• WhatsApp response rate 2.4x higher than email for Arabic-speaking contacts\n• Recommendation: Focus call effort on Qualified → Proposal stage (highest stuck rate)`);
      setAiLoading(false);
    }, 2000);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#B8A0C8]" />
            Reports
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Pre-built and AI-generated reports for your sales org</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 text-sm text-foreground cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              className="bg-transparent outline-none text-sm text-foreground"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
            >
              {DATE_RANGES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90">
            <Plus className="w-4 h-4" />
            Custom Report
          </button>
        </div>
      </div>

      {/* KPI bar from live data */}
      {overview && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Pipeline Value", value: `$${(overview.pipelineValue / 1000).toFixed(0)}K`, color: "#B8A0C8", sub: `${overview.openDeals} open deals` },
            { label: "Win Rate", value: `${overview.winRate}%`, color: "#88B8B0", sub: `${overview.closedWon} won this month` },
            { label: "Avg Deal Size", value: `$${overview.avgDealSize?.toLocaleString() ?? 0}`, color: "#C8A880", sub: "per deal" },
            { label: "Total Contacts", value: overview.totalContacts?.toLocaleString(), color: "#90B8B8", sub: `${overview.totalCompanies} companies` },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-2xl p-4">
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-semibold text-foreground/80 mt-0.5">{s.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* AI Report Generator */}
      <div className="glass-card rounded-2xl p-5 border border-[#B8A0C8]/30 bg-[#B8A0C8]/5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#B8A0C8]" />
          <h3 className="font-semibold text-foreground text-sm">AI Report Generator</h3>
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 rounded-lg bg-background/60 border border-border/40 text-sm text-foreground outline-none focus:border-[#B8A0C8]"
            placeholder='Ask anything: "Show me my best-performing reps this quarter" or "Which signal type converts best?"'
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generateAiReport()}
          />
          <button
            onClick={generateAiReport}
            disabled={!aiPrompt.trim() || aiLoading}
            className="px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Generate
          </button>
        </div>
        {aiReport && (
          <div className="mt-3 p-4 rounded-xl bg-background/60 border border-border/30 text-xs text-foreground/80 whitespace-pre-line leading-relaxed">
            {aiReport}
          </div>
        )}
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <button
          onClick={() => setCategory("")}
          className={cn("text-xs px-2.5 py-1 rounded-full font-medium", !category ? "bg-[#B8A0C8]/20 text-[#B8A0C8]" : "bg-muted/50 text-muted-foreground hover:bg-muted")}
        >
          All Reports
        </button>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(cat => cat === c ? "" : c)}
            className={cn("text-xs px-2.5 py-1 rounded-full font-medium", category === c ? (CATEGORY_COLORS[c] ?? "bg-muted text-foreground") : "bg-muted/50 text-muted-foreground hover:bg-muted")}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(r => {
          const Icon = r.icon;
          return (
            <div key={r.id} className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: r.color + "20" }}>
                    <Icon className="w-5 h-5" style={{ color: r.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{r.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", CATEGORY_COLORS[r.category] ?? "bg-muted text-muted-foreground")}>{r.category}</span>
                      <span className="text-[10px] text-muted-foreground">{r.schedule}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground transition-colors" title="Download">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => runReport(r.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg nf-chameleon-bg text-white text-xs font-semibold"
                  >
                    {runningReport === r.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                    {runningReport === r.id ? "Running…" : "Run"}
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-snug mb-3">{r.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {r.metrics.map(m => (
                  <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">{m}</span>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-border/20 text-[10px] text-muted-foreground">
                Last run: <span className="text-foreground/70 font-medium">{r.lastRun}</span>
                <span className="mx-1.5">·</span>
                Scope: <span className="text-foreground/70 font-medium">{dateRange}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
