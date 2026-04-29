export default function WhyNow() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-20vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-45 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-20vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-40 blur-[6vw] bg-lavender" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>04 · Why Now</span>
        <span>Three tailwinds, one window</span>
      </div>

      <div className="absolute left-[6vw] top-[16vh] right-[6vw]">
        <h2 className="font-display font-extrabold text-[5.6vw] leading-[0.96] tracking-[-0.025em] [text-wrap:balance] max-w-[78vw]">
          A 24-month window that won't open again.
        </h2>
        <p className="mt-[2.5vh] font-serif italic text-[1.7vw] leading-snug max-w-[68vw] text-ink/75 [text-wrap:pretty]">
          Three forces — sovereignty, AI, and budget — line up at the same moment in the same region. We are building the CRM that owns it.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[10vh] grid grid-cols-3 gap-[2vw]">
        <div>
          <div className="font-display font-extrabold text-[5.5vw] leading-none tracking-[-0.02em] text-lavender">01</div>
          <div className="mt-[1.5vh] font-display font-bold text-[1.6vw] leading-tight">Sovereignty mandate</div>
          <p className="mt-[1vh] text-[1.15vw] leading-relaxed text-ink/70">PDPL, NCA controls, and Vision 2030 are pushing every regulated buyer toward locally-hosted SaaS — fast.</p>
        </div>
        <div>
          <div className="font-display font-extrabold text-[5.5vw] leading-none tracking-[-0.02em] text-seafoam">02</div>
          <div className="mt-[1.5vh] font-display font-bold text-[1.6vw] leading-tight">AI inflection</div>
          <p className="mt-[1vh] text-[1.15vw] leading-relaxed text-ink/70">Bilingual LLMs are finally good enough to do real CRM work in Arabic. Two years ago they were not.</p>
        </div>
        <div>
          <div className="font-display font-extrabold text-[5.5vw] leading-none tracking-[-0.02em] text-sand">03</div>
          <div className="mt-[1.5vh] font-display font-bold text-[1.6vw] leading-tight">Budget redirect</div>
          <p className="mt-[1vh] text-[1.15vw] leading-relaxed text-ink/70">PIF and ministry RFPs explicitly reward Saudi-owned IP — incumbents cannot retrofit national alignment.</p>
        </div>
      </div>
    </div>
  );
}
