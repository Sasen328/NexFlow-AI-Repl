export default function Team() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-15vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-40 blur-[6vw] bg-lavender" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-40 blur-[6vw] bg-sand" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>10 · Team</span>
        <span>Built by operators who sold here</span>
      </div>

      <div className="absolute left-[6vw] top-[16vh] right-[6vw]">
        <h2 className="font-display font-extrabold text-[5.4vw] leading-[0.96] tracking-[-0.025em] [text-wrap:balance] max-w-[80vw]">
          A founding team that has shipped CRM, sold to Saudi enterprises, and lived in Riyadh.
        </h2>
        <p className="mt-[2vh] font-serif italic text-[1.65vw] leading-snug max-w-[68vw] text-ink/75 [text-wrap:pretty]">
          The single non-negotiable for this market is having Arabic, Saudi work culture, and enterprise sales motion in the same room. We do.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[10vh] grid grid-cols-3 gap-[2vw]">
        <div>
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-lavender">Founder & CEO</div>
          <div className="mt-[1.2vh] font-display font-bold text-[1.7vw] leading-tight">Product, sales, and Saudi market</div>
          <p className="mt-[1vh] text-[1.1vw] leading-relaxed text-ink/70">15 years across enterprise SaaS in MENA — closed seven-figure CRM contracts with banks, telcos, and ministries before building NexFlow.</p>
        </div>
        <div>
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-seafoam">Founding engineering</div>
          <div className="mt-[1.2vh] font-display font-bold text-[1.7vw] leading-tight">CRM platform & bilingual AI</div>
          <p className="mt-[1.1vh] text-[1.1vw] leading-relaxed text-ink/70">Senior engineers from regional fintech and global SaaS — depth in multi-tenant SaaS, Arabic NLP, and WhatsApp Business APIs.</p>
        </div>
        <div>
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-sand">Advisors</div>
          <div className="mt-[1.2vh] font-display font-bold text-[1.7vw] leading-tight">Vision 2030 operators</div>
          <p className="mt-[1.1vh] text-[1.1vw] leading-relaxed text-ink/70">PIF-portfolio CIOs, Saudi enterprise GMs, and a former Salesforce MENA leader guiding GTM and channel strategy.</p>
        </div>
      </div>
    </div>
  );
}
