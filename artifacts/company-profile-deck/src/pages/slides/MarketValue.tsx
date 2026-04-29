const base = import.meta.env.BASE_URL;

export default function MarketValue() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-35 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[50vw] h-[50vw] rounded-full opacity-30 blur-[6vw] bg-olive" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>06 · Value generated</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[14vh]">
        <h2 className="font-display font-extrabold text-[4.6vw] leading-[0.96] tracking-[-0.02em] max-w-[68vw] [text-wrap:balance]">
          What customers gain in the first 12 months.
        </h2>
        <p className="mt-[2vh] font-serif italic text-[1.6vw] leading-snug text-ink/75 max-w-[60vw] [text-wrap:pretty]">
          Modeled against the Pipedrive Sales-CRM benchmark study and our internal feasibility analysis.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[8vh] grid grid-cols-4 gap-[1.6vw]">
        <div className="rounded-[1.4vw] bg-white/75 border border-ink/10 p-[1.8vw]">
          <div className="font-display font-extrabold text-[5.4vw] leading-none tracking-tight text-lavender">+28%</div>
          <div className="mt-[1.4vh] font-display font-bold text-[1.4vw] leading-tight">Pipeline velocity</div>
          <p className="mt-[1vh] text-[1.05vw] leading-snug text-ink/75 [text-wrap:pretty]">
            Faster stage-to-stage movement once AI capture removes the data-entry tax on every seller's day.
          </p>
        </div>
        <div className="rounded-[1.4vw] bg-white/75 border border-ink/10 p-[1.8vw]">
          <div className="font-display font-extrabold text-[5.4vw] leading-none tracking-tight text-seafoam">+22%</div>
          <div className="mt-[1.4vh] font-display font-bold text-[1.4vw] leading-tight">Win rate uplift</div>
          <p className="mt-[1vh] text-[1.05vw] leading-snug text-ink/75 [text-wrap:pretty]">
            From AI-prioritized next best actions and per-deal coaching surfaced in the seller's own workflow.
          </p>
        </div>
        <div className="rounded-[1.4vw] bg-white/75 border border-ink/10 p-[1.8vw]">
          <div className="font-display font-extrabold text-[5.4vw] leading-none tracking-tight text-sand">−40%</div>
          <div className="mt-[1.4vh] font-display font-bold text-[1.4vw] leading-tight">CRM admin time</div>
          <p className="mt-[1vh] text-[1.05vw] leading-snug text-ink/75 [text-wrap:pretty]">
            Auto-capture from calls, WhatsApp, and email replaces the after-hours pipeline-update ritual.
          </p>
        </div>
        <div className="rounded-[1.4vw] bg-white/75 border border-ink/10 p-[1.8vw]">
          <div className="font-display font-extrabold text-[5.4vw] leading-none tracking-tight text-rose">−35%</div>
          <div className="mt-[1.4vh] font-display font-bold text-[1.4vw] leading-tight">Tooling cost</div>
          <p className="mt-[1vh] text-[1.05vw] leading-snug text-ink/75 [text-wrap:pretty]">
            One bundled platform replaces a CRM + marketing + dialer + enrichment + BI stack.
          </p>
        </div>
      </div>
    </div>
  );
}
