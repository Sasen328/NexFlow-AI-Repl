import { useCallback, useEffect, useRef } from 'react';

const BASE = import.meta.env.BASE_URL ?? '/';

/**
 * Plays a pre-generated TTS MP3 narration file whenever the active scene changes.
 * Files are expected at: <BASE_URL><slug>/<sceneKey>.mp3
 *
 * The hook respects an external `muted` flag so VideoWithControls can silence it
 * alongside the ambient audio. Autoplay is triggered on any user gesture; before
 * that, narration is silently queued and plays on the next scene change after the
 * gesture occurs.
 */
export function useNarration(
  slug: string | undefined,
  sceneKey: string,
  muted: boolean,
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);
  const pendingSceneRef = useRef<string | null>(null);

  // On mount — set up a one-time gesture listener to unlock audio context
  useEffect(() => {
    const unlock = () => {
      unlockedRef.current = true;
      // Play anything queued before first gesture
      if (pendingSceneRef.current !== null && slug) {
        void play(slug, pendingSceneRef.current, muted);
        pendingSceneRef.current = null;
      }
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = useCallback(
    async (s: string, key: string, isMuted: boolean) => {
      // Stop anything currently playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      const src = `${BASE}${s}/${key}.mp3`;
      const el = new Audio(src);
      el.muted = isMuted;
      el.volume = 0.82;
      audioRef.current = el;
      try {
        await el.play();
      } catch {
        // Autoplay blocked or file not found — silently ignore
      }
    },
    [],
  );

  // Fire on scene key change
  useEffect(() => {
    if (!slug) return;
    if (!unlockedRef.current) {
      // Store for later — will play after first gesture
      pendingSceneRef.current = sceneKey;
      return;
    }
    void play(slug, sceneKey, muted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, sceneKey]);

  // Sync mute state to active audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, [muted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
}
