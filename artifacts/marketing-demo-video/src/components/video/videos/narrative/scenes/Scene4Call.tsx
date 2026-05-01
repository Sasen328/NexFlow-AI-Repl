import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const NOTES = [
  { en: 'CFO confirmed expansion plan', ar: 'المدير المالي يؤكد خطة التوسع' },
  { en: 'Wants Arabic-first reporting', ar: 'يريد تقارير بالعربية أولاً' },
  { en: 'Decision in 3 weeks', ar: 'القرار خلال ٣ أسابيع' },
  { en: 'Budget aligned · ر.س 1.25M', ar: 'الميزانية متوافقة · ١٫٢٥ مليون ر.س' },
];

export function Scene4Call() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 200),  // Layla appears
      setTimeout(() => setPhase(2), 2400), // handoff
      setTimeout(() => setPhase(3), 3600), // Noura takes over
      setTimeout(() => setPhase(4), 5000), // notes start writing
      setTimeout(() => setPhase(5), 10500),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-[8vh] left-1/2 -translate-x-1/2 text-center">
        <div className="text-[10px] uppercase tracking-[0.4em] opacity-50">04 · The Call</div>
        <div
          className="text-[12px] mt-1 opacity-45"
          dir="rtl"
          style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
        >
          المكالمة
        </div>
      </div>

      {/* Two voice agent badges with overlapping waveforms */}
      <div className="absolute left-[6vw] top-[26vh] w-[44vw] min-w-[460px]">
        <div className="flex items-end gap-4 mb-3">
          <AgentBadge name="Layla" arabic="ليلى" tint="#B8A0C8" role="AI · ice-breaker" arabicRole="ذكاء اصطناعي · مقدمة" active={phase >= 1 && phase < 3} />
          <div className="opacity-40 text-[24px] font-light pb-2">→</div>
          <AgentBadge name="Noura" arabic="نورة" tint="#88B8B0" role="Sales · discovery" arabicRole="مبيعات · اكتشاف" active={phase >= 3} />
        </div>

        {/* Waveform stack — Layla (lavender) on top, Noura (sage) under */}
        <div
          className="relative rounded-2xl p-5 overflow-hidden"
          style={{
            background: 'rgba(250,247,244,0.05)',
            border: '1px solid rgba(184,160,200,0.25)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <Waveform tint="#B8A0C8" amplitudeMax={1} active={phase >= 1 && phase < 3} fadeOut={phase >= 3} bars={42} />
          <div className="h-3" />
          <Waveform tint="#88B8B0" amplitudeMax={1.1} active={phase >= 3} fadeOut={false} bars={42} />

          {/* Connecting handoff arc */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[2px] rounded-full"
            style={{ background: 'linear-gradient(90deg, #B8A0C8, #88B8B0)' }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: phase === 2 ? 1 : phase >= 3 ? 1 : 0,
              opacity: phase === 2 ? 0.9 : phase >= 3 ? 0.4 : 0,
            }}
            transition={{ duration: 0.6 }}
          />
        </div>

        {/* Caption beneath waveform */}
        <div className="mt-3 flex justify-between text-[11px] opacity-70">
          <div>00:14 · ice-breaker in Arabic</div>
          <div>02:38 · discovery</div>
        </div>
      </div>

      {/* Live discovery notes panel — auto-writing */}
      <motion.div
        className="absolute right-[5vw] top-[24vh] w-[28vw] min-w-[320px] max-w-[420px] rounded-2xl p-4"
        style={{
          background: 'rgba(250,247,244,0.06)',
          border: '1px solid rgba(136,184,176,0.4)',
          backdropFilter: 'blur(8px)',
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: phase >= 3 ? 1 : 0, y: phase >= 3 ? 0 : 16 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ background: '#88B8B0' }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <div className="text-[11px] uppercase tracking-[0.25em] opacity-75">
            Auto-writing to deal
          </div>
        </div>
        <div className="space-y-2">
          {NOTES.map((n, i) => {
            const visible = phase >= 4;
            return (
              <motion.div
                key={i}
                className="rounded-lg px-3 py-2"
                style={{ background: 'rgba(136,184,176,0.1)', border: '1px solid rgba(136,184,176,0.25)' }}
                initial={{ opacity: 0, x: 16 }}
                animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }}
                transition={{ duration: 0.5, delay: visible ? i * 0.6 : 0 }}
              >
                <div className="text-[12px] font-medium leading-tight">{n.en}</div>
                <div
                  className="text-[11px] opacity-70 leading-tight mt-0.5"
                  dir="rtl"
                  style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
                >
                  {n.ar}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

function AgentBadge({
  name, arabic, role, arabicRole, tint, active,
}: {
  name: string; arabic: string; role: string; arabicRole: string; tint: string; active: boolean;
}) {
  return (
    <motion.div
      className="flex items-center gap-3"
      animate={{ opacity: active ? 1 : 0.4, scale: active ? 1 : 0.94 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
        style={{
          background: `linear-gradient(135deg, ${tint}, ${tint}99)`,
          fontFamily: 'Fraunces, serif',
          boxShadow: active ? `0 0 24px ${tint}` : 'none',
        }}
        animate={{ boxShadow: active ? [`0 0 12px ${tint}`, `0 0 28px ${tint}`, `0 0 12px ${tint}`] : 'none' }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        {name[0]}
      </motion.div>
      <div>
        <div className="text-[14px] font-semibold leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>
          {name} <span className="opacity-50">·</span>{' '}
          <span dir="rtl" style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}>{arabic}</span>
        </div>
        <div className="text-[11px] opacity-65 leading-tight">
          {role} · <span dir="rtl" style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}>{arabicRole}</span>
        </div>
      </div>
    </motion.div>
  );
}

function Waveform({
  tint, amplitudeMax, active, fadeOut, bars,
}: { tint: string; amplitudeMax: number; active: boolean; fadeOut: boolean; bars: number }) {
  return (
    <div className="flex items-center gap-[3px] h-[64px]">
      {Array.from({ length: bars }).map((_, i) => {
        const phaseShift = (i / bars) * Math.PI * 2;
        return (
          <motion.div
            key={i}
            className="rounded-full flex-1"
            style={{ background: tint, minWidth: 3 }}
            animate={
              active
                ? {
                    height: [
                      `${10 + (Math.sin(phaseShift) + 1) * 12 * amplitudeMax}px`,
                      `${20 + (Math.sin(phaseShift + 1.4) + 1) * 18 * amplitudeMax}px`,
                      `${10 + (Math.sin(phaseShift + 2.8) + 1) * 14 * amplitudeMax}px`,
                    ],
                    opacity: 0.95,
                  }
                : { height: '6px', opacity: fadeOut ? 0.25 : 0.18 }
            }
            transition={{
              duration: 0.7 + (i % 5) * 0.06,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.012,
            }}
          />
        );
      })}
    </div>
  );
}
