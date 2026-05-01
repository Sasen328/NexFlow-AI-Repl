import { motion } from 'framer-motion';

export function SceneOpen() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{
        background:
          'linear-gradient(160deg, #0c0810 0%, #1a1322 50%, #251828 100%)',
      }}
    >
      {/* Wordmark stripe */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-12 text-[11px] uppercase tracking-[0.4em]"
        style={{
          color: '#B8A0C8',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}
      >
        NexFlow · Mobile
      </motion.div>

      {/* Diamond mark */}
      <motion.img
        src={`${import.meta.env.BASE_URL}mobile/logo_mark_hires.svg`}
        alt=""
        initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
        animate={{
          opacity: [0, 0.7, 0.4],
          scale: [0.6, 1, 1.1],
          rotate: [-8, 0, 4],
        }}
        transition={{ duration: 4, ease: 'easeInOut', times: [0, 0.4, 1] }}
        className="absolute"
        style={{
          width: 380,
          height: 380,
          top: '50%',
          left: '50%',
          marginLeft: -190,
          marginTop: -190,
          filter: 'drop-shadow(0 0 60px rgba(184,160,200,0.6))',
        }}
      />

      {/* Booting glow that the phone "wakes" from */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0.2] }}
        transition={{ duration: 4, ease: 'easeInOut' }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(184,160,200,0.25), transparent 50%)',
        }}
      />
    </div>
  );
}

/** Lock-screen content for the booting state (used inside the persistent phone) */
export function PhoneScreenOpen() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background:
          'linear-gradient(160deg, #1a1024 0%, #2a1a36 60%, #3c2848 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 1, 0.9], scale: [0.8, 1, 1.05] }}
        transition={{ duration: 3.5, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <img
          src={`${import.meta.env.BASE_URL}mobile/logo_mark_hires.svg`}
          alt=""
          style={{
            width: 140,
            height: 140,
            filter: 'drop-shadow(0 0 30px rgba(184,160,200,0.7))',
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-6 text-[11px] uppercase tracking-[0.4em]"
          style={{
            color: '#E0D2EC',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          NexFlow
        </motion.div>
      </motion.div>
    </div>
  );
}
