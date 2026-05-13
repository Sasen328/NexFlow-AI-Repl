const base = import.meta.env.BASE_URL;

export default function DeploymentSetup() {
  const services = [
    { name: "artifacts/nexflow", type: "React + Vite SPA", path: "/", port: "PORT env var", build: "pnpm --filter @workspace/nexflow run build", notes: "Static output served via Vite. BASE_URL path routing. allowedHosts: true for proxy." },
    { name: "artifacts/api-server", type: "Node + Express API", path: "/api", port: "8080", build: "pnpm --filter @workspace/api-server run build", notes: "Reverse proxy routes /api → port 8080. Drizzle ORM migrations via drizzle-kit push." },
    { name: "artifacts/mobile", type: "Expo React Native", path: "REPLIT_EXPO_DEV_DOMAIN", port: "Expo managed", build: "pnpm --filter @workspace/mobile run build", notes: "iOS + Android. Uses BASE_URL from Expo constants. REPLIT_EXPO_DEV_DOMAIN for dev." },
    { name: "artifacts/company-profile-deck", type: "React slides", path: "/company-profile-deck", port: "PORT env var", build: "pnpm --filter @workspace/company-profile-deck run build", notes: "Self-contained slide viewer. /allslides for PDF export mode." },
  ];

  const envVars = [
    { key: "DATABASE_URL", desc: "PostgreSQL connection string (Replit managed)" },
    { key: "SESSION_SECRET", desc: "Express session signing key (Replit secret)" },
    { key: "INVESTOR_PASSCODE", desc: "Investor deck access gate (Replit secret)" },
    { key: "OPENAI_API_KEY", desc: "GPT-4o + GPT-4o-mini (synthesis, scoring)" },
    { key: "ANTHROPIC_API_KEY", desc: "Claude 3.5 (validation, reasoning)" },
    { key: "GEMINI_API_KEY", desc: "Gemini 1.5 Pro (vision OCR, research)" },
    { key: "PERPLEXITY_API_KEY", desc: "Live web research — 9 parallel agents" },
    { key: "RESEND_API_KEY", desc: "Transactional email (Replit integration)" },
  ];

  const localSteps = [
    "git clone <repo> && cd nexflow-crm",
    "npm install -g pnpm  (v9+)",
    "pnpm install  (installs all workspace packages)",
    "cp .env.example .env  →  fill in API keys",
    "pnpm --filter @workspace/api-server run db:push  (runs Drizzle migrations)",
    "Start workflow: artifacts/api-server: API Server",
    "Start workflow: artifacts/nexflow: web",
    "Open preview → click any persona pill on /signin to sign in",
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] right-[-8vw] w-[50vw] h-[50vw] rounded-full opacity-20 blur-[6vw] bg-olive" />
        <div className="absolute bottom-[-10vh] left-[-6vw] w-[40vw] h-[40vw] rounded-full opacity-18 blur-[6vw] bg-mist" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>Deployment · Local Dev Setup</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13vh]">
        <h2 className="font-display font-extrabold text-[3.6vw] leading-[0.96] tracking-[-0.02em]">
          pnpm monorepo. Replit workflows. 8-step local setup.
        </h2>
        <p className="mt-[0.8vh] font-serif italic text-[1.3vw] text-ink/65">4 artifacts, 1 shared PostgreSQL database, 8 environment secrets, path-based reverse proxy routing.</p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[26vh] bottom-[4vh]">
        <div className="grid grid-cols-2 gap-[1.2vw] mb-[1vh]">
          <div>
            <div className="text-[0.78vw] uppercase tracking-[0.18em] font-semibold text-ink/50 mb-[0.6vh]">Services & routing</div>
            <div className="space-y-[0.5vh]">
              {services.map((s, i) => (
                <div key={i} className="rounded-[0.8vw] bg-white/70 border border-ink/8 px-[1vw] py-[0.7vh]">
                  <div className="flex items-center gap-[0.8vw]">
                    <span className="font-display font-bold text-[0.92vw]">{s.name}</span>
                    <span className="text-[0.72vw] bg-ink/8 rounded-full px-[0.5vw] py-[0.1vh] text-ink/55">{s.type}</span>
                    <span className="text-[0.72vw] font-mono text-seafoam ml-auto">path: {s.path}</span>
                  </div>
                  <div className="text-[0.78vw] text-ink/55 mt-[0.15vh]">{s.notes}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[0.78vw] uppercase tracking-[0.18em] font-semibold text-ink/50 mb-[0.6vh]">Environment secrets required</div>
            <div className="space-y-[0.4vh] mb-[0.8vh]">
              {envVars.map((e, i) => (
                <div key={i} className="flex gap-[0.8vw] items-start rounded-[0.6vw] bg-ink/4 px-[0.8vw] py-[0.4vh]">
                  <span className="font-mono font-semibold text-[0.82vw] text-lavender flex-shrink-0 w-[12vw]">{e.key}</span>
                  <span className="text-[0.8vw] text-ink/65">{e.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-[1vw] bg-ink/5 border border-ink/8 px-[1.2vw] py-[0.8vh]">
          <div className="text-[0.75vw] uppercase tracking-[0.18em] font-semibold text-ink/50 mb-[0.5vh]">Local dev — 8 steps</div>
          <div className="grid grid-cols-4 gap-[0.8vw]">
            {localSteps.map((step, i) => (
              <div key={i} className="flex gap-[0.5vw] items-start">
                <span className="font-display font-extrabold text-[0.9vw] text-seafoam flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[0.78vw] text-ink/72 font-mono leading-snug">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
