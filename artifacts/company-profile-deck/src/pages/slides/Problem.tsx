const base = import.meta.env.BASE_URL;

export default function Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[20vh] left-[-10vw] w-[60vw] h-[60vw] rounded-full opacity-35 blur-[6vw] bg-rose" />
        <div className="absolute bottom-[-10vh] right-[-5vw] w-[45vw] h-[45vw] rounded-full opacity-30 blur-[6vw] bg-sand" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>03 · The problem</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[14vh]">
        <h2 className="font-display font-extrabold text-[4.8vw] leading-[0.96] tracking-[-0.02em] max-w-[72vw] [text-wrap:balance]">
          Gulf revenue teams are running on tools that were never built for them.
        </h2>
        <p className="mt-[2vh] font-serif italic text-[1.7vw] leading-snug text-ink/70 max-w-[66vw] [text-wrap:pretty]">
          Every workaround costs hours. Every workaround compounds. The best teams in Saudi, UAE, and Kuwait are losing deals not because they can't sell — but because their stack fights them at every step.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[7vh] grid grid-cols-4 gap-[1.6vw]">
        <div className="rounded-[1.4vw] bg-white/70 border border-rose/30 p-[1.8vw]">
          <div className="font-display font-extrabold text-[3vw] leading-none text-rose">01</div>
          <div className="mt-[1.2vh] font-display font-bold text-[1.4vw] leading-tight">No Arabic. Anywhere that matters.</div>
          <p className="mt-[1vh] text-[1.05vw] leading-snug text-ink/75 [text-wrap:pretty]">
            RTL is cosmetic. Arabic search breaks on diacritics. Gulf naming conventions (Al-, bin, ibn) are misclassified. Hijri dates don't exist. Bilingual records are impossible.
          </p>
        </div>
        <div className="rounded-[1.4vw] bg-white/70 border border-sand/40 p-[1.8vw]">
          <div className="font-display font-extrabold text-[3vw] leading-none text-sand">02</div>
          <div className="mt-[1.2vh] font-display font-bold text-[1.4vw] leading-tight">Manual entry kills seller time.</div>
          <p className="mt-[1vh] text-[1.05vw] leading-snug text-ink/75 [text-wrap:pretty]">
            After every call, every WhatsApp, every meeting — a rep spends 20+ minutes typing notes. No AI capture. No auto-created follow-ups. No post-call WhatsApp automation. Just copy-paste.
          </p>
        </div>
        <div className="rounded-[1.4vw] bg-white/70 border border-seafoam/40 p-[1.8vw]">
          <div className="font-display font-extrabold text-[3vw] leading-none text-seafoam">03</div>
          <div className="mt-[1.2vh] font-display font-bold text-[1.4vw] leading-tight">GCC data sources are invisible.</div>
          <p className="mt-[1vh] text-[1.05vw] leading-snug text-ink/75 [text-wrap:pretty]">
            Saudi CR checks are done manually on paper. Wamda, MoCI filings, and Argaam signals don't exist in Salesforce or HubSpot. No buying-signal layer for the GCC — just generic Crunchbase.
          </p>
        </div>
        <div className="rounded-[1.4vw] bg-white/70 border border-lavender/40 p-[1.8vw]">
          <div className="font-display font-extrabold text-[3vw] leading-none text-lavender">04</div>
          <div className="mt-[1.2vh] font-display font-bold text-[1.4vw] leading-tight">Three vendors. Three bills. Zero integration.</div>
          <p className="mt-[1vh] text-[1.05vw] leading-snug text-ink/75 [text-wrap:pretty]">
            CRM from Salesforce. Dialer from a different vendor. Enrichment from a third. Data never syncs cleanly. Managers can't trust forecasts built on three broken pipes. And the bill is in USD.
          </p>
        </div>
      </div>
    </div>
  );
}
