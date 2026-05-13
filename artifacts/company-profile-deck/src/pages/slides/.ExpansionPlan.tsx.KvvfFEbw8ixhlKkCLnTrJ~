const base = import.meta.env.BASE_URL;

export default function ExpansionPlan() {
  const phases = [
    {
      phase: "Phase 1", period: "Months 1–12", color: "border-lavender", accent: "text-lavender", bg: "bg-lavender/10",
      title: "KSA + UAE — Anchor markets",
      markets: ["Saudi Arabia", "United Arab Emirates"],
      actions: [
        "Riyadh + Jeddah direct sales team (4 reps)",
        "Dubai office, DIFC entity for UAE billing",
        "Saudi PDPL certification + KSA data residency live",
        "GITEX 2025 launch event — 500 booth demos",
        "First 120 paying customers. ARR: SAR 3.6M",
        "Arabic AI Voice GA — Layla + Faisal voices",
        "Masaar Saudi CR engine GA",
      ]
    },
    {
      phase: "Phase 2", period: "Months 13–24", color: "border-seafoam", accent: "text-seafoam", bg: "bg-seafoam/10",
      title: "Qatar + Kuwait — Gulf extension",
      markets: ["Qatar", "Kuwait"],
      actions: [
        "Doha office, QFC entity for Qatar billing",
        "Kuwait City partner-led go-to-market",
        "QAR + KWD pricing tiers live",
        "Wamda + MoCI + Argaam signal sources full coverage",
        "Series A close — SAR 25M target",
        "Partner channel: 10 GCC resellers onboarded",
        "480 customers. ARR: SAR 14.4M",
      ]
    },
    {
      phase: "Phase 3", period: "Months 25–36", color: "border-sand", accent: "text-sand", bg: "bg-sand/10",
      title: "Bahrain + Oman — Full GCC coverage",
      markets: ["Bahrain", "Oman"],
      actions: [
        "Manama (fintech hub) + Muscat offices",
        "BHD + OMR pricing live",
        "White-label offering for GCC banks and telcos",
        "Arabic Levantine + Egyptian voice personas GA",
        "Government sector vertical — Vision 2030 procurement",
        "Series B close — SAR 80M target",
        "2,400 customers. ARR: SAR 86M",
      ]
    },
  ];

  const requirements = [
    { country: "KSA", req: "Saudi PDPL · Data residency (SDAIA) · CR number · Mada payment license · Arabic UI parity" },
    { country: "UAE", req: "DIFC / ADGM entity · TDRA compliance · UAE Pass integration consideration · AED pricing" },
    { country: "Qatar", req: "QFC registration · PDPPL compliance · QAR pricing · Government procurement pre-qual" },
    { country: "Kuwait", req: "CITRA compliance · Kuwait data localisation · Partner-led GTM · KWD pricing" },
    { country: "Bahrain", req: "CBB fintech compliance · EDB registration · BHD pricing · FinTech Bay partnership" },
    { country: "Oman", req: "TRA Oman · ITA registration · OMR pricing · Government sector vertical entry" },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] left-[-8vw] w-[50vw] h-[50vw] rounded-full opacity-20 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-10vh] right-[-6vw] w-[40vw] h-[40vw] rounded-full opacity-18 blur-[6vw] bg-lavender" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>Expansion · 3-year GCC rollout</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13vh]">
        <h2 className="font-display font-extrabold text-[3.8vw] leading-[0.96] tracking-[-0.02em]">
          6 GCC markets. 36 months. One platform architecture.
        </h2>
        <p className="mt-[0.8vh] font-serif italic text-[1.4vw] text-ink/65">KSA + UAE anchor → Qatar + Kuwait extension → Bahrain + Oman completion. Per-country compliance built into the product, not bolted on.</p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[27vh] bottom-[4vh]">
        <div className="grid grid-cols-3 gap-[1.2vw] mb-[1.2vh]">
          {phases.map((p, i) => (
            <div key={i} className={`rounded-[1.2vw] ${p.bg} border-2 ${p.color} p-[1.3vw]`}>
              <div className={`font-display font-extrabold text-[0.9vw] uppercase tracking-[0.18em] ${p.accent} mb-[0.2vh]`}>{p.phase} · {p.period}</div>
              <div className="font-display font-extrabold text-[1.3vw] leading-tight mb-[0.2vh]">{p.title}</div>
              <div className={`text-[0.78vw] font-semibold ${p.accent} mb-[0.7vh]`}>{p.markets.join(" · ")}</div>
              <ul className="space-y-[0.3vh]">
                {p.actions.map((a, j) => (
                  <li key={j} className="flex gap-[0.5vw] items-start">
                    <span className={`mt-[0.25vh] w-[0.5vw] h-[0.5vw] rounded-full ${p.color.replace('border-', 'bg-')} flex-shrink-0`} />
                    <span className="text-[0.82vw] text-ink/80">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="rounded-[1vw] bg-white/60 border border-ink/8 px-[1.2vw] py-[0.7vh]">
          <div className="text-[0.75vw] uppercase tracking-[0.18em] font-semibold text-ink/50 mb-[0.5vh]">Per-country compliance requirements (all built into product architecture)</div>
          <div className="grid grid-cols-3 gap-x-[1.5vw] gap-y-[0.3vh]">
            {requirements.map((r, i) => (
              <div key={i} className="flex gap-[0.6vw]">
                <span className="font-display font-bold text-[0.82vw] w-[2.8vw] flex-shrink-0">{r.country}</span>
                <span className="text-[0.78vw] text-ink/65">{r.req}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
