import { useActivities } from "@/hooks/useApi";
import { Activity, Phone, Mail, MessageSquare, CheckSquare, FileText, StickyNote, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  call: { icon: Phone, color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/20", label: "Call" },
  email: { icon: Mail, color: "text-[#B8A0C8]", bg: "bg-[#B8A0C8]/20", label: "Email" },
  meeting: { icon: Activity, color: "text-[#C8A880]", bg: "bg-[#C8A880]/20", label: "Meeting" },
  task: { icon: CheckSquare, color: "text-[#90B8B8]", bg: "bg-[#90B8B8]/20", label: "Task" },
  whatsapp: { icon: MessageSquare, color: "text-[#B8B880]", bg: "bg-[#B8B880]/20", label: "WhatsApp" },
  note: { icon: StickyNote, color: "text-[#C0A0B8]", bg: "bg-[#C0A0B8]/20", label: "Note" },
};

export default function ActivitiesPage() {
  const { data, isLoading } = useActivities();
  const activities = data?.activities ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activities</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Timeline of all sales touchpoints</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Log Activity
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border/40" />
        <div className="space-y-4 pl-14">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="glass-card rounded-2xl p-4 h-20 animate-pulse" />)
          ) : activities.map((a: any) => {
            const cfg = TYPE_CONFIG[a.type] ?? TYPE_CONFIG.note;
            const Icon = cfg.icon;
            return (
              <div key={a.id} className="relative glass-card rounded-2xl p-4 hover:shadow-md transition-all">
                <div className={cn("absolute -left-9 w-8 h-8 rounded-xl flex items-center justify-center border border-border/30", cfg.bg)}>
                  <Icon className={cn("w-4 h-4", cfg.color)} />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.bg, cfg.color)}>{cfg.label}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        a.status === "completed" ? "bg-[#88B8B0]/20 text-[#88B8B0]" : "bg-[#C8A880]/20 text-[#C8A880]"
                      )}>{a.status}</span>
                    </div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">{a.title}</h3>
                    {a.body && <p className="text-xs text-muted-foreground line-clamp-2">{a.body}</p>}
                    {a.contact && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="w-4 h-4 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-[8px] font-bold">
                          {a.contact.firstName?.[0]}
                        </div>
                        {a.contact.firstName} {a.contact.lastName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
