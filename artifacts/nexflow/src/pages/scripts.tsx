import { useScripts } from "@/hooks/useApi";
import { BookOpen, Plus, Globe, Copy, Check, Search, Shield, PlayCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  cold_call: { label: "Cold Call", color: "text-[#B8A0C8]", bg: "bg-[#B8A0C8]/20" },
  follow_up: { label: "Follow-up", color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/20" },
  closing: { label: "Closing", color: "text-[#C8A880]", bg: "bg-[#C8A880]/20" },
  objection_handling: { label: "Objection", color: "text-[#90B8B8]", bg: "bg-[#90B8B8]/20" },
  demo: { label: "Demo", color: "text-[#B8B880]", bg: "bg-[#B8B880]/20" },
};

const OBJECTIONS = [
  {
    id: "o1", objection: "It's too expensive for us right now.",
    response: `Totally understand. Most of our GCC clients felt the same before we ran a quick ROI model together. On average, NexFlow reduces CRM overhead by 40% and increases deal close rates by 22%. If that math holds for your team, it usually pays for itself in the first quarter. Can I share a quick calculation based on your current team size?`,
    category: "Pricing", language: "en",
  },
  {
    id: "o2", objection: "We're already using Salesforce.",
    response: `Salesforce is a great foundation. We actually complement it — many of our clients run NexFlow for Arabic voice AI and GCC-specific signal monitoring while keeping Salesforce for global CRM. There's also a native Salesforce sync that takes about 20 minutes to set up. Want me to show you how that works?`,
    category: "Competition", language: "en",
  },
  {
    id: "o3", objection: "We need to involve our IT / legal team first.",
    response: `Absolutely the right call. I can prepare a one-page technical security overview and our SAMA + PDPL compliance certificate — that typically gets legal clearance in 2-3 days. Should I send that to you directly, or would it be more helpful to set up a 30-minute call with your IT lead?`,
    category: "Process", language: "en",
  },
  {
    id: "o4", objection: "السعر مرتفع جداً",
    response: `أفهم وجهة نظرك تماماً. معظم عملائنا في منطقة الخليج كانوا يشاركونني نفس القلق في البداية. لكن بعد حساب العائد على الاستثمار، تبيّن أن NexFlow يوفّر في المتوسط 40% من تكاليف إدارة العملاء ويزيد معدل إغلاق الصفقات بنسبة 22%. هل يمكنني مشاركتك نموذجاً سريعاً يوضح الأرقام بناءً على حجم فريقك؟`,
    category: "Pricing", language: "ar",
  },
  {
    id: "o5", objection: "Now isn't the right time.",
    response: `That makes sense — timing is everything. Out of curiosity, what would need to change for this to become a priority? I ask because we're seeing a wave of GCC firms accelerating CRM modernisation ahead of Vision 2030 targets, and the clients who move now are locking in our current pricing before the Q3 increase. Happy to keep this on your radar and reconnect in 30 days if that works better.`,
    category: "Timing", language: "en",
  },
  {
    id: "o6", objection: "We're a small team — this seems like overkill.",
    response: `That's actually one of our sweet spots. Our Starter plan is designed for 5-20 seat teams and includes the Arabic AI Voice Agent, automated call logging, and WhatsApp integration. Companies your size typically see a 3x increase in outreach capacity without adding headcount. Would a quick 15-minute demo be worth your time?`,
    category: "Fit", language: "en",
  },
];

const PLAYBOOKS = [
  {
    id: "pb1", name: "GCC Enterprise Cold Outreach", steps: 6, duration: "21 days", owner: "Sales Team",
    description: "Multi-touch sequence for C-Level prospects in KSA, UAE, and Qatar using Arabic + English touchpoints.",
    steps_detail: [
      { day: 1, action: "Phone call — introduction + value prop (Arabic if KSA/Bahrain)", channel: "Call" },
      { day: 2, action: "WhatsApp message — Arabic greeting with company-specific insight", channel: "WhatsApp" },
      { day: 5, action: "Email — post-demo follow-up template with ROI calculator attachment", channel: "Email" },
      { day: 8, action: "Phone call — follow-up on email, ask about evaluation timeline", channel: "Call" },
      { day: 14, action: "LinkedIn + WhatsApp — share relevant GCC case study", channel: "WhatsApp" },
      { day: 21, action: "Break-up email — last chance + clear next step offer", channel: "Email" },
    ],
    color: "#B8A0C8",
  },
  {
    id: "pb2", name: "Funding Signal Fast-Follow", steps: 4, duration: "7 days", owner: "Sales Team",
    description: "Rapid response sequence triggered when a target company announces a funding round.",
    steps_detail: [
      { day: 0, action: "Automated signal alert → AI-generated personalised cold email referencing funding", channel: "Email" },
      { day: 1, action: "Phone call — congratulate on funding, tie to growth challenge NexFlow solves", channel: "Call" },
      { day: 3, action: "WhatsApp — short video message or voice note (Arabic for MENA)", channel: "WhatsApp" },
      { day: 7, action: "Email — send deck + calendar link for 20-min discovery call", channel: "Email" },
    ],
    color: "#C8A880",
  },
  {
    id: "pb3", name: "Stuck Deal Rescue", steps: 3, duration: "14 days", owner: "Account Executives",
    description: "Re-activation playbook for deals stuck in Proposal or Negotiation for 30+ days.",
    steps_detail: [
      { day: 1, action: "AI stall diagnosis → identify the blocker (pricing, legal, internal champion)", channel: "Call" },
      { day: 3, action: "Send tailored asset: security overview, compliance cert, or competitive comparison", channel: "Email" },
      { day: 14, action: "Executive-to-executive outreach or pricing concession with deadline", channel: "Call" },
    ],
    color: "#88B8B0",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-[#88B8B0]" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

type Tab = "scripts" | "objections" | "playbooks";

export default function KnowledgeBasePage() {
  const { data, isLoading } = useScripts();
  const scripts = data?.scripts ?? [];
  const [tab, setTab] = useState<Tab>("scripts");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const TABS = [
    { k: "scripts" as Tab, label: "Call Scripts", icon: BookOpen, count: scripts.length },
    { k: "objections" as Tab, label: "Objections", icon: Shield, count: OBJECTIONS.length },
    { k: "playbooks" as Tab, label: "Playbooks", icon: PlayCircle, count: PLAYBOOKS.length },
  ];

  const filteredObjections = OBJECTIONS.filter(o =>
    !search || o.objection.toLowerCase().includes(search.toLowerCase()) || o.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#C8A880]" />
            Knowledge Base
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Call scripts, objection handling, and sales playbooks</p>
        </div>
        <div className="flex items-center gap-2">
          {tab === "scripts" && (
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90">
              <Plus className="w-4 h-4" />
              New Script
            </button>
          )}
          {tab === "objections" && (
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90">
              <Plus className="w-4 h-4" />
              Add Objection
            </button>
          )}
          {tab === "playbooks" && (
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90">
              <Plus className="w-4 h-4" />
              New Playbook
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/40 w-fit">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={cn("flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all", tab === t.k ? "nf-chameleon-bg text-white" : "text-muted-foreground hover:text-foreground")}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold", tab === t.k ? "bg-white/20 text-white" : "bg-muted text-muted-foreground")}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search bar (for objections) */}
      {tab === "objections" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 w-fit min-w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground flex-1"
            placeholder="Search objections..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Scripts tab */}
      {tab === "scripts" && (
        <div className="grid grid-cols-1 gap-4">
          {isLoading
            ? Array(4).fill(0).map((_, i) => <div key={i} className="h-32 glass-card rounded-2xl animate-pulse" />)
            : scripts.map((s: any) => {
              const cfg = TYPE_CONFIG[s.type] ?? TYPE_CONFIG.cold_call;
              const isExpanded = expanded === s.id;
              const isArabic = s.language === "ar";
              return (
                <div key={s.id} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", cfg.bg)}>
                        <BookOpen className={cn("w-5 h-5", cfg.color)} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{s.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.bg, cfg.color)}>{cfg.label}</span>
                          {isArabic && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Globe className="w-3 h-3" />Arabic</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CopyButton text={s.content} />
                      <button onClick={() => setExpanded(isExpanded ? null : s.id)} className="text-xs text-muted-foreground hover:text-foreground">
                        {isExpanded ? "Collapse" : "Expand"}
                      </button>
                    </div>
                  </div>
                  <div className={cn("overflow-hidden transition-all duration-300", isExpanded ? "max-h-[500px]" : "max-h-20")}>
                    <div className={cn("p-4 rounded-xl bg-muted/30 text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed", isArabic && "text-right")} dir={isArabic ? "rtl" : "ltr"}>
                      {s.content}
                    </div>
                  </div>
                  {!isExpanded && <button onClick={() => setExpanded(s.id)} className="text-xs text-muted-foreground hover:text-foreground mt-2">Show full script ↓</button>}
                  {s.tags?.length > 0 && (
                    <div className="flex gap-1 mt-3 flex-wrap">
                      {s.tags.map((t: string) => <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">{t}</span>)}
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      )}

      {/* Objections tab */}
      {tab === "objections" && (
        <div className="space-y-3">
          {filteredObjections.map(o => {
            const isExpanded = expanded === o.id;
            const isArabic = o.language === "ar";
            return (
              <div key={o.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Shield className="w-4 h-4 text-[#C8A880] flex-shrink-0" />
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#C8A880]/15 text-[#C8A880] font-medium">{o.category}</span>
                      {isArabic && <span className="flex items-center gap-0.5 text-xs text-muted-foreground"><Globe className="w-3 h-3" />Arabic</span>}
                    </div>
                    <p className="font-semibold text-sm text-foreground italic" dir="auto">"{o.objection}"</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <CopyButton text={o.response} />
                    <button onClick={() => setExpanded(isExpanded ? null : o.id)} className="text-muted-foreground hover:text-foreground">
                      <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                    </button>
                  </div>
                </div>
                <div className={cn("overflow-hidden transition-all duration-300", isExpanded ? "max-h-[400px] mt-3" : "max-h-0")}>
                  <div className="p-4 rounded-xl bg-muted/30 text-sm text-foreground/80 leading-relaxed" dir="auto">
                    {o.response}
                  </div>
                </div>
                {!isExpanded && (
                  <button onClick={() => setExpanded(o.id)} className="text-xs text-muted-foreground hover:text-foreground mt-2">Show response ↓</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Playbooks tab */}
      {tab === "playbooks" && (
        <div className="space-y-4">
          {PLAYBOOKS.map(pb => {
            const isExpanded = expanded === pb.id;
            return (
              <div key={pb.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: pb.color + "20" }}>
                      <PlayCircle className="w-5 h-5" style={{ color: pb.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{pb.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{pb.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{pb.steps} steps</span>
                        <span>·</span>
                        <span>{pb.duration}</span>
                        <span>·</span>
                        <span>{pb.owner}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="text-xs px-3 py-1.5 rounded-lg nf-chameleon-bg text-white font-semibold">Use Playbook</button>
                    <button onClick={() => setExpanded(isExpanded ? null : pb.id)} className="text-muted-foreground hover:text-foreground">
                      <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                    </button>
                  </div>
                </div>

                <div className={cn("overflow-hidden transition-all duration-300", isExpanded ? "max-h-[600px] mt-3" : "max-h-0")}>
                  <div className="space-y-2">
                    {pb.steps_detail.map((step, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0" style={{ background: pb.color }}>
                          {step.day === 0 ? "0" : `D${step.day}`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground leading-snug">{step.action}</div>
                        </div>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                          style={{
                            background: step.channel === "Call" ? "#B8A0C820" : step.channel === "WhatsApp" ? "#25D36620" : "#88B8B020",
                            color: step.channel === "Call" ? "#B8A0C8" : step.channel === "WhatsApp" ? "#25D366" : "#88B8B0"
                          }}
                        >
                          {step.channel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
