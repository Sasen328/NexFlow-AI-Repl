import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  PALETTE,
  DISPLAY_FONT,
  SANS_FONT,
  ARABIC_FONT,
  GlassPanel,
  SceneTitle,
} from './_shared';

const TRANSCRIPT = [
  {
    ar: 'السلام عليكم، معك ليلى من نكسفلو',
    en: 'Hello, Layla here from NexFlow',
    spk: 'Layla',
    accent: PALETTE.lavender,
  },
  {
    ar: 'أبشر، تفضلي',
    en: 'Of course, please go ahead',
    spk: 'Faisal',
    accent: PALETTE.gold,
  },
  {
    ar: 'حابة أعرض حلولنا للذكاء الاصطناعي',
    en: 'I would like to show our AI solutions',
    spk: 'Layla',
    accent: PALETTE.lavender,
  },
  {
    ar: 'ممتاز، يهمنا المنتج',
    en: 'Excellent, the product interests us',
    spk: 'Faisal',
    accent: PALETTE.gold,
  },
];

const CHIPS = [
  'Next step booked',
  'Decision-maker',
  'Budget confirmed',
  'Send proposal',
];

export function SceneCall() {
  const [phase, setPhase] = useState(0); // 0 ringing, 1 active, 2 ended/summary
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 1200),
      setTimeout(() => setShown(1), 2000),
      setTimeout(() => setShown(2), 3500),
      setTimeout(() => setShown(3), 5000),
      setTimeout(() => setShown(4), 6500),
      setTimeout(() => setPhase(2), 9500),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55 }}
        style={{ width: '60vw', maxWidth: 880 }}
      >
        <GlassPanel className="p-8 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 mb-5">
            <motion.div
              animate={{
                boxShadow:
                  phase === 1
                    ? [
                        '0 0 0 0 rgba(184,160,200,0.7)',
                        '0 0 0 18px rgba(184,160,200,0)',
                      ]
                    : '0 0 0 0 rgba(0,0,0,0)',
              }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="rounded-full"
              style={{
                width: 56,
                height: 56,
                background:
                  'linear-gradient(135deg, #B8A0C8, #C0A0B8 70%, #C8A880)',
              }}
            />
            <div className="flex-1">
              <div
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 20,
                  color: PALETTE.ink,
                }}
              >
                Layla · AI Voice Agent
              </div>
              <div
                dir="rtl"
                style={{
                  fontFamily: ARABIC_FONT,
                  fontSize: 13,
                  color: 'rgba(31,26,36,0.6)',
                }}
              >
                ليلى · المساعدة الصوتية
              </div>
            </div>
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="rounded-full px-3 py-1"
              style={{
                background:
                  phase === 2
                    ? 'rgba(136,184,176,0.25)'
                    : 'rgba(184,160,200,0.25)',
                color: PALETTE.ink,
                fontFamily: SANS_FONT,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.12em',
              }}
            >
              {phase === 0 ? 'RINGING' : phase === 1 ? 'LIVE · 00:42' : 'COMPLETE'}
            </motion.div>
          </div>

          {/* Waveform */}
          <div
            className="rounded-2xl p-4 mb-4 flex items-center justify-center gap-1.5"
            style={{
              background: 'rgba(184,160,200,0.10)',
              border: '1px solid rgba(184,160,200,0.22)',
              height: 80,
            }}
          >
            {Array.from({ length: 36 }).map((_, i) => (
              <motion.div
                key={i}
                style={{
                  width: 4,
                  borderRadius: 4,
                  background:
                    i % 3 === 0
                      ? 'linear-gradient(180deg, #B8A0C8, #88B8B0)'
                      : 'linear-gradient(180deg, #C0A0B8, #C8A880)',
                }}
                animate={{
                  height:
                    phase === 1
                      ? [
                          8 + (i * 7) % 30,
                          14 + (i * 5) % 38,
                          10 + (i * 3) % 26,
                        ]
                      : 8,
                }}
                transition={{
                  duration: 0.7 + (i % 4) * 0.15,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.04,
                }}
              />
            ))}
          </div>

          {/* Transcript */}
          <div
            className="flex flex-col gap-2 mb-4"
            style={{ minHeight: 140 }}
          >
            {TRANSCRIPT.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: shown > i ? 1 : 0,
                  y: shown > i ? 0 : 10,
                }}
                transition={{ duration: 0.4 }}
                className="rounded-xl px-3 py-2"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  borderLeft: `3px solid ${line.accent}`,
                }}
              >
                <div
                  style={{
                    fontFamily: SANS_FONT,
                    fontSize: 10,
                    color: line.accent,
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  {line.spk}
                </div>
                <div
                  dir="rtl"
                  style={{
                    fontFamily: ARABIC_FONT,
                    fontSize: 14,
                    color: PALETTE.ink,
                    fontWeight: 600,
                    marginTop: 2,
                  }}
                >
                  {line.ar}
                </div>
                <div
                  style={{
                    fontFamily: SANS_FONT,
                    fontSize: 12,
                    color: 'rgba(31,26,36,0.55)',
                    marginTop: 1,
                  }}
                >
                  {line.en}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sentiment meter */}
          <div className="flex items-center gap-3">
            <div
              style={{
                fontFamily: SANS_FONT,
                fontSize: 11,
                color: 'rgba(31,26,36,0.6)',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Sentiment
            </div>
            <div
              className="flex-1 h-2 rounded-full overflow-hidden relative"
              style={{ background: 'rgba(31,26,36,0.10)' }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                initial={{ width: '50%' }}
                animate={{
                  width: phase >= 2 ? '92%' : phase === 1 ? '78%' : '50%',
                }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background:
                    'linear-gradient(90deg, #C0A0B8, #B8A0C8, #88B8B0)',
                }}
              />
            </div>
            <motion.div
              animate={{
                color: phase >= 1 ? PALETTE.sage : 'rgba(31,26,36,0.6)',
              }}
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.04em',
              }}
            >
              POSITIVE
            </motion.div>
          </div>

          {/* Summary chips overlay (phase 2) */}
          <motion.div
            className="absolute left-0 right-0 bottom-0 rounded-b-[22px] p-5 flex flex-wrap gap-2 justify-center items-end"
            style={{
              background:
                'linear-gradient(180deg, transparent, rgba(250,247,244,0.97) 30%)',
              minHeight: '40%',
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: phase >= 2 ? 1 : 0,
              y: phase >= 2 ? 0 : 30,
            }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-full text-center mb-2">
              <span
                style={{
                  fontFamily: SANS_FONT,
                  fontSize: 11,
                  color: PALETTE.ink,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  opacity: 0.7,
                }}
              >
                AI summary · ملخص ذكي
              </span>
            </div>
            {CHIPS.map((c, i) => (
              <motion.div
                key={c}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{
                  opacity: phase >= 2 ? 1 : 0,
                  scale: phase >= 2 ? 1 : 0.7,
                }}
                transition={{
                  delay: phase >= 2 ? 0.15 + i * 0.12 : 0,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="rounded-full px-4 py-2"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(184,160,200,0.4)',
                  fontFamily: SANS_FONT,
                  fontSize: 12,
                  color: PALETTE.ink,
                  fontWeight: 600,
                  boxShadow: '0 6px 16px rgba(184,160,200,0.25)',
                }}
              >
                {c}
              </motion.div>
            ))}
          </motion.div>
        </GlassPanel>
      </motion.div>

      <SceneTitle ar="مكالمة بإشراف الذكاء" en="AI-coached call · Layla" />
    </div>
  );
}
