import { useState } from "react";
import { Link } from "wouter";
import "./studio.css";

type SubjectKind = "person" | "company" | "deal";
type Subject = {
  id: string;
  kind: SubjectKind;
  icon: string;
  title: string;
  sub: string;
  hot?: boolean;
};

const FOCUS: Subject[] = [
  { id: "khaled", kind: "person",  icon: "👤", title: "Khaled Al-Mansouri", sub: "Aramco · follow-up due", hot: true },
  { id: "enbd",   kind: "company", icon: "🏢", title: "ENBD Holdings",       sub: "Account · 3 stakeholders" },
  { id: "stc",    kind: "deal",    icon: "💼", title: "Q3 Renewal · STC",    sub: "Deal · $480k · 80%" },
  { id: "sara",   kind: "person",  icon: "👤", title: "Sara Othman",         sub: "Mubadala · intro from Tariq" },
  { id: "kpc",    kind: "company", icon: "📞", title: "Kuwait Petroleum",    sub: "Call recording · transcribed" },
];

export default function StudioPage() {
  const [activeId, setActiveId] = useState("khaled");
  const [tab, setTab] = useState<"Overview" | "Timeline" | "Deal" | "Company" | "Files" | "Notes">("Overview");

  return (
    <div className="rd-root">
      {/* NOTE: The previous rd-topstrip ("Studio · all-in-one" + ⌘K + Conductor on)
          duplicated the app's own top nav and used a different sand/cream colour
          palette which clashed visibly with the rest of the CRM. AppShell already
          provides logo + persona + global controls — Studio is rendered inside it,
          so the extra top strip has been removed entirely. Section name is shown
          on the subject header below. */}
      <div className="rd-cols">
        {/* LEFT — focus list */}
        <aside className="rd-col-left">
          <div className="rd-section-label">Today's focus · {FOCUS.length}</div>
          {FOCUS.map((row) => {
            const active = row.id === activeId;
            return (
              <div
                key={row.id}
                className={`rd-focus-row ${active ? "rd-focus-row-active" : ""}`}
                onClick={() => setActiveId(row.id)}
                role="button"
                tabIndex={0}
              >
                <span className="rd-focus-icon">{row.icon}</span>
                <div className="rd-focus-body">
                  <div className="rd-focus-title">{row.title}</div>
                  <div className="rd-focus-sub">{row.sub}</div>
                </div>
                {row.hot && <span className="rd-pill rd-pill-accent">hot</span>}
              </div>
            );
          })}

          <div className="rd-divider" />
          <div className="rd-section-label">Pinned</div>
          <div className="rd-pinned-empty">Drag any subject here ↘</div>
        </aside>

        {/* MIDDLE — active subject */}
        <main className="rd-col-mid">
          <div className="rd-subject-header">
            <div className="rd-avatar-lg">KA</div>
            <div className="rd-subject-id">
              <div className="rd-display rd-subject-name">Khaled Al-Mansouri</div>
              <div className="rd-subject-role">
                VP Procurement · <span className="rd-link-dashed">Saudi Aramco</span> · Dhahran
              </div>
              <div className="rd-subject-pills">
                <span className="rd-pill rd-pill-sage">● warm</span>
                <span className="rd-pill rd-pill-mute">EN · AR</span>
                <span className="rd-pill rd-pill-mute">5 prior calls</span>
              </div>
            </div>
            <div className="rd-subject-actions">
              <button className="rd-btn rd-btn-primary">Call</button>
              <button className="rd-btn">Email</button>
              <button className="rd-btn">Meet</button>
            </div>
          </div>

          <div className="rd-subject-tabs">
            {(["Overview", "Timeline", "Deal", "Company", "Files", "Notes"] as const).map((t) => (
              <button
                key={t}
                className={`rd-subject-tab ${t === tab ? "rd-subject-tab-active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "Deal" ? "Deal · STC Q3" : t === "Company" ? "Company · Aramco" : t === "Files" ? "Files · 4" : t}
              </button>
            ))}
          </div>

          <div className="rd-grid-2">
            <div className="rd-card rd-card-pad">
              <div className="rd-section-label">Person</div>
              <Row k="Email" v="khaled.m@aramco.com" />
              <Row k="Phone" v="+966 13 xxx 4421" />
              <Row k="LinkedIn" v="/in/khaled-mansouri" />
              <Row k="Best to call" v="Sun-Wed · 10am-12pm AST" />
            </div>
            <div className="rd-card rd-card-pad">
              <div className="rd-section-label">Company · Saudi Aramco</div>
              <Row k="Industry" v="Energy · Oil & Gas" />
              <Row k="HQ" v="Dhahran, Saudi Arabia" />
              <Row k="Stakeholders" v="3 contacts in CRM" />
              <Row k="Open deals" v="2 · $1.2M total" />
              <Link href="/companies" className="rd-card-link">Open company workspace →</Link>
            </div>
          </div>

          <div className="rd-card rd-card-pad rd-mb">
            <div className="rd-card-head">
              <div className="rd-section-label">Active deal</div>
              <span className="rd-pill rd-pill-sage">● Negotiation · 80%</span>
            </div>
            <div className="rd-deal-row">
              <div>
                <div className="rd-display rd-deal-title">Q3 Renewal · STC Enterprise</div>
                <div className="rd-deal-meta">Close target · Aug 31 · 24 days</div>
              </div>
              <div className="rd-mono rd-deal-amount">$480,000</div>
            </div>
            <div className="rd-stage-bar">
              {["Lead", "Qual", "Proposal", "Negotiation", "Closed"].map((s, i) => (
                <div key={s} className={`rd-stage ${i <= 3 ? "rd-stage-on" : ""}`} />
              ))}
            </div>
          </div>

          <div className="rd-card rd-card-pad">
            <div className="rd-section-label rd-mb-sm">Recent activity</div>
            {[
              { t: "Call · 22 min",      s: "Discussed Q3 budget cycle, asked for revised SOW",  when: "yesterday", who: "Scribe transcribed" },
              { t: "Email opened ×3",    s: "Renewal proposal v2.pdf · last open 2h ago",         when: "today",     who: "Listener flagged" },
              { t: "LinkedIn post",      s: "Khaled commented on Aramco digital transformation",  when: "2d",        who: "Listener" },
            ].map((x, i, arr) => (
              <div key={i} className={`rd-activity-row ${i ? "rd-activity-row-bordered" : ""} ${i === arr.length - 1 ? "rd-activity-row-last" : ""}`}>
                <div className="rd-activity-dot" />
                <div className="rd-activity-body">
                  <div className="rd-activity-title">{x.t}</div>
                  <div className="rd-activity-sub">{x.s}</div>
                </div>
                <div className="rd-activity-meta">
                  <div className="rd-mono rd-activity-when">{x.when}</div>
                  <div className="rd-activity-who">{x.who}</div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT — Conductor lane */}
        <aside className="rd-col-right">
          <div className="rd-conductor-head">
            <div className="rd-pulse rd-pulse-dot" />
            <div className="rd-conductor-title">Conductor</div>
            <span className="rd-pill rd-pill-mute rd-mono rd-ml-auto">ask first</span>
          </div>

          <div className="rd-card rd-card-pad rd-mb-sm">
            <div className="rd-section-label">Brief on Khaled</div>
            <div className="rd-brief-text">
              Khaled opened your renewal proposal three times this morning — last view was 2h ago, lingering on pricing page 4. He's likely socializing it internally. Last call he asked for a revised SOW; you haven't sent it yet.
            </div>
          </div>

          <div className="rd-section-label">Suggested · 3</div>
          {[
            { who: "Composer",   t: "Draft revised SOW reply",        w: "ready · 6pm send"  },
            { who: "Dispatcher", t: "Block 30 min Sun 11am AST",      w: "calendar held"     },
            { who: "Coach",      t: "Mention CFO sign-off path",      w: "from last call"    },
          ].map((a, i) => (
            <div key={i} className="rd-card rd-card-pad-sm rd-mb-xs">
              <div className="rd-suggest-head">
                <span className="rd-pill rd-pill-sage">{a.who}</span>
                <span className="rd-suggest-when">{a.w}</span>
              </div>
              <div className="rd-suggest-body">{a.t}</div>
              <div className="rd-suggest-actions">
                <button className="rd-btn rd-btn-sm">Skip</button>
                <button className="rd-btn rd-btn-sm rd-btn-primary">Approve</button>
              </div>
            </div>
          ))}

          <div className="rd-divider" />
          <div className="rd-foot-note">
            Conductor only acts when you approve. Set autonomy in <Link href="/account-settings" className="rd-link">Settings → AI Gang</Link>.
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="rd-row">
      <span className="rd-row-k">{k}</span>
      <span className="rd-row-v">{v}</span>
    </div>
  );
}
