import { AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import {
  SceneHook,
  ScenePain1,
  SceneSol1,
  ScenePain2,
  SceneSol2,
  ScenePain3,
  SceneSol3,
  ScenePain4,
  SceneSol4,
  SceneMontage,
  SceneStats,
  SceneClose,
} from './video_scenes/ScenesInvestor';
import { useEffect } from 'react';

export const SCENE_DURATIONS = {
  sceneHook: 5000,
  scenePain1: 4000,
  sceneSol1: 7000,
  scenePain2: 4000,
  sceneSol2: 9000,
  scenePain3: 4000,
  sceneSol3: 8000,
  scenePain4: 4000,
  sceneSol4: 8000,
  sceneMontage: 18000,
  sceneStats: 8000,
  sceneClose: 11000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  sceneHook: SceneHook,
  scenePain1: ScenePain1,
  sceneSol1: SceneSol1,
  scenePain2: ScenePain2,
  sceneSol2: SceneSol2,
  scenePain3: ScenePain3,
  sceneSol3: SceneSol3,
  scenePain4: ScenePain4,
  sceneSol4: SceneSol4,
  sceneMontage: SceneMontage,
  sceneStats: SceneStats,
  sceneClose: SceneClose,
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

  const baseSceneKey = currentSceneKey.replace(
    /_r[12]$/,
    '',
  ) as keyof typeof SCENE_DURATIONS;
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F8F5F0]">
      <div className="absolute inset-0 mesh-bg z-0" />
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
