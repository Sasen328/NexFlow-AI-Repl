import { useState } from "react";
import { MessageSquare, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import WhatsAppPage from "@/pages/whatsapp";
import EmailPage from "@/pages/email";

/**
 * Call Center → Messages — merged WhatsApp + Email inbox per the spec.
 * Channel toggle in the header; the underlying pages render below.
 */
type Channel = "whatsapp" | "email";

export default function CallCenterMessagesPage() {
  const [channel, setChannel] = useState<Channel>("whatsapp");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground text-sm mt-0.5">WhatsApp and Email in one inbox.</p>
        </div>
        <div className="inline-flex p-1 rounded-xl bg-muted/40 border border-border/40">
          <Btn label="WhatsApp" icon={MessageSquare} color="#88B8B0" active={channel === "whatsapp"} onClick={() => setChannel("whatsapp")} />
          <Btn label="Email"    icon={Mail}          color="#B8A0C8" active={channel === "email"}    onClick={() => setChannel("email")} />
        </div>
      </div>
      {channel === "whatsapp" ? <WhatsAppPage /> : <EmailPage />}
    </div>
  );
}

function Btn({ label, icon: Icon, color, active, onClick }: { label: string; icon: any; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
        active ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
      style={active ? { color } : undefined}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
