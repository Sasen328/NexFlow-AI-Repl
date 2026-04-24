import { useCalls, useAnalyzeCall } from "@/hooks/useApi";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Brain,
  Mic, Play, Volume2, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Activity, X, Loader2, Sparkles, MessageSquare
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const SENTIMENT_CONFIG = (score: number | null) => {
  if (score === null) return null;
  if (score >= 0.75) return { label: "Very Positive", color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/15", icon: TrendingUp };
  if (score >= 0.5) return { label: "Positive", color: "text-[#B8B880]", bg: "bg-[#B8B880]/15", icon: TrendingUp };
  if (score >= 0.3) return { label: "Neutral", color: "text-[#C8A880]", bg: "bg-[#C8A880]/15", icon: Activity };
  return { label: "Negative", color: "text-destructive", bg: "bg-destructive/15", icon: TrendingDown };
};

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? "#88B8B0" : score >= 60 ? "#B8B880" : "#C0A0B8";
  const pct = score / 100;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
          <circle cx="32" cy="32" r="24" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${pct * 150.8} 150.8`} strokeLinecap="round"
            transform="rotate(-90 32 32)" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-black text-foreground leading-none">{score}</span>
        </div>
      </div>
      <span className="text-[9px] text-muted-foreground font-medium">AI Score</span>
    </div>
  );
}

export default function CallsPage() {
  const { data, isLoading } = useCalls();
  const calls = data?.calls ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);
  const [openCall, setOpenCall] = useState<any>(null);

  const completedCalls = calls.filter((c: any) => c.status === "completed");
  const scored = completedCalls.filter((c: any) => c.call_score !== null);
  const avgScore = scored.length
    ? Math.round(scored.reduce((acc: number, c: any) => acc + (c.call_score ?? 0), 0) / scored.length)
    : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Phone className="w-6 h-6 text-[#88B8B0]" />
            Call Monitoring
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">AI coaching, transcripts, objections, and call intelligence</p>
        </div>
        <div className="flex gap-3">
          <div className="glass-card rounded-xl px-3 py-2 text-center">
            <div className="text-lg font-bold text-[#88B8B0]">{avgScore || "—"}</div>
            <div className="text-[10px] text-muted-foreground">Avg score</div>
          </div>
          <div className="glass-card rounded-xl px-3 py-2 text-center">
            <div className="text-lg font-bold text-[#B8A0C8]">{completedCalls.length}</div>
            <div className="text-[10px] text-muted-foreground">Completed</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Call History
        </h2>
        <div className="space-y-3">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="glass-card rounded-2xl p-5 h-24 animate-pulse" />)
          ) : calls.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center text-sm text-muted-foreground">No calls logged yet.</div>
          ) : calls.map((c: any) => {
            const sentiment = SENTIMENT_CONFIG(c.sentiment_score);
            const mins = c.duration_seconds ? Math.floor(c.duration_seconds / 60) : null;
            const secs = c.duration_seconds ? c.duration_seconds % 60 : null;
            const isExpanded = expanded === c.id;
            return (
              <div key={c.id} className="glass-card rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center gap-4 p-4 hover:bg-muted/10 transition-colors text-left"
                  onClick={() => setExpanded(isExpanded ? null : c.id)}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    c.status === "completed" ? "bg-[#88B8B0]/20" :
                      c.status === "missed" ? "bg-destructive/20" : "bg-muted/60"
                  )}>
                    {c.direction === "inbound"
                      ? <PhoneIncoming className={cn("w-5 h-5", c.status === "completed" ? "text-[#88B8B0]" : "text-muted-foreground")} />
                      : c.status === "missed"
                        ? <PhoneMissed className="w-5 h-5 text-destructive" />
                        : <PhoneOutgoing className={cn("w-5 h-5", c.status === "completed" ? "text-[#88B8B0]" : "text-muted-foreground")} />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">
                      {c.contact_name ?? "Unknown Contact"}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                      <span className="capitalize">{c.direction} · {c.status}</span>
                      {mins !== null && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mins}m {secs}s</span>}
                      {sentiment && (
                        <span className={cn("flex items-center gap-1 font-medium", sentiment.color)}>
                          <sentiment.icon className="w-3 h-3" />
                          {sentiment.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {c.call_score !== null && c.call_score !== undefined && (
                    <div className="flex-shrink-0"><ScoreGauge score={Math.round(c.call_score)} /></div>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border/20">
                    {c.coaching_notes && (
                      <div className="mt-3 p-3.5 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Brain className="w-3.5 h-3.5 text-[#B8A0C8]" />
                          <span className="text-xs font-bold text-[#B8A0C8]">AI Coaching Notes</span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{c.coaching_notes}</p>
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => setOpenCall(c)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#B8A0C8]/15 text-[#B8A0C8] font-semibold hover:bg-[#B8A0C8]/25"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        View transcript & analysis
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Play className="w-3.5 h-3.5" />
                        Play recording
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {openCall && <CallDetailModal call={openCall} onClose={() => setOpenCall(null)} />}
    </div>
  );
}

function CallDetailModal({ call, onClose }: { call: any; onClose: () => void }) {
  const analyze = useAnalyzeCall();
  const [analysis, setAnalysis] = useState<any>(call.ai_insights ?? null);
  const [transcript, setTranscript] = useState<string>(call.transcript ?? "");
  const [coaching, setCoaching] = useState<string>(call.coaching_notes ?? "");

  const runAnalysis = async () => {
    const r: any = await analyze.mutateAsync(call.id);
    setAnalysis(r?.analysis);
    if (r?.call?.transcript) setTranscript(r.call.transcript);
    if (r?.call?.coaching_notes) setCoaching(r.call.coaching_notes);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-stretch justify-end" onClick={onClose}>
      <div className="bg-background w-full max-w-2xl h-full overflow-y-auto p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">{call.contact_name ?? "Call"}</h2>
            <div className="text-xs text-muted-foreground capitalize">{call.direction} · {call.status} · {Math.floor((call.duration_seconds ?? 0) / 60)}m</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        {!analysis && (
          <button onClick={runAnalysis} disabled={analyze.isPending} className="w-full px-4 py-3 rounded-xl nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {analyze.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> AI is analyzing the call…</> : <><Sparkles className="w-4 h-4" /> Generate AI analysis</>}
          </button>
        )}

        {analysis && (
          <div className="space-y-4 mt-2">
            {analysis.transcript_summary && (
              <div className="p-4 rounded-xl bg-muted/30">
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-foreground" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wide">Transcript Summary</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{analysis.transcript_summary}</p>
              </div>
            )}

            {analysis.key_topics?.length > 0 && (
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Key Topics</div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.key_topics.map((t: string, i: number) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-[#88B8B0]/15 text-[#88B8B0] font-medium">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {analysis.objections?.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-[#C8A880]" />
                  <span className="text-xs font-bold text-[#C8A880] uppercase tracking-wide">Objections raised</span>
                </div>
                <div className="space-y-2">
                  {analysis.objections.map((o: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-[#C8A880]/10 border border-[#C8A880]/20">
                      <div className="text-sm font-semibold text-foreground mb-1">"{o.objection}"</div>
                      <div className="text-xs text-foreground/70"><span className="text-[#88B8B0] font-semibold">Suggested response:</span> {o.response_suggestion}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.next_steps?.length > 0 && (
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Recommended next steps</div>
                <ul className="space-y-1.5">
                  {analysis.next_steps.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#88B8B0] flex-shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.talk_ratio && (
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Talk ratio</div>
                <div className="h-3 bg-muted/40 rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#B8A0C8] flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${analysis.talk_ratio.rep ?? 50}%` }}>
                    {Math.round(analysis.talk_ratio.rep ?? 50)}%
                  </div>
                  <div className="h-full bg-[#88B8B0] flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${analysis.talk_ratio.prospect ?? 50}%` }}>
                    {Math.round(analysis.talk_ratio.prospect ?? 50)}%
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>You</span><span>Prospect</span>
                </div>
              </div>
            )}

            {coaching && (
              <div className="p-4 rounded-xl bg-[#B8A0C8]/10 border border-[#B8A0C8]/20">
                <div className="flex items-center gap-1.5 mb-2">
                  <Brain className="w-3.5 h-3.5 text-[#B8A0C8]" />
                  <span className="text-xs font-bold text-[#B8A0C8] uppercase tracking-wide">Coaching</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{coaching}</p>
              </div>
            )}

            {transcript && (
              <details className="p-4 rounded-xl bg-muted/30">
                <summary className="text-xs font-bold text-foreground cursor-pointer">Full transcript</summary>
                <pre className="mt-3 text-xs text-foreground/70 whitespace-pre-wrap font-mono">{transcript}</pre>
              </details>
            )}

            <button onClick={runAnalysis} disabled={analyze.isPending} className="w-full px-4 py-2 rounded-lg bg-muted/50 text-foreground text-xs font-semibold hover:bg-muted disabled:opacity-50 flex items-center justify-center gap-2">
              {analyze.isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Re-analyzing…</> : <><Sparkles className="w-3.5 h-3.5" /> Re-run AI analysis</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
