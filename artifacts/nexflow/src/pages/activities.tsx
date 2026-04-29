import { useActivities } from "@/hooks/useApi";
import { apiFetch } from "@/hooks/useApi";
import { Link } from "wouter";
import {
  Activity, Phone, Mail, MessageSquare, CheckSquare, FileText,
  StickyNote, Plus, Clock, ChevronRight, X, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  call:      { icon: Phone,         color: "text-[#88B8B0]",  bg: "bg-[#88B8B0]/20",  label: "Call" },
  email:     { icon: Mail,          color: "text-[#B8A0C8]",  bg: "bg-[#B8A0C8]/20",  label: "Email" },
  meeting:   { icon: Activity,      color: "text-[#C8A880]",  bg: "bg-[#C8A880]/20",  label: "Meeting" },
  task:      { icon: CheckSquare,   color: "text-[#90B8B8]",  bg: "bg-[#90B8B8]/20",  label: "Task" },
  whatsapp:  { icon: MessageSquare, color: "text-[#B8B880]",  bg: "bg-[#B8B880]/20",  label: "WhatsApp" },
  note:      { icon: StickyNote,    color: "text-[#C0A0B8]",  bg: "bg-[#C0A0B8]/20",  label: "Note" },
  web_visit: { icon: FileText,      color: "text-[#C8A880]",  bg: "bg-[#C8A880]/20",  label: "Web Visit" },
};

const TYPE_FILTERS = ["all", "call", "email", "meeting", "task", "whatsapp", "note"] as const;

function formatDate(d: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ActivitiesPage() {
  const [filter, setFilter] = useState<string>("all");
  const [showLog, setShowLog] = useState(false);
  const [logType, setLogType] = useState("call");
  const [logTitle, setLogTitle] = useState("");
  const [logNote, setLogNote] = useState("");
  const [logSubmitted, setLogSubmitted] = useState(false);
  const { data, isLoading, refetch } = useActivities();

  const activities = data?.activities ?? (Array.isArray(data) ? data : []);
  const filtered = filter === "all" ? activities : activities.filter((a: any) => a.type === filter);

  async function handleLog() {
    if (!logTitle.trim()) return;
    await apiFetch("/activities", { method: "POST", body: JSON.stringify({ type: logType, title: logTitle, body: logNote, status: "completed", completed_at: new Date().toISOString() }) });
    setLogSubmitted(true);
    setTimeout(() => { setShowLog(false); setLogSubmitted(false); setLogTitle(""); setLogNote(""); refetch?.(); }, 900);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activities</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Every sales touchpoint — click any lead name to open their profile</p>
        </div>
        <button
          onClick={() => setShowLog(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Log Activity
        </button>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {TYPE_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium capitalize transition-all border",
              filter === f
                ? "nf-chameleon-bg text-white border-transparent"
                : "bg-muted/40 text-muted-foreground border-border/30 hover:text-foreground"
            )}
          >
            {f === "all" ? `All (${activities.length})` : (TYPE_CONFIG[f]?.label ?? f)}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border/40" />
        <div className="space-y-4 pl-14">
          {isLoading
            ? Array(6).fill(0).map((_, i) => <div key={i} className="glass-card rounded-2xl p-4 h-20 animate-pulse" />)
            : filtered.length === 0
              ? (
                <div className="glass-card rounded-2xl p-10 text-center">
                  <Activity className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No {filter === "all" ? "" : filter} activities yet</p>
                </div>
              )
              : filtered.map((a: any) => {
                const cfg = TYPE_CONFIG[a.type] ?? TYPE_CONFIG.note;
                const Icon = cfg.icon;
                const completed = a.status === "completed";
                return (
                  <div key={a.id} className="relative glass-card rounded-2xl p-4 hover:shadow-md transition-all">
                    <div className={cn("absolute -left-9 w-8 h-8 rounded-xl flex items-center justify-center border border-border/30", cfg.bg)}>
                      <Icon className={cn("w-4 h-4", cfg.color)} />
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.bg, cfg.color)}>{cfg.label}</span>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            completed ? "bg-[#88B8B0]/20 text-[#88B8B0]" : "bg-[#C8A880]/20 text-[#C8A880]"
                          )}>
                            {completed ? <Check className="w-2.5 h-2.5 inline mr-0.5" /> : <Clock className="w-2.5 h-2.5 inline mr-0.5" />}
                            {a.status}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {formatDate(a.completed_at ?? a.created_at)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm text-foreground mb-1">{a.title}</h3>
                        {a.body && <p className="text-xs text-muted-foreground line-clamp-2">{a.body}</p>}

                        {/* Contact link — click to open lead profile */}
                        {(a.contact_id || a.contact_name) && (
                          <Link href={a.contact_id ? `/contacts/${a.contact_id}` : "#"}>
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#B8A0C8] transition-colors cursor-pointer group/link w-fit">
                              <div className="w-5 h-5 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
                                {(a.contact_name ?? "?")[0]}
                              </div>
                              <span className="font-medium">{a.contact_name || "Unknown contact"}</span>
                              <ChevronRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                            </div>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Log Activity Modal */}
      {showLog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Log Activity</h2>
              <button onClick={() => setShowLog(false)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Type</label>
                <div className="flex gap-1.5 flex-wrap">
                  {["call", "email", "meeting", "task", "whatsapp", "note"].map(t => {
                    const cfg = TYPE_CONFIG[t];
                    return (
                      <button key={t} onClick={() => setLogType(t)}
                        className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-all border",
                          logType === t ? `${cfg.bg} ${cfg.color} border-transparent` : "bg-muted/30 text-muted-foreground border-border/30 hover:text-foreground")}>
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Title *</label>
                <input
                  value={logTitle} onChange={e => setLogTitle(e.target.value)}
                  placeholder="e.g. Discovery call with Sara"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/40"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes</label>
                <textarea
                  value={logNote} onChange={e => setLogNote(e.target.value)}
                  rows={3} placeholder="What happened? Key points, next steps…"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/40 resize-none"
                />
              </div>
              <button
                onClick={handleLog} disabled={!logTitle.trim() || logSubmitted}
                className={cn("w-full py-2.5 rounded-xl text-sm font-semibold transition-all",
                  logSubmitted ? "bg-[#88B8B0] text-white" : "nf-chameleon-bg text-white hover:opacity-90 disabled:opacity-50")}
              >
                {logSubmitted ? "✓ Activity Logged!" : "Log Activity"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
