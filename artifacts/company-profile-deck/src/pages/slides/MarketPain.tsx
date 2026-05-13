const base = import.meta.env.BASE_URL;

export default function MarketPain() {
  const rows = [
    {
      pain: "Arabic search breaks. Gulf names misclassified. No bilingual records.",
      fix: "Normalized Arabic search with diacritic + dialect tolerance. Bilingual record fields (AR/EN per contact). Gulf naming model (Al-, bin, ibn, double surnames) built into the data layer.",
    },
    {
      pain: "Post-call: rep spends 20 min typing notes, manually sends WhatsApp, sets reminder.",
      fix: "1-click post-call panel: logs note + creates task + sets reminder + drafts WhatsApp + drafts email simultaneously. Post-call automation fires an AI-drafted Arabic/English WhatsApp within 5 min of no-answer — zero rep action.",
    },
    {
      pain: "Saudi CR lookup done manually. No GCC buying-signal monitoring.",
      fix: "Masaar engine: real-time Saudi Commercial Registry — CR number, legal name, directors, license type. GCC Buying Signals monitors Wamda, MoCI, Argaam, Reuters Arabic, PR Newswire — none of which appear in ZoomInfo or Clearbit.",
    },
    {
      pain: "No Arabic voice agents. English-only AI calling — useless for Gulf enterprise.",
      fix: "6 AI voice personas: Layla (Gulf Arabic female), Faisal (KSA male), Noor (bilingual AR/EN), Reem (Levantine), Omar (Egyptian), Adam (English). Make and receive calls autonomously. No competitor has this in Arabic.",
    },
    {
      pain: "Stale leads sit silent. Reps don't know when to re-engage.",
      fix: "Forgotten Leads engine: surfaces contacts silent 90+ days only when a real buying signal fires (funding, MoCI filing, hiring spike, news). ICP score + signal score combined. Bulk enrich or hand directly to AI Voice Agent.",
    },
    {
      pain: "Outreach sent during Ramadan, on Fridays, during Eid — ignored or offensive.",
      fix: "Cultural Intelligence Engine: per-country event calendar with blackout dates, optimal outreach windows, messaging themes. Pre-Ramadan GOLD window, post-Iftar evening hours, Fri/Sat weekend awareness. AI Cultural Advisor answers any GCC outreach question.",
    },
    {
      pain: "Forecasts nobody trusts. No explainability. Reps game the numbers.",
      fix: "Per-deal AI win-rate with written rationale + leading indicators. Pipeline → Best Case → Commit → Closed Won waterfall. AI variance analysis explains why a number moved — not just that it did.",
    },
    {
      pain: "Data leaves the region. USD pricing. Per-seat add-ons for everything.",
      fix: "In-Kingdom data residency. SAR-anchored pricing. CRM + Call Center + Enrichment in one plan — no integration tax, no add-on stack.",
    },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-25 blur-[6vw] bg-rose" />
        <div className="absolute bottom-[-15vh] left-[5vw] w-[45vw] h-[45vw] rounded-full opacity-25 blur-[6vw] bg-mist" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>05 · Pain points → NexFlow answers</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13vh]">
        <h2 className="font-display font-extrabold text-[3.6vw] leading-[0.96] tracking-[-0.02em] max-w-[72vw] [text-wrap:balance]">
          Every pain a Gulf revenue team actually has. Every answer NexFlow ships today.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[28vh] bottom-[4vh] overflow-hidden">
        <div className="grid grid-cols-12 gap-x-[1.5vw] py-[0.8vh] border-b border-ink/20 text-[0.8vw] uppercase tracking-[0.22em] font-semibold text-ink/50">
          <div className="col-span-5">Real pain — heard in every GCC sales team</div>
          <div className="col-span-7">NexFlow — ships today, not a roadmap promise</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-12 gap-x-[1.5vw] py-[1.35vh] border-b border-ink/8 items-start">
            <div className="col-span-5 flex gap-[0.8vw] items-start">
              <span className="mt-[0.15vh] w-[1vw] h-[1vw] rounded-full bg-rose/70 flex-shrink-0" />
              <span className="font-display font-semibold text-[1.05vw] leading-snug text-ink/90">{r.pain}</span>
            </div>
            <div className="col-span-7 flex gap-[0.8vw] items-start">
              <span className="mt-[0.15vh] w-[1vw] h-[1vw] rounded-full bg-seafoam flex-shrink-0" />
              <span className="text-[1.02vw] leading-snug text-ink/80 [text-wrap:pretty]">{r.fix}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
