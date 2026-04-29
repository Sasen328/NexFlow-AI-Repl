export default function Vision() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-40 blur-[6vw] bg-mist" />
        <div className="absolute bottom-[-15vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-40 blur-[6vw] bg-olive" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>13 · Vision</span>
        <span>Beyond CRM</span>
      </div>

      <div className="absolute left-[6vw] top-[18vh] right-[6vw]">
        <h2 className="font-display font-extrabold text-[6vw] leading-[0.94] tracking-[-0.025em] [text-wrap:balance] max-w-[80vw]">
          The system of record for how the Gulf does business.
        </h2>
        <p className="mt-[3vh] font-serif italic text-[1.85vw] leading-snug max-w-[68vw] text-ink/75 [text-wrap:pretty]">
          CRM is the wedge. The long arc is a sovereign revenue platform — sales, service, billing, and AI agents — owned by the region, in the region's languages, on the region's infrastructure.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[10vh] grid grid-cols-3 gap-[2vw]">
        <div className="border-t-[0.3vh] border-ink/30 pt-[2vh]">
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-mist">2026 — CRM</div>
          <p className="mt-[1.2vh] text-[1.2vw] leading-relaxed text-ink/75">Bilingual sales and pipeline. Win the Saudi mid-market.</p>
        </div>
        <div className="border-t-[0.3vh] border-ink/30 pt-[2vh]">
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-seafoam">2027 — Revenue OS</div>
          <p className="mt-[1.2vh] text-[1.2vw] leading-relaxed text-ink/75">Add service desk, ZATCA-native quoting, and bilingual customer portals.</p>
        </div>
        <div className="border-t-[0.3vh] border-ink/30 pt-[2vh]">
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-lavender">2028 — Agentic GCC</div>
          <p className="mt-[1.2vh] text-[1.2vw] leading-relaxed text-ink/75">Specialized AI agents that close, renew, and serve — sovereign by design.</p>
        </div>
      </div>
    </div>
  );
}
