import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/useApi";
import { Link } from "wouter";
import { Sparkles, ScanLine, Loader2, CheckCircle2, AlertTriangle, ChevronRight, Building2, Mail, Phone, Linkedin, Briefcase, Tag, Layers, Clock, DollarSign } from "lucide-react";

type WaterfallField = { value: unknown; source_key: string; source_name: string };
type WaterfallPerSource = {
  source_key: string;
  source_name: string;
  status: "ok" | "miss" | "error" | "skipped";
  fields_filled: string[];
  duration_ms: number;
  cost_usd: number;
  error?: string;
};
type WaterfallResult = {
  waterfall_id: string;
  fields: Record<string, WaterfallField>;
  per_source: WaterfallPerSource[];
  total_cost_usd: number;
  total_ms: number;
};

// Map of UI field id -> waterfall field key (the orchestrator's `Field` enum)
const SOURCE_FIELD_MAP: Record<string, string[]> = {
  email: ["email", "email_work", "email_personal"],
  phone: ["phone", "phone_mobile", "phone_work"],
  linkedin_url: ["linkedin_url"],
  company_name: ["company_name"],
  company_industry: ["company_industry"],
  persona: ["persona", "title"],
};

function findFieldSource(
  wf: WaterfallResult | null,
  uiKey: string,
  displayedValue: string | null | undefined,
): WaterfallField | null {
  if (!wf || !displayedValue) return null;
  const candidates = SOURCE_FIELD_MAP[uiKey] ?? [uiKey];
  const target = String(displayedValue).trim().toLowerCase();
  if (!target) return null;
  for (const k of candidates) {
    const f = wf.fields[k];
    if (!f || f.value == null) continue;
    // Only attribute when the waterfall actually returned the SAME value
    // we're displaying — otherwise we'd be falsely crediting Hunter/Lusha
    // for an AI-inferred value from /lead-enrich/quick.
    if (String(f.value).trim().toLowerCase() === target) return f;
  }
  return null;
}

export default function LeadEnrichPage() {
  const qc = useQueryClient();
  const [seed, setSeed] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    linkedin_url: "",
    notes: "",
  });
  const [result, setResult] = useState<any>(null);
  const [waterfall, setWaterfall] = useState<WaterfallResult | null>(null);
  const [savedContactId, setSavedContactId] = useState<string | null>(null);

  const runWaterfall = useMutation({
    mutationFn: () => {
      const domain = seed.email.includes("@") ? seed.email.split("@")[1]?.toLowerCase() : undefined;
      return apiFetch(`/enrichment/run`, {
        method: "POST",
        body: JSON.stringify({
          seed: {
            full_name: seed.name || undefined,
            email: seed.email || undefined,
            phone: seed.phone || undefined,
            company: seed.company || undefined,
            domain,
            linkedin_url: seed.linkedin_url || undefined,
            notes: seed.notes || undefined,
          },
          dry_run: true,
        }),
      });
    },
    onSuccess: (r) => setWaterfall(r as WaterfallResult),
  });

  const enrich = useMutation({
    mutationFn: (save: boolean) =>
      apiFetch(`/lead-enrich/quick`, {
        method: "POST",
        body: JSON.stringify({ ...seed, save }),
      }),
    onSuccess: (r) => {
      setResult(r);
      if (r.saved) {
        setSavedContactId(r.contact_id);
        qc.invalidateQueries({ queryKey: ["contacts"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
      }
      // Kick off the source-attributed waterfall in parallel — preview only
      // so the result panel can show "email · Hunter", "phone · Lusha", etc.
      runWaterfall.mutate();
    },
  });

  const isReady = Object.values(seed).some((v) => v.trim().length);
  const enriched = result?.enriched;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quick Lead Enrichment</h1>
        <p className="text-muted-foreground mt-1">
          Drop in just a name, email, or business card text — AI fills in the company, title, persona, tags, and recommended next actions.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* INPUT */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ScanLine className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Seed data</h2>
            <span className="text-xs text-muted-foreground">Provide any one or many</span>
          </div>
          <Field label="Full name" value={seed.name} onChange={(v) => setSeed({ ...seed, name: v })} placeholder="e.g. Khalid Al-Saud" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" value={seed.email} onChange={(v) => setSeed({ ...seed, email: v })} placeholder="khalid@firm.com" />
            <Field label="Phone" value={seed.phone} onChange={(v) => setSeed({ ...seed, phone: v })} placeholder="+971 50 ..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company" value={seed.company} onChange={(v) => setSeed({ ...seed, company: v })} placeholder="Emirates Capital" />
            <Field label="LinkedIn URL" value={seed.linkedin_url} onChange={(v) => setSeed({ ...seed, linkedin_url: v })} placeholder="linkedin.com/in/..." />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Free-text notes (e.g. business card OCR, conference bio)</label>
            <textarea
              value={seed.notes}
              onChange={(e) => setSeed({ ...seed, notes: e.target.value })}
              placeholder="Met at GITEX. Mentioned interest in Q2 expansion to KSA."
              className="w-full mt-1 rounded-xl border border-border bg-background px-3 py-2 text-sm min-h-[100px]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              disabled={!isReady || enrich.isPending}
              onClick={() => { setResult(null); setWaterfall(null); setSavedContactId(null); enrich.mutate(false); }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {enrich.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Enrich (preview)
            </button>
            <button
              disabled={!isReady || enrich.isPending}
              onClick={() => { setResult(null); setWaterfall(null); setSavedContactId(null); enrich.mutate(true); }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Enrich + save to CRM
            </button>
          </div>

          {enrich.isError && (
            <div className="text-xs text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" /> {(enrich.error as any)?.message ?? "Something went wrong"}
            </div>
          )}
        </div>

        {/* RESULT */}
        <div className="glass-card rounded-2xl p-6 min-h-[400px]">
          {!enriched && !enrich.isPending && (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <Sparkles className="w-10 h-10 mb-3 opacity-40" />
              <div className="text-sm">Enriched profile will appear here.</div>
            </div>
          )}
          {enrich.isPending && (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {enriched && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold">{enriched.first_name} {enriched.last_name}</div>
                  <div className="text-sm text-muted-foreground">{enriched.title ?? "—"}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Lead score</div>
                  <div className="text-3xl font-bold">{Math.round(enriched.lead_score ?? 0)}</div>
                </div>
              </div>

              {enriched.summary && (
                <p className="text-sm">{enriched.summary}</p>
              )}

              <div className="grid grid-cols-2 gap-2 text-sm">
                <Info icon={Building2} label="Company" value={enriched.company?.name} source={findFieldSource(waterfall, "company_name", enriched.company?.name)} />
                <Info icon={Briefcase} label="Industry" value={enriched.company?.industry} source={findFieldSource(waterfall, "company_industry", enriched.company?.industry)} />
                <Info icon={Mail} label="Email" value={enriched.email} source={findFieldSource(waterfall, "email", enriched.email)} />
                <Info icon={Phone} label="Phone" value={enriched.phone} source={findFieldSource(waterfall, "phone", enriched.phone)} />
                <Info icon={Linkedin} label="LinkedIn" value={enriched.linkedin_url} source={findFieldSource(waterfall, "linkedin_url", enriched.linkedin_url)} />
                <Info icon={Tag} label="Persona" value={enriched.persona} source={findFieldSource(waterfall, "persona", enriched.persona)} />
              </div>

              {Array.isArray(enriched.tags) && enriched.tags.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {enriched.tags.map((t: string) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(enriched.next_actions) && enriched.next_actions.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Recommended next actions</div>
                  <ul className="space-y-1">
                    {enriched.next_actions.map((a: any, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 mt-1 text-primary" />
                        <span><span className="font-medium uppercase text-xs">{a.action}</span> — {a.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Source attribution panel */}
              <SourcesPanel waterfall={waterfall} loading={runWaterfall.isPending} />

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Confidence: {Math.round(enriched.confidence ?? 0)}%</span>
                {savedContactId ? (
                  <Link href={`/contacts/${savedContactId}`} className="text-primary font-medium flex items-center gap-1">
                    Open contact <ChevronRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <span>Preview only — click "Enrich + save" to add to CRM.</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1 rounded-xl border border-border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}

function Info({ icon: Icon, label, value, source }: { icon: any; label: string; value?: string | null; source?: WaterfallField | null }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase text-muted-foreground">{label}</span>
          {source && value ? (
            <span
              className="text-[9px] uppercase tracking-wide px-1.5 py-px rounded-full bg-primary/10 text-primary border border-primary/20"
              title={`Filled by ${source.source_name}`}
            >
              {source.source_name}
            </span>
          ) : null}
        </div>
        <div className="truncate font-medium">{value || "—"}</div>
      </div>
    </div>
  );
}

function SourcesPanel({ waterfall, loading }: { waterfall: WaterfallResult | null; loading: boolean }) {
  if (!waterfall && !loading) return null;
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          <Layers className="w-3.5 h-3.5 text-primary" />
          Waterfall sources
        </div>
        {waterfall ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{waterfall.total_ms}ms</span>
            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${waterfall.total_cost_usd.toFixed(4)}</span>
          </div>
        ) : (
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        )}
      </div>
      {waterfall && (
        <div className="space-y-1">
          {waterfall.per_source.filter((s) => s.status === "ok" || s.fields_filled.length > 0).map((s) => (
            <div key={s.source_key} className="flex items-center justify-between text-xs">
              <span className="font-medium">{s.source_name}</span>
              <span className="text-muted-foreground">
                {s.fields_filled.length > 0 ? s.fields_filled.join(", ") : "no new fields"} · {s.duration_ms}ms
              </span>
            </div>
          ))}
          {waterfall.per_source.every((s) => s.status !== "ok") && (
            <div className="text-xs text-muted-foreground italic">
              No external sources returned new fields — connect API keys in Data Hub › Enrichment Engine › Sources to power the waterfall.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
