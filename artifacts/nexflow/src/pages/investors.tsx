import { useState, useEffect, useMemo } from "react";
import {
  Lock, Download, FileText, AlertCircle, Loader2, ShieldCheck,
  LogOut, ArrowRight, Sparkles, FileSpreadsheet, Presentation,
} from "lucide-react";

/**
 * Private investor data-room landing page.
 *
 * Public-facing route at /investors. Two states:
 *   1. Locked  — branded passcode form
 *   2. Unlocked — list of available investor documents (deck, deep dive,
 *                 feasibility, financial plan) with download links.
 *
 * Audit data (passcode attempts, downloads) is recorded server-side in the
 * `investor_access_log` table. We deliberately do NOT show that log to
 * authenticated visitors here, because the shared passcode is given to
 * multiple investors and surfacing each other's IPs/user-agents would leak
 * audit metadata between them. The founders can read the log directly from
 * the database, or via a future admin-gated route.
 *
 * Colour system: chameleon palette — #B8A0C8 lavender, #88B8B0 sage,
 *                #C8A880 sand, #F8F5F0 cream. Typography: Manrope body,
 *                Cormorant display headings (already in the brand stack).
 */

// ── API helpers (use credentials so the cookie round-trips) ──────────────
async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const url = `${window.location.origin}/api-server/api${path}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let parsed: { message?: string; error?: string } | null = null;
    try {
      parsed = JSON.parse(text) as { message?: string; error?: string };
    } catch {
      /* not json */
    }
    throw new ApiError(
      parsed?.message || parsed?.error || text || `HTTP ${res.status}`,
      res.status,
    );
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

interface InvestorDoc {
  slug: string;
  title: string;
  subtitle: string;
  kind: "pdf" | "pptx" | "md" | "xlsx";
  filename: string;
  bytes: number | null;
}

function fmtBytes(n: number | null): string {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function kindIcon(kind: InvestorDoc["kind"]) {
  switch (kind) {
    case "pptx":
      return Presentation;
    case "xlsx":
      return FileSpreadsheet;
    default:
      return FileText;
  }
}

// ── Branded background ───────────────────────────────────────────────────
function ChameleonBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg,#F8F5F0 0%,#F4ECEC 35%,#EFEAE3 70%,#E8DFD6 100%)",
        }}
      />
      {/* Soft chameleon orbs */}
      <div
        className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(closest-side,#B8A0C8 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-20%] right-[-15%] w-[60vw] h-[60vw] rounded-full opacity-35 blur-3xl"
        style={{ background: "radial-gradient(closest-side,#88B8B0 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-[35%] right-[10%] w-[40vw] h-[40vw] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(closest-side,#C8A880 0%, transparent 70%)" }}
      />
    </div>
  );
}

// ── Locked: passcode form ────────────────────────────────────────────────
function LockedView({ onUnlock }: { onUnlock: () => void }) {
  const [passcode, setPasscode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!passcode.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api("/investors/auth", {
        method: "POST",
        body: JSON.stringify({ passcode }),
      });
      onUnlock();
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      const message = err instanceof Error ? err.message : "";
      if (status === 503) {
        setError(
          message ||
            "The data-room is not yet configured. Please contact the NexFlow team.",
        );
      } else if (status === 401) {
        setError("That passcode is not valid. Please double-check and try again.");
      } else {
        setError("Something went wrong. Please try again in a moment.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div
        className="w-full max-w-md rounded-3xl p-10 backdrop-blur-xl"
        style={{
          background: "rgba(255,255,255,0.65)",
          border: "1px solid rgba(184,160,200,0.35)",
          boxShadow:
            "0 30px 80px rgba(45,30,60,0.18), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background:
                "linear-gradient(135deg, rgba(184,160,200,0.95), rgba(136,184,176,0.95))",
              boxShadow: "0 12px 30px rgba(45,30,60,0.25)",
            }}
          >
            <Lock className="w-7 h-7 text-white" />
          </div>
          <p
            className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-3"
            style={{ color: "#9C3838" }}
          >
            Private · Investor Access
          </p>
          <h1
            className="text-4xl mb-2 leading-tight"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#2D1E3C",
              fontWeight: 600,
            }}
          >
            NexFlow Investor Data Room
          </h1>
          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: "#6B5878", fontFamily: "Manrope, system-ui, sans-serif" }}
          >
            Confidential materials for invited investors only.
            Please enter the passcode shared with you to continue.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode"
            autoFocus
            autoComplete="off"
            className="w-full px-4 py-3 rounded-xl text-sm font-medium tracking-wide outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(45,30,60,0.18)",
              color: "#2D1E3C",
              fontFamily: "Manrope, system-ui, sans-serif",
            }}
            data-testid="input-passcode"
          />

          {error && (
            <div
              className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-[12px]"
              style={{
                background: "rgba(156,56,56,0.1)",
                color: "#9C3838",
                border: "1px solid rgba(156,56,56,0.2)",
              }}
              data-testid="passcode-error"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !passcode.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
            style={{
              background:
                "linear-gradient(90deg, rgba(184,160,200,0.95), rgba(136,184,176,0.95))",
              boxShadow: "0 12px 30px rgba(45,30,60,0.22)",
            }}
            data-testid="button-unlock"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Unlock data room
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div
          className="mt-8 pt-6 flex items-start gap-2 text-[11px] leading-relaxed"
          style={{
            color: "#6B5878",
            fontFamily: "Manrope, system-ui, sans-serif",
            borderTop: "1px solid rgba(45,30,60,0.08)",
          }}
        >
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#88B8B0" }} />
          <span>
            All access attempts are logged. By continuing you agree to keep the
            shared materials confidential.
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Unlocked: documents grid ─────────────────────────────────────────────
function UnlockedView({ onLogout }: { onLogout: () => void }) {
  const [docs, setDocs] = useState<InvestorDoc[] | null>(null);
  const [docsErr, setDocsErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<{ documents: InvestorDoc[] }>("/investors/documents")
      .then((r) => {
        if (!cancelled) setDocs(r.documents);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setDocsErr(e instanceof Error ? e.message : "Failed to load documents");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  async function logout() {
    try {
      await api("/investors/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    onLogout();
  }

  function downloadHref(slug: string): string {
    return `${window.location.origin}/api-server/api/investors/download/${slug}`;
  }

  return (
    <div className="min-h-screen px-6 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-6 mb-12">
          <div>
            <p
              className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-3"
              style={{ color: "#88B8B0" }}
            >
              <ShieldCheck className="w-3 h-3 inline mr-1.5 -mt-0.5" />
              Verified · Investor data room
            </p>
            <h1
              className="text-5xl sm:text-6xl leading-[0.95] mb-4"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "#2D1E3C",
                fontWeight: 600,
              }}
            >
              Welcome to <span style={{ color: "#B8A0C8" }}>NexFlow.</span>
            </h1>
            <p
              className="text-base leading-relaxed max-w-xl"
              style={{
                color: "#6B5878",
                fontFamily: "Manrope, system-ui, sans-serif",
              }}
            >
              Below are the latest investor materials. Click any item to
              download. {today}.
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.65)",
              border: "1px solid rgba(45,30,60,0.12)",
              color: "#2D1E3C",
              fontFamily: "Manrope, system-ui, sans-serif",
            }}
            data-testid="button-logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>

        {/* ── Documents grid ────────────────────────────────────── */}
        {docsErr && (
          <div
            className="rounded-2xl p-4 mb-6 flex items-center gap-2 text-sm"
            style={{
              background: "rgba(156,56,56,0.08)",
              color: "#9C3838",
              border: "1px solid rgba(156,56,56,0.2)",
            }}
          >
            <AlertCircle className="w-4 h-4" />
            {docsErr}
          </div>
        )}

        {!docs && !docsErr && (
          <div className="flex items-center gap-2 text-sm" style={{ color: "#6B5878" }}>
            <Loader2 className="w-4 h-4 animate-spin" /> Loading documents…
          </div>
        )}

        {docs && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
            {docs.map((d) => {
              const Icon = kindIcon(d.kind);
              return (
                <a
                  key={d.slug}
                  href={downloadHref(d.slug)}
                  download={d.filename}
                  className="group rounded-2xl p-5 transition-all hover:scale-[1.015] no-underline"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(45,30,60,0.1)",
                    boxShadow: "0 14px 40px rgba(45,30,60,0.08)",
                  }}
                  data-testid={`doc-${d.slug}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          d.kind === "pptx"
                            ? "linear-gradient(135deg,#C8A880,#B8A0C8)"
                            : "linear-gradient(135deg,#B8A0C8,#88B8B0)",
                        boxShadow: "0 8px 22px rgba(45,30,60,0.18)",
                      }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-[17px] mb-1 leading-tight"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          color: "#2D1E3C",
                          fontWeight: 600,
                        }}
                      >
                        {d.title}
                      </h3>
                      <p
                        className="text-[12.5px] leading-relaxed mb-3"
                        style={{
                          color: "#6B5878",
                          fontFamily: "Manrope, system-ui, sans-serif",
                        }}
                      >
                        {d.subtitle}
                      </p>
                      <div
                        className="flex items-center gap-3 text-[11px] uppercase tracking-wider font-semibold"
                        style={{ color: "#88B8B0" }}
                      >
                        <span>{d.kind.toUpperCase()}</span>
                        <span style={{ color: "rgba(45,30,60,0.25)" }}>·</span>
                        <span>{fmtBytes(d.bytes)}</span>
                        <span className="ml-auto flex items-center gap-1 group-hover:gap-2 transition-all">
                          <Download className="w-3.5 h-3.5" /> Download
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        <p
          className="text-center text-[11px] flex items-center justify-center gap-1.5"
          style={{
            color: "#6B5878",
            fontFamily: "Manrope, system-ui, sans-serif",
          }}
        >
          <Sparkles className="w-3 h-3" style={{ color: "#B8A0C8" }} />
          NexFlow · The universal AI-native CRM for the GCC
        </p>
      </div>
    </div>
  );
}

// ── Top-level page ───────────────────────────────────────────────────────
export default function InvestorsPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    api<{ authenticated: boolean }>("/investors/session")
      .then((r) => setAuthed(r.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  return (
    <>
      <ChameleonBackdrop />
      {authed === null ? (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#B8A0C8" }} />
        </div>
      ) : authed ? (
        <UnlockedView onLogout={() => setAuthed(false)} />
      ) : (
        <LockedView onUnlock={() => setAuthed(true)} />
      )}
    </>
  );
}
