
const ACCENT = "#B8A0C8";
const TEAL = "#88B8B0";
const GOLD = "#C8A880";
const RED = "#C88888";

type NodeProps = {
  label: string;
  sub?: string;
  color?: string;
  badge?: string;
  badgeColor?: string;
  indent?: number;
  isNew?: boolean;
  dim?: boolean;
};

function Node({ label, sub, color = ACCENT, badge, badgeColor, indent = 0, isNew, dim }: NodeProps) {
  return (
    <div className="flex items-start gap-2" style={{ paddingLeft: indent * 20 }}>
      <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, opacity: dim ? 0.4 : 1 }} />
      <div style={{ opacity: dim ? 0.45 : 1 }}>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold" style={{ color: dim ? "#888" : "#e2e2e2" }}>{label}</span>
          {isNew && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${TEAL}25`, color: TEAL, border: `1px solid ${TEAL}60` }}>NEW</span>
          )}
          {badge && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: badgeColor ? `${badgeColor}20` : "#ffffff10", color: badgeColor ?? "#aaa", border: `1px solid ${badgeColor ?? "#555"}50` }}>{badge}</span>
          )}
        </div>
        {sub && <div className="text-[11px] mt-0.5" style={{ color: dim ? "#555" : "#888" }}>{sub}</div>}
      </div>
    </div>
  );
}

function SectionBox({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: `${accent}40`, background: `${accent}06` }}>
      <div className="px-4 py-2.5 flex items-center gap-2 border-b" style={{ borderColor: `${accent}25`, background: `${accent}10` }}>
        <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
        <span className="text-[12px] font-bold tracking-wide" style={{ color: accent }}>{title}</span>
      </div>
      <div className="p-4 flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function Arrow() {
  return <div className="w-px h-4 ml-[7px]" style={{ background: "linear-gradient(to bottom, #444, transparent)" }} />;
}

export function NavMap() {
  return (
    <div className="min-h-screen p-8" style={{ background: "#0e0f14", fontFamily: "system-ui, sans-serif" }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
              <span className="text-lg">⬡</span>
            </div>
            <div>
              <h1 className="text-[20px] font-bold" style={{ color: ACCENT }}>Enrichment Engine — Proposed IA</h1>
              <p className="text-[12px]" style={{ color: "#666" }}>New tab structure · for approval before coding</p>
            </div>
          </div>
          {/* Legend */}
          <div className="flex gap-4 mt-4">
            {[
              { color: TEAL, label: "New — Enrich Agentic Hub" },
              { color: ACCENT, label: "Elevated / upgraded" },
              { color: GOLD, label: "Cross-cutting toggles" },
              { color: "#666", label: "Unchanged" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span className="text-[11px]" style={{ color: "#888" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main layout: 2 columns */}
        <div className="grid grid-cols-2 gap-5">

          {/* LEFT COL */}
          <div className="flex flex-col gap-4">

            {/* Tab 1 — Agentic Hub (NEW) */}
            <SectionBox title="Tab 1 · Enrich Agentic Hub  ✦ NEW FIRST TAB" accent={TEAL}>
              <Node label="AI Chat" sub="9-tool composer loop · streaming · Arabic" color={TEAL} indent={1} />
              <Node label="Agent Swarm" sub="Kimi-coordinated multi-agent brief" color={TEAL} indent={1} isNew />
              <Node label="Lead Genome" sub="Saved leads list · lists · push-to-CRM" color={TEAL} indent={1} />
              <Node label="Lead Factory" sub="Person Hunt · Company · Signals · Relationship" color={TEAL} indent={1} />
            </SectionBox>

            {/* Tab 2 — Harvest AI */}
            <SectionBox title="Tab 2 · Lead Generation → 'Harvest AI' (rebranded)" accent={ACCENT}>
              <Node label="ICP Territory Scanner" sub="Auto-map KSA/UAE companies + DMs from ICP" color={ACCENT} badge="Upgraded" badgeColor={ACCENT} indent={1} />
              <Arrow />
              <div className="ml-5 p-3 rounded-xl border" style={{ borderColor: `${ACCENT}25`, background: `${ACCENT}08` }}>
                <div className="text-[10px] font-bold mb-2" style={{ color: ACCENT }}>POWERS THIS TAB</div>
                <div className="flex flex-col gap-1.5">
                  <Node label="Masaar Engine" sub="Saudi CR intelligence · 7-agent SSE" color={ACCENT} indent={0} badge="Doc 1" badgeColor={GOLD} />
                  <Node label="Masar Database" sub="25-source agentic company harvest" color={ACCENT} indent={0} badge="25 src" badgeColor={GOLD} />
                  <Node label="AI DB Builder" sub="15-source AI database builder" color={ACCENT} indent={0} badge="15 src" badgeColor={GOLD} />
                </div>
              </div>
              <div className="mt-1 px-3 py-2 rounded-lg text-[10px]" style={{ background: `${GOLD}10`, borderLeft: `3px solid ${GOLD}`, color: GOLD }}>
                🚫 DB seeder data = backend only — never displayed in frontend
              </div>
            </SectionBox>

          </div>

          {/* RIGHT COL */}
          <div className="flex flex-col gap-4">

            {/* Tab 3 — Card Scanner */}
            <SectionBox title="Tab 3 · Card Scanner  (elevated)" accent={ACCENT}>
              <Node label="5-agent pipeline" sub="Gemini OCR → Claude → Perplexity → Scraper → GPT scoring" color={ACCENT} indent={1} />
              <Node label="Enrichment upgrade" sub="Now routes through ProsEngine enrichment layer" color={TEAL} indent={1} badge="↑" badgeColor={TEAL} />
            </SectionBox>

            {/* Tab 4 — ProsEngine */}
            <SectionBox title="Tab 4 · ProsEngine  (elevated model)" accent={ACCENT}>
              <Node label="Company Intel" sub="Same design · Nexus-tier synthesis upgrade" color={ACCENT} indent={1} />
              <Node label="Person Intel" sub="Same design · +Apollo +Sherlock +TheHarvester" color={ACCENT} indent={1} badge="↑" badgeColor={ACCENT} />
              <Node label="Website Intel" sub="Same design · Camoufox L3 + ScrapeGraphAI L4" color={ACCENT} indent={1} badge="↑" badgeColor={ACCENT} />
              <Node label="Data Seeder" sub="Same design · EVAL→APPROVE→HARVEST→ENRICH pipeline" color={ACCENT} indent={1} />
            </SectionBox>

            {/* Tab 5 + 6 — Unchanged */}
            <SectionBox title="Tab 5–6 · CRM Enrichment & Settings  (unchanged)" accent="#555">
              <Node label="CRM Enrichment" sub="Quick Enrich · Bulk Upload · Waterfall" color="#666" indent={1} dim />
              <Node label="Settings" sub="Waterfall Sources · Dedup · Validation" color="#666" indent={1} dim />
            </SectionBox>

            {/* Cross-cutting toggles */}
            <SectionBox title="Cross-cutting Global Toggles  (all tabs)" accent={GOLD}>
              <div className="flex gap-3">
                <div className="flex-1 p-3 rounded-xl border" style={{ borderColor: `${TEAL}40`, background: `${TEAL}08` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-4 rounded-full" style={{ background: TEAL }} />
                    <span className="text-[12px] font-bold" style={{ color: TEAL }}>Signal Intelligence</span>
                  </div>
                  <div className="text-[10px]" style={{ color: "#666" }}>LinkedIn · X · Wamda · MoCI · PR Newswire · Reuters triggers across all enrichment tabs</div>
                </div>
                <div className="flex-1 p-3 rounded-xl border" style={{ borderColor: `${GOLD}40`, background: `${GOLD}08` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-4 rounded-full" style={{ background: GOLD }} />
                    <span className="text-[12px] font-bold" style={{ color: GOLD }}>Relationship Intel</span>
                  </div>
                  <div className="text-[10px]" style={{ color: "#666" }}>Sherlock + TheHarvester network graph overlay on Person/Company reports</div>
                </div>
              </div>
            </SectionBox>

          </div>
        </div>

        {/* Backend rule footer */}
        <div className="mt-5 p-4 rounded-2xl border text-center" style={{ borderColor: `${RED}30`, background: `${RED}08` }}>
          <span className="text-[12px] font-bold" style={{ color: RED }}>⚠ DB Seeder Rule:</span>
          <span className="text-[12px] ml-2" style={{ color: "#888" }}>
            builder_companies / masar_companies / meshbase_companies seed data lives in the backend only.
            The frontend never exposes seeded DB rows directly — engines consume them internally.
          </span>
        </div>

      </div>
    </div>
  );
}
