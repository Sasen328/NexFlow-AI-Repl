import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Synthesises a soft ambient pad chord with slow LFOs.
 * Returns a stable enable() that creates the AudioContext (must be triggered
 * by a user gesture due to browser autoplay restrictions) and a mute toggle.
 */
export function useAmbientAudio() {
  const [enabled, setEnabled] = useState(false);
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sourcesRef = useRef<{ osc: OscillatorNode; lfo: OscillatorNode }[]>([]);

  const buildGraph = useCallback(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx: AudioContext = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = 0.08;
    master.connect(ctx.destination);

    const makeVoice = (freq: number, lfoFreq: number, lfoDepth: number) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0.5;

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = lfoFreq;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = lfoDepth;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.connect(g);
      g.connect(master);
      osc.start();
      lfo.start();
      return { osc, lfo };
    };

    // A minor 7th-ish chord for warmth
    const voices = [
      makeVoice(220, 0.07, 4), // A3
      makeVoice(329.63, 0.11, 5), // E4
      makeVoice(523.25, 0.09, 3), // C5
      makeVoice(110, 0.05, 2), // A2 sub
    ];

    return { ctx, master, voices };
  }, []);

  const enable = useCallback(async () => {
    if (ctxRef.current) {
      // Already created — just resume + unmute
      try {
        await ctxRef.current.resume();
      } catch {}
      if (masterGainRef.current) masterGainRef.current.gain.value = 0.08;
      setMuted(false);
      setEnabled(true);
      return;
    }
    const built = buildGraph();
    if (!built) return;
    ctxRef.current = built.ctx;
    masterGainRef.current = built.master;
    sourcesRef.current = built.voices;
    try {
      await built.ctx.resume();
    } catch {}
    setEnabled(true);
    setMuted(false);
  }, [buildGraph]);

  const toggleMute = useCallback(() => {
    if (!ctxRef.current || !masterGainRef.current) {
      void enable();
      return;
    }
    setMuted((m) => {
      const next = !m;
      if (masterGainRef.current) {
        masterGainRef.current.gain.value = next ? 0 : 0.08;
      }
      if (!next) {
        ctxRef.current?.resume().catch(() => {});
      }
      return next;
    });
  }, [enable]);

  useEffect(() => {
    return () => {
      sourcesRef.current.forEach((v) => {
        try {
          v.osc.stop();
          v.lfo.stop();
        } catch {}
      });
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return { enabled, muted, enable, toggleMute };
}
