import "./_group.css";
import {
  Home as HomeIcon, Users, MessageSquare,
  Sparkles, Mic, MicOff, Volume2, PhoneOff, Phone,
  Mail, MessageCircle, Bell, Check, Edit3, X,
  ChevronRight, Clock, Lightbulb,
} from "lucide-react";

function MiniRail() {
  const items = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "crm", label: "CRM", icon: Users, active: true },
    { id: "comms", label: "Comms", icon: MessageSquare },
  ];
  return (
    <aside
      className="flex flex-col justify-between"
      style={{ width: 220, padding: "28px 18px", borderRight: "1px solid var(--rd-cream)", background: "var(--rd-sand)", opacity: 0.6 }}
    >
      <div>
        <div className="flex items-center gap-2 mb-10 px-1.5">
          <div className="rd-display" style={{ fontSize: 22 }}>nx</div>
          <span style={{ fontSize: 12, color: "var(--rd-mute)", letterSpacing: "0.04em" }}>NEXFLOW</span>
        </div>
        <nav className="flex flex-col gap-1">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <div key={it.id} className="flex items-center gap-3" style={{ padding: "8px 10px", borderRadius: 8, color: it.active ? "var(--rd-ink)" : "var(--rd-mute)", background: it.active ? "var(--rd-cream)" : "transparent", fontWeight: it.active ? 500 : 400 }}>
                <Icon size={15} strokeWidth={1.6} />
                <span style={{ fontSize: 13 }}>{it.label}</span>
                {it.active && <div style={{ width: 4, height: 4, borderRadius: 999, background: "var(--rd-accent)", marginLeft: "auto" }} />}
              </div>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-2.5 px-1.5">
        <div className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 999, background: "var(--rd-accent)", color: "#fff", fontSize: 11, fontWeight: 500 }}>SK</div>
        <div style={{ fontSize: 12 }}>
          <div>Sara Khalid</div>
          <div style={{ color: "var(--rd-mute)", fontSize: 11 }}>Sales Rep</div>
        </div>
      </div>
    </aside>
  );
}

function TranscriptLine({ speaker, text, live }: { speaker: "you" | "them"; text: string; live?: boolean }) {
  const isYou = speaker === "you";
  return (
    <div className="flex gap-2.5" style={{ padding: "5px 0" }}>
      <span
        className="rd-mono"
        style={{
          fontSize: 10, color: isYou ? "var(--rd-accent)" : "var(--rd-sage)",
          textTransform: "uppercase", letterSpacing: "0.06em", paddingTop: 2, minWidth: 38,
        }}
      >
        {isYou ? "Sara" : "Khaled"}
      </span>
      <span style={{ fontSize: 12.5, color: "var(--rd-ink-2)", lineHeight: 1.55 }}>
        {text}
        {live && <span className="rd-blink" style={{ marginLeft: 3, color: "var(--rd-accent)" }}>▍</span>}
      </span>
    </div>
  );
}

function ApprovalCard({ icon: Icon, kind, title, body, primary, ts }: { icon: any; kind: string; title: string; body: string; primary: string; ts: string; }) {
  return (
    <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--rd-cream)" }}>
      <div className="flex items-center gap-2 mb-1.5" style={{ fontSize: 10.5, color: "var(--rd-mute)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <Icon size={11} strokeWidth={1.8} style={{ color: "var(--rd-accent)" }} />
        {kind}
        <Clock size={10} className="ml-auto" />
        <span style={{ textTransform: "none", letterSpacing: 0 }}>{ts}</span>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--rd-ink)", fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: 11.5, color: "var(--rd-mute)", marginTop: 3, lineHeight: 1.5 }}>{body}</div>
      <div className="flex items-center gap-1.5 mt-2.5">
        <button
          style={{ flex: 1, padding: "6px 10px", borderRadius: 7, background: "var(--rd-ink)", color: "var(--rd-sand)", border: 0, fontSize: 11.5, fontWeight: 500, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer" }}
        >
          <Check size={11} strokeWidth={2} /> {primary}
        </button>
        <button
          style={{ padding: "6px 10px", borderRadius: 7, background: "transparent", color: "var(--rd-ink)", border: "1px solid var(--rd-cream)", fontSize: 11.5, display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer" }}
        >
          <Edit3 size={10} strokeWidth={1.8} /> Edit
        </button>
        <button
          style={{ padding: "6px 8px", borderRadius: 7, background: "transparent", color: "var(--rd-mute)", border: "1px solid var(--rd-cream)", fontSize: 11.5, cursor: "pointer" }}
          aria-label="skip"
        >
          <X size={11} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

export function CallInbox() {
  return (
    <div className="rd-root flex" style={{ minHeight: "100vh", height: "100vh", overflow: "hidden", position: "relative" }}>
      <MiniRail />
      <main style={{ flex: 1, overflow: "hidden", position: "relative", background: "var(--rd-sand)" }}>
        {/* Dimmed CRM hint */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(31,27,22,0.32)", backdropFilter: "blur(2px)" }} />

        {/* Call modal */}
        <div
          style={{
            position: "absolute", top: 56, left: "50%", transform: "translateX(-50%)",
            width: 640, background: "var(--rd-card)", borderRadius: 16,
            border: "1px solid var(--rd-cream)",
            boxShadow: "0 30px 80px -10px rgba(31,27,22,0.35)",
            overflow: "hidden", zIndex: 10,
          }}
        >
          {/* Header */}
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--rd-cream)" }}>
            <div className="flex items-center gap-3">
              <div style={{ position: "relative" }}>
                <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 999, background: "var(--rd-accent)", color: "#fff", fontSize: 14, fontWeight: 500 }}>KM</div>
                <div className="rd-pulse" style={{ position: "absolute", bottom: -2, right: -2, width: 12, height: 12, borderRadius: 999, background: "#7A8F76", border: "2px solid var(--rd-card)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="rd-display" style={{ fontSize: 18, lineHeight: 1.1 }}>Khaled Al-Mansoori</div>
                <div className="flex items-center gap-2" style={{ fontSize: 11.5, color: "var(--rd-mute)", marginTop: 2 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--rd-sage)" }} />
                    Live
                  </span>
                  <span>·</span>
                  <span className="rd-mono">03:42</span>
                  <span>·</span>
                  <span>Aramco Digital · CTO</span>
                </div>
              </div>
              <span className="rd-pill" style={{ background: "#F4DACD", color: "#8C3B22", fontWeight: 500 }}>Negotiation</span>
            </div>
          </div>

          {/* Live transcript */}
          <div style={{ padding: "14px 22px", maxHeight: 260, overflow: "auto" }}>
            <div className="flex items-center gap-2 mb-2" style={{ fontSize: 10.5, color: "var(--rd-mute)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <Sparkles size={11} strokeWidth={1.8} style={{ color: "var(--rd-accent)" }} />
              Scribe · live transcript
            </div>
            <TranscriptLine speaker="them" text="…and the issue we keep running into is that Q2 budget is locked. So even if we love the pilot, the wire can't move until July 1." />
            <TranscriptLine speaker="you" text="That's exactly why I sent the deferred-start option this morning. We can structure the SOW with kickoff July 5, no charge until then. Did that land?" />
            <TranscriptLine speaker="them" text="It did. Honestly that changes things. Let me get my CFO on the next call — when's good for you?" live />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between" style={{ padding: "12px 22px", background: "var(--rd-sand-2)", borderTop: "1px solid var(--rd-cream)" }}>
            <div className="flex items-center gap-2">
              <button style={{ width: 36, height: 36, borderRadius: 999, background: "var(--rd-card)", border: "1px solid var(--rd-cream)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Mic size={14} strokeWidth={1.8} /></button>
              <button style={{ width: 36, height: 36, borderRadius: 999, background: "var(--rd-card)", border: "1px solid var(--rd-cream)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--rd-mute)" }}><MicOff size={14} strokeWidth={1.8} /></button>
              <button style={{ width: 36, height: 36, borderRadius: 999, background: "var(--rd-card)", border: "1px solid var(--rd-cream)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Volume2 size={14} strokeWidth={1.8} /></button>
            </div>
            <button
              style={{ padding: "8px 14px", borderRadius: 999, background: "var(--rd-accent)", color: "#fff", border: 0, fontSize: 12, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}
            >
              <PhoneOff size={13} strokeWidth={2} /> End call
            </button>
          </div>
        </div>

        {/* Coach panel — right of modal */}
        <div
          style={{
            position: "absolute", top: 56, right: 28,
            width: 280, zIndex: 9,
            display: "flex", flexDirection: "column", gap: 10,
          }}
        >
          <div className="rd-card" style={{ padding: "14px 16px", boxShadow: "var(--rd-shadow-lift)" }}>
            <div className="flex items-center gap-2 mb-3" style={{ fontSize: 10.5, color: "var(--rd-mute)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <Lightbulb size={11} strokeWidth={1.8} style={{ color: "var(--rd-amber)" }} />
              Coach · live cues
            </div>
            {[
              { c: "var(--rd-accent)", t: "Pivot now", b: "He's leaning in. Ask: 'CFO joining Thursday at 3pm?' Lock the calendar before the call ends." },
              { c: "var(--rd-amber)", t: "Mention", b: "Aramco-Saudi case study — 6-month ROI. He cited a similar peer last week." },
              { c: "var(--rd-sage)", t: "Don't",   b: "Don't quote price yet. CFO needs to hear it from you first." },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2" style={{ padding: "7px 0", borderTop: i > 0 ? "1px solid var(--rd-cream)" : "none" }}>
                <div style={{ width: 5, height: 5, borderRadius: 999, background: tip.c, marginTop: 7, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11.5, color: "var(--rd-ink)", fontWeight: 500 }}>{tip.t}</div>
                  <div style={{ fontSize: 11.5, color: "var(--rd-mute)", marginTop: 2, lineHeight: 1.45 }}>{tip.b}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Inbox bubble — expanded panel bottom-right */}
        <div
          style={{
            position: "absolute", bottom: 24, right: 28, zIndex: 50,
            display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10,
          }}
        >
          <div
            className="rd-card"
            style={{ width: 360, boxShadow: "var(--rd-shadow-lift)", overflow: "hidden" }}
          >
            <div
              className="flex items-center justify-between"
              style={{ padding: "12px 14px", borderBottom: "1px solid var(--rd-cream)" }}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={13} strokeWidth={1.8} style={{ color: "var(--rd-accent)" }} />
                <span style={{ fontSize: 12.5, fontWeight: 500 }}>AI Inbox</span>
                <span className="rd-pill" style={{ background: "var(--rd-accent)", color: "#fff", padding: "2px 7px", fontSize: 10, fontWeight: 500 }}>3</span>
              </div>
              <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: "var(--rd-mute)" }}>
                <span>Autonomy:</span>
                <span style={{ color: "var(--rd-ink)", fontWeight: 500 }}>Ask before sending</span>
                <ChevronRight size={11} />
              </div>
            </div>

            <ApprovalCard
              icon={Mail}
              kind="Composer · email"
              ts="just now"
              title="Reply to Khaled — calendar confirm"
              body="Drafted from live call: 'Thursday 3pm works perfectly. I'll send the invite with CFO-prep doc attached…'"
              primary="Send"
            />
            <ApprovalCard
              icon={MessageCircle}
              kind="Dispatcher · WhatsApp"
              ts="2 min ago"
              title="Pricing follow-up to Layla Hamadi"
              body="3 alternatives ready (annual, multi-year, departmental). Awaiting your sign-off before queue."
              primary="Queue for 6pm"
            />
            <ApprovalCard
              icon={Bell}
              kind="Listener · risk flag"
              ts="14 min ago"
              title="Faisal Al-Otaibi — silent 6 days"
              body="Coach suggests a single-line check-in: 'Still good for next week's review?' Nudge or reassign?"
              primary="Send nudge"
            />

            <div style={{ padding: "10px 14px", background: "var(--rd-sand-2)", fontSize: 11, color: "var(--rd-mute)" }}>
              Conductor will queue all approved actions for the <span style={{ color: "var(--rd-ink)" }}>6:00pm send window</span>.
            </div>
          </div>

          <div
            className="rd-pulse flex items-center justify-center"
            style={{
              width: 52, height: 52, borderRadius: 999, background: "var(--rd-ink)", color: "var(--rd-sand)",
              boxShadow: "var(--rd-shadow-lift)", cursor: "pointer", position: "relative",
            }}
          >
            <Sparkles size={20} strokeWidth={1.5} />
            <div style={{ position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: 999, background: "var(--rd-accent)", color: "#fff", fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--rd-sand)" }}>3</div>
          </div>
        </div>
      </main>
    </div>
  );
}
