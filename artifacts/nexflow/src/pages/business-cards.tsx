import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ScanLine, Upload, Camera, Sparkles, User, Mail, Phone, Building2,
  Globe, MapPin, Linkedin, Languages, Wand2, ArrowRight, Loader2,
  Check, X, FileImage, AlertCircle, Trash2, RefreshCw, Hash,
  ShieldAlert, ShieldCheck, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";

const FIELD_META: Record<string, { label: string; icon: any }> = {
  name_en:  { label: "Name (English)",  icon: User },
  name_ar:  { label: "Name (Arabic)",   icon: Languages },
  title:    { label: "Title",           icon: User },
  company:  { label: "Company",         icon: Building2 },
  company_ar: { label: "Company (Arabic)", icon: Languages },
  email:    { label: "Email",           icon: Mail },
  mobile:   { label: "Mobile",          icon: Phone },
  office:   { label: "Office",          icon: Phone },
  fax:      { label: "Fax",             icon: Phone },
  website:  { label: "Website",         icon: Globe },
  address:  { label: "Address",         icon: MapPin },
  city:     { label: "City",            icon: MapPin },
  country:  { label: "Country",         icon: MapPin },
  linkedin: { label: "LinkedIn",        icon: Linkedin },
  twitter:  { label: "Twitter / X",     icon: Hash },
  industry_guess: { label: "Industry",  icon: Building2 },
};

const FIELD_ORDER = [
  "name_en", "name_ar", "title", "company", "email",
  "mobile", "office", "website", "linkedin", "address",
  "city", "country", "industry_guess",
];

type ExtractField = { key: string; confidence: number; bbox?: { x: number; y: number; w: number; h: number } };

export default function BusinessCardsPage() {
  const [, navigate] = useLocation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [scanState, setScanState] = useState<"empty" | "scanning" | "rejected" | "complete" | "error">("empty");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<Record<string, string | null>>({});
  const [confidences, setConfidences] = useState<Record<string, number>>({});
  const [bboxes, setBboxes] = useState<ExtractField[]>([]);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved" | "duplicate" | "approval">("idle");
  const [savedContactId, setSavedContactId] = useState<string | null>(null);
  const [approvalReasons, setApprovalReasons] = useState<string[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => { loadRecent(); }, []);

  async function loadRecent() {
    try {
      const r: any = await apiFetch("/business-cards/recent");
      setRecent(r.scans ?? []);
    } catch {}
  }

  function pickFile() { fileRef.current?.click(); }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, or HEIC)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image too large (max 10MB)");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setImageDataUrl(dataUrl);
      await runScan(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function runScan(dataUrl: string) {
    setScanState("scanning");
    setExtracted({});
    setConfidences({});
    setBboxes([]);
    setSavingState("idle");
    setSavedContactId(null);
    setRejectionReason(null);
    setApprovalReasons([]);
    try {
      const r: any = await apiFetch("/business-cards/scan", {
        method: "POST",
        body: JSON.stringify({ image_data_url: dataUrl }),
      });
      const ex = r.extracted ?? {};

      // Gemini validation check
      if (ex.is_business_card === false) {
        setScanState("rejected");
        setRejectionReason(ex.rejection_reason ?? "This does not appear to be a business card.");
        return;
      }

      const fieldsMap: Record<string, string | null> = {};
      const confMap: Record<string, number> = {};
      for (const k of Object.keys(FIELD_META)) {
        if (ex[k] !== undefined) fieldsMap[k] = ex[k];
      }
      const fields = Array.isArray(ex.fields) ? ex.fields : [];
      for (const f of fields) {
        if (f && typeof f === "object" && f.key) {
          confMap[f.key] = typeof f.confidence === "number" ? f.confidence : 80;
        }
      }
      for (const k of Object.keys(fieldsMap)) {
        if (fieldsMap[k] && confMap[k] === undefined) confMap[k] = 88;
      }
      setExtracted(fieldsMap);
      setConfidences(confMap);
      setBboxes(fields);
      setScanState("complete");
    } catch (err: any) {
      setError(err?.message ?? "Scan failed. Check your connection and try again.");
      setScanState("error");
    }
  }

  function updateField(key: string, value: string) {
    setExtracted((s) => ({ ...s, [key]: value }));
    setConfidences((s) => ({ ...s, [key]: 100 }));
  }

  async function saveContact() {
    setSavingState("saving");
    try {
      const r: any = await apiFetch("/business-cards/save", {
        method: "POST",
        body: JSON.stringify({ extracted }),
      });
      setSavedContactId(r.contact_id);
      if (r.duplicate) {
        setSavingState("duplicate");
      } else if (r.requires_approval) {
        setSavingState("approval");
        setApprovalReasons(r.approval_reasons ?? []);
      } else {
        setSavingState("saved");
      }
      loadRecent();
    } catch (err: any) {
      setError(err?.message ?? "Save failed");
      setSavingState("idle");
    }
  }

  function reset() {
    setImageDataUrl(null);
    setExtracted({});
    setConfidences({});
    setBboxes([]);
    setScanState("empty");
    setSavingState("idle");
    setSavedContactId(null);
    setRejectionReason(null);
    setApprovalReasons([]);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="p-5 space-y-4">
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Business Card Scanner</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold uppercase tracking-wide border border-[#88B8B0]/30">
              Live · Gemini Vision
            </span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            Snap a card — AI validates it's a real business card, extracts fields bilingually, checks ICP fit, then saves to your contacts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {scanState !== "empty" && (
            <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/40 hover:bg-muted/50 transition">
              <RefreshCw className="w-3.5 h-3.5" /> New scan
            </button>
          )}
          <button onClick={pickFile} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg shadow-sm">
            <Upload className="w-3.5 h-3.5" /> Upload card
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-panel p-3 border-[#C0A0B8]/30 bg-[#C0A0B8]/10 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-[#C0A0B8]" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Stat label="TOTAL SCANS" value={recent.length} accent="#B8A0C8" />
        <Stat label="THIS WEEK" value={recent.filter(r => Date.now() - new Date(r.created_at).getTime() < 7*86400_000).length} accent="#88B8B0" />
        <Stat label="AVG CONFIDENCE" value={Object.keys(confidences).length ? `${Math.round(Object.values(confidences).reduce((s, c) => s + c, 0) / Object.keys(confidences).length)}%` : "—"} accent="#C8A880" />
        <Stat label="OCR ENGINE" value="Gemini" accent="#90B8B8" sub="vision AI" />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Card preview */}
        <div className="col-span-5 glass-panel p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Card image</div>
          {!imageDataUrl ? (
            <button onClick={pickFile} className="w-full aspect-[16/10] rounded-xl border-2 border-dashed border-border/50 hover:border-[#B8A0C8] hover:bg-[#B8A0C8]/5 transition flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <FileImage className="w-12 h-12 text-[#B8A0C8]/60" />
              <div className="text-sm font-semibold">Drop card image or click to upload</div>
              <div className="text-xs">JPG, PNG, HEIC · max 10MB</div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <Camera className="w-3.5 h-3.5" /> Mobile camera supported
              </div>
            </button>
          ) : (
            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-muted">
              <img src={imageDataUrl} alt="Card" className="w-full h-full object-contain" />
              {scanState === "scanning" && (
                <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 text-[#B8A0C8] animate-spin" />
                  <div className="text-sm font-semibold">Gemini Vision reading card…</div>
                  <div className="text-xs text-muted-foreground">validating + extracting fields</div>
                </div>
              )}
              {scanState === "rejected" && (
                <div className="absolute inset-0 bg-red-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-4">
                  <XCircle className="w-10 h-10 text-red-400" />
                  <div className="text-sm font-bold text-white text-center">Not a business card</div>
                  <div className="text-xs text-red-300 text-center">{rejectionReason}</div>
                </div>
              )}
              {scanState === "complete" && bboxes.map((f, i) => f.bbox ? (
                <div key={i} className="absolute border-2 border-[#88B8B0] bg-[#88B8B0]/10 rounded"
                  style={{ left: `${f.bbox.x}%`, top: `${f.bbox.y}%`, width: `${f.bbox.w}%`, height: `${f.bbox.h}%` }}
                  title={`${FIELD_META[f.key]?.label ?? f.key} · ${f.confidence}%`}
                />
              ) : null)}
            </div>
          )}

          {scanState === "complete" && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
              <Legend color="#88B8B0" label="High 95+" />
              <Legend color="#B8B880" label="Good 85-94" />
              <Legend color="#C8A880" label="Low <85" />
            </div>
          )}

          {scanState === "rejected" && (
            <div className="mt-3 space-y-2">
              <div className="text-[11px] text-muted-foreground text-center">AI detected this is not a business card</div>
              <button onClick={reset} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-border/40 hover:bg-muted/50 transition">
                <Upload className="w-3.5 h-3.5" /> Try a different image
              </button>
            </div>
          )}
        </div>

        {/* Extracted fields */}
        <div className="col-span-7 glass-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Extracted fields</div>
              <div className="text-sm font-semibold mt-0.5">
                {scanState === "empty" && "Upload a card to begin"}
                {scanState === "scanning" && "Validating + reading…"}
                {scanState === "rejected" && (
                  <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                    <XCircle className="w-4 h-4" /> Invalid image rejected
                  </span>
                )}
                {scanState === "complete" && `${Object.values(extracted).filter(Boolean).length} fields detected`}
                {scanState === "error" && "Scan failed"}
              </div>
            </div>

            {/* Save button area */}
            {scanState === "complete" && savingState === "idle" && (
              <button
                onClick={saveContact}
                disabled={!extracted.name_en}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition",
                  !extracted.name_en ? "bg-muted text-muted-foreground cursor-not-allowed" : "nf-chameleon-bg"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" /> Save as contact
              </button>
            )}
            {savingState === "saving" && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-muted text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
              </div>
            )}
            {savingState === "saved" && (
              <button onClick={() => savedContactId && navigate(`/contacts/${savedContactId}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#88B8B0]/15 text-[#88B8B0] border border-[#88B8B0]/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved · view contact <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {savingState === "duplicate" && (
              <button onClick={() => savedContactId && navigate(`/contacts/${savedContactId}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C8A880]/15 text-[#C8A880] border border-[#C8A880]/30">
                <Check className="w-3.5 h-3.5" /> Duplicate updated <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {savingState === "approval" && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5" /> Pending manager approval
              </div>
            )}
          </div>

          {/* ICP approval warning */}
          {savingState === "approval" && approvalReasons.length > 0 && (
            <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/10 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">Outside target segment — sent for approval</div>
              </div>
              <ul className="space-y-1">
                {approvalReasons.map((r, i) => (
                  <li key={i} className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
              <div className="text-[11px] text-muted-foreground mt-2">
                The contact has been saved with "pending_approval" status. Your sales manager will receive an alert to review.
              </div>
            </div>
          )}

          {scanState === "empty" && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Drop a card on the left or use mobile camera. Fields appear here in seconds.
            </div>
          )}

          {scanState === "scanning" && (
            <div className="space-y-2">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-10 bg-muted/40 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {scanState === "rejected" && (
            <div className="py-12 text-center space-y-3">
              <XCircle className="w-12 h-12 text-red-400 mx-auto" />
              <div className="text-sm font-semibold text-red-600 dark:text-red-400">Image rejected — not a business card</div>
              <div className="text-xs text-muted-foreground max-w-sm mx-auto">{rejectionReason}</div>
              <div className="text-xs text-muted-foreground">Please upload a real business card with a person's name and contact details.</div>
            </div>
          )}

          {scanState === "complete" && (
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
              {FIELD_ORDER.filter(k => extracted[k]).map((key) => {
                const meta = FIELD_META[key];
                const Icon = meta?.icon ?? Hash;
                const conf = confidences[key] ?? 80;
                const badge = conf >= 95 ? { c: "#88B8B0", l: "high" } : conf >= 85 ? { c: "#B8B880", l: "good" } : { c: "#C8A880", l: "low" };
                return (
                  <div key={key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/40">
                    <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="text-xs font-semibold text-muted-foreground w-32 flex-shrink-0">{meta?.label ?? key}</div>
                    <input
                      value={extracted[key] ?? ""}
                      onChange={(e) => updateField(key, e.target.value)}
                      className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#B8A0C8] rounded px-1.5 py-0.5 text-sm font-medium"
                    />
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: `${badge.c}20`, color: badge.c }}>
                      {badge.l} {conf}%
                    </span>
                  </div>
                );
              })}
              {FIELD_ORDER.filter(k => extracted[k]).length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  AI couldn't detect any fields. Try a clearer image.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent scans */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent card scans</div>
            <div className="text-sm font-semibold mt-0.5">Last {recent.length} contacts captured from cards</div>
          </div>
          <button onClick={loadRecent} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
        {recent.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No card scans yet — your first scan will appear here.</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {recent.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/contacts/${r.id}`)}
                className="flex items-center gap-2 p-2 rounded-lg border border-border/30 hover:border-[#B8A0C8]/40 hover:bg-[#B8A0C8]/5 transition text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#B8A0C8]/15 text-[#B8A0C8] flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                  {r.name?.split(" ").map((p: string) => p[0]).slice(0, 2).join("") || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                    {r.status === "pending_approval" && <Clock className="w-2.5 h-2.5 text-amber-500" />}
                    {r.title ?? "—"}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{relTime(r.created_at)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="glass-panel p-3 flex items-center gap-3 text-xs">
        <Wand2 className="w-4 h-4 text-[#B8A0C8]" />
        <span className="text-muted-foreground">
          Gemini Vision validates each upload is a real business card, then extracts fields bilingually. ICP rules auto-route non-target contacts for manager approval.
          Cards are <span className="font-bold text-foreground">not stored</span> — only the extracted fields and activity log.
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, sub }: { label: string; value: any; accent: string; sub?: string }) {
  return (
    <div className="glass-panel p-3">
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold mt-1" style={{ color: accent }}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function relTime(d: string) {
  const ms = Date.now() - new Date(d).getTime();
  if (ms < 60_000) return "just now";
  if (ms < 3600_000) return `${Math.floor(ms/60_000)}m ago`;
  if (ms < 86400_000) return `${Math.floor(ms/3600_000)}h ago`;
  return `${Math.floor(ms/86400_000)}d ago`;
}
