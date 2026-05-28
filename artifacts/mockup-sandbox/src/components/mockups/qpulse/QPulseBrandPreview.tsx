import { useEffect, useRef } from "react";

/* ── NexFlow mesh-gradient colour palette ─────────────────────────────── */
const C = {
  purple:  "#B8A0C8",
  teal:    "#88B8B0",
  gold:    "#C8A880",
  rose:    "#C0A0B8",
  deep:    "#9880B8",
};

/* ── Keyframe CSS injected once ───────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;600;700&display=swap');

@keyframes qp-halo-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes qp-wave-draw {
  0%   { stroke-dashoffset: 120; opacity: 0; }
  20%  { opacity: 1; }
  100% { stroke-dashoffset: 0;   opacity: 1; }
}
@keyframes qp-fade-in {
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes qp-glow-pulse {
  0%,100% { filter: drop-shadow(0 0 4px ${C.purple}88); }
  50%      { filter: drop-shadow(0 0 12px ${C.teal}cc); }
}
@keyframes qp-q-breathe {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.78; }
}
.qp-halo-spin  { transform-origin: 60px 55px; animation: qp-halo-spin 14s linear infinite; }
.qp-q-breathe  { animation: qp-q-breathe 4s ease-in-out infinite; }
.qp-wave-draw  { stroke-dasharray: 120; animation: qp-wave-draw 2.2s ease-out forwards; animation-delay: 0.4s; opacity:0; }
.qp-word-arrive{ animation: qp-fade-in 0.8s ease-out forwards; animation-delay: 0.2s; opacity:0; }
.qp-glow-pulse { animation: qp-glow-pulse 3s ease-in-out infinite; }
`;

/* ── Animated QPulse SVG ─────────────────────────────────────────────── */
function QPulseLogo({ size = 1 }: { size?: number }) {
  const uid = useRef(`qp-${Math.random().toString(36).slice(2)}`).current;
  const id  = (s: string) => `${uid}-${s}`;

  const vw = 280, vh = 82;
  const cx = 46, cy = 41, rOuter = 40, rInner = 30;

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      width={vw * size}
      height={vh * size}
      overflow="visible"
      style={{ display: "block" }}
    >
      <defs>
        {/* Q circle gradient */}
        <linearGradient id={id("mg")} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={C.purple} />
          <stop offset="60%"  stopColor={C.teal} />
          <stop offset="100%" stopColor={C.gold} />
        </linearGradient>
        {/* Wave gradient */}
        <linearGradient id={id("mg2")} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={C.teal} />
          <stop offset="100%" stopColor={C.gold} />
        </linearGradient>
        {/* Text gradient */}
        <linearGradient id={id("mg3")} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={C.purple} />
          <stop offset="100%" stopColor={C.teal} />
        </linearGradient>
        {/* Halo glow filter */}
        <filter id={id("glow")} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Ambient rotating dashed outer halo */}
      <g className="qp-halo-spin">
        <circle
          cx={cx} cy={cy} r={rOuter}
          fill="none"
          stroke={`url(#${id("mg")})`}
          strokeWidth="0.7"
          strokeDasharray="2.5 6"
          opacity="0.6"
        />
      </g>

      {/* Inner Q circle body */}
      <g className="qp-q-breathe qp-glow-pulse">
        <circle
          cx={cx} cy={cy} r={rInner}
          fill="none"
          stroke={`url(#${id("mg")})`}
          strokeWidth="2"
          filter={`url(#${id("glow")})`}
        />
        {/* Q tail / descender */}
        <line
          x1={cx + rInner * 0.58}
          y1={cy + rInner * 0.58}
          x2={cx + rInner * 0.92 + 8}
          y2={cy + rInner * 0.92 + 8}
          stroke={`url(#${id("mg")})`}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* Pulse waveform cutting through the Q */}
      <path
        className="qp-wave-draw"
        d={`M ${cx - rInner + 2} ${cy}
            L ${cx - rInner + 10} ${cy}
            L ${cx - 6}  ${cy - 13}
            L ${cx}      ${cy + 13}
            L ${cx + 7}  ${cy - 17}
            L ${cx + 14} ${cy + 12}
            L ${cx + 20} ${cy}
            L ${cx + rInner - 2} ${cy}`}
        fill="none"
        stroke={`url(#${id("mg2")})`}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* "Pulse" wordmark */}
      <text
        className="qp-word-arrive"
        x={cx + rOuter + 10}
        y={cy + 11}
        fontFamily="Inter, sans-serif"
        fontSize="36"
        fontWeight="300"
        letterSpacing="0.04em"
        fill={`url(#${id("mg3")})`}
      >
        Pulse
      </text>
    </svg>
  );
}

/* ── Section header ───────────────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "Inter, sans-serif",
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#94a3b8",
      marginBottom: 12,
    }}>{children}</p>
  );
}

function Divider() {
  return <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.07)", margin: "28px 0" }} />;
}

/* ── TopBar context mockup ───────────────────────────────────────────── */
function TopBarMockup({ dark }: { dark?: boolean }) {
  const bg   = dark ? "#0f0f14"     : "#ffffff";
  const border = dark ? "#ffffff12" : "#e2e8f0";
  const navColor = dark ? "#94a3b8" : "#64748b";

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 12,
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      gap: 20,
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Logo area */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        <QPulseLogo size={0.36} />
      </div>

      {/* Nav */}
      <div style={{ display: "flex", gap: 4, flex: 1 }}>
        {["Home","CRM","Comms","Growth","Insights"].map((t, i) => (
          <div key={t} style={{
            padding: "5px 12px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: i === 0 ? 600 : 400,
            background: i === 0 ? `linear-gradient(135deg, ${C.purple}22, ${C.teal}22)` : "transparent",
            color: i === 0 ? C.purple : navColor,
            border: i === 0 ? `1px solid ${C.purple}30` : "1px solid transparent",
          }}>{t}</div>
        ))}
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          padding: "5px 14px",
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 600,
          background: `linear-gradient(135deg, ${C.purple}, ${C.teal})`,
          color: "white",
        }}>AI Assistant</div>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.teal}, ${C.purple})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "white",
        }}>SA</div>
      </div>
    </div>
  );
}

/* ── Sign-in context mockup ──────────────────────────────────────────── */
function SignInMockup() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #f8f6fc 0%, #eef6f5 50%, #faf7f0 100%)",
      borderRadius: 16,
      padding: "32px 28px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
      fontFamily: "Inter, sans-serif",
      border: "1px solid rgba(184,160,200,0.18)",
      minWidth: 280,
    }}>
      <QPulseLogo size={0.6} />
      <p style={{ fontSize: 11, color: "#94a3b8", letterSpacing: "0.08em" }}>SIGN IN TO YOUR WORKSPACE</p>
      <div style={{
        width: "100%", padding: "8px 14px", borderRadius: 8,
        border: `1px solid ${C.purple}40`, background: "white",
        fontSize: 12, color: "#94a3b8",
      }}>your@company.com</div>
      <div style={{
        width: "100%", padding: "9px 14px", borderRadius: 8,
        background: `linear-gradient(135deg, ${C.purple}, ${C.teal})`,
        fontSize: 12, fontWeight: 600, color: "white", textAlign: "center",
      }}>Continue →</div>
    </div>
  );
}

/* ── Gradient colour swatches ────────────────────────────────────────── */
function Swatches() {
  const stops = [
    { c: C.purple, l: "Primary",   h: "#B8A0C8" },
    { c: C.teal,   l: "Secondary", h: "#88B8B0" },
    { c: C.gold,   l: "Accent",    h: "#C8A880" },
    { c: C.rose,   l: "Rose",      h: "#C0A0B8" },
    { c: C.deep,   l: "Deep",      h: "#9880B8" },
  ];
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {stops.map(({ c, l, h }) => (
        <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: c,
            boxShadow: `0 4px 12px ${c}50`,
            border: "2px solid rgba(255,255,255,0.25)",
          }} />
          <span style={{ fontSize: 9, fontFamily: "Inter", fontWeight: 600, color: "#cbd5e1" }}>{l}</span>
          <span style={{ fontSize: 8, fontFamily: "monospace", color: "#64748b" }}>{h}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main preview page ───────────────────────────────────────────────── */
export default function QPulseBrandPreview() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b0b10",
      padding: "40px 44px",
      boxSizing: "border-box",
    }}>

      {/* Page header */}
      <div style={{
        display: "flex", alignItems: "baseline", gap: 14,
        fontFamily: "Inter, sans-serif", marginBottom: 36,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "#475569", textTransform: "uppercase" }}>Brand Preview</span>
        <span style={{ fontSize: 11, color: "#334155" }}>QPulse · D-11 Rotating Halo · NexFlow Mesh Palette</span>
      </div>

      {/* ① Hero mark */}
      <Label>01 · Logo Mark — Large</Label>
      <div style={{
        background: "linear-gradient(135deg, #13111a 0%, #0e1813 50%, #181310 100%)",
        borderRadius: 20,
        padding: "44px 56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.06)",
        marginBottom: 8,
      }}>
        <QPulseLogo size={1.6} />
      </div>
      <p style={{ fontFamily: "Inter", fontSize: 10, color: "#475569", marginBottom: 0, fontStyle: "italic" }}>
        Halo rotates continuously · waveform draws in · wordmark fades in
      </p>

      <Divider />

      {/* ② Colour palette */}
      <Label>02 · Mesh-Gradient Palette</Label>
      <div style={{
        background: "#111118",
        borderRadius: 16,
        padding: "24px 28px",
        display: "flex", gap: 28, alignItems: "center",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <Swatches />
        <div style={{
          flex: 1,
          height: 44,
          borderRadius: 12,
          background: `linear-gradient(90deg, ${C.purple}, ${C.teal}, ${C.gold}, ${C.rose})`,
          boxShadow: `0 4px 24px ${C.purple}40`,
        }} />
      </div>

      <Divider />

      {/* ③ TopBar – light */}
      <Label>03 · TopBar Context — Light</Label>
      <TopBarMockup />

      <div style={{ height: 12 }} />

      {/* ④ TopBar – dark */}
      <Label>04 · TopBar Context — Dark</Label>
      <TopBarMockup dark />

      <Divider />

      {/* ⑤ Small sizes */}
      <Label>05 · Scale Variants</Label>
      <div style={{
        background: "#111118",
        borderRadius: 16,
        padding: "24px 28px",
        display: "flex", flexDirection: "column", gap: 18,
        border: "1px solid rgba(255,255,255,0.06)",
        alignItems: "flex-start",
      }}>
        {[0.9, 0.6, 0.42, 0.28].map(s => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: "monospace", fontSize: 9, color: "#475569", width: 36 }}>{Math.round(s * 100)}%</span>
            <QPulseLogo size={s} />
          </div>
        ))}
      </div>

      <Divider />

      {/* ⑥ Sign-in page */}
      <Label>06 · Sign-In Context</Label>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <SignInMockup />
      </div>

    </div>
  );
}
