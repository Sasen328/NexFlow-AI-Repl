const base = import.meta.env.BASE_URL;

export default function Difference() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-15vh] left-[35vw] w-[55vw] h-[55vw] rounded-full opacity-28 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-15vh] left-[-10vw] w-[45vw] h-[45vw] rounded-full opacity-22 blur-[6vw] bg-lavender" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>07 · What we do differently</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[14vh]">
        <h2 className="font-display font-extrabold text-[4.6vw] leading-[0.95] tracking-[-0.02em] max-w-[70vw] [text-wrap:balance]">
          Four real differences.<br />Not four marketing claims.
        </h2>
        <p className="mt-[1.4vh] font-serif italic text-[1.55vw] leading-snug text-ink/70 max-w-[58vw] [text-wrap:pretty]">
          Each pillar maps to a capability that ships today — with a specific feature name, not a roadmap promise.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[6vh] grid grid-cols-4 gap-[1.6vw]">
        <div className="rounded-[1.4vw] bg-white/75 border border-ink/10 p-[1.8vw]">
          <div className="w-[3.2vw] h-[3.2vw] rotate-45 bg-lavender rounded-[0.4vw]" />
          <div className="mt-[1.6vh] text-[0.8vw] uppercase tracking-[0.2em] font-semibold text-ink/50">Pillar 01</div>
          <div className="mt-[0.5vh] font-display font-extrabold text-[1.5vw] leading-tight">Three engines. One schema. Zero integration tax.</div>
          <p className="mt-[1.2vh] text-[0.95vw] leading-snug text-ink/75 [text-wrap:pretty]">
            CRM + Call Center (Power Dialer, AI Voice, Conversation Intel) + Enrichment (16-agent research, Buying Signals, Card Scanner) on one data model. Salesforce needs three products and three budgets to cover the same ground.
          </p>
          <div className="mt-[1.4vh] text-[0.78vw] uppercase tracking-[0.14em] font-semibold text-lavender">Ships today — one plan</div>
        </div>

        <div className="rounded-[1.4vw] bg-white/75 border border-ink/10 p-[1.8vw]">
          <div className="w-[3.2vw] h-[3.2vw] rotate-45 bg-seafoam rounded-[0.4vw]" />
          <div className="mt-[1.6vh] text-[0.8vw] uppercase tracking-[0.2em] font-semibold text-ink/50">Pillar 02</div>
          <div className="mt-[0.5vh] font-display font-extrabold text-[1.5vw] leading-tight">Arabic AI Voice + 5-minute post-call WhatsApp.</div>
          <p className="mt-[1.2vh] text-[0.95vw] leading-snug text-ink/75 [text-wrap:pretty]">
            6 dialect voices (Layla, Faisal, Noor, Reem, Omar, Adam) make and receive calls autonomously. After every call outcome — answered, voicemail, no-answer — AI drafts a context-aware Arabic/English WhatsApp and fires it within 5 minutes. No rep intervention required.
          </p>
          <div className="mt-[1.4vh] text-[0.78vw] uppercase tracking-[0.14em] font-semibold text-seafoam">No competitor has this in Arabic</div>
        </div>

        <div className="rounded-[1.4vw] bg-white/75 border border-ink/10 p-[1.8vw]">
          <div className="w-[3.2vw] h-[3.2vw] rotate-45 bg-sand rounded-[0.4vw]" />
          <div className="mt-[1.6vh] text-[0.8vw] uppercase tracking-[0.2em] font-semibold text-ink/50">Pillar 03</div>
          <div className="mt-[0.5vh] font-display font-extrabold text-[1.5vw] leading-tight">Saudi CR, 16-agent research, and signals nobody else reads.</div>
          <p className="mt-[1.2vh] text-[0.95vw] leading-snug text-ink/75 [text-wrap:pretty]">
            Masaar engine pulls Saudi Commercial Registry in real-time. Person Intel runs 16 parallel AI agents for a full dossier in 90 seconds. GCC Buying Signals monitors Wamda, MoCI filings, and Argaam — data sources that don't appear in ZoomInfo or Clearbit. Cultural Calendar blocks Ramadan/Eid outreach automatically.
          </p>
          <div className="mt-[1.4vh] text-[0.78vw] uppercase tracking-[0.14em] font-semibold text-sand">A data layer that doesn't exist elsewhere</div>
        </div>

        <div className="rounded-[1.4vw] bg-white/75 border border-ink/10 p-[1.8vw]">
          <div className="w-[3.2vw] h-[3.2vw] rotate-45 bg-rose rounded-[0.4vw]" />
          <div className="mt-[1.6vh] text-[0.8vw] uppercase tracking-[0.2em] font-semibold text-ink/50">Pillar 04</div>
          <div className="mt-[0.5vh] font-display font-extrabold text-[1.5vw] leading-tight">Signal to closed deal. End to end. Without leaving NexFlow.</div>
          <p className="mt-[1.2vh] text-[0.95vw] leading-snug text-ink/75 [text-wrap:pretty]">
            GCC buying signal fires → Forgotten Lead resurfaces → Power Dialer calls → AI Voice Agent qualifies → post-call WhatsApp auto-sent → Quote generated with SAR pricing → customer pays via Mada or Tap → deal closes. One platform, one motion. No tool switching anywhere in that chain.
          </p>
          <div className="mt-[1.4vh] text-[0.78vw] uppercase tracking-[0.14em] font-semibold text-rose">Full funnel, one schema</div>
        </div>
      </div>
    </div>
  );
}
