export default function GoToMarket() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-15vh] right-[-15vw] w-[55vw] h-[55vw] rounded-full opacity-40 blur-[6vw] bg-rose" />
        <div className="absolute bottom-[-15vh] left-[-15vw] w-[55vw] h-[55vw] rounded-full opacity-40 blur-[6vw] bg-olive" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>06 · Go-to-Market</span>
        <span>Wedge → expand → enterprise</span>
      </div>

      <div className="absolute left-[6vw] top-[16vh] right-[6vw]">
        <h2 className="font-display font-extrabold text-[5.2vw] leading-[0.96] tracking-[-0.025em] [text-wrap:balance] max-w-[78vw]">
          Land in real-estate and clinics. Expand to every regulated SMB.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[10vh] grid grid-cols-3 gap-[2vw]">
        <div>
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-rose">Year 1 — Wedge</div>
          <div className="mt-[1.5vh] font-display font-bold text-[1.7vw] leading-tight">Real-estate brokers & private clinics in Riyadh</div>
          <p className="mt-[1.5vh] text-[1.15vw] leading-relaxed text-ink/70">High WhatsApp dependency, fast sales cycles, painful spreadsheets. We win 1,200 customers (~6,000 seats) through founder-led sales and design-partner case studies.</p>
        </div>
        <div>
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-seafoam">Year 2 — Expand</div>
          <div className="mt-[1.5vh] font-display font-bold text-[1.7vw] leading-tight">Logistics, automotive, professional services</div>
          <p className="mt-[1.5vh] text-[1.15vw] leading-relaxed text-ink/70">Repeatable industry plays. We bring in two account executives, partner with 4 regional system integrators, and scale to 6,200 customers (~43,400 seats).</p>
        </div>
        <div>
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-sand">Year 3 — Enterprise</div>
          <div className="mt-[1.5vh] font-display font-bold text-[1.7vw] leading-tight">Banks, telcos, ministries, PIF portfolio</div>
          <p className="mt-[1.5vh] text-[1.15vw] leading-relaxed text-ink/70">Sovereign-tier deals. UAE expansion, channel program with the integrators, and 19,200 paying customers (~192,000 seats) by year-end.</p>
        </div>
      </div>
    </div>
  );
}
