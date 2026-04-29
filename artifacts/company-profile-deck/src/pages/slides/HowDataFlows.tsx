const base = import.meta.env.BASE_URL;

export default function HowDataFlows() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[10vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-lavender" />
        <div className="absolute bottom-[-15vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-seafoam" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>21 · How the system actually works end-to-end</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[12vh]">
        <h2 className="font-display font-extrabold text-[3.2vw] leading-[1.04] tracking-[-0.02em] max-w-[80vw] [text-wrap:balance]">
          One contact, six touchpoints, zero manual logging — what actually happens.
        </h2>
        <p className="mt-[1vh] font-serif italic text-[1.1vw] leading-snug text-ink/75 max-w-[60vw] [text-wrap:pretty]">
          A worked example: a CFO at a Riyadh holding group, picked up by a buying signal, becomes a closed-won deal. Every step actually shipped in NexFlow today.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[30vh] bottom-[6vh] grid grid-cols-6 gap-[1.2vw]">
        {[
          { n: "01", t: "Signal detected", who: "Enrichment", d: "Crunchbase update: target company closes Series B. Buying Signals layer fires, creates a high-priority lead." },
          { n: "02", t: "Auto-enriched", who: "Enrichment", d: "Waterfall runs across Lusha + Apollo + LinkedIn, returns CFO email, mobile, persona, and seniority — with provenance." },
          { n: "03", t: "Routed + scored", who: "Automation", d: "Lead Routing assigns to KSA enterprise rep. Lead Intelligence scores 91/100. Lands in Power Dialer top of queue." },
          { n: "04", t: "AI Voice call", who: "Contact Center", d: "Rep calls. Live AI Coach surfaces 3 objection-handlers in real time. 14-min discovery call recorded." },
          { n: "05", t: "Transcribed + logged", who: "Conversation Intel", d: "Bilingual transcript, summary, AI score 88/100. Deal auto-created at $520K, decision-makers extracted, next-step task scheduled." },
          { n: "06", t: "Closed-won", who: "CRM + Marketing", d: "Quote sent via CPQ, opens tracked, contract e-signed in 11 days. Marketing attribution credits the original signal back to source." },
        ].map(({ n, t, who, d }) => (
          <div key={n} className="rounded-[0.9vw] bg-white/85 border border-ink/10 p-[1vw] flex flex-col">
            <div className="font-display font-extrabold text-[2.4vw] text-lavender leading-none">{n}</div>
            <div className="mt-[1vh] font-bold text-[1.1vw] leading-tight">{t}</div>
            <div className="mt-[0.3vh] text-[0.7vw] uppercase tracking-[0.2em] text-seafoam font-bold">{who}</div>
            <p className="mt-[1vh] text-[0.82vw] leading-snug text-ink/75 [text-wrap:pretty]">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
