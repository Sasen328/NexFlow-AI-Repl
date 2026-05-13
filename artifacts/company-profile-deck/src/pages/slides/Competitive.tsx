const base = import.meta.env.BASE_URL;

type Cell = { label: string; positive?: boolean };

const rows: { cap: string; nf: Cell; sf: Cell; hs: Cell; zo: Cell; pd: Cell; lo: Cell }[] = [
  {
    cap: "Arabic AI Voice Agents — autonomous calling",
    nf: { label: "6 dialects · included", positive: true },
    sf: { label: "English only · $2/conv add-on" },
    hs: { label: "No voice agents" },
    zo: { label: "No voice agents" },
    pd: { label: "No voice agents" },
    lo: { label: "No" },
  },
  {
    cap: "Post-call WhatsApp auto-draft (Arabic, 5 min)",
    nf: { label: "Native · every plan", positive: true },
    sf: { label: "No" },
    hs: { label: "No" },
    zo: { label: "No" },
    pd: { label: "No" },
    lo: { label: "No" },
  },
  {
    cap: "Saudi Commercial Registry (Masaar) lookup",
    nf: { label: "Real-time · built-in", positive: true },
    sf: { label: "No" },
    hs: { label: "No" },
    zo: { label: "No" },
    pd: { label: "No" },
    lo: { label: "No" },
  },
  {
    cap: "GCC buying signals (Wamda / MoCI / Argaam)",
    nf: { label: "Native · 8 sources", positive: true },
    sf: { label: "No" },
    hs: { label: "No" },
    zo: { label: "No" },
    pd: { label: "No" },
    lo: { label: "Partial" },
  },
  {
    cap: "16-agent deep person intelligence (90 sec dossier)",
    nf: { label: "Ships today", positive: true },
    sf: { label: "No" },
    hs: { label: "No" },
    zo: { label: "No" },
    pd: { label: "No" },
    lo: { label: "No" },
  },
  {
    cap: "GCC cultural calendar + AI advisor (Ramadan/Eid)",
    nf: { label: "Per-country · built-in", positive: true },
    sf: { label: "No" },
    hs: { label: "No" },
    zo: { label: "No" },
    pd: { label: "No" },
    lo: { label: "No" },
  },
  {
    cap: "WhatsApp native inbox + bilingual AI bot",
    nf: { label: "Native", positive: true },
    sf: { label: "3rd party only" },
    hs: { label: "3rd party only" },
    zo: { label: "3rd party only" },
    pd: { label: "No" },
    lo: { label: "Partial" },
  },
  {
    cap: "Business card → enriched lead (5-agent AI pipeline)",
    nf: { label: "30 sec · built-in", positive: true },
    sf: { label: "No" },
    hs: { label: "No" },
    zo: { label: "OCR only" },
    pd: { label: "No" },
    lo: { label: "No" },
  },
  {
    cap: "CRM + Calls + Enrichment on one schema, one plan",
    nf: { label: "One plan", positive: true },
    sf: { label: "3 products · 3 bills" },
    hs: { label: "3 tiers + add-ons" },
    zo: { label: "50+ apps" },
    pd: { label: "CRM only" },
    lo: { label: "CRM only" },
  },
  {
    cap: "GCC payment rails (Tap / Mada / HyperPay / PayTabs)",
    nf: { label: "Native · SAR/AED/QAR", positive: true },
    sf: { label: "Stripe only" },
    hs: { label: "Stripe only" },
    zo: { label: "Stripe only" },
    pd: { label: "No" },
    lo: { label: "Partial" },
  },
  {
    cap: "KSA PDPL call redaction (Iqama / Saudi IBAN)",
    nf: { label: "Built-in · auto", positive: true },
    sf: { label: "No" },
    hs: { label: "No" },
    zo: { label: "No" },
    pd: { label: "No" },
    lo: { label: "No" },
  },
  {
    cap: "Live call coaching (real-time objection detection)",
    nf: { label: "LiveCoachPanel · included", positive: true },
    sf: { label: "Gong/Einstein add-on" },
    hs: { label: "No" },
    zo: { label: "No" },
    pd: { label: "No" },
    lo: { label: "No" },
  },
];

export default function Competitive() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] left-[20vw] w-[60vw] h-[60vw] rounded-full opacity-22 blur-[6vw] bg-mist" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[40vw] h-[40vw] rounded-full opacity-18 blur-[6vw] bg-lavender" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>13 · Competitive landscape</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[12.5vh]">
        <h2 className="font-display font-extrabold text-[3.4vw] leading-[0.96] tracking-[-0.02em] max-w-[70vw] [text-wrap:balance]">
          12 capabilities. Only one platform ships all of them for the GCC.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[26vh] bottom-[5.5vh] rounded-[1.2vw] bg-white/75 border border-ink/10 overflow-hidden">
        <div className="grid text-[0.72vw] uppercase tracking-[0.15em] font-semibold px-[1.2vw] py-[1.1vh] bg-ink text-bg"
          style={{ gridTemplateColumns: "2.8fr 1.4fr 1.4fr 1.4fr 1fr 0.9fr 1fr" }}>
          <div>Capability</div>
          <div className="text-center text-seafoam">NexFlow</div>
          <div className="text-center">Salesforce</div>
          <div className="text-center">HubSpot</div>
          <div className="text-center">Zoho</div>
          <div className="text-center">Pipedrive</div>
          <div className="text-center">Local GCC</div>
        </div>
        <div className="divide-y divide-ink/8 overflow-hidden">
          {rows.map(({ cap, nf, sf, hs, zo, pd, lo }, i) => (
            <div
              key={cap}
              className="grid items-center px-[1.2vw] py-[0.95vh] text-[0.82vw]"
              style={{
                gridTemplateColumns: "2.8fr 1.4fr 1.4fr 1.4fr 1fr 0.9fr 1fr",
                background: i % 2 === 1 ? "rgba(0,0,0,0.025)" : "transparent",
              }}
            >
              <div className="font-medium text-ink/85 pr-[1vw] leading-snug">{cap}</div>
              <div className={`text-center font-semibold leading-snug ${nf.positive ? "text-seafoam" : "text-ink/60"}`}>{nf.label}</div>
              <div className="text-center text-ink/50 leading-snug">{sf.label}</div>
              <div className="text-center text-ink/50 leading-snug">{hs.label}</div>
              <div className="text-center text-ink/50 leading-snug">{zo.label}</div>
              <div className="text-center text-ink/50 leading-snug">{pd.label}</div>
              <div className="text-center text-ink/50 leading-snug">{lo.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-[1.8vh] left-[6vw] right-[6vw] text-[0.72vw] text-ink/45 italic">
        Local GCC column reflects the early-stage Arabic-first CRM cohort — narrow in scope, usually single-module, and yet to ship a unified AI-native platform with all three engines.
      </div>
    </div>
  );
}
