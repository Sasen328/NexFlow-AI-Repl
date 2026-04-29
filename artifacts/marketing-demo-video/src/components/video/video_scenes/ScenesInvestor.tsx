import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Mail,
  MessageCircle,
  FileSpreadsheet,
  Users,
  PhoneCall,
  Megaphone,
  Calendar,
  CreditCard,
  Languages,
  AlertTriangle,
  Sparkles,
  Send,
  ArrowRight,
  Check,
  TrendingUp,
  Globe,
  Zap,
} from 'lucide-react';
import { ScreenshotFrame, CalloutPin } from '../ScreenshotFrame';

const ease = [0.22, 1, 0.36, 1] as const;

/* ============================================================ */
/* Reusable building blocks                                     */
/* ============================================================ */

function PainBadge({ label, n }: { label: string; n?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-[0.22em] text-white"
      style={{
        background: 'linear-gradient(90deg, #C24A4A, #9C3838)',
        boxShadow: '0 8px 24px rgba(156,56,56,0.32)',
      }}
    >
      {n !== undefined && (
        <span className="bg-white/25 rounded-full w-6 h-6 inline-flex items-center justify-center text-[12px] font-black">
          {n}
        </span>
      )}
      {label}
    </motion.div>
  );
}

function SolBadge({ label, icon: Icon }: { label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-[0.22em] text-white"
      style={{
        background: 'linear-gradient(90deg, rgba(184,160,200,0.95), rgba(136,184,176,0.95))',
        boxShadow: '0 8px 24px rgba(184,160,200,0.4)',
      }}
    >
      <Icon className="w-4 h-4" />
      {label}
    </motion.div>
  );
}

function BigTitle({ children, scale = 1 }: { children: React.ReactNode; scale?: number }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease }}
      className="font-bold text-[#1a1530] max-w-[88vw] text-center mt-5 leading-[1.02]"
      style={{
        fontFamily: 'var(--font-display)',
        letterSpacing: '-0.018em',
        fontSize: `${4.6 * scale}vw`,
      }}
    >
      {children}
    </motion.h2>
  );
}

function SubTitle({ children, delay = 0.45 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease }}
      className="text-[1.45vw] text-[#5A4A6A] mt-4 max-w-[60vw] text-center font-medium"
    >
      {children}
    </motion.p>
  );
}

/* ============================================================ */
/* SCENE: HOOK                                                  */
/* ============================================================ */
export function SceneHook() {
  const icons = [Mail, MessageCircle, FileSpreadsheet, Users, PhoneCall, Megaphone, Calendar, CreditCard];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-12"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {icons.map((Icon, i) => {
          const startX = 8 + (i * 12) % 84;
          const startY = 10 + ((i * 19) % 65);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, x: '50vw', y: '50vh' }}
              animate={{
                opacity: [0, 0.6, 0.45],
                scale: [0, 1, 0.95],
                x: [`50vw`, `${startX}vw`, `${startX + 1.5}vw`],
                y: [`50vh`, `${startY}vh`, `${startY - 1}vh`],
                rotate: [0, (i % 2 ? -8 : 8), (i % 2 ? -4 : 4)],
              }}
              transition={{ duration: 2.0, delay: 0.2 + i * 0.06, ease }}
              className="absolute w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.88)',
                border: '1px solid rgba(45,30,60,0.08)',
                boxShadow: '0 12px 28px rgba(45,30,60,0.12)',
              }}
            >
              <Icon className="w-7 h-7 text-[#9C3838]" strokeWidth={1.8} />
            </motion.div>
          );
        })}
      </div>

      <PainBadge label="THE GCC PROBLEM" />
      <BigTitle>Marketing in the Gulf is broken.</BigTitle>
      <SubTitle>4 problems every team faces. 4 reasons revenue leaks daily.</SubTitle>
    </motion.div>
  );
}

/* ============================================================ */
/* PAIN #1 — tool sprawl                                        */
/* ============================================================ */
export function ScenePain1() {
  const tools = [
    { name: 'Mailchimp', color: '#FFE01B', text: '#000' },
    { name: 'HubSpot', color: '#FF7A59', text: '#fff' },
    { name: 'Excel', color: '#107C41', text: '#fff' },
    { name: 'Calendly', color: '#006BFF', text: '#fff' },
    { name: 'WhatsApp', color: '#25D366', text: '#fff' },
    { name: 'Stripe', color: '#635BFF', text: '#fff' },
    { name: 'Gmail', color: '#EA4335', text: '#fff' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-12"
    >
      <PainBadge n={1} label="TOOL SPRAWL" />
      <BigTitle scale={0.85}>
        Your team juggles <span style={{ color: '#9C3838' }}>7+ disconnected tools.</span>
      </BigTitle>
      <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-[70vw]">
        {tools.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30, scale: 0.85, rotate: -3 + (i % 3) * 3 }}
            animate={{
              opacity: 1,
              y: [30, 0, 0, -8, 0],
              scale: 1,
              rotate: -3 + (i % 3) * 3,
            }}
            transition={{
              duration: 0.6,
              delay: 0.2 + i * 0.06,
              y: { duration: 2.0, repeat: Infinity, ease: 'easeInOut', delay: 0.5 + i * 0.06 },
            }}
            className="px-5 py-3 rounded-2xl font-bold text-[16px] shadow-lg"
            style={{ background: t.color, color: t.text }}
          >
            {t.name}
          </motion.div>
        ))}
      </div>
      <SubTitle delay={0.7}>$2,400/mo · 4 hrs/week wasted on tab-switching alone.</SubTitle>
    </motion.div>
  );
}

/* ============================================================ */
/* SOLUTION #1 — unified Marketing module                       */
/* ============================================================ */
export function SceneSol1() {
  const tools = [
    'Marketing AI',
    'Campaigns',
    'Sequences',
    'Meetings',
    'Templates',
    'Audiences',
    'Web Forms',
    'Document Tracking',
    'Quote-to-Cash',
    'Cultural Intelligence',
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col px-10 py-8"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <SolBadge icon={Sparkles} label="NEXFLOW · MARKETING MODULE" />
      </div>
      <h2
        className="text-[3.4vw] leading-[1.02] font-bold text-[#1a1530] text-center mb-4"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
      >
        One platform. <span style={{ color: '#88B8B0' }}>10 tools.</span> Zero tab-switching.
      </h2>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="col-span-8 relative min-h-0">
          <ScreenshotFrame
            src="/screenshots/home.jpg"
            alt="NexFlow CRM"
            initialScale={1.02}
            finalScale={1.06}
            duration={7}
          />
          <CalloutPin x="40%" y="6%" label="Marketing tab → 10 tools" delay={0.6} color="primary" />
        </div>

        <div className="col-span-4 flex flex-col gap-2 overflow-hidden">
          <div
            className="px-4 py-2 rounded-xl text-[11px] tracking-[0.2em] uppercase font-bold"
            style={{
              background: 'rgba(45,30,60,0.06)',
              color: '#5A4A6A',
              border: '1px solid rgba(45,30,60,0.08)',
            }}
          >
            Marketing module · live
          </div>
          {tools.map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.07, duration: 0.4, ease }}
              className="px-4 py-2.5 rounded-xl flex items-center gap-3"
              style={{
                background: 'linear-gradient(90deg, rgba(184,160,200,0.18), rgba(136,184,176,0.10))',
                border: '1px solid rgba(184,160,200,0.4)',
                boxShadow: '0 4px 12px rgba(184,160,200,0.15)',
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #B8A0C8, #88B8B0)' }}
              >
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <div
                className="text-[14px] font-semibold leading-tight truncate"
                style={{ color: '#2D1E3C' }}
              >
                {t}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================ */
/* PAIN #2 — Bad Arabic AI                                      */
/* ============================================================ */
export function ScenePain2() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-12"
    >
      <PainBadge n={2} label="LOST IN TRANSLATION" />
      <BigTitle scale={0.85}>
        Generic AI doesn't <span style={{ color: '#9C3838' }}>speak Arabic.</span>
      </BigTitle>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease }}
        className="mt-8 max-w-[820px] w-full rounded-2xl p-6 border-2 relative"
        style={{ background: 'rgba(255,255,255,0.95)', borderColor: '#C24A4A' }}
      >
        <div className="flex items-center gap-2 mb-3 text-[12px] font-bold uppercase tracking-wider text-[#9C3838]">
          <Languages className="w-4 h-4" /> ChatGPT / Generic AI
        </div>
        <div className="text-[20px] text-[#1a1530] leading-relaxed text-right" dir="rtl">
          مرحبا، أنا أكتب لكم اليوم لأقول مرحبا وللتحدث عن منتجنا الجديد...
        </div>
        <div className="mt-3 text-[14px] text-[#9C3838] italic">
          ↑ Reads like Google Translate. No formal salutation. No cultural context.
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================ */
/* SOLUTION #2 — Marketing AI native Arabic                     */
/* ============================================================ */
export function SceneSol2() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1200);
    const t2 = setTimeout(() => setStep(2), 3200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col px-10 py-8"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <SolBadge icon={Sparkles} label="NEXFLOW · MARKETING AI" />
      </div>
      <h2
        className="text-[3.4vw] leading-[1.02] font-bold text-[#1a1530] text-center mb-4"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
      >
        Native Khaleeji-fluent AI. <span style={{ color: '#88B8B0' }}>Built for the GCC.</span>
      </h2>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="col-span-8 relative min-h-0">
          <ScreenshotFrame
            src="/screenshots/marketing-assistant.jpg"
            alt="NexFlow Marketing AI Assistant"
            initialScale={1.02}
            finalScale={1.06}
            duration={9}
          />
          <CalloutPin x="50%" y="35%" label="One prompt → flawless Arabic" delay={0.6} color="secondary" />
        </div>

        <div className="col-span-4 flex flex-col gap-3">
          <div
            className="px-4 py-3 rounded-xl"
            style={{
              background: 'rgba(45,30,60,0.06)',
              border: '1px solid rgba(45,30,60,0.08)',
            }}
          >
            <div className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#5A4A6A] mb-1">
              Your prompt
            </div>
            <div className="text-[14px] text-[#1a1530] font-medium leading-snug">
              "Write a Ramadan greeting + product offer for our enterprise prospects in Riyadh."
            </div>
          </div>

          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="px-4 py-3 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(184,160,200,0.18), rgba(136,184,176,0.18))',
                border: '1px solid rgba(184,160,200,0.4)',
                boxShadow: '0 6px 18px rgba(184,160,200,0.18)',
              }}
            >
              <div className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#5A6B66] mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> NexFlow AI · Khaleeji
              </div>
              <div className="text-[14px] text-[#1a1530] leading-relaxed text-right" dir="rtl">
                السلام عليكم أستاذ أحمد، رمضان كريم وكل عام وأنتم بخير...
              </div>
            </motion.div>
          )}

          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease }}
              className="px-3 py-2 rounded-lg flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(136,184,176,0.18)', color: '#5A6B66' }}
            >
              <Check className="w-4 h-4" /> Formal · Cultural · Native-Gulf
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================ */
/* PAIN #3 — bad timing                                         */
/* ============================================================ */
export function ScenePain3() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-12"
    >
      <PainBadge n={3} label="CULTURAL BLINDNESS" />
      <BigTitle scale={0.85}>
        Your campaigns fire <span style={{ color: '#9C3838' }}>during iftar.</span>
      </BigTitle>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease }}
        className="mt-8 flex items-center gap-6 max-w-[920px]"
      >
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(45,30,60,0.08)',
            boxShadow: '0 18px 40px rgba(45,30,60,0.12)',
          }}
        >
          <Calendar className="w-12 h-12 text-[#9C3838]" strokeWidth={1.6} />
        </div>

        <div className="flex flex-col gap-3 flex-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4, ease }}
            className="px-5 py-3 rounded-2xl text-[15px] font-semibold shadow-lg"
            style={{
              background: '#fff',
              border: '1px solid rgba(156,56,56,0.25)',
              color: '#1a1530',
            }}
          >
            <div className="text-[10px] uppercase tracking-wider text-[#9C3838] mb-1 font-bold">
              SENT · 6:42 PM · Ramadan
            </div>
            "Your 30% Friday Flash Sale ends in 2 hours!"
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.4, ease }}
            className="px-5 py-3 rounded-2xl text-[15px] font-semibold shadow-lg"
            style={{
              background: '#fff',
              border: '1px solid rgba(156,56,56,0.25)',
              color: '#1a1530',
            }}
          >
            <div className="text-[10px] uppercase tracking-wider text-[#9C3838] mb-1 font-bold">
              SCHEDULED · Sunday — your "Monday morning"
            </div>
            "Hi Ahmed, kicking off the work week with..."
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================ */
/* SOLUTION #3 — Cultural Intelligence engine                   */
/* ============================================================ */
export function SceneSol3() {
  const features = [
    { icon: Calendar, label: 'Hijri calendar · Ramadan, Eid, Hajj' },
    { icon: Globe, label: 'Friday/Saturday weekends per market' },
    { icon: Languages, label: 'Khaleeji vs MSA tone selection' },
    { icon: Zap, label: 'Auto-pause sends 30min before Maghrib' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col px-10 py-8"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <SolBadge icon={Globe} label="NEXFLOW · CULTURAL INTELLIGENCE" />
      </div>
      <h2
        className="text-[3.4vw] leading-[1.02] font-bold text-[#1a1530] text-center mb-4"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
      >
        Knows Ramadan. Knows Eid. <span style={{ color: '#88B8B0' }}>Knows when to speak.</span>
      </h2>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="col-span-8 relative min-h-0">
          <ScreenshotFrame
            src="/screenshots/cultural-intelligence.jpg"
            alt="NexFlow Cultural Intelligence"
            initialScale={1.0}
            finalScale={1.05}
            duration={8}
          />
          <CalloutPin x="55%" y="40%" label="Hijri-aware send windows" delay={0.7} color="primary" />
        </div>

        <div className="col-span-4 flex flex-col gap-2.5 justify-center">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.45, ease }}
                className="px-4 py-3 rounded-xl flex items-center gap-3"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(184,160,200,0.4)',
                  boxShadow: '0 6px 16px rgba(45,30,60,0.08)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #B8A0C8, #88B8B0)' }}
                >
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div className="text-[13.5px] font-semibold text-[#2D1E3C] leading-tight">
                  {f.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================ */
/* PAIN #4 — payment friction                                   */
/* ============================================================ */
export function ScenePain4() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-12"
    >
      <PainBadge n={4} label="PAYMENT FRICTION" />
      <BigTitle scale={0.85}>
        Generic Stripe. Buyer wants <span style={{ color: '#9C3838' }}>mada.</span>
      </BigTitle>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease }}
        className="mt-8 rounded-2xl p-6 max-w-[640px]"
        style={{
          background: 'rgba(255,255,255,0.95)',
          border: '2px solid #C24A4A',
          boxShadow: '0 18px 40px rgba(156,56,56,0.18)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <CreditCard className="w-7 h-7 text-[#9C3838]" />
          <div className="font-bold text-[#1a1530] text-[18px]">Stripe checkout · USD</div>
        </div>
        <div className="text-[44px] font-bold text-[#1a1530] leading-none">$8,500</div>
        <div className="text-[13px] text-[#6B5B7B] mt-1">+ FX fees + cross-border charges</div>
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, duration: 0.45, ease }}
          className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#9C3838]/15 text-[#9C3838] text-[13px] font-bold uppercase tracking-wider"
        >
          <AlertTriangle className="w-4 h-4" /> Abandoned · $8.5K lost
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================ */
/* SOLUTION #4 — Quote-to-Cash with GCC rails                   */
/* ============================================================ */
export function SceneSol4() {
  const rails = [
    { name: 'mada', color: '#84BD00', desc: 'Saudi · 1.0%' },
    { name: 'Tap', color: '#1B7AE2', desc: 'GCC · 2.5%' },
    { name: 'HyperPay', color: '#FF6B35', desc: 'MENA · 2.4%' },
    { name: 'PayTabs', color: '#7B61FF', desc: 'GCC+EG · 2.7%' },
    { name: 'Apple Pay', color: '#000', desc: 'Global' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col px-10 py-8"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <SolBadge icon={CreditCard} label="NEXFLOW · QUOTE-TO-CASH" />
      </div>
      <h2
        className="text-[3.4vw] leading-[1.02] font-bold text-[#1a1530] text-center mb-4"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
      >
        Native GCC payment rails. <span style={{ color: '#88B8B0' }}>Quote → cash in 1 click.</span>
      </h2>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="col-span-8 relative min-h-0">
          <ScreenshotFrame
            src="/screenshots/quote-to-cash.jpg"
            alt="NexFlow Quote-to-Cash"
            initialScale={1.0}
            finalScale={1.05}
            duration={8}
          />
          <CalloutPin x="78%" y="45%" label="5 GCC payment providers" delay={0.6} color="accent" />
        </div>

        <div className="col-span-4 flex flex-col gap-2.5 justify-center">
          {rails.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.13, duration: 0.45, ease }}
              className="px-4 py-3 rounded-xl flex items-center gap-3"
              style={{
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(45,30,60,0.08)',
                boxShadow: '0 4px 12px rgba(45,30,60,0.08)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-[13px] shrink-0"
                style={{ background: r.color }}
              >
                {r.name.slice(0, 2)}
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#2D1E3C] leading-tight">{r.name}</div>
                <div className="text-[12px] text-[#6B5B7B]">{r.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================ */
/* MONTAGE — every other marketing tool, fast cuts              */
/* ============================================================ */
const MONTAGE_TOOLS = [
  { src: '/screenshots/campaigns.jpg', label: 'Campaigns', desc: 'Multi-channel orchestration' },
  { src: '/screenshots/sequences.jpg', label: 'Sequences', desc: 'Automated cadences' },
  { src: '/screenshots/audiences.jpg', label: 'Audiences', desc: 'AI-built target groups' },
  { src: '/screenshots/segments.jpg', label: 'Segments', desc: 'Live behavioural cohorts' },
  { src: '/screenshots/templates.jpg', label: 'Templates', desc: 'Email + WhatsApp library' },
  { src: '/screenshots/web-forms.jpg', label: 'Web Forms', desc: 'Lead capture' },
  { src: '/screenshots/meetings.jpg', label: 'Meetings', desc: 'Round-robin booking' },
  { src: '/screenshots/document-tracking.jpg', label: 'Document Tracking', desc: 'See every open + click' },
];
const MONTAGE_INTERVAL = 2200;

export function SceneMontage() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setI((n) => (n + 1) % MONTAGE_TOOLS.length);
    }, MONTAGE_INTERVAL);
    return () => window.clearInterval(id);
  }, []);
  const t = MONTAGE_TOOLS[i];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col px-10 py-8"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <SolBadge icon={Sparkles} label="AND THERE'S MORE" />
      </div>
      <h2
        className="text-[3.4vw] leading-[1.02] font-bold text-[#1a1530] text-center mb-4"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
      >
        Every other tool you'd <span style={{ color: '#88B8B0' }}>build a stack to replicate.</span>
      </h2>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <motion.div
          key={t.src}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease }}
          className="col-span-8 relative min-h-0"
        >
          <ScreenshotFrame
            src={t.src}
            alt={t.label}
            initialScale={1.0}
            finalScale={1.04}
            duration={2.0}
          />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="absolute left-7 bottom-7 px-5 py-3 rounded-2xl backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(184,160,200,0.95), rgba(136,184,176,0.95))',
              boxShadow: '0 14px 40px rgba(45,30,60,0.28)',
              border: '1px solid rgba(255,255,255,0.35)',
            }}
          >
            <div className="text-[11px] tracking-[0.18em] uppercase text-white/80 font-semibold">
              Live in NexFlow
            </div>
            <div className="text-[24px] leading-tight font-bold text-white">{t.label}</div>
            <div className="text-[13px] text-white/90">{t.desc}</div>
          </motion.div>
        </motion.div>

        <div className="col-span-4 flex flex-col gap-2 overflow-hidden">
          {MONTAGE_TOOLS.map((tt, idx) => {
            const active = idx === i;
            return (
              <motion.div
                key={tt.label}
                animate={{ scale: active ? 1.02 : 1, x: active ? 4 : 0 }}
                transition={{ duration: 0.25 }}
                className="px-4 py-2.5 rounded-xl flex items-center gap-3"
                style={{
                  background: active
                    ? 'linear-gradient(90deg, rgba(184,160,200,0.18), rgba(136,184,176,0.12))'
                    : 'rgba(255,255,255,0.55)',
                  border: active
                    ? '1px solid rgba(184,160,200,0.5)'
                    : '1px solid rgba(45,30,60,0.06)',
                  boxShadow: active ? '0 6px 18px rgba(184,160,200,0.25)' : 'none',
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold shrink-0"
                  style={{
                    background: active
                      ? 'linear-gradient(135deg, #B8A0C8, #88B8B0)'
                      : 'rgba(45,30,60,0.06)',
                    color: active ? '#fff' : '#5A4A6A',
                  }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[13px] font-bold leading-tight truncate"
                    style={{ color: active ? '#2D1E3C' : '#3D2D4C' }}
                  >
                    {tt.label}
                  </div>
                  <div className="text-[11px] text-[#6B5B7B] truncate">{tt.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================ */
/* STATS — investor numbers                                     */
/* ============================================================ */
function Counter({
  to,
  prefix = '',
  suffix = '',
  duration = 1.6,
  delay = 0,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now() + delay * 1000;
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(eased * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, delay]);
  return (
    <span>
      {prefix}
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

export function SceneStats() {
  const stats = [
    { value: 47, prefix: '', suffix: '%', label: 'Lower CAC', sub: 'vs HubSpot stack', icon: TrendingUp },
    { value: 3, prefix: '', suffix: '.2×', label: 'Conversion lift', sub: 'Khaleeji-tuned cadences', icon: Sparkles },
    { value: 6, prefix: '', suffix: ' GCC', label: 'Markets', sub: 'KSA, UAE, QA, BH, KW, OM', icon: Globe },
    { value: 4.2, prefix: '$', suffix: 'B', label: 'GCC SaaS TAM', sub: 'by 2028 (IDC)', icon: CreditCard },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-12"
    >
      <SolBadge icon={TrendingUp} label="THE NUMBERS" />
      <h2
        className="text-[3.6vw] leading-[1.02] font-bold text-[#1a1530] text-center mt-4 mb-8"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
      >
        Built for a market <span style={{ color: '#88B8B0' }}>nobody else owns.</span>
      </h2>

      <div className="grid grid-cols-4 gap-5 max-w-[1280px] w-full">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.55, ease }}
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(184,160,200,0.35)',
                boxShadow: '0 14px 36px rgba(45,30,60,0.10)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'linear-gradient(135deg, #B8A0C8, #88B8B0)' }}
              >
                <Icon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div
                className="text-[44px] leading-none font-bold"
                style={{
                  fontFamily: 'var(--font-display)',
                  background: 'linear-gradient(135deg, #1a1530 0%, #5A4A6A 60%, #B8A0C8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {s.value === 4.2 ? (
                  <>$4.2B</>
                ) : (
                  <Counter
                    to={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    delay={0.4 + i * 0.15}
                  />
                )}
              </div>
              <div className="mt-2 text-[15px] font-bold text-[#2D1E3C]">{s.label}</div>
              <div className="text-[12px] text-[#6B5B7B] mt-0.5">{s.sub}</div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ============================================================ */
/* CLOSE — brand lockup + CTA                                   */
/* ============================================================ */
export function SceneClose() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-12 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 3 }}
        transition={{ duration: 1.5, ease }}
        className="absolute w-[40vw] h-[40vw] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(184,160,200,0.45) 0%, rgba(136,184,176,0.30) 35%, transparent 65%)',
          filter: 'blur(40px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease }}
        className="relative px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.22em] text-white"
        style={{
          background: 'linear-gradient(90deg, rgba(184,160,200,0.95), rgba(136,184,176,0.95))',
          boxShadow: '0 8px 24px rgba(184,160,200,0.4)',
        }}
      >
        NEXFLOW · INVESTING IN THE GCC
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.9, ease }}
        className="relative text-[10vw] leading-[0.95] font-bold mt-4"
        style={{
          fontFamily: 'var(--font-display)',
          background: 'linear-gradient(135deg, #1a1530 0%, #5A4A6A 50%, #B8A0C8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em',
        }}
      >
        NexFlow.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6, ease }}
        className="relative text-[1.6vw] text-[#3D2D4C] mt-3 font-medium text-center max-w-[60vw]"
      >
        The first AI-native CRM <span style={{ color: '#5A6B66', fontWeight: 700 }}>built for the GCC.</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.45, duration: 0.5, ease }}
        className="relative mt-7 flex items-center gap-3"
      >
        <div
          className="px-6 py-3 rounded-full flex items-center gap-2 text-[15px] font-bold text-white"
          style={{
            background: 'linear-gradient(90deg, #B8A0C8, #88B8B0)',
            boxShadow: '0 12px 30px rgba(184,160,200,0.4)',
          }}
        >
          Series A · Riyadh · 2026 <ArrowRight className="w-4 h-4" />
        </div>
        <div className="px-5 py-3 rounded-full text-[14px] font-semibold text-[#2D1E3C] bg-white/80 border border-[#B8A0C8]/40">
          nexflow.app
        </div>
      </motion.div>
    </motion.div>
  );
}
