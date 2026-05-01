import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/useApi";
import { useState, useRef } from "react";
import { Link } from "wouter";
import {
  Users, AlertTriangle, CheckCircle2, Merge, Loader2, Search,
  Database, Sparkles, Upload, FileText, X, Filter, RefreshCw,
  ArrowRight, ShieldCheck, Trash2, Plus, ChevronDown, ChevronUp,
  Check, AlertCircle, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Existing contacts dedup types ───────────────────────────────────────────
interface DupContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  company_id: string | null;
  lead_score: number | null;
  created_at: string;
}
interface DupGroup {
  key: string;
  reason: string;
  confidence: number;
  contacts: DupContact[];
}

// ─── Pre-import types ─────────────────────────────────────────────────────────
type StagedStatus = "new" | "duplicate" | "possible" | "excluded";
interface StagedLead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  // after batch-check
  status?: StagedStatus;
  match_name?: string;
  contact_id?: string;
  match_reason?: string;
  confidence?: number;
  // user action
  exclude?: boolean;
}

const TABS = ["CRM Scan", "Pre-Import"] as const;
type Tab = (typeof TABS)[number];

// ─── Page root ────────────────────────────────────────────────────────────────
export default function DedupPage() {
  const [tab, setTab] = useState<Tab>("CRM Scan");
  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center">
              <Merge className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Lead Deduplication</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            Detect and merge duplicates in your CRM — or screen new leads before import.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit border border-border/30">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-semibold transition",
              tab === t
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "Pre-Import" && <span className="mr-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#88B8B0]/20 text-[#88B8B0] align-middle">NEW</span>}
            {t}
          </button>
        ))}
      </div>

      {tab === "CRM Scan" && <CrmScanTab />}
      {tab === "Pre-Import" && <PreImportTab />}
    </div>
  );
}

// ─── CRM Scan tab (existing functionality) ────────────────────────────────────
function CrmScanTab() {
  const qc = useQueryClient();
  const [strict, setStrict] = useState(false);
  const [merging, setMerging] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery<{
    total_groups: number;
    total_duplicates: number;
    groups: DupGroup[];
  }>({
    queryKey: ["dedup", strict],
    queryFn: () => apiFetch(`/dedup/find?strict=${strict}`),
  });

  const merge = useMutation({
    mutationFn: ({ survivor_id, duplicate_ids }: { survivor_id: string; duplicate_ids: string[] }) =>
      apiFetch(`/dedup/merge`, { method: "POST", body: JSON.stringify({ survivor_id, duplicate_ids }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dedup"] });
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setMerging(null);
    },
  });

  const groups = data?.groups ?? [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Duplicate clusters" value={data?.total_groups ?? "—"} accent="#C8A880" icon={<Database className="w-4 h-4" />} />
        <StatCard label="Records to review" value={data?.total_duplicates ?? "—"} accent="#B8A0C8" icon={<Users className="w-4 h-4" />} />
        <StatCard label="Detection mode" value={strict ? "Exact" : "Fuzzy + exact"} accent="#88B8B0" icon={<Sparkles className="w-4 h-4" />} />
      </div>

      <div className="flex items-center gap-3 justify-end">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} className="rounded accent-primary" />
          Strict mode (exact only)
        </label>
        <button onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg shadow-sm">
          <RefreshCw className="w-3.5 h-3.5" /> Re-scan
        </button>
      </div>

      {isLoading && (
        <div className="glass-panel p-8 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Scanning all contacts…
        </div>
      )}

      {!isLoading && groups.length === 0 && (
        <div className="glass-panel p-12 flex flex-col items-center text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
          <div className="text-lg font-semibold">No duplicates found</div>
          <div className="text-sm text-muted-foreground mt-1">Your contact database looks clean.</div>
        </div>
      )}

      <div className="space-y-4">
        {groups.map((g) => (
          <DupGroupCard key={g.key} group={g}
            onMerge={(survivor, dupes) => { setMerging(g.key); merge.mutate({ survivor_id: survivor, duplicate_ids: dupes }); }}
            merging={merging === g.key}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Pre-Import staging tab ───────────────────────────────────────────────────
const SAMPLE_CSV = `Name,Email,Phone,Company,Title
Ahmed Al-Rashidi,ahmed.rashidi@firstbank.ae,+971501234567,First National Bank,Head of Wealth
Sara Al-Mahmoud,sara.m@alfaribcap.com,+966532345678,Al Farib Capital,Portfolio Manager
Mohammad Hassan,m.hassan@khaleeji.bh,,Khaleeji Holdings,GM
Fatima Al-Mansoori,fatima@riad-wm.sa,+966541234567,Riad Wealth Mgmt,CEO
John Smith,j.smith@globalcorp.com,+447911234567,Global Corp Inc,Sales Manager`;

function PreImportTab() {
  const [csvText, setCsvText] = useState("");
  const [leads, setLeads] = useState<StagedLead[]>([]);
  const [checkState, setCheckState] = useState<"idle" | "checking" | "done">("idle");
  const [pushState, setPushState] = useState<"idle" | "pushing" | "done">("idle");
  const [pushResult, setPushResult] = useState<{ created: number; skipped: number } | null>(null);
  const [summary, setSummary] = useState<{ total: number; duplicates: number; possible: number; new: number } | null>(null);
  const [filter, setFilter] = useState<StagedStatus | "all">("all");
  const fileRef = useRef<HTMLInputElement>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  function parseCsv(raw: string): StagedLead[] {
    const lines = raw.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row");
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
    const nameIdx = header.findIndex((h) => h.includes("name") && !h.includes("company"));
    const emailIdx = header.findIndex((h) => h.includes("email") || h.includes("mail"));
    const phoneIdx = header.findIndex((h) => h.includes("phone") || h.includes("mobile") || h.includes("tel"));
    const companyIdx = header.findIndex((h) => h.includes("company") || h.includes("organisation") || h.includes("organization"));
    const titleIdx = header.findIndex((h) => h.includes("title") || h.includes("role") || h.includes("position"));

    if (nameIdx < 0 && emailIdx < 0) throw new Error("CSV must have at least a Name or Email column");

    return lines.slice(1).map((line, i) => {
      const cols = splitCsvLine(line);
      return {
        id: `staged-${i}-${Date.now()}`,
        name: cols[nameIdx]?.trim() || `Lead ${i + 1}`,
        email: cols[emailIdx]?.trim() || undefined,
        phone: cols[phoneIdx]?.trim() || undefined,
        company: cols[companyIdx]?.trim() || undefined,
        title: cols[titleIdx]?.trim() || undefined,
        status: "new" as StagedStatus,
      };
    });
  }

  function splitCsvLine(line: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === "," && !inQuotes) { result.push(cur); cur = ""; }
      else { cur += ch; }
    }
    result.push(cur);
    return result;
  }

  function loadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setCsvText(reader.result as string); setParseError(null); };
    reader.readAsText(f);
  }

  function loadSample() {
    setCsvText(SAMPLE_CSV);
    setParseError(null);
    setLeads([]);
    setCheckState("idle");
    setPushState("idle");
    setSummary(null);
  }

  function parseNow() {
    setParseError(null);
    try {
      const parsed = parseCsv(csvText);
      setLeads(parsed);
      setCheckState("idle");
      setPushState("idle");
      setSummary(null);
      setPushResult(null);
      setFilter("all");
    } catch (err: any) {
      setParseError(err?.message ?? "Parse failed");
    }
  }

  async function runBatchCheck() {
    if (!leads.length) return;
    setCheckState("checking");
    try {
      const payload = leads.map((l) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        company: l.company,
      }));
      const r: any = await apiFetch("/dedup/check-batch", {
        method: "POST",
        body: JSON.stringify({ leads: payload }),
      });
      const resultMap: Record<string, any> = {};
      for (const row of r.results ?? []) resultMap[row.id] = row;
      setLeads((prev) =>
        prev.map((l) => {
          const hit = resultMap[l.id];
          return hit ? { ...l, status: hit.status, match_name: hit.match_name, contact_id: hit.contact_id, match_reason: hit.match_reason, confidence: hit.confidence } : l;
        })
      );
      setSummary(r.summary ?? null);
      setCheckState("done");
    } catch {
      setCheckState("idle");
    }
  }

  function toggleExclude(id: string) {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, exclude: !l.exclude } : l));
  }

  async function pushNew() {
    setPushState("pushing");
    const toPush = leads.filter((l) => !l.exclude && (l.status === "new" || l.status === "possible"));
    try {
      const r: any = await apiFetch("/dedup/push-staged", {
        method: "POST",
        body: JSON.stringify({ leads: toPush }),
      });
      setPushResult(r);
      setPushState("done");
      // Mark pushed leads as excluded from view
      const pushedIds = new Set(toPush.map((l) => l.id));
      setLeads((prev) => prev.map((l) => pushedIds.has(l.id) ? { ...l, exclude: true } : l));
    } catch {
      setPushState("idle");
    }
  }

  const visible = leads.filter((l) => filter === "all" ? true : l.status === filter);
  const newCount = leads.filter((l) => !l.exclude && l.status === "new").length;
  const possibleCount = leads.filter((l) => !l.exclude && l.status === "possible").length;
  const dupCount = leads.filter((l) => l.status === "duplicate").length;

  return (
    <div className="space-y-4">
      {/* Step 1 — paste / upload */}
      <div className="glass-panel p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Step 1 — Load leads</div>
            <div className="text-sm font-semibold mt-0.5">Paste CSV or upload a file</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadSample} className="text-xs px-2.5 py-1.5 rounded-lg border border-border/40 hover:bg-muted/50 font-medium transition">
              Load sample
            </button>
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border/40 hover:bg-muted/50 font-medium transition">
              <Upload className="w-3.5 h-3.5" /> Upload CSV
            </button>
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={loadFile} />
          </div>
        </div>

        <textarea
          value={csvText}
          onChange={(e) => { setCsvText(e.target.value); setParseError(null); }}
          placeholder={`Name,Email,Phone,Company,Title\nAhmed Al-Rashidi,ahmed@bank.ae,+971501234567,First National Bank,Head of Wealth`}
          className="w-full h-28 rounded-xl bg-muted/40 border border-border/40 focus:border-[#B8A0C8] focus:ring-1 focus:ring-[#B8A0C8] outline-none resize-none px-3 py-2 text-sm font-mono"
        />
        {parseError && (
          <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-3.5 h-3.5" /> {parseError}
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Columns detected: Name, Email, Phone, Company, Title (all optional except Name or Email)
          </div>
          <button
            onClick={parseNow}
            disabled={!csvText.trim()}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition",
              csvText.trim() ? "text-white nf-chameleon-bg shadow-sm" : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <FileText className="w-3.5 h-3.5" /> Parse leads
          </button>
        </div>
      </div>

      {/* Step 2 — batch check */}
      {leads.length > 0 && (
        <div className="glass-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Step 2 — Dedup check</div>
              <div className="text-sm font-semibold mt-0.5">{leads.length} leads staged</div>
            </div>
            <div className="flex items-center gap-2">
              {checkState === "done" && summary && (
                <div className="flex items-center gap-2 text-xs">
                  <Badge color="#88B8B0">{summary.new} new</Badge>
                  {summary.possible > 0 && <Badge color="#C8A880">{summary.possible} possible</Badge>}
                  {summary.duplicates > 0 && <Badge color="#C0A0B8">{summary.duplicates} dupe</Badge>}
                </div>
              )}
              <button
                onClick={runBatchCheck}
                disabled={checkState === "checking"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg shadow-sm disabled:opacity-60"
              >
                {checkState === "checking" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                {checkState === "checking" ? "Checking…" : checkState === "done" ? "Re-check" : "Check against CRM"}
              </button>
            </div>
          </div>

          {/* Filter chips */}
          {checkState === "done" && (
            <div className="flex items-center gap-2 flex-wrap">
              {(["all", "new", "possible", "duplicate"] as const).map((s) => (
                <button key={s} onClick={() => setFilter(s as any)}
                  className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold border transition capitalize",
                    filter === s ? "border-[#B8A0C8] bg-[#B8A0C8]/15 text-[#B8A0C8]" : "border-border/40 hover:bg-muted/50")}>
                  {s === "all" ? `All (${leads.length})` : s === "new" ? `New (${newCount})` : s === "possible" ? `Possible dupe (${possibleCount})` : `Duplicate (${dupCount})`}
                </button>
              ))}
            </div>
          )}

          {/* Lead rows */}
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
            {visible.map((lead) => (
              <StagedRow key={lead.id} lead={lead} checked={checkState === "done"} onToggleExclude={() => toggleExclude(lead.id)} />
            ))}
          </div>

          {checkState !== "done" && leads.length > 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Click "Check against CRM" to screen each lead for duplicates before importing.
            </div>
          )}
        </div>
      )}

      {/* Step 3 — push */}
      {checkState === "done" && (
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Step 3 — Import clean leads</div>
              <div className="text-sm font-semibold mt-0.5">
                {pushState === "done" && pushResult
                  ? `${pushResult.created} contacts created, ${pushResult.skipped} skipped`
                  : `${newCount} new + ${possibleCount} possible-match leads ready to push`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pushState === "done" && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#88B8B0]">
                  <ShieldCheck className="w-4 h-4" /> Pushed to CRM
                </div>
              )}
              {pushState !== "done" && (
                <button
                  onClick={pushNew}
                  disabled={pushState === "pushing" || (newCount + possibleCount) === 0}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition",
                    (newCount + possibleCount) > 0
                      ? "text-white nf-chameleon-bg shadow-sm disabled:opacity-60"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {pushState === "pushing" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  {pushState === "pushing" ? "Pushing…" : `Push ${newCount + possibleCount} leads to CRM`}
                </button>
              )}
            </div>
          </div>
          {(newCount + possibleCount) === 0 && dupCount > 0 && pushState !== "done" && (
            <div className="mt-2 text-xs text-muted-foreground">
              All non-excluded leads are already in your CRM. Duplicates are skipped automatically.
            </div>
          )}
          {pushState === "done" && pushResult && (
            <div className="mt-3 rounded-xl border border-[#88B8B0]/30 bg-[#88B8B0]/10 p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-[#88B8B0]" />
                <span className="text-sm font-semibold">Import complete</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {pushResult.created} new contacts added to your CRM. {dupCount} duplicates were skipped. {pushResult.skipped > 0 && `${pushResult.skipped} rows could not be parsed.`}
              </div>
              <Link href="/contacts" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#88B8B0] hover:underline">
                View contacts <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}

      {!leads.length && (
        <div className="glass-panel p-8 flex flex-col items-center text-center text-muted-foreground">
          <Upload className="w-10 h-10 mb-3 text-[#B8A0C8]/50" />
          <div className="text-sm font-semibold">No leads staged yet</div>
          <div className="text-xs mt-1">Paste a CSV above or click "Load sample" to see how it works.</div>
        </div>
      )}
    </div>
  );
}

// ─── Staged row ───────────────────────────────────────────────────────────────
function StagedRow({ lead, checked, onToggleExclude }: {
  lead: StagedLead;
  checked: boolean;
  onToggleExclude: () => void;
}) {
  const statusColor: Record<string, string> = {
    new: "#88B8B0",
    possible: "#C8A880",
    duplicate: "#C0A0B8",
    excluded: "#888",
  };
  const statusLabel: Record<string, string> = {
    new: "New",
    possible: "Possible match",
    duplicate: "Duplicate",
    excluded: "Excluded",
  };
  const effective = lead.exclude ? "excluded" : (lead.status ?? "new");
  const color = statusColor[effective] ?? "#88B8B0";

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-xl border transition",
      lead.exclude ? "opacity-40 border-border/20" : "border-border/30 hover:border-[#B8A0C8]/30 hover:bg-[#B8A0C8]/5"
    )}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
        style={{ background: `${color}20`, color }}>
        {lead.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold truncate">{lead.name}</span>
          {lead.title && <span className="text-[11px] text-muted-foreground truncate">· {lead.title}</span>}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">
          {[lead.company, lead.email, lead.phone].filter(Boolean).join(" · ")}
        </div>
        {checked && lead.match_reason && (
          <div className="text-[11px] mt-0.5" style={{ color }}>
            {lead.status === "duplicate" ? "↳ Matches" : "↳ Possible"}: {lead.match_name} — {lead.match_reason}
          </div>
        )}
      </div>
      {checked && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
          {lead.exclude ? "excluded" : statusLabel[lead.status ?? "new"]}
        </span>
      )}
      {checked && lead.contact_id && !lead.exclude && (
        <Link href={`/contacts/${lead.contact_id}`}
          className="text-[10px] text-muted-foreground hover:text-foreground underline flex-shrink-0">
          View
        </Link>
      )}
      <button
        onClick={onToggleExclude}
        title={lead.exclude ? "Include this lead" : "Exclude from import"}
        className="ml-1 p-1 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition"
      >
        {lead.exclude ? <Plus className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ─── DupGroupCard ─────────────────────────────────────────────────────────────
function DupGroupCard({ group, onMerge, merging }: {
  group: DupGroup;
  onMerge: (survivor: string, dupes: string[]) => void;
  merging: boolean;
}) {
  const sorted = [...group.contacts].sort((a, b) => (b.lead_score ?? 0) - (a.lead_score ?? 0));
  const [survivorId, setSurvivorId] = useState(sorted[0].id);
  const dupes = group.contacts.filter((c) => c.id !== survivorId).map((c) => c.id);

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="font-semibold">{group.reason}</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
              {Math.round(group.confidence * 100)}% confidence
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {group.contacts.length} records — pick the survivor to keep.
          </p>
        </div>
        <button
          disabled={merging || !dupes.length}
          onClick={() => onMerge(survivorId, dupes)}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
        >
          {merging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Merge className="w-4 h-4" />}
          {merging ? "Merging…" : `Merge ${dupes.length} into survivor`}
        </button>
      </div>

      <div className="grid gap-2">
        {group.contacts.map((c) => {
          const isSurvivor = c.id === survivorId;
          return (
            <label key={c.id} className={cn(
              "rounded-xl border p-3 cursor-pointer transition flex items-center gap-3",
              isSurvivor ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
            )}>
              <input type="radio" checked={isSurvivor} onChange={() => setSurvivorId(c.id)} className="accent-primary" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/contacts/${c.id}`} className="font-medium hover:underline">
                    {c.first_name} {c.last_name}
                  </Link>
                  {isSurvivor && <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">Survivor</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  {c.title ?? "—"} · {c.email ?? "no email"} · {c.phone ?? "no phone"}
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="font-semibold">Score {Math.round(c.lead_score ?? 0)}</div>
                <div className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────
function StatCard({ label, value, accent, icon }: { label: string; value: any; accent: string; icon: React.ReactNode }) {
  return (
    <div className="glass-panel p-3">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold mt-1" style={{ color: accent }}>{value}</div>
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${color}25`, color }}>
      {children}
    </span>
  );
}
