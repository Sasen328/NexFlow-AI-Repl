const base = import.meta.env.BASE_URL;

export default function FeatureCRM() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[10vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-seafoam" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>16 · Feature deep-dive · CRM</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[12vh]">
        <div className="text-[1vw] tracking-[0.3em] uppercase font-semibold text-seafoam mb-[1vh]">Module 02 · CRM</div>
        <h2 className="font-display font-extrabold text-[3.6vw] leading-[0.96] tracking-[-0.02em] max-w-[68vw] [text-wrap:balance]">
          Pipeline, deals, accounts — with stall diagnosis baked into the kanban.
        </h2>
      </div>

      <div className="absolute right-[6vw] top-[30vh] bottom-[6vh] w-[52vw]">
        <div className="rounded-[1vw] overflow-hidden border border-ink/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] bg-white">
          <img src={`${base}screenshots/funnel.jpg`} crossOrigin="anonymous" alt="NexFlow Sales Funnel page" className="w-full h-auto block" />
        </div>
        <div className="mt-[1.4vh] text-[0.78vw] uppercase tracking-[0.2em] text-ink/55 italic">
          Live screenshot · Pipeline & Deals / Sales Funnel view
        </div>
      </div>

      <div className="absolute left-[6vw] top-[30vh] bottom-[6vh] w-[33vw] flex flex-col gap-[1.4vh]">
        {[
          { t: "Visual pipeline kanban", d: "Drag-and-drop deals across LEAD → QUALIFIED → PROPOSAL → NEGOTIATION → CLOSED-WON. Each column shows count, ARR, and conversion vs. prior stage." },
          { t: "Run Auto-Advance", d: "AI scans every open deal, computes a recommended next-stage action, and one-tap promotes deals that meet the team's rule book — humans approve or reject the batch." },
          { t: "Per-deal stall diagnosis", d: "When a deal sits >7 days in stage, the AI writes a one-paragraph diagnosis (\"buyer waiting on legal\", \"champion left\", \"price objection\") with the supporting call/email evidence." },
          { t: "Forecasting & Health", d: "Per-deal win-rate model rolls up to weighted forecast; account health scores combine engagement, response rate, and signal velocity into a single number." },
          { t: "Account Hub (ABM)", d: "Group contacts and deals under a parent account, see whitespace, plan multi-thread campaigns, and track penetration of decision-making units." },
        ].map(({ t, d }) => (
          <div key={t} className="rounded-[0.8vw] bg-white/80 border border-ink/10 p-[1vw]">
            <div className="font-bold text-[1.05vw] text-seafoam">{t}</div>
            <p className="mt-[0.4vh] text-[0.85vw] leading-snug text-ink/75 [text-wrap:pretty]">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
