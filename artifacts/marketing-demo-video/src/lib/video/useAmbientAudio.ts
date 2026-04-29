import { useCallback, useEffect, useRef, useState } from 'react';

const SAMPLE_RATE = 22050;
const DURATION_S = 30;

function buildAmbientWavBlob(): Blob {
  const length = SAMPLE_RATE * DURATION_S;
  const data = new Float32Array(length);

  const root = 220;
  const partials = [
    { freq: root, amp: 0.32 },
    { freq: root * 1.2, amp: 0.22 },
    { freq: root * 1.5, amp: 0.18 },
    { freq: root * 1.78, amp: 0.14 },
    { freq: root * 2, amp: 0.12 },
    { freq: root * 2.4, amp: 0.08 },
    { freq: root * 3, amp: 0.06 },
  ];

  const lfo1 = 0.07;
  const lfo2 = 0.11;

  let peak = 0;
  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    const env = 0.5 + 0.25 * Math.sin(2 * Math.PI * lfo1 * t) + 0.18 * Math.sin(2 * Math.PI * lfo2 * t + 1.3);
    let s = 0;
    for (const p of partials) {
      const detune = 1 + 0.0015 * Math.sin(2 * Math.PI * 0.13 * t + p.freq);
      s += p.amp * Math.sin(2 * Math.PI * p.freq * detune * t);
    }
    s *= env * 0.55;
    const fadeIn = Math.min(1, t / 1.5);
    const fadeOut = Math.min(1, (DURATION_S - t) / 1.5);
    s *= Math.min(fadeIn, fadeOut);
    data[i] = s;
    const a = Math.abs(s);
    if (a > peak) peak = a;
  }
  if (peak > 0) {
    const norm = 0.85 / peak;
    for (let i = 0; i < length; i++) data[i] *= norm;
  }

  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + length * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, length * 2, true);

  let offset = headerSize;
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, sample * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

let cachedUrl: string | null = null;
function getAudioUrl(): string {
  if (cachedUrl) return cachedUrl;
  const blob = buildAmbientWavBlob();
  cachedUrl = URL.createObjectURL(blob);
  return cachedUrl;
}

export interface AmbientAudioState {
  enabled: boolean;
  muted: boolean;
  enable: () => Promise<void>;
  toggleMute: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  audioUrl: string;
}

export function useAmbientAudio(): AmbientAudioState {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [muted, setMuted] = useState(true);
  const [audioUrl] = useState(() => getAudioUrl());
  const autoUnmuteAttachedRef = useRef(false);

  // Try autoplay (muted) on mount — most browsers allow this in iframes.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.muted = true;
    el.volume = 0.45;
    el.loop = true;
    const tryPlay = async () => {
      try {
        await el.play();
        setEnabled(true);
      } catch {
        // Will start on first user interaction
      }
    };
    void tryPlay();
  }, []);

  // Auto-unmute on the very first user gesture anywhere in the document.
  useEffect(() => {
    if (autoUnmuteAttachedRef.current) return;
    autoUnmuteAttachedRef.current = true;

    const onFirstGesture = async () => {
      const el = audioRef.current;
      if (!el) return;
      try {
        if (el.paused) await el.play();
        el.muted = false;
        setEnabled(true);
        setMuted(false);
      } catch {
        // Ignore
      }
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
      window.removeEventListener('touchstart', onFirstGesture);
    };

    window.addEventListener('pointerdown', onFirstGesture, { once: false });
    window.addEventListener('keydown', onFirstGesture, { once: false });
    window.addEventListener('touchstart', onFirstGesture, { once: false });

    return () => {
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
      window.removeEventListener('touchstart', onFirstGesture);
    };
  }, []);

  const enable = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;
    try {
      if (el.paused) await el.play();
      el.muted = false;
      setEnabled(true);
      setMuted(false);
    } catch {
      // Ignore
    }
  }, []);

  const toggleMute = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    const next = !el.muted;
    el.muted = next;
    setMuted(next);
    if (!next && el.paused) {
      void el.play().catch(() => undefined);
    }
  }, []);

  return { enabled, muted, enable, toggleMute, audioRef, audioUrl };
}
