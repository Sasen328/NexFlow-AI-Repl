const base = import.meta.env.BASE_URL;

export default function FeatureMarketing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[10vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-sand" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>20 · Feature deep-dive · Marketing</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[12vh]">
        <div className="text-[0.95vw] tracking-[0.3em] uppercase font-semibold text-sand mb-[0.8vh]">Module 05 · Marketing</div>
        <h2 className="font-display font-extrabold text-[2.8vw] leading-[1.06] tracking-[-0.02em] max-w-[80vw] [text-wrap:balance]">
          Describe the campaign. AI returns the strategy, the cadence, and the budget split.
        </h2>
      </div>

      <div className="absolute left-[6vw] top-[28vh] bottom-[6vh] w-[52vw]">
        <div className="rounded-[1vw] overflow-hidden border border-ink/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] bg-white">
          <img src={`${base}screenshots/campaigns.jpg`} crossOrigin="anonymous" alt="NexFlow Marketing Intelligence campaigns screen" className="w-full h-auto block" />
        </div>
        <div className="mt-[1.4vh] text-[0.78vw] uppercase tracking-[0.2em] text-ink/55 italic">
          Live screenshot · Marketing / AI Strategy Builder
        </div>
      </div>

      <div className="absolute right-[6vw] top-[30vh] bottom-[6vh] w-[35vw] flex flex-col gap-[1.2vh]">
        {[
          { t: "AI Strategy Builder", d: "Describe a goal (\"re-engage dormant GCC enterprise leads\"), pick budget + channels — AI returns the messaging strategy, calendar, audience segments, and projected pipeline." },
          { t: "Dormant lead reactivation", d: "Continuously identifies leads silent ≥90 days, segments by reason of silence, and proposes a multi-touch reactivation cadence — one-tap to launch." },
          { t: "Multi-channel sequences", d: "Email → WhatsApp → SMS → call cadences with branching by reply, click, or signal. Steps render in Arabic or English depending on contact preference." },
          { t: "Cultural Intelligence layer", d: "Auto-applies KSA/UAE/BH norms: Hijri-aware send times, Ramadan windows, Friday/Saturday weekend shift, Khaleeji vs Levantine dialect templates." },
          { t: "Attribution to pipeline", d: "Every campaign touch is wired into deal records — \"Pipeline Influenced\" KPI shows real revenue impact, not just opens and clicks." },
          { t: "Web Forms + Document Tracking", d: "Lead-capture forms write directly to CRM with enrichment on submit; sent quotes/decks ping the rep when prospects open + scroll past key pages." },
        ].map(({ t, d }) => (
          <div key={t} className="rounded-[0.7vw] bg-white/80 border border-ink/10 p-[0.9vw]">
            <div className="font-bold text-[0.95vw] text-sand">{t}</div>
            <p className="mt-[0.3vh] text-[0.78vw] leading-snug text-ink/75 [text-wrap:pretty]">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
