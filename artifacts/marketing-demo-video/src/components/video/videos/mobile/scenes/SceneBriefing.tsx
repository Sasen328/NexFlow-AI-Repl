import { motion } from 'framer-motion';
import { StatusBar } from '../Phone';

const accounts = [
  { name: 'ARAMCO Digital', score: 92, label: 'Strong signal', tone: '#88B8B0', value: 'SAR 4.2M' },
  { name: 'e& Enterprise', score: 78, label: 'Renewal risk', tone: '#C8A880', value: 'AED 1.8M' },
  { name: 'STC Pay', score: 85, label: 'Hot opportunity', tone: '#B8A0C8', value: 'SAR 2.6M' },
];

export function SceneBriefing() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(180deg, #FAF7F4 0%, #F4ECE6 60%, #ECE2EE 100%)',
      }}
    >
      <StatusBar tone="dark" />

      {/* Greeting */}
      <div className="absolute top-[58px] left-0 right-0 px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-right"
          dir="rtl"
          style={{ fontFamily: 'Tajawal, sans-serif' }}
        >
          <div className="text-[15px] text-[#6b5e75] font-medium">صباح الخير، فيصل</div>
          <div className="text-[22px] font-bold text-[#1F1A24] leading-tight mt-0.5">
            ٣ حسابات تحتاج انتباهك
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-2"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          <div className="text-[11px] uppercase tracking-[0.18em] text-[#7a6a82]">
            Good morning, Faisal
          </div>
          <div className="text-[17px] font-semibold text-[#1F1A24] leading-tight">
            3 accounts need you today
          </div>
        </motion.div>
      </div>

      {/* Cards stack */}
      <div className="absolute top-[230px] left-0 right-0 px-5 space-y-3">
        {accounts.map((a, i) => (
          <motion.div
            key={a.name}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 24,
              delay: 0.6 + i * 0.18,
            }}
            className="rounded-2xl p-3.5 relative overflow-hidden"
            style={{
              background: '#fff',
              boxShadow: '0 10px 30px rgba(45,30,60,0.08), 0 1px 2px rgba(0,0,0,0.04)',
              border: '1px solid rgba(184,160,200,0.18)',
            }}
          >
            {/* Tone bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ background: a.tone }}
            />
            <div className="flex items-start justify-between pl-2">
              <div>
                <div
                  className="text-[14px] font-bold text-[#1F1A24]"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {a.name}
                </div>
                <div
                  className="text-[10.5px] uppercase tracking-[0.14em] mt-0.5"
                  style={{ color: a.tone, fontWeight: 700 }}
                >
                  {a.label}
                </div>
                <div className="text-[12px] text-[#5a4e63] mt-1.5 font-medium">
                  {a.value}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative w-11 h-11">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#EFE6F0" strokeWidth="3" />
                    <motion.circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke={a.tone}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(a.score / 100) * 94.2} 94.2`}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.9, delay: 0.9 + i * 0.18 }}
                    />
                  </svg>
                  <div
                    className="absolute inset-0 flex items-center justify-center text-[12px] font-bold"
                    style={{ color: a.tone, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    {a.score}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom AI chip pulse */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.16em] uppercase text-white"
        style={{
          background:
            'linear-gradient(90deg, #B8A0C8, #88B8B0, #C8A880)',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}
        animate={{ scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }}
        initial={{ opacity: 0.85, scale: 1 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        Briefed by NexFlow AI
      </motion.div>
    </div>
  );
}
