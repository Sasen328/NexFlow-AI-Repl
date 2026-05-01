import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const FIELDS = [
  { label: 'Name', value: 'Ahmad Al-Otaibi', color: '#B8A0C8' },
  { label: 'Company', value: 'Tharwah Logistics', color: '#88B8B0' },
  { label: 'Role', value: 'VP Sales · Riyadh', color: '#C0A0B8' },
];

export function Scene2CallOpen() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 3200),
      setTimeout(() => setPhase(4), 4800),
      setTimeout(() => setPhase(5), 6400),
      setTimeout(() => setPhase(6), 8000),
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
      {/* LEFT side label – Layla */}
      <motion.div
        className="absolute"
        style={{ left: '6vw', top: '12vh' }}
        initial={{ opacity: 0, x: -20 }}
        animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="text-[0.75vw] uppercase tracking-[0.5em]"
          style={{ color: 'rgba(184,160,200,0.7)' }}
        >
          Live Call · 00:0{Math.min(9, Math.max(1, phase * 2))}
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

      {/* LEFT bottom: floating Arabic + EN dialogue caption */}
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
            fontSize: '1.6vw',
            color: '#F1ECF4',
            background: 'rgba(184,160,200,0.14)',
            border: '1px solid rgba(184,160,200,0.35)',
            boxShadow: '0 8px 30px rgba(184,160,200,0.18)',
          }}
          initial={{ opacity: 0, y: 18 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          صباح الخير، أحمد… أتواصل معك من نكسفلو
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
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          "Good morning, Ahmad… I'm reaching out from NexFlow."
        </motion.div>
      </div>

      {/* RIGHT side: Contact Card */}
      <motion.div
        className="absolute rounded-3xl backdrop-blur-md p-[2vw]"
        style={{
          right: '6vw',
          top: '14vh',
          width: '34vw',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(184,160,200,0.25)',
          boxShadow:
            '0 30px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
        initial={{ opacity: 0, x: 40, scale: 0.96 }}
        animate={phase >= 1 ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 40, scale: 0.96 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-[1vw] mb-[1.4vw]">
          <motion.div
            className="rounded-full flex items-center justify-center"
            style={{
              width: '3.4vw',
              height: '3.4vw',
              background:
                'linear-gradient(135deg, #B8A0C8, #88B8B0)',
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              fontWeight: 700,
              fontSize: '1.4vw',
              color: '#1F1A24',
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            أ
          </motion.div>
          <div>
            <div
              className="text-[0.7vw] uppercase tracking-[0.4em]"
              style={{ color: 'rgba(241,236,244,0.45)' }}
            >
              Contact · CRM
            </div>
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 500,
                fontSize: '1.5vw',
                color: '#F1ECF4',
              }}
            >
              Cold lead → Live
            </div>
          </div>
        </div>

        {FIELDS.map((f, i) => {
          const visible = phase >= 2 + i;
          return (
            <motion.div
              key={f.label}
              className="flex items-center justify-between py-[0.9vw] border-b"
              style={{ borderColor: 'rgba(184,160,200,0.18)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.45 }}
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

        <motion.div
          className="mt-[1.4vw] flex items-center gap-[0.6vw] text-[0.9vw]"
          style={{ color: 'rgba(136,184,176,0.95)' }}
          initial={{ opacity: 0 }}
          animate={phase >= 6 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.span
            className="rounded-full"
            style={{
              width: '0.55vw',
              height: '0.55vw',
              background: '#88B8B0',
              boxShadow: '0 0 12px #88B8B0',
            }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="uppercase tracking-[0.35em]">
            Listening · Real-time enrichment
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
