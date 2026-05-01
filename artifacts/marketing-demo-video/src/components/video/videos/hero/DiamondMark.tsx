import { motion } from 'framer-motion';

interface DiamondMarkProps {
  size?: number | string;
  facetDelay?: number;
  facetDuration?: number;
  glow?: boolean;
  animateAssemble?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const STROKES = [
  { x: 82, y: 82, w: 860, h: 860, r: 72, sw: 18, grad: 'g1' },
  { x: 196, y: 196, w: 632, h: 632, r: 54, sw: 16, grad: 'g2' },
  { x: 304, y: 304, w: 416, h: 416, r: 38, sw: 14, grad: 'g3' },
  { x: 390, y: 390, w: 244, h: 244, r: 22, sw: 12, grad: 'g4' },
];

export function DiamondMark({
  size = 320,
  facetDelay = 0.18,
  facetDuration = 0.9,
  glow = true,
  animateAssemble = true,
  className,
  style,
}: DiamondMarkProps) {
  const sizeStyle =
    typeof size === 'number' ? { width: size, height: size } : { width: size, height: size };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        ...sizeStyle,
        ...style,
      }}
    >
      {glow && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: '-12%',
            background:
              'radial-gradient(circle at center, rgba(184,160,200,0.35), rgba(136,184,176,0.18) 35%, transparent 65%)',
            filter: 'blur(28px)',
          }}
        />
      )}
      <svg
        viewBox="0 0 1024 1024"
        width="100%"
        height="100%"
        style={{ position: 'relative', display: 'block' }}
      >
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B8A0C8" />
            <stop offset="35%" stopColor="#88B8B0" />
            <stop offset="70%" stopColor="#C8A880" />
            <stop offset="100%" stopColor="#C0A0B8" />
          </linearGradient>
          <linearGradient id="g2" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B8A0C8" />
            <stop offset="50%" stopColor="#88B8B0" />
            <stop offset="100%" stopColor="#C8A880" />
          </linearGradient>
          <linearGradient id="g3" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C0A0B8" />
            <stop offset="50%" stopColor="#88B8B0" />
            <stop offset="100%" stopColor="#C8A880" />
          </linearGradient>
          <linearGradient id="g4" x1="200" y1="200" x2="824" y2="824" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B8A0C8" />
            <stop offset="100%" stopColor="#88B8B0" />
          </linearGradient>
          <linearGradient
            id="gdot"
            x1="450"
            y1="450"
            x2="574"
            y2="574"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#B8A0C8" />
            <stop offset="100%" stopColor="#88B8B0" />
          </linearGradient>
        </defs>

        {STROKES.map((s, i) => {
          const perimeter = (s.w + s.h) * 2;
          return (
            <motion.rect
              key={i}
              x={s.x}
              y={s.y}
              width={s.w}
              height={s.h}
              rx={s.r}
              ry={s.r}
              transform="rotate(45 512 512)"
              fill="none"
              stroke={`url(#${s.grad})`}
              strokeWidth={s.sw}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={perimeter}
              initial={
                animateAssemble
                  ? { strokeDashoffset: perimeter, opacity: 0 }
                  : { strokeDashoffset: 0, opacity: 1 }
              }
              animate={{ strokeDashoffset: 0, opacity: 1 }}
              transition={{
                strokeDashoffset: {
                  duration: facetDuration,
                  delay: i * facetDelay,
                  ease: [0.16, 1, 0.3, 1],
                },
                opacity: {
                  duration: 0.4,
                  delay: i * facetDelay,
                  ease: 'easeOut',
                },
              }}
            />
          );
        })}

        <motion.circle
          cx="512"
          cy="512"
          r="38"
          fill="url(#gdot)"
          initial={animateAssemble ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: [0, 1.3, 1], opacity: 1 }}
          transition={{
            duration: 0.6,
            delay: animateAssemble ? STROKES.length * facetDelay : 0,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ transformOrigin: '512px 512px' }}
        />
      </svg>
    </div>
  );
}
