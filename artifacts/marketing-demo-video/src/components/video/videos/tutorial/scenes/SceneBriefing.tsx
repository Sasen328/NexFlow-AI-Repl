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

const ACTIONS = [
  {
    rank: 1,
    en: 'Call Faisal — Aramco · Discovery',
    ar: 'اتصل بفيصل — أرامكو · استكشاف',
    accent: PALETTE.lavender,
    meta: 'Hot · 96',
  },
  {
    rank: 2,
    en: 'Send proposal — Emaar HQ',
    ar: 'أرسل العرض — إعمار',
    accent: PALETTE.gold,
    meta: 'SAR 1.2M',
  },
  {
    rank: 3,
    en: 'Follow up Noura — STC Pay',
    ar: 'تابع نورة — STC Pay',
    accent: PALETTE.sage,
    meta: 'Reply due',
  },
];

export function SceneBriefing() {
  const [unfolded, setUnfolded] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setUnfolded(1), 1400),
      setTimeout(() => setUnfolded(2), 2600),
      setTimeout(() => setUnfolded(3), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '74vw', maxWidth: 1100 }}
      >
        <GlassPanel className="overflow-hidden">
          <FauxNavBar />
          <div className="grid grid-cols-12 gap-4 p-6">
            {/* Sidebar mock */}
            <div className="col-span-3 flex flex-col gap-2">
              {['Today', 'Pipeline', 'Inbox', 'Reports'].map((s, i) => (
                <div
                  key={s}
                  className="rounded-lg px-3 py-2"
                  style={{
                    background:
                      i === 0
                        ? 'linear-gradient(90deg, #B8A0C822, transparent)'
                        : 'transparent',
                    color: PALETTE.ink,
                    fontFamily: SANS_FONT,
                    fontSize: 12,
                    fontWeight: i === 0 ? 700 : 500,
                    opacity: i === 0 ? 1 : 0.55,
                  }}
                >
                  {s}
                </div>
              ))}
            </div>

            {/* Briefing card */}
            <div className="col-span-9">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: 28,
                    height: 28,
                    background:
                      'conic-gradient(from 0deg, #B8A0C8, #88B8B0, #C8A880, #B8A0C8)',
                    clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 800,
                      fontSize: 22,
                      color: PALETTE.ink,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Daily AI Briefing
                  </div>
                  <div
                    dir="rtl"
                    style={{
                      fontFamily: ARABIC_FONT,
                      fontSize: 13,
                      color: 'rgba(31,26,36,0.6)',
                    }}
                  >
                    موجزك الذكي اليوم · ٣ أولويات
                  </div>
                </div>
              </div>

              <motion.div
                className="rounded-2xl p-5 overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(184,160,200,0.18), rgba(136,184,176,0.12))',
                  border: '1px solid rgba(184,160,200,0.28)',
                }}
                initial={{ height: 90 }}
                animate={{ height: unfolded >= 1 ? 'auto' : 90 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  style={{
                    fontFamily: SANS_FONT,
                    fontSize: 12,
                    color: PALETTE.ink,
                    opacity: 0.7,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    marginBottom: 14,
                  }}
                >
                  Prioritized for you · لك خصيصاً
                </div>

                <div className="flex flex-col gap-3">
                  {ACTIONS.map((a, i) => (
                    <motion.div
                      key={a.rank}
                      initial={{ opacity: 0, x: -24 }}
                      animate={{
                        opacity: unfolded > i ? 1 : 0,
                        x: unfolded > i ? 0 : -24,
                      }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-4 rounded-xl px-4 py-3"
                      style={{
                        background: 'rgba(255,255,255,0.85)',
                        boxShadow: `inset 4px 0 0 ${a.accent}`,
                      }}
                    >
                      <div
                        className="rounded-full flex items-center justify-center"
                        style={{
                          width: 30,
                          height: 30,
                          background: `linear-gradient(135deg, ${a.accent}, ${PALETTE.ink})`,
                          color: '#fff',
                          fontFamily: DISPLAY_FONT,
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {a.rank}
                      </div>
                      <div className="flex-1">
                        <div
                          style={{
                            fontFamily: SANS_FONT,
                            fontSize: 14,
                            fontWeight: 600,
                            color: PALETTE.ink,
                          }}
                        >
                          {a.en}
                        </div>
                        <div
                          dir="rtl"
                          style={{
                            fontFamily: ARABIC_FONT,
                            fontSize: 12,
                            color: 'rgba(31,26,36,0.6)',
                            marginTop: 2,
                          }}
                        >
                          {a.ar}
                        </div>
                      </div>
                      <div
                        className="rounded-full px-3 py-1"
                        style={{
                          background: `${a.accent}25`,
                          color: PALETTE.ink,
                          fontFamily: SANS_FONT,
                          fontWeight: 700,
                          fontSize: 11,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {a.meta}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </GlassPanel>
      </motion.div>

      <SceneTitle ar="موجزك اليومي بالذكاء الاصطناعي" en="Daily AI briefing" />
    </div>
  );
}
