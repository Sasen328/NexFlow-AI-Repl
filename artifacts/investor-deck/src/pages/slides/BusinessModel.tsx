export default function BusinessModel() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-15vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-35 blur-[6vw] bg-mist" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-35 blur-[6vw] bg-sand" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>05 · Business Model</span>
        <span>Per-seat SaaS, three tiers</span>
      </div>

      <div className="absolute left-[6vw] top-[16vh] right-[6vw]">
        <h2 className="font-display font-extrabold text-[5vw] leading-[0.96] tracking-[-0.025em] [text-wrap:balance] max-w-[80vw]">
          Predictable per-seat revenue. Premium ARPU as we move upmarket.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[8vh] grid grid-cols-3 gap-[1.6vw]">
        <div className="bg-ink/8 rounded-[1.2vw] p-[2vw]">
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-seafoam">Starter</div>
          <div className="mt-[1vh] font-display font-extrabold text-[3.4vw] leading-none">$19<span className="text-[1.4vw] font-medium opacity-65"> / seat / mo</span></div>
          <p className="mt-[1.5vh] text-[1.1vw] leading-relaxed text-ink/75">SMB sales teams. Bilingual CRM core, WhatsApp inbox, basic AI copilot.</p>
        </div>
        <div className="bg-ink text-bg rounded-[1.2vw] p-[2vw]">
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-lavender">Professional · Business</div>
          <div className="mt-[1vh] font-display font-extrabold text-[3.4vw] leading-none">$79–129<span className="text-[1.4vw] font-medium opacity-65"> / seat / mo</span></div>
          <p className="mt-[1.5vh] text-[1.1vw] leading-relaxed text-bg/80">Mid-market. Pipeline forecasting, advanced AI Hub, full integrations, ZATCA quoting.</p>
        </div>
        <div className="bg-ink/8 rounded-[1.2vw] p-[2vw]">
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-sand">Enterprise · Sovereign</div>
          <div className="mt-[1.2vh] font-display font-extrabold text-[3.4vw] leading-none">$199–299<span className="text-[1.4vw] font-medium opacity-65"> / seat / mo</span></div>
          <p className="mt-[1.5vh] text-[1.1vw] leading-relaxed text-ink/75">Enterprise & government, tiered by seat band. Single-tenant KSA hosting, audit, SSO, custom AI tuning.</p>
        </div>
      </div>

      <div className="absolute bottom-[2vh] left-[6vw] right-[6vw] grid grid-cols-3 gap-[2vw] text-[1.05vw] text-ink/65">
        <div><span className="font-bold text-ink">Y1 ARPU $59.10</span> · Starter 50% of mix</div>
        <div><span className="font-bold text-ink">Y2 ARPU $69.75</span> · Pro+Business become majority</div>
        <div><span className="font-bold text-ink">Y3 ARPU $77.40</span> · Enterprise mix grows fastest</div>
      </div>
    </div>
  );
}
