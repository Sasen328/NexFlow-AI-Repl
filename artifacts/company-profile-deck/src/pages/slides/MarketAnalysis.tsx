const base = import.meta.env.BASE_URL;

export default function MarketAnalysis() {
  const stats = [
    { label: "Global CRM market (2024)", value: "$98B", sub: "Growing at 13.8% CAGR through 2030" },
    { label: "GCC CRM addressable market", value: "$3.4B", sub: "KSA + UAE + Qatar + Kuwait + Bahrain + Oman" },
    { label: "GCC B2B companies in ICP", value: "180K+", sub: "10–500 employee companies with sales teams" },
    { label: "CRM adoption in GCC (SMB)", value: "< 18%", sub: "vs 67% in North America — massive whitespace" },
    { label: "CRM users — KSA alone", value: "2.1M", sub: "Licensed seats across all vendors (2024 est.)" },
    { label: "AI CRM premium willingness", value: "3.4×", sub: "GCC buyers pay more for AI-native vs retrofitted" },
  ];

  const drivers = [
    { icon: "◈", title: "Vision 2030 / D33", desc: "KSA and UAE national digitisation mandates are forcing enterprise sales teams off spreadsheets. Government procurement now favours local-data-residency vendors." },
    { icon: "◈", title: "Arabic-first mandate", desc: "New Saudi data and communications regulations require Arabic UI parity. Global CRMs are scrambling to retrofit — NexFlow ships Arabic-native from day one." },
    { icon: "◈", title: "WhatsApp as primary B2B channel", desc: "90%+ of GCC B2B outreach happens on WhatsApp. No global CRM has a native WhatsApp engine with bilingual AI bot + broadcast + shared inbox." },
    { icon: "◈", title: "Salesforce / HubSpot price fatigue", desc: "A 50-seat GCC team pays USD $85K–$180K/year with add-ons. Dollar-denominated, US tax treatment, data leaving region. NexFlow is SAR-priced, region-hosted, all-in." },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] right-[-8vw] w-[55vw] h-[55vw] rounded-full opacity-22 blur-[6vw] bg-sand" />
        <div className="absolute bottom-[-10vh] left-[-6vw] w-[40vw] h-[40vw] rounded-full opacity-20 blur-[6vw] bg-mist" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>Market · Analysis</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13vh]">
        <h2 className="font-display font-extrabold text-[3.8vw] leading-[0.96] tracking-[-0.02em]">
          $3.4B GCC market. 18% penetrated. Right now.
        </h2>
        <p className="mt-[0.8vh] font-serif italic text-[1.4vw] text-ink/65">The moment when Vision 2030 mandates, WhatsApp-first sales, and AI capability collide — creating a once-in-a-decade replacement cycle.</p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[28vh] bottom-[4vh]">
        <div className="grid grid-cols-3 gap-[1vw] mb-[1.2vh]">
          {stats.map((s, i) => (
            <div key={i} className="rounded-[1vw] bg-white/72 border border-ink/8 px-[1.4vw] py-[1.2vh]">
              <div className="text-[0.78vw] uppercase tracking-[0.18em] font-semibold text-ink/50 mb-[0.3vh]">{s.label}</div>
              <div className="font-display font-extrabold text-[2.8vw] leading-none text-ink">{s.value}</div>
              <div className="text-[0.88vw] text-ink/55 mt-[0.3vh]">{s.sub}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-[1vw]">
          {drivers.map((d, i) => (
            <div key={i} className="rounded-[1vw] bg-sand/10 border border-sand/25 p-[1.2vw] flex gap-[0.8vw]">
              <span className="text-[1.6vw] text-sand mt-[0.2vh] flex-shrink-0">{d.icon}</span>
              <div>
                <div className="font-display font-bold text-[1.05vw] leading-tight mb-[0.3vh]">{d.title}</div>
                <p className="text-[0.88vw] leading-snug text-ink/72 [text-wrap:pretty]">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
