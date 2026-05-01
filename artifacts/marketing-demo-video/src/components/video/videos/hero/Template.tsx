import { AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { useEffect } from 'react';
import { Scene1Open } from './scenes/Scene1Open';
import { Scene2Reveal } from './scenes/Scene2Reveal';
import { Scene3Position } from './scenes/Scene3Position';
import { Scene4Montage } from './scenes/Scene4Montage';
import { Scene5Close } from './scenes/Scene5Close';

export const SCENE_DURATIONS = {
  open: 5000,
  reveal: 5500,
  position: 6500,
  montage: 8500,
  close: 5000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  open: Scene1Open,
  reveal: Scene2Reveal,
  position: Scene3Position,
  montage: Scene4Montage,
  close: Scene5Close,
};

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap';

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

  useEffect(() => {
    const id = 'hero-google-fonts';
    if (typeof document === 'undefined') return;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = FONTS_HREF;
    document.head.appendChild(link);
  }, []);

  const baseKey = currentSceneKey.replace(/_r[12]$/, '');
  const SceneComponent = SCENE_COMPONENTS[baseKey];

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: '#1F1A24' }}>
      <AnimatePresence initial={false} mode="wait">
        {SceneComponent &&
          (() => {
            const C = SceneComponent;
            return <C key={currentSceneKey} />;
          })()}
      </AnimatePresence>
    </div>
  );
}
