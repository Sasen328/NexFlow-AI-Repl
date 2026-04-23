import { useCalls } from "@/hooks/useApi";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Brain, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const SENTIMENT_LABEL = (score: number | null) => {
  if (score === null) return null;
  if (score >= 0.75) return { label: "Very Positive", color: "text-[#88B8B0]" };
  if (score >= 0.5) return { label: "Positive", color: "text-[#B8B880]" };
  if (score >= 0.3) return { label: "Neutral", color: "text-[#C8A880]" };
  return { label: "Negative", color: "text-destructive" };
};

const STATUS_ICON = { completed: Phone, scheduled: Clock, missed: PhoneMissed, in_progress: Phone };

export default function CallsPage() {
  const { data, isLoading } = useCalls();
  const calls = data?.calls ?? [];

  const avgScore = calls.filter((c: any) => c.callScore !== null).reduce((acc: number, c: any, _: any, arr: any) => acc + c.callScore / arr.filter((x: any) => x.callScore !== null).length, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calls</h1>
          <p className="text-muted-foreground text-sm mt-0.5">AI-scored call intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#B8A0C8]" />
            <span className="text-sm font-semibold text-foreground">Avg Score: {avgScore ? Math.round(avgScore) : "—"}</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            <Phone className="w-4 h-4" />
            Log Call
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="glass-card rounded-2xl p-5 h-28 animate-pulse" />)
        ) : calls.map((c: any) => {
          const sentiment = SENTIMENT_LABEL(c.sentimentScore);
          const mins = c.durationSeconds ? Math.floor(c.durationSeconds / 60) : null;
          const secs = c.durationSeconds ? c.durationSeconds % 60 : null;
          const scoreColor = (c.callScore ?? 0) >= 80 ? "#88B8B0" : (c.callScore ?? 0) >= 60 ? "#B8B880" : "#C0A0B8";
          return (
            <div key={c.id} className="glass-card rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  c.status === "completed" ? "bg-[#88B8B0]/20" : c.status === "missed" ? "bg-destructive/20" : "bg-muted/60"
                )}>
                  {c.direction === "inbound"
                    ? <PhoneIncoming className={cn("w-5 h-5", c.status === "completed" ? "text-[#88B8B0]" : "text-muted-foreground")} />
                    : <PhoneOutgoing className={cn("w-5 h-5", c.status === "completed" ? "text-[#88B8B0]" : c.status === "missed" ? "text-destructive" : "text-muted-foreground")} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {c.contact ? `${c.contact.firstName} ${c.contact.lastName}` : "Unknown Contact"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                        <span className="capitalize">{c.direction} · {c.status}</span>
                        {mins !== null && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {mins}m {secs}s
                          </span>
                        )}
                      </div>
                    </div>
                    {c.callScore !== null && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-center">
                          <div className="text-lg font-bold" style={{ color: scoreColor }}>{c.callScore}</div>
                          <div className="text-xs text-muted-foreground">AI Score</div>
                        </div>
                      </div>
                    )}
                  </div>
                  {sentiment && (
                    <span className={cn("text-xs font-medium", sentiment.color)}>{sentiment.label} sentiment</span>
                  )}
                  {c.coachingNotes && (
                    <div className="mt-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Brain className="w-3 h-3 text-[#B8A0C8]" />
                        <span className="text-xs font-semibold text-[#B8A0C8]">AI Coaching</span>
                      </div>
                      <p className="text-xs text-foreground/80">{c.coachingNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
