import { useRef, useState } from "react";
import { useWizard } from "../context";
import { apiFetch } from "@/hooks/useApi";
import {
  INDUSTRIES, GCC_COUNTRIES, COMPANY_SIZES, TABS_META,
  BRAND_VIBES, BRAND_HERITAGES, BRAND_FEELINGS, BRAND_PRESET_PALETTES,
  type BrandMode,
} from "../types";
import {
  Palette, Upload, Layers, Sparkles, Globe, Linkedin, Hash, Building2,
  Check, RefreshCw, ChevronRight,
} from "lucide-react";

function inp(extra = "") {
  return `w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/50 bg-card text-foreground transition-colors ${extra}`;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-slate-700 mb-1.5">{children}</label>;
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-slate-50/60 border border-slate-200 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
}

const BRAND_MODE_TABS: { id: BrandMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "pick",   label: "Quick Pick",         icon: <Palette className="w-4 h-4" />,   desc: "Choose from curated palettes or set a custom hex" },
  { id: "upload", label: "Upload Guidelines",  icon: <Upload className="w-4 h-4" />,    desc: "Upload your brand PDF, style guide or logo image" },
  { id: "mesh",   label: "Mesh Gradient",      icon: <Layers className="w-4 h-4" />,    desc: "Build a premium mesh gradient from 3 anchor colours" },
  { id: "ai",     label: "AI Generate",        icon: <Sparkles className="w-4 h-4" />,  desc: "Describe your brand and let AI create the full palette" },
];

const QUICK_PALETTES = [
  { name: "NexFlow",      primary: "#B8A0C8", secondary: "#88B8B0", accent: "#C8A880" },
  { name: "Desert Royal", primary: "#006400", secondary: "#c8a951", accent: "#8b0000" },
  { name: "Midnight Gold",primary: "#1a1a2e", secondary: "#c9a84c", accent: "#8B5CF6" },
  { name: "Gulf Navy",    primary: "#1e3a5f", secondary: "#2d6a4f", accent: "#e9c46a" },
  { name: "Quantum",      primary: "#6366f1", secondary: "#06b6d4", accent: "#f59e0b" },
  { name: "Crimson Dusk", primary: "#9f1239", secondary: "#b45309", accent: "#0f766e" },
  { name: "Slate Pro",    primary: "#334155", secondary: "#64748b", accent: "#f59e0b" },
  { name: "Emerald",      primary: "#047857", secondary: "#0284c7", accent: "#7c3aed" },
];

function meshGradient(c: [string, string, string]) {
  return `radial-gradient(at 0% 0%, ${c[0]}cc 0px, transparent 60%), radial-gradient(at 100% 0%, ${c[1]}cc 0px, transparent 60%), radial-gradient(at 50% 100%, ${c[2]}cc 0px, transparent 60%)`;
}

function BrandPreviewSwatch({ primary, secondary, accent }: { primary: string; secondary: string; accent: string }) {
  return (
    <div className="flex items-center gap-2 mt-3">
      {[primary, secondary, accent].map((c, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-xl shadow-sm border border-white/20" style={{ background: c }} />
          <span className="text-[10px] font-mono text-slate-400">{c}</span>
        </div>
      ))}
    </div>
  );
}

export default function Step1Company() {
  const { answers, updateAnswers } = useWizard();
  const fileRef = useRef<HTMLInputElement>(null);
  const guidelineFileRef = useRef<HTMLInputElement>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ primary: string; secondary: string; accent: string; rationale: string } | null>(null);

  const toggleCountry = (c: string) => {
    const next = answers.countries.includes(c)
      ? answers.countries.filter((x) => x !== c)
      : [...answers.countries, c];
    if (next.length > 0) updateAnswers({ countries: next });
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateAnswers({ logoBase64: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleGuidelines = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateAnswers({ brandGuidelinesName: file.name });
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 80; canvas.height = 80;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, 80, 80);
          const pixels = ctx.getImageData(0, 0, 80, 80).data;
          const counts: Record<string, number> = {};
          for (let i = 0; i < pixels.length; i += 16) {
            const r = Math.round(pixels[i] / 32) * 32;
            const g = Math.round(pixels[i + 1] / 32) * 32;
            const b = Math.round(pixels[i + 2] / 32) * 32;
            const key = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
            counts[key] = (counts[key] ?? 0) + 1;
          }
          const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
          if (sorted[0]) updateAnswers({ primaryColor: sorted[0][0] });
          if (sorted[1]) updateAnswers({ secondaryColor: sorted[1][0] });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAiBrand = async () => {
    if (!answers.brandVibeAi) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const prompt = `You are a brand designer specializing in GCC enterprise companies.
Generate a brand color palette for a ${answers.industry || "B2B"} company with the following profile:
- Brand vibe: ${answers.brandVibeAi}
- Brand heritage: ${answers.brandHeritageAi || "GCC"}
- Brand feeling: ${answers.brandFeelingAi || "Professional"}
- Company name: ${answers.companyName || "the company"}

Return ONLY valid JSON in this exact format with no other text:
{"primary":"#hex","secondary":"#hex","accent":"#hex","rationale":"One sentence explaining the colour choices in relation to the brand profile."}

Choose colours that are distinct, harmonious, and appropriate for a premium GCC enterprise CRM workspace. All hex values must be full 6-digit hex codes.`;

      const data: any = await apiFetch("/api/marketing/assistant-chat", {
        method: "POST",
        body: JSON.stringify({ message: prompt }),
      });

      const raw = data?.reply ?? data?.message ?? JSON.stringify(data);
      const match = raw.match(/\{[\s\S]*?\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.primary && parsed.secondary && parsed.accent) {
          setAiResult(parsed);
        }
      }
    } catch {
      const preset = BRAND_PRESET_PALETTES[answers.brandVibeAi];
      if (preset) {
        setAiResult({ ...preset, rationale: `${preset.name} palette — a carefully curated combination for ${answers.brandVibeAi.toLowerCase()} brands in the GCC.` });
      }
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiResult = () => {
    if (!aiResult) return;
    updateAnswers({
      primaryColor: aiResult.primary,
      secondaryColor: aiResult.secondary,
      accentColor: aiResult.accent,
    });
  };

  const applyPreset = (p: typeof QUICK_PALETTES[0]) => {
    updateAnswers({ primaryColor: p.primary, secondaryColor: p.secondary, accentColor: p.accent });
  };

  const moveTab = (tabId: string, dir: -1 | 1) => {
    const tabs = [...answers.tabStructure];
    const idx = tabs.indexOf(tabId);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= tabs.length) return;
    [tabs[idx], tabs[next]] = [tabs[next], tabs[idx]];
    updateAnswers({ tabStructure: tabs });
  };

  const toggleTab = (tabId: string) => {
    if (answers.tabStructure.includes(tabId) && answers.tabStructure.length > 1) {
      updateAnswers({ tabStructure: answers.tabStructure.filter((t) => t !== tabId) });
    } else if (!answers.tabStructure.includes(tabId)) {
      updateAnswers({ tabStructure: [...answers.tabStructure, tabId] });
    }
  };

  const bm = answers.brandMode;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Company & Branding</h2>
        <p className="text-slate-500 mt-1">Tell us about your organisation. This shapes your entire workspace identity.</p>
      </div>

      <SectionCard>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Company Identity</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Company name (English) <span className="text-red-500">*</span></Label>
            <input type="text" value={answers.companyName} onChange={(e) => updateAnswers({ companyName: e.target.value })} placeholder="Acme Corp" className={inp()} />
          </div>
          <div>
            <Label>اسم الشركة بالعربية <span className="text-slate-400 font-normal text-xs">(optional)</span></Label>
            <input type="text" value={answers.companyNameAr} onChange={(e) => updateAnswers({ companyNameAr: e.target.value })} placeholder="أكمي" dir="rtl" className={inp()} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>
              <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-slate-400" /> CR / Commercial Registration No.</span>
            </Label>
            <input type="text" value={answers.crNumber} onChange={(e) => updateAnswers({ crNumber: e.target.value })} placeholder="1010XXXXXXX" className={inp()} />
          </div>
          <div>
            <Label>Industry <span className="text-red-500">*</span></Label>
            <select value={answers.industry} onChange={(e) => updateAnswers({ industry: e.target.value })} className={inp("cursor-pointer")}>
              <option value="">Select your industry</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label><span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-slate-400" /> Company website</span></Label>
            <input type="url" value={answers.companyWebsite} onChange={(e) => updateAnswers({ companyWebsite: e.target.value })} placeholder="https://yourcompany.com.sa" className={inp()} />
          </div>
          <div>
            <Label><span className="flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5 text-slate-400" /> LinkedIn company page</span></Label>
            <input type="url" value={answers.linkedinPage} onChange={(e) => updateAnswers({ linkedinPage: e.target.value })} placeholder="linkedin.com/company/your-company" className={inp()} />
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Company Size</p>
        <div className="flex flex-wrap gap-2">
          {COMPANY_SIZES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateAnswers({ companySize: value })}
              className={[
                "px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                answers.companySize === value
                  ? "border-[#B8A0C8] bg-[#B8A0C8]/[0.07] text-[#B8A0C8]"
                  : "border-border bg-card text-foreground hover:border-[#B8A0C8]/50",
              ].join(" ")}
            >
              {label} employees
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Countries Operating In</p>
        <div className="flex flex-wrap gap-2">
          {GCC_COUNTRIES.map((c) => (
            <button
              key={c}
              onClick={() => toggleCountry(c)}
              className={[
                "px-3 py-1.5 rounded-lg border text-sm transition-all",
                answers.countries.includes(c)
                  ? "border-[#B8A0C8] bg-[#B8A0C8]/[0.07] text-[#B8A0C8] font-medium"
                  : "border-border bg-card text-foreground hover:border-[#B8A0C8]/50",
              ].join(" ")}
            >
              {c}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Brand Identity</p>
        <p className="text-xs text-slate-400 mb-5">Choose how you want to define your workspace branding.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {BRAND_MODE_TABS.map(({ id, label, icon, desc }) => (
            <button
              key={id}
              onClick={() => updateAnswers({ brandMode: id })}
              title={desc}
              className={[
                "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all",
                bm === id
                  ? "border-[#B8A0C8] bg-[#B8A0C8]/[0.07] text-[#B8A0C8]"
                  : "border-border bg-card text-muted-foreground hover:border-[#B8A0C8]/50",
              ].join(" ")}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {bm === "pick" && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-3">Curated GCC palettes — click to apply</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUICK_PALETTES.map((p) => {
                  const active = answers.primaryColor === p.primary;
                  return (
                    <button
                      key={p.name}
                      onClick={() => applyPreset(p)}
                      className={[
                        "relative rounded-xl border-2 overflow-hidden transition-all group",
                        active ? "border-[#B8A0C8] shadow-md shadow-[#B8A0C8]/20" : "border-border hover:border-[#B8A0C8]/50",
                      ].join(" ")}
                    >
                      <div className="h-10 w-full" style={{ background: `linear-gradient(135deg, ${p.primary} 0%, ${p.secondary} 60%, ${p.accent} 100%)` }} />
                      <div className="px-2 py-1.5 text-[10px] font-semibold text-slate-700 text-center">{p.name}</div>
                      {active && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full nf-chameleon-bg flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-600 mb-3">Fine-tune individual colours</p>
              <div className="flex gap-6 flex-wrap">
                {(["primaryColor", "secondaryColor", "accentColor"] as const).map((key, i) => {
                  const labels = ["Primary", "Secondary", "Accent"];
                  return (
                    <div key={key} className="flex flex-col gap-1.5">
                      <span className="text-xs text-slate-500">{labels[i]}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={answers[key]}
                          onChange={(e) => updateAnswers({ [key]: e.target.value } as any)}
                          className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={answers[key]}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) updateAnswers({ [key]: v } as any);
                          }}
                          className="w-24 rounded-lg border border-border px-2.5 py-1.5 text-xs font-mono bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-[#B8A0C8]/50"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {bm === "upload" && (
          <div className="space-y-4">
            <div
              onClick={() => guidelineFileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-[#B8A0C8]/60 hover:bg-[#B8A0C8]/[0.03] transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#B8A0C8]/10 flex items-center justify-center group-hover:bg-[#B8A0C8]/20 transition-colors">
                <Upload className="w-5 h-5" style={{ color: "#B8A0C8" }} />
              </div>
              {answers.brandGuidelinesName ? (
                <>
                  <p className="text-sm font-semibold text-slate-700">{answers.brandGuidelinesName}</p>
                  <p className="text-xs font-medium" style={{ color: "#B8A0C8" }}>Colors extracted ✓ — click to replace</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-700">Drop your brand guidelines here</p>
                  <p className="text-xs text-slate-400 text-center">
                    PDF or image (PNG, JPG, SVG) — up to 10 MB<br />
                    We extract your dominant colours automatically
                  </p>
                </>
              )}
            </div>
            <input ref={guidelineFileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleGuidelines} />

            {answers.brandGuidelinesName && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-xs text-teal-800">
                <strong>Colours extracted from {answers.brandGuidelinesName}</strong> — review them in Quick Pick and fine-tune if needed.
                <BrandPreviewSwatch primary={answers.primaryColor} secondary={answers.secondaryColor} accent={answers.accentColor} />
              </div>
            )}

            <p className="text-xs text-slate-400">Your uploaded file is used only to extract brand colours. It is not stored on our servers.</p>
          </div>
        )}

        {bm === "mesh" && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-4">Set 3 anchor colours — your workspace header will use this gradient</p>
              <div className="flex gap-6 flex-wrap mb-5">
                {(["Primary", "Mid", "Accent"] as const).map((label, i) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-500">{label}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={answers.meshColors[i]}
                        onChange={(e) => {
                          const next: [string, string, string] = [...answers.meshColors];
                          next[i] = e.target.value;
                          updateAnswers({ meshColors: next });
                        }}
                        className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={answers.meshColors[i]}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
                            const next: [string, string, string] = [...answers.meshColors];
                            next[i] = v;
                            updateAnswers({ meshColors: next });
                          }
                        }}
                        className="w-24 rounded-lg border border-border px-2.5 py-1.5 text-xs font-mono bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-[#B8A0C8]/50"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2">Live preview</p>
                <div
                  className="h-20 rounded-xl shadow-inner border border-slate-200"
                  style={{ background: meshGradient(answers.meshColors) }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-400">The mesh gradient is set as your Primary workspace colour. You can still set Secondary and Accent in Quick Pick.</p>
          </div>
        )}

        {bm === "ai" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Brand vibe</Label>
                <select value={answers.brandVibeAi} onChange={(e) => updateAnswers({ brandVibeAi: e.target.value })} className={inp("cursor-pointer")}>
                  <option value="">Select a vibe…</option>
                  {BRAND_VIBES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <Label>Brand heritage</Label>
                <select value={answers.brandHeritageAi} onChange={(e) => updateAnswers({ brandHeritageAi: e.target.value })} className={inp("cursor-pointer")}>
                  <option value="">Select heritage…</option>
                  {BRAND_HERITAGES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <Label>Primary feeling</Label>
                <select value={answers.brandFeelingAi} onChange={(e) => updateAnswers({ brandFeelingAi: e.target.value })} className={inp("cursor-pointer")}>
                  <option value="">Select feeling…</option>
                  {BRAND_FEELINGS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={generateAiBrand}
              disabled={!answers.brandVibeAi || aiLoading}
              className={[
                "flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all",
                answers.brandVibeAi && !aiLoading
                  ? "text-white shadow-lg shadow-[#B8A0C8]/30 hover:-translate-y-0.5"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed",
              ].join(" ")}
              style={answers.brandVibeAi && !aiLoading ? { background: "linear-gradient(135deg, #B8A0C8 0%, #88B8B0 50%, #C8A880 100%)" } : undefined}
            >
              {aiLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  AI is crafting your brand identity…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Brand Identity
                </>
              )}
            </button>

            {!aiResult && !aiLoading && answers.brandVibeAi && (
              <div className="rounded-xl p-3 text-xs border" style={{ background: "rgba(184,160,200,0.07)", borderColor: "rgba(184,160,200,0.3)", color: "#9A7AAE" }}>
                AI uses Claude + GPT-4o to generate a bespoke palette based on your industry, vibe, and cultural heritage. Falls back to curated presets if AI is unavailable.
              </div>
            )}

            {aiResult && (
              <div className="rounded-xl p-5 border" style={{ background: "linear-gradient(135deg, rgba(184,160,200,0.07) 0%, rgba(136,184,176,0.07) 100%)", borderColor: "rgba(184,160,200,0.25)" }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">AI-generated palette</p>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-sm">{aiResult.rationale}</p>
                  </div>
                  <button
                    onClick={generateAiBrand}
                    className="flex items-center gap-1 text-xs transition-colors" style={{ color: "#B8A0C8" }}
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                </div>
                <BrandPreviewSwatch primary={aiResult.primary} secondary={aiResult.secondary} accent={aiResult.accent} />
                <button
                  onClick={applyAiResult}
                  className="mt-4 flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #B8A0C8 0%, #88B8B0 50%, #C8A880 100%)" }}
                >
                  <Check className="w-4 h-4" /> Apply to workspace
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Company Logo</p>
        <p className="text-xs text-slate-400 mb-4">Appears in your workspace header and proposals.</p>
        <div className="flex items-start gap-5">
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#B8A0C8]/60 hover:bg-[#B8A0C8]/[0.03] transition-all w-36 h-28 flex-shrink-0"
          >
            {answers.logoBase64 ? (
              <img src={answers.logoBase64} alt="Logo" className="h-16 object-contain" />
            ) : (
              <>
                <Building2 className="w-6 h-6 text-slate-300" />
                <p className="text-xs text-slate-400 text-center">Click to upload</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          <div className="text-xs text-slate-500 mt-2 space-y-1">
            <p className="font-medium text-slate-700">Logo guidelines</p>
            <p>• PNG or SVG with transparent background (preferred)</p>
            <p>• Minimum 200×200 px for crisp display at all sizes</p>
            <p>• Max file size: 2 MB</p>
            {answers.logoBase64 && (
              <button onClick={() => updateAnswers({ logoBase64: "" })} className="mt-2 text-red-500 hover:text-red-700 hover:underline font-medium">
                Remove logo
              </button>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Navigation Tabs</p>
        <p className="text-xs text-slate-400 mb-4">Reorder with the arrows — hide modules your team won't use</p>
        <div className="space-y-2">
          {Object.keys(TABS_META).map((tabId) => {
            const meta = TABS_META[tabId];
            const isVisible = answers.tabStructure.includes(tabId);
            const idx = answers.tabStructure.indexOf(tabId);
            return (
              <div
                key={tabId}
                className={[
                  "flex items-center gap-3 p-3 rounded-xl border transition-all",
                  isVisible ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-40",
                ].join(" ")}
              >
                <span className="text-base w-6 text-center">{meta.icon}</span>
                <span className={["flex-1 text-sm font-medium", isVisible ? "text-slate-800" : "text-slate-400"].join(" ")}>
                  {meta.label}
                </span>
                {isVisible && (
                  <span className="text-xs font-mono rounded px-1.5 py-0.5" style={{ color: "#B8A0C8", background: "rgba(184,160,200,0.1)", border: "1px solid rgba(184,160,200,0.3)" }}>
                    #{idx + 1}
                  </span>
                )}
                <div className="flex gap-1">
                  <button onClick={() => moveTab(tabId, -1)} disabled={!isVisible || idx === 0} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500 text-xs">↑</button>
                  <button onClick={() => moveTab(tabId, 1)} disabled={!isVisible || idx === answers.tabStructure.length - 1} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500 text-xs">↓</button>
                  <button
                    onClick={() => toggleTab(tabId)}
                    className={["w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors", isVisible ? "hover:bg-red-50 text-slate-400 hover:text-red-500" : "hover:bg-green-50 text-slate-400 hover:text-green-600"].join(" ")}
                  >
                    {isVisible ? "✕" : "+"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
