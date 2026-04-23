import { useCalls } from "@/hooks/useApi";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Brain,
  Mic, MicOff, Play, Pause, Volume2, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Activity
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

function WaveformBar({ active }: { active: boolean }) {
  const bars = [3, 6, 9, 5, 8, 11, 7, 4, 9, 6, 3, 8, 5, 10, 7, 4, 6, 9, 5, 8];
  return (
    <div className="flex items-center gap-0.5 h-8">
      {bars.map((h, i) => (
        <div
          key={i}
          className={cn("w-1 rounded-full transition-all", active ? "bg-[#88B8B0]" : "bg-muted/60")}
          style={{ height: `${h * 2.5}px`, animationDelay: `${i * 0.05}s` }}
        />
      ))}
    </div>
  );
}

const LIVE_CALL = {
  contact: "Sara Al-Mansouri",
  company: "Gulf Ventures",
  duration: "04:23",
  score: 88,
  sentiment: 0.78,
  talkRatio: { me: 42, them: 58 },
  topics: ["Proposal pricing", "Arabic AI agents", "Q2 timeline"],
  coaching: [
    { type: "good", text: "Excellent active listening — letting Sara lead the conversation" },
    { type: "tip", text: "Mention the Gulf Ventures case study within next 2 minutes" },
    { type: "warn", text: "Avoid technical jargon — Sara prefers business outcomes" },
  ],
};

export default function CallsPage() {
  const { data, isLoading } = useCalls();
  const calls = data?.calls ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);
  const [liveActive, setLiveActive] = useState(true);

  const completedCalls = calls.filter((c: any) => c.status === "completed");
  const avgScore = completedCalls.length
    ? Math.round(completedCalls.reduce((acc: number, c: any) => acc + (c.call_score ?? 0), 0) / completedCalls.filter((c: any) => c.call_score !== null).length)
    : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Phone className="w-6 h-6 text-[#88B8B0]" />
            Call Monitoring
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Real-time AI coaching and call intelligence</p>
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
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            <Phone className="w-4 h-4" />
            Start Call
          </button>
        </div>
      </div>

      {/* LIVE CALL MONITOR */}
      <div className="nf-chameleon-border rounded-2xl p-5 glass-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", liveActive ? "bg-[#88B8B0] animate-pulse" : "bg-muted")} />
            <span className="text-sm font-bold text-foreground">Live Call Monitor</span>
            {liveActive && <span className="text-xs text-[#88B8B0] font-medium">● LIVE</span>}
          </div>
          <button
            onClick={() => setLiveActive(!liveActive)}
            className={cn("text-xs px-3 py-1.5 rounded-lg font-medium transition-all",
              liveActive ? "bg-destructive/20 text-destructive" : "nf-chameleon-bg text-white"
            )}
          >
            {liveActive ? "End Call" : "Join Call"}
          </button>
        </div>

        {liveActive ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left — Call Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl nf-chameleon-bg flex items-center justify-center text-white font-bold">SA</div>
                <div>
                  <div className="font-bold text-foreground">{LIVE_CALL.contact}</div>
                  <div className="text-sm text-muted-foreground">{LIVE_CALL.company}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xl font-mono font-bold text-[#88B8B0]">{LIVE_CALL.duration}</div>
                  <div className="text-[10px] text-muted-foreground">Duration</div>
                </div>
              </div>
              <WaveformBar active={liveActive} />
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#88B8B0]/20 text-[#88B8B0] text-sm font-medium hover:bg-[#88B8B0]/30 transition-colors">
                  <Mic className="w-4 h-4" />
                  Mute
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-muted/50 text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
                  <Volume2 className="w-4 h-4" />
                  Speaker
                </button>
              </div>
            </div>

            {/* Center — Live Score + Sentiment */}
            <div className="flex flex-col items-center justify-center gap-4">
              <ScoreGauge score={LIVE_CALL.score} />
              <div className="w-full space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Your talk time</span>
                    <span>{LIVE_CALL.talkRatio.me}%</span>
                  </div>
                  <div className="h-2 bg-muted/40 rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#B8A0C8]" style={{ width: `${LIVE_CALL.talkRatio.me}%` }} />
                    <div className="h-full bg-[#88B8B0]" style={{ width: `${LIVE_CALL.talkRatio.them}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                    <span className="text-[#B8A0C8]">You</span>
                    <span className="text-[#88B8B0]">Sara</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#88B8B0]/10 border border-[#88B8B0]/20 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#88B8B0]" />
                  <span className="text-xs text-[#88B8B0] font-medium">Very Positive Sentiment</span>
                </div>
              </div>
            </div>

            {/* Right — AI Coaching */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-[#B8A0C8]" />
                <span className="text-sm font-semibold text-foreground">Live AI Coaching</span>
              </div>
              <div className="space-y-2">
                {LIVE_CALL.coaching.map((c, i) => (
                  <div key={i} className={cn(
                    "flex items-start gap-2 p-2.5 rounded-lg text-xs",
                    c.type === "good" ? "bg-[#88B8B0]/10 border border-[#88B8B0]/20" :
                      c.type === "tip" ? "bg-[#B8A0C8]/10 border border-[#B8A0C8]/20" :
                        "bg-[#C8A880]/10 border border-[#C8A880]/20"
                  )}>
                    {c.type === "good" ? <CheckCircle2 className="w-3.5 h-3.5 text-[#88B8B0] flex-shrink-0 mt-0.5" /> :
                      c.type === "tip" ? <Brain className="w-3.5 h-3.5 text-[#B8A0C8] flex-shrink-0 mt-0.5" /> :
                        <AlertCircle className="w-3.5 h-3.5 text-[#C8A880] flex-shrink-0 mt-0.5" />}
                    <span className={c.type === "good" ? "text-[#88B8B0]" : c.type === "tip" ? "text-[#B8A0C8]" : "text-[#C8A880]"}>{c.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-1.5">Topics detected</div>
                <div className="flex flex-wrap gap-1">
                  {LIVE_CALL.topics.map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Phone className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No active call. Click "Join Call" to simulate live monitoring.</p>
          </div>
        )}
      </div>

      {/* Call History */}
      <div>
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Call History
        </h2>
        <div className="space-y-3">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="glass-card rounded-2xl p-5 h-24 animate-pulse" />)
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
                      {mins !== null && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {mins}m {secs}s
                        </span>
                      )}
                      {sentiment && (
                        <span className={cn("flex items-center gap-1 font-medium", sentiment.color)}>
                          <sentiment.icon className="w-3 h-3" />
                          {sentiment.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {c.call_score !== null && (
                    <div className="flex-shrink-0">
                      <ScoreGauge score={c.call_score} />
                    </div>
                  )}
                  {isExpanded
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </button>

                {isExpanded && c.coaching_notes && (
                  <div className="px-4 pb-4 border-t border-border/20">
                    <div className="mt-3 p-3.5 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Brain className="w-3.5 h-3.5 text-[#B8A0C8]" />
                        <span className="text-xs font-bold text-[#B8A0C8]">AI Coaching Notes</span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{c.coaching_notes}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <Play className="w-3.5 h-3.5" />
                          Play recording
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" />
                          View transcript
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
