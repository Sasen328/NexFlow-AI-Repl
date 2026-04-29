const base = import.meta.env.BASE_URL;

export default function Product() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-lavender" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[50vw] h-[50vw] rounded-full opacity-30 blur-[6vw] bg-seafoam" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>08 · Product overview</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13vh]">
        <h2 className="font-display font-extrabold text-[4.4vw] leading-[0.96] tracking-[-0.02em] max-w-[68vw] [text-wrap:balance]">
          Eight modules. One sovereign platform.
        </h2>
        <p className="mt-[1.4vh] font-serif italic text-[1.5vw] leading-snug text-ink/75 max-w-[60vw] [text-wrap:pretty]">
          One schema, one identity, one bill — no integration tax between the things that should already speak to each other.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[30vh] bottom-[6vh] grid grid-cols-4 grid-rows-2 gap-[1.4vw]">
        <div className="rounded-[1.2vw] bg-white/75 border border-ink/10 p-[1.4vw] flex flex-col">
          <div className="flex items-center gap-[0.8vw]">
            <span className="w-[1.6vw] h-[1.6vw] rotate-45 bg-lavender rounded-[0.25vw]" />
            <span className="text-[0.85vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Module 01</span>
          </div>
          <div className="mt-[1vh] font-display font-extrabold text-[1.55vw] leading-tight">CRM Core</div>
          <p className="mt-[0.8vh] text-[0.95vw] leading-snug text-ink/75 [text-wrap:pretty]">Contacts, companies, deals, and pipelines built on a bilingual, GCC-aware data model.</p>
        </div>
        <div className="rounded-[1.2vw] bg-white/75 border border-ink/10 p-[1.4vw] flex flex-col">
          <div className="flex items-center gap-[0.8vw]">
            <span className="w-[1.6vw] h-[1.6vw] rotate-45 bg-rose rounded-[0.25vw]" />
            <span className="text-[0.85vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Module 02</span>
          </div>
          <div className="mt-[1vh] font-display font-extrabold text-[1.55vw] leading-tight">AI Forecast</div>
          <p className="mt-[0.8vh] text-[0.95vw] leading-snug text-ink/75 [text-wrap:pretty]">Per-deal win-rate, written rationale, leading indicators, and explainable rollups.</p>
        </div>
        <div className="rounded-[1.2vw] bg-white/75 border border-ink/10 p-[1.4vw] flex flex-col">
          <div className="flex items-center gap-[0.8vw]">
            <span className="w-[1.6vw] h-[1.6vw] rotate-45 bg-seafoam rounded-[0.25vw]" />
            <span className="text-[0.85vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Module 03</span>
          </div>
          <div className="mt-[1vh] font-display font-extrabold text-[1.55vw] leading-tight">Conversation Capture</div>
          <p className="mt-[0.8vh] text-[0.95vw] leading-snug text-ink/75 [text-wrap:pretty]">Calls, WhatsApp, and email transcribed bilingually, summarized, and turned into next steps.</p>
        </div>
        <div className="rounded-[1.2vw] bg-white/75 border border-ink/10 p-[1.4vw] flex flex-col">
          <div className="flex items-center gap-[0.8vw]">
            <span className="w-[1.6vw] h-[1.6vw] rotate-45 bg-sand rounded-[0.25vw]" />
            <span className="text-[0.85vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Module 04</span>
          </div>
          <div className="mt-[1vh] font-display font-extrabold text-[1.55vw] leading-tight">Cloud Calls</div>
          <p className="mt-[0.8vh] text-[0.95vw] leading-snug text-ink/75 [text-wrap:pretty]">Built-in dialer, regional numbers, recording, and call analytics — no third-party telephony bill.</p>
        </div>

        <div className="rounded-[1.2vw] bg-white/75 border border-ink/10 p-[1.4vw] flex flex-col">
          <div className="flex items-center gap-[0.8vw]">
            <span className="w-[1.6vw] h-[1.6vw] rotate-45 bg-mist rounded-[0.25vw]" />
            <span className="text-[0.85vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Module 05</span>
          </div>
          <div className="mt-[1vh] font-display font-extrabold text-[1.55vw] leading-tight">Marketing</div>
          <p className="mt-[0.8vh] text-[0.95vw] leading-snug text-ink/75 [text-wrap:pretty]">Email, WhatsApp, SMS journeys with attribution wired straight into pipeline.</p>
        </div>
        <div className="rounded-[1.2vw] bg-white/75 border border-ink/10 p-[1.4vw] flex flex-col">
          <div className="flex items-center gap-[0.8vw]">
            <span className="w-[1.6vw] h-[1.6vw] rotate-45 bg-olive rounded-[0.25vw]" />
            <span className="text-[0.85vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Module 06</span>
          </div>
          <div className="mt-[1vh] font-display font-extrabold text-[1.55vw] leading-tight">Data Enrichment</div>
          <p className="mt-[0.8vh] text-[0.95vw] leading-snug text-ink/75 [text-wrap:pretty]">Regional company &amp; person enrichment, with credit-based usage and source provenance.</p>
        </div>
        <div className="rounded-[1.2vw] bg-white/75 border border-ink/10 p-[1.4vw] flex flex-col">
          <div className="flex items-center gap-[0.8vw]">
            <span className="w-[1.6vw] h-[1.6vw] rotate-45 bg-lavender rounded-[0.25vw]" />
            <span className="text-[0.85vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Module 07</span>
          </div>
          <div className="mt-[1vh] font-display font-extrabold text-[1.55vw] leading-tight">Workflows &amp; Automation</div>
          <p className="mt-[0.8vh] text-[0.95vw] leading-snug text-ink/75 [text-wrap:pretty]">No-code automations, approvals, and SLA timers — bilingual triggers and human-readable logs.</p>
        </div>
        <div className="rounded-[1.2vw] bg-white/75 border border-ink/10 p-[1.4vw] flex flex-col">
          <div className="flex items-center gap-[0.8vw]">
            <span className="w-[1.6vw] h-[1.6vw] rotate-45 bg-rose rounded-[0.25vw]" />
            <span className="text-[0.85vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Module 08</span>
          </div>
          <div className="mt-[1vh] font-display font-extrabold text-[1.55vw] leading-tight">Analytics &amp; BI</div>
          <p className="mt-[0.8vh] text-[0.95vw] leading-snug text-ink/75 [text-wrap:pretty]">Role-aware dashboards, cohorts, and pipeline health — no separate BI license required.</p>
        </div>
      </div>
    </div>
  );
}
