import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Brain,
  Briefcase,
  CheckCircle2,
  Clock,
  Flame,
  Info,
  Mail,
  MessageSquare,
  Phone,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  User,
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
        <h1 className="text-2xl font-bold tracking-tight">To-Do & Alerts</h1>
        <p className="text-sm text-muted-foreground">
          High priorities, tasks, and efficiency. The AI agent handles the
          repeatable ones automatically — flagged here for your awareness.
        </p>
      </div>
      <ViewToggle active="Daily" />
    </div>
  );
}

function MissedActionsCard() {
  const items = [
    {
      name: "Hassan Al-Mansoori",
      company: "Aramco Digital",
      missed: "Follow-up after demo (3d overdue)",
      analysis:
        "Decision-maker engaged for 47 min; high churn risk if untouched 24h more.",
      severity: "critical" as const,
    },
    {
      name: "Layla Khoury",
      company: "Mubadala",
      missed: "Send proposal v3 (scheduled yesterday)",
      analysis: "Legal team cleared this morning. Meeting Wednesday is at risk.",
      severity: "critical" as const,
    },
    {
      name: "Faisal Bin Saleh",
      company: "Talabat AE",
      missed: "Reply to pricing question (14h SLA breach)",
      analysis: "Two competitors named in last email. Reply within 2h.",
      severity: "high" as const,
    },
    {
      name: "Noor Al-Sabah",
      company: "Careem",
      missed: "Re-engage after pricing-page intent (4 visits)",
      analysis: "Active buying signal. AI drafted re-engagement email.",
      severity: "med" as const,
    },
  ];
  const sevColor: Record<typeof items[number]["severity"], string> = {
    critical: "bg-red-500/10 text-red-700 border-red-500/30",
    high: "bg-amber-500/10 text-amber-700 border-amber-500/30",
    med: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  };
  return (
    <Card className="border-red-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="h-4 w-4 text-red-500" />
            Red-Flagged · Missed Actions
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            4 require attention
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((it) => (
          <div
            key={it.name}
            className="space-y-2 rounded-md border border-border bg-card/50 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {it.name
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold">{it.name}</div>
                  <div className="text-[11px] text-muted-foreground">{it.company}</div>
                </div>
              </div>
              <Badge variant="outline" className={"text-[10px] " + sevColor[it.severity]}>
                {it.severity}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{it.missed}</span>
            </div>
            <div className="flex items-start gap-2 rounded-md bg-primary/5 px-2 py-1.5 text-[11px]">
              <Brain className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
              <span>
                <span className="font-semibold text-primary">Analysis: </span>
                {it.analysis}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <User className="mr-1 h-3 w-3" /> Open contact
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                  <Phone className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                  <Mail className="h-3 w-3" />
                </Button>
                <Button size="sm" className="h-7 px-2 text-xs">
                  <Zap className="mr-1 h-3 w-3" /> Execute now
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TasksPriorityCard() {
  const tasks = [
    {
      who: "Hassan A.",
      action: "Send recap email + 3 case studies",
      agent: "Drafted by AI agent",
      ready: true,
    },
    {
      who: "Layla K.",
      action: "Push proposal v3 with updated pricing",
      agent: "AI fetching latest discount approval",
      ready: false,
    },
    {
      who: "Faisal S.",
      action: "Reply to pricing thread w/ comparison table",
      agent: "Drafted by AI agent",
      ready: true,
    },
    {
      who: "Omar R.",
      action: "Book discovery call slot (Tue/Wed AM)",
      agent: "Calendar agent watching availability",
      ready: false,
    },
    {
      who: "Noor S.",
      action: "Re-engage with intent-based pricing email",
      agent: "Drafted by AI agent",
      ready: true,
    },
  ];
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Tasks Priority · Name → Action (AI agent)
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            5 queued
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {tasks.map((t) => (
          <div
            key={t.who + t.action}
            className="flex items-center gap-3 rounded-md border border-border bg-card/50 px-3 py-2"
          >
            <div className="w-24 truncate text-sm font-semibold">{t.who}</div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex-1 truncate text-sm">{t.action}</div>
            <Badge
              variant="outline"
              className={
                "gap-1 text-[10px] " +
                (t.ready
                  ? "border-emerald-500/40 text-emerald-700"
                  : "border-amber-500/40 text-amber-700")
              }
            >
              <Bot className="h-3 w-3" />
              {t.agent}
            </Badge>
            <Button
              size="sm"
              className="h-7 px-2 text-xs"
              variant={t.ready ? "default" : "outline"}
              disabled={!t.ready}
            >
              {t.ready ? "Approve & run" : "Waiting"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LeadInsightsCard() {
  const leads = [
    {
      name: "Aramco Digital",
      reason: "Funding signal · Series C $400M (1h ago)",
      score: 96,
      badge: "Hot",
      tone: "red",
    },
    {
      name: "Mubadala",
      reason: "Proposal cleared by legal · close window 48h",
      score: 92,
      badge: "Closing",
      tone: "amber",
    },
    {
      name: "Careem",
      reason: "4 pricing-page visits in 48h · buying intent",
      score: 88,
      badge: "Re-engage",
      tone: "amber",
    },
    {
      name: "Talabat AE",
      reason: "Expansion news · ICP fit refresh",
      score: 78,
      badge: "Refresh",
      tone: "blue",
    },
    {
      name: "STC Group",
      reason: "New CRO hire matches your champion profile",
      score: 71,
      badge: "Warm",
      tone: "blue",
    },
  ];
  const toneClass: Record<string, string> = {
    red: "bg-red-500/10 text-red-700",
    amber: "bg-amber-500/10 text-amber-700",
    blue: "bg-blue-500/10 text-blue-700",
  };
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Leads Insights · To Prioritize
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            Top 5 today
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {leads.map((l) => (
          <div
            key={l.name}
            className="flex items-center gap-3 rounded-md border border-border bg-card/50 px-3 py-2"
          >
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-semibold">{l.name}</div>
              <div className="text-[11px] text-muted-foreground">{l.reason}</div>
            </div>
            <Badge className={toneClass[l.tone] + " hover:opacity-90"}>
              {l.badge}
            </Badge>
            <div className="w-12 text-right">
              <div className="text-sm font-bold">{l.score}</div>
              <div className="text-[10px] text-muted-foreground">score</div>
            </div>
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
              Open
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AIRuleNote() {
  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardContent className="flex items-start gap-3 pt-5">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div className="space-y-1.5 text-xs leading-relaxed">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-700">AI Action Rule</span>
            <Badge variant="outline" className="text-[10px]">
              configurable
            </Badge>
          </div>
          <p className="text-foreground/90">
            When the AI detects a missed action it should{" "}
            <span className="font-semibold">act on your behalf</span> — not just
            flag the miss. Connecting the action automatically prevents the
            silent backlog that hurts both your scoring and your efficiency.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Info className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              You'll always see what the AI did, with a one-click undo. Approval
              is only required for irreversible actions (sends, calls).
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TodoAlerts() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-[1180px] space-y-5">
        <PageHeader />

        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
            SECTION 3
          </span>
          TO-DO & ALERTS
          <AlertCircle className="ml-1 h-3 w-3" />
          <MessageSquare className="h-3 w-3" />
        </div>

        <MissedActionsCard />

        <div className="grid grid-cols-1 gap-4">
          <TasksPriorityCard />
          <LeadInsightsCard />
        </div>

        <AIRuleNote />
      </div>
    </div>
  );
}
