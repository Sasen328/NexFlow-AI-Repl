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

const STAGES = [
  { en: 'Discovery', ar: 'استكشاف', accent: PALETTE.lavender },
  { en: 'Demo', ar: 'عرض', accent: PALETTE.sage },
  { en: 'Proposal', ar: 'عرض سعر', accent: PALETTE.gold },
  { en: 'Closed', ar: 'مغلق', accent: PALETTE.rose },
];

const OTHER_DEALS: Record<number, { name: string; amount: string }[]> = {
  0: [{ name: 'NEOM Tech', amount: 'SAR 480k' }],
  1: [{ name: 'Mada Pay', amount: 'SAR 920k' }],
  2: [{ name: 'Emaar HQ', amount: 'AED 1.2M' }],
  3: [{ name: 'STC Cloud', amount: 'SAR 2.4M' }],
};

export function ScenePipeline() {
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMoved(true), 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55 }}
        style={{ width: '80vw', maxWidth: 1180 }}
      >
        <GlassPanel className="overflow-hidden">
          <FauxNavBar />
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 22,
                    color: PALETTE.ink,
                  }}
                >
                  Pipeline
                </div>
                <div
                  dir="rtl"
                  style={{
                    fontFamily: ARABIC_FONT,
                    fontSize: 13,
                    color: 'rgba(31,26,36,0.6)',
                  }}
                >
                  خط الصفقات · ربع رابع
                </div>
              </div>
              <div
                className="rounded-full px-3 py-1"
                style={{
                  background: 'rgba(184,160,200,0.18)',
                  fontFamily: SANS_FONT,
                  fontSize: 11,
                  color: PALETTE.ink,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                }}
              >
                Q4 · SAR 8.6M
              </div>
            </div>

            {/* Kanban */}
            <div className="grid grid-cols-4 gap-4 relative">
              {STAGES.map((s, idx) => {
                const isOrigin = idx === 0;
                const isDest = idx === 1;
                const ghost = isOrigin && moved;
                const others = OTHER_DEALS[idx] ?? [];
                return (
                  <div key={s.en} className="flex flex-col gap-2">
                    <motion.div
                      animate={{
                        background:
                          moved && isDest
                            ? `linear-gradient(180deg, ${s.accent}55, ${s.accent}1a)`
                            : `linear-gradient(180deg, ${s.accent}25, ${s.accent}08)`,
                      }}
                      transition={{ duration: 0.6 }}
                      className="rounded-xl px-3 py-2 flex items-center justify-between"
                      style={{
                        border: `1px solid ${s.accent}55`,
                      }}
                    >
                      <div className="flex flex-col">
                        <span
                          style={{
                            fontFamily: SANS_FONT,
                            fontSize: 12,
                            fontWeight: 700,
                            color: PALETTE.ink,
                            letterSpacing: '0.04em',
                          }}
                        >
                          {s.en}
                        </span>
                        <span
                          dir="rtl"
                          style={{
                            fontFamily: ARABIC_FONT,
                            fontSize: 11,
                            color: 'rgba(31,26,36,0.6)',
                          }}
                        >
                          {s.ar}
                        </span>
                      </div>
                      <div
                        className="rounded-full"
                        style={{
                          width: 22,
                          height: 22,
                          background: s.accent,
                          color: '#fff',
                          fontFamily: SANS_FONT,
                          fontWeight: 800,
                          fontSize: 11,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {idx === 0 ? (moved ? 1 : 2) : idx === 1 ? (moved ? 2 : 1) : 1}
                      </div>
                    </motion.div>

                    {/* dropzone */}
                    <div
                      className="rounded-xl flex flex-col gap-2 p-2"
                      style={{
                        minHeight: 200,
                        background: 'rgba(255,255,255,0.55)',
                        border: '1.5px dashed rgba(31,26,36,0.10)',
                      }}
                    >
                      {others.map((d) => (
                        <div
                          key={d.name}
                          className="rounded-lg p-3"
                          style={{
                            background: '#fff',
                            boxShadow:
                              '0 4px 10px rgba(31,26,36,0.06), inset 3px 0 0 ' + s.accent,
                          }}
                        >
                          <div
                            style={{
                              fontFamily: SANS_FONT,
                              fontWeight: 700,
                              fontSize: 12,
                              color: PALETTE.ink,
                            }}
                          >
                            {d.name}
                          </div>
                          <div
                            style={{
                              fontFamily: SANS_FONT,
                              fontWeight: 600,
                              fontSize: 11,
                              color: s.accent,
                              marginTop: 2,
                            }}
                          >
                            {d.amount}
                          </div>
                        </div>
                      ))}

                      {/* Ghost outline left in origin */}
                      {ghost && (
                        <motion.div
                          className="rounded-lg p-3"
                          style={{
                            border: '1.5px dashed rgba(184,160,200,0.5)',
                            background: 'rgba(184,160,200,0.06)',
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                        >
                          <div
                            style={{
                              fontFamily: SANS_FONT,
                              fontSize: 11,
                              color: 'rgba(31,26,36,0.4)',
                            }}
                          >
                            moved →
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Animated draggable card — Aramco Digital */}
              <motion.div
                className="absolute rounded-lg p-3 z-10"
                initial={{
                  left: '2%',
                  top: '60px',
                  rotate: -2,
                  scale: 1,
                }}
                animate={{
                  left: moved ? '27%' : '2%',
                  top: moved ? '120px' : '60px',
                  rotate: moved ? 0 : -2,
                  scale: moved ? 1 : 1.03,
                  boxShadow: moved
                    ? '0 12px 28px rgba(136,184,176,0.45), inset 3px 0 0 #88B8B0'
                    : '0 18px 36px rgba(184,160,200,0.55), inset 3px 0 0 #B8A0C8',
                }}
                transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
                style={{
                  width: '20%',
                  background: '#fff',
                }}
              >
                <div
                  style={{
                    fontFamily: SANS_FONT,
                    fontWeight: 800,
                    fontSize: 13,
                    color: PALETTE.ink,
                  }}
                >
                  Aramco Digital
                </div>
                <div
                  dir="rtl"
                  style={{
                    fontFamily: ARABIC_FONT,
                    fontSize: 11,
                    color: 'rgba(31,26,36,0.6)',
                    marginTop: 1,
                  }}
                >
                  أرامكو ديجيتال
                </div>
                <motion.div
                  animate={{ color: moved ? PALETTE.sage : PALETTE.lavender }}
                  transition={{ duration: 1.4 }}
                  style={{
                    fontFamily: SANS_FONT,
                    fontWeight: 700,
                    fontSize: 12,
                    marginTop: 6,
                  }}
                >
                  SAR 1.8M · ﷼
                </motion.div>
                <motion.div
                  animate={{
                    background: moved
                      ? 'rgba(136,184,176,0.22)'
                      : 'rgba(184,160,200,0.22)',
                    color: PALETTE.ink,
                  }}
                  className="rounded-full px-2 py-0.5 mt-2 inline-block"
                  style={{
                    fontFamily: SANS_FONT,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  {moved ? 'DEMO' : 'DISCOVERY'}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </GlassPanel>
      </motion.div>

      <SceneTitle ar="حركة خط الصفقات" en="Pipeline in motion" />
    </div>
  );
}
