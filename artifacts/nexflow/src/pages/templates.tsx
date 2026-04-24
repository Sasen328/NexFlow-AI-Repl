import { useState } from "react";
import { Layers, Plus, Copy, Check, Search, Mail, MessageSquare, Sparkles, Globe, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CHANNEL_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  email: { label: "Email", icon: Mail, color: "text-[#B8A0C8]", bg: "bg-[#B8A0C8]/15" },
  whatsapp: { label: "WhatsApp", icon: MessageSquare, color: "text-[#25D366]", bg: "bg-[#25D366]/10" },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Follow-up": "bg-[#88B8B0]/15 text-[#88B8B0]",
  "Cold Outreach": "bg-[#B8A0C8]/15 text-[#B8A0C8]",
  "Closing": "bg-[#C8A880]/15 text-[#C8A880]",
  "Arabic": "bg-[#90B8B8]/15 text-[#90B8B8]",
  "Nurture": "bg-[#B8B880]/15 text-[#B8B880]",
  "Re-engagement": "bg-[#C0A0B8]/15 text-[#C0A0B8]",
};

const TEMPLATES = [
  {
    id: "t1", channel: "email", name: "Post-Demo Follow-Up", category: "Follow-up", language: "en", starred: true, uses: 42,
    subject: "Next Steps — NexFlow × {Company}",
    body: `Hi {name},

Thank you for joining us today for the NexFlow demo. It was great to learn about {Company}'s goals.

Key highlights we covered:
• AI-powered call coaching with Arabic voice support
• GCC compliance module (SAMA, PDPL-ready)
• 40% average CRM cost reduction

I'd love to schedule a follow-up to discuss the ROI model. Are you free this Thursday?

Best regards,
[Your Name]`,
  },
  {
    id: "t2", channel: "email", name: "Arabic Formal Greeting", category: "Arabic", language: "ar", starred: true, uses: 28,
    subject: "عرض حصري من NexFlow",
    body: `السلام عليكم ورحمة الله وبركاته {name}،

أتمنى أن تكون بخير وعافية.

يسعدني تقديم NexFlow — منصة CRM مدعومة بالذكاء الاصطناعي، مصممة لأسواق الخليج العربي.

مزايا رئيسية:
• وكيل صوتي ذكي باللغة العربية (لهجة خليجية وعربية فصحى)
• تكامل WhatsApp وتحليل المكالمات الآلي
• لوحة تحكم متوافقة مع متطلبات هيئة السوق المالية

هل يمكننا تحديد موعد عرض هذا الأسبوع؟

مع خالص التقدير،
[اسمك]`,
  },
  {
    id: "t3", channel: "email", name: "Proposal Sent", category: "Closing", language: "en", starred: false, uses: 15,
    subject: "NexFlow Proposal for {Company} — Ready to Review",
    body: `Hi {name},

I've just sent the NexFlow Enterprise proposal. Here's a quick summary:

📋 Scope: {seats} seats, Enterprise plan
💰 Investment: [Amount] per year
🚀 Timeline: 6-week implementation + 4-week hypercare

Key items for review:
1. Arabic AI Voice Agent
2. SAMA compliance certification
3. Data residency in KSA (Riyadh region)

Happy to walk through any section. A 30-minute call with your legal/technical leads would make approval straightforward.

Best,
[Your Name]`,
  },
  {
    id: "t4", channel: "email", name: "Re-Engagement", category: "Re-engagement", language: "en", starred: false, uses: 11,
    subject: "Quick check-in — {Company} × NexFlow",
    body: `Hi {name},

Hope Q2 is off to a strong start for the team at {Company}.

I noticed we haven't connected in a while. Since our last conversation, NexFlow has added:
• Real-time call scoring with GCC-specific benchmarks
• WhatsApp Business API integration with Arabic AI
• Vision 2030 compliance reporting

Would it make sense to reconnect for 20 minutes? Happy to fit around your schedule.

Kind regards,
[Your Name]`,
  },
  {
    id: "t5", channel: "whatsapp", name: "Follow-up After Demo", category: "Follow-up", language: "en", starred: true, uses: 67,
    subject: "",
    body: "Hi {name}! Great connecting with you today. As discussed, NexFlow's {feature} will help {company} achieve {benefit}. Happy to answer any questions! 🚀",
  },
  {
    id: "t6", channel: "whatsapp", name: "Meeting Reminder", category: "Nurture", language: "en", starred: false, uses: 38,
    subject: "",
    body: "Hi {name}, just a reminder about our call tomorrow at {time}. Looking forward to it! 📅",
  },
  {
    id: "t7", channel: "whatsapp", name: "Arabic WhatsApp Greeting", category: "Arabic", language: "ar", starred: true, uses: 24,
    subject: "",
    body: "السلام عليكم {name}! أردت فقط المتابعة بشأن عرضنا لـ {company}. هل لديك أي أسئلة؟ 🙏",
  },
  {
    id: "t8", channel: "whatsapp", name: "Closing Urgency", category: "Closing", language: "en", starred: false, uses: 19,
    subject: "",
    body: "Hi {name}, wanted to share — our Q2 pricing expires {date}. I'd love to get you locked in before then. Can we connect tomorrow?",
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

export default function TemplatesPage() {
  const [channelFilter, setChannelFilter] = useState<"all" | "email" | "whatsapp">("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const categories = Array.from(new Set(TEMPLATES.map(t => t.category)));

  const filtered = TEMPLATES.filter(t => {
    const matchChannel = channelFilter === "all" || t.channel === channelFilter;
    const matchCat = !categoryFilter || t.category === categoryFilter;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.body.toLowerCase().includes(search.toLowerCase());
    return matchChannel && matchCat && matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#C8A880]" />
            Templates
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{TEMPLATES.length} messaging templates for email and WhatsApp</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B8A0C8]/20 text-[#B8A0C8] text-sm font-semibold hover:bg-[#B8A0C8]/30"
          >
            <Sparkles className="w-4 h-4" />
            AI Generate
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 p-1 rounded-xl bg-muted/40 w-fit">
          {([["all", "All"], ["email", "Email"], ["whatsapp", "WhatsApp"]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setChannelFilter(k)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", channelFilter === k ? "nf-chameleon-bg text-white" : "text-muted-foreground hover:text-foreground")}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setCategoryFilter("")}
            className={cn("text-xs px-2.5 py-1 rounded-full font-medium transition-colors", !categoryFilter ? "bg-[#B8A0C8]/20 text-[#B8A0C8]" : "bg-muted/50 text-muted-foreground hover:bg-muted")}
          >
            All Categories
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(cat => cat === c ? "" : c)}
              className={cn("text-xs px-2.5 py-1 rounded-full font-medium transition-colors", categoryFilter === c ? (CATEGORY_COLORS[c] ?? "bg-muted text-foreground") : "bg-muted/50 text-muted-foreground hover:bg-muted")}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 text-xs">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-40"
            placeholder="Search templates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(t => {
          const ch = CHANNEL_CONFIG[t.channel];
          const ChIcon = ch.icon;
          const isExpanded = expanded === t.id;
          return (
            <div key={t.id} className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", ch.bg)}>
                    <ChIcon className={cn("w-4 h-4", ch.color)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground text-sm">{t.name}</h3>
                      {t.starred && <Star className="w-3 h-3 text-[#C8A880] fill-[#C8A880]" />}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", CATEGORY_COLORS[t.category] ?? "bg-muted text-muted-foreground")}>{t.category}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", ch.bg, ch.color)}>{ch.label}</span>
                      {t.language === "ar" && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><Globe className="w-2.5 h-2.5" /> Arabic</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground">{t.uses} uses</span>
                  <CopyButton text={t.subject ? `Subject: ${t.subject}\n\n${t.body}` : t.body} />
                </div>
              </div>

              {t.subject && (
                <div className="text-xs text-muted-foreground mb-2 px-1">
                  <span className="font-semibold text-foreground/70">Subject: </span>{t.subject}
                </div>
              )}

              <div className={cn("overflow-hidden transition-all duration-300", isExpanded ? "max-h-[400px]" : "max-h-16")}>
                <div className="p-3 rounded-xl bg-muted/30 text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed" dir="auto">
                  {t.body}
                </div>
              </div>

              <button
                onClick={() => setExpanded(isExpanded ? null : t.id)}
                className="text-[10px] text-muted-foreground hover:text-foreground mt-2 transition-colors"
              >
                {isExpanded ? "↑ Collapse" : "↓ Show full template"}
              </button>
            </div>
          );
        })}
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg bg-background" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">New Template</h3>
              <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm text-foreground outline-none" placeholder="Template name" />
              <div className="flex gap-2">
                <select className="flex-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm text-foreground outline-none">
                  <option>Email</option>
                  <option>WhatsApp</option>
                </select>
                <select className="flex-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm text-foreground outline-none">
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <input className="w-full px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm text-foreground outline-none" placeholder="Subject line (email only)" />
              <textarea rows={6} className="w-full px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm text-foreground outline-none resize-none" placeholder="Template body. Use {name}, {company}, {feature} as placeholders." />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowNew(false)} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={() => setShowNew(false)} className="px-4 py-1.5 rounded-lg text-xs font-semibold nf-chameleon-bg text-white">Save Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
