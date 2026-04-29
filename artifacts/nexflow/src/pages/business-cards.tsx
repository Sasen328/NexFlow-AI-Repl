import { useState } from "react";
import {
  ScanLine, Upload, Camera, CheckCircle2, Sparkles, User, Mail, Phone, Building2,
  Globe, MapPin, Linkedin, Languages, Plus, Wand2, ArrowRight, Loader2, Eye, Check,
  X, FileImage, Users, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ExtractedField = { key: string; label: string; value: string; confidence: number; icon: any };

const SAMPLE_EXTRACT: ExtractedField[] = [
  { key: "name_en", label: "Name (English)", value: "Ahmed Al-Rashidi",            confidence: 98, icon: User },
  { key: "name_ar", label: "Name (Arabic)",  value: "أحمد الرشيدي",                confidence: 96, icon: Languages },
  { key: "title",   label: "Title",          value: "Chief Information Officer",   confidence: 95, icon: User },
  { key: "company", label: "Company",        value: "NEOM Tech & Digital Holdings",confidence: 99, icon: Building2 },
  { key: "email",   label: "Email",          value: "ahmed.rashidi@neom.com",      confidence: 97, icon: Mail },
  { key: "phone",   label: "Mobile",         value: "+966 50 123 4567",            confidence: 94, icon: Phone },
  { key: "office",  label: "Office",         value: "+966 13 888 9000 ext 4521",   confidence: 88, icon: Phone },
  { key: "website", label: "Website",        value: "neom.com",                    confidence: 99, icon: Globe },
  { key: "address", label: "Address",        value: "NEOM Bay, Tabuk Province, KSA",confidence: 82, icon: MapPin },
  { key: "linkedin",label: "LinkedIn",       value: "linkedin.com/in/aalrashidi",  confidence: 76, icon: Linkedin },
];

const ENRICHMENT = [
  { label: "Industry",        value: "Government / Smart City",       source: "Crunchbase" },
  { label: "Company size",    value: "5,000-10,000",                  source: "LinkedIn" },
  { label: "Annual revenue",  value: "$8.4B (2025)",                  source: "ZoomInfo" },
  { label: "Funding",         value: "$500B PIF backed",              source: "Crunchbase" },
  { label: "Tech stack",      value: "Salesforce, AWS, SAP, Azure",   source: "BuiltWith" },
  { label: "Lead score",      value: "94 / 100",                      source: "NexFlow AI" },
];

const RECENT_SCANS = [
  { id: "1", name: "Sara Al-Mansouri",  company: "Gulf Ventures",     time: "2m ago",  status: "saved",     score: 94 },
  { id: "2", name: "Mohammed Al-Otaibi",company: "Aramco Digital",    time: "1h ago",  status: "saved",     score: 91 },
  { id: "3", name: "Hessa Al-Nahyan",   company: "Abu Dhabi Holdings",time: "3h ago",  status: "saved",     score: 87 },
  { id: "4", name: "Khalid Al-Hamdan",  company: "Doha Petroleum",    time: "yesterday", status: "review",  score: 72 },
  { id: "5", name: "Layla Hassan",      company: "MENA Banking",      time: "yesterday", status: "saved",   score: 84 },
  { id: "6", name: "Reem Al-Dossari",   company: "Aramco Digital",    time: "2d ago",  status: "duplicate", score: 0 },
];

const STATUS_STYLE: Record<string, string> = {
  saved:     "bg-[#88B8B0]/15 text-[#88B8B0] border-[#88B8B0]/30",
  review:    "bg-[#C8A880]/15 text-[#C8A880] border-[#C8A880]/30",
  duplicate: "bg-[#C0A0B8]/15 text-[#C0A0B8] border-[#C0A0B8]/30",
};

function confidenceBadge(c: number) {
  if (c >= 95) return { color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/15", label: "high" };
  if (c >= 85) return { color: "text-[#B8B880]", bg: "bg-[#B8B880]/15", label: "good" };
  return { color: "text-[#C8A880]", bg: "bg-[#C8A880]/15", label: "low" };
}

export default function BusinessCardsPage() {
  const [scanState, setScanState] = useState<"empty" | "scanning" | "complete">("complete");
  const [fields, setFields] = useState<ExtractedField[]>(SAMPLE_EXTRACT);

  function simulateScan() {
    setScanState("scanning");
    setTimeout(() => {
      setFields(SAMPLE_EXTRACT);
      setScanState("complete");
    }, 1600);
  }

  function updateField(key: string, value: string) {
    setFields(fields.map((f) => (f.key === key ? { ...f, value, confidence: 100 } : f)));
  }

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Business Card Scanner</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#B8A0C8]/15 text-[#B8A0C8] text-[10px] font-bold uppercase tracking-wide">
              Vision AI
            </span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            Snap a card at a Riyadh, Dubai, or Doha trade show — contact created in 5 seconds, bilingual (Arabic + English).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/40 hover:bg-muted/50 transition">
            <Camera className="w-3.5 h-3.5" /> Mobile capture
          </button>
          <button onClick={simulateScan} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg shadow-sm">
            <Upload className="w-3.5 h-3.5" /> Upload card
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Cards scanned (30d)", value: "284", icon: FileImage,  color: "#B8A0C8" },
          { label: "Auto-saved",          value: "248", icon: CheckCircle2, color: "#88B8B0" },
          { label: "Avg accuracy",        value: "96%", icon: Sparkles,   color: "#C8A880" },
          { label: "Pipeline added",      value: "$1.4M", icon: TrendingUp, color: "#B8B880" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-panel rounded-xl p-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-2xl font-bold leading-none" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mt-1">{s.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Card preview + drop zone */}
        <div className="col-span-4 space-y-3">
          <div className="glass-panel rounded-xl p-3">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Source image</div>
            <div className="aspect-[1.6/1] rounded-lg overflow-hidden relative" style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            }}>
              {/* Mock business card */}
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <div>
                  <div className="text-white text-base font-bold tracking-tight">Ahmed Al-Rashidi</div>
                  <div className="text-white/60 text-xs mt-0.5">أحمد الرشيدي</div>
                  <div className="text-[#B8A0C8] text-[11px] mt-2 font-semibold">Chief Information Officer</div>
                </div>
                <div>
                  <div className="text-[#88B8B0] text-sm font-bold">NEOM Tech & Digital</div>
                  <div className="text-white/50 text-[10px] mt-1">ahmed.rashidi@neom.com · +966 50 123 4567</div>
                  <div className="text-white/40 text-[10px] mt-0.5">NEOM Bay, Tabuk Province, KSA</div>
                </div>
              </div>
              {/* Scanning overlay */}
              {scanState === "scanning" && (
                <div className="absolute inset-0 bg-[#B8A0C8]/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white mx-auto mb-2" />
                    <div className="text-xs text-white font-semibold">AI extracting fields…</div>
                  </div>
                </div>
              )}
              {/* Vision AI bbox overlays */}
              {scanState === "complete" && (
                <>
                  <div className="absolute top-[16%] left-[7%] w-[55%] h-[14%] border border-[#88B8B0]/70 rounded-sm pointer-events-none">
                    <div className="absolute -top-3 left-0 px-1 bg-[#88B8B0] rounded-sm text-[8px] font-bold text-white">98%</div>
                  </div>
                  <div className="absolute top-[57%] left-[7%] w-[45%] h-[10%] border border-[#88B8B0]/70 rounded-sm pointer-events-none">
                    <div className="absolute -top-3 left-0 px-1 bg-[#88B8B0] rounded-sm text-[8px] font-bold text-white">99%</div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-semibold border border-border/40 hover:bg-muted/50">
                <Upload className="w-3 h-3" /> Replace
              </button>
              <button onClick={simulateScan} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-semibold text-white nf-chameleon-bg">
                <Wand2 className="w-3 h-3" /> Re-scan
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-3">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Drop more cards</div>
            <div className="border-2 border-dashed border-border/40 rounded-lg p-6 text-center hover:border-[#B8A0C8]/50 hover:bg-[#B8A0C8]/5 transition cursor-pointer">
              <Upload className="w-7 h-7 text-muted-foreground/50 mx-auto mb-2" />
              <div className="text-xs font-semibold">Drag image here</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG up to 10 MB · batch upload supported</div>
            </div>
          </div>
        </div>

        {/* Extracted fields */}
        <div className="col-span-5">
          <div className="glass-panel rounded-xl p-3.5 h-full">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  Extracted fields
                  <span className="px-1.5 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold">
                    {fields.filter((f) => f.confidence >= 90).length}/{fields.length} HIGH CONFIDENCE
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Tap any field to edit · changes raise confidence to 100%</div>
              </div>
              <button className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-[#B8A0C8] hover:bg-[#B8A0C8]/10">
                <Sparkles className="w-3 h-3" /> Re-process with AI
              </button>
            </div>
            <div className="space-y-1.5">
              {fields.map((f) => {
                const Icon = f.icon;
                const cb = confidenceBadge(f.confidence);
                return (
                  <div key={f.key} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/40 group">
                    <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">{f.label}</div>
                      <input
                        value={f.value}
                        onChange={(e) => updateField(f.key, e.target.value)}
                        className="w-full text-sm font-semibold bg-transparent focus:outline-none border-b border-transparent focus:border-[#B8A0C8]/50"
                        dir={f.key === "name_ar" ? "rtl" : "ltr"}
                      />
                    </div>
                    <div className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0", cb.bg, cb.color)}>
                      {f.confidence}%
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-[#88B8B0] transition">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-border/30">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#B8A0C8]" /> AI enrichment
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ENRICHMENT.map((e) => (
                  <div key={e.label} className="p-2 rounded-md bg-muted/30 border border-border/30">
                    <div className="text-[10px] text-muted-foreground">{e.label}</div>
                    <div className="text-xs font-semibold leading-tight">{e.value}</div>
                    <div className="text-[9px] text-[#B8A0C8] mt-0.5">via {e.source}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-border/40 hover:bg-muted/50">
                <X className="w-3.5 h-3.5" /> Discard
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-border/40 hover:bg-muted/50">
                <Eye className="w-3.5 h-3.5" /> Preview contact
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white nf-chameleon-bg shadow-sm">
                <Plus className="w-3.5 h-3.5" /> Save to CRM
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent scans */}
        <div className="col-span-3 space-y-3">
          <div className="glass-panel rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Recent scans</div>
              <button className="text-[10px] text-[#B8A0C8] hover:underline">view all</button>
            </div>
            <div className="space-y-1.5">
              {RECENT_SCANS.map((r) => (
                <div key={r.id} className="p-2 rounded-md hover:bg-muted/40 cursor-pointer">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{r.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{r.company}</div>
                    </div>
                    <div className={cn("px-1.5 py-0.5 rounded-md text-[9px] font-bold border flex-shrink-0", STATUS_STYLE[r.status])}>
                      {r.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">{r.time}</span>
                    {r.score > 0 && <span className="text-[10px] font-bold text-[#B8A0C8]">{r.score}/100</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-3 bg-[#C8A880]/5 border border-[#C8A880]/30">
            <div className="flex items-center gap-2 mb-2">
              <Languages className="w-4 h-4 text-[#C8A880]" />
              <div className="text-xs font-bold">Bilingual processing</div>
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              Cards in Arabic, English, French, or mixed scripts are detected automatically. Names parsed via Khaleeji-aware NLP for proper RTL display and search.
            </div>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {["العربية", "English", "Français", "اردو"].map((l) => (
                <span key={l} className="px-1.5 py-0.5 rounded-md bg-[#C8A880]/15 text-[#C8A880] text-[10px] font-semibold">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
