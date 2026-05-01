import { motion } from 'framer-motion';
import { TOOLS } from '../Template';

const STATS = [
  {
    num: '5',
    en: 'subscriptions',
    ar: 'اشتراكات',
    color: '#B8A0C8',
    pos: { left: '12%', top: '32%' },
  },
  {
    num: '12',
    suffix: 'hrs/wk',
    en: 'lost to context-switching',
    ar: 'ساعة/أسبوع تضيع في التنقل',
    color: '#C8A880',
    pos: { right: '10%', top: '28%' },
  },
  {
    num: '0',
    en: 'single source of truth',
    ar: 'مصدر موحّد للحقيقة',
    color: '#C0A0B8',
    pos: { left: '50%', top: '64%', translateX: '-50%' },
  },
];

function StatCard({
  stat,
  delay,
}: {
  stat: typeof STATS[number];
  delay: number;
}) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: stat.pos.left,
        right: stat.pos.right,
        top: stat.pos.top,
        transform: stat.pos.translateX
          ? `translateX(${stat.pos.translateX})`
          : undefined,
        width: '26vw',
      }}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div
        className="rounded-2xl px-6 py-5 backdrop-blur-md"
        style={{
          background: `linear-gradient(135deg, ${stat.color}28, ${stat.color}08)`,
          border: `1px solid ${stat.color}55`,
          boxShadow: `0 24px 60px -20px ${stat.color}55`,
        }}
      >
        <div className="flex items-baseline gap-2">
          <motion.div
            className="font-black leading-none"
            style={{
              fontSize: '5.5vw',
              color: stat.color,
              fontFamily: "'Fraunces', serif",
              letterSpacing: '-0.04em',
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 220,
              damping: 18,
              delay: delay + 0.1,
            }}
          >
            {stat.num}
          </motion.div>
          {stat.suffix && (
            <div
              className="text-white/80 font-semibold"
              style={{ fontSize: '1.5vw' }}
            >
              {stat.suffix}
            </div>
          )}
        </div>
        <div
          className="text-white/85 mt-1 font-medium"
          style={{ fontSize: '1.1vw' }}
        >
          {stat.en}
        </div>
        <div
          className="mt-1 opacity-75"
          dir="rtl"
          style={{
            color: '#e8dff0',
            fontSize: '1vw',
            fontFamily: "'IBM Plex Sans Arabic', system-ui",
          }}
        >
          {stat.ar}
        </div>
      </div>
    </motion.div>
  );
}

export function Scene2Problem() {
  return (
    <motion.div
      className="absolute inset-0 z-10"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      {/* Faint receding tools in background */}
      {TOOLS.map((t, i) => {
        const angle = (i / TOOLS.length) * Math.PI * 2;
        const r = 32;
        return (
          <motion.div
            key={t.key}
            className="absolute left-1/2 top-1/2 rounded-2xl"
            style={{
              width: '12vw',
              height: '7vh',
              marginLeft: '-6vw',
              marginTop: '-3.5vh',
              background: `linear-gradient(135deg, ${t.color}18, transparent)`,
              border: `1px solid ${t.color}30`,
            }}
            initial={{
              x: `${Math.cos(angle) * r}vw`,
              y: `${Math.sin(angle) * r * 0.55}vh`,
              opacity: 0.4,
              rotate: i * 4 - 8,
            }}
            animate={{
              x: `${Math.cos(angle) * (r + 3)}vw`,
              y: `${Math.sin(angle) * (r + 3) * 0.55}vh`,
              opacity: [0.4, 0.25, 0.4],
              rotate: [i * 4 - 8, i * 4 - 4, i * 4 - 8],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}

      <motion.div
        className="absolute top-[8vh] left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="text-white/60 uppercase tracking-[0.4em] text-[0.85vw]"
        >
          The cost of fragmentation
        </div>
        <div
          className="mt-2 text-[2.4vw] text-white font-light"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Every rep pays the <span style={{ color: '#C8A880' }}>fragmentation tax.</span>
        </div>
        <div
          className="mt-1 text-[1.1vw] opacity-75"
          dir="rtl"
          style={{
            color: '#d8cce0',
            fontFamily: "'IBM Plex Sans Arabic', system-ui",
          }}
        >
          كل مندوب يدفع ضريبة التشتّت.
        </div>
      </motion.div>

      {STATS.map((s, i) => (
        <StatCard key={i} stat={s} delay={0.4 + i * 0.35} />
      ))}

      {/* slow ambient drift line */}
      <motion.div
        className="absolute bottom-[8vh] left-[8vw] h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(184,160,200,0.5), transparent)',
        }}
        initial={{ width: 0 }}
        animate={{ width: '84vw' }}
        transition={{ duration: 5, ease: 'easeOut', delay: 0.8 }}
      />
    </motion.div>
  );
}
