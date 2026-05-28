/**
 * QPulse brand marks — replaces the old NexFlow diamond.
 *
 * NexFlowLogo     → Q-circle icon mark only  (TopBar, small uses)
 * NexFlowWordmark → Q + "Pulse" full lockup  (MarketingTopBar, hero)
 *
 * Export names kept for zero-diff backward compat throughout the app.
 */

const C = { purple:"#B8A0C8", teal:"#88B8B0", gold:"#C8A880" };

let _injected = false;
function ensureCSS() {
  if (_injected || typeof document === "undefined") return;
  _injected = true;
  const s = document.createElement("style");
  s.textContent = `
    @keyframes _qp-spin   { to { transform: rotate(360deg) } }
    @keyframes _qp-travel { from { stroke-dashoffset: 170 } to { stroke-dashoffset: 0 } }
    @keyframes _qp-breath { 0%,100% { opacity:1 } 50% { opacity:.72 } }
    @keyframes _qp-arrive { from { opacity:0; transform:translateX(-6px) } to { opacity:1; transform:translateX(0) } }
  `;
  document.head.appendChild(s);
}

/** Icon-only mark: Q circle + waveform, no text. Square 82×82 viewBox. */
export function NexFlowLogo({ size = 36 }: { size?: number }) {
  ensureCSS();
  // Use size in the id so multiple sizes on the same page share gradients safely
  const p  = `qpi${size}`;
  const cx = 41, cy = 41, rO = 38, rI = 27;
  const wd = `M${cx-rI+2},${cy} L${cx-rI+8},${cy}
    L${cx-5},${cy-12} L${cx},${cy+12}
    L${cx+6},${cy-15} L${cx+12},${cy+11}
    L${cx+18},${cy} L${cx+rI-2},${cy}`;

  return (
    <svg viewBox="0 0 82 82" width={size} height={size}
      role="img" aria-label="QPulse"
      style={{ display:"block", overflow:"visible" }}>
      <defs>
        <linearGradient id={`${p}a`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={C.purple}/>
          <stop offset="55%"  stopColor={C.teal}/>
          <stop offset="100%" stopColor={C.gold}/>
        </linearGradient>
        <linearGradient id={`${p}b`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={C.teal}/>
          <stop offset="100%" stopColor={C.gold}/>
        </linearGradient>
        <filter id={`${p}g`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Outer dashed halo */}
      <circle cx={cx} cy={cy} r={rO} fill="none"
        stroke={`url(#${p}a)`} strokeWidth="0.7" strokeDasharray="2.5 5.5" opacity="0.55"
        style={{ transformOrigin:`${cx}px ${cy}px`, animation:"_qp-spin 14s linear infinite" }}/>

      {/* Q circle */}
      <circle cx={cx} cy={cy} r={rI} fill="none"
        stroke={`url(#${p}a)`} strokeWidth="2" filter={`url(#${p}g)`}
        style={{ animation:"_qp-breath 4s ease-in-out infinite" }}/>

      {/* Q tail */}
      <line x1={cx+rI*0.6} y1={cy+rI*0.6} x2={cx+rI*0.92+7} y2={cy+rI*0.92+7}
        stroke={`url(#${p}a)`} strokeWidth="2" strokeLinecap="round"
        style={{ animation:"_qp-breath 4s ease-in-out infinite" }}/>

      {/* Full waveform base — always visible, dim */}
      <path d={wd} fill="none" stroke={`url(#${p}b)`}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.28"/>

      {/* Traveling glow over waveform */}
      <path d={wd} fill="none" stroke={`url(#${p}b)`}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        filter={`url(#${p}g)`}
        style={{ strokeDasharray:"36 134", animation:"_qp-travel 1.5s linear infinite" }}/>
    </svg>
  );
}

/** Full lockup: Q icon + "Pulse" wordmark. 278×82 viewBox at 32px height. */
export function NexFlowWordmark({ className, height = 32 }: { className?: string; height?: number }) {
  ensureCSS();
  const p  = "qpwm";
  const cx = 46, cy = 41, rO = 40, rI = 30;
  const wd = `M${cx-rI+2},${cy} L${cx-rI+10},${cy}
    L${cx-6},${cy-13} L${cx},${cy+13}
    L${cx+7},${cy-17} L${cx+14},${cy+12}
    L${cx+20},${cy} L${cx+rI-2},${cy}`;

  return (
    <svg viewBox="0 0 278 82" height={height} className={className}
      style={{ display:"block", overflow:"visible" }}>
      <defs>
        <linearGradient id={`${p}a`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={C.purple}/>
          <stop offset="55%"  stopColor={C.teal}/>
          <stop offset="100%" stopColor={C.gold}/>
        </linearGradient>
        <linearGradient id={`${p}b`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={C.teal}/>
          <stop offset="100%" stopColor={C.gold}/>
        </linearGradient>
        <linearGradient id={`${p}c`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={C.purple}/>
          <stop offset="100%" stopColor={C.teal}/>
        </linearGradient>
        <filter id={`${p}g`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Outer halo */}
      <circle cx={cx} cy={cy} r={rO} fill="none"
        stroke={`url(#${p}a)`} strokeWidth="0.7" strokeDasharray="2.5 6" opacity="0.55"
        style={{ transformOrigin:`${cx}px ${cy}px`, animation:"_qp-spin 14s linear infinite" }}/>

      {/* Q circle + tail */}
      <circle cx={cx} cy={cy} r={rI} fill="none"
        stroke={`url(#${p}a)`} strokeWidth="2" filter={`url(#${p}g)`}
        style={{ animation:"_qp-breath 4s ease-in-out infinite" }}/>
      <line x1={cx+rI*0.58} y1={cy+rI*0.58} x2={cx+rI*0.92+9} y2={cy+rI*0.92+9}
        stroke={`url(#${p}a)`} strokeWidth="2" strokeLinecap="round"
        style={{ animation:"_qp-breath 4s ease-in-out infinite" }}/>

      {/* Waveform base */}
      <path d={wd} fill="none" stroke={`url(#${p}b)`}
        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.28"/>

      {/* Traveling glow */}
      <path d={wd} fill="none" stroke={`url(#${p}b)`}
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        filter={`url(#${p}g)`}
        style={{ strokeDasharray:"42 158", animation:"_qp-travel 1.5s linear infinite" }}/>

      {/* "Pulse" wordmark */}
      <text x={cx+rO+10} y={cy+10}
        fontFamily="Inter,-apple-system,sans-serif"
        fontSize="28" fontWeight="300" letterSpacing="0.04em"
        fill={`url(#${p}c)`}
        style={{ animation:"_qp-arrive 0.9s ease-out forwards", opacity:0 }}>
        Pulse
      </text>
    </svg>
  );
}
