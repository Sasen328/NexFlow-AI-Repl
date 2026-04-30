import "./_group.css";

/**
 * COMPANY — the missing Companies tab detail view.
 * Same calm aesthetic. One company = a workspace with stakeholders,
 * deals, signals, and Conductor brief.
 */
export default function Company() {
  return (
    <div className="rd-root" style={{ minHeight: "100vh", background: "var(--rd-sand)", padding: "32px 44px" }}>
      {/* breadcrumb */}
      <div style={{ fontSize: 12, color: "var(--rd-mute)", marginBottom: 18 }}>
        <span style={{ cursor: "pointer" }}>CRM</span> · <span style={{ cursor: "pointer" }}>Companies</span> · <span style={{ color: "var(--rd-ink)" }}>Saudi Aramco</span>
      </div>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 22, marginBottom: 28 }}>
        <div style={{ width: 84, height: 84, borderRadius: 18, background: "var(--rd-cream-2)", display: "grid", placeItems: "center", fontSize: 26, color: "var(--rd-accent)", fontWeight: 600 }}>SA</div>
        <div style={{ flex: 1 }}>
          <div className="rd-display" style={{ fontSize: 32, lineHeight: 1.05 }}>Saudi Aramco</div>
          <div style={{ color: "var(--rd-mute)", fontSize: 14, marginTop: 6 }}>Energy · Oil &amp; Gas · Dhahran, Saudi Arabia · 70,000+ employees</div>
          <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
            <span className="rd-pill" style={{ background: "var(--rd-sage-soft)", color: "var(--rd-ink-2)" }}>● tier 1 account</span>
            <span className="rd-pill" style={{ background: "var(--rd-accent-soft)", color: "var(--rd-accent)" }}>strategic</span>
            <span className="rd-pill" style={{ background: "var(--rd-cream-2)", color: "var(--rd-ink-2)" }}>3 deals open</span>
            <span className="rd-pill" style={{ background: "var(--rd-cream-2)", color: "var(--rd-ink-2)" }}>aramco.com</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "9px 14px", borderRadius: 9, fontSize: 13, background: "var(--rd-card)", color: "var(--rd-ink)", border: "1px solid var(--rd-cream)", cursor: "pointer" }}>360° AI</button>
          <button style={{ padding: "9px 14px", borderRadius: 9, fontSize: 13, background: "var(--rd-ink)", color: "var(--rd-sand-2)", border: "none", cursor: "pointer" }}>Open in Studio</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 6, marginBottom: 22, borderBottom: "1px solid var(--rd-cream)" }}>
        {["Overview", "Stakeholders · 3", "Deals · 3", "Signals · 5", "Files · 8", "Notes"].map((t, i) => (
          <div key={t} style={{
            padding: "11px 16px",
            fontSize: 13,
            fontWeight: i === 0 ? 600 : 400,
            color: i === 0 ? "var(--rd-ink)" : "var(--rd-mute)",
            borderBottom: i === 0 ? "2px solid var(--rd-accent)" : "2px solid transparent",
            marginBottom: -1,
            cursor: "pointer",
          }}>{t}</div>
        ))}
      </div>

      {/* CONDUCTOR BRIEF */}
      <div className="rd-card" style={{ padding: 20, marginBottom: 22, background: "var(--rd-card)", borderLeft: "3px solid var(--rd-accent)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div className="rd-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--rd-accent)" }} />
          <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)" }}>Conductor brief</div>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--rd-ink-2)" }}>
          Aramco is in active renewal mode across two of your deals. Khaled (VP Procurement) is the warm path — he's been opening the proposal. Sara on the IT side has gone quiet for 11 days; suggest re-engagement. Tariq introduced you originally and is still your sponsor.
        </div>
      </div>

      {/* GRID — three columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 1fr", gap: 16 }}>
        {/* Stakeholders */}
        <div className="rd-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)" }}>Stakeholders · 3</div>
            <span style={{ fontSize: 12, color: "var(--rd-accent)", cursor: "pointer" }}>+ add</span>
          </div>
          {[
            { name: "Khaled Al-Mansouri", role: "VP Procurement", state: "warm", color: "var(--rd-sage-soft)" },
            { name: "Sara Othman", role: "IT Director", state: "cold · 11d", color: "var(--rd-cream-2)" },
            { name: "Tariq Bin Saud", role: "CTO · sponsor", state: "champion", color: "var(--rd-accent-soft)" },
          ].map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, paddingTop: i ? 12 : 0, paddingBottom: i < 2 ? 12 : 0, borderTop: i ? "1px solid var(--rd-cream)" : "none", cursor: "pointer" }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--rd-cream-2)", display: "grid", placeItems: "center", fontSize: 11.5, color: "var(--rd-accent)", fontWeight: 600 }}>
                {p.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--rd-mute)" }}>{p.role}</div>
              </div>
              <span className="rd-pill" style={{ background: p.color, color: "var(--rd-ink-2)" }}>{p.state}</span>
            </div>
          ))}
        </div>

        {/* Deals */}
        <div className="rd-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)", marginBottom: 14 }}>Open deals · $1.2M</div>
          {[
            { name: "Q3 Renewal · STC bundle", amount: "$480k", stage: "Negotiation", pct: 80 },
            { name: "Refinery Analytics POC", amount: "$240k", stage: "Proposal", pct: 50 },
            { name: "Field-ops mobile rollout", amount: "$520k", stage: "Discovery", pct: 25 },
          ].map((d, i) => (
            <div key={i} style={{ paddingTop: i ? 14 : 0, paddingBottom: i < 2 ? 14 : 0, borderTop: i ? "1px solid var(--rd-cream)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div>
                <div className="rd-mono" style={{ fontSize: 13.5, color: "var(--rd-ink)" }}>{d.amount}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11.5, color: "var(--rd-mute)" }}>{d.stage}</span>
                <span className="rd-mono" style={{ fontSize: 11.5, color: "var(--rd-mute)" }}>{d.pct}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "var(--rd-cream)", overflow: "hidden" }}>
                <div style={{ width: `${d.pct}%`, height: "100%", background: "var(--rd-accent)" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Signals */}
        <div className="rd-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)", marginBottom: 14 }}>Live signals · 5</div>
          {[
            { t: "New CFO announced", w: "1d", hot: true },
            { t: "Hiring 12 IT roles", w: "3d" },
            { t: "Q2 earnings beat", w: "1w" },
            { t: "Tech stack: Snowflake added", w: "2w" },
            { t: "Press: Saudi Vision 2030 RFP", w: "3w" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, paddingTop: i ? 10 : 0, paddingBottom: i < 4 ? 10 : 0, borderTop: i ? "1px solid var(--rd-cream)" : "none" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: s.hot ? "var(--rd-accent)" : "var(--rd-mute-2)", marginTop: 7 }} />
              <div style={{ flex: 1, fontSize: 12.5, color: "var(--rd-ink-2)" }}>{s.t}</div>
              <div className="rd-mono" style={{ fontSize: 11, color: "var(--rd-mute)" }}>{s.w}</div>
            </div>
          ))}
        </div>
      </div>

      {/* COMPANY FACTS strip */}
      <div className="rd-card" style={{ padding: 20, marginTop: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rd-mute)", marginBottom: 14 }}>Facts · enriched by Conductor</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          <Fact k="Revenue" v="$604B" sub="2024 reported" />
          <Fact k="Founded" v="1933" sub="Dhahran, KSA" />
          <Fact k="Stack" v="SAP · Oracle · Snowflake" sub="3 of 12 known" />
          <Fact k="Last touch" v="2 days ago" sub="call · Khaled" />
        </div>
      </div>
    </div>
  );
}

function Fact({ k, v, sub }: { k: string; v: string; sub: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--rd-mute)", marginBottom: 4 }}>{k}</div>
      <div className="rd-display" style={{ fontSize: 18, color: "var(--rd-ink)" }}>{v}</div>
      <div style={{ fontSize: 11, color: "var(--rd-mute)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}
