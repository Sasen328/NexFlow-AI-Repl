import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { SceneSignIn } from './scenes/SceneSignIn';
import { SceneBriefing } from './scenes/SceneBriefing';
import { SceneContact } from './scenes/SceneContact';
import { SceneCall } from './scenes/SceneCall';
import { ScenePipeline } from './scenes/ScenePipeline';
import { SceneAssistant } from './scenes/SceneAssistant';
import { ScenePayoff } from './scenes/ScenePayoff';

export const SCENE_DURATIONS = {
  signin: 11000,
  briefing: 13000,
  contact: 13000,
  call: 14000,
  pipeline: 12000,
  assistant: 12000,
  payoff: 8000,
};

const SCENES: Record<string, React.ComponentType> = {
  signin: SceneSignIn,
  briefing: SceneBriefing,
  contact: SceneContact,
  call: SceneCall,
  pipeline: ScenePipeline,
  assistant: SceneAssistant,
  payoff: ScenePayoff,
};

interface VideoTemplateProps {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (sceneKey: string) => void;
}

const SCENE_ORDER = Object.keys(SCENE_DURATIONS) as (keyof typeof SCENE_DURATIONS)[];

// Per-scene cursor target positions (vw / vh) — drives the persistent cursor anchor.
const CURSOR_PATH: Record<string, { x: string; y: string }> = {
  signin: { x: '50vw', y: '52vh' },
  briefing: { x: '38vw', y: '46vh' },
  contact: { x: '34vw', y: '40vh' },
  call: { x: '50vw', y: '56vh' },
  pipeline: { x: '62vw', y: '52vh' },
  assistant: { x: '88vw', y: '86vh' },
  payoff: { x: '50vw', y: '50vh' },
};

function injectFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('tutorial-fonts')) return;
  const link = document.createElement('link');
  link.id = 'tutorial-fonts';
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}

function ChameleonCursor() {
  return (
    <svg viewBox="0 0 40 48" width="38" height="46" style={{ filter: 'drop-shadow(0 4px 14px rgba(184,160,200,0.85))' }}>
      <defs>
        <linearGradient id="cur-g" x1="0" y1="0" x2="40" y2="48">
          <stop offset="0%" stopColor="#FAF5FF" />
          <stop offset="55%" stopColor="#D4BFE4" />
          <stop offset="100%" stopColor="#B8A0C8" />
        </linearGradient>
      </defs>
      <path
        d="M4 3 L4 38 L13 30 L18 44 L24 41.5 L19 28 L31 27 Z"
        fill="url(#cur-g)"
        stroke="#1F1A24"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoMark({ size = 64 }: { size?: number }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}tutorial/logo_mark.svg`}
      alt=""
      width={size}
      height={size}
      style={{ display: 'block' }}
    />
  );
}

export { ChameleonCursor, LogoMark };

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
}: VideoTemplateProps = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    injectFonts();
  }, []);

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const sceneIndex = SCENE_ORDER.indexOf(currentSceneKey as keyof typeof SCENE_DURATIONS);
  const SceneComponent = SCENES[currentSceneKey as string] ?? SceneSignIn;
  const cursorPos = CURSOR_PATH[currentSceneKey as string] ?? CURSOR_PATH.signin;

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 20% 10%, #2A2230 0%, #1F1A24 45%, #18141C 100%)',
        fontFamily: "'Inter', 'IBM Plex Sans Arabic', system-ui, sans-serif",
      }}
    >
      {/* Persistent ambient color blobs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '60vw',
          height: '60vw',
          left: '-15vw',
          top: '-20vh',
          background: 'radial-gradient(circle, rgba(184,160,200,0.45), transparent 65%)',
          filter: 'blur(60px)',
        }}
        animate={{ x: ['0%', '12%', '0%'], y: ['0%', '8%', '0%'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '50vw',
          height: '50vw',
          right: '-15vw',
          bottom: '-20vh',
          background: 'radial-gradient(circle, rgba(136,184,176,0.40), transparent 65%)',
          filter: 'blur(70px)',
        }}
        animate={{ x: ['0%', '-10%', '0%'], y: ['0%', '-6%', '0%'] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '38vw',
          height: '38vw',
          left: '40vw',
          top: '30vh',
          background: 'radial-gradient(circle, rgba(200,168,128,0.22), transparent 65%)',
          filter: 'blur(80px)',
        }}
        animate={{ x: ['0%', '-8%', '6%', '0%'], y: ['0%', '6%', '-4%', '0%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Persistent corner mark (always visible, except hidden on payoff hero) */}
      <motion.div
        className="absolute z-30 flex items-center gap-3"
        style={{ top: '4vh', left: '4vw' }}
        animate={{
          opacity: currentSceneKey === 'payoff' ? 0 : 1,
          y: currentSceneKey === 'payoff' ? -10 : 0,
        }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        >
          <LogoMark size={42} />
        </motion.div>
        <div className="flex flex-col leading-tight">
          <span
            className="text-white/95 text-[15px] font-bold tracking-wide"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            NexFlow
          </span>
          <span className="text-white/40 text-[10px] uppercase tracking-[0.25em]">Tour · 90s</span>
        </div>
      </motion.div>

      {/* Persistent scene-counter dots */}
      <div
        className="absolute z-30 flex gap-2"
        style={{ top: '5vh', right: '4vw' }}
      >
        {SCENE_ORDER.map((k, i) => (
          <motion.div
            key={k}
            className="rounded-full"
            style={{
              width: i === sceneIndex ? 22 : 7,
              height: 7,
              background:
                i === sceneIndex
                  ? 'linear-gradient(90deg, #B8A0C8, #88B8B0)'
                  : 'rgba(255,255,255,0.22)',
            }}
            animate={{ width: i === sceneIndex ? 22 : 7 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>

      {/* Scene content */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentSceneKey}
          className="absolute inset-0 z-10"
          initial={{ opacity: 0.001 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.999 }}
          transition={{ duration: 0.12 }}
        >
          <SceneComponent />
        </motion.div>
      </AnimatePresence>

      {/* Persistent animated cursor — lives outside AnimatePresence, travels between beats */}
      <motion.div
        className="absolute z-50 pointer-events-none"
        initial={{ left: '50vw', top: '50vh' }}
        animate={{ left: cursorPos.x, top: cursorPos.y }}
        transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
        style={{ translateX: '-6px', translateY: '-4px' }}
      >
        <motion.div
          animate={{ y: [0, -4, 0, 3, 0], x: [0, 2, -2, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChameleonCursor />
        </motion.div>
      </motion.div>

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(15,12,20,0.55) 100%)',
        }}
      />
    </div>
  );
}
