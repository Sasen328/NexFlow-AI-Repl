import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { Scene1Signal } from './scenes/Scene1Signal';
import { Scene2Score } from './scenes/Scene2Score';
import { Scene3Briefing } from './scenes/Scene3Briefing';
import { Scene4Call } from './scenes/Scene4Call';
import { Scene5Pipeline } from './scenes/Scene5Pipeline';
import { Scene6Payoff } from './scenes/Scene6Payoff';
import { PersistentContactCard } from './scenes/PersistentContactCard';

export const SCENE_DURATIONS: Record<string, number> = {
  signal: 8000,
  score: 8000,
  briefing: 10000,
  call: 12000,
  pipeline: 12000,
  payoff: 10000,
};

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap';

interface VideoTemplateProps {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (sceneKey: string) => void;
}

const palette = ['#B8A0C8', '#88B8B0', '#90B8B8', '#B8B880', '#88B8B0', '#C8A880'];

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
}: VideoTemplateProps = {}) {
  const { currentScene, currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  useEffect(() => {
    if (document.querySelector('link[data-narrative-fonts]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    link.setAttribute('data-narrative-fonts', 'true');
    document.head.appendChild(link);
  }, []);

  const tint = palette[currentScene] ?? '#B8A0C8';

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 40%, #2A2230 0%, #1F1A24 55%, #15111A 100%)',
        fontFamily: '"IBM Plex Sans", "IBM Plex Sans Arabic", system-ui, sans-serif',
        color: 'hsl(285,17%,96%)',
      }}
    >
      {/* Persistent chameleon mesh blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '70vw',
            height: '70vw',
            top: '-25vw',
            left: '-15vw',
            background: 'radial-gradient(circle, rgba(184,160,200,0.35), transparent 65%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: ['0%', '8%', '0%'],
            y: ['0%', '6%', '0%'],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '60vw',
            height: '60vw',
            bottom: '-20vw',
            right: '-15vw',
            background: 'radial-gradient(circle, rgba(136,184,176,0.30), transparent 65%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: ['0%', '-7%', '0%'],
            y: ['0%', '-5%', '0%'],
          }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '40vw',
            height: '40vw',
            top: '20vh',
            right: '20vw',
            background:
              'radial-gradient(circle, rgba(200,168,128,0.22), transparent 65%)',
            filter: 'blur(70px)',
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.12, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Subtle noise / grain via CSS */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.06]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }}
      />

      {/* Persistent diamond mark — corner brand anchor that lives across all scenes */}
      <motion.div
        className="absolute z-40 pointer-events-none"
        style={{ top: '4vh', left: '4vh' }}
        animate={{
          opacity: currentSceneKey === 'payoff' ? 0 : 0.85,
          scale: currentSceneKey === 'signal' ? 1.1 : 1,
        }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <DiamondMark size={48} />
      </motion.div>

      {/* Persistent scene-tint chameleon underline at top */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[3px] z-30 pointer-events-none"
        animate={{ background: `linear-gradient(90deg, transparent, ${tint}, transparent)` }}
        transition={{ duration: 1.2 }}
      />

      {/* Persistent contact card — travels through scenes 2..6 */}
      <PersistentContactCard sceneKey={currentSceneKey} />

      <AnimatePresence initial={false} mode="sync">
        {currentSceneKey === 'signal' && <Scene1Signal key="signal" />}
        {currentSceneKey === 'score' && <Scene2Score key="score" />}
        {currentSceneKey === 'briefing' && <Scene3Briefing key="briefing" />}
        {currentSceneKey === 'call' && <Scene4Call key="call" />}
        {currentSceneKey === 'pipeline' && <Scene5Pipeline key="pipeline" />}
        {currentSceneKey === 'payoff' && <Scene6Payoff key="payoff" />}
      </AnimatePresence>
    </div>
  );
}

export function DiamondMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" fill="none">
      <defs>
        <linearGradient id="dmg1" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B8A0C8" />
          <stop offset="35%" stopColor="#88B8B0" />
          <stop offset="70%" stopColor="#C8A880" />
          <stop offset="100%" stopColor="#C0A0B8" />
        </linearGradient>
        <linearGradient id="dmg2" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B8A0C8" />
          <stop offset="50%" stopColor="#88B8B0" />
          <stop offset="100%" stopColor="#C8A880" />
        </linearGradient>
        <linearGradient id="dmg3" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C0A0B8" />
          <stop offset="50%" stopColor="#88B8B0" />
          <stop offset="100%" stopColor="#C8A880" />
        </linearGradient>
        <linearGradient id="dmg4" x1="200" y1="200" x2="824" y2="824" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B8A0C8" />
          <stop offset="100%" stopColor="#88B8B0" />
        </linearGradient>
        <linearGradient id="dmgdot" x1="450" y1="450" x2="574" y2="574" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B8A0C8" />
          <stop offset="100%" stopColor="#88B8B0" />
        </linearGradient>
      </defs>
      <rect x="82" y="82" width="860" height="860" rx="72" ry="72" transform="rotate(45 512 512)" fill="none" stroke="url(#dmg1)" strokeWidth="22" />
      <rect x="196" y="196" width="632" height="632" rx="54" ry="54" transform="rotate(45 512 512)" fill="none" stroke="url(#dmg2)" strokeWidth="20" />
      <rect x="304" y="304" width="416" height="416" rx="38" ry="38" transform="rotate(45 512 512)" fill="none" stroke="url(#dmg3)" strokeWidth="18" />
      <rect x="390" y="390" width="244" height="244" rx="22" ry="22" transform="rotate(45 512 512)" fill="none" stroke="url(#dmg4)" strokeWidth="16" />
      <circle cx="512" cy="512" r="42" fill="url(#dmgdot)" />
    </svg>
  );
}
