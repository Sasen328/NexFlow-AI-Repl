import { useState } from "react";
import { BookOpen, Shield, BookText, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ScriptsPage from "@/pages/scripts";
import PlaybooksPage from "@/pages/playbooks";

/**
 * Call Center → Knowledge Base — consolidates Scripts, Objection Handler,
 * Playbooks, and Company Insights into one page with sub-tabs.
 */
type Tab = "scripts" | "objections" | "playbooks" | "company";

export default function CallCenterKnowledgeBasePage() {
  const [tab, setTab] = useState<Tab>("scripts");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Knowledge Base</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Scripts, objection handlers, playbooks, and company insights in one place.
          </p>
        </div>
        <div className="inline-flex p-1 rounded-xl bg-muted/40 border border-border/40 flex-wrap">
          <KbTab label="Scripts"    icon={BookOpen}  active={tab === "scripts"}    onClick={() => setTab("scripts")} />
          <KbTab label="Objections" icon={Shield}    active={tab === "objections"} onClick={() => setTab("objections")} />
          <KbTab label="Playbooks"  icon={BookText}  active={tab === "playbooks"}  onClick={() => setTab("playbooks")} />
          <KbTab label="Company"    icon={Building2} active={tab === "company"}    onClick={() => setTab("company")} />
        </div>
      </div>

      {tab === "scripts"    && <ScriptsPage />}
      {tab === "objections" && <ObjectionsView />}
      {tab === "playbooks"  && <PlaybooksPage />}
      {tab === "company"    && <CompanyInsightsView />}
    </div>
  );
}

function KbTab({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
        active ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

const OBJECTIONS = [
  {
    objection: "Price — \"You're more expensive than HubSpot\"",
    severity: "High",
    color: "#C0A0B8",
    rebuttal:
      "HubSpot starts cheap but their seat-based scaling balloons past 50 users. NexFlow is flat per-org with unlimited seats and includes Cultural Intelligence + Voice AI Agent — modules HubSpot charges $1,500/mo each for. Total cost-of-ownership at year 2 is 38% lower.",
    win_rate: "67%",
  },
  {
    objection: "Timing — \"We're locked into Salesforce until renewal\"",
    severity: "Med",
    color: "#C8A880",
    rebuttal:
      "We've migrated 14 GCC customers off Salesforce mid-contract using our parallel-run mode — your team uses both for 60 days, we sync data both ways, and you only switch when you're 100% comfortable. Net: no downtime, no double pay.",
    win_rate: "54%",
  },
  {
    objection: "Trust — \"We've never heard of NexFlow\"",
    severity: "Med",
    color: "#C8A880",
    rebuttal:
      "Fair. We were founded in Riyadh in 2024 by ex-HubSpot + ex-Salesforce GCC leaders. We power 47 GCC sales orgs including Aramco Digital, Gulf Ventures, and SABIC Digital Solutions — happy to connect you with any of them for a peer reference call this week.",
    win_rate: "73%",
  },
  {
    objection: "Feature gap — \"Does it support Arabic NLP?\"",
    severity: "Low",
    color: "#88B8B0",
    rebuttal:
      "Yes — Khaleeji, MSA, and code-switched (Arabic + English) are first-class. We score sentiment, extract intent, and auto-translate transcripts in real time. Arabic-first was a founding requirement, not a bolt-on.",
    win_rate: "91%",
  },
];

function ObjectionsView() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl p-4 border border-border/40 bg-white/60">
        <div className="text-xs font-bold text-foreground mb-1">Live Objection Handler</div>
        <p className="text-[11px] text-muted-foreground">
          During a live call, the objection handler suggests rebuttals in real time. These are the top 4 objections
          tracked across your team this week, ranked by frequency.
        </p>
      </div>
      {OBJECTIONS.map((o) => (
        <div key={o.objection} className="rounded-xl p-4 border border-border/40 bg-white/70">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="text-sm font-bold text-foreground flex-1">{o.objection}</div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                style={{ borderColor: `${o.color}55`, color: o.color, background: `${o.color}10` }}>
                {o.severity}
              </span>
              <span className="text-[10px] text-muted-foreground">Win {o.win_rate}</span>
            </div>
          </div>
          <div className="rounded-lg p-3 bg-muted/30 border border-border/30">
            <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Recommended rebuttal</div>
            <p className="text-xs text-foreground leading-relaxed">{o.rebuttal}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const COMPANY_INSIGHTS = [
  {
    title: "Founding story (1-liner)",
    body: "Founded in Riyadh, 2024, by ex-HubSpot and ex-Salesforce GCC leaders to fix the cultural gap in Western CRMs.",
  },
  {
    title: "Best customer stories to drop in",
    body: "Aramco Digital — saved $4.2M in pipeline by catching three churn-risk accounts. Gulf Ventures — Voice AI Agent qualified 142 leads in first 30 days. SABIC Digital — replaced 3 tools (HubSpot + Outreach + Gong) with one NexFlow.",
  },
  {
    title: "Pricing position vs HubSpot / Salesforce",
    body: "Flat per-org with unlimited seats. Cultural Intelligence and Voice AI Agent are bundled, not add-ons. Year-2 TCO is 38–47% lower depending on seat count.",
  },
  {
    title: "Differentiators (top 3)",
    body: "1) Arabic-first NLP (Khaleeji + MSA + code-switched). 2) Cultural Intelligence (auto-pause around prayer times, Khaleeji email tone). 3) GCC enrichment recall is 27–41% higher than Apollo / HubSpot for KSA + UAE prospects.",
  },
];

function CompanyInsightsView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {COMPANY_INSIGHTS.map((c) => (
        <div key={c.title} className="rounded-xl p-4 border border-border/40 bg-white/70">
          <div className="text-xs font-black uppercase tracking-wider text-[#88B8B0] mb-2">{c.title}</div>
          <p className="text-xs text-foreground leading-relaxed">{c.body}</p>
        </div>
      ))}
    </div>
  );
}
