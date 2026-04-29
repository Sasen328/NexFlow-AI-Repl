export default function Opportunity() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-15vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-40 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-40 blur-[6vw] bg-mist" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>02 · Market</span>
        <span>GCC sales-tech opportunity</span>
      </div>

      <div className="absolute left-[6vw] top-[16vh] right-[6vw]">
        <h2 className="font-display font-extrabold text-[5.4vw] leading-[0.96] tracking-[-0.025em] [text-wrap:balance] max-w-[78vw]">
          A multi-billion-dollar CRM market with no regional incumbent.
        </h2>
        <p className="mt-[2.5vh] font-serif italic text-[1.7vw] leading-snug max-w-[68vw] text-ink/75 [text-wrap:pretty]">
          Saudi Arabia's $24B+ Vision 2030 tech budget is concentrated in cloud, AI, and sovereign software — exactly where NexFlow plays.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[10vh] grid grid-cols-3 gap-[2vw]">
        <div className="bg-ink/5 rounded-[1.4vw] p-[2.4vw]">
          <div className="text-[0.9vw] tracking-[0.28em] uppercase font-bold text-lavender">TAM</div>
          <div className="mt-[1.5vh] font-display font-extrabold text-[4.4vw] leading-none tracking-[-0.02em]">$2.1B</div>
          <p className="mt-[1.5vh] text-[1.15vw] leading-relaxed text-ink/70">GCC SaaS CRM spend by 2028 across enterprise, mid-market, and SMB.</p>
        </div>
        <div className="bg-ink/5 rounded-[1.4vw] p-[2.4vw]">
          <div className="text-[0.9vw] tracking-[0.28em] uppercase font-bold text-seafoam">SAM</div>
          <div className="mt-[1.5vh] font-display font-extrabold text-[4.4vw] leading-none tracking-[-0.02em]">$680M</div>
          <p className="mt-[1.5vh] text-[1.15vw] leading-relaxed text-ink/70">KSA + UAE mid-market and enterprise sales teams ready for an Arabic-first, AI-native CRM.</p>
        </div>
        <div className="bg-ink/5 rounded-[1.4vw] p-[2.4vw]">
          <div className="text-[0.9vw] tracking-[0.28em] uppercase font-bold text-sand">SOM (Y3)</div>
          <div className="mt-[1.5vh] font-display font-extrabold text-[4.4vw] leading-none tracking-[-0.02em]">$110M</div>
          <p className="mt-[1.5vh] text-[1.15vw] leading-relaxed text-ink/70">19,200 paying customers (~192,000 seats) by Year 3 — about 16% of the SAM at our blended ARPU.</p>
        </div>
      </div>
    </div>
  );
}
