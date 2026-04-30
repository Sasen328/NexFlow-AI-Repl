import { useState } from "react";
import {
  Sparkles, Mail, MessageSquare, Send, Loader2, RefreshCw, Check,
  ChevronDown, ChevronRight, Phone, Copy, Wand2, Users, Target,
  Globe, Flame, Brain, ArrowRight, Star, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Channel = "email" | "whatsapp" | "sms";
type Objective = "reactivation" | "nurture" | "demo" | "upsell" | "event";
type Tone = "professional" | "warm" | "urgent" | "consultative";

const CHANNEL_META: Record<Channel, { icon: any; color: string; label: string; limit?: string }> = {
  email:     { icon: Mail,           color: "#88B8B0", label: "Email",     limit: "No limit" },
  whatsapp:  { icon: MessageSquare,  color: "#25D366", label: "WhatsApp",  limit: "≤1,600 chars" },
  sms:       { icon: Phone,          color: "#A090C8", label: "SMS",       limit: "≤160 chars" },
};

const OBJECTIVES: { key: Objective; label: string; desc: string }[] = [
  { key: "reactivation", label: "Re-activate Cold Lead", desc: "Bring back a contact gone silent for 30+ days" },
  { key: "nurture",      label: "Nurture (MQL → SAL1)", desc: "Move a warm lead toward a first sales conversation" },
  { key: "demo",         label: "Book a Demo",           desc: "Direct CTA to schedule a product walkthrough" },
  { key: "upsell",       label: "Cross-sell / Upsell",   desc: "Introduce an adjacent product to an existing customer" },
  { key: "event",        label: "Event / Webinar Invite", desc: "Drive registrations for an upcoming event" },
];

const TONES: { key: Tone; label: string; emoji: string }[] = [
  { key: "professional",  label: "Professional",  emoji: "🤝" },
  { key: "warm",          label: "Warm & Human",  emoji: "😊" },
  { key: "urgent",        label: "Urgency-Driven", emoji: "⚡" },
  { key: "consultative",  label: "Consultative",   emoji: "🧠" },
];

const AUDIENCES = [
  { id: "a1", label: "GCC Enterprise C-Suite",    size: 412 },
  { id: "a2", label: "MENA FinTech Founders",     size: 218 },
  { id: "a3", label: "Saudi Mid-Market RevOps",   size: 644 },
  { id: "a4", label: "Gulf Real Estate Owners",   size: 156 },
  { id: "a5", label: "Riyadh Healthcare Network", size: 89  },
];

const GENERATED_SAMPLES: Record<Objective, Record<Channel, { subject?: string; body: string; ar?: string }>> = {
  reactivation: {
    email: {
      subject: "We've been thinking about [Company] — something changed?",
      body: `Hi [First Name],\n\nIt's been a while since we last spoke, and I didn't want to let too much more time pass before reaching out.\n\nA lot has changed since [Month] — we've launched an Arabic-language AI voice agent that's already helping 12 GCC sales teams cut follow-up time by 60%.\n\nWould a 15-minute catch-up make sense? I can walk you through what's new and see if the timing is better now.\n\nBest,\n[Your Name]\nNexFlow · GCC-native CRM`,
      ar: `مرحباً [الاسم]،\n\nمرّ وقت منذ آخر تواصل بيننا، وأردت أن أتواصل معكم مجدداً.\n\nلقد أطلقنا مؤخراً وكيل صوتي بالذكاء الاصطناعي باللغة العربية يساعد فرق المبيعات في منطقة الخليج على تقليل وقت المتابعة بنسبة 60%.\n\nهل يناسبكم اجتماع قصير لمدة 15 دقيقة؟\n\nمع أطيب التحيات،\n[اسمك]`,
    },
    whatsapp: {
      body: `مرحباً [الاسم] 👋\n\nنيكسفلو هنا — لم نتحدث منذ فترة!\n\nأطلقنا شيئاً جديداً قد يكون ذا صلة بعملكم في [الشركة]. هل أنت متاح لمحادثة قصيرة هذا الأسبوع؟ 🙏`,
    },
    sms: {
      body: `Hi [First Name], NexFlow here. New AI features for GCC teams — quick 15min call this week? Reply YES.`,
    },
  },
  nurture: {
    email: {
      subject: "How [Company] peers are closing deals 40% faster in KSA",
      body: `Hi [First Name],\n\nI wanted to share something relevant to [Company]'s current growth phase.\n\nThree companies similar to yours — mid-market, KSA-focused — recently switched to NexFlow and saw:\n• 40% reduction in admin time per rep\n• 2.3× faster SAL1→SAL2 conversion\n• Full Arabic + English bilingual CRM (finally)\n\nI've put together a 2-page case study that maps directly to your team size and sales motion. Want me to send it over?\n\nBest,\n[Your Name]`,
      ar: `مرحباً [الاسم]،\n\nأردت مشاركة شيء يتعلق بمرحلة نمو شركتكم الحالية.\n\nثلاث شركات مشابهة لكم حققت:\n• تقليل وقت الإدارة بنسبة 40%\n• تحويل 2.3× أسرع\n• CRM ثنائي اللغة عربي وإنجليزي\n\nهل تريد أن أرسل لك دراسة الحالة؟`,
    },
    whatsapp: {
      body: `Hi [First Name]! 👋\n\nShared a 2-page case study with [Company]-like results — 40% less admin, 2.3× faster deals in KSA.\n\nWant me to send it? Takes 5 min to read.`,
    },
    sms: {
      body: `[First Name], NexFlow: GCC peers cut admin 40%, deals 2.3× faster. Case study in 2 pages — send it? Reply YES.`,
    },
  },
  demo: {
    email: {
      subject: "15-min walkthrough for [Company]? This week only",
      body: `Hi [First Name],\n\nI'd love to show you NexFlow in the context of [Company]'s setup — specifically:\n\n1. Arabic AI Voice Agent (live demo)\n2. Power Dialer with real-time coaching\n3. GCC-native enrichment (Lusha + Apollo + Wamda)\n\n15 minutes. No deck. All live. I'll customise it around your pipeline.\n\nPick a time: [Calendar Link]\n\nLooking forward to it,\n[Your Name]`,
    },
    whatsapp: {
      body: `Hi [First Name] 👋\n\n15-min live demo of NexFlow tailored for [Company] this week?\n\nI'll show the Arabic AI voice agent + power dialer live — no slides, just the real product.\n\n📅 Pick a slot: [Calendar Link]`,
    },
    sms: {
      body: `[First Name] - 15min NexFlow demo (Arabic AI + dialer). Book now: [Link]. Reply STOP to opt out.`,
    },
  },
  upsell: {
    email: {
      subject: "You're using [Feature] — here's what's next for [Company]",
      body: `Hi [First Name],\n\nYour team has been getting great results with [Current Feature]. I wanted to flag something that's a natural next step.\n\nOur clients who add the AI Campaign Builder see 3× higher MQL volume within 60 days — because outbound and inbound finally talk to each other.\n\nWould it be worth a 20-minute session to map out what this could look like for [Company]?\n\nBest,\n[Your Name]`,
    },
    whatsapp: {
      body: `Hi [First Name]! Great progress with NexFlow 👏\n\nWanted to mention: teams adding the AI Campaign Builder see 3× more MQLs in 60 days.\n\nWorth a quick look? I can walk you through it in 20 mins 🚀`,
    },
    sms: {
      body: `[First Name], NexFlow: teams adding Campaign Builder get 3× MQLs. 20min session? Reply YES.`,
    },
  },
  event: {
    email: {
      subject: "You're invited: GCC AI Sales Summit · Riyadh · [Date]",
      body: `Hi [First Name],\n\nWe're hosting our first GCC AI Sales Summit in Riyadh on [Date] — an intimate gathering of 50 VP Sales and RevOps leaders.\n\nAgenda highlights:\n• AI Voice Agents for Arabic-speaking markets (live demo)\n• Pipeline velocity playbooks from top GCC teams\n• Roundtable: Vision 2030 and the B2B sales transformation\n\nSeats are limited to 50. Register here: [Link]\n\nHope to see you there,\n[Your Name]`,
    },
    whatsapp: {
      body: `Hi [First Name] 👋\n\nInviting you to our GCC AI Sales Summit in Riyadh — [Date] · 50 seats only.\n\nAI Voice, Pipeline Playbooks, Vision 2030 roundtable.\n\n📌 Register: [Link]\n\nWould love to see you there!`,
    },
    sms: {
      body: `[First Name]: GCC AI Sales Summit Riyadh [Date]. 50 seats. Register: [Link]. Reply STOP to opt out.`,
    },
  },
};

export default function EmailGeneratorPage() {
  const [channel, setChannel] = useState<Channel>("email");
  const [objective, setObjective] = useState<Objective>("reactivation");
  const [tone, setTone] = useState<Tone>("professional");
  const [audience, setAudience] = useState<string>("a1");
  const [includeArabic, setIncludeArabic] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const sample = generated ? GENERATED_SAMPLES[objective]?.[channel] : null;
  const selectedAudience = AUDIENCES.find(a => a.id === audience);

  function generate() {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1800);
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm">
          <Wand2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email &amp; Message Campaigns Generator</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            AI-generated outbound messages for Email, WhatsApp, and SMS — bilingual, GCC-native, CMA-compliant.
          </p>
        </div>
      </div>

      {/* Config panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Step 1: Channel */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full nf-chameleon-bg flex items-center justify-center text-[10px] font-black text-white">1</div>
            <h2 className="font-semibold text-foreground text-sm">Channel</h2>
          </div>
          <div className="flex gap-2">
            {(Object.keys(CHANNEL_META) as Channel[]).map(ch => {
              const m = CHANNEL_META[ch];
              const active = channel === ch;
              return (
                <button key={ch} onClick={() => setChannel(ch)}
                  className={cn("flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                    active ? "border-2 shadow-sm" : "border-border/30 hover:border-border/60")}
                  style={active ? { borderColor: m.color, background: `${m.color}10` } : {}}>
                  <m.icon className="w-5 h-5" style={{ color: active ? m.color : undefined }} />
                  <span className="text-[11px] font-bold" style={{ color: active ? m.color : undefined }}>{m.label}</span>
                  {m.limit && <span className="text-[9px] text-muted-foreground">{m.limit}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Objective */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full nf-chameleon-bg flex items-center justify-center text-[10px] font-black text-white">2</div>
            <h2 className="font-semibold text-foreground text-sm">Objective</h2>
          </div>
          <div className="space-y-1.5">
            {OBJECTIVES.map(o => (
              <button key={o.key} onClick={() => setObjective(o.key)}
                className={cn("w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all",
                  objective === o.key ? "nf-chameleon-bg" : "hover:bg-muted/40")}>
                <div className={cn("text-xs font-bold truncate", objective === o.key ? "text-white" : "text-foreground")}>{o.label}</div>
                <div className={cn("text-[10px] ml-auto flex-shrink-0", objective === o.key ? "text-white/70" : "text-muted-foreground")}>{o.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Tone */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full nf-chameleon-bg flex items-center justify-center text-[10px] font-black text-white">3</div>
            <h2 className="font-semibold text-foreground text-sm">Tone</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {TONES.map(t => (
              <button key={t.key} onClick={() => setTone(t.key)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                  tone === t.key ? "nf-chameleon-bg text-white border-transparent" : "border-border/40 text-muted-foreground hover:border-border/60")}>
                <span>{t.emoji}</span>{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 4: Audience + options */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full nf-chameleon-bg flex items-center justify-center text-[10px] font-black text-white">4</div>
            <h2 className="font-semibold text-foreground text-sm">Audience &amp; Options</h2>
          </div>
          <div className="space-y-2 mb-3">
            {AUDIENCES.map(a => (
              <button key={a.id} onClick={() => setAudience(a.id)}
                className={cn("w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-all",
                  audience === a.id ? "nf-chameleon-bg text-white" : "hover:bg-muted/40 text-foreground")}>
                <Users className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="flex-1 text-left font-medium">{a.label}</span>
                <span className={cn("text-[10px] font-black", audience === a.id ? "text-white/70" : "text-muted-foreground")}>{a.size.toLocaleString()}</span>
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={includeArabic} onChange={e => setIncludeArabic(e.target.checked)} className="w-4 h-4 rounded accent-[#B8A0C8]" />
            <span className="text-xs font-medium text-foreground flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#88B8B0]" /> Include Arabic version</span>
          </label>
        </div>
      </div>

      {/* Generate button */}
      <div className="flex items-center gap-3">
        <button onClick={generate} disabled={generating}
          className="flex items-center gap-2 px-6 py-3 rounded-xl nf-chameleon-bg text-white font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all shadow-sm">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? "Generating with AI…" : "Generate Campaign Copy"}
        </button>
        {selectedAudience && (
          <span className="text-xs text-muted-foreground">Will generate for <span className="font-bold text-foreground">{selectedAudience.label}</span> ({selectedAudience.size} contacts)</span>
        )}
        {generated && !generating && (
          <div className="flex items-center gap-1 text-[#88B8B0] text-xs font-semibold">
            <Check className="w-3.5 h-3.5" /> Generated
          </div>
        )}
      </div>

      {/* Output */}
      {sample && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#C8A880]" />
            <h2 className="font-semibold text-foreground text-sm">Generated Copy — {CHANNEL_META[channel].label} · {OBJECTIVES.find(o => o.key === objective)?.label}</h2>
          </div>

          {/* English version */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/20 bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">English</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#88B8B0]/15 text-[#88B8B0] font-semibold">EN</span>
              </div>
              <button onClick={() => copyText((sample.subject ? `Subject: ${sample.subject}\n\n` : "") + sample.body, "en")}
                className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground">
                {copied === "en" ? <><Check className="w-3 h-3 text-[#88B8B0]" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <div className="p-5">
              {sample.subject && (
                <div className="mb-3 pb-3 border-b border-border/20">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject line</span>
                  <p className="text-sm font-semibold text-foreground mt-1">{sample.subject}</p>
                </div>
              )}
              <pre className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap font-sans">{sample.body}</pre>
            </div>
            {/* Approve button */}
            <div className="flex items-center gap-2 px-5 py-3 border-t border-border/20 bg-muted/10">
              <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold nf-chameleon-bg text-white hover:opacity-90">
                <Send className="w-3 h-3" /> Approve &amp; Schedule
              </button>
              <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/40 text-muted-foreground hover:bg-muted/40">
                <RefreshCw className="w-3 h-3" /> Regenerate
              </button>
              <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1"><Brain className="w-3 h-3" /> Requires agent approval before sending</span>
            </div>
          </div>

          {/* Arabic version */}
          {includeArabic && sample.ar && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/20 bg-muted/20">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Arabic (العربية)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#C8A880]/15 text-[#C8A880] font-semibold">AR</span>
                </div>
                <button onClick={() => copyText(sample.ar!, "ar")}
                  className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground">
                  {copied === "ar" ? <><Check className="w-3 h-3 text-[#88B8B0]" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <div className="p-5">
                <pre className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap font-sans text-right" dir="rtl">{sample.ar}</pre>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 border-t border-border/20 bg-muted/10">
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold nf-chameleon-bg text-white hover:opacity-90">
                  <Send className="w-3 h-3" /> Approve &amp; Schedule
                </button>
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/40 text-muted-foreground hover:bg-muted/40">
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              </div>
            </div>
          )}

          {/* Compliance note */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/20 text-[10px] text-muted-foreground">
            <Star className="w-3.5 h-3.5 text-[#C8A880] flex-shrink-0" />
            <span>All outbound messages require explicit agent approval before sending — CMA-compliant. HNW contact data does not leave KSA regional infrastructure. No fully autonomous sending.</span>
          </div>
        </div>
      )}
    </div>
  );
}
