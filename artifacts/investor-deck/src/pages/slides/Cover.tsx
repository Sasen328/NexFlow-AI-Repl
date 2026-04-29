const base = import.meta.env.BASE_URL;

export default function Cover() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[20vh] -left-[10vw] w-[70vw] h-[70vw] rounded-full opacity-55 blur-[6vw] bg-lavender" />
        <div className="absolute -top-[5vh] right-[-15vw] w-[55vw] h-[55vw] rounded-full opacity-55 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-20vh] left-[10vw] w-[60vw] h-[60vw] rounded-full opacity-50 blur-[6vw] bg-sand" />
        <div className="absolute bottom-[-10vh] right-[-5vw] w-[50vw] h-[50vw] rounded-full opacity-45 blur-[6vw] bg-rose" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] flex items-center gap-[1.2vw]">
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="NexFlow mark" className="w-[5vw] h-[5vw]" />
        <span className="font-display font-extrabold text-[1.4vw] tracking-[0.32em] uppercase">NexFlow</span>
      </div>

      <div className="absolute top-[6vh] right-[6vw] text-right text-[1.05vw] tracking-[0.22em] uppercase font-medium opacity-70">
        Pre-seed round · 2026
      </div>

      <div className="absolute left-[6vw] bottom-[16vh] right-[6vw]">
        <div className="text-[1.15vw] tracking-[0.3em] uppercase font-semibold text-ink/70 mb-[3vh]">
          Investor deck — high level
        </div>
        <h1 className="font-display font-extrabold text-[9vw] leading-[0.92] tracking-[-0.03em] [text-wrap:balance]">
          The CRM the Gulf has been waiting for.
        </h1>
        <p className="mt-[4vh] font-serif italic text-[2.1vw] leading-snug max-w-[62vw] text-ink/80 [text-wrap:pretty]">
          NexFlow is a sovereign, bilingual, AI-native CRM purpose-built for Saudi Arabia and the wider GCC — and the first credible alternative to Salesforce, HubSpot, and Zoho in the region.
        </p>
      </div>

      <div className="absolute bottom-[6vh] left-[6vw] right-[6vw] flex items-end justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/65">
        <span>Riyadh · Khobar · Dubai</span>
        <span>Confidential — pre-seed investor use only</span>
      </div>
    </div>
  );
}
