const base = import.meta.env.BASE_URL;

export default function FeatureCRMDeep() {
  const features = [
    { name: "Pipeline + Deal Kanban", desc: "Stage-based pipeline, deal probability, drag-drop cards. Per-rep views." },
    { name: "ICP Rules Engine", desc: "Admin builds hard/soft scoring rules across any field — country, industry, title, size — with any operator. Infinite, not preset." },
    { name: "Lead Scoring — 6 dimensions", desc: "Title authority 25% · Company fit 20% · Engagement 20% · Signal score 15% · Deal velocity 10% · Response rate 10% → Buying Now / High Intent / Evaluating / Researching / Cold." },
    { name: "Health Scores", desc: "Real-time per-contact health from engagement, activity count, deal stage, meetings in 30 days → Healthy / Stable / At Risk / Critical." },
    { name: "Forecasting waterfall", desc: "Pipeline → Best Case → Commit → Closed Won per rep. Weighted forecast + AI variance analysis explains why numbers moved." },
    { name: "Predictive Analytics", desc: "Deal close probability, churn risk per contact, Next Best Action surface, AI query box for ad-hoc analysis." },
    { name: "Forgotten Leads", desc: "Contacts silent 90+ days where a fresh GCC buying signal just fired. Bulk enrich / add to sequence / hand to AI Voice Agent." },
    { name: "Lead Routing", desc: "Rules-based auto-assignment by country, industry, company size, score, title — no manual triage." },
    { name: "Document Tracking", desc: "Pixel in quotes/proposals. See exact open + click events per contact. Know when they re-read the proposal." },
    { name: "Quote-to-Cash / CPQ", desc: "Generate quote → customer pays online → deal auto-closes. GCC rails: Tap, HyperPay, Mada, PayTabs, Stripe. Multi-currency: SAR, AED, QAR, KWD, BHD, OMR." },
    { name: "Contact Network tab", desc: "Mutual connections, relationship type, tech stack detected, full work history per contact." },
    { name: "Sequences", desc: "Multi-step cadences: email → LinkedIn → AI Voice Call → WhatsApp → breakup email. AI Voice step is native, not an integration." },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] left-[-8vw] w-[50vw] h-[50vw] rounded-full opacity-28 blur-[6vw] bg-lavender" />
        <div className="absolute bottom-[-10vh] right-[-6vw] w-[40vw] h-[40vw] rounded-full opacity-22 blur-[6vw] bg-seafoam" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>Engine 01 · CRM</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13vh]">
        <h2 className="font-display font-extrabold text-[3.8vw] leading-[0.96] tracking-[-0.02em]">
          CRM Engine — 12 features that ship today.
        </h2>
        <p className="mt-[0.8vh] font-serif italic text-[1.4vw] text-ink/65">Built for GCC B2B sales from the data layer up — not translated from English.</p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[27vh] bottom-[4vh] grid grid-cols-4 grid-rows-3 gap-[0.9vw]">
        {features.map((f, i) => (
          <div key={i} className="rounded-[1vw] bg-white/72 border border-ink/8 p-[1.2vw] flex flex-col gap-[0.4vh]">
            <div className="font-display font-bold text-[1.05vw] leading-tight text-ink">{f.name}</div>
            <p className="text-[0.88vw] leading-snug text-ink/72 [text-wrap:pretty]">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
