import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  PALETTE,
  DISPLAY_FONT,
  SANS_FONT,
  ARABIC_FONT,
  GlassPanel,
  FauxNavBar,
  SceneTitle,
} from './_shared';

const SIGNALS = [
  {
    label: 'Series C · USD 250M',
    sub: 'Funding · Bloomberg · 2d',
    accent: PALETTE.gold,
  },
  {
    label: 'Hiring 40+ engineers',
    sub: 'Signal · LinkedIn · 5d',
    accent: PALETTE.sage,
  },
  {
    label: 'New CTO appointed',
    sub: 'News · Argaam · 1w',
    accent: PALETTE.lavender,
  },
  {
    label: 'Mentioned in Vision 2030 brief',
    sub: 'Signal · MCIT · 1w',
    accent: PALETTE.olive,
  },
];

export function SceneContact() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1700), // contact card opens
      setTimeout(() => setStep(2), 3000), // signals stream
      setTimeout(() => setStep(3), 5500), // enrichment glow ring
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55 }}
        style={{ width: '76vw', maxWidth: 1140 }}
      >
        <GlassPanel className="overflow-hidden">
          <FauxNavBar />
          <div className="relative p-6">
            {/* + Contact pill (highlighted on step 0) */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between mb-5"
            >
              <div
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  color: PALETTE.ink,
                  fontSize: 18,
                }}
              >
                Contacts
              </div>
              <motion.div
                animate={{
                  boxShadow: step === 0
                    ? [
                        '0 0 0 0 rgba(184,160,200,0.6)',
                        '0 0 0 14px rgba(184,160,200,0)',
                      ]
                    : '0 0 0 0 rgba(184,160,200,0)',
                }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="rounded-full px-4 py-2 flex items-center gap-2"
                style={{
                  background:
                    'linear-gradient(90deg, #B8A0C8, #88B8B0)',
                  color: '#fff',
                  fontFamily: SANS_FONT,
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
                Contact
              </motion.div>
            </motion.div>

            {/* Enriched profile */}
            <motion.div
              className="grid grid-cols-12 gap-5 rounded-2xl p-5"
              style={{
                background:
                  'linear-gradient(135deg, rgba(184,160,200,0.10), rgba(136,184,176,0.06))',
                border: '1px solid rgba(184,160,200,0.22)',
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{
                opacity: step >= 1 ? 1 : 0,
                scale: step >= 1 ? 1 : 0.96,
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="col-span-4 flex flex-col items-center text-center">
                <motion.div
                  className="rounded-2xl relative"
                  style={{
                    width: 110,
                    height: 110,
                    background:
                      'linear-gradient(135deg, #B8A0C8, #C0A0B8 60%, #C8A880)',
                  }}
                  animate={{
                    boxShadow:
                      step >= 3
                        ? '0 0 0 6px rgba(184,160,200,0.35), 0 0 40px rgba(136,184,176,0.55)'
                        : '0 0 0 0 rgba(184,160,200,0)',
                  }}
                  transition={{ duration: 0.8 }}
                >
                  {/* sparkle ring */}
                  {step >= 3 && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        border: '2px dashed rgba(184,160,200,0.8)',
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </motion.div>
                <div
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 20,
                    color: PALETTE.ink,
                    marginTop: 12,
                  }}
                >
                  Faisal Al-Otaibi
                </div>
                <div
                  dir="rtl"
                  style={{
                    fontFamily: ARABIC_FONT,
                    fontSize: 13,
                    color: 'rgba(31,26,36,0.65)',
                  }}
                >
                  فيصل العتيبي · مدير المشتريات
                </div>
                <div
                  className="mt-2 rounded-full px-3 py-1"
                  style={{
                    background: 'rgba(136,184,176,0.22)',
                    fontFamily: SANS_FONT,
                    fontSize: 11,
                    color: PALETTE.ink,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}
                >
                  Riyadh · KSA
                </div>
              </div>

              <div className="col-span-8 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div
                      style={{
                        fontFamily: DISPLAY_FONT,
                        fontWeight: 700,
                        fontSize: 18,
                        color: PALETTE.ink,
                      }}
                    >
                      Aramco Digital
                    </div>
                    <div
                      style={{
                        fontFamily: SANS_FONT,
                        fontSize: 11,
                        color: 'rgba(31,26,36,0.55)',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Auto-enriched · 38 sources
                    </div>
                  </div>
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="rounded-full px-3 py-1"
                    style={{
                      background:
                        'linear-gradient(90deg, #B8A0C8, #88B8B0)',
                      color: '#fff',
                      fontFamily: SANS_FONT,
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: '0.06em',
                    }}
                  >
                    AI ENRICHED
                  </motion.div>
                </div>

                <div className="flex flex-col gap-2">
                  {SIGNALS.map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{
                        opacity: step >= 2 ? 1 : 0,
                        x: step >= 2 ? 0 : 30,
                      }}
                      transition={{
                        delay: step >= 2 ? i * 0.18 : 0,
                        duration: 0.5,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="flex items-center gap-3 rounded-xl px-3 py-2"
                      style={{
                        background: 'rgba(255,255,255,0.85)',
                        boxShadow: `inset 3px 0 0 ${s.accent}`,
                      }}
                    >
                      <div
                        className="rounded"
                        style={{
                          width: 8,
                          height: 8,
                          background: s.accent,
                          transform: 'rotate(45deg)',
                        }}
                      />
                      <div className="flex-1">
                        <div
                          style={{
                            fontFamily: SANS_FONT,
                            fontSize: 13,
                            fontWeight: 600,
                            color: PALETTE.ink,
                          }}
                        >
                          {s.label}
                        </div>
                        <div
                          style={{
                            fontFamily: SANS_FONT,
                            fontSize: 10,
                            color: 'rgba(31,26,36,0.5)',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {s.sub}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </GlassPanel>
      </motion.div>

      <SceneTitle ar="إثراء فوري للسجلات" en="Auto-enriched contacts" />
    </div>
  );
}
