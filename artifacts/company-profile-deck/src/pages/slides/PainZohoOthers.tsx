const base = import.meta.env.BASE_URL;

export default function PainZohoOthers() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[10vh] left-[10vw] w-[55vw] h-[55vw] rounded-full opacity-20 blur-[6vw] bg-mist" />
        <div className="absolute bottom-[-15vh] right-[10vw] w-[50vw] h-[50vw] rounded-full opacity-18 blur-[6vw] bg-lavender" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>06 · Pain in Zoho · Pipedrive · Freshworks</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13.5vh]">
        <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-mist">The "good enough" tier — why they still fall short for GCC</div>
        <h2 className="mt-[0.6vh] font-display font-extrabold text-[3.4vw] leading-[0.96] tracking-[-0.02em] max-w-[80vw] [text-wrap:balance]">
          Cheaper to buy. Still painful once the team starts actually selling in the Gulf.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[32vh] bottom-[9vh] grid grid-cols-3 gap-[1.6vw]">
        <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.6vw] flex flex-col">
          <div className="flex items-center justify-between mb-[1.4vh]">
            <div className="font-display font-extrabold text-[2.2vw] leading-none">Zoho</div>
            <div className="text-[0.75vw] uppercase tracking-[0.14em] font-semibold text-ink/45">~$1.3B · private</div>
          </div>
          <ul className="space-y-[1.2vh] text-[0.95vw] leading-snug text-ink/78 flex-1">
            <li className="flex gap-[0.7vw]">
              <span className="text-rose font-bold flex-shrink-0 mt-[0.1vh]">×</span>
              <span className="[text-wrap:pretty]"><strong>50+ disconnected apps, zero unified intelligence.</strong> Zoho One is a license bundle, not a platform. Zia AI has never made an autonomous call in Gulf Arabic, never drafted a post-call WhatsApp, and reads none of the GCC-specific signal sources.</span>
            </li>
            <li className="flex gap-[0.7vw]">
              <span className="text-rose font-bold flex-shrink-0 mt-[0.1vh]">×</span>
              <span className="[text-wrap:pretty]"><strong>No Voice Agent, no post-call automation.</strong> Click-to-dial exists. An AI agent that calls leads in Khaleeji Arabic, detects objections live, and fires a follow-up WhatsApp in 5 minutes does not.</span>
            </li>
            <li className="flex gap-[0.7vw]">
              <span className="text-rose font-bold flex-shrink-0 mt-[0.1vh]">×</span>
              <span className="[text-wrap:pretty]"><strong>Arabic is translated strings, not a data model.</strong> Gulf naming conventions (Al-, bin, ibn, double surnames), Iqama number handling, Saudi IBAN, and Hijri calendar are cosmetic layers — not in the schema.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.6vw] flex flex-col">
          <div className="flex items-center justify-between mb-[1.4vh]">
            <div className="font-display font-extrabold text-[2.2vw] leading-none">Pipedrive</div>
            <div className="text-[0.75vw] uppercase tracking-[0.14em] font-semibold text-ink/45">~$169M · Vista Equity</div>
          </div>
          <ul className="space-y-[1.2vh] text-[0.95vw] leading-snug text-ink/78 flex-1">
            <li className="flex gap-[0.7vw]">
              <span className="text-rose font-bold flex-shrink-0 mt-[0.1vh]">×</span>
              <span className="[text-wrap:pretty]"><strong>A pipeline tool with an AI label on it.</strong> Their "AI" is a basic email summarizer and a deal-rotation nudge. No autonomous calling, no enrichment, no marketing automation, no conversation intelligence.</span>
            </li>
            <li className="flex gap-[0.7vw]">
              <span className="text-rose font-bold flex-shrink-0 mt-[0.1vh]">×</span>
              <span className="[text-wrap:pretty]"><strong>Designed for Western SaaS sales teams, not GCC enterprise.</strong> No Arabic, no WhatsApp, no cultural calendar, no GCC buying signals, no Friday–Saturday work-week awareness. USD billing only.</span>
            </li>
            <li className="flex gap-[0.7vw]">
              <span className="text-rose font-bold flex-shrink-0 mt-[0.1vh]">×</span>
              <span className="[text-wrap:pretty]"><strong>No enrichment engine, no intelligence research.</strong> No Saudi CR, no 16-agent person dossier, no Wamda/MoCI/Argaam signals, no business card AI pipeline. Data in = data stays as-entered.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.6vw] flex flex-col">
          <div className="flex items-center justify-between mb-[1.4vh]">
            <div className="font-display font-extrabold text-[2.2vw] leading-none">Freshworks</div>
            <div className="text-[0.75vw] uppercase tracking-[0.14em] font-semibold text-ink/45">~$720M FY24 · NASDAQ</div>
          </div>
          <ul className="space-y-[1.2vh] text-[0.95vw] leading-snug text-ink/78 flex-1">
            <li className="flex gap-[0.7vw]">
              <span className="text-rose font-bold flex-shrink-0 mt-[0.1vh]">×</span>
              <span className="[text-wrap:pretty]"><strong>The product focus is IT service desks, not sales.</strong> Freshdesk (support ticketing) gets the R&D energy; Freshsales is a secondary product. The roadmap reflects it.</span>
            </li>
            <li className="flex gap-[0.7vw]">
              <span className="text-rose font-bold flex-shrink-0 mt-[0.1vh]">×</span>
              <span className="[text-wrap:pretty]"><strong>Freddy AI has never spoken a word in Arabic.</strong> Freddy is an opt-in credits system — a chatbot layer, not a voice agent. No Khaleeji dialect, no bilingual qualification, no post-call WhatsApp automation.</span>
            </li>
            <li className="flex gap-[0.7vw]">
              <span className="text-rose font-bold flex-shrink-0 mt-[0.1vh]">×</span>
              <span className="[text-wrap:pretty]"><strong>India-hosted infrastructure, INR-anchored pricing.</strong> No KSA PDPL call redaction (Iqama numbers, Saudi IBANs), no in-Kingdom data residency, and pricing built around Indian mid-market budgets — not GCC enterprise contracts.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="absolute bottom-[2.8vh] left-[6vw] right-[6vw] rounded-[0.8vw] bg-ink/5 border border-ink/10 px-[1.4vw] py-[0.9vh] flex items-center gap-[1vw]">
        <span className="w-[1.4vw] h-[1.4vw] rotate-45 bg-seafoam rounded-[0.2vw] flex-shrink-0" />
        <span className="text-[0.9vw] text-ink/80"><strong className="text-seafoam">NexFlow's answer to all three:</strong> One platform with three engines — CRM + Call Center + Enrichment — on one schema. Arabic AI Voice Agents in 4 dialects. Post-call WhatsApp in 5 minutes. Saudi CR lookup, 16-agent person research, Wamda/MoCI/Argaam signals. One SAR-priced plan, no module lottery.</span>
      </div>
    </div>
  );
}
