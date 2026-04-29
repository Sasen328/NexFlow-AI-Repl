const base = import.meta.env.BASE_URL;

export default function Traction() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-mist" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[50vw] h-[50vw] rounded-full opacity-30 blur-[6vw] bg-sand" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>13 · Traction &amp; roadmap</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[14vh]">
        <h2 className="font-display font-extrabold text-[4.4vw] leading-[0.96] tracking-[-0.02em] max-w-[68vw] [text-wrap:balance]">
          A three-year build path, anchored to Vision 2030.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[28vh] bottom-[7vh]">
        <div className="relative h-full grid grid-cols-3 gap-[1.6vw]">
          <div className="absolute top-[3.4vh] left-[2vw] right-[2vw] h-[0.18vh] bg-ink/15" />

          <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.8vw] flex flex-col">
            <div className="flex items-center gap-[1vw]">
              <div className="w-[1.6vw] h-[1.6vw] rotate-45 bg-lavender rounded-[0.3vw]" />
              <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-lavender">Year 1 · 2026</div>
            </div>
            <div className="mt-[1.6vh] font-display font-extrabold text-[2vw] leading-tight">Saudi launch</div>
            <p className="mt-[1.2vh] text-[1.1vw] leading-snug text-ink/75 [text-wrap:pretty]">
              Core CRM + AI Forecast + Conversation Capture in production. Design partners across Riyadh and the Eastern Province.
            </p>
            <div className="mt-auto pt-[2vh] grid grid-cols-2 gap-[0.8vw] text-[1vw]">
              <div><div className="text-ink/55 text-[0.85vw] uppercase tracking-[0.18em]">Customers</div><div className="font-display font-bold text-[1.5vw]">1,200</div></div>
              <div><div className="text-ink/55 text-[0.85vw] uppercase tracking-[0.18em]">Revenue</div><div className="font-display font-bold text-[1.5vw]">SAR 6.3M</div></div>
            </div>
          </div>

          <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.8vw] flex flex-col">
            <div className="flex items-center gap-[1vw]">
              <div className="w-[1.6vw] h-[1.6vw] rotate-45 bg-seafoam rounded-[0.3vw]" />
              <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-seafoam">Year 2 · 2027</div>
            </div>
            <div className="mt-[1.6vh] font-display font-extrabold text-[2vw] leading-tight">GCC expansion</div>
            <p className="mt-[1.2vh] text-[1.1vw] leading-snug text-ink/75 [text-wrap:pretty]">
              Marketing, Cloud Calls, and Data Enrichment modules generally available. UAE, Qatar, Bahrain, Kuwait, and Oman go-to-market.
            </p>
            <div className="mt-auto pt-[2vh] grid grid-cols-2 gap-[0.8vw] text-[1vw]">
              <div><div className="text-ink/55 text-[0.85vw] uppercase tracking-[0.18em]">Customers</div><div className="font-display font-bold text-[1.5vw]">6,200</div></div>
              <div><div className="text-ink/55 text-[0.85vw] uppercase tracking-[0.18em]">Revenue</div><div className="font-display font-bold text-[1.5vw]">SAR 73.9M</div></div>
            </div>
          </div>

          <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.8vw] flex flex-col">
            <div className="flex items-center gap-[1vw]">
              <div className="w-[1.6vw] h-[1.6vw] rotate-45 bg-sand rounded-[0.3vw]" />
              <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-sand">Year 3 · 2028</div>
            </div>
            <div className="mt-[1.6vh] font-display font-extrabold text-[2vw] leading-tight">Egypt &amp; Levant</div>
            <p className="mt-[1.2vh] text-[1.1vw] leading-snug text-ink/75 [text-wrap:pretty]">
              Workflows, Analytics &amp; BI, and Marketplace launch. Egypt, Jordan, and partner-led entry into Iraq. ARR crosses SAR 665M.
            </p>
            <div className="mt-auto pt-[2vh] grid grid-cols-2 gap-[0.8vw] text-[1vw]">
              <div><div className="text-ink/55 text-[0.85vw] uppercase tracking-[0.18em]">Customers</div><div className="font-display font-bold text-[1.5vw]">19,200</div></div>
              <div><div className="text-ink/55 text-[0.85vw] uppercase tracking-[0.18em]">Revenue</div><div className="font-display font-bold text-[1.5vw]">SAR 415M</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
