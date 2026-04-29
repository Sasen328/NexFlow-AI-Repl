import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ScreenshotFrame, SceneCaption } from '../ScreenshotFrame';

const TOOLS = [
  { src: '/screenshots/marketing-assistant.jpg', label: 'Marketing AI', desc: 'GCC-fluent copilot' },
  { src: '/screenshots/campaigns.jpg', label: 'Campaigns', desc: 'Email + multi-channel' },
  { src: '/screenshots/sequences.jpg', label: 'Sequences', desc: 'Automated cadences' },
  { src: '/screenshots/audiences.jpg', label: 'Audiences', desc: 'AI-built segments' },
  { src: '/screenshots/segments.jpg', label: 'Segments', desc: 'Live behavioural cohorts' },
  { src: '/screenshots/templates.jpg', label: 'Templates', desc: 'Email + WhatsApp library' },
  { src: '/screenshots/web-forms.jpg', label: 'Web Forms', desc: 'Lead capture' },
  { src: '/screenshots/meetings.jpg', label: 'Meetings', desc: 'Round-robin booking' },
  { src: '/screenshots/document-tracking.jpg', label: 'Document Tracking', desc: 'See every open + click' },
  { src: '/screenshots/quote-to-cash.jpg', label: 'Quote-to-Cash', desc: 'Tap, HyperPay, PayTabs' },
  { src: '/screenshots/cultural-intelligence.jpg', label: 'Cultural Intelligence', desc: 'GCC localization engine' },
];

const ROTATE_MS = 1300;

export function SceneAllTools() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % TOOLS.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  const tool = TOOLS[index];

  return (
    <motion.div
      key="scene-alltools"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-12 py-10"
    >
      <div className="absolute top-[5vh] left-0 right-0 z-20 flex flex-col items-center px-12 text-center pointer-events-none">
        <div
          className="mb-3 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] text-white"
          style={{
            background:
              'linear-gradient(90deg, rgba(184,160,200,0.95), rgba(136,184,176,0.95))',
          }}
        >
          EVERYTHING IN ONE PLATFORM
        </div>
        <h2
          className="text-[2.6vw] leading-[1.05] font-bold text-[#1a1530] max-w-[80vw] drop-shadow-sm"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
        >
          11 marketing tools, one unified workspace
        </h2>
      </div>

      <div className="relative w-full max-w-[1480px] mt-2 grid grid-cols-12 gap-6 flex-1 max-h-[640px]">
        {/* Big featured screenshot left */}
        <motion.div
          key={tool.src}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="col-span-8 relative"
        >
          <ScreenshotFrame
            src={tool.src}
            alt={tool.label}
            initialScale={1}
            finalScale={1.04}
            duration={1.4}
          />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="absolute left-7 bottom-7 px-5 py-3 rounded-2xl backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(184,160,200,0.95), rgba(136,184,176,0.95))',
              boxShadow: '0 14px 40px rgba(45,30,60,0.28)',
              border: '1px solid rgba(255,255,255,0.35)',
            }}
          >
            <div className="text-[11px] tracking-[0.18em] uppercase text-white/80 font-semibold">
              Now showing
            </div>
            <div className="text-[26px] leading-tight font-bold text-white">{tool.label}</div>
            <div className="text-[14px] text-white/90">{tool.desc}</div>
          </motion.div>
        </motion.div>

        {/* Tool list right */}
        <div className="col-span-4 flex flex-col gap-2 overflow-hidden">
          <div
            className="px-4 py-2 rounded-xl text-[11px] tracking-[0.2em] uppercase font-bold"
            style={{
              background: 'rgba(45,30,60,0.06)',
              color: '#5A4A6A',
              border: '1px solid rgba(45,30,60,0.08)',
            }}
          >
            Marketing module
          </div>
          {TOOLS.map((t, i) => {
            const active = i === index;
            return (
              <motion.div
                key={t.label}
                animate={{
                  scale: active ? 1.02 : 1,
                  x: active ? 4 : 0,
                }}
                transition={{ duration: 0.25 }}
                className="px-4 py-2.5 rounded-xl flex items-center gap-3"
                style={{
                  background: active
                    ? 'linear-gradient(90deg, rgba(184,160,200,0.18), rgba(136,184,176,0.12))'
                    : 'rgba(255,255,255,0.55)',
                  border: active
                    ? '1px solid rgba(184,160,200,0.5)'
                    : '1px solid rgba(45,30,60,0.06)',
                  boxShadow: active ? '0 6px 18px rgba(184,160,200,0.25)' : 'none',
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold shrink-0"
                  style={{
                    background: active
                      ? 'linear-gradient(135deg, #B8A0C8, #88B8B0)'
                      : 'rgba(45,30,60,0.06)',
                    color: active ? '#fff' : '#5A4A6A',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[14px] font-semibold leading-tight truncate"
                    style={{ color: active ? '#2D1E3C' : '#3D2D4C' }}
                  >
                    {t.label}
                  </div>
                  <div className="text-[11px] text-[#6B5B7B] truncate">{t.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
