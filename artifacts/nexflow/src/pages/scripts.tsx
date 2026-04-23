import { useScripts } from "@/hooks/useApi";
import { FileText, Plus, Globe, Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  cold_call: { label: "Cold Call", color: "text-[#B8A0C8]", bg: "bg-[#B8A0C8]/20" },
  follow_up: { label: "Follow-up", color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/20" },
  closing: { label: "Closing", color: "text-[#C8A880]", bg: "bg-[#C8A880]/20" },
  objection_handling: { label: "Objection", color: "text-[#90B8B8]", bg: "bg-[#90B8B8]/20" },
  demo: { label: "Demo", color: "text-[#B8B880]", bg: "bg-[#B8B880]/20" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-[#88B8B0]" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function ScriptsPage() {
  const { data, isLoading } = useScripts();
  const scripts = data?.scripts ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scripts</h1>
          <p className="text-muted-foreground text-sm mt-0.5">AI-powered sales scripts and playbooks</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          New Script
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="glass-card rounded-2xl p-5 h-32 animate-pulse" />)
        ) : scripts.map((s: any) => {
          const cfg = TYPE_CONFIG[s.type] ?? TYPE_CONFIG.cold_call;
          const isExpanded = expanded === s.id;
          const isArabic = s.language === "ar";
          return (
            <div key={s.id} className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", cfg.bg)}>
                    <FileText className={cn("w-5 h-5", cfg.color)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{s.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.bg, cfg.color)}>{cfg.label}</span>
                      {isArabic && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Globe className="w-3 h-3" />
                          Arabic
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CopyButton text={s.content} />
                  <button
                    onClick={() => setExpanded(isExpanded ? null : s.id)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isExpanded ? "Collapse" : "Expand"}
                  </button>
                </div>
              </div>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  isExpanded ? "max-h-[500px]" : "max-h-20"
                )}
              >
                <div
                  className={cn(
                    "p-4 rounded-xl bg-muted/30 text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed",
                    isArabic && "text-right font-arabic"
                  )}
                  dir={isArabic ? "rtl" : "ltr"}
                >
                  {s.content}
                </div>
              </div>
              {!isExpanded && (
                <div className="text-center mt-2">
                  <button onClick={() => setExpanded(s.id)} className="text-xs text-muted-foreground hover:text-foreground">
                    Show full script ↓
                  </button>
                </div>
              )}
              {s.tags?.length > 0 && (
                <div className="flex gap-1 mt-3 flex-wrap">
                  {s.tags.map((t: string) => (
                    <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">{t}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
