import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ScanLine, Upload, Camera, Sparkles, User, Mail, Phone, Building2,
  Globe, MapPin, Linkedin, Languages, Wand2, ArrowRight, Loader2,
  Check, X, FileImage, AlertCircle, Trash2, RefreshCw, Hash,
  ShieldAlert, ShieldCheck, Clock, CheckCircle2, XCircle, Cpu,
  Eye, BrainCircuit, Search, Star, QrCode, FlipHorizontal2,
  BadgeCheck, AlertTriangle, Info, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";

const FIELD_META: Record<string, { label: string; icon: any }> = {
  name_en:        { label: "Name (English)",    icon: User },
  name_ar:        { label: "Name (Arabic)",     icon: Languages },
  title:          { label: "Title",             icon: User },
  company:        { label: "Company",           icon: Building2 },
  company_ar:     { label: "Company (Arabic)",  icon: Languages },
  email:          { label: "Email",             icon: Mail },
  mobile:         { label: "Mobile",            icon: Phone },
  office:         { label: "Office",            icon: Phone },
  fax:            { label: "Fax",               icon: Phone },
  website:        { label: "Website",           icon: Globe },
  address:        { label: "Address",           icon: MapPin },
  city:           { label: "City",              icon: MapPin },
  country:        { label: "Country",           icon: MapPin },
  linkedin:       { label: "LinkedIn",          icon: Linkedin },
  twitter:        { label: "Twitter / X",       icon: Hash },
  industry_guess: { label: "Industry",          icon: Building2 },
};

const FIELD_ORDER = [
  "name_en", "name_ar", "title", "company", "email",
  "mobile", "office", "website", "linkedin", "address",
  "city", "country", "industry_guess",
];

const PIPELINE_STEPS = [
  { id: "agent1_front",   icon: Eye,          label: "Front OCR",           sub: "Gemini Vision — front side + QR decode",  color: "#88B8B0" },
  { id: "agent1_back",    icon: FlipHorizontal2, label: "Back OCR",          sub: "Gemini Vision — back side (if provided)", color: "#88C8B0" },
  { id: "agent2",         icon: BrainCircuit, label: "Claude Validation",    sub: "Normalisation + data quality check",       color: "#B8A0C8" },
  { id: "agent3a",        icon: Search,       label: "Person Intelligence",  sub: "Perplexity — live web intel on person",    color: "#C8B880" },
  { id: "agent3b",        icon: Linkedin,     label: "LinkedIn Verify",      sub: "Perplexity — validate LinkedIn URL",       color: "#0A66C2" },
  { id: "agent4",         icon: Globe,        label: "Web Scraper",          sub: "BeautifulSoup — company profile",          color: "#C8A880" },
  { id: "agent5",         icon: Star,         label: "GPT-4o Scoring",       sub: "Final merge + lead score + summary",       color: "#90B8C8" },
];

type ExtractField = { key: string; confidence: number; bbox?: { x: number; y: number; w: number; h: number } };
type ScanState = "empty" | "scanning" | "rejected" | "complete" | "error";

export default function BusinessCardsPage() {
  const [, navigate] = useLocation();

  // Image state — front and back
  const frontFileRef = useRef<HTMLInputElement>(null);
  const backFileRef  = useRef<HTMLInputElement>(null);
  const [frontDataUrl, setFrontDataUrl] = useState<string | null>(null);
  const [backDataUrl,  setBackDataUrl]  = useState<string | null>(null);

  // Scan state
  const [scanState,    setScanState]    = useState<ScanState>("empty");
  const [scanStep,     setScanStep]     = useState(0);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [error,        setError]        = useState<string | null>(null);

  // Extracted data
  const [extracted,     setExtracted]     = useState<Record<string, string | null>>({});
  const [fullExtracted, setFullExtracted] = useState<any>({});
  const [confidences,   setConfidences]   = useState<Record<string, number>>({});
  const [bboxes,        setBboxes]        = useState<ExtractField[]>([]);
  const [pipelineTrace, setPipelineTrace] = useState<Record<string, any> | null>(null);
  const [agentsUsed,    setAgentsUsed]    = useState<string[]>([]);
  const [isDualSide,    setIsDualSide]    = useState(false);

  // Validation
  const [fieldValidation, setFieldValidation] = useState<Record<string, { ok: boolean; issue?: string }> | null>(null);
  const [validationScore, setValidationScore] = useState<number | null>(null);
  const [showValidation,  setShowValidation]  = useState(false);

  // Save state
  const [savingState,     setSavingState]     = useState<"idle" | "saving" | "saved" | "duplicate" | "approval">("idle");
  const [savedContactId,  setSavedContactId]  = useState<string | null>(null);
  const [approvalReasons, setApprovalReasons] = useState<string[]>([]);

  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => { loadRecent(); }, []);

  // Animate pipeline steps while scanning
  useEffect(() => {
    if (scanState !== "scanning") return;
    setScanStep(0);
    const timings = [0, 1500, 3500, 5000, 6500, 8000, 10000];
    const timers = timings.map((ms, i) => setTimeout(() => setScanStep(i), ms));
    return () => timers.forEach(clearTimeout);
  }, [scanState]);

  async function loadRecent() {
    try {
      const r: any = await apiFetch("/business-cards/recent");
      setRecent(r.scans ?? []);
    } catch {}
  }

  function pickFront() { frontFileRef.current?.click(); }
  function pickBack()  { backFileRef.current?.click(); }

  async function onFrontFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please upload an image file"); return; }
    if (file.size > 10 * 1024 * 1024)   { setError("Image too large (max 10MB)"); return; }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setFrontDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function onBackFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please upload an image file"); return; }
    if (file.size > 10 * 1024 * 1024)   { setError("Image too large (max 10MB)"); return; }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setBackDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function runScan() {
    if (!frontDataUrl) return;
    setScanState("scanning");
    setExtracted({});
    setFullExtracted({});
    setConfidences({});
    setBboxes([]);
    setPipelineTrace(null);
    setAgentsUsed([]);
    setSavingState("idle");
    setSavedContactId(null);
    setRejectionReason(null);
    setApprovalReasons([]);
    setFieldValidation(null);
    setValidationScore(null);
    setShowValidation(false);

    try {
      const r: any = await apiFetch("/business-cards/scan", {
        method: "POST",
        body: JSON.stringify({
          front_image_data_url: frontDataUrl,
          back_image_data_url:  backDataUrl ?? undefined,
        }),
      });

      const ex = r.extracted ?? {};
      setPipelineTrace(r.pipeline_trace ?? null);
      setAgentsUsed(r.agents_used ?? []);
      setFullExtracted(ex);
      setIsDualSide(r.dual_side ?? false);

      if (ex.is_business_card === false) {
        setScanState("rejected");
        setRejectionReason(ex.rejection_reason ?? "This does not appear to be a business card.");
        return;
      }

      const fieldsMap: Record<string, string | null> = {};
      const confMap:   Record<string, number> = {};
      for (const k of Object.keys(FIELD_META)) {
        if (ex[k] !== undefined && ex[k] !== null) fieldsMap[k] = ex[k];
      }
      const fields = Array.isArray(ex.fields) ? ex.fields : [];
      for (const f of fields) {
        if (f?.key) confMap[f.key] = typeof f.confidence === "number" ? f.confidence : 80;
      }
      for (const k of Object.keys(fieldsMap)) {
        if (fieldsMap[k] && confMap[k] === undefined) confMap[k] = 88;
      }

      // LinkedIn confidence from verified agent
      if (ex.linkedin && ex.linkedin_confidence !== undefined) {
        confMap.linkedin = ex.linkedin_confidence;
      }

      setExtracted(fieldsMap);
      setConfidences(confMap);
      setBboxes(fields);

      // Apply field validation from backend
      if (ex.field_validation) {
        setFieldValidation(ex.field_validation.fields ?? null);
        setValidationScore(ex.field_validation.score ?? null);
      }

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
        body: JSON.stringify({ extracted: { ...fullExtracted, ...extracted } }),
      });
      setSavedContactId(r.contact_id);
      if (r.duplicate)         { setSavingState("duplicate"); }
      else if (r.requires_approval) {
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
    setFrontDataUrl(null);
    setBackDataUrl(null);
    setExtracted({});
    setFullExtracted({});
    setConfidences({});
    setBboxes([]);
    setScanState("empty");
    setSavingState("idle");
    setSavedContactId(null);
    setRejectionReason(null);
    setApprovalReasons([]);
    setPipelineTrace(null);
    setAgentsUsed([]);
    setError(null);
    setFieldValidation(null);
    setValidationScore(null);
    setShowValidation(false);
    setIsDualSide(false);
    if (frontFileRef.current) frontFileRef.current.value = "";
    if (backFileRef.current)  backFileRef.current.value  = "";
  }

  const avgConf = Object.keys(confidences).length
    ? Math.round(Object.values(confidences).reduce((s, c) => s + c, 0) / Object.keys(confidences).length)
    : null;

  const qrDetected   = fullExtracted.qr_detected  ?? false;
  const qrType       = fullExtracted.qr_type       ?? null;
  const qrRaw        = fullExtracted.qr_raw_data   ?? null;
  const liVerified   = fullExtracted.linkedin_verified  ?? false;
  const liConfidence = fullExtracted.linkedin_confidence ?? null;

  return (
    <div className="p-5 space-y-4">
      {/* Hidden file inputs */}
      <input ref={frontFileRef} type="file" accept="image/*" capture="environment" onChange={onFrontFile} className="hidden" />
      <input ref={backFileRef}  type="file" accept="image/*"                       onChange={onBackFile}  className="hidden" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Business Card Scanner</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold uppercase tracking-wide border border-[#88B8B0]/30 flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5" /> 7-Agent · Dual-Side · QR
            </span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            Scan front + back of a card. Gemini decodes QR codes. LinkedIn is verified by a dedicated AI agent. All data validated before saving.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {scanState !== "empty" && (
            <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/40 hover:bg-muted/50 transition">
              <RefreshCw className="w-3.5 h-3.5" /> New scan
            </button>
          )}
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
        <Stat label="TOTAL SCANS"  value={recent.length} accent="#B8A0C8" />
        <Stat label="THIS WEEK"    value={recent.filter(r => Date.now() - new Date(r.created_at).getTime() < 7*86400_000).length} accent="#88B8B0" />
        <Stat label="AVG CONFIDENCE" value={avgConf !== null ? `${avgConf}%` : "—"} accent="#C8A880" />
        <Stat label="PIPELINE"     value="7-Agent" accent="#90B8C8" sub="Vision · Claude · Perplexity × 2 · Scraper · GPT-4o" />
      </div>

      {/* ── DUAL UPLOAD ZONE ──────────────────────────────────────────────────── */}
      {scanState === "empty" && (
        <div className="glass-panel p-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <FlipHorizontal2 className="w-3.5 h-3.5" /> Card Upload — Front & Back
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Front side */}
            <div>
              <div className="text-xs font-semibold text-center text-muted-foreground mb-2 flex items-center justify-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Front side <span className="text-[#C0A0B8] font-bold">*required</span>
              </div>
              {!frontDataUrl ? (
                <button onClick={pickFront}
                  className="w-full aspect-[16/10] rounded-xl border-2 border-dashed border-border/50 hover:border-[#B8A0C8] hover:bg-[#B8A0C8]/5 transition flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <FileImage className="w-10 h-10 text-[#B8A0C8]/50" />
                  <div className="text-xs font-semibold">Upload front</div>
                  <div className="text-[11px]">JPG · PNG · HEIC · max 10MB</div>
                  <div className="flex items-center gap-1 text-[11px] mt-0.5"><Camera className="w-3 h-3" /> Camera supported</div>
                </button>
              ) : (
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-muted group">
                  <img src={frontDataUrl} alt="Card front" className="w-full h-full object-contain" />
                  <button onClick={() => { setFrontDataUrl(null); if (frontFileRef.current) frontFileRef.current.value = ""; }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 hover:bg-background border border-border/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-[#88B8B0] text-white rounded px-1.5 py-0.5">FRONT</span>
                </div>
              )}
            </div>

            {/* Back side */}
            <div>
              <div className="text-xs font-semibold text-center text-muted-foreground mb-2 flex items-center justify-center gap-1">
                <FlipHorizontal2 className="w-3.5 h-3.5" /> Back side <span className="text-muted-foreground/60 font-normal">(optional)</span>
              </div>
              {!backDataUrl ? (
                <button onClick={pickBack}
                  className="w-full aspect-[16/10] rounded-xl border-2 border-dashed border-border/30 hover:border-[#88B8B0] hover:bg-[#88B8B0]/5 transition flex flex-col items-center justify-center gap-2 text-muted-foreground/60">
                  <QrCode className="w-10 h-10 text-[#88B8B0]/40" />
                  <div className="text-xs font-semibold">Upload back</div>
                  <div className="text-[11px]">QR codes · Arabic text · address</div>
                </button>
              ) : (
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-muted group">
                  <img src={backDataUrl} alt="Card back" className="w-full h-full object-contain" />
                  <button onClick={() => { setBackDataUrl(null); if (backFileRef.current) backFileRef.current.value = ""; }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 hover:bg-background border border-border/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-[#B8A0C8] text-white rounded px-1.5 py-0.5">BACK</span>
                </div>
              )}
            </div>
          </div>

          {/* Scan button */}
          {frontDataUrl && (
            <button onClick={runScan}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white nf-chameleon-bg shadow-md hover:shadow-lg transition hover:scale-[1.01] active:scale-[0.99]">
              <Wand2 className="w-4 h-4" />
              {backDataUrl ? "Scan both sides with 7 AI agents" : "Scan front with 7 AI agents"}
            </button>
          )}

          {/* Feature badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { icon: QrCode,          label: "QR code decoding", color: "#88B8B0" },
              { icon: Linkedin,        label: "LinkedIn verified", color: "#0A66C2" },
              { icon: FlipHorizontal2, label: "Dual-side merge",   color: "#B8A0C8" },
              { icon: ShieldCheck,     label: "Pre-save validation", color: "#C8A880" },
            ].map(({ icon: Icon, label, color }) => (
              <span key={label} className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border" style={{ borderColor: `${color}30`, color, background: `${color}10` }}>
                <Icon className="w-3 h-3" /> {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pipeline step indicator */}
      {(scanState === "scanning" || scanState === "complete") && (
        <div className="glass-panel p-3">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Cpu className="w-3 h-3" /> 7-Agent Pipeline
            {scanState === "complete" && pipelineTrace?.total_ms && (
              <span className="ml-auto text-[10px] text-muted-foreground">Total: {pipelineTrace.total_ms}ms</span>
            )}
            {isDualSide && scanState === "complete" && (
              <span className="ml-2 px-1.5 py-0.5 rounded bg-[#B8A0C8]/15 text-[#B8A0C8] text-[9px] font-bold">DUAL-SIDE</span>
            )}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {PIPELINE_STEPS.map((step, i) => {
              const isActive = scanState === "scanning" && scanStep === i;
              const isDone   = scanState === "complete" || (scanState === "scanning" && scanStep > i);
              // Skip back OCR step if no back image provided
              const isSkipped = i === 1 && !backDataUrl && scanState === "complete";
              const Icon = step.icon;
              return (
                <div key={step.id} className={cn(
                  "rounded-lg p-2 border transition-all",
                  isSkipped  ? "border-border/10 bg-muted/5 opacity-25" :
                  isActive   ? "border-[#B8A0C8]/60 bg-[#B8A0C8]/10" :
                  isDone     ? "border-[#88B8B0]/30 bg-[#88B8B0]/5" :
                               "border-border/20 bg-muted/10 opacity-40"
                )}>
                  <div className="flex items-center gap-1 mb-1">
                    {isActive ? (
                      <Loader2 className="w-3 h-3 animate-spin" style={{ color: step.color }} />
                    ) : isDone && !isSkipped ? (
                      <CheckCircle2 className="w-3 h-3 text-[#88B8B0]" />
                    ) : (
                      <Icon className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className="text-[10px] font-semibold truncate leading-tight" style={{ color: (isDone || isActive) && !isSkipped ? step.color : undefined }}>
                      {step.label}
                    </span>
                  </div>
                  <div className="text-[9px] text-muted-foreground leading-tight">{step.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main 2-column layout — shown after scan */}
      {(scanState === "scanning" || scanState === "rejected" || scanState === "complete" || scanState === "error") && (
        <div className="grid grid-cols-12 gap-4">
          {/* Card preview */}
          <div className="col-span-5 space-y-3">
            <div className="glass-panel p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {backDataUrl ? "Front side" : "Card image"}
              </div>
              <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-muted">
                {frontDataUrl ? (
                  <img src={frontDataUrl} alt="Card front" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <FileImage className="w-10 h-10" />
                  </div>
                )}
                {scanState === "scanning" && (
                  <div className="absolute inset-0 bg-background/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4">
                    <Loader2 className="w-8 h-8 text-[#B8A0C8] animate-spin" />
                    <div className="text-sm font-bold text-center">{PIPELINE_STEPS[scanStep]?.label}…</div>
                    <div className="text-xs text-muted-foreground text-center">{PIPELINE_STEPS[scanStep]?.sub}</div>
                    <div className="flex gap-1 mt-1">
                      {PIPELINE_STEPS.map((_, i) => (
                        <span key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all", i <= scanStep ? "bg-[#B8A0C8]" : "bg-muted")} />
                      ))}
                    </div>
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

              {/* Back preview (if provided) */}
              {backDataUrl && scanState === "complete" && (
                <div className="mt-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Back side</div>
                  <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-muted">
                    <img src={backDataUrl} alt="Card back" className="w-full h-full object-contain" />
                    {qrDetected && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-[#88B8B0] text-white text-[10px] font-bold">
                        <QrCode className="w-3 h-3" /> QR decoded
                      </div>
                    )}
                  </div>
                </div>
              )}

              {scanState === "complete" && (
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                  <Legend color="#88B8B0" label="High 95+" />
                  <Legend color="#B8B880" label="Good 85-94" />
                  <Legend color="#C8A880" label="Low <85" />
                </div>
              )}
            </div>

            {/* QR code panel */}
            {scanState === "complete" && qrDetected && (
              <div className="glass-panel p-3 border border-[#88B8B0]/30 bg-[#88B8B0]/5">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode className="w-4 h-4 text-[#88B8B0]" />
                  <div className="text-xs font-bold text-[#88B8B0] uppercase tracking-wide">QR Code Decoded</div>
                  {qrType && (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#88B8B0]/20 text-[#88B8B0] uppercase">{qrType}</span>
                  )}
                </div>
                {qrRaw && (
                  <div className="text-[11px] text-foreground/70 font-mono break-all leading-relaxed bg-muted/40 rounded p-2">
                    {qrRaw.slice(0, 300)}{qrRaw.length > 300 ? "…" : ""}
                  </div>
                )}
                <div className="mt-2 text-[10px] text-[#88B8B0]">Fields extracted from QR code are merged into results below.</div>
              </div>
            )}

            {/* LinkedIn verification badge */}
            {scanState === "complete" && extracted.linkedin && (
              <div className={cn(
                "glass-panel p-3 border flex items-start gap-2.5",
                liVerified ? "border-[#0A66C2]/30 bg-[#0A66C2]/5" : "border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10"
              )}>
                <Linkedin className={cn("w-4 h-4 mt-0.5 flex-shrink-0", liVerified ? "text-[#0A66C2]" : "text-amber-500")} />
                <div className="flex-1 min-w-0">
                  <div className={cn("text-[11px] font-bold", liVerified ? "text-[#0A66C2]" : "text-amber-600 dark:text-amber-400")}>
                    {liVerified ? `LinkedIn Verified · ${liConfidence}% confidence` : "LinkedIn — Not Verified"}
                  </div>
                  <div className="text-[11px] text-foreground/70 truncate mt-0.5">{extracted.linkedin}</div>
                  {!liVerified && (
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                      Please verify this profile manually before outreach
                    </div>
                  )}
                </div>
                {liVerified
                  ? <BadgeCheck className="w-4 h-4 text-[#0A66C2] flex-shrink-0" />
                  : <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                }
              </div>
            )}

            {/* AI profile summary */}
            {scanState === "complete" && (fullExtracted.summary_en || fullExtracted.brief_en) && (
              <div className="glass-panel border border-[#88B8B0]/20 bg-[#88B8B0]/5 overflow-hidden">
                {/* Header */}
                <div className="px-3 py-2 border-b border-[#88B8B0]/15 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#88B8B0]" />
                  <span className="text-[10px] font-bold text-[#88B8B0] uppercase tracking-wide">AI Pre-Meeting Brief</span>
                </div>

                <div className="p-3 space-y-3">
                  {/* Headline */}
                  {fullExtracted.summary_en && (
                    <p className="text-xs font-semibold text-foreground/90 leading-relaxed">{fullExtracted.summary_en}</p>
                  )}
                  {fullExtracted.summary_ar && (
                    <p className="text-[11px] text-foreground/60 leading-relaxed text-right" dir="rtl">{fullExtracted.summary_ar}</p>
                  )}

                  {/* Full brief */}
                  {fullExtracted.brief_en && (
                    <p className="text-[11px] text-foreground/75 leading-relaxed border-t border-[#88B8B0]/10 pt-2">{fullExtracted.brief_en}</p>
                  )}

                  {/* Career history */}
                  {fullExtracted.career_history?.length > 0 && (
                    <div className="border-t border-[#88B8B0]/10 pt-2">
                      <div className="text-[10px] font-bold text-[#88B8B0] uppercase tracking-wide mb-1.5">Career</div>
                      <ul className="space-y-1">
                        {fullExtracted.career_history.map((entry: string, i: number) => (
                          <li key={i} className="text-[11px] text-foreground/70 flex items-start gap-1.5">
                            <span className="mt-1 w-1 h-1 rounded-full bg-[#88B8B0]/60 flex-shrink-0" />
                            {entry}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Company snapshot */}
                  {fullExtracted.company_snapshot && (
                    <div className="border-t border-[#88B8B0]/10 pt-2">
                      <div className="text-[10px] font-bold text-[#88B8B0] uppercase tracking-wide mb-1">Company</div>
                      <p className="text-[11px] text-foreground/70 leading-relaxed">{fullExtracted.company_snapshot}</p>
                    </div>
                  )}

                  {/* Next actions */}
                  {fullExtracted.next_actions?.length > 0 && (
                    <div className="border-t border-[#88B8B0]/10 pt-2">
                      <div className="text-[10px] font-bold text-[#88B8B0] uppercase tracking-wide mb-1.5">Recommended actions</div>
                      <div className="space-y-1">
                        {fullExtracted.next_actions.map((a: string, i: number) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-[10px] font-bold text-[#B8A0C8] mt-0.5">{i + 1}.</span>
                            <span className="text-[11px] text-foreground/75">{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Extracted fields panel */}
          <div className="col-span-7 glass-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Extracted fields</div>
                <div className="text-sm font-semibold mt-0.5">
                  {scanState === "scanning" && `Running ${PIPELINE_STEPS[scanStep]?.label}…`}
                  {scanState === "rejected"  && <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400"><XCircle className="w-4 h-4" /> Invalid image rejected</span>}
                  {scanState === "complete"  && `${Object.values(extracted).filter(Boolean).length} fields · score ${fullExtracted.lead_score ?? "—"} · ${fullExtracted.confidence ?? "—"}% confidence`}
                  {scanState === "error"     && "Scan failed"}
                </div>
              </div>

              {/* Save button / status */}
              {scanState === "complete" && savingState === "idle" && (
                <button onClick={saveContact} disabled={!extracted.name_en}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition",
                    !extracted.name_en ? "bg-muted text-muted-foreground cursor-not-allowed" : "nf-chameleon-bg"
                  )}>
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
                  <Clock className="w-3.5 h-3.5" /> Pending approval
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
              </div>
            )}

            {/* Field validation report (collapsible) */}
            {scanState === "complete" && fieldValidation && (
              <div className="mb-3">
                <button
                  onClick={() => setShowValidation(v => !v)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition",
                    validationScore !== null && validationScore >= 80
                      ? "border-[#88B8B0]/30 bg-[#88B8B0]/5 text-[#88B8B0]"
                      : "border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10 text-amber-700 dark:text-amber-300"
                  )}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Field Validation
                  {validationScore !== null && (
                    <span className="font-black">{validationScore}% quality score</span>
                  )}
                  <span className="ml-auto">
                    {showValidation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </span>
                </button>
                {showValidation && (
                  <div className="mt-2 space-y-1.5 rounded-lg border border-border/30 p-3 bg-muted/20">
                    {Object.entries(fieldValidation).map(([key, v]) => (
                      <div key={key} className="flex items-start gap-2">
                        {v.ok
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-[#88B8B0] flex-shrink-0 mt-0.5" />
                          : <AlertCircle  className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        }
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-semibold">{FIELD_META[key]?.label ?? key}</span>
                          {!v.ok && v.issue && (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">{v.issue}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Scanning skeleton */}
            {scanState === "scanning" && (
              <div className="space-y-2">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-10 bg-muted/40 rounded-lg animate-pulse" />
                ))}
              </div>
            )}

            {/* Rejected */}
            {scanState === "rejected" && (
              <div className="py-12 text-center space-y-3">
                <XCircle className="w-12 h-12 text-red-400 mx-auto" />
                <div className="text-sm font-semibold text-red-600 dark:text-red-400">Image rejected — not a business card</div>
                <div className="text-xs text-muted-foreground max-w-sm mx-auto">{rejectionReason}</div>
                <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-border/40 hover:bg-muted/50 transition">
                  <Upload className="w-3.5 h-3.5" /> Try a different image
                </button>
              </div>
            )}

            {/* scan_note banner — shown when AI had to use fallback passes */}
            {scanState === "complete" && fullExtracted.scan_note && (
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/10 px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span className="text-xs text-amber-700 dark:text-amber-300">{fullExtracted.scan_note}</span>
              </div>
            )}

            {/* Extracted fields */}
            {scanState === "complete" && (
              <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {FIELD_ORDER.filter(k => extracted[k]).map((key) => {
                  const meta = FIELD_META[key];
                  const Icon = meta?.icon ?? Hash;
                  const conf = confidences[key] ?? 80;
                  const badge = conf >= 95 ? { c: "#88B8B0", l: "high" } : conf >= 85 ? { c: "#B8B880", l: "good" } : { c: "#C8A880", l: "low" };
                  const valResult = fieldValidation?.[key];
                  return (
                    <div key={key} className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/40 transition",
                      valResult && !valResult.ok ? "border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/5" : ""
                    )}>
                      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="text-xs font-semibold text-muted-foreground w-28 flex-shrink-0">{meta?.label ?? key}</div>
                      <input
                        value={extracted[key] ?? ""}
                        onChange={(e) => updateField(key, e.target.value)}
                        className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#B8A0C8] rounded px-1.5 py-0.5 text-sm font-medium"
                      />
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0" style={{ background: `${badge.c}20`, color: badge.c }}>
                        {badge.l} {conf}%
                      </span>
                      {key === "linkedin" && liVerified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-[#0A66C2] flex-shrink-0" title="LinkedIn verified by AI agent" />
                      )}
                    </div>
                  );
                })}
                {/* Zero-fields fallback: manual entry form instead of dead-end message */}
                {FIELD_ORDER.filter(k => extracted[k]).length === 0 && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 rounded-lg border border-[#C8A880]/30 bg-[#C8A880]/5 px-3 py-2.5">
                      <AlertTriangle className="w-4 h-4 text-[#C8A880] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-[#C8A880]">AI couldn't read this card automatically</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">Enter the details below — the AI will still enrich, score, and save the contact.</div>
                      </div>
                    </div>
                    {(["name_en","name_ar","title","company","email","mobile","website"] as const).map((key) => {
                      const meta = FIELD_META[key];
                      const Icon = meta?.icon ?? Hash;
                      return (
                        <div key={key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border/30 bg-muted/20">
                          <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="text-xs font-semibold text-muted-foreground w-28 flex-shrink-0">{meta?.label ?? key}</div>
                          <input
                            value={extracted[key] ?? ""}
                            onChange={(e) => updateField(key, e.target.value)}
                            placeholder={`Enter ${meta?.label ?? key}…`}
                            className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#B8A0C8] rounded px-1.5 py-0.5 text-sm font-medium placeholder:text-muted-foreground/40"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
              <button key={r.id} onClick={() => navigate(`/contacts/${r.id}`)}
                className="flex items-center gap-2 p-2 rounded-lg border border-border/30 hover:border-[#B8A0C8]/40 hover:bg-[#B8A0C8]/5 transition text-left">
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

      {/* Footer */}
      <div className="glass-panel p-3 flex items-center gap-3 text-xs">
        <Cpu className="w-4 h-4 text-[#B8A0C8]" />
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">7-Agent Pipeline:</span>{" "}
          Gemini Vision (OCR + QR decode) × 2 sides → Claude (validation) → Perplexity (person intel) → Perplexity (LinkedIn verify) → BeautifulSoup (company scrape) → GPT-4o-mini (score + summary).
          ICP rules auto-route non-target contacts for approval. Card images are <span className="font-bold text-foreground">not stored</span>.
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
