import { useState } from "react";
import { Link } from "wouter";
import {
  Send, Mail, MessageSquare, Bot, Sparkles, CheckCircle2, Clock,
  PhoneMissed, PhoneCall, ArrowRight, Edit3, X, Check, Zap,
  AlertCircle, Inbox, RefreshCw, ChevronRight, Filter, TrendingUp,
  Calendar, User
} from "lucide-react";
import { cn } from "@/lib/utils";

type SubTab = "queue" | "cadence" | "email" | "whatsapp" | "messages";

const APPROVAL_QUEUE = [
  {
    id: "q1",
    contact: "Faisal Al-Mansour",
    company: "Aramco Digital",
    channel: "whatsapp" as const,
    trigger: "No-answer · 2nd attempt",
    triggeredBy: "Auto-cadence rule #3",
    when: "2 min ago",
    confidence: 92,
    draft: "Mr. Faisal — sorry I missed you. I have the ROI breakdown for your Q2 expansion ready. Would Tuesday 11am work for a 15-min walkthrough? — Layla, NexFlow",
    locale: "en",
  },
  {
    id: "q2",
    contact: "Noura Al-Saud",
    company: "STC Group",
    channel: "email" as const,
    trigger: "Voicemail left",
    triggeredBy: "Power Dialer · 11:42",
    when: "8 min ago",
    confidence: 88,
    draft: "Hi Noura,\n\nI just left you a quick voicemail. Following up on our discussion about extending NexFlow to your enterprise team — I've attached the GCC compliance brief you asked about.\n\nHappy to find 20 minutes this week. What works best?\n\nBest,\nLayla",
    locale: "en",
  },
  {
    id: "q3",
    contact: "Ahmed Hassan",
    company: "Emirates NBD",
    channel: "whatsapp" as const,
    trigger: "Lead replied to AI agent",
    triggeredBy: "AI Voice Agent handoff",
    when: "14 min ago",
    confidence: 96,
    draft: "أهلاً أحمد، شكرًا لردك السريع. وفقًا لرغبتك، حجزت لك اجتماعًا تجريبيًا الخميس الساعة 2 ظهرًا. سأرسل دعوة التقويم خلال دقيقة. — ليلى",
    locale: "ar",
  },
  {
    id: "q4",
    contact: "Sara Khalil",
    company: "Mashreq Bank",
    channel: "email" as const,
    trigger: "Meeting booked → confirmation",
    triggeredBy: "Auto-cadence rule #1",
    when: "22 min ago",
    confidence: 94,
    draft: "Hi Sara,\n\nConfirming our meeting Wednesday at 3pm GST. I'll be joined by our Solutions lead, Omar, who can speak to your data residency questions.\n\nMeet link: nexflow.app/m/sara-meet\n\nLooking forward,\nLayla",
    locale: "en",
  },
];

const CADENCE_RULES = [
  {
    id: "r1",
    trigger: "no_answer",
    triggerLabel: "Call · No answer",
    triggerIcon: PhoneMissed,
    triggerColor: "#C8A880",
    action: "Send AI-tailored WhatsApp + log call activity",
    actionIcon: MessageSquare,
    delay: "5 min",
    requiresApproval: true,
    enabled: true,
    runs7d: 142,
    bookRate: 18,
  },
  {
    id: "r2",
    trigger: "voicemail",
    triggerLabel: "Call · Voicemail",
    triggerIcon: PhoneMissed,
    triggerColor: "#B8A0C8",
    action: "Send follow-up email referencing voicemail",
    actionIcon: Mail,
    delay: "Immediately",
    requiresApproval: true,
    enabled: true,
    runs7d: 87,
    bookRate: 22,
  },
  {
    id: "r3",
    trigger: "lead_replied",
    triggerLabel: "Lead replied to AI",
    triggerIcon: MessageSquare,
    triggerColor: "#88B8B0",
    action: "AI agent runs conversation with full booking authority",
    actionIcon: Bot,
    delay: "< 30 sec",
    requiresApproval: false,
    enabled: true,
    runs7d: 64,
    bookRate: 47,
  },
  {
    id: "r4",
    trigger: "meeting_booked",
    triggerLabel: "Meeting booked",
    triggerIcon: Calendar,
    triggerColor: "#88B8B0",
    action: "Send confirmation + add to calendar + brief participants",
    actionIcon: Mail,
    delay: "Immediately",
    requiresApproval: false,
    enabled: true,
    runs7d: 38,
    bookRate: 100,
  },
  {
    id: "r5",
    trigger: "callback_requested",
    triggerLabel: "Callback requested",
    triggerIcon: Clock,
    triggerColor: "#90B8B8",
    action: "Schedule callback task + reminder in Command Center",
    actionIcon: Calendar,
    delay: "At requested time",
    requiresApproval: false,
    enabled: true,
    runs7d: 29,
    bookRate: 71,
  },
  {
    id: "r6",
    trigger: "not_interested",
    triggerLabel: "Not interested",
    triggerIcon: X,
    triggerColor: "#C0A0B8",
    action: "Move to nurture sequence + 90-day re-engagement",
    actionIcon: RefreshCw,
    delay: "After 90 days",
    requiresApproval: false,
    enabled: false,
    runs7d: 0,
    bookRate: 0,
  },
];

const ACTIVITY_FEED = [
  { type: "sent" as const, channel: "whatsapp", contact: "Khalid Al-Otaibi", outcome: "Replied within 4 min — meeting booked", when: "3 min ago", success: true },
  { type: "sent" as const, channel: "email", contact: "Mohammed Al-Rashid", outcome: "Opened ×3, link clicked", when: "11 min ago", success: true },
  { type: "ai_handled" as const, channel: "whatsapp", contact: "Yasmin Abdullah", outcome: "AI answered 6 questions, transferred to Layla for pricing", when: "18 min ago", success: true },
  { type: "approved" as const, channel: "email", contact: "Reem Al-Suwaidi", outcome: "Approved & sent by Layla Hassan", when: "25 min ago", success: true },
  { type: "edited" as const, channel: "whatsapp", contact: "Talal Al-Yami", outcome: "Layla edited tone before sending", when: "31 min ago", success: true },
  { type: "rejected" as const, channel: "email", contact: "Hessa Al-Mansoori", outcome: "Layla rejected — sending personal note instead", when: "44 min ago", success: false },
];

export default function PostCallAutomationPage() {
  const [tab, setTab] = useState<SubTab>("queue");
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [rejected, setRejected] = useState<Set<string>>(new Set());
  const [edited, setEdited] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [rules, setRules] = useState(CADENCE_RULES);

  const pendingCount = APPROVAL_QUEUE.filter((q) => !approved.has(q.id) && !rejected.has(q.id)).length;
  const sentToday = approved.size + 24; // baseline
  const aiHandled = 18;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Send className="w-6 h-6 text-primary" />
            Post-Call Automation
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            AI takes over the moment a call ends. No-answer? It logs the activity and drafts a tailored WhatsApp.
            Lead replies? An AI agent runs the conversation with authority to book meetings.
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4">
        <Stat icon={Inbox} label="Pending approval" value={pendingCount} hint="Drafts waiting on you" tone="amber" />
        <Stat icon={CheckCircle2} label="Sent today" value={sentToday} hint="Across all channels" tone="emerald" />
        <Stat icon={Bot} label="AI auto-handled" value={aiHandled} hint="No human touch needed" tone="violet" />
        <Stat icon={TrendingUp} label="Reply rate" value="34%" hint="vs 18% manual" tone="blue" />
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        <TabButton active={tab === "queue"} onClick={() => setTab("queue")} icon={Inbox} label="Approval Queue" badge={pendingCount} />
        <TabButton active={tab === "cadence"} onClick={() => setTab("cadence")} icon={Zap} label="Cadence Rules" />
        <TabButton active={tab === "email"} onClick={() => setTab("email")} icon={Mail} label="Email" />
        <TabButton active={tab === "whatsapp"} onClick={() => setTab("whatsapp")} icon={MessageSquare} label="WhatsApp" />
        <TabButton active={tab === "messages"} onClick={() => setTab("messages")} icon={Inbox} label="Unified Inbox" />
      </div>

      {tab === "queue" && (
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">AI-drafted, awaiting your approval</div>
              <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Filter className="w-3 h-3" /> All channels
              </button>
            </div>
            {APPROVAL_QUEUE.map((q) => {
              const isApproved = approved.has(q.id);
              const isRejected = rejected.has(q.id);
              const isEditing = edited === q.id;
              const ChannelIcon = q.channel === "whatsapp" ? MessageSquare : Mail;
              const channelColor = q.channel === "whatsapp" ? "text-emerald-600" : "text-blue-600";
              const channelBg = q.channel === "whatsapp" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-blue-50 dark:bg-blue-900/20";
              const draftText = drafts[q.id] ?? q.draft;
              return (
                <div
                  key={q.id}
                  className={cn(
                    "glass-card rounded-2xl p-4 transition",
                    isApproved && "opacity-60 border-emerald-300",
                    isRejected && "opacity-40"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", channelBg)}>
                      <ChannelIcon className={cn("w-5 h-5", channelColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <div className="font-semibold text-sm">{q.contact}</div>
                          <div className="text-xs text-muted-foreground">{q.company} · {q.when}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
                            {q.confidence}% conf.
                          </span>
                          {q.locale === "ar" && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-medium">
                              Arabic
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Sparkles className="w-3 h-3" />
                        <span>{q.trigger}</span>
                        <span>·</span>
                        <span>{q.triggeredBy}</span>
                      </div>

                      {isEditing ? (
                        <textarea
                          value={draftText}
                          onChange={(e) => setDrafts({ ...drafts, [q.id]: e.target.value })}
                          dir={q.locale === "ar" ? "rtl" : "ltr"}
                          className="mt-3 w-full rounded-xl border border-primary bg-background px-3 py-2 text-sm min-h-[100px] font-mono"
                        />
                      ) : (
                        <div
                          dir={q.locale === "ar" ? "rtl" : "ltr"}
                          className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed"
                        >
                          {draftText}
                        </div>
                      )}

                      {!isApproved && !isRejected && (
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              setApproved(new Set([...approved, q.id]));
                              if (edited === q.id) setEdited(null);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Approve & send
                          </button>
                          <button
                            onClick={() => setEdited(isEditing ? null : q.id)}
                            className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> {isEditing ? "Done editing" : "Edit"}
                          </button>
                          <button
                            onClick={() => {
                              setRejected(new Set([...rejected, q.id]));
                              if (edited === q.id) setEdited(null);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition text-muted-foreground flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                          <button className="ml-auto px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> Regenerate
                          </button>
                        </div>
                      )}
                      {isApproved && (
                        <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" /> Sent · tracking opens & replies
                        </div>
                      )}
                      {isRejected && (
                        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                          <X className="w-3 h-3" /> Skipped — AI will not retry this thread
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {pendingCount === 0 && (
              <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <div className="font-semibold">Inbox zero.</div>
                <div className="text-xs mt-1">All AI-drafted follow-ups have been processed.</div>
              </div>
            )}
          </div>

          {/* Activity sidebar */}
          <div className="space-y-3">
            <div className="glass-card rounded-2xl p-4">
              <div className="text-xs uppercase font-semibold text-muted-foreground mb-3">Live activity</div>
              <div className="space-y-2.5">
                {ACTIVITY_FEED.map((a, i) => {
                  const Icon = a.channel === "whatsapp" ? MessageSquare : Mail;
                  const tagColor =
                    a.type === "sent" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                    a.type === "ai_handled" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                    a.type === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                    a.type === "edited" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
                  const tagLabel =
                    a.type === "sent" ? "Sent" :
                    a.type === "ai_handled" ? "AI" :
                    a.type === "approved" ? "Approved" :
                    a.type === "edited" ? "Edited" :
                    "Rejected";
                  return (
                    <div key={i} className="flex items-start gap-2">
                      <Icon className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase", tagColor)}>{tagLabel}</span>
                          <span className="text-xs font-medium truncate">{a.contact}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{a.outcome}</div>
                        <div className="text-[10px] text-muted-foreground/70 mt-0.5">{a.when}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-primary" />
                <div className="text-xs uppercase font-semibold text-muted-foreground">AI agent authority</div>
              </div>
              <div className="text-xs text-foreground leading-relaxed">
                The AI agent currently has authority to: answer FAQs, share collateral, qualify budget,
                <span className="font-semibold text-emerald-600"> book meetings</span>, and transfer to a human on pricing &gt; <span className="font-mono">$50k</span>.
              </div>
              <Link href="/contact-center-setup" className="mt-3 text-xs text-primary hover:underline flex items-center gap-1">
                Adjust authority <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {tab === "cadence" && (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            When a call ends, these rules fire automatically. Every action is auditable in the activity feed.
          </div>
          {rules.map((r) => {
            const TriggerIcon = r.triggerIcon;
            const ActionIcon = r.actionIcon;
            return (
              <div key={r.id} className={cn("glass-card rounded-2xl p-4", !r.enabled && "opacity-50")}>
                <div className="flex items-center gap-4 flex-wrap">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${r.triggerColor}25`, color: r.triggerColor }}
                  >
                    <TriggerIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-xs uppercase font-semibold text-muted-foreground">When</div>
                    <div className="font-semibold">{r.triggerLabel}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-[260px]">
                    <div className="text-xs uppercase font-semibold text-muted-foreground flex items-center gap-1">
                      <ActionIcon className="w-3 h-3" /> Action
                    </div>
                    <div className="text-sm">{r.action}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground">Delay</div>
                    <div className="text-sm font-semibold">{r.delay}</div>
                  </div>
                  <div className="text-right shrink-0 min-w-[80px]">
                    <div className="text-xs text-muted-foreground">7d runs</div>
                    <div className="text-sm font-semibold">{r.runs7d}</div>
                  </div>
                  <div className="text-right shrink-0 min-w-[80px]">
                    <div className="text-xs text-muted-foreground">Booked</div>
                    <div className="text-sm font-semibold text-emerald-600">{r.bookRate}%</div>
                  </div>
                  <button
                    onClick={() =>
                      setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, enabled: !x.enabled } : x)))
                    }
                    className={cn(
                      "w-12 h-6 rounded-full relative transition shrink-0",
                      r.enabled ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 w-5 h-5 rounded-full bg-background transition",
                        r.enabled ? "left-6" : "left-0.5"
                      )}
                    />
                  </button>
                </div>
                {r.requiresApproval && (
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-amber-600">
                    <AlertCircle className="w-3 h-3" /> Requires human approval before sending
                  </div>
                )}
              </div>
            );
          })}
          <button className="w-full glass-card rounded-2xl p-4 border-dashed border-2 border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary transition flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" /> Add a new cadence rule
          </button>
        </div>
      )}

      {tab === "email" && <EmbeddedChannel kind="email" />}
      {tab === "whatsapp" && <EmbeddedChannel kind="whatsapp" />}
      {tab === "messages" && <EmbeddedChannel kind="messages" />}
    </div>
  );
}

function TabButton({
  active, onClick, icon: Icon, label, badge,
}: { active: boolean; onClick: () => void; icon: any; label: string; badge?: number }) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={cn(
        "px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold">
          {badge}
        </span>
      )}
    </button>
  );
}

function Stat({
  icon: Icon, label, value, hint, tone,
}: { icon: any; label: string; value: any; hint?: string; tone: "amber" | "emerald" | "violet" | "blue" }) {
  const toneClass = {
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    violet: "text-purple-600",
    blue: "text-blue-600",
  }[tone];
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={cn("w-4 h-4", toneClass)} />
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

function EmbeddedChannel({ kind }: { kind: "email" | "whatsapp" | "messages" }) {
  const config = {
    email: {
      icon: Mail,
      title: "Email follow-ups",
      desc: "Open the dedicated 1-to-1 email composer with AI tone & timing.",
      href: "/email",
      cta: "Open Email Composer",
    },
    whatsapp: {
      icon: MessageSquare,
      title: "WhatsApp Business",
      desc: "Templates, threads, and AI-powered conversation handling.",
      href: "/whatsapp",
      cta: "Open WhatsApp Business",
    },
    messages: {
      icon: Inbox,
      title: "Unified Inbox",
      desc: "Every channel in one feed — replies route back into post-call cadences automatically.",
      href: "/messages",
      cta: "Open Unified Inbox",
    },
  }[kind];
  const Icon = config.icon;
  return (
    <div className="glass-card rounded-2xl p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <div className="text-lg font-semibold">{config.title}</div>
      <div className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{config.desc}</div>
      <Link
        href={config.href}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
      >
        {config.cta} <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
