import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Languages,
  Calendar,
  CreditCard,
  Mail,
  MessageCircle,
  FileSpreadsheet,
  Users,
  Send,
  Megaphone,
  PhoneCall,
} from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

function PainEyebrow({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.22em] text-white"
      style={{
        background: 'linear-gradient(90deg, #C24A4A, #9C3838)',
        boxShadow: '0 8px 24px rgba(156,56,56,0.32)',
      }}
    >
      {label}
    </motion.div>
  );
}

function PainTitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease }}
      className="text-[4.6vw] leading-[1.05] font-bold text-[#1a1530] max-w-[80vw] text-center mt-5"
      style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.015em' }}
    >
      {children}
    </motion.h2>
  );
}

function PainSub({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.45, ease }}
      className="text-[1.5vw] text-[#5A4A6A] mt-4 max-w-[60vw] text-center font-medium"
    >
      {children}
    </motion.p>
  );
}

/* ============================================================ */
/* SCENE HOOK — opening pain statement                          */
/* ============================================================ */
export function SceneHook() {
  const icons = [Mail, MessageCircle, FileSpreadsheet, Users, PhoneCall, Megaphone];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-12"
    >
      {/* floating chaos icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {icons.map((Icon, i) => {
          const startX = 10 + (i * 14) % 80;
          const startY = 12 + ((i * 23) % 60);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, x: '50vw', y: '50vh' }}
              animate={{
                opacity: [0, 0.55, 0.4],
                scale: [0, 1, 0.95],
                x: [`50vw`, `${startX}vw`, `${startX + 2}vw`],
                y: [`50vh`, `${startY}vh`, `${startY - 1}vh`],
              }}
              transition={{ duration: 2.4, delay: 0.3 + i * 0.08, ease }}
              className="absolute w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(45,30,60,0.08)',
                boxShadow: '0 12px 28px rgba(45,30,60,0.12)',
              }}
            >
              <Icon className="w-7 h-7 text-[#9C3838]" strokeWidth={1.8} />
            </motion.div>
          );
        })}
      </div>

      <PainEyebrow label="BEFORE NEXFLOW" />
      <PainTitle>Marketing in the GCC is broken.</PainTitle>
      <PainSub>Disconnected tools. Generic AI. Wrong timing. Lost revenue.</PainSub>
    </motion.div>
  );
}

/* ============================================================ */
/* PAIN 1 — disconnected tools                                  */
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
      <PainEyebrow label="PAIN #1 · TOOL SPRAWL" />
      <PainTitle>
        Your team juggles <span style={{ color: '#9C3838' }}>7+ disconnected tools.</span>
      </PainTitle>

      <div className="mt-10 flex flex-wrap justify-center gap-4 max-w-[70vw]">
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
              duration: 1.6,
              delay: 0.3 + i * 0.07,
              y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="px-5 py-3 rounded-2xl font-bold text-[18px] shadow-lg"
            style={{ background: t.color, color: t.text }}
          >
            {t.name}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-6 px-4 py-2 rounded-full bg-[#9C3838]/10 text-[#9C3838] text-[14px] font-semibold border border-[#9C3838]/30"
      >
        $2,400/mo · 4 hours/week wasted on tab-switching
      </motion.div>
    </motion.div>
  );
}

/* ============================================================ */
/* PAIN 2 — Arabic AI fails                                     */
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
      <PainEyebrow label="PAIN #2 · LOST IN TRANSLATION" />
      <PainTitle>
        Your AI doesn't actually <span style={{ color: '#9C3838' }}>speak Arabic.</span>
      </PainTitle>

      <div className="mt-10 grid grid-cols-2 gap-6 max-w-[1000px] w-full">
        {/* Bad AI output */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease }}
          className="rounded-2xl p-5 border-2 relative"
          style={{
            background: 'rgba(255,255,255,0.9)',
            borderColor: '#C24A4A',
          }}
        >
          <div className="flex items-center gap-2 mb-3 text-[12px] font-bold uppercase tracking-wider text-[#9C3838]">
            <Languages className="w-4 h-4" /> Generic AI
          </div>
          <div className="text-[16px] text-[#1a1530] leading-relaxed text-right" dir="rtl">
            مرحبا، أنا أكتب لكم اليوم لأقول مرحبا...
          </div>
          <div className="mt-3 text-[13px] text-[#9C3838] italic">
            ↑ Reads like a Google Translate crime scene.
          </div>
        </motion.div>

        {/* Good AI output (foreshadow) */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease }}
          className="rounded-2xl p-5 border-2 relative"
          style={{
            background: 'rgba(255,255,255,0.6)',
            borderColor: 'rgba(136,184,176,0.35)',
            opacity: 0.5,
          }}
        >
          <div className="flex items-center gap-2 mb-3 text-[12px] font-bold uppercase tracking-wider text-[#5A6B66]">
            <Languages className="w-4 h-4" /> What you need
          </div>
          <div className="text-[16px] text-[#5A6B66] leading-relaxed text-right" dir="rtl">
            السلام عليكم أستاذ أحمد، أتمنى أن تصلكم رسالتي وأنتم بخير...
          </div>
          <div className="mt-3 text-[13px] text-[#5A6B66] italic">
            Formal. Cultural. Native-Gulf.
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ============================================================ */
/* PAIN 3 — bad timing                                          */
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
      <PainEyebrow label="PAIN #3 · CULTURAL BLINDNESS" />
      <PainTitle>
        Your campaigns fire during{' '}
        <span style={{ color: '#9C3838' }}>iftar.</span>
      </PainTitle>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease }}
        className="mt-10 flex items-center gap-6"
      >
        <div
          className="w-28 h-28 rounded-3xl flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(45,30,60,0.08)',
            boxShadow: '0 18px 40px rgba(45,30,60,0.12)',
          }}
        >
          <Calendar className="w-14 h-14 text-[#9C3838]" strokeWidth={1.6} />
        </div>

        <div className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease }}
            className="px-5 py-3 rounded-2xl text-[16px] font-semibold shadow-lg max-w-[460px]"
            style={{
              background: '#fff',
              border: '1px solid rgba(156,56,56,0.25)',
              color: '#1a1530',
            }}
          >
            <div className="text-[11px] uppercase tracking-wider text-[#9C3838] mb-1 font-bold">
              SENT · 6:42 PM · Ramadan
            </div>
            "Your 30% Friday Flash Sale ends in 2 hours!"
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 0.5, ease }}
            className="px-5 py-3 rounded-2xl text-[16px] font-semibold shadow-lg max-w-[460px]"
            style={{
              background: '#fff',
              border: '1px solid rgba(156,56,56,0.25)',
              color: '#1a1530',
            }}
          >
            <div className="text-[11px] uppercase tracking-wider text-[#9C3838] mb-1 font-bold">
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
/* PAIN 4 — payment rails                                       */
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
      <PainEyebrow label="PAIN #4 · PAYMENT FRICTION" />
      <PainTitle>
        Generic Stripe. Your buyer wants{' '}
        <span style={{ color: '#9C3838' }}>mada</span>.
      </PainTitle>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease }}
        className="mt-10 grid grid-cols-2 gap-8 max-w-[900px]"
      >
        {/* Rejected */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.95)',
            border: '2px solid #C24A4A',
            boxShadow: '0 18px 40px rgba(156,56,56,0.18)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-7 h-7 text-[#9C3838]" />
            <div className="font-bold text-[#1a1530] text-[18px]">Stripe · USD</div>
          </div>
          <div className="text-[42px] font-bold text-[#1a1530]">$8,500</div>
          <div className="text-[13px] text-[#6B5B7B] mt-1">+ FX fees + cross-border charges</div>
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.45, ease }}
            className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#9C3838]/15 text-[#9C3838] text-[13px] font-bold uppercase tracking-wider"
          >
            <AlertTriangle className="w-4 h-4" /> Abandoned
          </motion.div>
        </div>

        {/* What works (foreshadow) */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: 'rgba(136,184,176,0.10)',
            border: '2px dashed rgba(136,184,176,0.45)',
            opacity: 0.6,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-7 h-7 text-[#5A6B66]" />
            <div className="font-bold text-[#1a1530] text-[18px]">mada · SAR</div>
          </div>
          <div className="text-[42px] font-bold text-[#1a1530]">31,875 SAR</div>
          <div className="text-[13px] text-[#6B5B7B] mt-1">Local rails · 1.0% · zero FX</div>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#88B8B0]/20 text-[#5A6B66] text-[13px] font-bold uppercase tracking-wider">
            <Send className="w-4 h-4" /> Closed-Won
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================ */
/* REVEAL — "Meet NexFlow"                                      */
/* ============================================================ */
export function SceneReveal() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-12 overflow-hidden"
    >
      {/* Radial wash */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 3 }}
        transition={{ duration: 1.2, ease }}
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
        ENTER
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
        className="relative text-[1.8vw] text-[#3D2D4C] mt-3 font-medium text-center max-w-[60vw]"
      >
        The first AI-native CRM <span style={{ color: '#5A6B66', fontWeight: 700 }}>built for the GCC.</span>
      </motion.p>
    </motion.div>
  );
}
