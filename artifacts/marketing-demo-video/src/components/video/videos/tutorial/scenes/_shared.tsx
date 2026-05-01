import { motion } from 'framer-motion';

export const PALETTE = {
  lavender: '#B8A0C8',
  sage: '#88B8B0',
  gold: '#C8A880',
  rose: '#C0A0B8',
  teal: '#90B8B8',
  olive: '#B8B880',
  ink: '#1F1A24',
  cream: '#FAF7F4',
};

export const DISPLAY_FONT = "'Fraunces', Georgia, serif";
export const SANS_FONT = "'Inter', system-ui, sans-serif";
export const ARABIC_FONT = "'IBM Plex Sans Arabic', 'Inter', system-ui, sans-serif";

export function GlassPanel({
  children,
  className = '',
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-[22px] ${className}`}
      style={{
        background:
          'linear-gradient(160deg, rgba(250,247,244,0.96), rgba(240,236,242,0.92))',
        boxShadow:
          '0 30px 60px -20px rgba(15,12,20,0.55), 0 0 0 1px rgba(184,160,200,0.18)',
        backdropFilter: 'blur(20px)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function BilingualChip({
  ar,
  en,
  delay = 0,
  big = false,
}: {
  ar: string;
  en: string;
  delay?: number;
  big?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="inline-flex items-center gap-3 rounded-full"
      style={{
        padding: big ? '0.7rem 1.4rem' : '0.4rem 0.95rem',
        background:
          'linear-gradient(90deg, rgba(184,160,200,0.95), rgba(136,184,176,0.95))',
        boxShadow: '0 8px 24px rgba(184,160,200,0.35)',
      }}
    >
      <span
        dir="rtl"
        style={{
          fontFamily: ARABIC_FONT,
          fontWeight: 700,
          fontSize: big ? '1.5rem' : '0.95rem',
          color: '#fff',
          letterSpacing: '0.01em',
        }}
      >
        {ar}
      </span>
      <span
        style={{
          width: 1,
          alignSelf: 'stretch',
          background: 'rgba(255,255,255,0.45)',
        }}
      />
      <span
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: big ? '1.2rem' : '0.85rem',
          color: 'rgba(255,255,255,0.95)',
          letterSpacing: '0.02em',
        }}
      >
        {en}
      </span>
    </motion.div>
  );
}

export function FauxNavBar() {
  return (
    <div
      className="flex items-center justify-between px-5 py-3"
      style={{
        borderBottom: '1px solid rgba(184,160,200,0.18)',
        background: 'rgba(255,255,255,0.45)',
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="rounded-md"
          style={{
            width: 18,
            height: 18,
            background:
              'conic-gradient(from 45deg, #B8A0C8, #88B8B0, #C8A880, #B8A0C8)',
            transform: 'rotate(45deg)',
          }}
        />
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            color: PALETTE.ink,
            fontSize: 13,
          }}
        >
          NexFlow
        </span>
      </div>
      <div className="flex items-center gap-4">
        {['Home', 'Pipeline', 'Contacts', 'Calls'].map((t) => (
          <span
            key={t}
            style={{
              fontFamily: SANS_FONT,
              fontSize: 11,
              color: PALETTE.ink,
              opacity: 0.55,
              fontWeight: 500,
            }}
          >
            {t}
          </span>
        ))}
        <div
          className="rounded-full"
          style={{
            width: 22,
            height: 22,
            background:
              'linear-gradient(135deg, #B8A0C8, #88B8B0)',
          }}
        />
      </div>
    </div>
  );
}

export function SceneTitle({
  ar,
  en,
  delay = 0,
}: {
  ar: string;
  en: string;
  delay?: number;
}) {
  return (
    <div className="absolute z-20" style={{ left: '4vw', bottom: '6vh' }}>
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.6 }}
        style={{
          fontFamily: SANS_FONT,
          color: 'rgba(255,255,255,0.45)',
          fontSize: 12,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {en}
      </motion.div>
      <motion.div
        dir="rtl"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: delay + 0.12, duration: 0.6 }}
        style={{
          fontFamily: ARABIC_FONT,
          color: '#fff',
          fontSize: '1.6rem',
          fontWeight: 700,
        }}
      >
        {ar}
      </motion.div>
    </div>
  );
}
