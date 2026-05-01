import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PhoneProps {
  children?: ReactNode;
  /** screen content keyed for AnimatePresence swap is supplied via children */
  glow?: string;
}

/**
 * iPhone 15 Pro style mockup, code-only.
 * The outer frame holds itself; consumer animates the wrapping motion shell.
 * Width 320px (logical) at scale 1 — driven by parent transforms.
 */
export function PhoneFrame({ children, glow = 'rgba(184,160,200,0.55)' }: PhoneProps) {
  return (
    <div
      className="relative"
      style={{
        width: 340,
        height: 700,
        filter: `drop-shadow(0 60px 60px rgba(20,10,30,0.55)) drop-shadow(0 0 80px ${glow})`,
      }}
    >
      {/* Titanium body */}
      <div
        className="absolute inset-0 rounded-[58px]"
        style={{
          background:
            'linear-gradient(135deg, #4a4248 0%, #2a242c 30%, #1a161e 60%, #3c343a 100%)',
          padding: 6,
        }}
      >
        {/* Inner bezel */}
        <div
          className="relative w-full h-full rounded-[52px] overflow-hidden"
          style={{
            background: '#0a0810',
            boxShadow:
              'inset 0 0 0 2px rgba(255,255,255,0.04), inset 0 0 30px rgba(0,0,0,0.6)',
          }}
        >
          {/* Screen content */}
          <div className="absolute inset-0">{children}</div>

          {/* Dynamic Island */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-3 z-30 rounded-full"
            style={{
              width: 110,
              height: 32,
              background: '#000',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          />

          {/* Subtle screen reflection sweep */}
          <motion.div
            aria-hidden
            className="absolute inset-0 z-40 pointer-events-none rounded-[52px]"
            style={{
              background:
                'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.06) 55%, transparent 70%)',
              mixBlendMode: 'screen',
            }}
            animate={{ x: ['-60%', '60%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Glass corner highlight */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-[52px] z-40 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 60% 30% at 30% 0%, rgba(255,255,255,0.15), transparent 60%)',
            }}
          />
        </div>
      </div>

      {/* Side button hint */}
      <div
        className="absolute"
        style={{
          right: -3,
          top: 180,
          width: 4,
          height: 60,
          borderRadius: 2,
          background: 'linear-gradient(180deg, #1a161e, #4a4248, #1a161e)',
        }}
      />
      <div
        className="absolute"
        style={{
          left: -3,
          top: 140,
          width: 4,
          height: 30,
          borderRadius: 2,
          background: 'linear-gradient(180deg, #1a161e, #4a4248, #1a161e)',
        }}
      />
      <div
        className="absolute"
        style={{
          left: -3,
          top: 200,
          width: 4,
          height: 50,
          borderRadius: 2,
          background: 'linear-gradient(180deg, #1a161e, #4a4248, #1a161e)',
        }}
      />
    </div>
  );
}

export function StatusBar({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const color = tone === 'light' ? '#fff' : '#1F1A24';
  return (
    <div
      className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-7 pt-3.5"
      style={{ height: 44, color }}
    >
      <span className="text-[13px] font-semibold tabular-nums" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        9:41
      </span>
      <div className="flex items-center gap-1.5">
        {/* signal */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
          <rect x="0" y="7" width="3" height="4" rx="0.5" fill={color} />
          <rect x="4.5" y="5" width="3" height="6" rx="0.5" fill={color} />
          <rect x="9" y="3" width="3" height="8" rx="0.5" fill={color} />
          <rect x="13.5" y="0" width="3" height="11" rx="0.5" fill={color} />
        </svg>
        {/* battery */}
        <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
          <rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke={color} opacity="0.5" />
          <rect x="2" y="2" width="17" height="7" rx="1.5" fill={color} />
          <rect x="21.5" y="3.5" width="1.5" height="4" rx="0.5" fill={color} opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}
