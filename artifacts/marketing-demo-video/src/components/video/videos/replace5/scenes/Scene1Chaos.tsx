import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TOOLS } from '../Template';

const ORBITS = [
  { x: '-26vw', y: '-18vh', rot: -8, delay: 0.05 },
  { x: '24vw', y: '-22vh', rot: 6, delay: 0.18 },
  { x: '30vw', y: '14vh', rot: -4, delay: 0.32 },
  { x: '-28vw', y: '18vh', rot: 9, delay: 0.45 },
  { x: '0vw', y: '24vh', rot: -3, delay: 0.6 },
];

function ToolCard({
  tool,
  pos,
  driftDur,
}: {
  tool: typeof TOOLS[number];
  pos: typeof ORBITS[number];
  driftDur: number;
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 select-none"
      initial={{ opacity: 0, scale: 0.6, x: pos.x, y: pos.y, rotate: pos.rot }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: [pos.rot - 3, pos.rot + 3, pos.rot - 3],
        x: pos.x,
        y: pos.y,
      }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{
        opacity: { duration: 0.5, delay: pos.delay },
        scale: { duration: 0.6, delay: pos.delay, ease: [0.16, 1, 0.3, 1] },
        rotate: { duration: driftDur, repeat: Infinity, ease: 'easeInOut' },
      }}
      style={{ marginLeft: '-9vw', marginTop: '-5.5vh' }}
    >
      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: driftDur * 0.7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="rounded-2xl px-5 py-4 backdrop-blur-md"
          style={{
            width: '18vw',
            background: `linear-gradient(135deg, ${tool.color}38, ${tool.color}10)`,
            border: `1px solid ${tool.color}66`,
            boxShadow: `0 18px 40px -16px ${tool.color}55, inset 0 1px 0 ${tool.color}33`,
          }}
        >
          <div
            className="flex items-center gap-2 mb-2"
            style={{ color: tool.color }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: tool.color, boxShadow: `0 0 10px ${tool.color}` }}
            />
            <div className="text-[10px] uppercase tracking-[0.25em] opacity-80">
              tool
            </div>
          </div>
          <div className="text-white text-[1.15vw] font-semibold leading-tight">
            {tool.en}
          </div>
          <div
            className="text-[0.95vw] mt-1 opacity-80"
            dir="rtl"
            style={{ color: '#e8dff0', fontFamily: "'IBM Plex Sans Arabic', system-ui" }}
          >
            {tool.ar}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TangledLines() {
  // Connect each pair of cards through center with curved paths
  const center = { x: 50, y: 50 };
  const points = [
    { x: 24, y: 32 },
    { x: 74, y: 28 },
    { x: 80, y: 64 },
    { x: 22, y: 68 },
    { x: 50, y: 78 },
  ];
  const pairs: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 0],
    [0, 2],
    [1, 3],
    [2, 4],
  ];
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {pairs.map(([a, b], i) => {
        const p1 = points[a];
        const p2 = points[b];
        const cx = center.x + (i % 2 === 0 ? -8 : 8);
        const cy = center.y + (i % 3 === 0 ? -6 : 6);
        const d = `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`;
        return (
          <motion.path
            key={i}
            d={d}
            stroke="#B8A0C8"
            strokeOpacity={0.35}
            strokeWidth={0.18}
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 1.2, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
          />
        );
      })}
    </svg>
  );
}

function StressedCursor() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % 5), 700);
    return () => clearInterval(t);
  }, []);
  const targets = [
    { x: 0, y: 0 },
    { x: -120, y: -80 },
    { x: 110, y: -90 },
    { x: 130, y: 60 },
    { x: -110, y: 70 },
  ];
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 z-20"
      animate={{ x: targets[phase].x, y: targets[phase].y }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
    >
      <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
        <path
          d="M2 2 L2 22 L8 18 L12 28 L16 26 L12 16 L20 16 Z"
          fill="white"
          stroke="#1F1A24"
          strokeWidth="1.2"
        />
      </svg>
      <motion.div
        className="absolute -inset-3 rounded-full"
        style={{ border: '1.5px solid rgba(192,160,184,0.6)' }}
        animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
      />
    </motion.div>
  );
}

export function Scene1Chaos() {
  return (
    <motion.div
      className="absolute inset-0 z-10"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      {/* Title bilingual */}
      <motion.div
        className="absolute top-[8vh] left-1/2 -translate-x-1/2 text-center z-30"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div
          className="text-white text-[2.2vw] font-light tracking-tight"
          style={{ fontFamily: "'Fraunces', 'Cormorant Garamond', serif" }}
        >
          Your sales stack is <span className="italic" style={{ color: '#C0A0B8' }}>chaos.</span>
        </div>
        <div
          className="mt-1 text-[1.2vw] opacity-70"
          dir="rtl"
          style={{
            color: '#d8cce0',
            fontFamily: "'IBM Plex Sans Arabic', system-ui",
          }}
        >
          منظومة مبيعاتك… فوضى.
        </div>
      </motion.div>

      <TangledLines />

      {TOOLS.map((tool, i) => (
        <ToolCard
          key={tool.key}
          tool={tool}
          pos={ORBITS[i]}
          driftDur={3 + i * 0.4}
        />
      ))}

      <StressedCursor />
    </motion.div>
  );
}
