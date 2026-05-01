import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const PALETTE = {
  lavender: '#B8A0C8',
  sage: '#88B8B0',
  gold: '#C8A880',
  rose: '#C0A0B8',
  teal: '#90B8B8',
  olive: '#B8B880',
};

function VignettePipeline() {
  const cards = [
    { name: 'Aramco Digital', amount: 'SAR 1.4M', stage: 'Negotiation', color: PALETTE.lavender },
    { name: 'Emirates NBD', amount: 'AED 2.8M', stage: 'Closed Won', color: PALETTE.sage },
    { name: 'STC Pay', amount: 'SAR 920K', stage: 'Proposal', color: PALETTE.gold },
    { name: 'Mubadala', amount: 'AED 3.1M', stage: 'Discovery', color: PALETTE.rose },
  ];
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 1400,
      }}
    >
      {cards.map((c, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: '20vw',
            padding: '1.4vw 1.6vw',
            borderRadius: '1.1vw',
            background: 'rgba(36,29,44,0.85)',
            border: `1px solid ${c.color}55`,
            boxShadow: `0 14px 50px rgba(0,0,0,0.45), 0 0 30px ${c.color}33`,
            color: '#F1ECF5',
            fontFamily: "'Inter', system-ui, sans-serif",
            backdropFilter: 'blur(8px)',
          }}
          initial={{ x: '60vw', y: (i - 1.5) * 60, rotate: 8, opacity: 0 }}
          animate={{ x: '-70vw', y: (i - 1.5) * 60, rotate: -4, opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 2.4,
            delay: i * 0.18,
            ease: [0.5, 0, 0.5, 1],
            times: [0, 0.18, 0.78, 1],
          }}
        >
          <div
            style={{
              fontSize: '0.7vw',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: c.color,
              fontWeight: 600,
            }}
          >
            {c.stage}
          </div>
          <div style={{ fontSize: '1.4vw', fontWeight: 700, marginTop: '0.4vh' }}>{c.name}</div>
          <div
            style={{
              fontSize: '1.1vw',
              fontWeight: 600,
              color: c.color,
              marginTop: '0.3vh',
            }}
          >
            {c.amount}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function VignetteSignal() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {[0, 0.3, 0.6, 0.9].map((d, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: '8vw',
            height: '8vw',
            borderRadius: '50%',
            border: `2px solid ${PALETTE.olive}`,
          }}
          initial={{ scale: 0.4, opacity: 0.9 }}
          animate={{ scale: [0.4, 4.5], opacity: [0.9, 0] }}
          transition={{ duration: 1.6, delay: d, ease: 'easeOut', repeat: 1 }}
        />
      ))}
      <motion.div
        style={{
          width: '6vw',
          height: '6vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${PALETTE.olive}, ${PALETTE.gold})`,
          boxShadow: `0 0 60px ${PALETTE.olive}, 0 0 120px ${PALETTE.gold}`,
        }}
        initial={{ scale: 0.7 }}
        animate={{ scale: [0.7, 1.15, 0.95] }}
        transition={{ duration: 2.4, ease: 'easeInOut' }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          color: '#F1ECF5',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: '0.85vw',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          opacity: 0.85,
        }}
      >
        Buying signal · Aramco
      </div>
    </div>
  );
}

function VignetteVoice() {
  const bars = Array.from({ length: 36 });
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          marginBottom: '2vh',
          padding: '0.6vh 1.2vw',
          borderRadius: 999,
          background: `linear-gradient(90deg, ${PALETTE.rose}, ${PALETTE.lavender})`,
          color: '#241D2C',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: '0.9vw',
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        Layla · Khaleeji voice agent
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4vw', height: '12vh' }}>
        {bars.map((_, i) => (
          <motion.div
            key={i}
            style={{
              width: '0.45vw',
              borderRadius: 999,
              background: `linear-gradient(180deg, ${PALETTE.lavender}, ${PALETTE.sage})`,
            }}
            initial={{ height: '10%' }}
            animate={{
              height: ['10%', `${30 + ((i * 17) % 65)}%`, `${20 + ((i * 31) % 70)}%`, '15%'],
            }}
            transition={{
              duration: 1.8,
              delay: i * 0.012,
              ease: 'easeInOut',
              repeat: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function VignetteEmail() {
  const arabicLines = [
    'السلام عليكم أستاذ فيصل،',
    'سعدنا بمتابعتنا اليوم.',
    'نرفق لكم العرض الفني...',
  ];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setShown(1), 200),
      setTimeout(() => setShown(2), 800),
      setTimeout(() => setShown(3), 1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '36vw',
          padding: '2vh 1.6vw',
          borderRadius: '1vw',
          background: 'rgba(36,29,44,0.9)',
          border: `1px solid ${PALETTE.teal}55`,
          boxShadow: `0 18px 60px rgba(0,0,0,0.5)`,
          fontFamily:
            "'IBM Plex Sans Arabic', 'Tajawal', 'Noto Sans Arabic', system-ui, sans-serif",
          color: '#F1ECF5',
          textAlign: 'right',
          direction: 'rtl',
        }}
      >
        <div
          style={{
            fontSize: '0.7vw',
            color: PALETTE.teal,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: '1vh',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Composing · بريد إلكتروني
        </div>
        {arabicLines.map((line, i) => (
          <motion.div
            key={i}
            style={{ fontSize: '1.3vw', lineHeight: 1.7, fontWeight: 500 }}
            initial={{ opacity: 0, y: 8 }}
            animate={shown > i ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}
            {shown === i + 1 && i === arabicLines.length - 1 && (
              <motion.span
                style={{
                  display: 'inline-block',
                  width: '0.6vw',
                  height: '1.4vw',
                  background: PALETTE.teal,
                  marginRight: '0.3vw',
                  verticalAlign: 'middle',
                }}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function VignetteChart() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '46vw', height: '32vh', position: 'relative' }}>
        <svg viewBox="0 0 600 240" width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <linearGradient id="hchart" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor={PALETTE.sage} />
              <stop offset="60%" stopColor={PALETTE.gold} />
              <stop offset="100%" stopColor={PALETTE.lavender} />
            </linearGradient>
            <linearGradient id="hchartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE.gold} stopOpacity="0.45" />
              <stop offset="100%" stopColor={PALETTE.gold} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 60, 120, 180].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="600"
              y2={y}
              stroke="rgba(232,225,239,0.08)"
              strokeWidth="1"
            />
          ))}
          <motion.path
            d="M 0 200 L 80 180 L 160 195 L 240 150 L 320 130 L 400 90 L 480 60 L 560 30 L 600 18 L 600 240 L 0 240 Z"
            fill="url(#hchartFill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />
          <motion.path
            d="M 0 200 L 80 180 L 160 195 L 240 150 L 320 130 L 400 90 L 480 60 L 560 30 L 600 18"
            fill="none"
            stroke="url(#hchart)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '-3vh',
            left: 0,
            color: '#F1ECF5',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '0.85vw',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            opacity: 0.85,
          }}
        >
          Q3 Forecast · +47%
        </div>
      </div>
    </div>
  );
}

const VIGNETTES = [
  { Comp: VignettePipeline, label: 'PIPELINE' },
  { Comp: VignetteSignal, label: 'SIGNAL' },
  { Comp: VignetteVoice, label: 'VOICE · LAYLA' },
  { Comp: VignetteEmail, label: 'EMAIL · ARABIC' },
  { Comp: VignetteChart, label: 'FORECAST' },
];

const VIG_DURATION = 1700; // ms each (5 * 1700 = 8500 ms; we hold ~8s)

export function Scene4Montage() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    for (let i = 1; i < VIGNETTES.length; i++) {
      timers.push(window.setTimeout(() => setIdx(i), i * VIG_DURATION));
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  const Active = VIGNETTES[idx].Comp;
  const label = VIGNETTES[idx].label;

  return (
    <motion.div
      key="montage"
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      style={{ background: '#1F1A24' }}
    >
      {/* ambient drifting palette */}
      <motion.div
        className="absolute"
        style={{
          inset: 0,
          background:
            'radial-gradient(40% 50% at 20% 30%, rgba(184,160,200,0.15), transparent 70%), radial-gradient(45% 55% at 80% 70%, rgba(200,168,128,0.12), transparent 70%)',
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, ease: 'easeInOut' }}
      />

      {/* Vignette content (key on idx for crossfade) */}
      <motion.div
        key={idx}
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <Active />
      </motion.div>

      {/* Beat label */}
      <motion.div
        key={`lbl-${idx}`}
        className="absolute"
        style={{
          top: '6vh',
          left: '6vw',
          color: 'rgba(232,225,239,0.7)',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: '0.8vw',
          letterSpacing: '0.45em',
          textTransform: 'uppercase',
        }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {label}
      </motion.div>

      {/* Beat counter rail */}
      <div
        className="absolute"
        style={{
          bottom: '5vh',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.8vw',
        }}
      >
        {VIGNETTES.map((_, i) => (
          <motion.div
            key={i}
            style={{
              width: '3vw',
              height: '2px',
              background:
                i === idx
                  ? 'linear-gradient(90deg, #B8A0C8, #88B8B0, #C8A880)'
                  : 'rgba(232,225,239,0.18)',
            }}
            animate={{ scaleY: i === idx ? [1, 2, 1.5] : 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </motion.div>
  );
}
