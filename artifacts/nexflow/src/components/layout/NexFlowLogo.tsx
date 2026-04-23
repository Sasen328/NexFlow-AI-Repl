export function NexFlowLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nf-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B8A0C8" />
          <stop offset="33%" stopColor="#88B8B0" />
          <stop offset="66%" stopColor="#C8A880" />
          <stop offset="100%" stopColor="#90B8B8" />
        </linearGradient>
        <linearGradient id="nf-flow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#88B8B0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#B8A0C8" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* Background rounded rect */}
      <rect width="40" height="40" rx="10" fill="url(#nf-logo-grad)" />
      {/* N letterform — bold, geometric */}
      <path
        d="M9 30V10h4.5l9.5 13.5V10H27v20h-4.5L13 16.5V30H9Z"
        fill="white"
        fillOpacity="0.95"
      />
      {/* Flow pulse dot — bottom right */}
      <circle cx="32" cy="32" r="3.5" fill="white" fillOpacity="0.7" />
      <circle cx="32" cy="32" r="5.5" fill="white" fillOpacity="0.2" />
    </svg>
  );
}

export function NexFlowWordmark({ className }: { className?: string }) {
  return (
    <span className={`font-black tracking-tight nf-chameleon-text ${className ?? ""}`}>
      Nex<span className="font-light">Flow</span>
    </span>
  );
}
