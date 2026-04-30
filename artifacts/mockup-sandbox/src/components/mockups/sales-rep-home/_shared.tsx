import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Headphones,
  LayoutGrid,
  ListTodo,
  Newspaper,
  Phone,
  PlayCircle,
  Sparkles,
  Zap,
} from "lucide-react";

export function ViewToggle({ active = "Daily" }: { active?: string }) {
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

export function HomeHeader({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          360° AI ANALYSIS · SALES REP HOME
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Good morning, Sara
        </h1>
        <p className="text-sm text-muted-foreground">
          {subtitle ??
            "Your AI co-pilot has prepared your day. 8 priority items, 3 bottlenecks flagged, 1 coaching moment."}
        </p>
      </div>
      <ViewToggle active="Daily" />
    </div>
  );
}

export function QuickTile({
  icon: Icon,
  label,
  count,
  trigger,
  compact,
}: {
  icon: typeof Zap;
  label: string;
  count: string;
  trigger?: string;
  compact?: boolean;
}) {
  return (
    <button
      className={
        "group flex flex-col items-start gap-1.5 rounded-lg border border-border bg-card text-left transition-colors hover:border-primary/40 hover:bg-accent/30 " +
        (compact ? "p-2" : "p-3")
      }
    >
      <div className="flex w-full items-center justify-between">
        <Icon className={compact ? "h-3.5 w-3.5 text-primary" : "h-4 w-4 text-primary"} />
        {trigger && (
          <Badge variant="outline" className="text-[10px] font-normal">
            {trigger}
          </Badge>
        )}
      </div>
      <div className={compact ? "text-sm font-semibold" : "text-base font-semibold"}>{count}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </button>
  );
}

export const QUICK_TILES = [
  { icon: LayoutGrid, label: "Command Center", count: "12", trigger: "Open" },
  { icon: ListTodo, label: "Tasks today", count: "7", trigger: "3 overdue" },
  { icon: Calendar, label: "Schedule", count: "4 calls", trigger: "Triggers" },
  { icon: Zap, label: "Auto-actions", count: "9", trigger: "AI ran" },
] as const;

export const ACTION_ITEMS = [
  { label: "Call Aramco Digital — decision-maker available 9–11am", tag: "Hot" },
  { label: "Send proposal v3 to Mubadala (legal cleared 06:42)", tag: "Unblock" },
  { label: "Reply to Talabat AE — pricing question, 14h waiting", tag: "SLA" },
  { label: "Push deck v2 to Careem ahead of Wed call", tag: "Prep" },
] as const;

export function AIAnalysisProse() {
  return (
    <p className="text-sm leading-relaxed text-foreground/90">
      Your <span className="font-semibold">Q4 conversion rate dipped 8%</span>{" "}
      this week — concentrated in 2 enterprise deals stuck in legal review. You
      also have <span className="font-semibold">3 hot leads</span> from last
      night's enrichment run that match your top ICP. Recommended first-action:
      call <span className="font-semibold">Aramco Digital</span> before 11am GST
      — decision-maker is in your timezone today only.
    </p>
  );
}

export function ActionItemsList({ limit = 4 }: { limit?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>ACTION ITEMS · AI prioritized</span>
        <button className="text-primary hover:underline">View all 8</button>
      </div>
      {ACTION_ITEMS.slice(0, limit).map((a) => (
        <div
          key={a.label}
          className="flex items-center justify-between rounded-md border border-border bg-card/50 px-3 py-2 text-sm"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="line-clamp-1">{a.label}</span>
          </div>
          <Badge variant="secondary" className="ml-2 shrink-0 text-[10px]">
            {a.tag}
          </Badge>
        </div>
      ))}
    </div>
  );
}

export const NEWS_ITEMS = [
  {
    kind: "Funding",
    title: "Aramco Digital raises $400M Series C",
    source: "MAGNiTT · 1h",
    lead: "Aramco Digital · in your pipeline",
  },
  {
    kind: "Hire",
    title: "Mubadala appoints new Head of Procurement",
    source: "LinkedIn signal · 3h",
    lead: "Mubadala · open deal $240k",
  },
  {
    kind: "News",
    title: "Talabat AE expands to Northern Emirates",
    source: "Reuters · 5h",
    lead: "Talabat · cold lead, refresh ICP fit",
  },
  {
    kind: "Intent",
    title: "Careem viewed your pricing page 4× in 48h",
    source: "Web intent · 6h",
    lead: "Careem · re-engage now",
  },
] as const;

export function NewsSignalsFeed({ compact }: { compact?: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Newspaper className="h-4 w-4 text-primary" />
          News, Signals & Lead Updates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {NEWS_ITEMS.map((i) => (
          <div
            key={i.title}
            className={
              "flex items-start gap-3 rounded-md border border-border bg-card/50 " +
              (compact ? "px-2.5 py-2" : "px-3 py-2.5")
            }
          >
            <Badge variant="outline" className="mt-0.5 text-[10px] font-medium">
              {i.kind}
            </Badge>
            <div className="flex-1 space-y-0.5">
              <p className="text-sm font-medium leading-tight">{i.title}</p>
              <p className="text-xs text-muted-foreground">{i.source}</p>
              <p className="text-xs text-primary">{i.lead}</p>
            </div>
            {!compact && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                Open <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export const BOTTLENECKS = [
  {
    title: "Discovery → Demo conversion fell 22%",
    gap: "Demos booked but not attended (no-show rate 31%)",
    resolution: "Add SMS reminder 2h before. AI drafted template — review & enable.",
    score: 72,
    severity: "high" as const,
  },
  {
    title: "Enterprise deals stuck in legal review",
    gap: "Avg legal cycle 18 days vs benchmark 7",
    resolution: "Pre-share standard MSA at proposal stage. Live coaching session available.",
    score: 64,
    severity: "med" as const,
  },
  {
    title: "ICP mismatch on inbound forms",
    gap: "32% of inbound leads outside top-tier ICP",
    resolution: "Tighten qualification quiz. AI suggests 3 disqualifying questions.",
    score: 58,
    severity: "med" as const,
  },
];

export function BottlenecksCard({ compact }: { compact?: boolean }) {
  return (
    <Card className="border-amber-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Bottlenecks · Pain Points & Gaps
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            3 active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={compact ? "space-y-2" : "space-y-3"}>
        {BOTTLENECKS.map((b) => (
          <div
            key={b.title}
            className={
              "space-y-2 rounded-md border border-border bg-card/50 " +
              (compact ? "p-2.5" : "p-3")
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold leading-tight">{b.title}</p>
                <p className="text-xs text-muted-foreground">Gap: {b.gap}</p>
              </div>
              <Badge
                className={
                  b.severity === "high"
                    ? "bg-red-500/10 text-red-600 hover:bg-red-500/15"
                    : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/15"
                }
              >
                {b.severity === "high" ? "High" : "Medium"}
              </Badge>
            </div>
            {!compact && (
              <div className="rounded-md bg-primary/5 px-2.5 py-2 text-xs text-foreground/90">
                <span className="font-medium text-primary">Resolution: </span>
                {b.resolution}
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Score</span>
                <Progress value={b.score} className="h-1.5 w-20" />
                <span className="font-semibold">{b.score}</span>
              </div>
              <div className="flex gap-1.5">
                {!compact && (
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                    <BookOpen className="mr-1 h-3 w-3" /> Read
                  </Button>
                )}
                <Button size="sm" className="h-7 px-2 text-xs">
                  <Zap className="mr-1 h-3 w-3" /> Action
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function LiveCoachingCard({ slim }: { slim?: boolean }) {
  if (slim) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <PlayCircle className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold">
                Live Coaching: "Closing the legal-review gap in enterprise deals"
              </p>
              <p className="text-xs text-muted-foreground">
                7 min · personalized to your last 3 stuck deals
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Read
            </Button>
            <Button size="sm" className="h-8 text-xs">
              <Phone className="mr-1.5 h-3.5 w-3.5" /> Start session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Headphones className="h-4 w-4 text-primary" />
          Live Coaching with AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <PlayCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold">
              "Closing the legal-review gap in enterprise deals"
            </p>
            <p className="text-xs text-muted-foreground">
              7 min · personalized to your last 3 stuck deals · article + voice walkthrough
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-9 text-xs">
            <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Read article
          </Button>
          <Button className="h-9 text-xs">
            <Phone className="mr-1.5 h-3.5 w-3.5" /> Start live session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
        SECTION 1
      </span>
      DAILY BRIEFING · {children}
    </div>
  );
}
