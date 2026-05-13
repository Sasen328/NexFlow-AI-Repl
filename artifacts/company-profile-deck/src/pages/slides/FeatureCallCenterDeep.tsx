const base = import.meta.env.BASE_URL;

export default function FeatureCallCenterDeep() {
  const features = [
    { color: "bg-rose", name: "Power Dialer — 3 modes", desc: "Manual · Auto-Dial (advances queue, logs voicemail/no-answer) · AI Agent (fully autonomous calling). One dialer, three velocity levels." },
    { color: "bg-sand", name: "Pre-call AI Brief", desc: "Score-based talking points generated per contact before each call. High-intent vs cold vs warm approach — not a generic script." },
    { color: "bg-seafoam", name: "Live Streaming Transcript", desc: "Real-time line-by-line transcript during the call. Bilingual Arabic/English. Searchable after the call ends." },
    { color: "bg-lavender", name: "LiveCoachPanel", desc: "Detects objections in real-time (budget, incumbent, timing). Pushes coaching suggestions mid-call. Flags buying signals live." },
    { color: "bg-mist", name: "Post-Call 1-Click Panel", desc: "Logs note + creates follow-up task + sets reminder + drafts WhatsApp + drafts email — all simultaneously in one click after the call ends." },
    { color: "bg-olive", name: "Post-Call Automation", desc: "Cadence rules: 'No answer → AI WhatsApp in 5 min', 'Voicemail → Email', 'AI Agent handoff → WhatsApp booking'. Approval queue with edit/reject. Arabic RTL drafts." },
    { color: "bg-rose", name: "AI Voice Agents — 6 voices", desc: "Layla (Gulf Arabic ♀), Faisal (KSA Arabic ♂), Noor (bilingual AR/EN), Adam (English), Reem (Levantine), Omar (Egyptian). Make and receive calls autonomously." },
    { color: "bg-sand", name: "AI Agent Builder", desc: "Describe role → AI improves prompt → deploy → run on demand → review run history. Build custom agents for any use case." },
    { color: "bg-seafoam", name: "Conversation Intelligence", desc: "Per-call: sentiment score, talk/listen ratio, topic extraction, objection tracking, next steps. Bilingual Arabic/English analysis." },
    { color: "bg-lavender", name: "Call Recording Redaction", desc: "Auto-redacts: credit cards, Saudi IBAN (SA04...), Iqama numbers, SSN, phones, emails from transcripts. PCI DSS + KSA PDPL compliant." },
    { color: "bg-mist", name: "WhatsApp Business", desc: "Native shared inbox, bilingual AI bot (switches Arabic ↔ English mid-conversation), broadcast templates, Arabic quick-reply buttons." },
    { color: "bg-olive", name: "Knowledge Base", desc: "Scripts, Objection Handlers, AI Playbooks generated per persona × industry × country × deal size. Company Insights tab." },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] right-[-8vw] w-[50vw] h-[50vw] rounded-full opacity-28 blur-[6vw] bg-rose" />
        <div className="absolute bottom-[-10vh] left-[-6vw] w-[40vw] h-[40vw] rounded-full opacity-22 blur-[6vw] bg-mist" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>Engine 02 · Call Center</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13vh]">
        <h2 className="font-display font-extrabold text-[3.8vw] leading-[0.96] tracking-[-0.02em]">
          Call Center Engine — 12 features. Arabic-native.
        </h2>
        <p className="mt-[0.8vh] font-serif italic text-[1.4vw] text-ink/65">The only platform with autonomous Arabic AI voice agents, live coaching, and post-call WhatsApp automation.</p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[27vh] bottom-[4vh] grid grid-cols-4 grid-rows-3 gap-[0.9vw]">
        {features.map((f, i) => (
          <div key={i} className="rounded-[1vw] bg-white/72 border border-ink/8 p-[1.2vw] flex flex-col gap-[0.4vh]">
            <div className="flex items-center gap-[0.6vw]">
              <span className={`w-[0.8vw] h-[0.8vw] rounded-full ${f.color} flex-shrink-0`} />
              <span className="font-display font-bold text-[1.05vw] leading-tight">{f.name}</span>
            </div>
            <p className="text-[0.88vw] leading-snug text-ink/72 [text-wrap:pretty]">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
