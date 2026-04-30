import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  LineChart,
  Phone,
  Rocket,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

function ViewToggle({ active = "Daily" }: { active?: string }) {
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-card p-0.5 text-xs">
      {(["Daily", "YTD", "Monthly"] as const).map((v) => (
        <button
          key={v}
          className={
            "px-3 py-1.5 rounded-sm font-medium transition-colors " +
            (active === v
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground")
          }
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function PageHeader() {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          360° AI ANALYSIS · SALES REP HOME
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Performance & Trends</h1>
        <p className="text-sm text-muted-foreground">
          All CRM activity including enrichment, calls, deals closed, targets vs actual.
          Forecasted AI view across YTD, Daily, and Monthly.
        </p>
      </div>
      <ViewToggle active="Daily" />
    </div>
  );
}

function KPI({
  label,
  value,
  delta,
  good,
}: {
  label: string;
  value: string;
  delta: string;
  good: boolean;
}) {
  return (
    <div className="space-y-1 rounded-md border border-border bg-card/50 p-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-xl font-bold">{value}</div>
      <div
        className={
          "flex items-center gap-1 text-xs font-medium " +
          (good ? "text-emerald-600" : "text-red-600")
        }
      >
        {good ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
        {delta}
      </div>
    </div>
  );
}

// Lightweight inline chart helpers — no dep needed for a mockup
function MiniBars({ values, color = "var(--primary)" }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-20 items-end gap-1.5">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm" style={{
          height: `${(v / max) * 100}%`,
          background: color,
          opacity: 0.4 + (i / values.length) * 0.6,
        }} />
      ))}
    </div>
  );
}

function MiniArea({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${100 - (v / max) * 90}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-20 w-full">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,100 ${points} 100,100`} fill="url(#g)" className="text-primary" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
    </svg>
  );
}

function CallsConversionDashboard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4 text-primary" />
            Calls Conversion Dashboard
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
            Analysis
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <KPI label="Calls placed" value="142" delta="+18% vs last week" good />
          <KPI label="Connect rate" value="38%" delta="+4 pts" good />
          <KPI label="Call → meeting" value="22%" delta="-3 pts" good={false} />
        </div>
        <MiniBars values={[12, 18, 14, 22, 28, 19, 29]} />
        <div className="text-[11px] text-muted-foreground">Last 7 days · calls/day</div>
      </CardContent>
    </Card>
  );
}

function PipelineCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            Pipeline · Leads Generated vs Closed
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
            Analysis
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <KPI label="Generated" value="89" delta="+12%" good />
          <KPI label="Closed-won" value="14" delta="+2" good />
          <KPI label="Win rate" value="15.7%" delta="-1.2 pts" good={false} />
        </div>
        <div className="space-y-2">
          {[
            { label: "Generated", val: 89, color: "bg-primary/70" },
            { label: "Qualified", val: 52, color: "bg-primary/55" },
            { label: "Demo", val: 31, color: "bg-primary/40" },
            { label: "Proposal", val: 19, color: "bg-primary/30" },
            { label: "Closed-won", val: 14, color: "bg-emerald-500/70" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="w-20 text-xs text-muted-foreground">{s.label}</div>
              <div className="flex-1 overflow-hidden rounded bg-muted">
                <div className={s.color + " h-2.5"} style={{ width: `${(s.val / 89) * 100}%` }} />
              </div>
              <div className="w-10 text-right text-xs font-semibold">{s.val}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EnrichmentCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            Enrichment Usage vs Conversion
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
            Analysis
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <KPI label="Records enriched" value="312" delta="+44%" good />
          <KPI label="Cost / record" value="$0.18" delta="-$0.04" good />
          <KPI label="Enriched → meeting" value="11.5%" delta="+2.3 pts" good />
        </div>
        <MiniArea values={[12, 18, 16, 22, 29, 27, 34, 41, 38, 47]} />
        <div className="text-[11px] text-muted-foreground">Last 10 days · enriched leads → meetings booked</div>
      </CardContent>
    </Card>
  );
}

function TrendsCard() {
  const positive = [
    "Connect rate +4 pts (UAE timezone calling)",
    "Enriched → meeting +2.3 pts (Hunter+Lusha waterfall)",
    "Avg deal size +12% (focus on enterprise)",
  ];
  const negative = [
    "Demo no-show 31% (vs 18% last month)",
    "Legal cycle 18d (vs benchmark 7d)",
    "Win rate -1.2 pts (small-tier leak)",
  ];
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <LineChart className="h-4 w-4 text-primary" />
          Trends · What changed and what didn't
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" /> Improved
            </div>
            {positive.map((p) => (
              <div key={p} className="flex items-start gap-1.5 text-xs">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                <span>{p}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
              <TrendingDown className="h-3.5 w-3.5" /> Declined
            </div>
            {negative.map((p) => (
              <div key={p} className="flex items-start gap-1.5 text-xs">
                <ArrowDownRight className="mt-0.5 h-3 w-3 shrink-0 text-red-600" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ImprovementPlanCard() {
  const steps = [
    {
      title: "Enable SMS demo reminders",
      detail: "Cuts no-show 31% → 17% based on cohort sim",
      impact: "+6 meetings/wk",
    },
    {
      title: "Pre-share MSA at proposal",
      detail: "Pulls legal cycle 18d → 9d on enterprise",
      impact: "+$140k velocity",
    },
    {
      title: "Run waterfall on top-50 ICP weekly",
      detail: "Refresh emails + intent before Monday calls",
      impact: "+18 connects/wk",
    },
  ];
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Rocket className="h-4 w-4 text-primary" />
            Call Scoring + Full Performance AI → Improvement Plan
          </CardTitle>
          <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
            <Sparkles className="mr-1 h-3 w-3" /> AI generated
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md border border-border bg-background/60 p-2.5">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Call score</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold">7.4</span>
              <span className="text-xs text-emerald-600">+0.6</span>
            </div>
            <Progress value={74} className="mt-1.5 h-1.5" />
          </div>
          <div className="rounded-md border border-border bg-background/60 p-2.5">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Target attainment</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold">82%</span>
              <span className="text-xs text-amber-600">on-track</span>
            </div>
            <Progress value={82} className="mt-1.5 h-1.5" />
          </div>
          <div className="rounded-md border border-border bg-background/60 p-2.5">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Forecast Q4</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold">$1.42M</span>
              <span className="text-xs text-emerald-600">+9%</span>
            </div>
            <Progress value={92} className="mt-1.5 h-1.5" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">RECOMMENDED PLAN · 3 steps</div>
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.detail}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {s.impact}
                </Badge>
                <Button size="sm" className="h-7 px-2 text-xs">
                  <Zap className="mr-1 h-3 w-3" /> Enable
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceTrends() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-[1180px] space-y-5">
        <PageHeader />

        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
            SECTION 2
          </span>
          PERFORMANCE & TRENDS
          <Target className="ml-1 h-3 w-3" />
          <Calendar className="h-3 w-3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CallsConversionDashboard />
          <PipelineCard />
        </div>

        <EnrichmentCard />
        <TrendsCard />
        <ImprovementPlanCard />
      </div>
    </div>
  );
}
