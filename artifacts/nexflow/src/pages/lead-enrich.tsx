import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/useApi";
import { Link } from "wouter";
import { Sparkles, ScanLine, Loader2, CheckCircle2, AlertTriangle, ChevronRight, Building2, Mail, Phone, Linkedin, Briefcase, Tag } from "lucide-react";

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
  const [savedContactId, setSavedContactId] = useState<string | null>(null);

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
              onClick={() => { setResult(null); setSavedContactId(null); enrich.mutate(false); }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {enrich.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Enrich (preview)
            </button>
            <button
              disabled={!isReady || enrich.isPending}
              onClick={() => { setResult(null); setSavedContactId(null); enrich.mutate(true); }}
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
                <Info icon={Building2} label="Company" value={enriched.company?.name} />
                <Info icon={Briefcase} label="Industry" value={enriched.company?.industry} />
                <Info icon={Mail} label="Email" value={enriched.email} />
                <Info icon={Phone} label="Phone" value={enriched.phone} />
                <Info icon={Linkedin} label="LinkedIn" value={enriched.linkedin_url} />
                <Info icon={Tag} label="Persona" value={enriched.persona} />
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

function Info({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
        <div className="truncate font-medium">{value || "—"}</div>
      </div>
    </div>
  );
}
