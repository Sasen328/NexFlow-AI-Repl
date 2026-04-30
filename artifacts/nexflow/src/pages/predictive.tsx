import { useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, Target, Zap, Brain, RefreshCw, ChevronDown, ArrowUp, ArrowDown } from "lucide-react";
import { useContacts, useDeals } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

const CHURN_RISKS = [
  { name: "Khalid Al-Hamdan", company: "Dubai Tech Hub", risk: 78, reason: "No activity 45 days, deal stalled", score: 58, color: "#C8A880" },
  { name: "Tariq Bin-Laden", company: "Gulf Ventures", risk: 65, reason: "Opened only 1 of last 6 emails", score: 74, color: "#B8B880" },
  { name: "Mohammed Al-Otaibi", company: "Aramco Digital", risk: 52, reason: "Missed 2 scheduled calls", score: 71, color: "#B8B880" },
];

const DEAL_FORECASTS = [
  { name: "Gulf Ventures Enterprise", company: "Gulf Ventures", value: 85000, closeProb: 87, closeDate: "May 15", stage: "Negotiation", trend: "up" },
  { name: "Riyadh Capital — 200 Seats", company: "Riyadh Capital", value: 42000, closeProb: 71, closeDate: "Jun 2", stage: "Proposal", trend: "up" },
  { name: "Aramco Digital Pilot", company: "Aramco Digital", value: 120000, closeProb: 58, closeDate: "Jun 28", stage: "Qualified", trend: "stable" },
  { name: "SABIC Solutions License", company: "SABIC Solutions", value: 28000, closeProb: 34, closeDate: "Jul 10", stage: "Lead", trend: "down" },
];

const NEXT_BEST_ACTIONS = [
  { contact: "Sara Al-Mansouri", action: "Send updated ROI calculator", urgency: "Today", reason: "Opened proposal 3x yesterday — buying signal detected", score: 92, color: "#88B8B0" },
  { contact: "Ahmed Al-Rashidi", action: "Schedule legal review call", urgency: "This week", reason: "MSA reviewed — decision window open", score: 87, color: "#B8A0C8" },
  { contact: "Mohammed Al-Otaibi", action: "Send enterprise deck urgently", urgency: "Today", reason: "Budget approved — time-sensitive opportunity", score: 71, color: "#C8A880" },
  { contact: "Nora Al-Faisal", action: "Re-engage with Arabic outreach", urgency: "Next week", reason: "Language preference signal detected from WhatsApp patterns", score: 82, color: "#90B8B8" },
];

const FORECAST_SUMMARY = [
  { label: "Best Case", value: "$412K", sub: "If all high-prob deals close", color: "#88B8B0" },
  { label: "Commit", value: "$267K", sub: "70%+ probability deals", color: "#B8A0C8" },
  { label: "Worst Case", value: "$148K", sub: "Deals at 85%+ probability", color: "#C8A880" },
];

export default function PredictivePage() {
  const [aiQuery, setAiQuery] = useState("");

  // The "Ask AI" box on this page is a thin entry point — it dispatches the
  // typed query to the unified multi-agent assistant bubble (same engine
  // everywhere in the app). The bubble opens and answers in-place so the
  // user has one consistent AI surface, not a per-page widget.
  function runAiQuery() {
    const text = aiQuery.trim();
    if (!text) return;
    window.dispatchEvent(new CustomEvent("nf:open-assistant", { detail: { text } }));
    setAiQuery("");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#B8A0C8]" />
            Predictive Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">AI-powered forecasting, churn risk, and next-best-action recommendations</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-[#B8A0C8]" />
          Models updated 2h ago
        </div>
      </div>

      {/* AI Query */}
      <div className="glass-card rounded-2xl p-5 border border-[#B8A0C8]/30 bg-[#B8A0C8]/5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-[#B8A0C8]" />
          <h3 className="font-semibold text-sm text-foreground">Ask the AI Forecaster</h3>
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 rounded-lg bg-background/60 border border-border/40 text-sm outline-none text-foreground focus:border-[#B8A0C8]"
            placeholder='e.g. "Will we hit Q2 quota?" or "Which deals are at risk?"'
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runAiQuery()}
          />
          <button
            onClick={runAiQuery}
            disabled={!aiQuery.trim()}
            className="px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask AI
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 ml-1">Opens in the AI Assistant — powered by the multi-agent engine.</p>
      </div>

      {/* Forecast bands */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#88B8B0]" />
          Q2 Revenue Forecast
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {FORECAST_SUMMARY.map(s => (
            <div key={s.label} className="glass-card rounded-2xl p-5 text-center">
              <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">{s.label}</div>
              <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Deal probability forecast */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#B8A0C8]" />
            Deal Win Probability
          </h2>
          <div className="space-y-2.5">
            {DEAL_FORECASTS.map(d => (
              <div key={d.name} className="glass-card rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.company} · {d.stage}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <span
                        className="text-lg font-black"
                        style={{ color: d.closeProb >= 70 ? "#88B8B0" : d.closeProb >= 50 ? "#B8B880" : "#C8A880" }}
                      >
                        {d.closeProb}%
                      </span>
                      {d.trend === "up" && <ArrowUp className="w-3 h-3 text-[#88B8B0]" />}
                      {d.trend === "down" && <ArrowDown className="w-3 h-3 text-[#C8A880]" />}
                    </div>
                    <div className="text-xs text-muted-foreground">${d.value.toLocaleString()}</div>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${d.closeProb}%`,
                      background: d.closeProb >= 70 ? "#88B8B0" : d.closeProb >= 50 ? "#B8B880" : "#C8A880"
                    }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1.5">Projected close: {d.closeDate}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Churn risk */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C8A880]" />
            Churn Risk Alerts
          </h2>
          <div className="space-y-2.5">
            {CHURN_RISKS.map(r => (
              <div key={r.name} className="glass-card rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.company}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-black" style={{ color: r.color }}>{r.risk}%</div>
                    <div className="text-[10px] text-muted-foreground">churn risk</div>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden mb-2">
                  <div className="h-full rounded-full" style={{ width: `${r.risk}%`, background: r.color }} />
                </div>
                <p className="text-[10px] text-muted-foreground">{r.reason}</p>
                <button className="mt-2 text-xs font-semibold text-[#B8A0C8] hover:underline">Re-engage now →</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Best Actions */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#B8B880]" />
          Next Best Actions
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {NEXT_BEST_ACTIONS.map(a => (
            <div key={a.contact} className="glass-card rounded-xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: a.color }}>
                {a.contact.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-foreground truncate">{a.contact}</div>
                  <span
                    className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0",
                      a.urgency === "Today" ? "bg-[#C8A880]/20 text-[#C8A880]" : "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {a.urgency}
                  </span>
                </div>
                <div className="text-xs font-medium text-foreground/80 mt-0.5">{a.action}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{a.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
