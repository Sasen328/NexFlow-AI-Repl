const base = import.meta.env.BASE_URL;

export default function PainSalesforce() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[20vh] left-[-15vw] w-[65vw] h-[65vw] rounded-full opacity-18 blur-[8vw] bg-rose" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[45vw] h-[45vw] rounded-full opacity-12 blur-[6vw] bg-sand" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>04 · Pain in Salesforce</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13.5vh]">
        <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-rose">The incumbent's GCC blind spots · ~$34.9B revenue FY25</div>
        <h2 className="mt-[0.6vh] font-display font-extrabold text-[3.6vw] leading-[0.96] tracking-[-0.02em] max-w-[76vw] [text-wrap:balance]">
          Salesforce built a global CRM.<br />It was never designed for GCC sales.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[33vh] bottom-[5vh] grid grid-cols-4 gap-[1.6vw]">
        <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.6vw] flex flex-col">
          <div className="flex items-center gap-[0.8vw] mb-[1.4vh]">
            <div className="w-[2vw] h-[2vw] rounded-full bg-rose/15 flex items-center justify-center flex-shrink-0">
              <span className="text-rose font-bold text-[0.85vw]">01</span>
            </div>
            <span className="text-[0.78vw] uppercase tracking-[0.16em] font-semibold text-ink/50">Arabic AI Voice</span>
          </div>
          <div className="font-display font-extrabold text-[1.35vw] leading-tight">
            Einstein Agentforce Voice:<br />English only. $2 per conversation.
          </div>
          <p className="mt-[1vh] text-[0.92vw] leading-snug text-ink/70 flex-1 [text-wrap:pretty]">
            Sold as a paid add-on on top of Sales Cloud Enterprise. No Khaleeji dialect, no Gulf Arabic, no bilingual handoff mid-call. A GCC rep must choose between a bot that sounds wrong and no bot at all.
          </p>
          <div className="mt-[1.2vh] pt-[1.2vh] border-t border-seafoam/30 bg-seafoam/5 rounded-[0.6vw] p-[0.8vw]">
            <div className="text-[0.75vw] uppercase tracking-[0.16em] font-semibold text-seafoam mb-[0.4vh]">NexFlow</div>
            <div className="text-[0.88vw] text-ink/80 leading-snug">6 pre-built voices — Layla &amp; Faisal (Khaleeji), Reem (Levantine), Omar (Egyptian), Noor (bilingual AR/EN), Adam (English) — included in every plan, zero per-call charge.</div>
          </div>
        </div>

        <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.6vw] flex flex-col">
          <div className="flex items-center gap-[0.8vw] mb-[1.4vh]">
            <div className="w-[2vw] h-[2vw] rounded-full bg-rose/15 flex items-center justify-center flex-shrink-0">
              <span className="text-rose font-bold text-[0.85vw]">02</span>
            </div>
            <span className="text-[0.78vw] uppercase tracking-[0.16em] font-semibold text-ink/50">Post-Call Automation</span>
          </div>
          <div className="font-display font-extrabold text-[1.35vw] leading-tight">
            After a missed call, reps type every follow-up manually. Or it never happens.
          </div>
          <p className="mt-[1vh] text-[0.92vw] leading-snug text-ink/70 flex-1 [text-wrap:pretty]">
            Salesforce has no post-call cadence logic. No Arabic WhatsApp draft, no context-aware message, no timed trigger. Every follow-up action requires a human to remember and type.
          </p>
          <div className="mt-[1.2vh] pt-[1.2vh] border-t border-seafoam/30 bg-seafoam/5 rounded-[0.6vw] p-[0.8vw]">
            <div className="text-[0.75vw] uppercase tracking-[0.16em] font-semibold text-seafoam mb-[0.4vh]">NexFlow</div>
            <div className="text-[0.88vw] text-ink/80 leading-snug">Every call outcome — no-answer, voicemail, connected — fires a cadence rule. AI drafts a context-aware Arabic/English WhatsApp and sends it within 5 minutes. Automatically.</div>
          </div>
        </div>

        <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.6vw] flex flex-col">
          <div className="flex items-center gap-[0.8vw] mb-[1.4vh]">
            <div className="w-[2vw] h-[2vw] rounded-full bg-rose/15 flex items-center justify-center flex-shrink-0">
              <span className="text-rose font-bold text-[0.85vw]">03</span>
            </div>
            <span className="text-[0.78vw] uppercase tracking-[0.16em] font-semibold text-ink/50">Saudi Commercial Registry</span>
          </div>
          <div className="font-display font-extrabold text-[1.35vw] leading-tight">
            Saudi CR verification doesn't exist in Salesforce's world.
          </div>
          <p className="mt-[1vh] text-[0.92vw] leading-snug text-ink/70 flex-1 [text-wrap:pretty]">
            In KSA enterprise sales, CR lookup is a mandatory pre-sales step — legal name, license type, registered directors. Salesforce reps copy it from a browser tab into a text field manually.
          </p>
          <div className="mt-[1.2vh] pt-[1.2vh] border-t border-seafoam/30 bg-seafoam/5 rounded-[0.6vw] p-[0.8vw]">
            <div className="text-[0.75vw] uppercase tracking-[0.16em] font-semibold text-seafoam mb-[0.4vh]">NexFlow</div>
            <div className="text-[0.88vw] text-ink/80 leading-snug">Masaar engine: type the company name → get CR number, legal name, license type, establishment date, and registered directors in real-time, inside the contact record.</div>
          </div>
        </div>

        <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.6vw] flex flex-col">
          <div className="flex items-center gap-[0.8vw] mb-[1.4vh]">
            <div className="w-[2vw] h-[2vw] rounded-full bg-rose/15 flex items-center justify-center flex-shrink-0">
              <span className="text-rose font-bold text-[0.85vw]">04</span>
            </div>
            <span className="text-[0.78vw] uppercase tracking-[0.16em] font-semibold text-ink/50">Platform Economics</span>
          </div>
          <div className="font-display font-extrabold text-[1.35vw] leading-tight">
            Three products. Three contracts. One sales team paying for all of it.
          </div>
          <p className="mt-[1vh] text-[0.92vw] leading-snug text-ink/70 flex-1 [text-wrap:pretty]">
            Sales Cloud + Service Cloud + Marketing Cloud + Einstein add-ons + enrichment tools = $800+ per user per year across three separate data models. Integration between them is billable professional services.
          </p>
          <div className="mt-[1.2vh] pt-[1.2vh] border-t border-seafoam/30 bg-seafoam/5 rounded-[0.6vw] p-[0.8vw]">
            <div className="text-[0.75vw] uppercase tracking-[0.16em] font-semibold text-seafoam mb-[0.4vh]">NexFlow</div>
            <div className="text-[0.88vw] text-ink/80 leading-snug">CRM + Call Center + Enrichment on one schema, one bill, one seat price in SAR. No integration tax between the parts that should already talk to each other.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
