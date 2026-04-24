import { Link } from "wouter";
import {
  Sparkles, Sun, AlertTriangle, TrendingUp, Phone, Mail, MessageSquare,
  Calendar, Zap, ArrowRight, Coffee, Brain, Target, Users, Activity, RefreshCw, ChevronRight,
  Clock, Loader2,
} from "lucide-react";
import { useDashboard, useContacts, useForgottenLeads, useRegenerateInsights } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return { greeting: "Good morning", icon: Sun, color: "#C8A880" };
  if (h < 18) return { greeting: "Good afternoon", icon: Sun, color: "#B8B880" };
  return { greeting: "Good evening", icon: Coffee, color: "#B8A0C8" };
}

const TODAY_AGENDA = [
  { time: "09:00", title: "Discovery call · Sara Al-Mansouri", channel: "voice", status: "upcoming" },
  { time: "10:30", title: "Demo follow-up · Ahmed Al-Rashidi", channel: "voice", status: "upcoming" },
  { time: "12:00", title: "Send proposal · Aramco Digital", channel: "email", status: "task" },
  { time: "14:00", title: "WhatsApp check-in · Fatima Khalid", channel: "whatsapp", status: "task" },
  { time: "16:00", title: "Pipeline review with team", channel: "voice", status: "upcoming" },
];

const HOT_SIGNALS = [
  {
    title: "Gulf Ventures closed $50M Series B",
    contact: "Sara Al-Mansouri",
    contactId: "c1",
    impact: "+$1.2M expansion potential",
    action: "Call within 24h",
    score: 96,
    source: "Crunchbase",
  },
  {
    title: "Ahmed Al-Rashidi promoted to CIO",
    contact: "Ahmed Al-Rashidi",
    contactId: "c2",
    impact: "Increased budget authority",
    action: "Send congrats + MSA",
    score: 87,
    source: "LinkedIn",
  },
  {
    title: "Aramco Digital approved Q2 budget",
    contact: "Mohammed Al-Otaibi",
    contactId: "c3",
    impact: "Contract ready to sign",
    action: "Push to Negotiation",
    score: 84,
    source: "WhatsApp message",
  },
];

const PRIORITY_REASONS: Record<string, { reason: string; channel: string }> = {
  default: { reason: "High lead score · ready for outreach", channel: "call" },
};

const AT_RISK = [
  { name: "Layla Hassan", deal: "SMB Starter", value: 95000, risk: "Score dropped 72 → 65", days: 9 },
  { name: "Khalid Al-Hamdan", deal: "Pilot Expansion", value: 145000, risk: "No contact in 14 days", days: 14 },
];

const CHANNEL_ICON: Record<string, any> = {
  voice: Phone, email: Mail, whatsapp: MessageSquare, call: Phone,
};

export default function BriefingPage() {
  const { data: dash } = useDashboard();
  const { data: contactsData } = useContacts({ limit: "10" });
  const { data: forgottenData } = useForgottenLeads();
  const regenerate = useRegenerateInsights();
  const forgotten = (forgottenData?.leads ?? []) as any[];
  const forgottenSummary = forgottenData?.summary as string | undefined;
  const allContacts = (contactsData?.contacts ?? []) as any[];
  const priorityContacts = [...allContacts]
    .sort((a, b) => (b.lead_score ?? 0) - (a.lead_score ?? 0))
    .slice(0, 3)
    .map((c, i) => ({
      id: c.id,
      name: `${c.first_name} ${c.last_name}`,
      company: c.company_name ?? "—",
      reason: c.notes?.split(".")[0] ?? "High lead score · ready for outreach",
      score: c.lead_score ?? 0,
      value: 1500000 + i * 600000,
      channel: i === 2 ? "whatsapp" : "call",
    }));
  const tod = getTimeOfDay();
  const TODIcon = tod.icon;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const stats = dash?.stats ?? {};
  const totalPipeline = ((stats.totalRevenue ?? 0) / 100).toLocaleString();

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Hero */}
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 nf-chameleon-bg opacity-10 rounded-full blur-3xl -mt-20 -mr-20" />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${tod.color}25` }}>
                <TODIcon className="w-6 h-6" style={{ color: tod.color }} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">{today} · Riyadh</div>
                <h1 className="text-3xl font-black text-foreground leading-tight">{tod.greeting}, Admin</h1>
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-3 h-3" />
              Refresh briefing
            </button>
          </div>

          <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-[#B8A0C8]/10 via-[#88B8B0]/5 to-[#C8A880]/10 border border-[#B8A0C8]/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-[#B8A0C8] uppercase tracking-wider mb-1">Your AI Daily Briefing</div>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  You have <span className="font-bold text-foreground">3 high-intent prospects</span> ready for outreach today, with a combined pipeline of{" "}
                  <span className="font-bold text-[#88B8B0]">${totalPipeline}</span>. The most urgent is{" "}
                  <span className="font-bold text-foreground">Sara Al-Mansouri</span> — Gulf Ventures closed a $50M Series B last night, opening a 24-hour expansion window.{" "}
                  <span className="font-bold text-destructive">2 deals are at risk</span> and need a touch this week.
                  Your AI Voice Agent handled <span className="font-bold text-foreground">12 conversations</span> overnight — 4 qualified leads added.
                </p>
              </div>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            {[
              { label: "Calls Today", value: "5", sub: "3 confirmed", color: "#88B8B0", icon: Phone },
              { label: "Hot Signals", value: HOT_SIGNALS.length, sub: "Last 24h", color: "#B8B880", icon: Zap },
              { label: "AI Agent Sessions", value: "12", sub: "4 qualified", color: "#B8A0C8", icon: Brain },
              { label: "At-Risk Deals", value: AT_RISK.length, sub: "$240K exposure", color: "#C0A0B8", icon: AlertTriangle },
            ].map(s => (
              <div key={s.label} className="rounded-xl bg-muted/30 p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}20` }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-black text-foreground leading-none">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {forgotten.length > 0 && (
        <div className="nf-chameleon-border rounded-2xl glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C8A880]" />
              <h2 className="font-semibold text-foreground">Forgotten Leads</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#C8A880]/20 text-[#C8A880] font-bold">{forgotten.length}</span>
            </div>
            <button
              onClick={() => regenerate.mutate()}
              disabled={regenerate.isPending}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#B8A0C8]/15 text-[#B8A0C8] text-xs font-semibold hover:bg-[#B8A0C8]/25 disabled:opacity-50"
            >
              {regenerate.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {regenerate.isPending ? "Regenerating…" : "Regenerate AI insights"}
            </button>
          </div>
          {forgottenSummary && (
            <p className="text-xs text-foreground/80 italic mb-3 px-3 py-2 rounded-lg bg-[#B8A0C8]/10">{forgottenSummary}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {forgotten.slice(0, 6).map((l: any) => (
              <Link key={l.id} href={`/contacts/${l.id}`}>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 cursor-pointer">
                  <div className="w-8 h-8 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {(l.first_name?.[0] ?? "") + (l.last_name?.[0] ?? "")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{l.first_name} {l.last_name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{l.company_name ?? "—"} · silent {Math.round(Number(l.days_silent))}d</div>
                  </div>
                  <div className="text-xs font-bold text-[#88B8B0]">{Math.round(Number(l.lead_score))}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Priority Contacts */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-[#B8A0C8]" />
              Today's Top 3 to Call
            </h2>
            <Link href="/contacts"><span className="text-xs text-[#B8A0C8] hover:underline cursor-pointer">All contacts</span></Link>
          </div>
          <div className="space-y-3">
            {priorityContacts.length === 0 && (
              <div className="text-sm text-muted-foreground py-6 text-center">Loading priority contacts…</div>
            )}
            {priorityContacts.map((c, i) => {
              const Channel = CHANNEL_ICON[c.channel];
              return (
                <Link key={c.id} href={`/contacts/${c.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
                    <div className="text-xl font-black text-muted-foreground/30 w-6 text-center flex-shrink-0">{i + 1}</div>
                    <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {c.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{c.name}</span>
                        <span className="text-xs text-muted-foreground">· {c.company}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">{c.reason}</div>
                    </div>
                    <div className="hidden md:block text-right flex-shrink-0">
                      <div className="text-sm font-bold text-[#88B8B0]">${(c.value / 100).toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground">pipeline</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs" style={{
                        background: `${c.score >= 85 ? "#88B8B0" : c.score >= 70 ? "#B8B880" : "#C0A0B8"}25`,
                        color: c.score >= 85 ? "#88B8B0" : c.score >= 70 ? "#B8B880" : "#C0A0B8"
                      }}>
                        {c.score}
                      </div>
                      <button className="w-9 h-9 rounded-full nf-chameleon-bg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Channel className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Today's Agenda */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#88B8B0]" />
              Today's Schedule
            </h2>
          </div>
          <div className="space-y-2.5">
            {TODAY_AGENDA.map((item, i) => {
              const Channel = CHANNEL_ICON[item.channel];
              return (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="text-[10px] font-bold text-muted-foreground w-10 text-right pt-1 flex-shrink-0">{item.time}</div>
                  <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", item.status === "task" ? "bg-[#C8A880]" : "bg-[#88B8B0]")} />
                  <div className="flex-1 min-w-0 pb-2 border-b border-border/15">
                    <div className="flex items-center gap-1.5">
                      <Channel className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-foreground/85 truncate">{item.title}</span>
                    </div>
                    <span className={cn(
                      "text-[9px] font-medium uppercase tracking-wide",
                      item.status === "task" ? "text-[#C8A880]" : "text-[#88B8B0]"
                    )}>{item.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hot Signals */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#B8B880]" />
              Hot Signals · Last 24h
            </h2>
            <Link href="/signals"><span className="text-xs text-[#B8A0C8] hover:underline cursor-pointer">All signals</span></Link>
          </div>
          <div className="space-y-2">
            {HOT_SIGNALS.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-[#B8B880]/25 bg-[#B8B880]/8">
                <div className="w-8 h-8 rounded-lg bg-[#B8B880]/25 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-[#B8B880]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{s.title}</div>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs">
                    <Link href={`/contacts/${s.contactId}`}>
                      <span className="text-[#B8A0C8] hover:underline cursor-pointer">{s.contact}</span>
                    </Link>
                    <span className="text-muted-foreground">· {s.impact}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-medium uppercase tracking-wider">{s.source}</span>
                    <button className="text-[10px] font-semibold text-[#88B8B0] flex items-center gap-1 hover:underline">
                      {s.action} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <span className="text-sm font-black text-[#B8B880] flex-shrink-0">{s.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* At Risk */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#C0A0B8]" />
              At-Risk Deals
            </h2>
            <Link href="/deals"><span className="text-xs text-[#B8A0C8] hover:underline cursor-pointer">All deals</span></Link>
          </div>
          <div className="space-y-2.5">
            {AT_RISK.map((d, i) => (
              <div key={i} className="p-3 rounded-xl border border-[#C0A0B8]/25 bg-[#C0A0B8]/8">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-foreground">{d.name}</span>
                  <span className="text-xs font-bold text-[#C0A0B8]">${(d.value / 100).toLocaleString()}</span>
                </div>
                <div className="text-xs text-muted-foreground">{d.deal}</div>
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#C0A0B8]">
                  <AlertTriangle className="w-3 h-3" />
                  {d.risk}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Start a Call", icon: Phone, color: "#88B8B0", href: "/calls" },
              { label: "Compose Email", icon: Mail, color: "#B8A0C8", href: "/email" },
              { label: "WhatsApp Conversation", icon: MessageSquare, color: "#90B8B8", href: "/whatsapp" },
              { label: "Find New Leads", icon: Users, color: "#C8A880", href: "/sourcing" },
            ].map(a => (
              <Link key={a.label} href={a.href}>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}20` }}>
                    <a.icon className="w-4 h-4" style={{ color: a.color }} />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">{a.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
