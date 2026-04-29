import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  Send, Calendar, Sparkles, Image as ImageIcon, Hash, Globe, Plus, Check,
  Linkedin, Twitter, Instagram, Facebook, Mail, MessageSquare, Phone,
  Eye, MousePointerClick, Reply, ChevronRight, Zap, X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Channel registry ──────────────────────────────────────────────── */

interface ChannelDef {
  key: string;
  label: string;
  handle: string;          // shown next to the connection status
  status: "connected" | "needs_auth" | "off";
  icon: LucideIcon;
  accent: string;          // brand colour
  audience: string;        // followers / contacts reachable
  composer: "post" | "thread" | "image" | "video" | "dm" | "broadcast" | "email";
  /** Headline KPI to show on the channel card */
  metric: { label: string; value: string; delta: string };
}

const CHANNELS: ChannelDef[] = [
  {
    key: "linkedin", label: "LinkedIn (Company)", handle: "@nexflow-gcc",
    status: "connected", icon: Linkedin, accent: "#0A66C2",
    audience: "12,400 followers · 38 connected reps",
    composer: "post",
    metric: { label: "Last 7d engagement", value: "8.2%", delta: "+1.4 pts vs prev wk" },
  },
  {
    key: "x", label: "X (Twitter)", handle: "@nexflow_ai",
    status: "connected", icon: Twitter, accent: "#000000",
    audience: "4,820 followers · 211 active GCC orgs",
    composer: "thread",
    metric: { label: "Avg impressions / post", value: "9.4k", delta: "+22% week-over-week" },
  },
  {
    key: "instagram", label: "Instagram (Business)", handle: "@nexflow.gcc",
    status: "connected", icon: Instagram, accent: "#E4405F",
    audience: "6,140 followers · reels-enabled",
    composer: "image",
    metric: { label: "Reach (7d)", value: "31.2k", delta: "+5.1k from last week" },
  },
  {
    key: "facebook", label: "Facebook Page", handle: "NexFlow GCC",
    status: "needs_auth", icon: Facebook, accent: "#1877F2",
    audience: "2,180 page likes",
    composer: "post",
    metric: { label: "Token expired", value: "Re-auth", delta: "Page disconnected 2d ago" },
  },
  {
    key: "whatsapp", label: "WhatsApp Business", handle: "+966 11 NEX-FLOW",
    status: "connected", icon: MessageSquare, accent: "#25D366",
    audience: "3,940 opted-in contacts (PDPL)",
    composer: "broadcast",
    metric: { label: "Reply rate (7d)", value: "41%", delta: "Industry avg 18%" },
  },
  {
    key: "email", label: "Email (Marketing)", handle: "team@nexflow.demo",
    status: "connected", icon: Mail, accent: "#88B8B0",
    audience: "8,210 subscribers · 12 segments",
    composer: "email",
    metric: { label: "Open rate (7d)", value: "34.6%", delta: "+3.2 pts vs prev send" },
  },
  {
    key: "sms", label: "SMS (KSA + UAE)", handle: "Sender: NEXFLOW",
    status: "connected", icon: Phone, accent: "#B8A0C8",
    audience: "5,610 PDPL-opted contacts",
    composer: "broadcast",
    metric: { label: "Delivery rate", value: "98.7%", delta: "Bilingual templates ready" },
  },
];

/* ─── Recent publishes (mock) ───────────────────────────────────────── */

interface Publish {
  id: string;
  title: string;
  channels: string[];
  sent: string;
  reach: number;
  engagement: number;
  clicks: number;
  replies: number;
  status: "live" | "scheduled" | "draft";
}

const RECENT: Publish[] = [
  {
    id: "p1",
    title: "Khaleeji AI Voice Agent — 90-second demo",
    channels: ["linkedin", "x", "instagram", "email"],
    sent: "2h ago",
    reach: 41280, engagement: 7.4, clicks: 612, replies: 48, status: "live",
  },
  {
    id: "p2",
    title: "Q2 GCC SaaS pricing benchmark report",
    channels: ["linkedin", "email"],
    sent: "Yesterday",
    reach: 18402, engagement: 6.1, clicks: 941, replies: 22, status: "live",
  },
  {
    id: "p3",
    title: "Ramadan working hours notice",
    channels: ["whatsapp", "sms", "email"],
    sent: "Tomorrow · 09:00",
    reach: 17760, engagement: 0, clicks: 0, replies: 0, status: "scheduled",
  },
  {
    id: "p4",
    title: "Aramco case study (long-form)",
    channels: ["linkedin", "x"],
    sent: "Draft",
    reach: 0, engagement: 0, clicks: 0, replies: 0, status: "draft",
  },
];

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function ChannelsPage() {
  const [composerOpen, setComposerOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "live" | "scheduled" | "draft">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set(["linkedin", "x", "email"]));

  const filtered = useMemo(
    () => RECENT.filter((p) => (filter === "all" ? true : p.status === filter)),
    [filter],
  );

  const connectedCount = CHANNELS.filter((c) => c.status === "connected").length;
  const totalReach = CHANNELS
    .filter((c) => c.status === "connected")
    .reduce((s, c) => s + parseAudience(c.audience), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Hero */}
      <div className="glass-card rounded-2xl p-6 border border-[#C8A880]/30 relative overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle,#C8A880,transparent 70%)" }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-[#C8A880]/15 flex items-center justify-center">
                <Send className="w-4 h-4 text-[#C8A880]" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C8A880]">
                Channels & Publishing
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Push to every platform from one composer.</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {connectedCount} of {CHANNELS.length} channels connected ·{" "}
              <span className="font-bold text-foreground">{totalReach.toLocaleString()}</span> reachable contacts across LinkedIn, X, Instagram, WhatsApp, Email, and SMS.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setComposerOpen(true)}
              className="px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-md flex items-center gap-2"
              style={{ background: "linear-gradient(135deg,#C8A880,#B8A0C8)" }}
            >
              <Send className="w-4 h-4" /> Compose & push
            </button>
            <button className="px-3 py-2.5 rounded-xl border border-border/40 text-sm font-bold flex items-center gap-2 hover:bg-muted/40">
              <Calendar className="w-4 h-4" /> Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Channel cards grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Connected channels</h2>
          <button className="text-xs font-bold text-[#B8A0C8] flex items-center gap-1 hover:underline">
            <Plus className="w-3 h-3" /> Connect a new channel
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CHANNELS.map((c) => (
            <ChannelCard
              key={c.key}
              channel={c}
              isSelected={selected.has(c.key)}
              onToggle={() => {
                const next = new Set(selected);
                if (next.has(c.key)) next.delete(c.key);
                else next.add(c.key);
                setSelected(next);
              }}
              onCompose={() => setComposerOpen(true)}
            />
          ))}
        </div>
      </div>

      {/* Recent / scheduled publishes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Recent & scheduled pushes</h2>
          <div className="inline-flex items-center gap-1 p-0.5 rounded-lg border border-border/40 bg-muted/20">
            {(["all", "live", "scheduled", "draft"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition-colors",
                  filter === f ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-border/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                <th className="text-left px-4 py-2.5">Content</th>
                <th className="text-left px-4 py-2.5">Channels</th>
                <th className="text-left px-4 py-2.5">When</th>
                <th className="text-right px-4 py-2.5">Reach</th>
                <th className="text-right px-4 py-2.5">Engagement</th>
                <th className="text-right px-4 py-2.5">Clicks · Replies</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <PublishRow key={p.id} p={p} />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-sm text-muted-foreground">No items match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <QuickLink href="/campaigns" icon={Sparkles} accent="#B8A0C8" title="Build a campaign" desc="Goal-driven multi-channel push" />
        <QuickLink href="/sequences" icon={Zap} accent="#88B8B0" title="Create a sequence" desc="Drip + branch over days/weeks" />
        <QuickLink href="/audiences" icon={Hash} accent="#C8A880" title="Target a segment" desc="Pick who receives this push" />
      </div>

      {composerOpen && (
        <Composer
          channels={CHANNELS}
          selected={selected}
          onToggle={(k) => {
            const next = new Set(selected);
            if (next.has(k)) next.delete(k);
            else next.add(k);
            setSelected(next);
          }}
          onClose={() => setComposerOpen(false)}
        />
      )}
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────────────────────── */

function ChannelCard({
  channel, isSelected, onToggle, onCompose,
}: {
  channel: ChannelDef;
  isSelected: boolean;
  onToggle: () => void;
  onCompose: () => void;
}) {
  const Icon = channel.icon;
  const broken = channel.status !== "connected";
  return (
    <div className="glass-card rounded-2xl p-4 border border-border/40 relative overflow-hidden hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${channel.accent}15`, color: channel.accent }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="text-sm font-bold truncate">{channel.label}</div>
            <span className={cn(
              "text-[9px] font-black uppercase px-1.5 py-0.5 rounded",
              channel.status === "connected" && "bg-[#88B8B0]/15 text-[#88B8B0]",
              channel.status === "needs_auth" && "bg-[#C8A880]/15 text-[#C8A880]",
              channel.status === "off" && "bg-muted text-muted-foreground",
            )}>
              {channel.status === "connected" ? "live" : channel.status === "needs_auth" ? "re-auth" : "off"}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground truncate">{channel.handle}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{channel.audience}</div>
        </div>
        {!broken && (
          <button
            onClick={onToggle}
            className={cn(
              "w-5 h-5 rounded flex items-center justify-center border transition-colors flex-shrink-0",
              isSelected
                ? "border-[#B8A0C8] bg-[#B8A0C8] text-white"
                : "border-border/60 hover:border-foreground/40",
            )}
            aria-label={isSelected ? "Remove from push" : "Add to push"}
          >
            {isSelected && <Check className="w-3 h-3" />}
          </button>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-border/30 flex items-end justify-between gap-2">
        <div>
          <div className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">{channel.metric.label}</div>
          <div className="text-lg font-black leading-tight">{channel.metric.value}</div>
          <div className="text-[10px] text-muted-foreground">{channel.metric.delta}</div>
        </div>
        {broken ? (
          <button className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white"
            style={{ background: channel.accent }}>
            Re-connect
          </button>
        ) : (
          <button
            onClick={onCompose}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-border/40 hover:bg-muted/50 flex items-center gap-1"
          >
            <Send className="w-3 h-3" /> Push now
          </button>
        )}
      </div>
    </div>
  );
}

function PublishRow({ p }: { p: Publish }) {
  return (
    <tr className="border-t border-border/30 hover:bg-muted/20">
      <td className="px-4 py-3">
        <div className="text-sm font-bold leading-tight">{p.title}</div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1" aria-label={`Pushed to ${p.channels.map((k) => CHANNELS.find((c) => c.key === k)?.label ?? k).join(", ")}`}>
          {p.channels.map((k) => {
            const c = CHANNELS.find((x) => x.key === k);
            if (!c) return null;
            const Icon = c.icon;
            return (
              <span
                key={k}
                title={c.label}
                role="img"
                aria-label={c.label}
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: `${c.accent}15`, color: c.accent }}
              >
                <Icon className="w-3 h-3" aria-hidden="true" />
              </span>
            );
          })}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{p.sent}</td>
      <td className="px-4 py-3 text-right text-sm font-bold">
        {p.reach > 0 ? p.reach.toLocaleString() : <span className="text-muted-foreground">—</span>}
      </td>
      <td className="px-4 py-3 text-right text-sm font-bold">
        {p.engagement > 0 ? `${p.engagement.toFixed(1)}%` : <span className="text-muted-foreground">—</span>}
      </td>
      <td className="px-4 py-3 text-right text-xs">
        <span className="inline-flex items-center gap-1 mr-2 text-muted-foreground">
          <MousePointerClick className="w-3 h-3" />{p.clicks > 0 ? p.clicks : "—"}
        </span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Reply className="w-3 h-3" />{p.replies > 0 ? p.replies : "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button className="text-xs font-bold text-[#B8A0C8] hover:underline inline-flex items-center gap-1">
          {p.status === "draft" ? "Edit" : p.status === "scheduled" ? "Reschedule" : "View"}
          <ChevronRight className="w-3 h-3" />
        </button>
      </td>
    </tr>
  );
}

function QuickLink({
  href, icon: Icon, accent, title, desc,
}: { href: string; icon: LucideIcon; accent: string; title: string; desc: string }) {
  return (
    <Link href={href}>
      <div className="glass-card rounded-2xl p-4 border border-border/40 hover:shadow-md hover:border-transparent transition-all cursor-pointer group">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${accent}15`, color: accent }}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold">{title}</div>
            <div className="text-[11px] text-muted-foreground">{desc}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

/* ─── Composer modal ────────────────────────────────────────────────── */

function Composer({
  channels, selected, onToggle, onClose,
}: {
  channels: ChannelDef[];
  selected: Set<string>;
  onToggle: (k: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [scheduled, setScheduled] = useState(false);
  const [published, setPublished] = useState(false);
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Focus management + Escape-to-close + simple focus trap
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [onClose]);

  const totalReach = channels
    .filter((c) => selected.has(c.key) && c.status === "connected")
    .reduce((s, c) => s + parseAudience(c.audience), 0);

  function handlePush() {
    if (selected.size === 0 || text.trim().length === 0) return;
    setPublished(true);
    setTimeout(() => {
      setPublished(false);
      onClose();
    }, 1300);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="w-full max-w-2xl bg-background rounded-2xl border border-border/40 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#C8A880]/15 flex items-center justify-center">
              <Send className="w-3.5 h-3.5 text-[#C8A880]" />
            </div>
            <div>
              <div id={titleId} className="text-sm font-black">Compose & push</div>
              <div id={descId} className="text-[10px] text-muted-foreground">Pushes to all selected channels in one click</div>
            </div>
          </div>
          <button ref={closeBtnRef} onClick={onClose} className="p-1 rounded hover:bg-muted/50" aria-label="Close composer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Channel chips */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">
              Push to ({selected.size} of {channels.filter((c) => c.status === "connected").length} connected)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {channels.map((c) => {
                const active = selected.has(c.key);
                const broken = c.status !== "connected";
                const Icon = c.icon;
                return (
                  <button
                    key={c.key}
                    onClick={() => !broken && onToggle(c.key)}
                    disabled={broken}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all",
                      active && "border-transparent text-white shadow-sm",
                      !active && !broken && "border-border/40 bg-background hover:bg-muted/50",
                      broken && "border-border/30 bg-muted/30 text-muted-foreground cursor-not-allowed line-through",
                    )}
                    style={active ? { background: c.accent } : undefined}
                  >
                    <Icon className="w-3 h-3" />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">Content</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your post once. NexFlow auto-formats it for each channel — character limits, hashtags, image crops, and Arabic localization."
              rows={5}
              className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border/40 text-sm focus:outline-none focus:border-[#B8A0C8] focus:bg-background transition-all resize-none"
            />
            <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-1 hover:text-foreground"><ImageIcon className="w-3 h-3" /> Image</button>
                <button className="inline-flex items-center gap-1 hover:text-foreground"><Hash className="w-3 h-3" /> Hashtags</button>
                <button className="inline-flex items-center gap-1 hover:text-foreground"><Globe className="w-3 h-3" /> AR / EN translate</button>
                <button className="inline-flex items-center gap-1 hover:text-foreground"><Sparkles className="w-3 h-3" /> AI rewrite</button>
              </div>
              <div>{text.length} chars</div>
            </div>
          </div>

          {/* Schedule toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/20">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-[12px] font-bold">{scheduled ? "Scheduled push" : "Push immediately"}</div>
                <div className="text-[10px] text-muted-foreground">
                  {scheduled ? "Tomorrow · 09:00 Asr time (auto-paused during prayer windows)" : "Goes out the moment you click push"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setScheduled(!scheduled)}
              className={cn(
                "px-3 py-1 rounded-lg text-[11px] font-bold border",
                scheduled ? "bg-[#B8A0C8] text-white border-[#B8A0C8]" : "border-border/40 hover:bg-muted/50",
              )}
            >
              {scheduled ? "Scheduled" : "Schedule"}
            </button>
          </div>

          {/* Reach summary */}
          <div className="text-[11px] text-muted-foreground">
            Estimated reach:{" "}
            <span className="font-bold text-foreground">{totalReach.toLocaleString()}</span> contacts
            across {selected.size} channel{selected.size === 1 ? "" : "s"}.
          </div>
        </div>

        <div className="px-5 py-3 border-t border-border/40 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-lg text-sm font-bold border border-border/40 hover:bg-muted/40">
            Cancel
          </button>
          <button
            onClick={handlePush}
            disabled={selected.size === 0 || text.trim().length === 0 || published}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white shadow-md disabled:opacity-50 flex items-center gap-2"
            style={{ background: "linear-gradient(135deg,#C8A880,#B8A0C8)" }}
          >
            {published ? (<><Check className="w-4 h-4" /> Pushed</>) :
              scheduled ? (<><Calendar className="w-4 h-4" /> Schedule push</>) :
                (<><Send className="w-4 h-4" /> Push now</>)}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────── */

function parseAudience(s: string): number {
  // Pull the first comma-separated number out of the audience string.
  const m = s.replace(/,/g, "").match(/(\d{2,})/);
  return m ? Number(m[1]) : 0;
}
