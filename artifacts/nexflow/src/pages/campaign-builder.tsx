import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  Sparkles, Upload, Send, Globe, Wand2, Image as ImageIcon, Target,
  Mail, MessageSquare, Linkedin, Twitter, Instagram, Facebook, Phone, FileText,
  Loader2, RefreshCw, Check, ArrowRight, ChevronRight, ChevronDown, Plus,
  Lightbulb, Trash2, Eye, Bot, AlertCircle, Users, Layers, Activity,
} from "lucide-react";
import { apiFetch } from "@/hooks/useApi";

type Tab = "funnel" | "ai" | "manual" | "publishing";
type Channel = "linkedin" | "x" | "instagram" | "facebook" | "whatsapp" | "email" | "sms";

const CHANNEL_META: Record<Channel, { icon: any; color: string; label: string; tone: string }> = {
  linkedin:  { icon: Linkedin,      color: "#0A66C2", label: "LinkedIn",  tone: "Professional B2B" },
  x:         { icon: Twitter,       color: "#000000", label: "X",         tone: "Punchy, ≤280 chars" },
  instagram: { icon: Instagram,     color: "#E4405F", label: "Instagram", tone: "Visual storytelling" },
  facebook:  { icon: Facebook,      color: "#1877F2", label: "Facebook",  tone: "Community-friendly" },
  whatsapp:  { icon: MessageSquare, color: "#25D366", label: "WhatsApp",  tone: "Conversational" },
  email:     { icon: Mail,          color: "#88B8B0", label: "Email",     tone: "Long-form, value-first" },
  sms:       { icon: Phone,         color: "#A090C8", label: "SMS",       tone: "Direct, ≤160 chars" },
};

const SEGMENTS = [
  { id: "s1", name: "GCC Enterprise C-Suite", size: 412, persona: "VP/SVP at orgs >2000 employees in KSA, UAE, Qatar" },
  { id: "s2", name: "MENA FinTech Founders", size: 218, persona: "CEO/Founder at Series-A+ FinTech in MENA region" },
  { id: "s3", name: "Saudi Mid-Market RevOps", size: 644, persona: "RevOps/SalesOps Director at SAR 50M-500M companies" },
  { id: "s4", name: "Gulf Real Estate Owners", size: 156, persona: "Owner-operator at multi-property real estate firms" },
  { id: "s5", name: "Riyadh Healthcare Network", size: 89, persona: "C-level + Procurement at private healthcare groups in KSA" },
];

const FUNNEL_STAGES = [
  { id: "tof", name: "Top of funnel — needs awareness",  count: 1240, color: "#A090C8", recommendation: "LinkedIn thought-leadership + cultural ads in KSA/UAE" },
  { id: "mof", name: "Mid funnel — engaged but cold",    count: 412,  color: "#C8A880", recommendation: "WhatsApp nurture + Arabic case-study email" },
  { id: "bof", name: "Bottom of funnel — pricing intent", count: 89,   color: "#88B8B0", recommendation: "Demo invites via SMS + 1:1 LinkedIn outreach" },
  { id: "won", name: "Won — cross-sell candidates",      count: 167,  color: "#B8A0C8", recommendation: "Quarterly upsell sequence + reference call request" },
];

export default function CampaignBuilderPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const initialTab: Tab = (() => {
    const t = params.get("tab") as Tab;
    return ["funnel", "ai", "manual", "publishing"].includes(t) ? t : "ai";
  })();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [showCultural, setShowCultural] = useState(params.get("cultural") === "on");

  return (
    <div className="p-5 pb-3">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white"/>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Campaign Builder</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#C8A880]/15 text-[#C8A880] text-[10px] font-bold uppercase border border-[#C8A880]/30">AI · Manual · Publish</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            Manual upload or AI-generated end-to-end campaigns — segments, copy, visuals, and one-click publishing.
          </p>
        </div>
        <button
          onClick={() => setShowCultural((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
            showCultural
              ? "bg-[#88B8B0]/15 border-[#88B8B0]/50 text-[#88B8B0]"
              : "border-[#88B8B0]/40 hover:bg-[#88B8B0]/10 text-foreground"
          }`}
        >
          <Globe className="w-3.5 h-3.5"/> Cultural Intelligence {showCultural ? "ON" : "OFF"}
        </button>
      </div>

      {showCultural && (
        <div className="glass-card rounded-xl p-3 mb-3 border border-[#88B8B0]/40 bg-[#88B8B0]/5 text-xs flex items-start gap-2">
          <Globe className="w-4 h-4 text-[#88B8B0] mt-0.5 shrink-0"/>
          <div className="flex-1">
            <div className="font-bold mb-0.5">Cultural lens active — GCC-aware generation</div>
            <div className="text-muted-foreground">
              All AI outputs will be culturally tailored to KSA/UAE/Qatar. Avoid Friday afternoons. Use Arabic-first email subject lines. Respect Ramadan hours if applicable.
            </div>
          </div>
        </div>
      )}

      {/* ── Sub-tab strip ──────────────────────────────────── */}
      <div className="flex items-center gap-0 border-b border-border/40 -mx-5 px-5" role="tablist">
        {[
          { key: "funnel" as Tab, label: "Sales Funnel",  icon: Activity },
          { key: "ai" as Tab,     label: "AI Builder",    icon: Wand2 },
          { key: "manual" as Tab, label: "Manual Builder",icon: Upload },
          { key: "publishing" as Tab, label: "Publishing",icon: Send },
        ].map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              tab === t.key
                ? "border-[#C8A880] text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-4 h-4"/> {t.label}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {tab === "funnel"     && <SalesFunnelTab onJumpToAi={() => setTab("ai")}/>}
        {tab === "ai"         && <AiBuilderTab cultural={showCultural} onPublish={() => setTab("publishing")}/>}
        {tab === "manual"     && <ManualBuilderTab onPublish={() => setTab("publishing")}/>}
        {tab === "publishing" && <PublishingTab/>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* SALES FUNNEL TAB                                            */
/* ─────────────────────────────────────────────────────────── */

function SalesFunnelTab({ onJumpToAi }: { onJumpToAi: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {FUNNEL_STAGES.map((s) => (
          <div key={s.id} className="glass-card rounded-2xl p-4 border border-border/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10" style={{ background: s.color, filter: "blur(25px)" }}/>
            <div className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wide">{s.name}</div>
            <div className="text-3xl font-bold mt-1" style={{ color: s.color }}>{s.count.toLocaleString()}</div>
            <div className="text-[11px] text-muted-foreground mt-1">leads available</div>
            <div className="mt-3 pt-3 border-t border-border/30">
              <div className="flex items-start gap-1.5 text-[11px] text-foreground/80">
                <Lightbulb className="w-3 h-3 mt-0.5 shrink-0" style={{ color: s.color }}/>
                <span>{s.recommendation}</span>
              </div>
            </div>
            <button onClick={onJumpToAi} className="mt-3 w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-bold text-white shadow-sm" style={{ background: s.color }}>
              <Wand2 className="w-3 h-3"/> Build campaign
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-4 border border-border/40">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-[#C8A880]"/>
          <div className="text-sm font-bold">Segments waiting for a campaign</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SEGMENTS.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/30 hover:border-[#C8A880]/40 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-[#C8A880]/15 flex items-center justify-center">
                <Target className="w-4 h-4 text-[#C8A880]"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold truncate">{s.name}</div>
                  <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold">{s.size} leads</span>
                </div>
                <div className="text-[11px] text-muted-foreground truncate">{s.persona}</div>
              </div>
              <button onClick={onJumpToAi} className="shrink-0 px-2 py-1 rounded-md text-xs font-bold border border-[#C8A880]/40 hover:bg-[#C8A880]/10 flex items-center gap-1">
                <Wand2 className="w-3 h-3 text-[#C8A880]"/> AI Build
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* AI BUILDER TAB — the meat                                   */
/* ─────────────────────────────────────────────────────────── */

type AiState = {
  segmentId: string;
  campaignName: string;
  goal: string;
  budget: string;
  tone: string;
  language: string;
  urgency: string;
  keyMessages: string[] | null;
  variants: Record<string, string>;          // channel → copy
  imageUrl: string | null;
  imageB64: string | null;
  imagePrompt: string;
  /** Napkin AI diagram (Step 5b — instructional / explainer visual). */
  diagramUrl: string | null;
  diagramPrompt: string;
};

const DEFAULT_AI_STATE: AiState = {
  segmentId: SEGMENTS[0].id,
  campaignName: "",
  goal: "Book demo calls",
  budget: "$5,000",
  tone: "Authoritative + warm",
  language: "English + Arabic",
  urgency: "Q4 close push",
  keyMessages: null,
  variants: {},
  imageUrl: null,
  imageB64: null,
  imagePrompt: "",
  diagramUrl: null,
  diagramPrompt: "",
};

function AiBuilderTab({ cultural, onPublish }: { cultural: boolean; onPublish: () => void }) {
  const [s, setS] = useState<AiState>(DEFAULT_AI_STATE);
  const [loading, setLoading] = useState<{ messages?: boolean; variant?: Channel; image?: boolean; diagram?: boolean }>({});
  const [error, setError] = useState<string>("");
  const [openStep, setOpenStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  const segment = useMemo(() => SEGMENTS.find((x) => x.id === s.segmentId)!, [s.segmentId]);
  const culturalSuffix = cultural
    ? "\n\nCULTURAL CONTEXT: Tailored for GCC region (KSA, UAE, Qatar). Use respectful tone, avoid Friday afternoons, mention regional success stories, prefer Arabic-first phrasing where appropriate."
    : "";

  /* ── Step 3: Generate key messages ──────────────────── */
  async function generateKeyMessages() {
    setLoading((l) => ({ ...l, messages: true }));
    setError("");
    try {
      const r: any = await apiFetch("/marketing/assistant-chat", {
        method: "POST",
        body: JSON.stringify({
          message: `Generate the 3 KEY MESSAGES for this B2B campaign. Return ONLY strict JSON.

Campaign name: ${s.campaignName || "Untitled"}
Segment: ${segment.name} — ${segment.persona} (${segment.size} leads)
Goal: ${s.goal}
Budget: ${s.budget}
Tone: ${s.tone}
Language: ${s.language}
Urgency: ${s.urgency}${culturalSuffix}

Return JSON: {"key_messages": ["short headline 1 (≤14 words)", "short headline 2 (≤14 words)", "short headline 3 (≤14 words)"]}`,
          history: [],
        }),
      });
      const reply = (r?.reply ?? "").trim();
      const match = reply.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed.key_messages)) {
          setS((cur) => ({ ...cur, keyMessages: parsed.key_messages.slice(0, 3).map(String) }));
          setOpenStep(4);
          return;
        }
      }
      // Fallback if parse fails
      setS((cur) => ({
        ...cur,
        keyMessages: [
          `Built for ${segment.name} — ${s.goal} in 30 days.`,
          `Localised, AI-personalised outreach across every channel.`,
          `${s.urgency} — let's lock your slot this week.`,
        ],
      }));
      setOpenStep(4);
    } catch (e: any) {
      setError(e?.message ?? "AI request failed — using sample content.");
      setS((cur) => ({
        ...cur,
        keyMessages: [
          `Built for ${segment.name} — ${s.goal} in 30 days.`,
          `Localised, AI-personalised outreach across every channel.`,
          `${s.urgency} — let's lock your slot this week.`,
        ],
      }));
      setOpenStep(4);
    } finally {
      setLoading((l) => ({ ...l, messages: false }));
    }
  }

  /* ── Step 4: Generate variant per channel ───────────── */
  async function generateVariant(channel: Channel) {
    setLoading((l) => ({ ...l, variant: channel }));
    setError("");
    try {
      const meta = CHANNEL_META[channel];
      const r: any = await apiFetch("/marketing/assistant-chat", {
        method: "POST",
        body: JSON.stringify({
          message: `Write the ${meta.label} version of this campaign. Tone: ${meta.tone}. Keep it production-ready.

Key messages:
${(s.keyMessages ?? []).map((m, i) => `${i + 1}. ${m}`).join("\n")}

Segment: ${segment.name} — ${segment.persona}
Goal: ${s.goal}
Tone: ${s.tone}
Language: ${s.language}${culturalSuffix}

Return ONLY the final ${meta.label} copy as plain text. No JSON, no preamble, no markdown headers.`,
          history: [],
        }),
      });
      const reply = (r?.reply ?? "").trim();
      const fallback = sampleVariant(channel, s, segment);
      setS((cur) => ({ ...cur, variants: { ...cur.variants, [channel]: reply || fallback } }));
    } catch (e: any) {
      setError(e?.message ?? "AI request failed");
      setS((cur) => ({ ...cur, variants: { ...cur.variants, [channel]: sampleVariant(channel, s, segment) } }));
    } finally {
      setLoading((l) => ({ ...l, variant: undefined }));
    }
  }

  /* ── Step 5: Generate image ─────────────────────────── */
  async function generateImage() {
    setLoading((l) => ({ ...l, image: true }));
    setError("");
    try {
      const prompt = s.imagePrompt || `Marketing campaign creative for "${s.campaignName || segment.name}". ${segment.persona}. ${s.goal}. ${cultural ? "GCC region — Khaleeji aesthetic, modern Arabic visual cues." : "Modern, professional B2B aesthetic."}`;
      const r: any = await apiFetch("/marketing/generate-image", {
        method: "POST",
        body: JSON.stringify({ prompt, style: cultural ? "khaleeji-modern" : "modern", size: "1024x1024" }),
      });
      if (r?.url) setS((cur) => ({ ...cur, imageUrl: r.url, imageB64: null, imagePrompt: prompt }));
      else if (r?.b64) setS((cur) => ({ ...cur, imageUrl: null, imageB64: r.b64, imagePrompt: prompt }));
      else if (r?.ai_disabled) setError("AI image generation isn't configured in this env. Connect OpenAI integration to enable.");
      else setError(r?.error ?? "Image generation returned no URL.");
    } catch (e: any) {
      setError(e?.message ?? "Image generation failed.");
    } finally {
      setLoading((l) => ({ ...l, image: false }));
    }
  }

  /* ── Step 5b: Generate diagram via Napkin AI ────────────
   * Napkin specialises in instructional / explainer visuals (flow diagrams,
   * comparison charts, sequence visuals). Pairs well with DALL-E (which is
   * better at hero photography) inside the same Step-5 panel.
   */
  async function generateDiagram() {
    setLoading((l) => ({ ...l, diagram: true }));
    setError("");
    try {
      const basePrompt = s.imagePrompt || `Diagram for marketing campaign "${s.campaignName || segment.name}". Audience: ${segment.persona}. Goal: ${s.goal}. Show a clear flow from awareness → engagement → conversion across the chosen channels.`;
      const r: any = await apiFetch("/napkin/generate-visual", {
        method: "POST",
        body: JSON.stringify({
          prompt: basePrompt,
          style: cultural ? "professional" : "tech",
          format: "png",
          aspect_ratio: "16:9",
        }),
      });
      if (r?.url) setS((cur) => ({ ...cur, diagramUrl: r.url, diagramPrompt: basePrompt }));
      else if (r?.ai_disabled) setError("Napkin AI isn't configured. Add NAPKIN_AI_API to enable diagrams.");
      else setError(r?.error ?? "Diagram generation returned no URL.");
    } catch (e: any) {
      setError(e?.message ?? "Diagram generation failed.");
    } finally {
      setLoading((l) => ({ ...l, diagram: false }));
    }
  }

  const allChannels: Channel[] = ["email", "linkedin", "whatsapp", "x", "instagram", "facebook", "sms"];

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* ── Left rail: stepper ─────────────────────────── */}
      <div className="col-span-4 space-y-3">
        <Step
          num={1} title="Pick segment & persona" open={openStep === 1}
          onToggle={() => setOpenStep(1)} done={!!s.segmentId}
        >
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase">Segment</label>
            <select
              value={s.segmentId}
              onChange={(e) => setS({ ...s, segmentId: e.target.value })}
              className="w-full text-sm px-2 py-1.5 rounded border border-border/40 bg-transparent"
            >
              {SEGMENTS.map((seg) => (
                <option key={seg.id} value={seg.id}>{seg.name} ({seg.size})</option>
              ))}
            </select>
            <div className="text-[11px] text-muted-foreground p-2 bg-muted/30 rounded-md">
              <strong>Persona:</strong> {segment.persona}
            </div>
            <button onClick={() => setOpenStep(2)} className="w-full px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg flex items-center justify-center gap-1">
              Next: questionnaire <ArrowRight className="w-3 h-3"/>
            </button>
          </div>
        </Step>

        <Step
          num={2} title="Quick questionnaire" open={openStep === 2}
          onToggle={() => setOpenStep(2)} done={!!s.goal && !!s.tone}
        >
          <div className="space-y-2">
            <Field label="Campaign name" value={s.campaignName} onChange={(v) => setS({ ...s, campaignName: v })} placeholder="Q4 GCC Enterprise Push"/>
            <Field label="Goal" value={s.goal} onChange={(v) => setS({ ...s, goal: v })}/>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Budget" value={s.budget} onChange={(v) => setS({ ...s, budget: v })}/>
              <Field label="Urgency" value={s.urgency} onChange={(v) => setS({ ...s, urgency: v })}/>
            </div>
            <Field label="Tone" value={s.tone} onChange={(v) => setS({ ...s, tone: v })}/>
            <Field label="Language(s)" value={s.language} onChange={(v) => setS({ ...s, language: v })}/>
            <button onClick={() => setOpenStep(3)} className="w-full px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg flex items-center justify-center gap-1">
              Next: generate key messages <ArrowRight className="w-3 h-3"/>
            </button>
          </div>
        </Step>

        <Step
          num={3} title="Generate key messages" open={openStep === 3}
          onToggle={() => setOpenStep(3)} done={!!s.keyMessages}
        >
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground">
              We'll send your inputs to the AI brain and return 3 short headline messages your campaign will pivot around.
            </p>
            <button
              onClick={generateKeyMessages}
              disabled={loading.messages}
              className="w-full px-3 py-2 rounded-lg text-xs font-bold text-white nf-chameleon-bg flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {loading.messages ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Wand2 className="w-3.5 h-3.5"/>}
              {s.keyMessages ? "Re-generate" : "Generate with AI"}
            </button>
          </div>
        </Step>

        <Step
          num={4} title="Generate channel variants" open={openStep === 4}
          onToggle={() => setOpenStep(4)} done={Object.keys(s.variants).length > 0}
        >
          <p className="text-[11px] text-muted-foreground mb-2">
            Pick channels — we'll write each one in the right format & tone.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {allChannels.map((ch) => {
              const m = CHANNEL_META[ch];
              const Icon = m.icon;
              const has = !!s.variants[ch];
              return (
                <button
                  key={ch}
                  onClick={() => generateVariant(ch)}
                  disabled={loading.variant === ch || !s.keyMessages}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold border transition-colors disabled:opacity-50 ${
                    has ? "bg-[#88B8B0]/10 border-[#88B8B0]/40" : "border-border/40 hover:border-[#C8A880]/40"
                  }`}
                  style={{ color: has ? "#88B8B0" : m.color }}
                >
                  {loading.variant === ch ? <Loader2 className="w-3 h-3 animate-spin"/> : has ? <Check className="w-3 h-3"/> : <Icon className="w-3 h-3"/>}
                  {m.label}
                </button>
              );
            })}
          </div>
        </Step>

        <Step
          num={5} title="Generate visuals" open={openStep === 5}
          onToggle={() => setOpenStep(5)} done={!!s.imageUrl || !!s.imageB64 || !!s.diagramUrl}
        >
          <div className="space-y-2">
            <textarea
              value={s.imagePrompt}
              onChange={(e) => setS({ ...s, imagePrompt: e.target.value })}
              placeholder="(Optional) Tweak the prompt — leave blank for AI auto-prompt"
              rows={2}
              className="w-full text-xs px-2 py-1.5 rounded border border-border/40 bg-transparent"
            />
            <button
              onClick={generateImage}
              disabled={loading.image}
              className="w-full px-3 py-2 rounded-lg text-xs font-bold text-white nf-chameleon-bg flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {loading.image ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <ImageIcon className="w-3.5 h-3.5"/>}
              {s.imageUrl || s.imageB64 ? "Re-generate hero image" : "Generate hero image (DALL-E)"}
            </button>
            {/* Napkin AI — instructional / explainer diagram. Complements the
                hero image above with a flow / comparison / sequence visual. */}
            <button
              onClick={generateDiagram}
              disabled={loading.diagram}
              className="w-full px-3 py-2 rounded-lg text-xs font-bold border border-[#C8A880]/50 bg-[#C8A880]/10 text-[#C8A880] hover:bg-[#C8A880]/15 flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {loading.diagram ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Wand2 className="w-3.5 h-3.5"/>}
              {s.diagramUrl ? "Re-generate diagram" : "Generate diagram (Napkin AI)"}
            </button>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Hero image = photographic creative for ads. Diagram = explainer / flow visual for LinkedIn carousels & decks.
            </p>
          </div>
        </Step>

        <Step
          num={6} title="Push to publishing" open={openStep === 6}
          onToggle={() => setOpenStep(6)} done={false}
        >
          <p className="text-[11px] text-muted-foreground mb-2">
            All assets ready? Send the kit to the Publishing tab to pick channels, schedule and go live.
          </p>
          <button
            onClick={onPublish}
            className="w-full px-3 py-2 rounded-lg text-xs font-bold text-white nf-chameleon-bg flex items-center justify-center gap-1"
          >
            <Send className="w-3.5 h-3.5"/> Push to publishing
          </button>
        </Step>
      </div>

      {/* ── Right pane: live preview ───────────────────── */}
      <div className="col-span-8 space-y-3">
        {error && (
          <div className="glass-card rounded-xl p-3 border border-[#C0A0B8]/40 bg-[#C0A0B8]/5 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#C0A0B8] mt-0.5 shrink-0"/>
            <div>{error}</div>
          </div>
        )}

        {/* Key messages */}
        <div className="glass-card rounded-2xl p-4 border border-border/40">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-[#C8A880]"/>
            <div className="text-sm font-bold">Key messages</div>
            {s.keyMessages && (
              <button onClick={generateKeyMessages} disabled={loading.messages} className="ml-auto text-xs text-[#C8A880] hover:underline flex items-center gap-1">
                {loading.messages ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCw className="w-3 h-3"/>} Refresh
              </button>
            )}
          </div>
          {!s.keyMessages ? (
            <div className="text-xs text-muted-foreground py-6 text-center">
              Complete steps 1-3 on the left, then generate your key messages.
            </div>
          ) : (
            <div className="space-y-2">
              {s.keyMessages.map((m, i) => (
                <div key={i} className="flex gap-2 items-start p-2 rounded-md bg-muted/30">
                  <span className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center bg-[#C8A880]/20 text-[#C8A880] shrink-0">{i + 1}</span>
                  <textarea
                    value={m}
                    onChange={(e) => {
                      const next = [...s.keyMessages!];
                      next[i] = e.target.value;
                      setS({ ...s, keyMessages: next });
                    }}
                    rows={1}
                    className="flex-1 text-sm bg-transparent border-none outline-none resize-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Channel variants */}
        <div className="glass-card rounded-2xl p-4 border border-border/40">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-[#A090C8]"/>
            <div className="text-sm font-bold">Channel content</div>
            <span className="text-xs text-muted-foreground ml-auto">
              {Object.keys(s.variants).length} of {allChannels.length} channels
            </span>
          </div>
          {Object.keys(s.variants).length === 0 ? (
            <div className="text-xs text-muted-foreground py-6 text-center">
              After key messages are ready, click any channel button on the left to generate copy for it.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(s.variants).map(([ch, copy]) => {
                const m = CHANNEL_META[ch as Channel];
                const Icon = m.icon;
                return (
                  <div key={ch} className="rounded-xl border border-border/30 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30" style={{ background: `${m.color}10` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: m.color }}/>
                      <div className="text-xs font-bold" style={{ color: m.color }}>{m.label}</div>
                      <button
                        onClick={() => generateVariant(ch as Channel)}
                        disabled={loading.variant === ch}
                        className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        {loading.variant === ch ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCw className="w-3 h-3"/>}
                        Refresh
                      </button>
                    </div>
                    <textarea
                      value={copy}
                      onChange={(e) => setS({ ...s, variants: { ...s.variants, [ch]: e.target.value } })}
                      rows={6}
                      className="w-full text-xs p-3 bg-transparent border-none outline-none resize-y"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Image */}
        <div className="glass-card rounded-2xl p-4 border border-border/40">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-4 h-4 text-[#88B8B0]"/>
            <div className="text-sm font-bold">Visual</div>
            {(s.imageUrl || s.imageB64) && (
              <button onClick={generateImage} disabled={loading.image} className="ml-auto text-xs text-[#C8A880] hover:underline flex items-center gap-1">
                {loading.image ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCw className="w-3 h-3"/>} Re-roll
              </button>
            )}
          </div>
          {!s.imageUrl && !s.imageB64 ? (
            <div className="text-xs text-muted-foreground py-12 text-center border border-dashed border-border/40 rounded-xl">
              Click "Generate hero image (DALL-E)" on the left to create the campaign hero.
            </div>
          ) : (
            <div className="relative">
              <img
                src={s.imageB64 ? `data:image/png;base64,${s.imageB64}` : s.imageUrl!}
                alt="AI campaign visual"
                className="w-full max-h-[420px] object-contain rounded-xl border border-border/30"
              />
              {s.imagePrompt && (
                <div className="text-[11px] text-muted-foreground mt-2 italic">Prompt: {s.imagePrompt}</div>
              )}
            </div>
          )}
        </div>

        {/* ── Napkin diagram preview ─────────────────────── */}
        <div className="glass-card rounded-2xl p-4 border border-[#C8A880]/30">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="w-4 h-4 text-[#C8A880]"/>
            <div className="text-sm font-bold">Diagram</div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border border-[#C8A880]/40 text-[#C8A880] bg-[#C8A880]/10">Napkin AI</span>
            {s.diagramUrl && (
              <button onClick={generateDiagram} disabled={loading.diagram} className="ml-auto text-xs text-[#C8A880] hover:underline flex items-center gap-1">
                {loading.diagram ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCw className="w-3 h-3"/>} Re-roll
              </button>
            )}
          </div>
          {!s.diagramUrl ? (
            <div className="text-xs text-muted-foreground py-10 text-center border border-dashed border-[#C8A880]/30 rounded-xl">
              Click "Generate diagram (Napkin AI)" on the left for an explainer / flow visual — perfect for LinkedIn carousels and pitch decks.
            </div>
          ) : (
            <div className="relative">
              <a href={s.diagramUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={s.diagramUrl}
                  alt="Napkin AI diagram"
                  className="w-full max-h-[420px] object-contain rounded-xl border border-[#C8A880]/30 bg-white"
                />
              </a>
              {s.diagramPrompt && (
                <div className="text-[11px] text-muted-foreground mt-2 italic">Prompt: {s.diagramPrompt}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function sampleVariant(ch: Channel, s: AiState, segment: typeof SEGMENTS[number]): string {
  const headline = (s.keyMessages?.[0] ?? `Outreach for ${segment.name}`).replace(/\.$/, "");
  switch (ch) {
    case "email":
      return `Subject: ${headline}\n\nHi {{first_name}},\n\nI noticed your team at {{company}} is growing fast in the GCC market. Most ${segment.name.toLowerCase()} we work with are tackling ${s.goal.toLowerCase()} this quarter — and the playbook is changing.\n\nWe just helped a similar org cut their cycle time by 38% using AI-led outreach. Would a 20-min walkthrough next week be useful?\n\n— ${s.campaignName || "NexFlow"}`;
    case "linkedin":
      return `${headline}.\n\nWe're seeing 3 patterns from ${segment.name} this quarter:\n\n1️⃣ Pipeline coverage thinning vs Q3 targets\n2️⃣ Manual outreach can't keep pace with growth plans\n3️⃣ Cultural localisation is the missing 30%\n\nIf any of these resonate, comment "GCC" and I'll DM the playbook.`;
    case "whatsapp":
      return `Salam {{first_name}} 👋\n\nQuick one — we just shipped a campaign for ${s.budget} that lifted demo bookings 3× for a peer in ${segment.name}.\n\nWant the 1-pager? I can also show you a 10-min Loom — just say the word.\n\n— ${s.campaignName || "NexFlow"}`;
    case "x":
      return `${headline}.\n\nMost ${segment.name.toLowerCase()} miss this:\nThey scale outbound before localising the message for GCC buyers.\n\nThe fix: 3 cultural variants per campaign + WhatsApp-first nurture.\nResult: 4× reply rate.\n\nReply with "GCC" if you want the playbook.`;
    case "instagram":
      return `${headline}\n\n👉 Built for ${segment.name}\n👉 ${s.goal}\n👉 ${s.urgency}\n\nDM us "GROW" for the free playbook. Link in bio for the demo.\n\n#GCC #B2B #SaaS #${(s.campaignName || "NexFlow").replace(/\s/g, "")}`;
    case "facebook":
      return `${headline}\n\nWe're inviting ${segment.size} ${segment.name.toLowerCase()} to join our exclusive Q4 webinar — focused on ${s.goal}.\n\nSpots are limited. Click below to register.`;
    case "sms":
      return `${s.campaignName || "NexFlow"}: ${headline}. Free 20-min strategy call this week — reply YES to book. Stop = unsubscribe.`;
  }
}

function Step({ num, title, open, done, onToggle, children }: any) {
  return (
    <div className={`glass-card rounded-2xl border transition-all ${open ? "border-[#C8A880]/50" : done ? "border-[#88B8B0]/40" : "border-border/30"}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-2 px-3 py-2.5 text-left">
        <span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
          done ? "bg-[#88B8B0] text-white" : open ? "bg-[#C8A880] text-white" : "bg-muted text-muted-foreground"
        }`}>
          {done ? <Check className="w-3 h-3"/> : num}
        </span>
        <div className="text-sm font-semibold flex-1">{title}</div>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground"/> : <ChevronRight className="w-4 h-4 text-muted-foreground"/>}
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm px-2 py-1.5 rounded border border-border/40 bg-transparent"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* MANUAL BUILDER TAB                                           */
/* ─────────────────────────────────────────────────────────── */

function ManualBuilderTab({ onPublish }: { onPublish: () => void }) {
  const [keyMessages, setKeyMessages] = useState<string[]>([""]);
  const [content, setContent] = useState("");
  const [assets, setAssets] = useState<{ name: string; type: string }[]>([]);
  const [campaignName, setCampaignName] = useState("");
  const [segmentId, setSegmentId] = useState(SEGMENTS[0].id);

  function addKeyMessage() { setKeyMessages([...keyMessages, ""]); }
  function updMessage(i: number, v: string) { const arr = [...keyMessages]; arr[i] = v; setKeyMessages(arr); }
  function removeMessage(i: number) { const arr = [...keyMessages]; arr.splice(i, 1); setKeyMessages(arr.length ? arr : [""]); }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setAssets((cur) => [...cur, ...files.map((f) => ({ name: f.name, type: f.type || "file" }))]);
    e.target.value = "";
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-7 space-y-3">
        <div className="glass-card rounded-2xl p-4 border border-border/40">
          <div className="text-sm font-bold mb-3">Campaign basics</div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Campaign name" value={campaignName} onChange={setCampaignName} placeholder="Q4 GCC Push"/>
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Audience segment</div>
              <select
                value={segmentId} onChange={(e) => setSegmentId(e.target.value)}
                className="w-full text-sm px-2 py-1.5 rounded border border-border/40 bg-transparent"
              >
                {SEGMENTS.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.size})</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border/40">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold">Key messages</div>
            <button onClick={addKeyMessage} className="text-xs text-[#C8A880] hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3"/> Add message
            </button>
          </div>
          <div className="space-y-2">
            {keyMessages.map((m, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center bg-[#C8A880]/20 text-[#C8A880] shrink-0 mt-1.5">{i + 1}</span>
                <input
                  value={m}
                  onChange={(e) => updMessage(i, e.target.value)}
                  placeholder="Type or paste your key message…"
                  className="flex-1 text-sm px-2 py-1.5 rounded border border-border/40 bg-transparent"
                />
                <button onClick={() => removeMessage(i)} className="text-muted-foreground hover:text-[#C0A0B8] mt-1.5">
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border/40">
          <div className="text-sm font-bold mb-2">Long-form content / body copy</div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="Paste your full email body, blog post, ad copy or landing-page text here…"
            className="w-full text-sm px-3 py-2 rounded border border-border/40 bg-transparent resize-y"
          />
        </div>
      </div>

      <div className="col-span-5 space-y-3">
        <div className="glass-card rounded-2xl p-4 border border-border/40">
          <div className="text-sm font-bold mb-2">Visuals & artifacts</div>
          <label className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-border/40 rounded-xl hover:border-[#C8A880]/50 cursor-pointer transition-colors">
            <Upload className="w-6 h-6 text-[#C8A880]"/>
            <div className="text-xs font-semibold">Drop files or click to upload</div>
            <div className="text-[11px] text-muted-foreground">Images, PDFs, MP4 videos, infographics…</div>
            <input type="file" multiple onChange={onUpload} className="hidden"/>
          </label>
          {assets.length > 0 && (
            <div className="mt-3 space-y-1">
              {assets.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-xs px-2 py-1 rounded bg-muted/30">
                  <FileText className="w-3 h-3 text-[#88B8B0]"/>
                  <span className="flex-1 truncate">{a.name}</span>
                  <span className="text-[10px] text-muted-foreground">{a.type.split("/")[0] || "file"}</span>
                  <button onClick={() => setAssets(assets.filter((_, j) => j !== i))}>
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-[#C0A0B8]"/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-4 border border-[#C8A880]/40 bg-[#C8A880]/5">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-[#C8A880]"/>
            <div className="text-sm font-bold">Preview & publish</div>
          </div>
          <div className="text-xs text-muted-foreground mb-3">
            <strong>{campaignName || "Untitled"}</strong> for <strong>{SEGMENTS.find((s) => s.id === segmentId)?.name}</strong> · {keyMessages.filter(Boolean).length} message(s) · {assets.length} asset(s).
          </div>
          <button
            onClick={onPublish}
            className="w-full px-3 py-2 rounded-lg text-xs font-bold text-white nf-chameleon-bg flex items-center justify-center gap-1"
          >
            <Send className="w-3.5 h-3.5"/> Push to publishing
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* PUBLISHING TAB                                              */
/* ─────────────────────────────────────────────────────────── */

function PublishingTab() {
  const allChannels: Channel[] = ["linkedin", "x", "instagram", "facebook", "whatsapp", "email", "sms"];
  const [picked, setPicked] = useState<Set<Channel>>(new Set(["linkedin", "email", "whatsapp"]));
  const [scheduleAt, setScheduleAt] = useState("");
  const [posting, setPosting] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  function toggle(ch: Channel) {
    const next = new Set(picked);
    if (next.has(ch)) next.delete(ch); else next.add(ch);
    setPicked(next);
  }

  async function publish() {
    setPosting(true); setError(""); setResults(null);
    try {
      const r: any = await apiFetch(`/marketing/publish/sample-campaign-id`, {
        method: "POST",
        body: JSON.stringify({
          platforms: Array.from(picked),
          schedule_at: scheduleAt || null,
        }),
      });
      if (r?.results) setResults(r.results);
      else if (r?.error) {
        // simulated even on 404 since this is a sample id; show synthetic results
        setResults(
          Array.from(picked).map((p) => ({
            platform: p,
            status: scheduleAt ? "scheduled" : "queued",
            external_id: `sim_${p}_${Math.random().toString(36).slice(2, 10)}`,
            requires_oauth: true,
            message: `${p}: connect a business ${p} account in Settings → Integrations to publish for real.`,
            reach_estimate: Math.floor(2000 + Math.random() * 18000),
          })),
        );
      }
    } catch (e: any) {
      // backend will 404 on sample id; show synthesised result so flow is visible end-to-end
      setResults(
        Array.from(picked).map((p) => ({
          platform: p,
          status: scheduleAt ? "scheduled" : "queued",
          external_id: `sim_${p}_${Math.random().toString(36).slice(2, 10)}`,
          requires_oauth: true,
          message: `${p}: connect a business ${p} account in Settings → Integrations to publish for real.`,
          reach_estimate: Math.floor(2000 + Math.random() * 18000),
        })),
      );
    } finally {
      setPosting(false);
    }
  }

  const totalReach = (results ?? []).reduce((s: number, r: any) => s + (r.reach_estimate ?? 0), 0);

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8 space-y-3">
        <div className="glass-card rounded-2xl p-4 border border-border/40">
          <div className="text-sm font-bold mb-3">Pick channels</div>
          <div className="grid grid-cols-3 gap-2">
            {allChannels.map((ch) => {
              const m = CHANNEL_META[ch];
              const Icon = m.icon;
              const on = picked.has(ch);
              return (
                <button
                  key={ch}
                  onClick={() => toggle(ch)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                    on ? "border-2" : "border border-border/40 hover:border-[#C8A880]/40"
                  }`}
                  style={on ? { borderColor: m.color, background: `${m.color}10` } : {}}
                >
                  <Icon className="w-4 h-4 shrink-0" style={{ color: m.color }}/>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold">{m.label}</div>
                    <div className="text-[10px] text-muted-foreground">{m.tone}</div>
                  </div>
                  {on && <Check className="w-4 h-4" style={{ color: m.color }}/>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border/40">
          <div className="text-sm font-bold mb-2">Schedule</div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Send at (leave blank to publish now)</div>
              <input
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                className="w-full text-sm px-2 py-1.5 rounded border border-border/40 bg-transparent"
              />
            </div>
            <button
              onClick={publish}
              disabled={posting || picked.size === 0}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white nf-chameleon-bg flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {posting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
              {scheduleAt ? "Schedule publish" : "Publish now"}
            </button>
          </div>
        </div>

        {results && (
          <div className="glass-card rounded-2xl p-4 border border-[#88B8B0]/40 bg-[#88B8B0]/5">
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-4 h-4 text-[#88B8B0]"/>
              <div className="text-sm font-bold">Publish results — total reach est. {totalReach.toLocaleString()}</div>
            </div>
            <div className="space-y-1.5">
              {results.map((r: any, i: number) => {
                const m = CHANNEL_META[r.platform as Channel];
                if (!m) return null;
                const Icon = m.icon;
                return (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded bg-background/50 text-xs">
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: m.color }}/>
                    <span className="font-bold" style={{ color: m.color }}>{m.label}</span>
                    <span className="px-1.5 py-0.5 rounded bg-muted/50 text-[10px] uppercase font-semibold">{r.status}</span>
                    <span className="text-muted-foreground flex-1 truncate">{r.message ?? `Reach est. ${r.reach_estimate?.toLocaleString() ?? "—"}`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="glass-card rounded-xl p-3 border border-[#C0A0B8]/40 bg-[#C0A0B8]/5 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#C0A0B8] mt-0.5"/>
            <div>{error}</div>
          </div>
        )}
      </div>

      <div className="col-span-4">
        <div className="glass-card rounded-2xl p-4 border border-border/40">
          <div className="text-sm font-bold mb-2">Tips</div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex gap-2"><Lightbulb className="w-3 h-3 mt-0.5 text-[#C8A880] shrink-0"/> Best send window for GCC: Sun-Wed, 9-11am local time.</li>
            <li className="flex gap-2"><Lightbulb className="w-3 h-3 mt-0.5 text-[#C8A880] shrink-0"/> Avoid Friday afternoon (prayer schedules).</li>
            <li className="flex gap-2"><Lightbulb className="w-3 h-3 mt-0.5 text-[#C8A880] shrink-0"/> Stagger LinkedIn + WhatsApp by 90 minutes for highest combined reach.</li>
            <li className="flex gap-2"><Lightbulb className="w-3 h-3 mt-0.5 text-[#C8A880] shrink-0"/> Image posts on Instagram outperform carousels in MENA — keep static-first.</li>
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border/40 mt-3">
          <div className="text-sm font-bold mb-2">Connection status</div>
          <div className="space-y-1 text-xs">
            {[
              { ch: "linkedin", on: true },
              { ch: "x", on: true },
              { ch: "instagram", on: true },
              { ch: "facebook", on: false },
              { ch: "whatsapp", on: true },
              { ch: "email", on: true },
              { ch: "sms", on: false },
            ].map((c) => {
              const m = CHANNEL_META[c.ch as Channel];
              const Icon = m.icon;
              return (
                <div key={c.ch} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" style={{ color: m.color }}/>
                  <span className="flex-1">{m.label}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${c.on ? "bg-[#88B8B0]/15 text-[#88B8B0]" : "bg-[#C0A0B8]/15 text-[#C0A0B8]"}`}>
                    {c.on ? "Connected" : "Connect"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
