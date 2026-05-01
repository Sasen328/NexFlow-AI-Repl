import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface VideoMeta {
  slug: string;
  title: string;
  titleAr: string;
  duration: string;
  blurb: string;
  blurbAr: string;
  accent: string;
  href: string;
}

const VIDEOS: VideoMeta[] = [
  {
    slug: 'hero',
    title: 'Meet NexFlow',
    titleAr: 'تعرّف على نكسفلو',
    duration: '~30s',
    blurb: 'The brand-defining hero sizzle. Cinematic intro to the chameleon and the platform.',
    blurbAr: 'الفيديو الافتتاحي للعلامة. مقدمة سينمائية للحرباء والمنصة.',
    accent: '#B8A0C8',
    href: 'hero',
  },
  {
    slug: 'layla',
    title: 'Layla, the AI Voice Agent',
    titleAr: 'ليلى، وكيلة الذكاء الصوتي',
    duration: '~45s',
    blurb: 'Watch Layla hold a real outbound call in Khaleeji Arabic and qualify a deal in real time.',
    blurbAr: 'شاهد ليلى تجري مكالمة بالخليجي وتؤهّل صفقة في الوقت الحقيقي.',
    accent: '#88B8B0',
    href: 'layla',
  },
  {
    slug: 'replace5',
    title: 'Replace 5 Tools With One',
    titleAr: 'خمس أدوات. منصة واحدة.',
    duration: '~40s',
    blurb: 'Five disconnected tools collapse into one chameleon. Stack consolidation, dramatized.',
    blurbAr: 'خمس أدوات مبعثرة تنصهر في حرباء واحدة. توحيد لمنصة العمل.',
    accent: '#C8A880',
    href: 'replace5',
  },
  {
    slug: 'mobile',
    title: 'NexFlow Mobile',
    titleAr: 'نكسفلو على الموبايل',
    duration: '~30s',
    blurb: 'Your daily briefing, voice agent, and signals — in your pocket across the GCC.',
    blurbAr: 'إحاطتك اليومية ووكيل الصوت والإشارات — في جيبك عبر الخليج.',
    accent: '#C0A0B8',
    href: 'mobile',
  },
  {
    slug: 'narrative',
    title: 'From Signal to Closed Deal',
    titleAr: 'من إشارة إلى صفقة',
    duration: '~60s',
    blurb: 'A six-beat story: a tiny intent signal becomes a closed-won deal in Riyadh.',
    blurbAr: 'قصة من ست لقطات: إشارة صغيرة تتحوّل إلى صفقة مُغلقة في الرياض.',
    accent: '#90B8B8',
    href: 'narrative',
  },
  {
    slug: 'tutorial',
    title: 'Get Started in 90 Seconds',
    titleAr: 'ابدأ في ٩٠ ثانية',
    duration: '~90s',
    blurb: 'A guided tour of the product. Sign in, brief, call, pipeline, assistant, win.',
    blurbAr: 'جولة مرشدة عبر المنتج. تسجيل، إحاطة، مكالمة، خط صفقات، مساعد، فوز.',
    accent: '#B8B880',
    href: 'tutorial',
  },
  {
    slug: 'investor',
    title: 'Investor Pitch (long-form)',
    titleAr: 'عرض المستثمرين',
    duration: '~90s',
    blurb: 'The original long-form investor narrative — pain points, solutions, traction.',
    blurbAr: 'السرد الأصلي للمستثمرين — تحديات، حلول، نمو.',
    accent: '#9C8AB8',
    href: 'investor',
  },
];

const PALETTE_BLOBS = [
  { color: '#B8A0C8', x: '8%', y: '12%', size: 480 },
  { color: '#88B8B0', x: '78%', y: '18%', size: 420 },
  { color: '#C8A880', x: '70%', y: '70%', size: 520 },
  { color: '#C0A0B8', x: '12%', y: '78%', size: 440 },
];

export default function Gallery() {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '/');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#FAF7F4] text-[#231A2E]">
      {/* Persistent ambient palette blobs */}
      <div className="absolute inset-0 pointer-events-none">
        {PALETTE_BLOBS.map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: b.x,
              top: b.y,
              width: b.size,
              height: b.size,
              background: `radial-gradient(circle, ${b.color}55, transparent 70%)`,
              filter: 'blur(60px)',
              opacity: 0.55,
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -25, 15, 0],
              scale: [1, 1.08, 0.96, 1],
            }}
            transition={{
              duration: 14 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>\")",
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1320px] mx-auto px-8 sm:px-14 py-16 sm:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-4 mb-3"
        >
          <img
            src={`${base}logo_mark_hires.svg`}
            alt="NexFlow"
            className="w-12 h-12"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="text-[11px] uppercase tracking-[0.32em] text-[#231A2E]/55">
            NexFlow Video Library  ·  مكتبة فيديوهات نكسفلو
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-black tracking-tight leading-[0.95] text-[clamp(48px,7.6vw,116px)] max-w-[14ch]"
          style={{ fontFamily: '"Fraunces", "Cormorant Garamond", serif' }}
        >
          Six stories.
          <br />
          <span style={{ color: '#9C7BB6' }}>One platform.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-6 max-w-2xl text-[18px] leading-relaxed text-[#231A2E]/72"
        >
          Short marketing & product films for NexFlow — the AI-native revenue
          platform built for teams across the Gulf. Every clip plays in-browser,
          loops, and exports to MP4 with one click.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#231A2E]/55"
          dir="rtl"
          style={{ fontFamily: '"IBM Plex Sans Arabic", "Tajawal", "Noto Sans Arabic", system-ui, sans-serif' }}
        >
          أفلام تسويقية ومنتج قصيرة لنكسفلو — منصة الإيرادات الذكية المبنية لفِرَق الخليج.
        </motion.div>

        {/* Card grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {VIDEOS.map((v, idx) => (
            <motion.a
              key={v.slug}
              href={`${base}${v.href}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group relative block rounded-[22px] overflow-hidden border border-[#231A2E]/10 bg-white/65 backdrop-blur-xl hover:border-[#231A2E]/25 transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_-20px_rgba(45,30,60,0.25)]"
              style={{ minHeight: 320 }}
            >
              {/* Color wash header */}
              <div className="relative h-44 overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${v.accent}, ${v.accent}88 50%, transparent 110%)`,
                  }}
                />
                <motion.div
                  className="absolute -right-8 -top-8 w-48 h-48 rounded-full"
                  style={{
                    background: `radial-gradient(circle, white 0%, ${v.accent}00 70%)`,
                    opacity: 0.35,
                    mixBlendMode: 'overlay',
                  }}
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.35, 0.55, 0.35],
                  }}
                  transition={{
                    duration: 4 + idx * 0.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <div className="absolute bottom-3 left-5 text-[11px] uppercase tracking-[0.28em] text-white/85 font-semibold">
                  {v.duration}
                </div>
                <div className="absolute top-3 right-5 text-[10px] uppercase tracking-[0.26em] text-white/70">
                  {String(idx + 1).padStart(2, '0')}
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div
                  className="text-[22px] font-black leading-tight"
                  style={{ fontFamily: '"Fraunces", "Cormorant Garamond", serif' }}
                >
                  {v.title}
                </div>
                <div
                  className="mt-1 text-[14px] text-[#231A2E]/55"
                  dir="rtl"
                  style={{ fontFamily: '"IBM Plex Sans Arabic", "Tajawal", system-ui, sans-serif' }}
                >
                  {v.titleAr}
                </div>
                <p className="mt-4 text-[13.5px] leading-relaxed text-[#231A2E]/68">
                  {v.blurb}
                </p>

                <div className="mt-5 flex items-center gap-2">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ background: v.accent }}
                  />
                  <span className="text-[11px] uppercase tracking-[0.28em] text-[#231A2E]/50 font-semibold group-hover:text-[#231A2E]/80 transition-colors">
                    Open & record →
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-16 pt-8 border-t border-[#231A2E]/10 flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#231A2E]/50"
        >
          <div>
            Each video records to MP4 from this tab.  ·  Built with React,
            Framer Motion, and a chameleon.
          </div>
          <div className="font-mono tabular-nums">
            {new Date(now).toUTCString().slice(17, 25)} UTC
          </div>
        </motion.div>
      </div>
    </div>
  );
}
