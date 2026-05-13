const base = import.meta.env.BASE_URL;

export default function FinancialProjections() {
  const years = [
    {
      year: "Year 1", color: "border-lavender", accent: "text-lavender",
      arr: "SAR 3.6M", customers: "120", arpu: "SAR 30K/yr", seats: "600 seats avg 5/co",
      rev: "3.6M", costs: "2.8M", ebitda: "0.8M", margin: "22%",
      milestones: ["KSA + UAE launch", "First 120 paying customers", "Seed round close", "Saudi PDPL certification"],
    },
    {
      year: "Year 2", color: "border-seafoam", accent: "text-seafoam",
      arr: "SAR 14.4M", customers: "480", arpu: "SAR 30K/yr", seats: "2,400 seats",
      rev: "14.4M", costs: "9.2M", ebitda: "5.2M", margin: "36%",
      milestones: ["Qatar + Kuwait expansion", "Series A close", "Arabic AI voice GA", "Partner channel launch"],
    },
    {
      year: "Year 3", color: "border-sand", accent: "text-sand",
      arr: "SAR 86M", customers: "2,400", arpu: "SAR 36K/yr", seats: "14,400 seats",
      rev: "86M", costs: "48M", ebitda: "38M", margin: "44%",
      milestones: ["All 6 GCC markets live", "Series B", "1,000+ enterprise seats tier", "White-label partner revenue"],
    },
  ];

  const unitEcon = [
    { label: "CAC (blended)", value: "SAR 8,400" },
    { label: "LTV (3yr)", value: "SAR 90,000" },
    { label: "LTV : CAC", value: "10.7×" },
    { label: "Payback period", value: "8 months" },
    { label: "Gross margin (SaaS)", value: "72%" },
    { label: "Net Revenue Retention", value: "118% (Year 2 target)" },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] left-[-6vw] w-[50vw] h-[50vw] rounded-full opacity-20 blur-[6vw] bg-lavender" />
        <div className="absolute bottom-[-10vh] right-[-6vw] w-[40vw] h-[40vw] rounded-full opacity-18 blur-[6vw] bg-sand" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>Financial · Projections · 3-year</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13vh]">
        <h2 className="font-display font-extrabold text-[3.8vw] leading-[0.96] tracking-[-0.02em]">
          SAR 3.6M → 14.4M → 86M ARR. 3-year path.
        </h2>
        <p className="mt-[0.8vh] font-serif italic text-[1.4vw] text-ink/65">Conservative bottoms-up model. 120 customers year one at SAR 30K average annual contract. 20× growth to year three.</p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[28vh] bottom-[4vh]">
        <div className="grid grid-cols-3 gap-[1.2vw] mb-[1.2vh]">
          {years.map((y, i) => (
            <div key={i} className={`rounded-[1.2vw] bg-white/72 border-2 ${y.color} p-[1.3vw]`}>
              <div className={`font-display font-extrabold text-[1.1vw] uppercase tracking-[0.18em] ${y.accent} mb-[0.5vh]`}>{y.year}</div>
              <div className="font-display font-extrabold text-[2.4vw] leading-none mb-[0.8vh]">{y.arr} ARR</div>
              <div className="grid grid-cols-2 gap-x-[1vw] gap-y-[0.3vh] mb-[0.8vh] text-[0.82vw]">
                <div><span className="text-ink/50">Customers</span> <span className="font-semibold">{y.customers}</span></div>
                <div><span className="text-ink/50">ARPU</span> <span className="font-semibold">{y.arpu}</span></div>
                <div><span className="text-ink/50">Revenue</span> <span className="font-semibold">SAR {y.rev}</span></div>
                <div><span className="text-ink/50">EBITDA</span> <span className="font-semibold">SAR {y.ebitda} ({y.margin})</span></div>
              </div>
              <div className="border-t border-ink/10 pt-[0.6vh]">
                {y.milestones.map((m, j) => (
                  <div key={j} className="flex gap-[0.5vw] items-start mb-[0.25vh]">
                    <span className={`mt-[0.25vh] w-[0.5vw] h-[0.5vw] rounded-full ${y.color.replace('border-', 'bg-')} flex-shrink-0`} />
                    <span className="text-[0.8vw] text-ink/72">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-[0.8vw]">
          {unitEcon.map((u, i) => (
            <div key={i} className="rounded-[0.8vw] bg-ink/5 border border-ink/8 px-[0.8vw] py-[0.8vh] text-center">
              <div className="font-display font-extrabold text-[1.3vw] leading-none">{u.value}</div>
              <div className="text-[0.72vw] text-ink/50 mt-[0.2vh] leading-tight">{u.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
