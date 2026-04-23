import { useNotifications, useMarkNotificationRead } from "@/hooks/useApi";
import { Bell, Brain, TrendingUp, Phone, CheckSquare, Settings, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  signal: { icon: TrendingUp, color: "text-[#B8B880]", bg: "bg-[#B8B880]/20" },
  deal: { icon: TrendingUp, color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/20" },
  ai: { icon: Brain, color: "text-[#B8A0C8]", bg: "bg-[#B8A0C8]/20" },
  call: { icon: Phone, color: "text-[#90B8B8]", bg: "bg-[#90B8B8]/20" },
  task: { icon: CheckSquare, color: "text-[#C8A880]", bg: "bg-[#C8A880]/20" },
  system: { icon: Settings, color: "text-muted-foreground", bg: "bg-muted/60" },
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const notifications = data?.notifications ?? [];
  const unread = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{unread} unread notifications</p>
        </div>
        {unread > 0 && (
          <div className="w-6 h-6 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-xs font-bold">
            {unread}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="glass-card rounded-2xl p-4 h-20 animate-pulse" />)
        ) : notifications.map((n: any) => {
          const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
          const Icon = cfg.icon;
          return (
            <div
              key={n.id}
              className={cn(
                "glass-card rounded-2xl p-4 transition-all",
                !n.read && "nf-chameleon-border"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", cfg.bg)}>
                  <Icon className={cn("w-4 h-4", cfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={cn("text-sm font-semibold", n.read ? "text-foreground/70" : "text-foreground")}>
                      {n.title}
                    </h3>
                    {!n.read && (
                      <button
                        onClick={() => markRead.mutate(n.id)}
                        className="flex-shrink-0 p-1 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium capitalize", cfg.bg, cfg.color)}>
                      {n.type}
                    </span>
                    {!n.read && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[#B8A0C8]/20 text-[#B8A0C8] font-medium">New</span>
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
