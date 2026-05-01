import { useState } from "react";
import {
  Bot, Phone, PhoneCall, Play, Pause, Volume2, Plus,
  Activity, Languages, Brain, ChevronRight, Mic, X, Loader2, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgents, useCreate, useAiDraftAgent, useRunAiAgent } from "@/hooks/useApi";
import { speakViaServer, pickServerVoice, stopServerSpeak } from "@/lib/voice";

// Default voices for outbound/inbound calls — Gulf Arabic FEMALE (Layla) is the
// platform default. Faisal is the Gulf Arabic MALE counterpart. English voices
// are kept as alternates only.
const VOICES = [
  { id: "v1", name: "Layla",  gender: "Female", language: "Arabic Gulf",      lang: "ar-SA", style: "Warm, professional",          samples: 12, default: true,  sample: "مرحبا، أنا ليلى من نكسفلو. كيف أقدر أساعدك اليوم؟" },
  { id: "v4", name: "Faisal", gender: "Male",   language: "Arabic Gulf (KSA)",lang: "ar-SA", style: "Authoritative, calm",         samples: 7,  default: true,  sample: "أهلين، أنا فيصل من نكسفلو. متى يناسبك نتكلم عن العرض؟" },
  { id: "v3", name: "Noor",   gender: "Female", language: "Bilingual AR/EN",  lang: "ar",    style: "Friendly, dynamic",           samples: 9,  sample: "Hello — I'm Noor. أقدر أكلمك بالعربي أو بالإنجليزي." },
  { id: "v2", name: "Adam",   gender: "Male",   language: "English Neutral",  lang: "en-US", style: "Confident, clear",            samples: 18, sample: "Hi, this is Adam from NexFlow. Do you have a quick minute?" },
  { id: "v5", name: "Reem",   gender: "Female", language: "Arabic Levantine", lang: "ar",    style: "Soft, persuasive",            samples: 5,  sample: "مرحبا، أنا ريم. كيف أقدر أخدمك؟" },
  { id: "v6", name: "Omar",   gender: "Male",   language: "Arabic Egyptian",  lang: "ar-EG", style: "Energetic",                   samples: 4,  sample: "أهلاً، أنا عمر. عامل إيه النهاردة؟" },
];

const LIVE_CALLS = [
  { id: "lc1", agent: "Layla",  contact: "Sara Al-Mansouri",  company: "Gulf Ventures",  duration: 142, sentiment: "positive", phase: "Discovery",     transcript: "تمام يا أستاذة سارة، خلوني أوضح كيف نكسفلو يساعد فريق المبيعات بالخليج..." },
  { id: "lc2", agent: "Faisal", contact: "Mohammed Al-Otaibi",company: "Aramco Digital", duration: 198, sentiment: "positive", phase: "Demo",          transcript: "حياك الله أستاذ محمد، عندي عرض تقني خاص بقطاع الطاقة..." },
  { id: "lc3", agent: "Adam",   contact: "Tariq Hassan",      company: "Inbound caller", duration: 67,  sentiment: "neutral",  phase: "Qualification", transcript: "Sure Tariq, let me ask you a few quick questions to point you to the right plan..." },
];

export default function VoiceAgentsPage() {
  const [tab, setTab] = useState<"agents" | "live" | "voices">("agents");
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [aiTestingVoice, setAiTestingVoice] = useState<string | null>(null);
  const [aiTestText, setAiTestText] = useState<Record<string, string>>({});
  const [showNew, setShowNew] = useState(false);
  const [openAgent, setOpenAgent] = useState<any>(null);
  const { data, isLoading } = useAgents();
  const agents = data?.agents ?? [];

  // High-quality TTS via the backend (OpenAI gpt-4o-mini-tts with
  // gender + Gulf-accent instructions). This produces real female and male
  // voices instead of the rubbish browser SpeechSynthesis defaults.
  function speak(text: string, lang: string, gender: string, idForState: string, voiceName?: string) {
    stopServerSpeak();
    setPlayingVoice(idForState);
    const serverVoice = pickServerVoice({ lang, gender: gender as "Female" | "Male", name: voiceName });
    void speakViaServer(text, serverVoice, {
      onEnd:   () => setPlayingVoice((cur) => (cur === idForState ? null : cur)),
      onError: () => setPlayingVoice((cur) => (cur === idForState ? null : cur)),
    });
  }

  function playVoice(id: string) {
    const v = VOICES.find(x => x.id === id);
    if (!v) return;
    speak(aiTestText[id] || v.sample, v.lang, v.gender, id, v.name);
  }

  // "AI Test" — calls the real backend, generates a fresh greeting using the
  // selected voice's persona/language, then speaks it through the browser.
  async function aiTestVoice(id: string) {
    const v = VOICES.find(x => x.id === id);
    if (!v) return;
    setAiTestingVoice(id);
    try {
      const r = await fetch("/api/ai/voice-agent-test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ voice: v.name, persona: `${v.style} GCC sales agent`, language: v.lang }),
      });
      const data = await r.json();
      const text: string = data?.text || v.sample;
      setAiTestText(t => ({ ...t, [id]: text }));
      speak(text, v.lang, v.gender, id, v.name);
    } catch {
      speak(v.sample, v.lang, v.gender, id, v.name);
    } finally {
      setAiTestingVoice(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bot className="w-6 h-6 text-[#B8A0C8]" />
            AI Voice Agents
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Autonomous voice AI for outbound, inbound, and follow-up</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass-card rounded-xl px-3 py-2 text-center">
            <div className="text-sm font-bold text-[#88B8B0]">{agents.filter((a: any) => a.enabled).length}/{agents.length}</div>
            <div className="text-[10px] text-muted-foreground">enabled</div>
          </div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            New Agent
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-muted/40 w-fit">
        {[
          { k: "agents", label: "Agents", icon: Bot },
          { k: "live", label: `Live Calls (${LIVE_CALLS.length})`, icon: Activity },
          { k: "voices", label: "Voice Library", icon: Mic },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as any)} className={cn("flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all", tab === t.k ? "nf-chameleon-bg text-white" : "text-muted-foreground hover:text-foreground")}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "agents" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {isLoading ? Array(4).fill(0).map((_, i) => <div key={i} className="glass-card rounded-2xl h-44 animate-pulse" />) :
            agents.length === 0 ? (
              <div className="col-span-full glass-card rounded-2xl p-10 text-center">
                <Bot className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground mb-3">No agents yet. Create one in seconds.</p>
                <button onClick={() => setShowNew(true)} className="text-xs px-3 py-1.5 rounded-lg nf-chameleon-bg text-white font-semibold">Create your first agent</button>
              </div>
            ) :
            agents.map((a: any) => (
              <button type="button" key={a.id} onClick={() => setOpenAgent(a)} className="text-left glass-card rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0 relative bg-[#B8A0C8]">
                    <Bot className="w-6 h-6" />
                    {a.enabled && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#88B8B0] border-2 border-background animate-pulse" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{a.name}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                        a.enabled ? "bg-[#88B8B0]/20 text-[#88B8B0]" : "bg-muted/60 text-muted-foreground")}>
                        {a.enabled ? "● Enabled" : "Paused"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{a.description}</div>
                    <div className="text-[10px] text-muted-foreground/70 mt-0.5 flex items-center gap-1.5">
                      <Brain className="w-2.5 h-2.5" /> {a.model ?? "openai/gpt-4o-mini"}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="text-center p-2 rounded-xl bg-muted/30">
                    <div className="text-base font-black text-foreground">{a.run_count ?? 0}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wide">runs</div>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-muted/30">
                    <div className="text-base font-black text-foreground capitalize">{a.trigger_type ?? "manual"}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wide">trigger</div>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-muted/30">
                    <div className="text-[10px] font-mono text-foreground">{a.last_run_at ? new Date(a.last_run_at).toLocaleDateString() : "—"}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wide">last</div>
                  </div>
                </div>
              </button>
            ))
          }
        </div>
      )}

      {tab === "live" && (
        <div className="space-y-3">
          {LIVE_CALLS.map(c => {
            const sentColor = c.sentiment === "positive" ? "#88B8B0" : c.sentiment === "neutral" ? "#B8B880" : "#C0A0B8";
            return (
              <div key={c.id} className="glass-card rounded-2xl p-4 border border-[#88B8B0]/30">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0 relative bg-[#B8A0C8]">
                    <Bot className="w-5 h-5" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#88B8B0] border-2 border-background flex items-center justify-center">
                      <PhoneCall className="w-2 h-2 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{c.agent}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm text-foreground">{c.contact}</span>
                      <span className="text-xs text-muted-foreground">· {c.company}</span>
                      <span className="ml-auto text-xs font-mono text-[#88B8B0]">
                        {Math.floor(c.duration / 60)}:{(c.duration % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B8A0C8]/15 text-[#B8A0C8] font-medium">{c.phase}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${sentColor}20`, color: sentColor }}>
                        {c.sentiment}
                      </span>
                    </div>
                    <div className="mt-2 px-3 py-2 rounded-lg bg-muted/30 text-xs text-foreground/80 italic" dir="auto">
                      "{c.transcript}"
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button className="p-2 rounded-lg bg-[#88B8B0]/15 text-[#88B8B0] hover:bg-[#88B8B0]/25 transition-colors">
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-2 rounded-lg bg-muted/40 text-foreground hover:bg-muted/60 transition-colors">
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "voices" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">
              Production voices for GCC and Arabic markets · default outbound = <strong>Layla (Gulf female)</strong> · default callback = <strong>Faisal (Gulf male)</strong>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VOICES.map(v => (
              <div key={v.id} className={cn("glass-card rounded-2xl p-4", v.default && "ring-1 ring-[#88B8B0]/40")}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#B8A0C8]/20 flex items-center justify-center"><Mic className="w-5 h-5 text-[#B8A0C8]" /></div>
                    <div>
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        {v.name}
                        {v.default && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#88B8B0]/20 text-[#88B8B0] font-bold uppercase tracking-wider">Default</span>}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{v.gender} · {v.samples} samples</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => aiTestVoice(v.id)}
                      disabled={aiTestingVoice === v.id}
                      title="Generate a fresh AI greeting and speak it"
                      className="px-2 py-1 rounded-lg bg-[#B8A0C8]/20 text-[#B8A0C8] hover:bg-[#B8A0C8]/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 disabled:opacity-50"
                    >
                      {aiTestingVoice === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      AI Test
                    </button>
                    <button
                      onClick={() => playVoice(v.id)}
                      title="Play sample"
                      className={cn("p-2 rounded-full transition-all", playingVoice === v.id ? "nf-chameleon-bg text-white" : "bg-muted/60 text-foreground hover:bg-muted")}
                    >
                      {playingVoice === v.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-1"><Languages className="w-3 h-3 inline mr-1" />{v.language}</div>
                <div className="text-xs text-foreground/70 mb-2">{v.style}</div>
                <div className="text-[11px] text-foreground/85 italic px-2 py-1.5 rounded-lg bg-muted/30" dir="auto">
                  "{aiTestText[v.id] || v.sample}"
                  {aiTestText[v.id] && <span className="ml-1 text-[9px] text-[#B8A0C8] font-bold uppercase">· AI</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showNew && <NewAgentModal onClose={() => setShowNew(false)} />}
      {openAgent && <AgentRunDrawer agent={openAgent} onClose={() => setOpenAgent(null)} />}
    </div>
  );
}

function NewAgentModal({ onClose }: { onClose: () => void }) {
  const [description, setDescription] = useState("");
  const [draft, setDraft] = useState<any>(null);
  const drafter = useAiDraftAgent();
  const create = useCreate("/agents", ["agents"]);

  const draftIt = async () => {
    const r: any = await drafter.mutateAsync(description);
    setDraft(r?.draft ?? {});
  };

  const submit = () => {
    create.mutate(
      {
        name: draft?.name ?? description.slice(0, 40),
        description,
        icon: draft?.icon ?? "Bot",
        system_prompt: draft?.system_prompt ?? `You are an AI assistant. ${description}`,
        trigger_type: draft?.trigger_type ?? "manual",
        schedule_cron: draft?.schedule_cron ?? null,
        tools: draft?.tools ?? null,
        enabled: true,
      },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B8A0C8]" /> New AI Agent
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Describe the agent in one sentence. AI will draft the prompt, trigger, and tools.</p>
        <div className="flex gap-2">
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Daily summarizer of new high-intent leads" className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none focus:border-[#B8A0C8]" />
          <button onClick={draftIt} disabled={!description.trim() || drafter.isPending} className="px-4 py-2 rounded-lg bg-[#B8A0C8]/20 text-[#B8A0C8] text-xs font-semibold hover:bg-[#B8A0C8]/30 disabled:opacity-40 flex items-center gap-1.5">
            {drafter.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            AI Draft
          </button>
        </div>

        {draft && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Name</label>
              <input value={draft.name ?? ""} onChange={e => setDraft({ ...draft, name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">System Prompt</label>
              <textarea value={draft.system_prompt ?? ""} onChange={e => setDraft({ ...draft, system_prompt: e.target.value })} rows={6} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-xs font-mono outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Trigger</label>
                <select value={draft.trigger_type ?? "manual"} onChange={e => setDraft({ ...draft, trigger_type: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none">
                  {["manual", "scheduled", "event"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {draft.trigger_type === "scheduled" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Cron</label>
                  <input value={draft.schedule_cron ?? ""} onChange={e => setDraft({ ...draft, schedule_cron: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-xs font-mono outline-none" />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">Cancel</button>
          <button onClick={submit} disabled={!description.trim() || create.isPending} className="flex-1 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {create.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create agent
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentRunDrawer({ agent, onClose }: { agent: any; onClose: () => void }) {
  const run = useRunAiAgent();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string>("");

  const doRun = async () => {
    setOutput("");
    const r: any = await run.mutateAsync({ agentId: agent.id, input });
    setOutput(r?.output ?? r?.run?.output ?? JSON.stringify(r));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-stretch justify-end" onClick={onClose}>
      <div className="bg-background w-full max-w-md h-full overflow-y-auto p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">{agent.name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{agent.description}</p>
        <div className="p-3 rounded-xl bg-muted/30 mb-4">
          <div className="text-xs font-semibold text-muted-foreground mb-1">System prompt</div>
          <pre className="text-xs text-foreground/80 whitespace-pre-wrap">{agent.system_prompt}</pre>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Input</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={3} placeholder="Optional input — leave blank for default task" className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
        </div>
        <button onClick={doRun} disabled={run.isPending} className="mt-3 w-full px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          {run.isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running…</> : <><Play className="w-3.5 h-3.5" /> Run agent</>}
        </button>
        {output && (
          <div className="mt-4 p-3 rounded-xl bg-[#88B8B0]/10 border border-[#88B8B0]/20">
            <div className="text-xs font-semibold text-[#88B8B0] mb-1">Output</div>
            <pre className="text-xs text-foreground/90 whitespace-pre-wrap">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
