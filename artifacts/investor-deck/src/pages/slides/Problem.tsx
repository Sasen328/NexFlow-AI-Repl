export default function Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-20vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-40 blur-[6vw] bg-rose" />
        <div className="absolute bottom-[-15vh] left-[-10vw] w-[45vw] h-[45vw] rounded-full opacity-35 blur-[6vw] bg-sand" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>01 · Problem</span>
        <span>What sales teams in the GCC actually use</span>
      </div>

      <div className="absolute left-[6vw] top-[18vh] right-[6vw]">
        <h2 className="font-display font-extrabold text-[5.6vw] leading-[0.96] tracking-[-0.025em] [text-wrap:balance] max-w-[78vw]">
          The Gulf runs on WhatsApp and spreadsheets — not CRM.
        </h2>
        <p className="mt-[3vh] font-serif italic text-[1.85vw] leading-snug max-w-[70vw] text-ink/75 [text-wrap:pretty]">
          Imported tools were built for English-first North American workflows. They miss how teams here actually sell — and rep adoption never crosses 30%.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[10vh] grid grid-cols-3 gap-[2vw]">
        <div className="border-t-[0.3vh] border-ink/30 pt-[2vh]">
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-rose">Friction</div>
          <div className="mt-[1.2vh] font-display font-bold text-[1.55vw] leading-tight">Arabic is bolted on, not native</div>
          <p className="mt-[1vh] text-[1.15vw] leading-relaxed text-ink/70">RTL layouts break, Hijri dates are missing, and Arabic search returns the wrong record.</p>
        </div>
        <div className="border-t-[0.3vh] border-ink/30 pt-[2vh]">
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-sand">Reality</div>
          <div className="mt-[1.2vh] font-display font-bold text-[1.55vw] leading-tight">Real deals live in WhatsApp</div>
          <p className="mt-[1vh] text-[1.15vw] leading-relaxed text-ink/70">No mainstream CRM treats WhatsApp as a first-class pipeline channel for the region.</p>
        </div>
        <div className="border-t-[0.3vh] border-ink/30 pt-[2vh]">
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-lavender">Risk</div>
          <div className="mt-[1.2vh] font-display font-bold text-[1.55vw] leading-tight">Customer data leaves KSA</div>
          <p className="mt-[1vh] text-[1.15vw] leading-relaxed text-ink/70">PDPL and Vision 2030 sovereignty rules push enterprises toward local hosting — current CRMs cannot guarantee it.</p>
        </div>
      </div>
    </div>
  );
}
