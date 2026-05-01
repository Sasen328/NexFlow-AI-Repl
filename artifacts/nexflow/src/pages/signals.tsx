import { useState } from "react";
import { useSignals, apiFetch } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { Zap, ExternalLink, Eye, TrendingUp, Users, AlertCircle, Package, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  funding_round: { label: "Funding", icon: TrendingUp, color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/20" },
  exec_move: { label: "Exec Move", icon: Users, color: "text-[#B8A0C8]", bg: "bg-[#B8A0C8]/20" },
  expansion: { label: "Expansion", icon: Package, color: "text-[#C8A880]", bg: "bg-[#C8A880]/20" },
  hiring: { label: "Hiring", icon: Users, color: "text-[#90B8B8]", bg: "bg-[#90B8B8]/20" },
  product_launch: { label: "Launch", icon: Zap, color: "text-[#B8B880]", bg: "bg-[#B8B880]/20" },
  news: { label: "News", icon: AlertCircle, color: "text-[#C0A0B8]", bg: "bg-[#C0A0B8]/20" },
};

export default function SignalsPage() {
  const { data, isLoading } = useSignals();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);
  const signals = data?.signals ?? [];

  async function refreshFromWamda() {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const result = await apiFetch("/signals/refresh-wamda", { method: "POST" });
      const inserted = result?.inserted ?? 0;
      const dup = result?.skipped_duplicate ?? 0;
      const matched = result?.matched_to_company ?? 0;
      setRefreshMsg(
        inserted > 0
          ? `${inserted} new from Wamda · ${matched} matched to companies`
          : `Up to date · ${dup} already in feed`,
      );
      await queryClient.invalidateQueries({ queryKey: ["signals"] });
    } catch (err: any) {
      setRefreshMsg(`Couldn't reach Wamda · ${err?.message ?? "unknown"}`);
    } finally {
      setRefreshing(false);
      setTimeout(() => setRefreshMsg(null), 6000);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Signals</h1>
          <p className="text-muted-foreground text-sm mt-0.5">AI-monitored buying signals and triggers</p>
        </div>
        <div className="flex items-center gap-3">
          {refreshMsg && (
            <span className="text-xs text-muted-foreground bg-[#1F1B2E]/40 px-3 py-1.5 rounded-full border border-white/5">
              {refreshMsg}
            </span>
          )}
          <button
            onClick={refreshFromWamda}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#88B8B0]/15 text-[#88B8B0] hover:bg-[#88B8B0]/25 transition disabled:opacity-50"
            title="Pull live MENA startup signals from Wamda"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
            {refreshing ? "Pulling…" : "Pull from Wamda"}
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-[#B8B880]" />
            <span>{signals.filter((s: any) => s.status === "new").length} new</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="glass-card rounded-2xl p-5 h-24 animate-pulse" />)
        ) : signals.map((s: any) => {
          const cfg = TYPE_CONFIG[s.type] ?? TYPE_CONFIG.news;
          const Icon = cfg.icon;
          const score = s.score ?? 0;
          const scoreColor = score >= 85 ? "#88B8B0" : score >= 70 ? "#B8B880" : "#C0A0B8";
          return (
            <div
              key={s.id}
              className={cn(
                "glass-card rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer",
                s.status === "new" && "nf-chameleon-border"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", cfg.bg)}>
                  <Icon className={cn("w-5 h-5", cfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1">{s.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs"
                        style={{ borderColor: scoreColor, color: scoreColor }}
                      >
                        {score}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{s.body}</p>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.bg, cfg.color)}>
                      {cfg.label}
                    </span>
                    {s.status === "new" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#88B8B0]/20 text-[#88B8B0] font-medium">New</span>
                    )}
                    {s.contact && (
                      <span className="text-xs text-muted-foreground">
                        {s.contact.firstName} {s.contact.lastName}
                      </span>
                    )}
                    {s.company && (
                      <span className="text-xs text-muted-foreground font-medium">{s.company.name}</span>
                    )}
                    {s.sourceUrl && (
                      <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-3 h-3" />
                        Source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
