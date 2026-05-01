import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const FIELDS = [
  { label: 'Intent', value: 'Replace HubSpot · Q3', color: '#C8A880' },
  { label: 'Pain', value: 'Legacy CRM · No Arabic', color: '#C0A0B8' },
  { label: 'Budget', value: 'SAR 240K / yr', color: '#88B8B0' },
  { label: 'Next', value: 'Demo · Tue 3:00pm', color: '#B8A0C8' },
];

export function Scene3CallMid() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => setPhase(4), 4400),
      setTimeout(() => setPhase(5), 5800),
      setTimeout(() => setPhase(6), 7200),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      {/* LEFT: Layla speaking — second dialogue snippet */}
      <motion.div
        className="absolute"
        style={{ left: '6vw', top: '12vh' }}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="text-[0.75vw] uppercase tracking-[0.5em]"
          style={{ color: 'rgba(184,160,200,0.7)' }}
        >
          Live Call · 00:1{Math.min(9, 2 + phase)}
        </div>
        <div
          dir="rtl"
          className="mt-[0.6vw]"
          style={{
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: 600,
            fontSize: '3vw',
            color: '#F1ECF4',
          }}
        >
          ليلى
        </div>
        <div
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: 'italic',
            fontSize: '1.3vw',
            color: 'rgba(241,236,244,0.6)',
          }}
        >
          Layla — Voice Agent
        </div>
      </motion.div>

      <div
        className="absolute"
        style={{ left: '4vw', bottom: '10vh', maxWidth: '40vw' }}
      >
        <motion.div
          dir="rtl"
          className="px-[1.4vw] py-[0.9vw] rounded-2xl backdrop-blur-md"
          style={{
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: 500,
            fontSize: '1.55vw',
            color: '#F1ECF4',
            background: 'rgba(136,184,176,0.14)',
            border: '1px solid rgba(136,184,176,0.4)',
            boxShadow: '0 8px 30px rgba(136,184,176,0.18)',
          }}
          initial={{ opacity: 0, y: 18 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          فهمت تماماً… نظامكم الحالي ما يدعم العربية بشكل كامل
        </motion.div>
        <motion.div
          className="mt-[0.6vw] pl-[1.6vw]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: 'italic',
            fontSize: '1.05vw',
            color: 'rgba(241,236,244,0.6)',
          }}
          initial={{ opacity: 0 }}
          animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          "Understood completely… your current system doesn't fully support Arabic."
        </motion.div>
      </div>

      {/* RIGHT: contact card with intent / pain / budget / next */}
      <motion.div
        className="absolute rounded-3xl backdrop-blur-md p-[2vw]"
        style={{
          right: '6vw',
          top: '10vh',
          width: '34vw',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(184,160,200,0.25)',
          boxShadow:
            '0 30px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-[1.4vw]">
          <div>
            <div
              className="text-[0.7vw] uppercase tracking-[0.4em]"
              style={{ color: 'rgba(241,236,244,0.45)' }}
            >
              CRM · Auto-fill
            </div>
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 500,
                fontSize: '1.5vw',
                color: '#F1ECF4',
              }}
            >
              Qualifying live
            </div>
          </div>
          <motion.div
            className="px-[0.8vw] py-[0.3vw] rounded-full text-[0.75vw] uppercase tracking-[0.3em]"
            style={{
              background: 'rgba(184,184,128,0.18)',
              color: '#B8B880',
              border: '1px solid rgba(184,184,128,0.5)',
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            BANT scoring
          </motion.div>
        </div>

        {FIELDS.map((f, i) => {
          const visible = phase >= 2 + i;
          return (
            <motion.div
              key={f.label}
              className="flex items-center justify-between py-[0.85vw] border-b"
              style={{ borderColor: 'rgba(184,160,200,0.18)' }}
              initial={{ opacity: 0, x: 30 }}
              animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="text-[0.85vw] uppercase tracking-[0.35em]"
                style={{ color: 'rgba(241,236,244,0.5)' }}
              >
                {f.label}
              </div>
              <div className="flex items-center gap-[0.6vw]">
                <motion.span
                  className="rounded-full"
                  style={{
                    width: '0.5vw',
                    height: '0.5vw',
                    background: f.color,
                    boxShadow: `0 0 12px ${f.color}`,
                  }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: '1.15vw',
                    color: '#F1ECF4',
                  }}
                >
                  {f.value}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Score bar */}
        <div className="mt-[1.4vw]">
          <div
            className="text-[0.75vw] uppercase tracking-[0.35em] mb-[0.4vw]"
            style={{ color: 'rgba(241,236,244,0.55)' }}
          >
            Qualification score
          </div>
          <div
            className="h-[0.6vw] rounded-full overflow-hidden"
            style={{ background: 'rgba(184,160,200,0.15)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, #B8A0C8, #88B8B0, #C8A880)',
              }}
              initial={{ width: '12%' }}
              animate={{
                width: ['12%', '40%', '62%', '78%', '92%'][Math.min(4, phase)],
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
