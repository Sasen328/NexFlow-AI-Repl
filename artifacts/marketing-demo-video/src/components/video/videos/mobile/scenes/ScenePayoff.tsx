import { motion } from 'framer-motion';
import { StatusBar } from '../Phone';

/** What plays inside the phone screen during the payoff scene */
export function PhoneScreenPayoff() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(180deg, #FAF7F4 0%, #F0E6EE 100%)',
      }}
    >
      <StatusBar tone="dark" />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-5">
        <motion.img
          src={`${import.meta.env.BASE_URL}mobile/logo_mark_hires.svg`}
          alt=""
          initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 150,
            height: 150,
            filter: 'drop-shadow(0 10px 20px rgba(184,160,200,0.3))',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-center"
        >
          <div
            className="text-[20px] font-extrabold text-[#1F1A24] leading-tight tracking-tight"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            NexFlow
          </div>
          <div
            className="text-[10px] uppercase tracking-[0.3em] mt-1"
            style={{
              background:
                'linear-gradient(90deg, #B8A0C8, #88B8B0, #C8A880)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            Mobile · GCC
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/** Tagline overlay rendered next to the phone in the parent template */
export function PayoffTagline() {
  return (
    <div className="flex flex-col gap-5 max-w-[460px]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        dir="rtl"
        className="text-right"
        style={{ fontFamily: 'Tajawal, sans-serif' }}
      >
        <div className="text-[44px] leading-[1.1] font-bold text-[#FAF7F4]">
          إيراداتك،
        </div>
        <div
          className="text-[44px] leading-[1.1] font-bold"
          style={{
            background: 'linear-gradient(90deg, #C8A880, #B8A0C8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          في جيبك.
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        <div className="text-[36px] leading-[1.05] font-extrabold tracking-tight text-[#FAF7F4]">
          Your revenue,
        </div>
        <div
          className="text-[36px] leading-[1.05] font-extrabold tracking-tight"
          style={{
            background: 'linear-gradient(90deg, #88B8B0, #B8A0C8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          in your pocket.
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.6, delay: 1.3 }}
        className="h-[2px] origin-left"
        style={{
          background:
            'linear-gradient(90deg, #B8A0C8, #88B8B0, #C8A880, transparent)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="flex items-center gap-3"
      >
        <img
          src={`${import.meta.env.BASE_URL}mobile/logo_mark_hires.svg`}
          alt=""
          style={{
            width: 38,
            height: 38,
            filter: 'drop-shadow(0 4px 12px rgba(184,160,200,0.5))',
          }}
        />
        <div
          className="text-[18px] font-extrabold text-[#FAF7F4] tracking-tight"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          NexFlow
        </div>
        <div
          className="text-[10px] uppercase tracking-[0.3em] text-[#B8A0C8]"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          KSA · UAE
        </div>
      </motion.div>
    </div>
  );
}
