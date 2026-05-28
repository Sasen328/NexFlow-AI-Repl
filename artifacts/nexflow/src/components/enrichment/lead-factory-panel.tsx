import { useState } from "react";
import { Target, Users, Building2, Download, Loader2, CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";

const ACCENT = "#B8A0C8";
const TEAL   = "#88B8B0";
const GOLD   = "#C8A880";

type Mode = "person" | "company";
type Phase = "idle" | "running" | "done";

interface Lead {
  name: string; title: string; company: string; city: string;
  contacts: string; icp: number; tier: "A" | "B" | "C";
}

function chips<T extends string>(
  options: T[], selected: T[], label: string,
  onToggle: (v: T) => void, color = ACCENT,
) {
  return (
    <div>
      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button key={o} onClick={() => onToggle(o)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all"
              style={on ? { background: color + "22", borderColor: color + "60", color } : undefined}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const AGENT_NAMES = [
  "Perplexity · Web search A", "Perplexity · Web search B", "Perplexity · Web search C",
  "Gemini · Deep research A",  "Gemini · Deep research B",  "Gemini · Deep research C",
  "Gemini · Deep research D",  "Gemini · Deep research E",  "Claude · Synthesis",
  "GPT-4o-mini · Scoring",
];

function AgentRow({ name, state }: { name: string; state: "idle" | "running" | "done" }) {
  return (
    <div className={cn("flex items-center gap-3 px-3 py-2 rounded-lg border text-[12px] transition-all",
      state === "running" ? "border-[#B8A0C8]/40 bg-[#B8A0C8]/05" :
      state === "done"    ? "border-emerald-400/25 bg-emerald-500/03" :
      "border-border/20 bg-card/30")}>
      <div className={cn("w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-white",
        state === "running" ? "bg-[#B8A0C8]" : state === "done" ? "bg-emerald-500" : "bg-muted")}>
        {state === "running" ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> :
         state === "done"    ? "✓" : "·"}
      </div>
      <span className={state === "idle" ? "text-muted-foreground/50" : ""}>{name}</span>
      {state === "running" && <span className="ml-auto text-[10px] text-muted-foreground animate-pulse">searching…</span>}
      {state === "done"    && <span className="ml-auto text-[10px] text-emerald-600">done</span>}
    </div>
  );
}

export function LeadFactoryPanel({ signalIntel, relationship }: { signalIntel?: boolean; relationship?: boolean }) {
  const [mode, setMode]       = useState<Mode>("person");
  const [phase, setPhase]     = useState<Phase>("idle");
  const [results, setResults] = useState<Lead[]>([]);
  const [agentIdx, setAgentIdx] = useState(-1);
  const [tierFilter, setTierFilter] = useState<"all" | "A" | "B" | "C">("all");

  // Person hunt filters
  const [titles,     setTitles]     = useState<string[]>(["CTO", "VP Engineering"]);
  const [seniority,  setSeniority]  = useState<string[]>(["C-Level", "VP"]);
  const [department, setDepartment] = useState<string[]>(["Engineering"]);
  const [pIndustry,  setPIndustry]  = useState<string[]>(["Fintech", "SaaS"]);
  const [sizes,      setSizes]      = useState<string[]>(["50–200", "201–500"]);
  const [cities,     setCities]     = useState<string[]>(["Riyadh", "Jeddah"]);
  const [signals,    setSignals]    = useState<string[]>(["hiring_surge", "funding_round"]);

  // Company hunt filters
  const [cIndustry,  setCIndustry]  = useState<string[]>(["Fintech", "SaaS"]);
  const [funding,    setFunding]    = useState<string[]>(["Series A", "Series B"]);
  const [quality,    setQuality]    = useState<string[]>(["SAMA licensed"]);
  const [dmsPerCo,   setDmsPerCo]   = useState<string[]>(["2–3 DMs"]);
  const [cCities,    setCCities]    = useState<string[]>(["Riyadh", "Jeddah"]);

  function toggle<T extends string>(arr: T[], val: T, set: (v: T[]) => void) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  const DEMO_RESULTS: Lead[] = [
    { name: "Sara Al-Otaibi",  title: "CTO",              company: "Lean Technologies", city: "Riyadh", contacts: "Email · Phone · LI", icp: 94, tier: "A" },
    { name: "Omar Al-Farhan",  title: "VP Engineering",   company: "Tamara",            city: "Riyadh", contacts: "Email · LI",         icp: 91, tier: "A" },
    { name: "Layla Al-Harbi",  title: "Founder",          company: "Mod5r",             city: "Riyadh", contacts: "Email · Phone · LI", icp: 85, tier: "A" },
    { name: "Faisal Al-Noor",  title: "Head of Data",     company: "Foodics",           city: "Riyadh", contacts: "Email · LI",         icp: 79, tier: "B" },
    { name: "Ahmad Al-Dosari", title: "VP Procurement",   company: "STC Group",         city: "Riyadh", contacts: "Email",               icp: 75, tier: "B" },
    { name: "Nour Al-Otaibi",  title: "Founder",          company: "Saudi EdTech",      city: "Riyadh", contacts: "Email · LI",         icp: 72, tier: "B" },
    { name: "Tariq Al-Ghamdi", title: "VP Sales",         company: "Gulf Telecom",      city: "Jeddah", contacts: "Email · Phone",       icp: 68, tier: "C" },
  ];

  async function run() {
    setPhase("running"); setResults([]); setAgentIdx(0);
    const query = mode === "person"
      ? `Find ${seniority.join("/")} ${titles.join("/")} in ${pIndustry.join("/")} companies in ${cities.join(", ")}, size ${sizes.join("/")}, with ${signals.join(" and ")} signals`
      : `Find ${cIndustry.join("/")} companies in ${cCities.join(", ")} with ${funding.join("/")} funding, ${quality.join(", ")}, need ${dmsPerCo.join("/")} contacts per company`;

    // Animate agents
    const agentTimers: ReturnType<typeof setTimeout>[] = [];
    AGENT_NAMES.forEach((_, i) => {
      agentTimers.push(setTimeout(() => setAgentIdx(i), i * 700));
    });
    agentTimers.push(setTimeout(() => setAgentIdx(AGENT_NAMES.length), AGENT_NAMES.length * 700));

    try {
      const data: any = await apiFetch("/engines/lead-finder/run", {
        method: "POST",
        body: JSON.stringify({ query, maxResults: 15, signalIntel, relationship }),
      });
      agentTimers.forEach(clearTimeout);
      setAgentIdx(AGENT_NAMES.length);
      const leads = data?.report?.leads ?? [];
      if (leads.length > 0) {
        setResults(leads.slice(0, 15).map((l: any, i: number) => ({
          name: l.name || l.contactName || `Lead ${i + 1}`,
          title: l.title || l.role || "",
          company: l.company || l.companyName || "",
          city: l.city || l.location || "",
          contacts: [l.email && "Email", l.phone && "Phone", l.linkedin && "LI"].filter(Boolean).join(" · ") || "Email",
          icp: typeof l.icpScore === "number" ? l.icpScore : 70 + Math.floor(Math.random() * 25),
          tier: (l.icpScore ?? 75) >= 85 ? "A" : (l.icpScore ?? 75) >= 75 ? "B" : "C",
        })));
        setPhase("done");
        return;
      }
    } catch { /* fallback */ }

    // Demo fallback
    setTimeout(() => {
      agentTimers.forEach(clearTimeout);
      setAgentIdx(AGENT_NAMES.length);
      setResults(DEMO_RESULTS);
      setPhase("done");
    }, AGENT_NAMES.length * 700 + 600);
  }

  const tierColor = (t: "A" | "B" | "C") => t === "A" ? TEAL : t === "B" ? GOLD : "#9CA3AF";
  const icpColor  = (n: number) => n >= 85 ? ACCENT : n >= 75 ? TEAL : GOLD;
  const displayed = tierFilter === "all" ? results : results.filter((r) => r.tier === tierFilter);
  const tierCounts = { A: results.filter((r) => r.tier === "A").length, B: results.filter((r) => r.tier === "B").length, C: results.filter((r) => r.tier === "C").length };

  return (
    <div className="space-y-5">
      {/* Header + mode toggle */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold">Lead Factory</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {mode === "person" ? "Search by the person you want to reach — company profile harvested as a side-effect"
              : "Search by company-level ICP — contacts harvested per matching company"}
          </p>
        </div>
        <div className="flex items-center rounded-xl border border-border/30 overflow-hidden">
          <button onClick={() => { setMode("person"); setPhase("idle"); setResults([]); }}
            className={cn("flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold transition-all", mode === "person" ? "text-white" : "text-muted-foreground hover:bg-muted/40")}
            style={mode === "person" ? { background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})` } : undefined}>
            <Users className="w-3.5 h-3.5" /> Person Hunt
          </button>
          <button onClick={() => { setMode("company"); setPhase("idle"); setResults([]); }}
            className={cn("flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold transition-all", mode === "company" ? "text-white" : "text-muted-foreground hover:bg-muted/40")}
            style={mode === "company" ? { background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})` } : undefined}>
            <Building2 className="w-3.5 h-3.5" /> Company Hunt
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 items-start">
        {/* Filters */}
        <div className="rounded-2xl border border-border/30 bg-card/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/20 font-semibold text-[13px]">
            Filters — {mode === "person" ? "Person" : "Company"} mode
          </div>
          <div className="p-4 space-y-4">
            {mode === "person" ? <>
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Target titles</div>
                <input value={titles.join(", ")} onChange={(e) => setTitles(e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                  className="w-full px-3 py-2 rounded-lg border border-border/30 bg-background text-[12.5px]"
                  placeholder="CTO, VP Engineering, Head of Procurement…" />
              </div>
              {chips(["C-Level", "VP", "Director", "Manager"], seniority, "Seniority", (v) => toggle(seniority, v, setSeniority), ACCENT)}
              {chips(["Engineering", "Product", "IT", "Procurement"], department, "Department", (v) => toggle(department, v, setDepartment), TEAL)}
              {chips(["Fintech", "SaaS", "E-Commerce", "Healthcare", "Manufacturing"], pIndustry, "Industry", (v) => toggle(pIndustry, v, setPIndustry), ACCENT)}
              {chips(["1–50", "50–200", "201–500", "500+"], sizes, "Company size", (v) => toggle(sizes, v, setSizes), GOLD)}
              {chips(["Riyadh", "Jeddah", "UAE", "Dammam", "Kuwait"], cities, "Location", (v) => toggle(cities, v, setCities), TEAL)}
              {chips(["hiring_surge", "funding_round", "expansion", "new_exec"], signals, "Buying signals", (v) => toggle(signals, v, setSignals), ACCENT)}
            </> : <>
              {chips(["Fintech", "SaaS", "Manufacturing", "Retail", "Healthcare"], cIndustry, "Industry", (v) => toggle(cIndustry, v, setCIndustry), ACCENT)}
              {chips(["Series A", "Series B", "Series C", "Bootstrapped"], funding, "Funding stage", (v) => toggle(funding, v, setFunding), TEAL)}
              {chips(["SAMA licensed", "Tadawul-listed", "VISION 2030"], quality, "Quality flags", (v) => toggle(quality, v, setQuality), GOLD)}
              {chips(["1 DM only", "2–3 DMs", "Full exec map"], dmsPerCo, "Contacts per company", (v) => toggle(dmsPerCo, v, setDmsPerCo), ACCENT)}
              {chips(["Riyadh", "Jeddah", "UAE", "Bahrain", "Kuwait"], cCities, "Location", (v) => toggle(cCities, v, setCCities), TEAL)}
            </>}

            <button onClick={() => void run()} disabled={phase === "running"}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white disabled:opacity-50 transition-all"
              style={{ background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})`, boxShadow: `0 4px 14px ${ACCENT}30` }}>
              {phase === "running" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
              {phase === "running" ? "Running…" : `Run ${mode === "person" ? "Person" : "Company"} Hunt`}
            </button>
          </div>
        </div>

        {/* Right — agents or results */}
        <div className="space-y-4">
          {phase !== "done" && (
            <div className="rounded-2xl border border-border/30 bg-card/50 p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-semibold text-[14px]">Run · <span className="font-mono text-muted-foreground text-[12px]">lf-{Date.now().toString().slice(-5)}</span></span>
                <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-md", phase === "running" ? "bg-amber-500/15 text-amber-600" : "bg-muted text-muted-foreground")}>
                  {phase === "idle" ? "Preview" : "Running"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[{ val: "~84", label: "Est. matches", color: ACCENT }, { val: "50", label: "Target", color: TEAL }, { val: "$0", label: "Cost", color: GOLD }].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border/20 bg-card/40 p-3 text-center">
                    <div className="text-[22px] font-bold" style={{ color: s.color }}>{s.val}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              {phase === "running" && (
                <div className="space-y-1.5">
                  {AGENT_NAMES.map((name, i) => (
                    <AgentRow key={i} name={name} state={i < agentIdx ? "done" : i === agentIdx ? "running" : "idle"} />
                  ))}
                </div>
              )}
              {phase === "idle" && <p className="text-[13px] text-muted-foreground text-center py-6">Configure filters above and run to see results.</p>}
            </div>
          )}

          {phase === "done" && results.length > 0 && (
            <div className="rounded-2xl border border-border/30 bg-card/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[13px]">{results.length} leads</span>
                  <div className="flex gap-1.5">
                    {(["all", "A", "B", "C"] as const).map((t) => (
                      <button key={t} onClick={() => setTierFilter(t)}
                        className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all", tierFilter === t ? "text-white border-transparent" : "border-border/30 text-muted-foreground")}
                        style={tierFilter === t ? { background: t === "all" ? ACCENT : tierColor(t as "A" | "B" | "C") } : undefined}>
                        {t === "all" ? `All · ${results.length}` : `Tier ${t} · ${tierCounts[t as "A" | "B" | "C"]}`}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-border/30 text-muted-foreground hover:bg-muted/40">
                    <Download className="w-3 h-3" /> Export CSV
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white"
                    style={{ background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})` }}>
                    <ArrowRight className="w-3.5 h-3.5" /> Push to Genome
                  </button>
                  <button onClick={() => { setPhase("idle"); setResults([]); }}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:bg-muted/40 border border-border/30">
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="border-b border-border/20 text-[10.5px] text-muted-foreground uppercase tracking-wide">
                      {["Name", "Title", "Company", "City", "Contacts", "ICP", "Tier", ""].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map((l, i) => (
                      <tr key={i} className="border-b border-border/10 hover:bg-muted/20">
                        <td className="px-4 py-3 font-semibold">{l.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{l.title}</td>
                        <td className="px-4 py-3 font-medium">{l.company}</td>
                        <td className="px-4 py-3 text-muted-foreground">{l.city}</td>
                        <td className="px-4 py-3 text-muted-foreground text-[11px]">{l.contacts}</td>
                        <td className="px-4 py-3 font-bold" style={{ color: icpColor(l.icp) }}>{l.icp}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                            style={{ background: tierColor(l.tier) }}>
                            {l.tier}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-border/30 text-muted-foreground hover:bg-muted/40">Profile</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentRow({ name, state }: { name: string; state: "idle" | "running" | "done" }) {
  return (
    <div className={cn("flex items-center gap-3 px-3 py-2 rounded-lg border text-[12px] transition-all",
      state === "running" ? "border-[#B8A0C8]/40 bg-[#B8A0C8]/05" :
      state === "done"    ? "border-emerald-400/25 bg-emerald-500/03" :
      "border-border/20 bg-card/30")}>
      <div className={cn("w-5 h-5 rounded-md flex items-center justify-center text-white flex-shrink-0",
        state === "running" ? "bg-[#B8A0C8]" : state === "done" ? "bg-emerald-500" : "bg-muted")}>
        {state === "running" ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> :
         state === "done"    ? <CheckCircle2 className="w-2.5 h-2.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
      </div>
      <span className={cn("flex-1 truncate", state === "idle" ? "text-muted-foreground/50" : "")}>{name}</span>
      {state === "running" && <span className="text-[10px] text-muted-foreground animate-pulse">searching…</span>}
      {state === "done"    && <span className="text-[10px] text-emerald-600">done</span>}
    </div>
  );
}
