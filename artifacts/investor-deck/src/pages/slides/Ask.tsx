export default function Ask() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-45 blur-[6vw] bg-lavender" />
        <div className="absolute bottom-[-15vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-40 blur-[6vw] bg-rose" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>11 · The Ask</span>
        <span>Pre-seed round terms</span>
      </div>

      <div className="absolute left-[6vw] top-[18vh] right-[6vw]">
        <h2 className="font-display font-extrabold text-[6vw] leading-[0.95] tracking-[-0.025em] [text-wrap:balance] max-w-[80vw]">
          Raising $100K on a $1.5M pre-money SAFE.
        </h2>
        <p className="mt-[3vh] font-serif italic text-[1.85vw] leading-snug max-w-[68vw] text-ink/75 [text-wrap:pretty]">
          Capital-efficient by design — enough to convert design partners, hire two AEs, and ship the Sovereign tier into a closed beta with Saudi enterprise.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[10vh] grid grid-cols-4 gap-[1.6vw]">
        <div className="bg-ink/8 rounded-[1.2vw] p-[1.8vw]">
          <div className="text-[0.8vw] tracking-[0.28em] uppercase font-bold text-lavender">Round size</div>
          <div className="mt-[1vh] font-display font-extrabold text-[3.4vw] leading-none tracking-[-0.02em]">$100K</div>
          <p className="mt-[1.2vh] text-[1.05vw] leading-relaxed text-ink/70">Pre-seed SAFE, no discount, post-money cap of $1.6M after the round.</p>
        </div>
        <div className="bg-ink/8 rounded-[1.2vw] p-[1.8vw]">
          <div className="text-[0.8vw] tracking-[0.28em] uppercase font-bold text-seafoam">Pre-money</div>
          <div className="mt-[1vh] font-display font-extrabold text-[3.4vw] leading-none tracking-[-0.02em]">$1.5M</div>
          <p className="mt-[1.2vh] text-[1.05vw] leading-relaxed text-ink/70">Investor stake of 6.25% on conversion; clean cap table, no prior outside capital.</p>
        </div>
        <div className="bg-ink/8 rounded-[1.2vw] p-[1.8vw]">
          <div className="text-[0.8vw] tracking-[0.28em] uppercase font-bold text-sand">Runway</div>
          <div className="mt-[1vh] font-display font-extrabold text-[3.4vw] leading-none tracking-[-0.02em]">12 mo</div>
          <p className="mt-[1.2vh] text-[1.05vw] leading-relaxed text-ink/70">Lean operating cost (~$70K Y1 OpEx) + revenue runway extends to 18+ months.</p>
        </div>
        <div className="bg-ink text-bg rounded-[1.2vw] p-[1.8vw]">
          <div className="text-[0.8vw] tracking-[0.28em] uppercase font-bold text-lavender">Use of funds</div>
          <div className="mt-[1vh] font-display font-bold text-[1.45vw] leading-tight">Hire 2 AEs · KSA hosting · Sovereign beta</div>
          <p className="mt-[1.2vh] text-[1vw] leading-relaxed text-bg/80">Convert design partners, sign 2 enterprise pilots, prepare a $2M seed round in Q4.</p>
        </div>
      </div>
    </div>
  );
}
