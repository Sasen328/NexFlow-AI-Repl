import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/useApi";
import {
  Send, Sparkles, Bot, Loader2, TrendingUp, AlertTriangle,
  Megaphone, BarChart3, ChevronDown, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "assistant"; content: string; provider?: string }

const SUGGESTIONS = [
  "Which campaign generated the most qualified leads last month?",
  "What's the best channel for warming up dormant SMB leads?",
  "Suggest 3 A/B subject line variants for our next product launch.",
  "Analyze our funnel — where are the biggest drop-offs?",
  "Recommend a 4-week re-engagement plan for stalled enterprise deals.",
];

// Provider-routed AI models (same set as the main Sales assistant).
const PROVIDERS = [
  { key: "auto",       label: "Auto",        sub: "Best model picked for the task",        color: "#B8A0C8" },
  { key: "anthropic",  label: "Claude 4.6",  sub: "Best for nuance, drafting, persuasion", color: "#C8A880" },
  { key: "openai",     label: "GPT-4o",      sub: "Balanced reasoning + speed",            color: "#88B8B0" },
  { key: "gemini",     label: "Gemini 2.5",  sub: "Long context, multilingual",            color: "#90B8D8" },
  { key: "perplexity", label: "Perplexity",  sub: "Live web grounding for fresh facts",    color: "#B8B880" },
] as const;

export default function MarketingAssistantPage() {
  const [history, setHistory] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<typeof PROVIDERS[number]["key"]>("auto");
  const [providerOpen, setProviderOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const providerWrapRef = useRef<HTMLDivElement>(null);

  const { data: analytics } = useQuery<any>({ queryKey: ["marketing-analytics"], queryFn: () => apiFetch("/marketing/analytics") });

  const send = useMutation({
    mutationFn: (message: string) =>
      apiFetch("/marketing/assistant-chat", {
        method: "POST",
        body: JSON.stringify({ message, history, provider }),
      }) as Promise<{ reply: string; provider_used?: string }>,
    onSuccess: (r, message) => {
      setHistory((h) => [
        ...h,
        { role: "user", content: message },
        { role: "assistant", content: r.reply, provider: r.provider_used ?? provider },
      ]);
      setInput("");
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history.length, send.isPending]);

  // Close provider dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (providerWrapRef.current && !providerWrapRef.current.contains(e.target as Node)) {
        setProviderOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit() {
    if (!input.trim() || send.isPending) return;
    send.mutate(input.trim());
  }

  const currentProvider = PROVIDERS.find(p => p.key === provider) ?? PROVIDERS[0];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Marketing AI Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
            Ask anything about your campaigns, channels, conversion, and pipeline. The assistant has live access to your data.
          </p>
        </div>

        {/* Provider selector */}
        <div className="relative" ref={providerWrapRef}>
          <button
            onClick={() => setProviderOpen(o => !o)}
            className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm hover:bg-muted/40 transition"
            aria-haspopup="listbox"
            aria-expanded={providerOpen}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: currentProvider.color }} />
            <span className="font-medium">{currentProvider.label}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>
          {providerOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-popover p-1.5 shadow-lg z-20">
              {PROVIDERS.map(p => (
                <button
                  key={p.key}
                  onClick={() => { setProvider(p.key); setProviderOpen(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg flex items-start gap-2 hover:bg-muted/40 transition-colors",
                    provider === p.key && "bg-muted/60",
                  )}
                >
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: p.color }} />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{p.label}</span>
                    <span className="block text-xs text-muted-foreground">{p.sub}</span>
                  </span>
                  {provider === p.key && <CheckCircle2 className="w-3.5 h-3.5 text-[#88B8B0] mt-0.5" />}
                </button>
              ))}
            </div>
          )}
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
                <div className="text-xs mt-1 opacity-70">Routing to <span className="font-medium" style={{ color: currentProvider.color }}>{currentProvider.label}</span></div>
              </div>
            )}
            {history.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex flex-col items-start"}>
                <div className={
                  m.role === "user"
                    ? "max-w-[80%] rounded-2xl px-4 py-2 bg-primary text-primary-foreground text-sm"
                    : "max-w-[85%] rounded-2xl px-4 py-3 bg-muted text-sm whitespace-pre-wrap"
                }>
                  {m.content}
                </div>
                {m.role === "assistant" && m.provider && (
                  <span className="text-[10px] uppercase text-muted-foreground mt-1 ml-2">via {m.provider}</span>
                )}
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
