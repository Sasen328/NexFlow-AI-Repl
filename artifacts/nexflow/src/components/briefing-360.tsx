import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/hooks/useApi";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Brain,
  Calendar,
  CheckCircle2,
  Headphones,
  LayoutGrid,
  Loader2,
  Newspaper,
  Phone,
  PlayCircle,
  Send,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

type Scope = "daily" | "ytd" | "monthly";
type Mode = "command-center" | "tasks" | "schedule";

interface Bottleneck {
  title: string;
  gap: string;
  article: string;
  coaching: string;
  score: number;
  severity: "high" | "med" | "low";
}
interface Analysis {
  headline: string;
  paragraph: string;
  triggers: string[];
  actionItems: { label: string; tag: string }[];
  bottlenecks: Bottleneck[];
  news: { kind: string; title: string; source: string; lead: string }[];
  _source?: string;
}
interface SuggestedTask {
  label: string;
  priority: "P1" | "P2" | "P3";
  eta: string;
}
interface ChatReply {
  reply: string;
  suggestedTasks: SuggestedTask[];
}

function ScopeToggle({ value, onChange }: { value: Scope; onChange: (s: Scope) => void }) {
  const opts: { v: Scope; label: string }[] = [
    { v: "daily", label: "Daily" },
    { v: "ytd", label: "YTD" },
    { v: "monthly", label: "Monthly" },
  ];
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-card p-0.5 text-xs">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={
            "px-3 py-1.5 rounded-sm font-medium transition-colors " +
            (value === o.v
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Header({ scope, setScope, source, title, eyebrow, subtitle }: { scope: Scope; setScope: (s: Scope) => void; source?: string; title: string; eyebrow: string; subtitle: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {eyebrow}
          {source === "ai" && (
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15">
              <Brain className="mr-1 h-3 w-3" /> Live · Claude
            </Badge>
          )}
        </div>
        <h1 className="text-[26px] font-bold tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-xs text-muted-foreground">
          {subtitle}
        </p>
      </div>
      <ScopeToggle value={scope} onChange={setScope} />
    </div>
  );
}

function CommandTabs({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const tabs: { v: Mode; label: string; icon: typeof LayoutGrid }[] = [
    { v: "command-center", label: "Command Center", icon: LayoutGrid },
    { v: "tasks", label: "Tasks", icon: CheckCircle2 },
    { v: "schedule", label: "Schedule", icon: Calendar },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((t) => {
        const Icon = t.icon;
        const active = mode === t.v;
        return (
          <button
            key={t.v}
            type="button"
            onClick={() => setMode(t.v)}
            className={
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors " +
              (active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-accent")
            }
          >
            <Icon className="h-3 w-3" />
            {t.label}
          </button>
        );
      })}
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
      <Badge variant="outline" className="gap-1 text-[10px]">
        <Zap className="h-3 w-3 text-primary" />
        Triggers
      </Badge>
    </div>
  );
}

function ChatPanel({ mode }: { mode: Mode }) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<ChatReply | null>(null);
  const [autoPublish, setAutoPublish] = useState(false);
  const [published, setPublished] = useState(0);

  const placeholder = useMemo(() => {
    if (mode === "tasks") return "Ask the AI to build today's checklist…";
    if (mode === "schedule") return "Ask the AI to block your calendar around the Aramco window…";
    return "Talk to your Command Center — what should I focus on?";
  }, [mode]);

  async function send() {
    if (!input.trim() || busy) return;
    setBusy(true);
    try {
      const data = (await apiFetch("/briefing/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, message: input.trim() }),
      })) as ChatReply;
      setReply(data);
      if (autoPublish && data.suggestedTasks?.length) {
        await apiFetch("/briefing/publish-checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks: data.suggestedTasks }),
        });
        setPublished(data.suggestedTasks.length);
      }
    } catch {
      setReply({
        reply:
          "Quick read: prioritise the Aramco call window before 11am GST and unblock Mubadala. The rest can wait.",
        suggestedTasks: [
          { label: "Call Aramco Digital", priority: "P1", eta: "30m" },
          { label: "Send Mubadala proposal v3", priority: "P1", eta: "20m" },
          { label: "Reply to Talabat AE pricing", priority: "P2", eta: "15m" },
        ],
      });
    } finally {
      setBusy(false);
    }
  }

  async function publishNow() {
    if (!reply?.suggestedTasks?.length) return;
    try {
      await apiFetch("/briefing/publish-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: reply.suggestedTasks }),
      });
      setPublished(reply.suggestedTasks.length);
    } catch {
      /* swallow — non-fatal */
    }
  }

  return (
    <div className="space-y-2.5 rounded-md border border-primary/30 bg-primary/5 p-2.5">
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold">
          AI Assistant · {mode === "tasks" ? "Task planner" : mode === "schedule" ? "Calendar agent" : "Command Center"}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <Switch
            id="b360-auto-pub"
            checked={autoPublish}
            onCheckedChange={setAutoPublish}
            className="scale-75"
          />
          <label htmlFor="b360-auto-pub" className="text-[11px] text-muted-foreground">
            Auto-publish checklist
          </label>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={placeholder}
          aria-label="Talk to your AI assistant"
          className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
        />
        <Button size="sm" onClick={send} disabled={busy || !input.trim()} className="h-8 px-3 text-xs">
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
        </Button>
      </div>

      {reply && (
        <div className="space-y-2 rounded-md border border-border bg-background/60 p-2.5">
          <p className="text-xs leading-relaxed text-foreground/90">{reply.reply}</p>

          {reply.suggestedTasks?.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                <span>SUGGESTED CHECKLIST · {reply.suggestedTasks.length} items</span>
                <button
                  type="button"
                  onClick={publishNow}
                  className="inline-flex items-center gap-1 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground hover:opacity-90"
                >
                  <Zap className="h-3 w-3" /> Publish to my To-Do
                </button>
              </div>
              {reply.suggestedTasks.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center gap-2 rounded border border-border bg-card/60 px-2 py-1 text-xs"
                >
                  <Badge
                    variant="outline"
                    className={
                      "h-4 px-1 text-[9px] " +
                      (t.priority === "P1"
                        ? "border-red-500/40 text-red-600"
                        : t.priority === "P2"
                          ? "border-amber-500/40 text-amber-700"
                          : "border-muted-foreground/30 text-muted-foreground")
                    }
                  >
                    {t.priority}
                  </Badge>
                  <span className="flex-1 truncate">{t.label}</span>
                  <span className="text-[10px] text-muted-foreground">{t.eta}</span>
                </div>
              ))}
            </div>
          )}

          {published > 0 && (
            <div className="flex items-center gap-1.5 rounded bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              Published {published} task{published === 1 ? "" : "s"} to your To-Do
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AIFullAnalysis({ data, loading, error, onRetry, mode, setMode }: { data: Analysis | null; loading: boolean; error: string | null; onRetry: () => void; mode: Mode; setMode: (m: Mode) => void }) {
  const badgeLabel = loading
    ? "Generating live analysis…"
    : error
      ? "Analysis unavailable"
      : data?._source === "ai"
        ? "Generated by Claude"
        : "Cached fallback";
  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-4 w-4 text-primary" />
            AI Full Analysis
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {loading ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin text-primary" />
            ) : error ? (
              <AlertTriangle className="mr-1 h-3 w-3 text-amber-600" />
            ) : (
              <Sparkles className="mr-1 h-3 w-3 text-primary" />
            )}
            {badgeLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Claude is analyzing your pipeline · this can take 10–20 seconds
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ) : error ? (
          <div className="space-y-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-3">
            <div className="flex items-start gap-2 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-700">Couldn't reach the analysis brain.</p>
                <p className="text-[11px] text-muted-foreground">{error}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={onRetry} className="h-7 text-[11px]">
              <Loader2 className="mr-1 h-3 w-3" /> Retry
            </Button>
          </div>
        ) : data ? (
          <>
            <p className="text-sm font-semibold leading-snug text-foreground">{data.headline}</p>
            <p className="text-xs leading-relaxed text-foreground/90">{data.paragraph}</p>
          </>
        ) : null}

        <CommandTabs mode={mode} setMode={setMode} />
        <ChatPanel mode={mode} />
      </CardContent>
    </Card>
  );
}

function ActionItems({ data, loading }: { data: Analysis | null; loading: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
          Action Items
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {data?.actionItems.length ?? 0}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {loading || !data
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-7 w-full" />)
          : data.actionItems.map((a) => (
              <div
                key={a.label}
                className="flex items-center gap-2 rounded border border-border bg-card/50 px-2 py-1.5 text-[11px]"
              >
                <span className="line-clamp-1 flex-1">{a.label}</span>
                <Badge variant="outline" className="h-4 px-1 text-[9px]">
                  {a.tag}
                </Badge>
              </div>
            ))}
      </CardContent>
    </Card>
  );
}

function BottleneckCard({ b }: { b: Bottleneck }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="space-y-2 rounded-md border border-border bg-card/40 p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold leading-tight">{b.title}</p>
          <p className="text-[11px] text-muted-foreground">Gap: {b.gap}</p>
        </div>
        <Badge
          className={
            b.severity === "high"
              ? "bg-red-500/10 text-red-700 hover:bg-red-500/15"
              : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/15"
          }
        >
          {b.severity === "high" ? "High" : "Med"}
        </Badge>
      </div>

      <div className="rounded-md border border-primary/30 bg-primary/5 p-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
            Resolution
          </span>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[10px] text-primary hover:underline"
          >
            {expanded ? "Collapse" : "Read article"}
          </button>
        </div>
        <p className={"text-[11px] leading-relaxed text-foreground/90 " + (expanded ? "" : "line-clamp-2")}>
          {b.article}
        </p>
        <div className="flex items-center gap-1.5 pt-1">
          <Button size="sm" className="h-7 flex-1 text-[11px]">
            <Headphones className="mr-1 h-3 w-3" /> Live Coaching with AI
          </Button>
          <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" aria-label="Play audio coaching">
            <PlayCircle className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-[10px] italic text-muted-foreground">{b.coaching}</p>
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-muted-foreground">Score</span>
          <Progress value={b.score} className="h-1 w-16" />
          <span className="font-semibold">{b.score}</span>
        </div>
        <Button size="sm" className="h-6 px-2 text-[10px]">
          <Zap className="mr-1 h-3 w-3" /> Action
        </Button>
      </div>
    </div>
  );
}

function BottlenecksPanel({ data, loading }: { data: Analysis | null; loading: boolean }) {
  return (
    <Card className="border-amber-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          Bottlenecks · Pain → Gap → Resolution
          <Badge variant="outline" className="ml-auto text-[10px]">
            {data?.bottlenecks.length ?? 0} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading || !data
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
          : data.bottlenecks.map((b) => <BottleneckCard key={b.title} b={b} />)}
      </CardContent>
    </Card>
  );
}

function NewsRow({ data, loading }: { data: Analysis | null; loading: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Newspaper className="h-3.5 w-3.5 text-primary" />
          News, Signals & Lead Updates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading || !data ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {data.news.map((n) => (
              <div
                key={n.title}
                className="flex items-start gap-2 rounded border border-border bg-card/50 px-2 py-1.5"
              >
                <Badge variant="outline" className="mt-0.5 text-[9px]">
                  {n.kind}
                </Badge>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <p className="text-[11px] font-medium leading-tight line-clamp-1">{n.title}</p>
                  <p className="text-[10px] text-muted-foreground">{n.source}</p>
                  <p className="text-[10px] text-primary line-clamp-1">{n.lead}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface Briefing360Props {
  defaultScope?: Scope;
  defaultMode?: Mode;
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  caption?: string;
}

export default function Briefing360AIAnalysis({
  defaultScope = "daily",
  defaultMode = "command-center",
  title = "360° AI Analysis",
  eyebrow = "Sales Rep · Home",
  subtitle = "Three views: Daily, YTD, Monthly — picked from one analysis brain.",
  caption = "DAILY BRIEFING · 360° AI ANALYSIS",
}: Briefing360Props = {}) {
  const [scope, setScope] = useState<Scope>(defaultScope);
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [data, setData] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    apiFetch("/briefing/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope }),
    })
      .then((d: Analysis) => {
        if (active) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e: Error) => {
        if (active) {
          setData(null);
          setError(e?.message || "Network error");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [scope, reloadTick]);

  const retry = () => setReloadTick((t) => t + 1);

  return (
    <div className="mx-auto w-full max-w-[980px] space-y-3.5">
      <Header scope={scope} setScope={setScope} source={data?._source} title={title} eyebrow={eyebrow} subtitle={subtitle} />

      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
        <Target className="h-3 w-3" />
        {caption}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <AIFullAnalysis data={data} loading={loading} error={error} onRetry={retry} mode={mode} setMode={setMode} />
        </div>
        <div className="space-y-3">
          <ActionItems data={data} loading={loading} />
          <Card>
            <CardContent className="flex items-center gap-2 py-2.5 text-[11px]">
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">Triggers ready</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {data?.triggers.length ?? 0}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottlenecksPanel data={data} loading={loading} />
      <NewsRow data={data} loading={loading} />
    </div>
  );
}
