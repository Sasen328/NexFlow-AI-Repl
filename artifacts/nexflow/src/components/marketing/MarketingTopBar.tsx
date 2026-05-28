import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, LogIn, UserPlus, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { NexFlowWordmark } from "@/components/layout/NexFlowLogo";
import { useTheme } from "@/hooks/useTheme";

const TABS = [
  { key: "home",    label: "Home",            href: "/welcome" },
  { key: "about",   label: "What is QPulse",  href: "/about" },
  { key: "pricing", label: "Pricing Plan",    href: "/pricing" },
  { key: "brand",   label: "Brand Kit",       href: "/brand" },
];

export function MarketingTopBar() {
  const [location] = useLocation();
  const [getStartedOpen, setGetStartedOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { dark, toggle } = useTheme();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setGetStartedOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setGetStartedOpen(false);
  }, [location]);

  function isActive(href: string) {
    if (href === "/welcome") return location === "/welcome" || location === "/";
    return location === href || location.startsWith(href + "/");
  }
  const getStartedActive = location === "/signin" || location === "/signup";

  return (
    <header
      ref={wrapRef}
      className="sticky top-0 z-40 glass-panel border-b border-border/30 backdrop-blur-xl"
    >
      <div className="flex items-center h-14 px-4 sm:px-6 max-w-[1600px] mx-auto w-full gap-3">
        <Link href="/welcome">
          <div className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-muted/40 transition-colors">
            <NexFlowWordmark height={28} />
          </div>
        </Link>

        <nav className="flex items-center gap-1 flex-1 ml-4 flex-wrap" aria-label="Marketing">
          {TABS.map((t) => (
            <Link key={t.key} href={t.href}>
              <button
                type="button"
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all",
                  isActive(t.href)
                    ? "text-white shadow-sm"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/40",
                )}
                style={isActive(t.href) ? { background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" } : undefined}
              >
                {t.label}
              </button>
            </Link>
          ))}

          {/* Get Started — dropdown with Sign In / Sign Up */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setGetStartedOpen((v) => !v);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all",
                getStartedActive
                  ? "text-white shadow-sm"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted/40",
              )}
              style={getStartedActive ? { background: "linear-gradient(135deg,#C8A880,#B8A0C8)" } : undefined}
              aria-haspopup="true"
              aria-expanded={getStartedOpen}
            >
              Get Started
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", getStartedOpen && "rotate-180")} />
            </button>
            {getStartedOpen && (
              <div className="absolute top-full right-0 mt-1 z-50 glass-card rounded-xl border border-border/40 shadow-xl py-2 w-52">
                <Link href="/signin">
                  <div
                    className="flex items-center gap-2.5 px-3 py-2 mx-1 rounded-md cursor-pointer hover:bg-muted/40"
                    onClick={() => setGetStartedOpen(false)}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#88B8B025" }}>
                      <LogIn className="w-3.5 h-3.5" style={{ color: "#88B8B0" }} />
                    </div>
                    <div className="text-sm font-semibold">Sign In</div>
                  </div>
                </Link>
                <Link href="/signup">
                  <div
                    className="flex items-center gap-2.5 px-3 py-2 mx-1 rounded-md cursor-pointer hover:bg-muted/40"
                    onClick={() => setGetStartedOpen(false)}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#C8A88025" }}>
                      <UserPlus className="w-3.5 h-3.5" style={{ color: "#C8A880" }} />
                    </div>
                    <div className="text-sm font-semibold">Sign Up</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Dark / Light toggle */}
        <button
          type="button"
          onClick={toggle}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="ml-2 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
