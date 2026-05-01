import { motion } from 'framer-motion';

const STAGE_TINT: Record<string, string> = {
  signal: '#B8B880',
  score: '#B8A0C8',
  briefing: '#90B8B8',
  call: '#C0A0B8',
  pipeline: '#88B8B0',
  payoff: '#C8A880',
};

const POS: Record<string, { x: string; y: string; scale: number; opacity: number; rotate: number }> = {
  signal:   { x: '120vw', y: '50vh', scale: 0.6, opacity: 0,    rotate: -2 },
  score:    { x: '50vw',  y: '50vh', scale: 1.0, opacity: 1,    rotate:  0 },
  briefing: { x: '70vw',  y: '50vh', scale: 0.78, opacity: 0.95, rotate:  2 },
  call:     { x: '72vw',  y: '50vh', scale: 0.78, opacity: 0.95, rotate:  0 },
  pipeline: { x: '50vw',  y: '54vh', scale: 0.85, opacity: 1,    rotate:  0 },
  payoff:   { x: '50vw',  y: '50vh', scale: 1.05, opacity: 1,    rotate:  0 },
};

export function PersistentContactCard({ sceneKey }: { sceneKey: string }) {
  const pos = POS[sceneKey] ?? POS.signal;
  const tint = STAGE_TINT[sceneKey] ?? '#B8A0C8';
  const showStamp = sceneKey === 'payoff';

  return (
    <motion.div
      className="absolute z-20 pointer-events-none"
      style={{
        top: 0,
        left: 0,
        width: '32vw',
        minWidth: 380,
        maxWidth: 520,
      }}
      animate={{
        x: `calc(${pos.x} - 50%)`,
        y: `calc(${pos.y} - 50%)`,
        scale: pos.scale,
        opacity: pos.opacity,
        rotate: pos.rotate,
      }}
      initial={false}
      transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background:
            'linear-gradient(160deg, rgba(250,247,244,0.97), rgba(245,240,236,0.93))',
          boxShadow: `0 30px 60px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(184,160,200,0.25), 0 0 40px ${tint}33`,
          color: 'hsl(270,25%,20%)',
        }}
      >
        {/* Tint header bar */}
        <motion.div
          className="h-[6px] w-full"
          animate={{ background: `linear-gradient(90deg, #B8A0C8, ${tint}, #C8A880)` }}
          transition={{ duration: 0.8 }}
        />

        <div className="p-5">
          <div className="flex items-center gap-3">
            {/* Avatar — Khaleeji male executive icon (abstract initial) */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
              style={{
                background: `linear-gradient(135deg, ${tint}, #B8A0C8)`,
                fontFamily: 'Fraunces, serif',
                fontSize: 18,
              }}
            >
              FA
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-[15px] font-semibold leading-tight truncate"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                Faisal Al-Otaibi
              </div>
              <div
                className="text-[11px] opacity-70 leading-tight"
                dir="rtl"
                style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
              >
                المدير المالي · ACME Industries
              </div>
            </div>
            <motion.div
              className="text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-md"
              style={{ background: `${tint}22`, color: tint, fontWeight: 600 }}
              animate={{ background: `${tint}22`, color: tint }}
            >
              {sceneKey === 'pipeline' ? 'Negotiation' : sceneKey === 'payoff' ? 'Closed' : 'Hot'}
            </motion.div>
          </div>

          <div className="mt-3 h-px" style={{ background: 'rgba(184,160,200,0.2)' }} />

          {/* Compact stats row */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Stat label="Score" value="94" tint={tint} />
            <Stat label="Stage" value={shortStage(sceneKey)} tint={tint} />
            <Stat label="ر.س" value={valueFor(sceneKey)} tint={tint} />
          </div>

          {/* Closed-Won stamp (only on payoff) */}
          {showStamp && (
            <motion.div
              className="absolute right-3 top-3 -rotate-12"
              initial={{ opacity: 0, scale: 2.2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 220, damping: 14 }}
            >
              <div
                className="px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{
                  border: '2.5px solid #C8A880',
                  color: '#8C6F3E',
                  background: 'rgba(200,168,128,0.08)',
                  fontFamily: 'Fraunces, serif',
                }}
              >
                Closed-Won
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <div
      className="rounded-lg py-1.5"
      style={{ background: `${tint}10`, border: `1px solid ${tint}25` }}
    >
      <div className="text-[10px] uppercase tracking-[0.14em] opacity-60">{label}</div>
      <div className="text-[15px] font-semibold" style={{ fontFamily: 'Fraunces, serif', color: tint }}>
        {value}
      </div>
    </div>
  );
}

function shortStage(k: string): string {
  switch (k) {
    case 'briefing': return 'Discovery';
    case 'call':     return 'Discovery';
    case 'pipeline': return 'Nego.';
    case 'payoff':   return 'Won';
    default:         return 'New';
  }
}
function valueFor(k: string): string {
  switch (k) {
    case 'score':    return '0';
    case 'briefing': return '250k';
    case 'call':     return '450k';
    case 'pipeline': return '950k';
    case 'payoff':   return '1.25M';
    default:         return '—';
  }
}
