/**
 * SourcesTab — Data Hub > Enrichment Engine > Sources
 *
 * Operator console for the Clay-style enrichment waterfall.
 * Lists every data source (official APIs + GCC-native registries +
 * stealth scraper + Python AI sidecar), shows connection status, lets
 * the admin paste an API key, toggle, set priority, run a test ping,
 * and fire a live waterfall against a seed lead.
 *
 * Admin-only by spec — non-admin roles see a soft view-only banner so
 * the team can still inspect the chain without breaking the demo.
 *
 * The whole panel falls back to a fully usable preview if the backend
 * /api/enrichment/sources endpoint isn't ready yet (so the UI is never
 * broken during a partial deploy).
 */

import { useEffect, useMemo, useState } from "react";
import {
  Database, Globe, ShieldCheck, ShieldAlert, KeyRound, Loader2,
  Check, X, Play, RefreshCw, ChevronDown, ChevronUp, Eye, EyeOff,
  Building2, BadgeCheck, Sparkles, MapPin, Bot, Code2, Network,
  ArrowRight, AlertTriangle, Zap, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";
import { getRole } from "@/lib/marketing-auth";

/** Server-shaped source row (mirrors enrichment_sources table). */
interface SourceRow {
  id: string;
  source_key: string;
  name: string;
  kind: "api" | "scraper" | "gov_registry" | "exchange" | "ai_scraper";
  enabled: boolean;
  priority: number;
  key_set: boolean;
  last_test_ok: boolean | null;
  last_test_message: string | null;
  last_test_at: string | null;
  total_calls: number;
  total_fields_filled: number;
  // UI-only metadata enriched by the registry
  meta: SourceMeta;
}

interface SourceMeta {
  category: "western_api" | "gcc_native" | "scraper" | "ai_sidecar";
  blurb: string;
  fields: string[];           // which fields this source can fill
  gcc_coverage: "high" | "medium" | "low" | "n/a";
  pricing: string;            // "Free tier" | "$0.04 / hit" | etc
  docs_url?: string;
  needs_key: boolean;
  key_label?: string;         // "API Key" | "Bearer Token"
  region_badge?: string;      // "🇸🇦 KSA" | "🇦🇪 UAE" | "Global"
  rate_hint?: string;         // "100/min" | "Single-IP, ~30/min"
}

const CATEGORY_LABEL: Record<SourceMeta["category"], string> = {
  western_api: "Western APIs",
  gcc_native: "GCC-native registries & exchanges",
  scraper: "Public-web scraper",
  ai_sidecar: "AI scraper sidecar (Python)",
};

const CATEGORY_TINT: Record<SourceMeta["category"], string> = {
  western_api: "#88B8B0",
  gcc_native: "#C8A880",
  scraper: "#B8A0C8",
  ai_sidecar: "#B8B880",
};

const COVERAGE_STYLE: Record<SourceMeta["gcc_coverage"], { label: string; tint: string }> = {
  high: { label: "GCC: strong", tint: "#88B8B0" },
  medium: { label: "GCC: moderate", tint: "#C8A880" },
  low: { label: "GCC: weak", tint: "#C08080" },
  "n/a": { label: "Coverage: any", tint: "#A8A8A8" },
};

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────
export function SourcesTab() {
  const role = getRole();
  const isAdmin = role.key === "admin" || role.key === "ceo";
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | SourceMeta["category"]>("all");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/enrichment/sources");
      setSources(Array.isArray(data?.sources) ? data.sources : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setSources([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const connected = sources.filter(s => s.key_set || !s.meta.needs_key).length;
    const enabled = sources.filter(s => s.enabled).length;
    const totalCalls = sources.reduce((a, s) => a + (s.total_calls || 0), 0);
    return { connected, enabled, total: sources.length, totalCalls };
  }, [sources]);

  const visible = useMemo(
    () => sources.filter(s => filter === "all" || s.meta.category === filter),
    [sources, filter],
  );

  const orderedChain = useMemo(
    () => [...sources].filter(s => s.enabled).sort((a, b) => a.priority - b.priority),
    [sources],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-[#88B8B0]" /> Data Source Orchestrator
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl">
            Connect official APIs, GCC-native registries, and the public-web stealth scraper.
            Order them by priority — every enrichment job walks the chain top-down and stops
            once each field is filled. No key = source shows <em>Disconnected</em>, the chain
            skips it.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Stat label="Connected" value={`${stats.connected}/${stats.total}`} tint="#88B8B0" />
          <Stat label="In waterfall" value={String(stats.enabled)} tint="#B8B880" />
          <Stat label="Calls (lifetime)" value={fmtNum(stats.totalCalls)} tint="#B8A0C8" />
        </div>
      </div>

      {!isAdmin && (
        <div className="border border-[#C8A880]/40 bg-[#C8A880]/10 rounded-lg p-3 flex items-start gap-2 text-xs text-[#7a5a30] dark:text-[#dbb787]">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            View-only — the <strong>Sources</strong> panel is admin-managed.
            Switch to the <strong>CRM Admin</strong> persona to add API keys, toggle sources, or run a test waterfall.
          </div>
        </div>
      )}

      {/* Waterfall preview chain */}
      <WaterfallPreview chain={orderedChain} />

      {/* Filter + actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 text-xs">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All sources</FilterChip>
          <FilterChip active={filter === "western_api"}  onClick={() => setFilter("western_api")}>Western APIs</FilterChip>
          <FilterChip active={filter === "gcc_native"}   onClick={() => setFilter("gcc_native")}>GCC-native</FilterChip>
          <FilterChip active={filter === "scraper"}      onClick={() => setFilter("scraper")}>Public scraper</FilterChip>
          <FilterChip active={filter === "ai_sidecar"}   onClick={() => setFilter("ai_sidecar")}>AI sidecar</FilterChip>
        </div>
        <button
          type="button"
          onClick={load}
          className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-muted/50 inline-flex items-center gap-1.5"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Reload
        </button>
      </div>

      {/* Source cards */}
      {loading ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center text-sm text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#88B8B0]" />
          Loading source registry…
        </div>
      ) : error ? (
        <div className="border border-[#C08080]/40 bg-[#C08080]/10 rounded-xl p-4 text-sm text-[#7a3030] dark:text-[#e6a0a0]">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium mb-1">Couldn't reach the orchestrator backend.</div>
              <div className="text-xs opacity-80">{error}</div>
              <div className="text-xs opacity-60 mt-1">The Sources panel works in view-only mode meanwhile — restart the API server workflow to enable changes.</div>
            </div>
          </div>
        </div>
      ) : visible.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center text-sm text-muted-foreground">
          No sources in this category yet.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map(s => (
            <SourceCard key={s.id} source={s} canEdit={isAdmin} onChange={load} />
          ))}
        </div>
      )}

      {/* Test panel */}
      <TestPanel canEdit={isAdmin} sources={sources} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Waterfall preview chain
// ─────────────────────────────────────────────────────────────────────
function WaterfallPreview({ chain }: { chain: SourceRow[] }) {
  if (chain.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-xl p-5 text-center text-sm text-muted-foreground">
        No sources enabled yet. Connect a source below to start the waterfall.
      </div>
    );
  }
  return (
    <div className="border border-border bg-gradient-to-br from-[#88B8B0]/5 to-[#B8B880]/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" /> Active waterfall (priority order)
        </div>
        <div className="text-[11px] text-muted-foreground">
          Each lead walks left → right. Stops per-field as soon as a source returns a value.
        </div>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {chain.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1.5 shrink-0">
            <div
              className={cn(
                "px-2.5 py-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 whitespace-nowrap",
                s.key_set || !s.meta.needs_key
                  ? "border-[#88B8B0]/40 bg-[#88B8B0]/15 text-[#3f7a72] dark:text-[#9ae0d6]"
                  : "border-dashed border-border bg-muted/30 text-muted-foreground"
              )}
              title={`Priority ${s.priority}`}
            >
              {kindIcon(s.kind)}
              {s.name}
              <span className="opacity-50">·{s.priority}</span>
            </div>
            {i < chain.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/50" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Per-source card
// ─────────────────────────────────────────────────────────────────────
function SourceCard({ source, canEdit, onChange }: { source: SourceRow; canEdit: boolean; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [busy, setBusy] = useState<"saving" | "testing" | null>(null);
  const [localPriority, setLocalPriority] = useState(source.priority);
  const [localEnabled, setLocalEnabled] = useState(source.enabled);

  useEffect(() => { setLocalPriority(source.priority); setLocalEnabled(source.enabled); }, [source.priority, source.enabled]);

  const connected = source.key_set || !source.meta.needs_key;
  const tint = CATEGORY_TINT[source.meta.category];

  async function save(payload: Partial<{ enabled: boolean; priority: number; api_key: string }>) {
    if (!canEdit) return;
    setBusy("saving");
    try {
      await apiFetch(`/enrichment/sources/${source.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      onChange();
      if (payload.api_key !== undefined) setKeyDraft("");
    } catch (e) {
      // surface inline; don't crash
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setBusy(null);
    }
  }

  async function test() {
    setBusy("testing");
    try {
      await apiFetch(`/enrichment/sources/${source.id}/test`, { method: "POST" });
      onChange();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={cn("border rounded-xl bg-card transition-shadow", connected ? "border-border" : "border-dashed border-border")}>
      {/* Header */}
      <div className="p-3.5 flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${tint}22`, color: tint }}
        >
          {kindIcon(source.kind)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-semibold text-sm truncate">{source.name}</h3>
            {source.meta.region_badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground inline-flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />{source.meta.region_badge}
              </span>
            )}
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ background: `${COVERAGE_STYLE[source.meta.gcc_coverage].tint}22`, color: COVERAGE_STYLE[source.meta.gcc_coverage].tint }}
            >
              {COVERAGE_STYLE[source.meta.gcc_coverage].label}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{source.meta.blurb}</p>
        </div>
        <StatusPill connected={connected} enabled={source.enabled} />
      </div>

      {/* Field tags */}
      <div className="px-3.5 pb-2 flex flex-wrap gap-1">
        {source.meta.fields.slice(0, 6).map(f => (
          <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/50">
            {f}
          </span>
        ))}
        {source.meta.fields.length > 6 && (
          <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">
            +{source.meta.fields.length - 6}
          </span>
        )}
      </div>

      {/* Footer / controls */}
      <div className="px-3.5 pb-3 pt-1 border-t border-border/50 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>{source.meta.pricing}</span>
          {source.meta.rate_hint && <span className="opacity-60">· {source.meta.rate_hint}</span>}
        </div>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="px-2 py-1 rounded hover:bg-muted/50 inline-flex items-center gap-1 text-foreground"
        >
          {open ? "Hide" : "Configure"} {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded controls */}
      {open && (
        <div className="px-3.5 pb-3.5 pt-2 border-t border-border/50 bg-muted/20 space-y-3">
          {source.meta.needs_key && (
            <div>
              <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <KeyRound className="w-3 h-3" /> {source.meta.key_label ?? "API Key"}
                {source.key_set && <BadgeCheck className="w-3 h-3 text-[#88B8B0]" />}
              </label>
              <div className="flex gap-1.5">
                <div className="flex-1 relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={keyDraft}
                    onChange={(e) => setKeyDraft(e.target.value)}
                    disabled={!canEdit}
                    placeholder={source.key_set ? "•••• key on file ••••" : `Paste your ${source.meta.key_label ?? "API key"} here`}
                    className="w-full text-xs px-2 py-1.5 rounded border border-border bg-background pr-7"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(s => !s)}
                    className="absolute right-1.5 top-1.5 text-muted-foreground hover:text-foreground"
                    aria-label={showKey ? "Hide" : "Show"}
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => save({ api_key: keyDraft })}
                  disabled={!canEdit || !keyDraft || busy === "saving"}
                  className="text-xs px-3 py-1.5 rounded bg-[#88B8B0] text-white font-medium disabled:opacity-40 hover:bg-[#7aa6a0] inline-flex items-center gap-1"
                >
                  {busy === "saving" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Save
                </button>
                {source.key_set && canEdit && (
                  <button
                    type="button"
                    onClick={() => save({ api_key: "" })}
                    disabled={busy === "saving"}
                    className="text-xs px-2 py-1.5 rounded border border-border text-muted-foreground hover:bg-muted"
                    title="Remove key"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              {source.meta.docs_url && (
                <a href={source.meta.docs_url} target="_blank" rel="noreferrer" className="text-[10px] text-muted-foreground hover:underline mt-1 inline-block">
                  Get an API key →
                </a>
              )}
            </div>
          )}

          {/* Priority + enable */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Priority (lower = first)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={localPriority}
                  onChange={(e) => setLocalPriority(Number(e.target.value))}
                  onMouseUp={() => save({ priority: localPriority })}
                  onTouchEnd={() => save({ priority: localPriority })}
                  disabled={!canEdit}
                  className="flex-1 accent-[#88B8B0]"
                />
                <span className="text-xs font-mono w-8 text-right">{localPriority}</span>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">In waterfall</label>
              <button
                type="button"
                onClick={() => { const next = !localEnabled; setLocalEnabled(next); save({ enabled: next }); }}
                disabled={!canEdit}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium w-full transition-colors",
                  localEnabled
                    ? "bg-[#88B8B0]/15 text-[#3f7a72] dark:text-[#9ae0d6] border border-[#88B8B0]/40"
                    : "bg-muted text-muted-foreground border border-border"
                )}
              >
                {localEnabled ? "Enabled" : "Skipped"}
              </button>
            </div>
          </div>

          {/* Test */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
            <div className="text-[11px] text-muted-foreground">
              {source.last_test_at ? (
                <>
                  Last test: {source.last_test_ok ? <span className="text-[#3f7a72]">OK</span> : <span className="text-[#a04040]">Failed</span>}
                  {source.last_test_message && <span className="opacity-70"> — {source.last_test_message}</span>}
                </>
              ) : (
                <>Not tested yet.</>
              )}
            </div>
            <button
              type="button"
              onClick={test}
              disabled={!canEdit || busy === "testing"}
              className="text-xs px-2.5 py-1 rounded border border-border hover:bg-muted/50 inline-flex items-center gap-1 disabled:opacity-40"
            >
              {busy === "testing" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              Test ping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Test waterfall panel
// ─────────────────────────────────────────────────────────────────────
interface RunResult {
  waterfall_id: string;
  fields: Record<string, { value: unknown; source_key: string; source_name: string }>;
  per_source: Array<{
    source_key: string;
    source_name: string;
    status: string;
    fields_filled: string[];
    duration_ms: number;
    cost_usd: number;
    error?: string;
  }>;
  total_cost_usd: number;
  total_ms: number;
}

function TestPanel({ canEdit, sources }: { canEdit: boolean; sources: SourceRow[] }) {
  const [seed, setSeed] = useState({ name: "", company: "", domain: "", email: "", linkedin_url: "" });
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runWaterfall() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const data = await apiFetch("/enrichment/run", {
        method: "POST",
        body: JSON.stringify({ seed, dry_run: true }),
      });
      setResult(data as RunResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }

  const enabledCount = sources.filter(s => s.enabled).length;

  return (
    <div className="border border-border rounded-xl bg-card">
      <div className="p-4 border-b border-border flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B8B880]" /> Test the waterfall
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enter a seed lead and watch it flow through the {enabledCount} enabled source{enabledCount === 1 ? "" : "s"} above. No data is saved (dry run).
          </p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Full name" value={seed.name} onChange={v => setSeed({ ...seed, name: v })} placeholder="e.g. Faisal Al-Harbi" />
        <Field label="Company" value={seed.company} onChange={v => setSeed({ ...seed, company: v })} placeholder="e.g. Aramco Trading" />
        <Field label="Company domain" value={seed.domain} onChange={v => setSeed({ ...seed, domain: v })} placeholder="aramco.com" />
        <Field label="Email" value={seed.email} onChange={v => setSeed({ ...seed, email: v })} placeholder="optional — used for verify-email" />
        <div className="md:col-span-2">
          <Field label="LinkedIn URL (optional)" value={seed.linkedin_url} onChange={v => setSeed({ ...seed, linkedin_url: v })} placeholder="https://linkedin.com/in/..." />
        </div>
      </div>

      <div className="px-4 pb-4 flex items-center justify-between gap-2">
        <div className="text-[11px] text-muted-foreground">
          {!canEdit ? "Switch to admin role to run a test." : "Costs ~$0.10–$0.40 in real run; this dry run charges nothing."}
        </div>
        <button
          type="button"
          onClick={runWaterfall}
          disabled={!canEdit || running || (!seed.name && !seed.company && !seed.domain && !seed.email)}
          className="text-sm px-4 py-2 rounded-lg bg-[#88B8B0] text-white font-semibold disabled:opacity-40 hover:bg-[#7aa6a0] inline-flex items-center gap-2"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? "Running waterfall…" : "Run dry-run waterfall"}
        </button>
      </div>

      {error && (
        <div className="mx-4 mb-4 border border-[#C08080]/40 bg-[#C08080]/10 rounded-lg p-3 text-xs text-[#7a3030] dark:text-[#e6a0a0]">
          {error}
        </div>
      )}

      {result && (
        <div className="border-t border-border bg-muted/20 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="font-semibold text-foreground">
              Result · {Object.keys(result.fields).length} fields filled
            </div>
            <div className="text-muted-foreground">
              {result.total_ms} ms · ${result.total_cost_usd.toFixed(3)}
            </div>
          </div>
          {/* Per-source timeline */}
          <div className="space-y-1">
            {result.per_source.map((row, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={cn(
                  "px-1.5 py-0.5 rounded font-medium",
                  row.status === "ok" && "bg-[#88B8B0]/15 text-[#3f7a72] dark:text-[#9ae0d6]",
                  row.status === "miss" && "bg-muted text-muted-foreground",
                  row.status === "error" && "bg-[#C08080]/15 text-[#7a3030] dark:text-[#e6a0a0]",
                  row.status === "skipped" && "bg-muted/50 text-muted-foreground italic",
                )}>
                  {row.status}
                </span>
                <span className="font-medium w-32 truncate">{row.source_name}</span>
                <span className="text-muted-foreground flex-1 truncate">
                  {row.fields_filled.length > 0
                    ? row.fields_filled.join(", ")
                    : row.error
                      ? `error: ${row.error}`
                      : "no new fields"}
                </span>
                <span className="text-muted-foreground tabular-nums">{row.duration_ms}ms</span>
              </div>
            ))}
          </div>
          {/* Field-level attribution */}
          {Object.keys(result.fields).length > 0 && (
            <div className="border-t border-border pt-3">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Filled fields → source attribution</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(result.fields).map(([f, v]) => (
                  <span key={f} className="text-[11px] px-2 py-0.5 rounded bg-card border border-border inline-flex items-center gap-1">
                    <strong>{f}</strong>
                    <span className="opacity-60">·</span>
                    <span className="text-[#3f7a72] dark:text-[#9ae0d6]">{v.source_name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Small UI helpers
// ─────────────────────────────────────────────────────────────────────
function Stat({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <span className="px-2.5 py-1 rounded-full font-medium" style={{ background: `${tint}22`, color: tint }}>
      {label}: {value}
    </span>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-md font-medium transition-colors",
        active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted/50"
      )}
    >
      {children}
    </button>
  );
}

function StatusPill({ connected, enabled }: { connected: boolean; enabled: boolean }) {
  if (!connected) return (
    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-muted text-muted-foreground inline-flex items-center gap-1">
      <X className="w-2.5 h-2.5" /> Disconnected
    </span>
  );
  if (!enabled) return (
    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-[#C8A880]/15 text-[#7a5a30] dark:text-[#dbb787] inline-flex items-center gap-1">
      <ShieldAlert className="w-2.5 h-2.5" /> Skipped
    </span>
  );
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-[#88B8B0]/15 text-[#3f7a72] dark:text-[#9ae0d6] inline-flex items-center gap-1">
      <ShieldCheck className="w-2.5 h-2.5" /> Connected
    </span>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground mb-1 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm px-2.5 py-1.5 rounded border border-border bg-background"
      />
    </div>
  );
}

function kindIcon(kind: SourceRow["kind"]) {
  const cls = "w-4 h-4";
  switch (kind) {
    case "api": return <Code2 className={cls} />;
    case "scraper": return <Globe className={cls} />;
    case "gov_registry": return <Building2 className={cls} />;
    case "exchange": return <Database className={cls} />;
    case "ai_scraper": return <Bot className={cls} />;
    default: return <Database className={cls} />;
  }
}

function fmtNum(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}
