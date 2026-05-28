import { useEffect, useRef } from "react";

const C = {
  purple:  "#B8A0C8",
  teal:    "#88B8B0",
  gold:    "#C8A880",
  rose:    "#C0A0B8",
  deep:    "#9880B8",
};

const CSS = `
@keyframes qp-halo-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes qp-wave-draw {
  0%   { stroke-dashoffset: 120; opacity: 0; }
  20%  { opacity: 1; }
  100% { stroke-dashoffset: 0;   opacity: 1; }
}
@keyframes qp-word-arrive {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes qp-q-breathe {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.75; }
}
@keyframes qp-glow-pulse {
  0%,100% { filter: drop-shadow(0 0 5px #B8A0C888); }
  50%      { filter: drop-shadow(0 0 16px #88B8B0cc); }
}
.qp-halo-spin  { transform-origin: 46px 41px; animation: qp-halo-spin 14s linear infinite; }
.qp-q-breathe  { animation: qp-q-breathe 4s ease-in-out infinite; }
.qp-wave-draw  { stroke-dasharray: 120; animation: qp-wave-draw 2.2s ease-out forwards; animation-delay: 0.4s; opacity:0; }
.qp-word-arrive{ animation: qp-word-arrive 0.9s ease-out forwards; animation-delay: 0.3s; opacity:0; }
.qp-glow-pulse { animation: qp-glow-pulse 3s ease-in-out infinite; }
`;

function QPulseLogo({ size = 1 }: { size?: number }) {
  const uid = useRef(`qp${Math.random().toString(36).slice(2,8)}`).current;
  const id = (s: string) => `${uid}-${s}`;
  const cx = 46, cy = 41, rOuter = 40, rInner = 30;
  const vw = 278, vh = 82;

  return (
    <svg viewBox={`0 0 ${vw} ${vh}`} width={vw * size} height={vh * size} overflow="visible" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id("mg")} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={C.purple} />
          <stop offset="60%"  stopColor={C.teal} />
          <stop offset="100%" stopColor={C.gold} />
        </linearGradient>
        <linearGradient id={id("mg2")} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={C.teal} />
          <stop offset="100%" stopColor={C.gold} />
        </linearGradient>
        <linearGradient id={id("mg3")} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={C.purple} />
          <stop offset="100%" stopColor={C.teal} />
        </linearGradient>
        <filter id={id("glow")} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Rotating outer dashed halo */}
      <g className="qp-halo-spin">
        <circle cx={cx} cy={cy} r={rOuter} fill="none"
          stroke={`url(#${id("mg")})`} strokeWidth="0.7"
          strokeDasharray="2.5 6" opacity="0.55" />
      </g>

      {/* Q circle + tail */}
      <g className="qp-q-breathe qp-glow-pulse">
        <circle cx={cx} cy={cy} r={rInner} fill="none"
          stroke={`url(#${id("mg")})`} strokeWidth="2"
          filter={`url(#${id("glow")})`} />
        <line
          x1={cx + rInner * 0.58} y1={cy + rInner * 0.58}
          x2={cx + rInner * 0.92 + 9} y2={cy + rInner * 0.92 + 9}
          stroke={`url(#${id("mg")})`} strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Pulse waveform */}
      <path className="qp-wave-draw"
        d={`M ${cx-rInner+2} ${cy} L ${cx-rInner+10} ${cy}
            L ${cx-6} ${cy-13} L ${cx} ${cy+13}
            L ${cx+7} ${cy-17} L ${cx+14} ${cy+12}
            L ${cx+20} ${cy} L ${cx+rInner-2} ${cy}`}
        fill="none" stroke={`url(#${id("mg2")})`}
        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

      {/* "Pulse" wordmark */}
      <text className="qp-word-arrive"
        x={cx + rOuter + 10} y={cy + 11}
        fontFamily="Inter, -apple-system, sans-serif"
        fontSize="36" fontWeight="300" letterSpacing="0.04em"
        fill={`url(#${id("mg3")})`}>
        Pulse
      </text>
    </svg>
  );
}

function Swatch({ color, label, hex }: { color: string; label: string; hex: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: color,
        boxShadow: `0 4px 14px ${color}60`,
        border: "2px solid rgba(255,255,255,0.2)",
      }} />
      <span style={{ fontSize: 9, fontFamily: "Inter,sans-serif", fontWeight: 600, color: "#cbd5e1", letterSpacing: "0.05em" }}>{label}</span>
      <span style={{ fontSize: 8, fontFamily: "monospace", color: "#64748b" }}>{hex}</span>
    </div>
  );
}

function TopBarDemo({ dark }: { dark?: boolean }) {
  const bg = dark ? "#0f0f14" : "#ffffff";
  const border = dark ? "#ffffff12" : "#e2e8f0";
  const nav = dark ? "#94a3b8" : "#64748b";
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`,
      borderRadius: 12, padding: "10px 18px",
      display: "flex", alignItems: "center", gap: 16,
      fontFamily: "Inter,sans-serif",
    }}>
      <QPulseLogo size={0.36} />
      <div style={{ display: "flex", gap: 2, flex: 1 }}>
        {["Home","CRM","Comms","Growth","Insights"].map((t, i) => (
          <div key={t} style={{
            padding: "5px 12px", borderRadius: 8, fontSize: 12,
            fontWeight: i === 0 ? 600 : 400,
            background: i === 0 ? `${C.purple}20` : "transparent",
            color: i === 0 ? C.purple : nav,
            border: i === 0 ? `1px solid ${C.purple}35` : "1px solid transparent",
          }}>{t}</div>
        ))}
      </div>
      <div style={{
        padding: "5px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600,
        background: `linear-gradient(135deg, ${C.purple}, ${C.teal})`, color: "white",
      }}>AI Assistant</div>
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        background: `linear-gradient(135deg, ${C.teal}, ${C.purple})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color: "white",
      }}>SA</div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.06)", margin: "28px 0" }} />;
}
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "Inter,sans-serif", fontSize: 10, fontWeight: 700,
      letterSpacing: "0.14em", textTransform: "uppercase",
      color: "#475569", marginBottom: 12,
    }}>{children}</p>
  );
}

export default function BrandPreview() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: "#0b0b10",
      padding: "36px 48px", boxSizing: "border-box",
      fontFamily: "Inter,sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 36 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "#334155", textTransform: "uppercase" }}>Brand Preview</span>
        <span style={{ fontSize: 11, color: "#1e293b" }}>QPulse · D-11 Rotating Halo · NexFlow Mesh Palette</span>
      </div>

      {/* 01 Hero */}
      <Label>01 · Logo Mark — Large</Label>
      <div style={{
        background: "linear-gradient(135deg, #13111a 0%, #0e1813 50%, #181310 100%)",
        borderRadius: 20, padding: "52px 64px",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.06)", marginBottom: 8,
      }}>
        <QPulseLogo size={1.7} />
      </div>
      <p style={{ fontSize: 10, color: "#334155", fontStyle: "italic", marginBottom: 0 }}>
        Outer halo rotates continuously · pulse waveform draws in · wordmark fades in
      </p>

      <Divider />

      {/* 02 Palette */}
      <Label>02 · Mesh-Gradient Palette</Label>
      <div style={{
        background: "#111118", borderRadius: 16, padding: "22px 28px",
        display: "flex", gap: 28, alignItems: "center",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Swatch color={C.purple} label="Primary"   hex="#B8A0C8" />
          <Swatch color={C.teal}   label="Secondary" hex="#88B8B0" />
          <Swatch color={C.gold}   label="Accent"    hex="#C8A880" />
          <Swatch color={C.rose}   label="Rose"      hex="#C0A0B8" />
          <Swatch color={C.deep}   label="Deep"      hex="#9880B8" />
        </div>
        <div style={{
          flex: 1, height: 44, borderRadius: 12,
          background: `linear-gradient(90deg, ${C.purple}, ${C.teal}, ${C.gold}, ${C.rose})`,
          boxShadow: `0 4px 24px ${C.purple}40`,
        }} />
      </div>

      <Divider />

      {/* 03 TopBar light */}
      <Label>03 · TopBar Context — Light</Label>
      <TopBarDemo />

      <div style={{ height: 12 }} />

      {/* 04 TopBar dark */}
      <Label>04 · TopBar Context — Dark</Label>
      <TopBarDemo dark />

      <Divider />

      {/* 05 Scale */}
      <Label>05 · Scale Variants</Label>
      <div style={{
        background: "#111118", borderRadius: 16, padding: "24px 28px",
        display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        {[1.0, 0.7, 0.48, 0.32].map(s => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ fontFamily: "monospace", fontSize: 9, color: "#334155", width: 32 }}>{Math.round(s*100)}%</span>
            <QPulseLogo size={s} />
          </div>
        ))}
      </div>

      <Divider />

      {/* 06 Sign-in */}
      <Label>06 · Sign-In Context</Label>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{
          background: "linear-gradient(135deg, #f8f6fc, #eef6f5, #faf7f0)",
          borderRadius: 20, padding: "36px 32px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
          border: `1px solid ${C.purple}28`, minWidth: 300,
        }}>
          <QPulseLogo size={0.65} />
          <p style={{ fontSize: 10, color: "#94a3b8", letterSpacing: "0.1em", margin: 0 }}>SIGN IN TO YOUR WORKSPACE</p>
          <div style={{
            width: "100%", padding: "9px 14px", borderRadius: 10,
            border: `1px solid ${C.purple}40`, background: "white",
            fontSize: 12, color: "#94a3b8",
          }}>your@company.com</div>
          <div style={{
            width: "100%", padding: "10px 14px", borderRadius: 10,
            background: `linear-gradient(135deg, ${C.purple}, ${C.teal})`,
            fontSize: 12, fontWeight: 600, color: "white", textAlign: "center",
          }}>Continue →</div>
        </div>
      </div>

    </div>
  );
}
