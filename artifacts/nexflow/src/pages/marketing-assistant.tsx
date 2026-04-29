import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/useApi";
import { Send, Sparkles, Bot, Loader2, TrendingUp, AlertTriangle, Megaphone, BarChart3 } from "lucide-react";

interface Msg { role: "user" | "assistant"; content: string; }

const SUGGESTIONS = [
  "Which campaign generated the most qualified leads last month?",
  "What's the best channel for warming up dormant SMB leads?",
  "Suggest 3 A/B subject line variants for our next product launch.",
  "Analyze our funnel — where are the biggest drop-offs?",
  "Recommend a 4-week re-engagement plan for stalled enterprise deals.",
];

export default function MarketingAssistantPage() {
  const [history, setHistory] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: analytics } = useQuery<any>({ queryKey: ["marketing-analytics"], queryFn: () => apiFetch("/marketing/analytics") });

  const send = useMutation({
    mutationFn: (message: string) =>
      apiFetch("/marketing/assistant-chat", {
        method: "POST",
        body: JSON.stringify({ message, history }),
      }),
    onSuccess: (r, message) => {
      setHistory((h) => [...h, { role: "user", content: message }, { role: "assistant", content: r.reply }]);
      setInput("");
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history.length, send.isPending]);

  function submit() {
    if (!input.trim() || send.isPending) return;
    send.mutate(input.trim());
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Marketing AI Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
            Ask anything about your campaigns, channels, conversion, and pipeline. The assistant has live access to your data.
          </p>
        </div>
      </div>

      {/* Snapshot */}
      <div className="grid grid-cols-4 gap-4">
        <Snap icon={Megaphone} label="Total campaigns" value={analytics?.total_campaigns ?? "—"} />
        <Snap icon={TrendingUp} label="Open rate" value={analytics?.overall?.open_rate != null ? `${analytics.overall.open_rate}%` : "—"} />
        <Snap icon={BarChart3} label="Click rate" value={analytics?.overall?.click_rate != null ? `${analytics.overall.click_rate}%` : "—"} />
        <Snap icon={AlertTriangle} label="Cost / lead" value={analytics?.overall?.cost_per_lead != null ? `$${analytics.overall.cost_per_lead}` : "—"} />
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        {/* Chat */}
        <div className="glass-card rounded-2xl flex flex-col h-[600px]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {history.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <Bot className="w-10 h-10 mb-3 opacity-40" />
                <div className="text-sm">Ask the assistant anything about your marketing.</div>
              </div>
            )}
            {history.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
                <div className={
                  m.role === "user"
                    ? "max-w-[80%] rounded-2xl px-4 py-2 bg-primary text-primary-foreground text-sm"
                    : "max-w-[85%] rounded-2xl px-4 py-3 bg-muted text-sm whitespace-pre-wrap"
                }>
                  {m.content}
                </div>
              </div>
            ))}
            {send.isPending && (
              <div className="flex">
                <div className="rounded-2xl px-4 py-3 bg-muted text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing campaigns…
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              placeholder="Ask about campaigns, channels, conversion…"
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm"
            />
            <button
              onClick={submit}
              disabled={!input.trim() || send.isPending}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </div>

        {/* Suggestions */}
        <div className="glass-card rounded-2xl p-4 h-fit">
          <div className="text-xs uppercase text-muted-foreground mb-2 font-semibold">Try asking</div>
          <div className="space-y-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send.mutate(s)}
                disabled={send.isPending}
                className="w-full text-left text-sm px-3 py-2 rounded-xl border border-border hover:bg-muted transition disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Snap({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
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
