const base = import.meta.env.BASE_URL;

export default function FeatureContactCenter() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[10vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-rose" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>17 · Feature deep-dive · Contact Center</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[12vh]">
        <div className="text-[1vw] tracking-[0.3em] uppercase font-semibold text-rose mb-[1vh]">Module 03 · Contact Center</div>
        <h2 className="font-display font-extrabold text-[3vw] leading-[1.04] tracking-[-0.02em] max-w-[80vw] [text-wrap:balance]">
          Power Dialer that prioritizes. AI Voice Agent that calls. Intelligence on every conversation.
        </h2>
      </div>

      <div className="absolute left-[6vw] top-[32vh] bottom-[6vh] w-[50vw]">
        <div className="rounded-[1vw] overflow-hidden border border-ink/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] bg-white">
          <img src={`${base}screenshots/power-dialer.jpg`} crossOrigin="anonymous" alt="NexFlow Power Dialer screen" className="w-full h-auto block" />
        </div>
        <div className="mt-[1.4vh] text-[0.78vw] uppercase tracking-[0.2em] text-ink/55 italic">
          Live screenshot · Power Dialer / AI-prioritized outbound queue
        </div>
      </div>

      <div className="absolute right-[6vw] top-[32vh] bottom-[6vh] w-[35vw] flex flex-col gap-[1.2vh]">
        {[
          { t: "Power Dialer workflow", d: "Lead-scoring model ranks every open contact (intent + recency + persona). Reps work top-down through a single queue — connect rate metric is shown in real time." },
          { t: "AI Voice Agent (Khaleeji)", d: "Bilingual voice agent dials qualified leads, runs a discovery script, books meetings into the rep's calendar, and pushes a structured summary back into the deal record." },
          { t: "Live AI Coach", d: "On every connected call, side-panel surfaces real-time tips (objection-handling lines, scripts, and competitive battle-cards). Coach mode can be toggled per rep." },
          { t: "Calls & Transcripts", d: "Every call recorded, transcribed bilingually (Whisper + custom Khaleeji LM), summarized, and scored. Action items auto-create as tasks against the deal." },
          { t: "Conversation Intelligence", d: "Trend analysis across the team: top objections this week, talk-listen ratios, monologue length, sentiment by stage, competitor mentions — exported to coaching plans." },
          { t: "WhatsApp / Messages / Email", d: "Unified inbox with thread-level deal context. AI drafts reply, books meetings, escalates risk — all native, no add-on tier." },
        ].map(({ t, d }) => (
          <div key={t} className="rounded-[0.7vw] bg-white/80 border border-ink/10 p-[0.9vw]">
            <div className="font-bold text-[0.95vw] text-rose">{t}</div>
            <p className="mt-[0.3vh] text-[0.78vw] leading-snug text-ink/75 [text-wrap:pretty]">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
