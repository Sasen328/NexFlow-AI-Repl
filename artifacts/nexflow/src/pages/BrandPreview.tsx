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
@keyframes qp-wave-travel {
  from { stroke-dashoffset: 200; }
  to   { stroke-dashoffset:   0; }
}
@keyframes qp-word-arrive {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes qp-q-breathe {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.72; }
}
@keyframes qp-glow-pulse {
  0%,100% { filter: drop-shadow(0 0 5px #B8A0C888); }
  50%      { filter: drop-shadow(0 0 18px #88B8B0cc); }
}
.qp-halo-spin   { transform-origin: 46px 41px; animation: qp-halo-spin 14s linear infinite; }
.qp-q-breathe   { animation: qp-q-breathe 4s ease-in-out infinite; }
.qp-wave-travel { stroke-dasharray: 55 145; animation: qp-wave-travel 1.6s linear infinite; }
.qp-word-arrive { animation: qp-word-arrive 0.9s ease-out forwards; animation-delay: 0.3s; opacity:0; }
.qp-glow-pulse  { animation: qp-glow-pulse 3s ease-in-out infinite; }
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

      {/* Pulse waveform — continuously travelling dash */}
      <path className="qp-wave-travel"
        d={`M ${cx-rInner+2} ${cy} L ${cx-rInner+10} ${cy}
            L ${cx-6} ${cy-13} L ${cx} ${cy+13}
            L ${cx+7} ${cy-17} L ${cx+14} ${cy+12}
            L ${cx+20} ${cy} L ${cx+rInner-2} ${cy}`}
        fill="none" stroke={`url(#${id("mg2")})`}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

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
      <span style={{ fontSize: 9, fontFamily: "Inter,sans-serif", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.05em" }}>{label}</span>
      <span style={{ fontSize: 8, fontFamily: "monospace", color: "#64748b" }}>{hex}</span>
    </div>
  );
}

function TopBarDemo({ dark }: { dark?: boolean }) {
  const bg     = dark ? "#0f0f14" : "#ffffff";
  const border = dark ? "#ffffff12" : "#e2e8f0";
  const nav    = dark ? "#94a3b8"  : "#64748b";
  const wrap   = dark ? "#111118"  : "#f8fafc";
  return (
    <div style={{ background: wrap, borderRadius: 16, padding: "16px 20px", border: `1px solid ${dark ? "#ffffff08" : "#e2e8f0"}` }}>
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
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{
        fontFamily: "Inter,sans-serif", fontSize: 10, fontWeight: 700,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: "#64748b", marginBottom: 12,
      }}>{n} · {title}</p>
      {children}
    </div>
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
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "#e2e8f0", textTransform: "uppercase" }}>Brand Preview</span>
        <span style={{ fontSize: 11, color: "#64748b" }}>QPulse · D-11 Rotating Halo · NexFlow Mesh Palette</span>
      </div>

      {/* 01 Hero */}
      <Section n="01" title="Logo Mark — Large">
        <div style={{
          background: "linear-gradient(135deg, #13111a 0%, #0e1813 50%, #181310 100%)",
          borderRadius: 20, padding: "52px 64px",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.06)", marginBottom: 8,
        }}>
          <QPulseLogo size={1.7} />
        </div>
        <p style={{ fontSize: 10, color: "#475569", fontStyle: "italic" }}>
          Outer halo rotates continuously · pulse waveform travels through Q in a loop · wordmark fades in once
        </p>
      </Section>

      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 32 }} />

      {/* 02 Palette */}
      <Section n="02" title="Mesh-Gradient Palette">
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
      </Section>

      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 32 }} />

      {/* 03 TopBar light */}
      <Section n="03" title="TopBar Context — Light">
        <TopBarDemo />
      </Section>

      {/* 04 TopBar dark */}
      <Section n="04" title="TopBar Context — Dark">
        <TopBarDemo dark />
      </Section>

      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 32 }} />

      {/* 05 Scale */}
      <Section n="05" title="Scale Variants">
        <div style={{
          background: "#111118", borderRadius: 16, padding: "24px 28px",
          display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          {[1.0, 0.7, 0.48, 0.32].map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ fontFamily: "monospace", fontSize: 9, color: "#475569", width: 32 }}>{Math.round(s*100)}%</span>
              <QPulseLogo size={s} />
            </div>
          ))}
        </div>
      </Section>

      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 32 }} />

      {/* 06 Sign-in */}
      <Section n="06" title="Sign-In Context">
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
          {/* Light sign-in */}
          <div style={{
            background: "linear-gradient(135deg, #f8f6fc, #eef6f5, #faf7f0)",
            borderRadius: 20, padding: "36px 32px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
            border: `1px solid ${C.purple}28`, flex: 1,
          }}>
            <p style={{ fontSize: 9, color: "#94a3b8", letterSpacing: "0.12em", margin: 0, fontWeight: 600 }}>LIGHT</p>
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
              fontSize: 12, fontWeight: 600, color: "white", textAlign: "center" as const,
            }}>Continue →</div>
          </div>

          {/* Dark sign-in */}
          <div style={{
            background: "linear-gradient(135deg, #13111a, #0e1813, #181310)",
            borderRadius: 20, padding: "36px 32px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
            border: `1px solid ${C.purple}28`, flex: 1,
          }}>
            <p style={{ fontSize: 9, color: "#475569", letterSpacing: "0.12em", margin: 0, fontWeight: 600 }}>DARK</p>
            <QPulseLogo size={0.65} />
            <p style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", margin: 0 }}>SIGN IN TO YOUR WORKSPACE</p>
            <div style={{
              width: "100%", padding: "9px 14px", borderRadius: 10,
              border: `1px solid ${C.purple}28`, background: "rgba(255,255,255,0.04)",
              fontSize: 12, color: "#64748b",
            }}>your@company.com</div>
            <div style={{
              width: "100%", padding: "10px 14px", borderRadius: 10,
              background: `linear-gradient(135deg, ${C.purple}, ${C.teal})`,
              fontSize: 12, fontWeight: 600, color: "white", textAlign: "center" as const,
            }}>Continue →</div>
          </div>
        </div>
      </Section>

    </div>
  );
}
