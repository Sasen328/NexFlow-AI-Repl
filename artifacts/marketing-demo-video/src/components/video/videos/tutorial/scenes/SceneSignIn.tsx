import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  PALETTE,
  DISPLAY_FONT,
  SANS_FONT,
  ARABIC_FONT,
  GlassPanel,
  BilingualChip,
  SceneTitle,
} from './_shared';

const PERSONAS = [
  { ar: 'مندوب مبيعات', en: 'SDR', accent: PALETTE.lavender },
  { ar: 'مدير حساب', en: 'AE', accent: PALETTE.sage },
  { ar: 'مدير المبيعات', en: 'Sales Manager', accent: PALETTE.gold },
];

export function SceneSignIn() {
  const [picked, setPicked] = useState(-1);
  const [welcome, setWelcome] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPicked(1), 4200);
    const t2 = setTimeout(() => setWelcome(true), 6800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '52vw', maxWidth: 720 }}
      >
        <GlassPanel className="px-10 py-9">
          <div className="flex items-center gap-3 mb-7">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 38,
                height: 38,
                background:
                  'conic-gradient(from 45deg, #B8A0C8, #88B8B0, #C8A880, #B8A0C8)',
                clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 800,
                  fontSize: 24,
                  color: PALETTE.ink,
                  letterSpacing: '-0.01em',
                }}
              >
                NexFlow
              </div>
              <div
                style={{
                  fontFamily: SANS_FONT,
                  fontSize: 11,
                  color: 'rgba(31,26,36,0.55)',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                Sign in · تسجيل الدخول
              </div>
            </div>
          </div>

          <div
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: 28,
              color: PALETTE.ink,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            Choose your role
          </div>
          <div
            dir="rtl"
            style={{
              fontFamily: ARABIC_FONT,
              fontSize: 18,
              color: 'rgba(31,26,36,0.65)',
              marginTop: 4,
            }}
          >
            اختر دورك للمتابعة
          </div>

          <div className="mt-7 flex flex-col gap-3">
            {PERSONAS.map((p, i) => {
              const active = picked === i;
              return (
                <motion.div
                  key={p.en}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                  className="flex items-center justify-between rounded-2xl px-5 py-4"
                  style={{
                    border: `1.5px solid ${
                      active ? p.accent : 'rgba(31,26,36,0.10)'
                    }`,
                    background: active
                      ? `linear-gradient(90deg, ${p.accent}22, ${p.accent}08)`
                      : 'rgba(255,255,255,0.5)',
                    boxShadow: active
                      ? `0 12px 28px -8px ${p.accent}66`
                      : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-full"
                      style={{
                        width: 36,
                        height: 36,
                        background: `linear-gradient(135deg, ${p.accent}, ${PALETTE.ink})`,
                      }}
                    />
                    <div className="flex flex-col">
                      <span
                        style={{
                          fontFamily: SANS_FONT,
                          fontWeight: 700,
                          color: PALETTE.ink,
                          fontSize: 15,
                        }}
                      >
                        {p.en}
                      </span>
                      <span
                        dir="rtl"
                        style={{
                          fontFamily: ARABIC_FONT,
                          fontSize: 12,
                          color: 'rgba(31,26,36,0.6)',
                        }}
                      >
                        {p.ar}
                      </span>
                    </div>
                  </div>
                  <motion.div
                    animate={{
                      scale: active ? [1, 1.15, 1] : 1,
                      opacity: active ? 1 : 0.25,
                    }}
                    transition={{ duration: 0.6 }}
                    className="rounded-full"
                    style={{
                      width: 14,
                      height: 14,
                      background: active ? p.accent : 'rgba(31,26,36,0.15)',
                      border: active
                        ? `2px solid ${p.accent}`
                        : '2px solid rgba(31,26,36,0.2)',
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </GlassPanel>
      </motion.div>

      {/* Welcome chip flies in after pick */}
      {welcome && (
        <motion.div
          className="absolute"
          style={{ left: '50%', top: '12vh', transform: 'translateX(-50%)' }}
          initial={{ opacity: 0, y: -20, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <BilingualChip ar="أهلاً، سيف" en="Welcome, Saif" big delay={0} />
        </motion.div>
      )}

      <SceneTitle ar="ابدأ مع نكسفلو في ٩٠ ثانية" en="Get started in 90 seconds" delay={0.3} />
    </div>
  );
}
