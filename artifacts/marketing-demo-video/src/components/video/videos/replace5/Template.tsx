import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { Scene1Chaos } from './scenes/Scene1Chaos';
import { Scene2Problem } from './scenes/Scene2Problem';
import { Scene3Collapse } from './scenes/Scene3Collapse';
import { Scene4Win } from './scenes/Scene4Win';
import { Scene5Payoff } from './scenes/Scene5Payoff';

export const SCENE_DURATIONS = {
  chaos: 7000,
  problem: 7500,
  collapse: 6500,
  win: 11000,
  payoff: 8000,
};

export const TOOLS = [
  { key: 'crm', en: 'CRM', ar: 'إدارة العملاء', color: '#B8A0C8' },
  { key: 'dialer', en: 'Dialer', ar: 'مُتصِل', color: '#90B8B8' },
  { key: 'email', en: 'Email Outreach', ar: 'تواصل بالبريد', color: '#C8A880' },
  { key: 'notes', en: 'Notes & AI', ar: 'ملاحظات وذكاء', color: '#C0A0B8' },
  { key: 'reports', en: 'Pipeline Reports', ar: 'تقارير', color: '#B8B880' },
];

const SCENE_INDEX: Record<string, number> = {
  chaos: 0,
  problem: 1,
  collapse: 2,
  win: 3,
  payoff: 4,
};

interface VideoTemplateProps {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (sceneKey: string) => void;
}

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
}: VideoTemplateProps = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const idx = SCENE_INDEX[currentSceneKey] ?? 0;

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% 40%, #2a2330 0%, #1F1A24 60%, #15111a 100%)',
        fontFamily: "'Inter', 'IBM Plex Sans Arabic', system-ui, sans-serif",
      }}
    >
      {/* Persistent ambient blobs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '60vw',
          height: '60vw',
          left: '-15vw',
          top: '-20vh',
          background: 'radial-gradient(circle, rgba(184,160,200,0.18), transparent 65%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, '6vw', '-3vw', 0],
          y: [0, '4vh', '-2vh', 0],
          opacity: idx === 4 ? 0.55 : 0.35,
        }}
        transition={{
          x: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: 1.2 },
        }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '50vw',
          height: '50vw',
          right: '-10vw',
          bottom: '-15vh',
          background: 'radial-gradient(circle, rgba(136,184,176,0.16), transparent 65%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, '-5vw', '3vw', 0],
          y: [0, '-3vh', '2vh', 0],
          opacity: idx >= 3 ? 0.55 : 0.3,
        }}
        transition={{
          x: { duration: 11, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 11, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: 1.2 },
        }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '40vw',
          height: '40vw',
          right: '20vw',
          top: '30vh',
          background: 'radial-gradient(circle, rgba(200,168,128,0.12), transparent 65%)',
          filter: 'blur(50px)',
        }}
        animate={{
          x: [0, '4vw', 0],
          y: [0, '-3vh', 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Persistent corner mark — appears small at open and close */}
      <motion.div
        className="absolute z-30 pointer-events-none"
        animate={{
          opacity: idx === 0 || idx === 4 ? 0.85 : 0,
          scale: idx === 4 ? 1 : 0.85,
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          top: '5vh',
          left: '5vw',
          width: '5vw',
          height: '5vw',
        }}
      >
        <DiamondMark size="100%" />
      </motion.div>

      <AnimatePresence initial={false} mode="wait">
        {currentSceneKey === 'chaos' && <Scene1Chaos key="chaos" />}
        {currentSceneKey === 'problem' && <Scene2Problem key="problem" />}
        {currentSceneKey === 'collapse' && <Scene3Collapse key="collapse" />}
        {currentSceneKey === 'win' && <Scene4Win key="win" />}
        {currentSceneKey === 'payoff' && <Scene5Payoff key="payoff" />}
      </AnimatePresence>

      {/* Subtle grain overlay for premium feel */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}

export function DiamondMark({ size = '100%' }: { size?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}replace5/logo_mark_hires.svg`}
      alt=""
      style={{ width: size, height: size, display: 'block' }}
    />
  );
}
