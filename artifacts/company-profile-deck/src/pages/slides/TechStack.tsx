const base = import.meta.env.BASE_URL;

export default function TechStack() {
  const frontend = [
    { name: "React 18 + TypeScript", note: "Strict mode, full type coverage" },
    { name: "Vite", note: "Build tool, HMR, BASE_URL path routing" },
    { name: "Tailwind CSS v4", note: "Utility-first, custom design tokens" },
    { name: "shadcn/ui + Radix", note: "Accessible component primitives" },
    { name: "Framer Motion", note: "Animations, layout transitions" },
    { name: "TanStack Query v5", note: "Server state, caching, optimistic UI" },
    { name: "Wouter", note: "Lightweight client-side router" },
    { name: "Recharts", note: "Data visualisation, KPI charts" },
  ];
  const backend = [
    { name: "Node.js + Express", note: "REST API, middleware stack" },
    { name: "Drizzle ORM", note: "Type-safe SQL, schema-as-code" },
    { name: "PostgreSQL", note: "Primary data store, full-text search" },
    { name: "Zod", note: "Runtime validation, OpenAPI schema" },
    { name: "Pino logger", note: "Structured JSON logging" },
    { name: "pnpm workspaces", note: "Monorepo — web, API, mobile, slides" },
    { name: "OpenAPI + Orval", note: "Contract-first codegen, React Query hooks" },
    { name: "Resend", note: "Transactional email delivery" },
  ];
  const ai = [
    { name: "OpenAI GPT-4o", note: "Synthesis, campaign copy, scoring" },
    { name: "Anthropic Claude 3.5", note: "Validation, complex reasoning" },
    { name: "Google Gemini 1.5 Pro", note: "Vision OCR, multi-agent primary" },
    { name: "Perplexity", note: "Live web research — 9 parallel agents" },
    { name: "OpenRouter", note: "Model routing + fallback waterfall" },
    { name: "Cheerio + Playwright", note: "Web scraping for enrichment crawls" },
    { name: "fanOut engine", note: "16 parallel agents, 55s timeout per agent" },
    { name: "synthesizeJson waterfall", note: "Gemini → Claude → GPT → fallback" },
  ];

  const Section = ({ title, color, items }: { title: string; color: string; items: { name: string; note: string }[] }) => (
    <div>
      <div className={`text-[0.78vw] uppercase tracking-[0.22em] font-semibold mb-[0.8vh] ${color}`}>{title}</div>
      <div className="grid grid-cols-2 gap-[0.5vw]">
        {items.map((item, i) => (
          <div key={i} className="rounded-[0.7vw] bg-white/70 border border-ink/8 px-[0.9vw] py-[0.7vh]">
            <div className="font-display font-semibold text-[0.95vw] leading-tight">{item.name}</div>
            <div className="text-[0.78vw] text-ink/55 mt-[0.1vh]">{item.note}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] left-[-8vw] w-[50vw] h-[50vw] rounded-full opacity-22 blur-[6vw] bg-lavender" />
        <div className="absolute bottom-[-10vh] right-[-6vw] w-[40vw] h-[40vw] rounded-full opacity-20 blur-[6vw] bg-seafoam" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>Tech · Stack</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13vh]">
        <h2 className="font-display font-extrabold text-[3.8vw] leading-[0.96] tracking-[-0.02em]">
          Full-stack. Monorepo. Production-ready.
        </h2>
        <p className="mt-[0.8vh] font-serif italic text-[1.4vw] text-ink/65">React + TypeScript frontend · Node/Express API · PostgreSQL · 4 AI model providers. All in a pnpm workspace.</p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[28vh] bottom-[4vh] grid grid-cols-3 gap-[2vw]">
        <Section title="Frontend" color="text-lavender" items={frontend} />
        <Section title="Backend" color="text-seafoam" items={backend} />
        <Section title="AI layer" color="text-sand" items={ai} />
      </div>
    </div>
  );
}
