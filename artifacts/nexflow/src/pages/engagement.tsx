import { useState } from "react";
import { Activity, Phone, Calendar, Sparkles, Mic, ArrowRight, Mail, MessageSquare, Headphones } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import ActivitiesPage from "@/pages/activities";
import CallsPage from "@/pages/calls";
import MeetingsPage from "@/pages/meetings";

type Tab = "all" | "calls" | "meetings";

const TABS: { key: Tab; label: string; icon: any; color: string }[] = [
  { key: "all",      label: "All Activities", icon: Activity, color: "#B8A0C8" },
  { key: "calls",    label: "Calls",          icon: Phone,    color: "#88B8B0" },
  { key: "meetings", label: "Meetings",       icon: Calendar, color: "#C8A880" },
];

/**
 * /engagement — Engagement Activities hub.
 *
 * Replaces the standalone Engagement tab on contact profiles by giving the
 * whole org a single roll-up of every touchpoint with AI conversation
 * intelligence layered on top.
 */
export default function EngagementPage() {
  const [tab, setTab] = useState<Tab>("all");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#B8A0C8]" /> Engagement Activities
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Calls, meetings, emails, and messages — every touchpoint with AI conversation intelligence.
          </p>
        </div>
      </div>

      {/* AI summary */}
      <div
        className="rounded-2xl p-5 border relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(184,160,200,0.10), rgba(136,184,176,0.10))", borderColor: "rgba(184,160,200,0.3)" }}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider font-bold text-[#B8A0C8] mb-0.5">Engagement AI Briefing</div>
            <p className="text-sm text-foreground/85 leading-relaxed">
              Click any call or meeting for an AI summary, sentiment, and recommended next move.
              Switch the tab below to filter by channel.
            </p>
          </div>
          <Link href="/conversation-intelligence">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/60 border border-[#B8A0C8]/40 text-[11px] font-semibold text-[#B8A0C8] hover:bg-white/80 flex-shrink-0">
              <Mic className="w-3 h-3" /> Conversation Intel <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      </div>

      {/* Channel quick-jump */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Email", icon: Mail, color: "#B8A0C8", href: "/email" },
          { label: "WhatsApp", icon: MessageSquare, color: "#88B8B0", href: "/whatsapp" },
          { label: "Power Dialer", icon: Phone, color: "#C8A880", href: "/power-dialer" },
          { label: "Voice Agent", icon: Headphones, color: "#C0A0B8", href: "/voice-agents" },
        ].map((a) => (
          <Link key={a.label} href={a.href}>
            <div className="flex items-center gap-3 p-3 rounded-xl glass-card hover:shadow-md transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}20` }}>
                <a.icon className="w-4 h-4" style={{ color: a.color }} />
              </div>
              <span className="text-sm font-medium text-foreground flex-1">{a.label}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Sub-tab nav */}
      <div className="flex items-center gap-1 p-1 rounded-2xl glass-card w-fit">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                active ? "bg-background shadow-sm" : "text-muted-foreground hover:bg-muted/40"
              )}
              style={active ? { color: t.color } : undefined}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Sub-tab content */}
      <div>
        {tab === "all" && <ActivitiesPage />}
        {tab === "calls" && <CallsPage />}
        {tab === "meetings" && <MeetingsPage />}
      </div>
    </div>
  );
}
