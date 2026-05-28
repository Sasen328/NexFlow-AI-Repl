import logoFull from "@/assets/logo_full.png";

const STROKE_W = 3.5;

const GRAD_OUTER  = "url(#nfMarkOuter)";
const GRAD_MIDDLE = "url(#nfMarkMiddle)";
const GRAD_INNER  = "url(#nfMarkInner)";
const GRAD_CORE   = "url(#nfMarkCore)";

function NexFlowDiamondMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 220 220"
      width={size}
      height={size}
      role="img"
      aria-label="NexFlow"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id="nfMarkOuter" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#B8A0C8" />
          <stop offset="50%"  stopColor="#C0A0B8" />
          <stop offset="100%" stopColor="#C8A880" />
        </linearGradient>
        <linearGradient id="nfMarkMiddle" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#88B8B0" />
          <stop offset="100%" stopColor="#C0A0B8" />
        </linearGradient>
        <linearGradient id="nfMarkInner" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stopColor="#B8B880" />
          <stop offset="100%" stopColor="#88B8B0" />
        </linearGradient>
        <radialGradient id="nfMarkCore" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%"   stopColor="#C0A0B8" />
          <stop offset="100%" stopColor="#B8A0C8" />
        </radialGradient>
      </defs>
      {/* Concentric diamonds — sized so 45°-rotated tips stay inside the
          220x220 viewBox (max half-diagonal ≈ 99 < 110), eliminating the
          edge-clipping bug present in the prior PNG export. */}
      <rect
        x="40" y="40" width="140" height="140" rx="6"
        transform="rotate(45 110 110)"
        fill="none" stroke={GRAD_OUTER} strokeWidth={STROKE_W}
      />
      <rect
        x="65" y="65" width="90" height="90" rx="5"
        transform="rotate(45 110 110)"
        fill="none" stroke={GRAD_MIDDLE} strokeWidth={STROKE_W}
      />
      <rect
        x="85" y="85" width="50" height="50" rx="4"
        transform="rotate(45 110 110)"
        fill="none" stroke={GRAD_INNER} strokeWidth={STROKE_W}
      />
      <circle cx="110" cy="110" r="8" fill={GRAD_CORE} />
    </svg>
  );
}

export function NexFlowLogo({ size = 36 }: { size?: number }) {
  return <NexFlowDiamondMark size={size} />;
}

export function NexFlowWordmark({ className }: { className?: string }) {
  return (
    <img
      src={logoFull}
      alt="NexFlow"
      className={className}
      style={{ width: "160px", height: "auto", display: "block", objectFit: "contain" }}
    />
  );
}
