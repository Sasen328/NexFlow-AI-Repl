import "./_group.css";

/**
 * STUDIO — the all-in-one workspace concept.
 * One screen. Pick a subject (person · company · deal) on the left,
 * everything related folds into the middle. AI Conductor lives on the right.
 * Replaces the Person Drawer entirely. No modals, no overlays.
 */
export default function Studio() {
  return (
    <div className="rd-root" style={{ minHeight: "100vh", background: "var(--rd-sand)" }}>
      {/* TOP STRIP */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: "1px solid var(--rd-cream)", background: "var(--rd-sand-2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--rd-accent)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 13 }}>N</div>
          <div className="rd-display" style={{ fontSize: 17 }}>Studio</div>
          <span className="rd-pill" style={{ background: "var(--rd-accent-soft)", color: "var(--rd-accent)" }}>· all-in-one</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="rd-pill rd-mono" style={{ background: "var(--rd-cream-2)", color: "var(--rd-ink-2)" }}>⌘K</div>
          <div className="rd-pill" style={{ background: "var(--rd-sage-soft)", color: "var(--rd-ink-2)" }}>● Conductor on</div>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--rd-cream)" }} />
        </div>
      </div>

      {/* THREE COLUMNS */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 360px", height: "calc(100vh - 56px)" }}>
        {/* LEFT — focus list */}
        <aside style={{ borderRight: "1px solid var(--rd-cream)", background: "var(--rd-sand-2)", padding: "18px 14px", overflowY: "auto" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)", marginBottom: 10 }}>Today's focus · 7</div>
          {[
            { icon: "👤", title: "Khaled Al-Mansouri", sub: "Aramco · follow-up due", hot: true, active: true },
            { icon: "🏢", title: "ENBD Holdings", sub: "Account · 3 stakeholders" },
            { icon: "💼", title: "Q3 Renewal · STC", sub: "Deal · $480k · 80%" },
            { icon: "👤", title: "Sara Othman", sub: "Mubadala · intro from Tariq" },
            { icon: "📞", title: "Kuwait Petroleum", sub: "Call recording · transcribed" },
          ].map((row, i) => (
            <div key={i} style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              padding: "10px 10px",
              borderRadius: 10,
              background: row.active ? "var(--rd-cream-2)" : "transparent",
              border: row.active ? "1px solid var(--rd-cream)" : "1px solid transparent",
              marginBottom: 4,
              cursor: "pointer",
            }}>
              <span style={{ fontSize: 16, marginTop: 1 }}>{row.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--rd-ink)" }}>{row.title}</div>
                <div style={{ fontSize: 11.5, color: "var(--rd-mute)", marginTop: 1 }}>{row.sub}</div>
              </div>
              {row.hot && <span className="rd-pill" style={{ background: "var(--rd-accent-soft)", color: "var(--rd-accent)" }}>hot</span>}
            </div>
          ))}

          <div className="rd-divider" style={{ margin: "16px 0" }} />
          <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)", marginBottom: 10 }}>Pinned</div>
          <div style={{ fontSize: 12.5, color: "var(--rd-mute-2)", padding: "6px 10px" }}>Drag any subject here ↘</div>
        </aside>

        {/* MIDDLE — active subject = Khaled (person) */}
        <main style={{ overflowY: "auto", padding: "26px 32px" }}>
          {/* SUBJECT HEADER */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 22 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--rd-cream-2)", display: "grid", placeItems: "center", fontSize: 22, color: "var(--rd-accent)" }}>KA</div>
            <div style={{ flex: 1 }}>
              <div className="rd-display" style={{ fontSize: 26, lineHeight: 1.1 }}>Khaled Al-Mansouri</div>
              <div style={{ color: "var(--rd-mute)", fontSize: 13.5, marginTop: 4 }}>VP Procurement · <span style={{ color: "var(--rd-ink-2)", borderBottom: "1px dashed var(--rd-mute-2)" }}>Saudi Aramco</span> · Dhahran</div>
              <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
                <span className="rd-pill" style={{ background: "var(--rd-sage-soft)", color: "var(--rd-ink-2)" }}>● warm</span>
                <span className="rd-pill" style={{ background: "var(--rd-cream-2)", color: "var(--rd-ink-2)" }}>EN · AR</span>
                <span className="rd-pill" style={{ background: "var(--rd-cream-2)", color: "var(--rd-ink-2)" }}>5 prior calls</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Call", "Email", "Meet"].map(b => (
                <button key={b} style={{
                  padding: "8px 14px", borderRadius: 9, fontSize: 13,
                  background: b === "Call" ? "var(--rd-ink)" : "var(--rd-card)",
                  color: b === "Call" ? "var(--rd-sand-2)" : "var(--rd-ink)",
                  border: "1px solid var(--rd-cream)", cursor: "pointer",
                }}>{b}</button>
              ))}
            </div>
          </div>

          {/* SUBJECT TABS */}
          <div style={{ display: "flex", gap: 6, marginBottom: 18, borderBottom: "1px solid var(--rd-cream)" }}>
            {["Overview", "Timeline", "Deal · STC Q3", "Company · Aramco", "Files · 4", "Notes"].map((t, i) => (
              <div key={t} style={{
                padding: "10px 14px",
                fontSize: 12.5,
                fontWeight: i === 0 ? 600 : 400,
                color: i === 0 ? "var(--rd-ink)" : "var(--rd-mute)",
                borderBottom: i === 0 ? "2px solid var(--rd-accent)" : "2px solid transparent",
                marginBottom: -1,
                cursor: "pointer",
              }}>{t}</div>
            ))}
          </div>

          {/* OVERVIEW GRID — everything connected */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {/* Person card */}
            <div className="rd-card" style={{ padding: 18 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)", marginBottom: 10 }}>Person</div>
              <Row k="Email" v="khaled.m@aramco.com" />
              <Row k="Phone" v="+966 13 xxx 4421" />
              <Row k="LinkedIn" v="/in/khaled-mansouri" />
              <Row k="Best to call" v="Sun-Wed · 10am-12pm AST" />
            </div>
            {/* Company card */}
            <div className="rd-card" style={{ padding: 18 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)", marginBottom: 10 }}>Company · Saudi Aramco</div>
              <Row k="Industry" v="Energy · Oil & Gas" />
              <Row k="HQ" v="Dhahran, Saudi Arabia" />
              <Row k="Stakeholders" v="3 contacts in CRM" />
              <Row k="Open deals" v="2 · $1.2M total" />
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--rd-accent)", cursor: "pointer" }}>Open company workspace →</div>
            </div>
          </div>

          {/* Active deal */}
          <div className="rd-card" style={{ padding: 18, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)" }}>Active deal</div>
              <span className="rd-pill" style={{ background: "var(--rd-sage-soft)", color: "var(--rd-ink-2)" }}>● Negotiation · 80%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <div>
                <div className="rd-display" style={{ fontSize: 18 }}>Q3 Renewal · STC Enterprise</div>
                <div style={{ color: "var(--rd-mute)", fontSize: 12.5, marginTop: 3 }}>Close target · Aug 31 · 24 days</div>
              </div>
              <div className="rd-mono" style={{ fontSize: 22, color: "var(--rd-ink)" }}>$480,000</div>
            </div>
            {/* mini stage bar */}
            <div style={{ display: "flex", gap: 4 }}>
              {["Lead", "Qual", "Proposal", "Negotiation", "Closed"].map((s, i) => (
                <div key={s} style={{ flex: 1, height: 6, borderRadius: 3, background: i <= 3 ? "var(--rd-accent)" : "var(--rd-cream)" }} />
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="rd-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)", marginBottom: 14 }}>Recent activity</div>
            {[
              { t: "Call · 22 min", s: "Discussed Q3 budget cycle, asked for revised SOW", when: "yesterday", who: "Scribe transcribed" },
              { t: "Email opened ×3", s: "Renewal proposal v2.pdf · last open 2h ago", when: "today", who: "Listener flagged" },
              { t: "Linkedin post", s: "Khaled commented on Aramco digital transformation thread", when: "2d", who: "Listener" },
            ].map((x, i) => (
              <div key={i} style={{ display: "flex", gap: 12, paddingTop: i ? 14 : 0, paddingBottom: i < 2 ? 14 : 0, borderTop: i ? "1px solid var(--rd-cream)" : "none" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--rd-accent)", marginTop: 7 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{x.t}</div>
                  <div style={{ color: "var(--rd-mute)", fontSize: 12.5, marginTop: 2 }}>{x.s}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="rd-mono" style={{ fontSize: 11, color: "var(--rd-mute)" }}>{x.when}</div>
                  <div style={{ fontSize: 11, color: "var(--rd-accent)", marginTop: 2 }}>{x.who}</div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT — Conductor lane */}
        <aside style={{ borderLeft: "1px solid var(--rd-cream)", background: "var(--rd-sand-2)", padding: "20px 18px", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div className="rd-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--rd-accent)" }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>Conductor</div>
            <span className="rd-pill rd-mono" style={{ background: "var(--rd-cream-2)", color: "var(--rd-mute)", marginLeft: "auto" }}>ask first</span>
          </div>

          {/* Brief */}
          <div className="rd-card" style={{ padding: 16, marginBottom: 14, background: "var(--rd-card)" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)", marginBottom: 8 }}>Brief on Khaled</div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: "var(--rd-ink-2)" }}>
              Khaled opened your renewal proposal three times this morning — last view was 2 hours ago, lingering on pricing page 4. He's likely socializing it internally. Last call he asked for a revised SOW; you haven't sent it yet.
            </div>
          </div>

          {/* Suggested actions */}
          <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)", marginBottom: 10 }}>Suggested · 3</div>
          {[
            { who: "Composer", t: "Draft revised SOW reply", w: "ready · 6pm send" },
            { who: "Dispatcher", t: "Block 30 min Sun 11am AST", w: "calendar held" },
            { who: "Coach", t: "Mention CFO sign-off path", w: "from last call" },
          ].map((a, i) => (
            <div key={i} className="rd-card" style={{ padding: 12, marginBottom: 8, background: "var(--rd-card)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span className="rd-pill" style={{ background: "var(--rd-sage-soft)", color: "var(--rd-ink-2)" }}>{a.who}</span>
                <span style={{ fontSize: 11, color: "var(--rd-mute)" }}>{a.w}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--rd-ink)", marginBottom: 8 }}>{a.t}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ flex: 1, padding: "6px", fontSize: 12, borderRadius: 7, border: "1px solid var(--rd-cream)", background: "var(--rd-card)", cursor: "pointer" }}>Skip</button>
                <button style={{ flex: 1, padding: "6px", fontSize: 12, borderRadius: 7, border: "none", background: "var(--rd-ink)", color: "var(--rd-sand-2)", cursor: "pointer" }}>Approve</button>
              </div>
            </div>
          ))}

          <div className="rd-divider" style={{ margin: "16px 0" }} />
          <div style={{ fontSize: 11, color: "var(--rd-mute)", lineHeight: 1.5 }}>
            Conductor only acts when you approve. Set autonomy in Settings → AI Gang.
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12.5 }}>
      <span style={{ color: "var(--rd-mute)" }}>{k}</span>
      <span style={{ color: "var(--rd-ink-2)" }}>{v}</span>
    </div>
  );
}
