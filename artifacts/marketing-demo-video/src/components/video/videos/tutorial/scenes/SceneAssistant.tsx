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

const QUESTION_AR = 'ما هي صفقاتي العاجلة؟';
const QUESTION_EN = 'What are my urgent deals?';

const ANSWERS = [
  {
    name: 'Aramco Digital',
    nameAr: 'أرامكو',
    why: 'Decision in 5 days · SAR 1.8M',
    accent: PALETTE.lavender,
  },
  {
    name: 'Emaar HQ',
    nameAr: 'إعمار',
    why: 'Proposal sent · awaiting reply',
    accent: PALETTE.gold,
  },
  {
    name: 'STC Pay',
    nameAr: 'STC Pay',
    why: 'Champion just left · re-engage',
    accent: PALETTE.sage,
  },
];

function useTypewriter(text: string, start: boolean, speed = 55) {
  const [out, setOut] = useState('');
  useEffect(() => {
    if (!start) {
      setOut('');
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, start, speed]);
  return out;
}

export function SceneAssistant() {
  const [step, setStep] = useState(0); // 0 closed, 1 opened, 2 typing, 3 answers

  useEffect(() => {
    const t = [
      setTimeout(() => setStep(1), 1400),
      setTimeout(() => setStep(2), 2400),
      setTimeout(() => setStep(3), 6200),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  const arTyped = useTypewriter(QUESTION_AR, step >= 2, 90);
  const enTyped = useTypewriter(QUESTION_EN, step >= 2, 55);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55 }}
        style={{ width: '78vw', maxWidth: 1140 }}
      >
        <GlassPanel className="overflow-hidden relative">
          <FauxNavBar />
          <div className="p-6" style={{ minHeight: 460 }}>
            <div
              style={{
                fontFamily: DISPLAY_FONT,
                fontSize: 22,
                fontWeight: 700,
                color: PALETTE.ink,
              }}
            >
              Today
            </div>
            <div
              dir="rtl"
              style={{
                fontFamily: ARABIC_FONT,
                fontSize: 13,
                color: 'rgba(31,26,36,0.6)',
              }}
            >
              لوحة العمل اليوم
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { l: 'Calls', v: '12 / 18' },
                { l: 'Meetings', v: '3' },
                { l: 'Pipeline', v: 'SAR 8.6M' },
              ].map((k) => (
                <div
                  key={k.l}
                  className="rounded-xl p-4"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(184,160,200,0.10), rgba(136,184,176,0.06))',
                    border: '1px solid rgba(184,160,200,0.22)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: SANS_FONT,
                      fontSize: 11,
                      color: 'rgba(31,26,36,0.55)',
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                    }}
                  >
                    {k.l}
                  </div>
                  <div
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontSize: 22,
                      fontWeight: 800,
                      color: PALETTE.ink,
                      marginTop: 4,
                    }}
                  >
                    {k.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating diamond bubble — bottom right corner */}
          <motion.div
            className="absolute"
            style={{ right: 20, bottom: 20, zIndex: 5 }}
            animate={{
              scale: step === 0 ? [1, 1.08, 1] : 1,
            }}
            transition={{ duration: 1.4, repeat: step === 0 ? Infinity : 0 }}
          >
            <motion.div
              animate={{
                width: step >= 1 ? 360 : 64,
                height: step >= 1 ? 380 : 64,
                borderRadius: step >= 1 ? 22 : 999,
              }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background:
                  'linear-gradient(160deg, rgba(184,160,200,0.98), rgba(136,184,176,0.92))',
                boxShadow:
                  '0 24px 60px -16px rgba(184,160,200,0.7), 0 0 0 1px rgba(255,255,255,0.25)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Diamond mark inside (closed state) */}
              {step === 0 && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      background:
                        'conic-gradient(from 45deg, #fff, #FAF7F4, #fff)',
                      clipPath:
                        'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
                    }}
                  />
                </div>
              )}

              {/* Open state content */}
              {step >= 1 && (
                <div className="absolute inset-0 p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        background:
                          'conic-gradient(from 45deg, #fff, #FAF7F4)',
                        clipPath:
                          'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
                      }}
                    />
                    <div
                      style={{
                        fontFamily: SANS_FONT,
                        fontSize: 12,
                        color: '#fff',
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Ask NexFlow
                    </div>
                  </div>

                  {/* Typed question */}
                  <div
                    className="rounded-xl px-3 py-2 mb-3"
                    style={{
                      background: 'rgba(255,255,255,0.95)',
                    }}
                  >
                    <div
                      dir="rtl"
                      style={{
                        fontFamily: ARABIC_FONT,
                        fontSize: 16,
                        fontWeight: 700,
                        color: PALETTE.ink,
                      }}
                    >
                      {arTyped}
                      {step === 2 && arTyped.length < QUESTION_AR.length && (
                        <span
                          style={{
                            display: 'inline-block',
                            width: 2,
                            height: 16,
                            background: PALETTE.lavender,
                            marginRight: 2,
                            verticalAlign: 'middle',
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        fontFamily: SANS_FONT,
                        fontSize: 12,
                        color: 'rgba(31,26,36,0.6)',
                        marginTop: 2,
                      }}
                    >
                      {enTyped}
                    </div>
                  </div>

                  {/* Streaming answer cards */}
                  <div className="flex flex-col gap-2">
                    {ANSWERS.map((a, i) => (
                      <motion.div
                        key={a.name}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{
                          opacity: step >= 3 ? 1 : 0,
                          y: step >= 3 ? 0 : 12,
                        }}
                        transition={{
                          delay: step >= 3 ? i * 0.22 : 0,
                          duration: 0.5,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="rounded-lg px-3 py-2"
                        style={{
                          background: 'rgba(255,255,255,0.96)',
                          borderLeft: `3px solid ${a.accent}`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            style={{
                              fontFamily: SANS_FONT,
                              fontWeight: 700,
                              fontSize: 12,
                              color: PALETTE.ink,
                            }}
                          >
                            {a.name}
                          </span>
                          <span
                            dir="rtl"
                            style={{
                              fontFamily: ARABIC_FONT,
                              fontSize: 11,
                              color: 'rgba(31,26,36,0.5)',
                            }}
                          >
                            {a.nameAr}
                          </span>
                        </div>
                        <div
                          style={{
                            fontFamily: SANS_FONT,
                            fontSize: 11,
                            color: 'rgba(31,26,36,0.65)',
                            marginTop: 2,
                          }}
                        >
                          {a.why}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pulse rings around the bubble (closed state) */}
              {step === 0 &&
                [0, 1].map((r) => (
                  <motion.div
                    key={r}
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ border: '2px solid rgba(255,255,255,0.5)' }}
                    animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      delay: r * 0.6,
                      ease: 'easeOut',
                    }}
                  />
                ))}
            </motion.div>
          </motion.div>
        </GlassPanel>
      </motion.div>

      <SceneTitle ar="مساعدك الذكي · جاهز دائماً" en="Always-on AI assistant" />
    </div>
  );
}
