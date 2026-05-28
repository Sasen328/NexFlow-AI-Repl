import { useState } from "react";

type Asset = {
  file: string;
  title: string;
  description: string;
  size: string;
  format: "PNG" | "JPG" | "GIF" | "WebP" | "MP4" | "SVG";
  preview: "hero" | "icon" | "wordmark" | "video";
  bg?: "light" | "dark" | "checker";
};

const ASSETS: Asset[] = [
  {
    file: "NexFlow_Hero_Logo_Animated.gif",
    title: "Animated Hero Logo · GIF",
    description: "Full-width animated mark with the soft pulsing wash. Universally compatible — works in Slack, email, social posts, decks.",
    size: "5.2 MB · 1200 × 338",
    format: "GIF",
    preview: "hero",
  },
  {
    file: "NexFlow_Hero_Logo_Animated.webp",
    title: "Animated Hero Logo · WebP",
    description: "Same animation as the GIF but ~40× smaller. Best for embedding on websites and modern email clients.",
    size: "136 KB · 1600 × 450",
    format: "WebP",
    preview: "hero",
  },
  {
    file: "NexFlow_Hero_Logo_Animated.mp4",
    title: "Animated Hero Logo · MP4",
    description: "Full HD broadcast-quality video for pitch decks, video editors, and motion-graphics workflows.",
    size: "364 KB · 1920 × 540",
    format: "MP4",
    preview: "video",
  },
  {
    file: "NexFlow_Hero_Logo.png",
    title: "Hero Logo · Static PNG",
    description: "Single-frame still of the animated hero — for slides, print, or anywhere a still is needed.",
    size: "162 KB · 1920 × 540",
    format: "PNG",
    preview: "hero",
  },
  {
    file: "NexFlow_Logo_Full.png",
    title: "Full Wordmark · Transparent",
    description: "The complete NexFlow brand lockup (mark + wordmark) on a transparent background.",
    size: "286 KB · 3200 × 1800",
    format: "PNG",
    preview: "wordmark",
    bg: "checker",
  },
  {
    file: "NexFlow_Logo_White_BG.jpg",
    title: "Full Wordmark · White Background",
    description: "Full lockup on a white background — drop straight into documents, email signatures, and print.",
    size: "252 KB · 3200 × 1800",
    format: "JPG",
    preview: "wordmark",
    bg: "light",
  },
  {
    file: "NexFlow_Icon_2048.png",
    title: "App Icon · 2048 px",
    description: "Maximum-resolution diamond icon for high-DPI displays, print, and large-format design work.",
    size: "331 KB · 2048 × 2048",
    format: "PNG",
    preview: "icon",
    bg: "checker",
  },
  {
    file: "NexFlow_Icon_1024.png",
    title: "App Icon · 1024 px",
    description: "Standard app store icon size. Use for iOS / Android submissions and marketing visuals.",
    size: "118 KB · 1024 × 1024",
    format: "PNG",
    preview: "icon",
    bg: "checker",
  },
  {
    file: "NexFlow_Icon_512.png",
    title: "App Icon · 512 px",
    description: "Web favicon, social profile pictures, and PWA icons.",
    size: "42 KB · 512 × 512",
    format: "PNG",
    preview: "icon",
    bg: "checker",
  },
  {
    file: "NexFlow_Icon_64.png",
    title: "Favicon · 64 px",
    description: "Tiny crisp icon for browser tabs, email signatures, and inline UI use.",
    size: "3 KB · 64 × 64",
    format: "PNG",
    preview: "icon",
    bg: "checker",
  },
  {
    file: "NexFlow_Mark.svg",
    title: "Brand Mark · SVG (Vector)",
    description: "Infinitely scalable vector source of the diamond mark — preferred for web and any further design work.",
    size: "~ 2 KB · vector",
    format: "SVG",
    preview: "icon",
    bg: "checker",
  },
];

const FORMAT_BADGES: Record<Asset["format"], string> = {
  PNG: "from-[#B8A0C8] to-[#88B8B0]",
  JPG: "from-[#C8A880] to-[#B8B880]",
  GIF: "from-[#C0A0B8] to-[#B8A0C8]",
  WebP: "from-[#88B8B0] to-[#B8B880]",
  MP4: "from-[#B8A0C8] to-[#C0A0B8]",
  SVG: "from-[#B8B880] to-[#88B8B0]",
};

const COLOR_PALETTE = [
  { name: "Lavender", hex: "#B8A0C8", role: "Primary" },
  { name: "Teal",     hex: "#88B8B0", role: "Secondary" },
  { name: "Mauve",    hex: "#C0A0B8", role: "Accent" },
  { name: "Gold",     hex: "#C8A880", role: "Accent" },
  { name: "Olive",    hex: "#B8B880", role: "Accent" },
  { name: "Ink",      hex: "#1F1B2E", role: "Text" },
];

export default function Brand() {
  const [copied, setCopied] = useState<string | null>(null);

  function copyHex(hex: string) {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(hex);
      setTimeout(() => setCopied(null), 1400);
    });
  }

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FBF7FF] via-white to-[#F4FBF9]" />
          <div className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full bg-[#B8A0C8] opacity-20 blur-3xl" />
          <div className="absolute -top-20 -right-32 w-[560px] h-[560px] rounded-full bg-[#88B8B0] opacity-20 blur-3xl" />
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-[#C8A880] opacity-15 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur border border-[#B8A0C8]/30 text-xs font-semibold tracking-[0.18em] text-[#5A4A6E] uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#88B8B0]" />
            NexFlow Press Kit
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#1F1B2E] leading-tight mb-4">
            Brand &amp; Logo Kit
          </h1>
          <p className="text-lg text-[#5A4A6E] max-w-2xl mx-auto">
            Everything you need to talk about NexFlow — animated and static logos, app icons,
            and the official color system. Download what you need, no sign-in required.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="/logos/NexFlow_Hero_Logo_Animated.webp"
              download
              className="px-5 py-2.5 rounded-full text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
              style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}
            >
              Download animated logo
            </a>
            <a
              href="/logos/NexFlow_Logo_Full.png"
              download
              className="px-5 py-2.5 rounded-full bg-white text-[#1F1B2E] text-sm font-semibold border border-[#B8A0C8]/40 hover:border-[#B8A0C8] transition-colors"
            >
              Download full wordmark
            </a>
            <a
              href="/logos/NexFlow_Icon_1024.png"
              download
              className="px-5 py-2.5 rounded-full bg-white text-[#1F1B2E] text-sm font-semibold border border-[#88B8B0]/40 hover:border-[#88B8B0] transition-colors"
            >
              Download app icon
            </a>
          </div>
        </div>

        {/* live animated logo preview */}
        <div className="max-w-6xl mx-auto px-6 pb-16">
          <div className="rounded-3xl overflow-hidden border border-[#B8A0C8]/20 shadow-xl bg-white">
            <img
              src="/logos/NexFlow_Hero_Logo_Animated.webp"
              alt="NexFlow animated logo"
              className="w-full block"
            />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Above: live preview of the animated hero logo (WebP). Right-click any download below to save.
          </p>
        </div>
      </section>

      {/* DOWNLOADS GRID */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-2">
          <div>
            <h2 className="text-3xl font-bold text-[#1F1B2E]">Logo files</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Click any card to download. All assets are royalty-free for press, partner, and investor use.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{ASSETS.length} files · ~7 MB total</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ASSETS.map((a) => (
            <AssetCard key={a.file} asset={a} />
          ))}
        </div>
      </section>

      {/* COLOR SYSTEM */}
      <section className="border-t border-border/40 bg-gradient-to-b from-white to-[#FBF7FF]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-[#1F1B2E] mb-2">Color system</h2>
          <p className="text-sm text-muted-foreground mb-8">
            The NexFlow palette — calm, dawn-toned, and built for long workdays. Tap any swatch to copy its hex.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.hex}
                onClick={() => copyHex(c.hex)}
                className="group text-left rounded-2xl overflow-hidden border border-border/40 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="h-24 w-full relative"
                  style={{ backgroundColor: c.hex }}
                >
                  {copied === c.hex && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold bg-black/20">
                      Copied!
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-[#1F1B2E]">{c.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{c.hex}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{c.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* USAGE GUIDELINES */}
      <section className="border-t border-border/40">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-[#1F1B2E] mb-8">Usage guidelines</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <GuidelineCard
              ok
              title="Do"
              items={[
                "Use the animated WebP for product pages and modern email.",
                "Keep at least 24 px clear space around the diamond on all sides.",
                "Pair the logo with calm, dawn-tone backgrounds (off-white, lavender, teal).",
                "Use the SVG mark whenever vector is supported.",
              ]}
            />
            <GuidelineCard
              title="Don't"
              items={[
                "Don't recolor the diamond — the gradient is part of the mark.",
                "Don't stretch, skew, or rotate the logo.",
                "Don't place the logo on busy photos without a soft white wash behind it.",
                "Don't use the static PNG when an animation is supported — animation tells our story.",
              ]}
            />
          </div>

          <div className="mt-10 rounded-2xl border border-[#B8A0C8]/30 bg-white p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#1F1B2E]">Need something we don't have?</div>
              <div className="text-xs text-muted-foreground mt-1">
                Custom sizes, founder photos, or partner co-branding — we'll send them within one business day.
              </div>
            </div>
            <a
              href="mailto:press@nexflow.sa"
              className="px-4 py-2 rounded-full text-white text-sm font-semibold shadow"
              style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}
            >
              press@nexflow.sa
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function AssetCard({ asset }: { asset: Asset }) {
  const bgClass =
    asset.bg === "dark"    ? "bg-[#1F1B2E]" :
    asset.bg === "checker" ? "bg-[conic-gradient(at_50%_50%,_#F4F1F8_0_25%,_#FFFFFF_0_50%,_#F4F1F8_0_75%,_#FFFFFF_0)] [background-size:24px_24px]" :
                             "bg-white";

  const previewSrc = `/logos/${asset.file}`;

  return (
    <div className="group rounded-2xl overflow-hidden border border-border/40 bg-white shadow-sm hover:shadow-lg hover:border-[#B8A0C8]/40 transition-all">
      <div className={`relative h-44 flex items-center justify-center overflow-hidden ${bgClass}`}>
        <span
          className={`absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r ${FORMAT_BADGES[asset.format]} shadow`}
        >
          {asset.format}
        </span>

        {asset.preview === "video" ? (
          <video
            src={previewSrc}
            autoPlay
            loop
            muted
            playsInline
            className="max-h-full max-w-full"
          />
        ) : asset.preview === "hero" ? (
          <img src={previewSrc} alt={asset.title} className="max-h-full max-w-full" />
        ) : asset.preview === "wordmark" ? (
          <img src={previewSrc} alt={asset.title} className="max-h-32 max-w-[85%] object-contain" />
        ) : (
          <img src={previewSrc} alt={asset.title} className="max-h-28 max-w-28 object-contain" />
        )}
      </div>

      <div className="p-4">
        <div className="text-sm font-semibold text-[#1F1B2E]">{asset.title}</div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{asset.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground font-mono">{asset.size}</span>
          <a
            href={previewSrc}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow group-hover:shadow-md transition-shadow"
            style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}
          >
            Download
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

function GuidelineCard({
  title,
  items,
  ok = false,
}: {
  title: string;
  items: string[];
  ok?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-6 ${ok ? "border-[#88B8B0]/40 bg-[#F4FBF9]" : "border-[#C0A0B8]/40 bg-[#FBF7FF]"}`}>
      <div className="flex items-center gap-2 mb-4">
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ background: ok ? "#88B8B0" : "#C0A0B8" }}
        >
          {ok ? "✓" : "✕"}
        </span>
        <h3 className="text-lg font-bold text-[#1F1B2E]">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="text-sm text-[#3F3656] leading-relaxed flex gap-2">
            <span className="text-[#B8A0C8] mt-0.5">•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
