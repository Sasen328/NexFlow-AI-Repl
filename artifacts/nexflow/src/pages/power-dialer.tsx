import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/useApi";
import { Link } from "wouter";
import { Phone, PhoneIncoming, PhoneOutgoing, Bot, Sparkles, ChevronRight, CheckCircle2, X, Loader2, Zap, Trophy, Clock, TrendingUp, PhoneMissed, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueueItem {
  id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  lead_score: number | null;
  status: string;
  last_touch: string;
  call_count: number;
  open_value: number;
  open_count: number;
  priority_score: number;
}

const OUTCOMES = [
  { key: "connected", label: "Connected", color: "text-emerald-600" },
  { key: "voicemail", label: "Voicemail", color: "text-amber-600" },
  { key: "no_answer", label: "No answer", color: "text-muted-foreground" },
  { key: "callback_requested", label: "Callback later", color: "text-blue-600" },
  { key: "meeting_booked", label: "Meeting booked", color: "text-emerald-600" },
  { key: "not_interested", label: "Not interested", color: "text-red-500" },
];

export default function PowerDialerPage() {
  const qc = useQueryClient();
  const [activeIdx, setActiveIdx] = useState(0);
  const [phase, setPhase] = useState<"queue" | "dialing" | "connected" | "logged">("queue");
  const [outcome, setOutcome] = useState<string>("connected");
  const [notes, setNotes] = useState("");
  const [aiSimResult, setAiSimResult] = useState<any>(null);

  const { data: queueData, isLoading } = useQuery<{ count: number; queue: QueueItem[] }>({
    queryKey: ["power-dialer-queue"],
    queryFn: () => apiFetch("/power-dialer/queue?limit=20"),
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["power-dialer-stats"],
    queryFn: () => apiFetch("/power-dialer/stats"),
    refetchInterval: 5000,
  });

  const log = useMutation({
    mutationFn: (body: any) =>
      apiFetch("/power-dialer/log", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["power-dialer-stats"] });
      qc.invalidateQueries({ queryKey: ["calls"] });
      setPhase("logged");
    },
  });

  const aiCall = useMutation({
    mutationFn: (body: any) =>
      apiFetch("/power-dialer/voice-agent-call", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: (r) => {
      setAiSimResult(r);
    },
  });

  const queue = queueData?.queue ?? [];
  const active = queue[activeIdx];

  function nextLead() {
    setPhase("queue");
    setNotes("");
    setOutcome("connected");
    setAiSimResult(null);
    setActiveIdx((i) => Math.min(i + 1, queue.length - 1));
  }

  // Simulate ringing
  useEffect(() => {
    if (phase === "dialing") {
      const t = setTimeout(() => setPhase("connected"), 1800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          Power Dialer
        </h1>
        <p className="text-muted-foreground mt-1">
          AI-prioritized outbound queue with inbound-style call handling. Agents act on connected calls only.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Stat icon={Phone} label="Calls today" value={stats?.today_calls ?? 0} />
        <Stat icon={CheckCircle2} label="Connects" value={stats?.today_connects ?? 0} />
        <Stat icon={Trophy} label="Meetings" value={stats?.today_meetings ?? 0} />
        <Stat icon={TrendingUp} label="Connect rate" value={`${stats?.connect_rate ?? 0}%`} />
        <Stat icon={Clock} label="Avg duration" value={`${Math.round((stats?.avg_duration ?? 0))}s`} />
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* MAIN STAGE */}
        <div className="glass-card rounded-2xl p-6 min-h-[480px] flex flex-col">
          {!active && !isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
              <div className="text-lg font-semibold">Queue cleared!</div>
              <div className="text-sm mt-1">All prioritized leads have been worked.</div>
            </div>
          )}

          {active && (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Lead {activeIdx + 1} of {queue.length} · Priority {Math.round(active.priority_score)}
                  </div>
                  <h2 className="text-2xl font-bold mt-1">{active.first_name} {active.last_name}</h2>
                  <div className="text-sm text-muted-foreground">{active.title ?? "—"}</div>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {active.phone}</span>
                    {active.email && <span>{active.email}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Lead score</div>
                  <div className="text-3xl font-bold">{Math.round(active.lead_score ?? 0)}</div>
                  {active.open_value > 0 && (
                    <div className="text-xs text-emerald-600 mt-1">
                      ${active.open_value.toLocaleString()} open
                    </div>
                  )}
                </div>
              </div>

              <div className="my-6 flex-1 flex items-center justify-center">
                {phase === "queue" && (
                  <div className="text-center">
                    <button
                      onClick={() => setPhase("dialing")}
                      className="w-32 h-32 rounded-full bg-emerald-600 text-white shadow-lg hover:scale-105 transition flex items-center justify-center"
                    >
                      <Phone className="w-12 h-12" />
                    </button>
                    <div className="text-sm text-muted-foreground mt-3">Click to dial</div>
                    <div className="mt-4 flex justify-center gap-2">
                      <button
                        onClick={() => aiCall.mutate({ contact_id: active.id, agent_persona: "professional" })}
                        disabled={aiCall.isPending}
                        className="px-3 py-1.5 rounded-lg text-xs border border-border hover:bg-muted transition flex items-center gap-1"
                      >
                        {aiCall.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                        Let AI voice agent dial
                      </button>
                      <button onClick={nextLead} className="px-3 py-1.5 rounded-lg text-xs border border-border hover:bg-muted transition">
                        Skip
                      </button>
                    </div>
                  </div>
                )}

                {phase === "dialing" && (
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-emerald-600/20 flex items-center justify-center animate-pulse">
                      <PhoneOutgoing className="w-12 h-12 text-emerald-600" />
                    </div>
                    <div className="text-sm text-muted-foreground mt-3">Dialing…</div>
                  </div>
                )}

                {phase === "connected" && (
                  <div className="w-full max-w-lg">
                    <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900 p-4 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <PhoneIncoming className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                          Inbound-style: {active.first_name} {active.last_name}
                        </span>
                      </div>
                      <div className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                        Connected. Treat this as if they called you — log outcome to advance.
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {OUTCOMES.map((o) => (
                        <button
                          key={o.key}
                          onClick={() => setOutcome(o.key)}
                          className={cn(
                            "px-3 py-2 rounded-xl border text-xs font-medium transition",
                            outcome === o.key ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                          )}
                        >
                          <span className={o.color}>{o.label}</span>
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Quick notes about the call…"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                    />

                    <div className="flex gap-2 mt-3">
                      <button
                        disabled={log.isPending}
                        onClick={() => log.mutate({ contact_id: active.id, outcome, notes, duration_seconds: 60 + Math.floor(Math.random() * 240) })}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {log.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Log & next
                      </button>
                      <button
                        onClick={() => setPhase("queue")}
                        className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition flex items-center gap-2"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                )}

                {phase === "logged" && (
                  <div className="text-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                    <div className="text-lg font-semibold mt-3">Call logged.</div>
                    <button onClick={nextLead} className="mt-4 px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
                      Next lead <ChevronRight className="w-4 h-4 inline ml-1" />
                    </button>
                  </div>
                )}
              </div>

              {/* AI sim result */}
              {aiSimResult && (
                <div className="mt-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">AI Voice Agent — simulated call</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">{aiSimResult.note}</div>
                  <div className="space-y-1 text-sm">
                    <div><b>Outcome:</b> {aiSimResult.simulation?.outcome}</div>
                    <div><b>Sentiment:</b> {aiSimResult.simulation?.sentiment} ({aiSimResult.simulation?.confidence}% conf.)</div>
                    <div><b>Next step:</b> {aiSimResult.simulation?.next_step}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* QUEUE */}
        <div className="glass-card rounded-2xl p-4 h-fit">
          <div className="text-xs uppercase text-muted-foreground mb-2 font-semibold">Up next</div>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          <div className="space-y-1 max-h-[480px] overflow-y-auto">
            {queue.slice(activeIdx, activeIdx + 15).map((c, i) => (
              <button
                key={c.id}
                onClick={() => { setActiveIdx(activeIdx + i); setPhase("queue"); setAiSimResult(null); }}
                className={cn(
                  "w-full text-left rounded-xl px-3 py-2 transition",
                  i === 0 ? "bg-primary/5 border border-primary/30" : "hover:bg-muted"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{c.first_name} {c.last_name}</div>
                  <div className="text-xs text-muted-foreground">{Math.round(c.priority_score)}</div>
                </div>
                <div className="text-xs text-muted-foreground truncate">{c.title ?? "—"}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
