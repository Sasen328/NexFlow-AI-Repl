import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "s00", num: "00", label: "Index" },
  { id: "s01", num: "01", label: "Company & Mission" },
  { id: "s02", num: "02", label: "The Problem" },
  { id: "s03", num: "03", label: "Platform Architecture" },
  { id: "s04", num: "04", label: "CRM Engine" },
  { id: "s05", num: "05", label: "Call Center Engine" },
  { id: "s06", num: "06", label: "Enrichment Engine" },
  { id: "s07", num: "07", label: "Marketing Engine" },
  { id: "s08", num: "08", label: "Competitive Analysis" },
  { id: "s09", num: "09", label: "Role Journeys" },
  { id: "s10", num: "10", label: "Pricing" },
  { id: "s11", num: "11", label: "Market & Traction" },
  { id: "s12", num: "12", label: "Local Dev Setup" },
];

function SectionHeader({ num, title, subtitle }: { num: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-8 pb-6 border-b border-gray-200">
      <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">{num}</div>
      <h2 className="text-3xl font-black text-gray-900 tracking-tight">{title}</h2>
      {subtitle && <p className="mt-2 text-lg text-gray-500 font-light">{subtitle}</p>}
    </div>
  );
}

function Tag({ children, color = "gray" }: { children: React.ReactNode; color?: string }) {
  const colorMap: Record<string, string> = {
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
    purple: "bg-purple-100 text-purple-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${colorMap[color] ?? colorMap.gray}`}>
      {children}
    </span>
  );
}

function FeatureRow({ name, nf, sf, hs, zo, pd }: { name: string; nf: string; sf: string; hs: string; zo: string; pd: string }) {
  return (
    <tr className="border-t border-gray-100">
      <td className="py-2.5 pr-4 text-sm font-medium text-gray-800">{name}</td>
      <td className="py-2.5 px-3 text-sm font-semibold text-emerald-600 text-center">{nf}</td>
      <td className="py-2.5 px-3 text-sm text-gray-400 text-center">{sf}</td>
      <td className="py-2.5 px-3 text-sm text-gray-400 text-center">{hs}</td>
      <td className="py-2.5 px-3 text-sm text-gray-400 text-center">{zo}</td>
      <td className="py-2.5 px-3 text-sm text-gray-400 text-center">{pd}</td>
    </tr>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-28 text-sm text-gray-600 text-right flex-shrink-0">{label}</div>
      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <div className="w-10 text-sm font-bold text-gray-700 text-right flex-shrink-0">{value}%</div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-gray-900 text-green-400 text-xs rounded-lg p-4 overflow-x-auto leading-relaxed my-3">
      <code>{children}</code>
    </pre>
  );
}

function ScreenMock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm my-4">
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <span className="ml-3 text-gray-400 text-xs font-mono">{title}</span>
      </div>
      <div className="bg-slate-50 p-4">{children}</div>
    </div>
  );
}

export default function OverviewPage() {
  const [active, setActive] = useState("s00");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rotate-45 bg-emerald-500 rounded" />
          <span className="font-black text-lg tracking-tight">NexFlow</span>
          <span className="text-gray-400 text-sm ml-2">Master Product Document · 13 sections</span>
        </div>
        <Tag color="green">v2.0 · May 2026</Tag>
      </div>

      <div className="max-w-7xl mx-auto flex gap-0">
        <aside className="w-56 flex-shrink-0 sticky top-12 h-screen overflow-y-auto py-8 pr-4 pl-6 border-r border-gray-100">
          <nav className="space-y-1">
            {SECTIONS.map(({ id, num, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active === id ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span className="font-mono text-xs text-gray-400 w-6 flex-shrink-0">{num}</span>
                <span className="leading-tight">{label}</span>
              </a>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 px-10 py-10 max-w-4xl">

          {/* ── 00 INDEX ─────────────────────────────────────────── */}
          <section id="s00" className="mb-20">
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">00</div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">NexFlow — Master Product Document</h1>
              <p className="mt-3 text-lg text-gray-500">Universal AI-native B2B CRM for GCC markets. Three engines, one platform, one bill.</p>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Platform", value: "CRM + Call Center + Enrichment" },
                { label: "Market", value: "GCC — Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman" },
                { label: "AI Engines", value: "16-agent person intel · 6 Arabic voice agents · Cultural AI" },
                { label: "Languages", value: "Arabic (4 dialects) + English · RTL native" },
                { label: "Pricing", value: "SAR-denominated · per-seat · all-inclusive" },
                { label: "Compliance", value: "KSA PDPL · call redaction · in-Kingdom data residency" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</div>
                  <div className="text-sm font-medium text-gray-800">{value}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SECTIONS.slice(1).map(({ id, num, label }) => (
                <a key={id} href={`#${id}`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors group">
                  <span className="font-mono text-sm text-gray-400 w-7">{num}</span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">{label}</span>
                  <span className="ml-auto text-gray-300 group-hover:text-emerald-400">→</span>
                </a>
              ))}
            </div>
          </section>

          {/* ── 01 COMPANY ───────────────────────────────────────── */}
          <section id="s01" className="mb-20">
            <SectionHeader num="01" title="Company & Mission" subtitle="Who we are and why we built this" />
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">NexFlow is an AI-native B2B CRM built from the ground up for GCC markets. While global CRMs translate their interfaces, NexFlow is Arabic at the schema level — Gulf naming conventions, Hijri calendar, Saudi IBAN, Iqama numbers, and the GCC business rhythm are built into the data model, not added as a cosmetic layer.</p>
              <p className="text-gray-700 leading-relaxed mt-4">The platform ships three integrated engines under one plan: a full CRM, a call center with AI voice agents, and a GCC-first enrichment suite. No competitor ships all three natively for the Arabic-speaking market.</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-5">
              {[
                { title: "Mission", body: "Make GCC sales teams as productive as the world's best — without asking them to use tools built for someone else." },
                { title: "Mandate", body: "Every feature ships Arabic-first, GCC-aware, and AI-native. No features are bolted on; intelligence is baked into every record, call, and campaign." },
                { title: "Home market", body: "Saudi Arabia — the GCC's largest B2B market, driven by Vision 2030 transformation. Regional expansion to UAE, Qatar, Kuwait, Bahrain, and Oman." },
                { title: "Five personas", body: "Sales Rep (Khalid), Head of Sales (Layla), CEO (Faisal), CRM Ops (Sara), Head of Marketing (Reem). The platform adapts its AI briefing and KPI tiles to each role on login." },
              ].map(({ title, body }) => (
                <div key={title} className="bg-gray-50 rounded-xl p-5">
                  <div className="font-bold text-gray-900 mb-2">{title}</div>
                  <div className="text-sm text-gray-600 leading-relaxed">{body}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 02 PROBLEM ───────────────────────────────────────── */}
          <section id="s02" className="mb-20">
            <SectionHeader num="02" title="The Problem" subtitle="Why existing CRMs fail GCC sales teams" />
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { tag: "Salesforce", color: "rose" as const, pain: "3 products, 3 bills, 3 data models. Einstein Agentforce is English-only and $2/conversation extra. No Saudi CR lookup. No post-call WhatsApp automation. $800+/user/year fully loaded." },
                { tag: "HubSpot", color: "amber" as const, pain: "WhatsApp requires a third-party integration. Enrichment reads Clearbit (US-centric). Zero GCC cultural calendar. Power Dialer is Enterprise-only. No Arabic AI voice agents at any tier." },
                { tag: "Zoho", color: "purple" as const, pain: "50+ disconnected apps. Zia AI has never made an autonomous call in Khaleeji Arabic, never drafted a post-call WhatsApp, and reads none of the GCC signal sources (Wamda, MoCI, Argaam)." },
                { tag: "Pipedrive / Freshworks", color: "gray" as const, pain: "Pipeline tools built for Western SaaS. No Arabic, no WhatsApp native, no cultural calendar, no enrichment engine, no voice agents. Not designed for GCC enterprise sales motion." },
              ].map(({ tag, color, pain }) => (
                <div key={tag} className="rounded-xl border border-gray-200 p-5">
                  <Tag color={color}>{tag}</Tag>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{pain}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 text-white rounded-xl p-6">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-3">The gap NexFlow fills</div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {[
                  { n: "0", label: "global CRMs with Arabic AI Voice Agents in Khaleeji dialect" },
                  { n: "0", label: "global CRMs with Saudi Commercial Registry lookup built in" },
                  { n: "0", label: "global CRMs that auto-draft post-call WhatsApp in Arabic" },
                ].map(({ n, label }) => (
                  <div key={label}>
                    <div className="text-4xl font-black text-emerald-400 mb-1">{n}</div>
                    <div className="text-gray-300 text-xs leading-snug">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── 03 PLATFORM ─────────────────────────────────────── */}
          <section id="s03" className="mb-20">
            <SectionHeader num="03" title="Platform Architecture" subtitle="Three engines. One schema. Zero integration tax." />
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { name: "CRM Engine", color: "bg-blue-500", features: ["Pipeline + Deal Kanban", "ICP Rules Engine", "Lead Scoring + Intent", "Health Scores", "AI Forecasting", "Predictive Analytics", "Forgotten Leads", "Quote-to-Cash (Tap/Mada)"] },
                { name: "Call Center Engine", color: "bg-emerald-500", features: ["Power Dialer (3 modes)", "6 Arabic AI Voice Agents", "LiveCoachPanel (live)", "Post-Call Automation", "Conversation Intelligence", "Call Recording + Redaction", "WhatsApp Native Inbox", "AI Playbooks"] },
                { name: "Enrichment Engine", color: "bg-purple-500", features: ["Prospecting (15 signal types)", "GCC Buying Signals", "Saudi CR (Masaar engine)", "16-agent Person Intel", "Business Card Scanner", "Bulk List Upload + Dedup", "Company Intel (45s)", "Lead Finder (10 agents)"] },
              ].map(({ name, color, features }) => (
                <div key={name} className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className={`${color} px-4 py-3`}>
                    <div className="font-bold text-white">{name}</div>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {features.map((f) => (
                      <li key={f} className="px-4 py-2 text-sm text-gray-700 flex items-center gap-2">
                        <span className="text-emerald-500 text-xs">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <div className="font-bold text-emerald-800 mb-3">GCC Intelligence Layer — exclusive to NexFlow</div>
              <div className="grid grid-cols-2 gap-3 text-sm text-emerald-900">
                {[
                  "Cultural Calendar (Ramadan GOLD window, Eid blackouts, Fri–Sat weekend, prayer schedule)",
                  "Saudi Commercial Registry real-time lookup (CR number, legal name, directors)",
                  "GCC Buying Signals: Wamda, MoCI filings, Argaam, Reuters Arabic",
                  "KSA PDPL call redaction: Iqama numbers, Saudi IBANs auto-redacted from transcripts",
                  "Gulf naming conventions (Al-, bin, ibn) modeled in the data layer",
                  "GCC payment rails: Tap, Mada, HyperPay, PayTabs — SAR/AED/QAR billing",
                ].map((item) => (
                  <div key={item} className="flex gap-2 items-start">
                    <span className="text-emerald-500 flex-shrink-0 mt-0.5">◆</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── 04 CRM ──────────────────────────────────────────── */}
          <section id="s04" className="mb-20">
            <SectionHeader num="04" title="CRM Engine" subtitle="Pipeline, scoring, forecasting, and deal close — end to end" />
            <ScreenMock title="nexflow.app / leads / pipeline">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { stage: "Prospecting", count: 142, value: "SAR 28M", color: "border-l-4 border-blue-400" },
                  { stage: "Qualified", count: 67, value: "SAR 19M", color: "border-l-4 border-purple-400" },
                  { stage: "Proposal", count: 31, value: "SAR 14M", color: "border-l-4 border-amber-400" },
                  { stage: "Negotiation", count: 14, value: "SAR 8M", color: "border-l-4 border-emerald-400" },
                ].map(({ stage, count, value, color }) => (
                  <div key={stage} className={`bg-white rounded-lg p-3 ${color}`}>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{stage}</div>
                    <div className="text-2xl font-black text-gray-900 mt-1">{count}</div>
                    <div className="text-sm text-emerald-600 font-semibold">{value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 bg-white rounded-lg p-3 text-xs text-gray-600">
                <span className="font-semibold text-gray-800">AI Gap Analysis: </span>
                Khalid Al-Aramco renewal at risk — proposal expires Friday, win-rate dropped 18%. 3 deals stuck in Proposal &gt;21 days. Recommend: activate AI Voice Agent on 5 no-reply leads.
              </div>
            </ScreenMock>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                { title: "ICP Rules Engine", body: "Admin builds custom scoring rules: hard gates (country, industry, title) and soft signals (company size, engagement, deal velocity). Infinite rules, any field, any operator." },
                { title: "Lead Scoring + Intent", body: "Composite score across 6 dimensions → Buying Now / High Intent / Evaluating / Researching / Cold. Every score is visible, explainable, and used to rank the Power Dialer queue." },
                { title: "AI Forecasting", body: "Pipeline → Best Case → Commit → Closed Won waterfall per rep. Per-deal win-rate with written AI rationale, leading indicators, and variance explanation." },
                { title: "Quote-to-Cash + GCC Payments", body: "Generate SAR/AED/QAR-priced quote → embed Tap or Mada payment link → customer pays online → deal auto-closes in pipeline. No separate billing tool required." },
                { title: "Forgotten Leads Engine", body: "Surfaces contacts silent 90+ days where a fresh GCC buying signal just fired (funding round on Wamda, MoCI corporate filing, Argaam news). AI adds them to Power Dialer queue automatically." },
                { title: "Contact Profile Network", body: "Per-contact: mutual connections, relationship type, tech stack detected, work history, full 16-agent intelligence dossier accessible in one click." },
              ].map(({ title, body }) => (
                <div key={title} className="rounded-lg bg-gray-50 p-4">
                  <div className="font-bold text-gray-900 text-sm mb-1">{title}</div>
                  <div className="text-sm text-gray-600 leading-relaxed">{body}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 05 CALL CENTER ──────────────────────────────────── */}
          <section id="s05" className="mb-20">
            <SectionHeader num="05" title="Call Center Engine" subtitle="Power Dialer, Arabic AI Voice Agents, and post-call automation" />
            <ScreenMock title="nexflow.app / callcenter / agent — Power Dialer (live call)">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-gray-900">Khalid Al-Rashid · Aramco</div>
                      <div className="text-xs text-gray-500">Score 82 · Buying Now · 9:08 AM</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-semibold text-emerald-600">CONNECTED · 00:08</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-xs space-y-1 font-mono text-gray-700">
                    <div><span className="text-blue-600">[Khalid]</span> مرحباً، نعم أنا متاح الآن...</div>
                    <div><span className="text-emerald-600">[Rep]</span> أهلاً خالد، شكراً على وقتك اليوم...</div>
                    <div><span className="text-blue-600">[Khalid]</span> في الحقيقة عندنا ميزانية محدودة هذا الربع...</div>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="text-xs font-bold text-amber-800 mb-2">LiveCoachPanel</div>
                  <div className="bg-amber-100 rounded p-2 mb-2">
                    <div className="text-xs font-semibold text-amber-900">⚡ Budget objection</div>
                    <div className="text-xs text-amber-700 mt-1">Suggested: "نفهم القيود — لكن ROI يتحقق في 60 يوم..."</div>
                  </div>
                  <div className="text-xs font-bold text-amber-800 mb-1">Pre-call brief</div>
                  <div className="text-xs text-amber-700 space-y-0.5">
                    <div>• Last call: 14 days ago</div>
                    <div>• Proposal open: 3× today</div>
                    <div>• Decision maker confirmed</div>
                  </div>
                </div>
              </div>
            </ScreenMock>
            <div className="grid grid-cols-3 gap-4 mt-5">
              {[
                { title: "Power Dialer — 3 modes", tag: "Ships today", color: "blue" as const, body: "Manual (rep-controlled) / Auto-Dial (auto-advances queue, logs voicemail/no-answer) / AI Agent (fully autonomous — places calls, qualifies leads, logs outcome, fires WhatsApp follow-up)." },
                { title: "6 Arabic AI Voice Agents", tag: "Exclusive", color: "green" as const, body: "Layla (Khaleeji F), Faisal (KSA M), Noor (bilingual AR/EN), Reem (Levantine), Omar (Egyptian), Adam (English). Build custom agents: describe role → AI improves prompt → deploy → review run history." },
                { title: "Post-Call Automation", tag: "Ships today", color: "green" as const, body: "Every call outcome fires a cadence rule: No-answer → AI WhatsApp in Arabic within 5 min. Voicemail → Arabic email. Connected → follow-up task + WhatsApp draft. All go through approval queue or auto-send." },
                { title: "LiveCoachPanel", tag: "Live during calls", color: "amber" as const, body: "Real-time objection detection (budget, incumbent, timing). Buying signal flags mid-call. Suggested responses appear instantly. Competitor mention triggers counter-argument card." },
                { title: "Conversation Intelligence", tag: "Ships today", color: "blue" as const, body: "Per-call: sentiment score, talk/listen ratio, topic extraction, objection tracking, next steps. Bilingual Arabic/English analysis. Full searchable transcript. Rep coaching score." },
                { title: "KSA PDPL Call Redaction", tag: "Compliance", color: "rose" as const, body: "Auto-redacts from call transcripts: Saudi IBAN (SA04...), Iqama numbers, credit card numbers, SSN, phone numbers, email addresses. PCI DSS + KSA PDPL compliant." },
              ].map(({ title, tag, color, body }) => (
                <div key={title} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-bold text-gray-900 text-sm leading-tight">{title}</div>
                    <Tag color={color}>{tag}</Tag>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">{body}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 06 ENRICHMENT ───────────────────────────────────── */}
          <section id="s06" className="mb-20">
            <SectionHeader num="06" title="Enrichment Engine" subtitle="GCC-first intelligence — data sources nobody else monitors" />
            <ScreenMock title="nexflow.app / datahub / enrichment — Prospecting tab">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-500 mb-2">Search by company or person</div>
                  <div className="border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-700 mb-2">Aramco Digital ▾</div>
                  <div className="text-xs text-gray-500 mb-1.5">Enrichment signals selected (11 of 15)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["LinkedIn Profile", "Company News", "Funding Rounds", "MoCI Filing", "Wamda Signal", "Email Finder", "Phone Validator", "Tech Stack", "Argaam News"].map((s) => (
                      <span key={s} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-500 mb-2">Person Intel — 16 agents · 84s</div>
                  <div className="space-y-1.5 text-xs text-gray-700">
                    <div className="flex gap-2"><span className="text-emerald-500 font-bold">✓</span><span><strong>Tariq Al-Mansouri</strong> · VP Digital · Aramco Digital</span></div>
                    <div className="flex gap-2"><span className="text-emerald-500 font-bold">✓</span><span>LinkedIn: 1,240 connections · ex-McKinsey · KFUPM EE</span></div>
                    <div className="flex gap-2"><span className="text-emerald-500 font-bold">✓</span><span>Tech stack: SAP, Salesforce, AWS · budget authority confirmed</span></div>
                    <div className="flex gap-2"><span className="text-emerald-500 font-bold">✓</span><span>Argaam: company raised SAR 120M · expansion planned Q4</span></div>
                    <div className="flex gap-2"><span className="text-emerald-500 font-bold">✓</span><span>ICP score: 94 · Buying Now</span></div>
                  </div>
                </div>
              </div>
            </ScreenMock>
            <div className="grid grid-cols-2 gap-4 mt-5">
              {[
                { title: "Saudi Commercial Registry (Masaar)", body: "Type any Saudi company name → real-time lookup: CR number, legal name, establishment date, license type, and registered directors. Mandatory in KSA enterprise sales; no global CRM knows this source exists." },
                { title: "16-Agent Person Intelligence", body: "16 parallel AI agents (Perplexity ×9, Gemini ×5, Claude ×1, GPT-4o-mini ×1) research any person and return a full dossier in 76–90 seconds. LinkedIn, website crawls, news, tech stack, budget authority signals." },
                { title: "GCC Buying Signals", body: "8 monitored sources: Wamda (MENA startup news), Saudi MoCI corporate filings, Argaam (Saudi financial news), Reuters Arabic, LinkedIn, X, PR Newswire, custom RSS. Triggers on funding, hiring, regulatory, expansion." },
                { title: "Business Card Scanner", body: "5-agent pipeline: Gemini Vision OCR → Claude validation → Perplexity live search → website scraper → GPT-4o-mini ICP scoring. Card photo → fully enriched, ICP-scored lead in ~30 seconds. Designed for GITEX and Saudi majlis." },
                { title: "Bulk List Upload", body: "Upload CSV → auto-dedup → 5-question configuration wizard (data fields needed, profiling depth, signal pack, dedup survivor preference, batch tag) → queue for enrichment. Returns enriched records with source provenance." },
                { title: "Waterfall Enrichment", body: "Clay-style multi-provider waterfall: pick providers in priority order, first successful hit wins. 15 signal types grouped: Contact, Profile, Company, Buying Signals, Social. Per-row or bulk Enrich-All." },
              ].map(({ title, body }) => (
                <div key={title} className="rounded-lg bg-gray-50 p-4">
                  <div className="font-bold text-gray-900 text-sm mb-1">{title}</div>
                  <div className="text-sm text-gray-600 leading-relaxed">{body}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 07 MARKETING ────────────────────────────────────── */}
          <section id="s07" className="mb-20">
            <SectionHeader num="07" title="Marketing Engine" subtitle="AI Campaign Builder with GCC Cultural Intelligence" />
            <ScreenMock title="nexflow.app / marketing / campaign-builder — AI Builder tab">
              <div className="space-y-2">
                {[
                  { step: "01", label: "Goal", value: "Activate Vision 2030-aligned SMBs · KSA + UAE", done: true },
                  { step: "02", label: "Audience", value: "2,418 contacts · SMB · CRM decision-makers", done: true },
                  { step: "03", label: "Cultural Intel", value: "ON · Khaleeji tone · Arabic-first · Sun–Wed 9–11 AM optimal", done: true },
                  { step: "04", label: "AI generates", value: "7 channels: LinkedIn / X / Instagram / Facebook / WhatsApp / Email / SMS", done: true },
                  { step: "05", label: "Review", value: "WhatsApp ✓ · Email edited · LinkedIn ✓ · IG ✓ · Refresh any channel", done: false },
                  { step: "06", label: "Publish", value: "Scheduled Sun 9AM KSA · Attribution tracking wired to pipeline", done: false },
                ].map(({ step, label, value, done }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${done ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}>{step}</div>
                    <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between gap-4">
                      <span className="text-xs font-bold text-gray-500 w-24 flex-shrink-0">{label}</span>
                      <span className="text-xs text-gray-700 flex-1">{value}</span>
                    </div>
                    {step !== "06" && <span className="text-gray-300 text-xs">→</span>}
                  </div>
                ))}
              </div>
            </ScreenMock>
            <div className="grid grid-cols-2 gap-4 mt-5">
              {[
                { title: "AI Campaign Builder (6 steps)", body: "Describe the goal → AI builds all 7 channel variants (LinkedIn, X, Instagram, Facebook, WhatsApp, Email, SMS) in the right tone per channel. Cultural Intelligence toggle injects Khaleeji aesthetic, Arabic-first copy, and Sun–Wed optimal timing automatically." },
                { title: "Cultural Intelligence Engine", body: "Per-country event calendar: Ramadan pre-window (GOLD outreach opportunity), Eid Al-Fitr/Al-Adha blackout windows, Saudi/UAE/Kuwait/Qatar National Days, prayer schedule suppression. AI Cultural Advisor answers any GCC outreach question." },
                { title: "AI-Generated Campaign Visual", body: "Campaign image generated by AI based on the goal and cultural context. Khaleeji aesthetic, Arabic typography, Vision 2030 color palette when appropriate. Each channel gets the right image size automatically." },
                { title: "Multi-Touch Attribution", body: "Revenue attribution across 7 channels wired straight into the pipeline. Every SAR of campaign spend traces back to closed revenue. MQL-to-pipeline conversion visible per campaign, per channel, per segment." },
                { title: "Sequences & Audiences", body: "Multi-step cadences: email → LinkedIn → AI Voice Call → WhatsApp → breakup email. Audience segmentation off live CRM data — no nightly export. Cultural blackouts respected across every sequence step." },
                { title: "Campaign Performance", body: "7 KPIs per campaign, ROI strip, hot-lead URGENT banner with Alert Rep CTA, AI improvement suggestions with Re-analyse button, benchmark bars vs industry. Dropdown selector across all active campaigns." },
              ].map(({ title, body }) => (
                <div key={title} className="rounded-lg bg-gray-50 p-4">
                  <div className="font-bold text-gray-900 text-sm mb-1">{title}</div>
                  <div className="text-sm text-gray-600 leading-relaxed">{body}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 08 COMPETITIVE ──────────────────────────────────── */}
          <section id="s08" className="mb-20">
            <SectionHeader num="08" title="Competitive Analysis" subtitle="12 capabilities that only NexFlow ships for the GCC" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide rounded-tl-lg">Capability</th>
                    <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide text-emerald-400">NexFlow</th>
                    <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wide text-gray-400">Salesforce</th>
                    <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wide text-gray-400">HubSpot</th>
                    <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wide text-gray-400">Zoho</th>
                    <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wide text-gray-400 rounded-tr-lg">Pipedrive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <FeatureRow name="Arabic AI Voice Agents — autonomous calling" nf="6 dialects · included" sf="English only · $2/conv" hs="No" zo="No" pd="No" />
                  <FeatureRow name="Post-call WhatsApp auto-draft (Arabic, 5 min)" nf="Native · every plan" sf="No" hs="No" zo="No" pd="No" />
                  <FeatureRow name="Saudi Commercial Registry (Masaar) lookup" nf="Real-time · built-in" sf="No" hs="No" zo="No" pd="No" />
                  <FeatureRow name="GCC buying signals (Wamda / MoCI / Argaam)" nf="8 sources · native" sf="No" hs="No" zo="No" pd="No" />
                  <FeatureRow name="16-agent deep person intelligence (90 sec)" nf="Ships today" sf="No" hs="No" zo="No" pd="No" />
                  <FeatureRow name="GCC cultural calendar + AI advisor" nf="Per-country · built-in" sf="No" hs="No" zo="No" pd="No" />
                  <FeatureRow name="WhatsApp native inbox + bilingual AI bot" nf="Native" sf="3rd party" hs="3rd party" zo="3rd party" pd="No" />
                  <FeatureRow name="Business card → enriched lead (5-agent AI)" nf="30 sec · built-in" sf="No" hs="No" zo="OCR only" pd="No" />
                  <FeatureRow name="CRM + Calls + Enrichment on one schema" nf="One plan" sf="3 products · 3 bills" hs="3 tiers + add-ons" zo="50+ apps" pd="CRM only" />
                  <FeatureRow name="GCC payment rails (Tap / Mada / HyperPay)" nf="Native" sf="Stripe only" hs="Stripe only" zo="Stripe only" pd="No" />
                  <FeatureRow name="KSA PDPL call redaction (Iqama / Saudi IBAN)" nf="Built-in · auto" sf="No" hs="No" zo="No" pd="No" />
                  <FeatureRow name="Live call coaching (objection detection)" nf="LiveCoachPanel · included" sf="Gong add-on" hs="No" zo="No" pd="No" />
                </tbody>
              </table>
            </div>
          </section>

          {/* ── 09 ROLE JOURNEYS ────────────────────────────────── */}
          <section id="s09" className="mb-20">
            <SectionHeader num="09" title="Role Journeys" subtitle="A full day in NexFlow for each persona" />

            {/* Sales Rep */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">K</div>
                <div>
                  <div className="font-bold text-gray-900">Khalid Al-Otaibi — Senior Sales Executive</div>
                  <div className="text-sm text-gray-500">GCC Enterprise sales rep covering KSA mid-market</div>
                </div>
              </div>
              <div className="relative pl-8">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
                {[
                  { time: "7:30 AM", color: "bg-blue-500", auto: true, title: "AI Daily Brief", detail: "3 hot leads flagged. AI Voice Agent qualified 4 prospects overnight. Khalid / Aramco renewal: URGENT — proposal expires Friday, win-rate dropped 18%.", metric: "4 leads qualified while sleeping" },
                  { time: "9:00 AM", color: "bg-rose-500", auto: true, title: "Power Dialer: pre-call brief for Khalid", detail: "Score 82 · Buying-Now intent. Talking points generated from last 4 calls, stakeholder map loaded, 3 pain signals detected. One screen, ready to call.", metric: "0 prep minutes spent by rep" },
                  { time: "9:08 AM", color: "bg-amber-500", auto: true, title: "LiveCoachPanel fires mid-call", detail: '"Budget objection detected." Suggested Arabic response appears instantly. Competitor mention (Salesforce) triggers counter-argument card in real-time.', metric: "Objection detected in <2 seconds" },
                  { time: "9:22 AM", color: "bg-emerald-500", auto: true, title: "1-click post-call panel", detail: "Call note logged + follow-up task created + 3-day reminder set + Arabic WhatsApp draft sent — all in one tap. Rep moves to next call.", metric: "7 actions taken, 1 click" },
                  { time: "11:30 AM", color: "bg-purple-500", auto: true, title: "Business card scanner at event", detail: "Card photo taken at GITEX booth → 5-agent AI pipeline → CR verified (Masaar) → LinkedIn confirmed → ICP scored → enriched lead created in 30 seconds.", metric: "30 seconds from photo to CRM" },
                  { time: "2:00 PM", color: "bg-rose-500", auto: true, title: "Forgotten lead resurfaces", detail: "Ma'aden Metals — 94 days silent. Wamda signal: just raised SAR 75M Series B. AI adds to Power Dialer queue. Rep sees the signal, calls immediately.", metric: "Signal → action in <5 minutes" },
                  { time: "4:30 PM", color: "bg-emerald-500", auto: false, title: "Quote with Tap payment link sent", detail: "SAR-priced quote generated, Tap payment link embedded. Customer pays online → deal auto-closes. Rep goes home; deal closed itself.", metric: "Deal closed without a follow-up call" },
                ].map(({ time, color, auto, title, detail, metric }) => (
                  <div key={time} className="flex gap-4 mb-4 relative">
                    <div className={`absolute -left-5 w-4 h-4 rounded-full ${color} border-2 border-white flex items-center justify-center`}>
                      {auto && <span className="text-white text-[6px] font-bold">AI</span>}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-xs font-bold text-gray-400 mr-2">{time}</span>
                          <span className="font-bold text-gray-900 text-sm">{title}</span>
                        </div>
                        {auto && <Tag color="green">Automatic</Tag>}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-2">{detail}</p>
                      <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-lg px-3 py-1.5 inline-block">📊 {metric}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales Manager */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">L</div>
                <div>
                  <div className="font-bold text-gray-900">Layla Al-Sabah — Head of Sales, Gulf Region</div>
                  <div className="text-sm text-gray-500">Manages 8 reps across Riyadh and Eastern Province</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="text-sm font-bold text-gray-700 mb-3">Team Quota Attainment — This Week</div>
                  <Bar label="Khalid A." value={94} max={100} color="bg-emerald-400" />
                  <Bar label="Tariq M." value={83} max={100} color="bg-emerald-400" />
                  <Bar label="Reem H." value={71} max={100} color="bg-amber-400" />
                  <Bar label="Faisal A." value={58} max={100} color="bg-amber-400" />
                  <Bar label="Lina K." value={34} max={100} color="bg-rose-400" />
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">AI-Generated Coaching Signals</div>
                    <div className="space-y-2 text-sm">
                      {[
                        { rep: "Lina K.", signal: "Pricing pushback rising — joint call recommended", color: "text-rose-600" },
                        { rep: "Faisal A.", signal: "Discovery talk-time below 32% — share 3 call replays", color: "text-amber-600" },
                        { rep: "Reem H.", signal: "3 deals stalled 14d+ — suggest unblock conversation", color: "text-amber-600" },
                        { rep: "Khalid A.", signal: "High win-rate, low volume — consider lifting quota", color: "text-emerald-600" },
                      ].map(({ rep, signal, color }) => (
                        <div key={rep} className="flex gap-2">
                          <span className="font-bold text-gray-700 w-16 flex-shrink-0">{rep}</span>
                          <span className={`${color} font-medium text-xs`}>{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "At-risk deals", value: "7", sub: "SAR 4.2M exposure", color: "text-rose-600" },
                      { label: "Deal cycle", value: "38d", sub: "−4d vs Q2", color: "text-emerald-600" },
                      { label: "Coverage", value: "3.1×", sub: "2 reps below 2.5×", color: "text-amber-600" },
                    ].map(({ label, value, sub, color }) => (
                      <div key={label} className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</div>
                        <div className={`text-xl font-black ${color} mt-1`}>{value}</div>
                        <div className="text-xs text-gray-500">{sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CEO */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">F</div>
                <div>
                  <div className="font-bold text-gray-900">Faisal Al-Harbi — CEO</div>
                  <div className="text-sm text-gray-500">6-office GCC operation · SAR 129M ARR</div>
                </div>
              </div>
              <div className="mb-3">
                <div className="text-sm font-bold text-gray-700 mb-3">GCC Situation Room — Q3 Live</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { city: "Riyadh · KSA", rev: "SAR 52M", pct: 88, status: "amber", label: "+8% QoQ · 2 deals at risk" },
                    { city: "Dubai · UAE", rev: "SAR 38M", pct: 95, status: "green", label: "+14% QoQ · exceeding" },
                    { city: "Doha · Qatar", rev: "SAR 14M", pct: 72, status: "amber", label: "On track · Q4 upside" },
                    { city: "Kuwait City", rev: "SAR 11M", pct: 58, status: "red", label: "3 quota gaps · ALERT" },
                    { city: "Manama · BH", rev: "SAR 6M", pct: 68, status: "amber", label: "New office · tracking" },
                    { city: "Muscat · OM", rev: "SAR 8M", pct: 104, status: "green", label: "+22% QoQ · best performer" },
                  ].map(({ city, rev, pct, status, label }) => {
                    const barColor = status === "green" ? "bg-emerald-400" : status === "amber" ? "bg-amber-400" : "bg-rose-400";
                    const textColor = status === "green" ? "text-emerald-600" : status === "amber" ? "text-amber-600" : "text-rose-600";
                    return (
                      <div key={city} className="bg-gray-50 rounded-xl p-4">
                        <div className="font-bold text-gray-800 text-sm">{city}</div>
                        <div className="text-lg font-black text-gray-900 mt-0.5">{rev}</div>
                        <div className="my-1.5 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <div className={`text-xs font-semibold ${textColor}`}>{label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-800">
                <strong>CEO AI Signal:</strong> Kuwait City gap — 3 open quota positions, 2 enterprise deals at risk (SAR 6.4M). Riyadh forecast confidence dropped 8pts — 4 deals pushed to Q4. Recommend board review before Thursday.
              </div>
            </div>

            {/* Marketing */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-sm">R</div>
                <div>
                  <div className="font-bold text-gray-900">Reem Al-Qahtani — Head of Marketing</div>
                  <div className="text-sm text-gray-500">AI Campaign Builder + Cultural Intelligence</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="text-sm font-bold text-gray-700 mb-3">AI Campaign Builder — 4 minutes end to end</div>
                  <div className="space-y-2">
                    {[
                      { step: "01", label: "Goal defined", color: "bg-blue-500", detail: "Activate SMBs for Vision 2030 · KSA + UAE" },
                      { step: "02", label: "Audience built", color: "bg-purple-500", detail: "2,418 contacts · SMB · from live CRM data" },
                      { step: "03", label: "Cultural Intel ON", color: "bg-amber-500", detail: "Khaleeji tone · Arabic-first · Fri–Sat suppressed" },
                      { step: "04", label: "7 channels generated", color: "bg-rose-500", detail: "AI wrote LinkedIn, X, IG, FB, WhatsApp, Email, SMS" },
                      { step: "05", label: "Reviewed + edited", color: "bg-emerald-500", detail: "WhatsApp ✓ · Email tweaked · LinkedIn ✓" },
                      { step: "06", label: "Published + tracking", color: "bg-blue-500", detail: "Sun 9AM · attribution wired to pipeline" },
                    ].map(({ step, label, color, detail }) => (
                      <div key={step} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-xs font-bold">{step}</span>
                        </div>
                        <div className="flex-1 bg-white rounded-lg px-3 py-1.5 border border-gray-100">
                          <span className="text-xs font-bold text-gray-700 mr-2">{label}</span>
                          <span className="text-xs text-gray-500">{detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "MQLs", value: "2,418", sub: "+18% MoM", color: "text-emerald-600" },
                      { label: "Pipeline sourced", value: "SAR 9.4M", sub: "62% attributed", color: "text-blue-600" },
                      { label: "CAC payback", value: "7.2 mo", sub: "Within target", color: "text-gray-700" },
                    ].map(({ label, value, sub, color }) => (
                      <div key={label} className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</div>
                        <div className={`text-sm font-black ${color} mt-1`}>{value}</div>
                        <div className="text-xs text-gray-500">{sub}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Campaign Attribution</div>
                    <Bar label="Vision 2030 SMB" value={78} max={100} color="bg-emerald-400" />
                    <Bar label="Mid-market webinar" value={61} max={100} color="bg-rose-400" />
                    <Bar label="Enterprise nurture" value={47} max={100} color="bg-purple-400" />
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                    <strong>Cultural Intelligence:</strong> Eid Al-Adha in 18 days. Pre-Eid GOLD window opens Tuesday. AI recommends: launch pre-Eid campaign now; pause all outreach 3 days before Eid.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 10 PRICING ──────────────────────────────────────── */}
          <section id="s10" className="mb-20">
            <SectionHeader num="10" title="Pricing" subtitle="SAR-denominated, per-seat, all-inclusive. No add-on lottery." />
            <div className="grid grid-cols-3 gap-5">
              {[
                { name: "Starter", price: "SAR 149", period: "/seat/month", color: "border-gray-200", badge: null, features: ["CRM Core · pipeline · deals", "Contact Center (basic calling)", "Email + WhatsApp inbox", "Standard AI briefing", "5 enrichment credits/month", "1 AI Voice Agent (English)"] },
                { name: "Growth", price: "SAR 349", period: "/seat/month", color: "border-emerald-400 ring-2 ring-emerald-200", badge: "Most popular", features: ["Everything in Starter", "Power Dialer (all 3 modes)", "3 Arabic AI Voice Agents", "Post-call WhatsApp automation", "100 enrichment credits/month", "GCC Cultural Calendar + advisor", "Conversation Intelligence", "Saudi CR lookup (Masaar)"] },
                { name: "Enterprise", price: "Custom", period: "SAR billing", color: "border-gray-900", badge: "For GCC enterprise", features: ["Everything in Growth", "All 6 Arabic AI Voice Agents", "16-agent person intelligence", "GCC buying signals (all 8 sources)", "Unlimited enrichment", "KSA PDPL call redaction", "In-Kingdom data residency", "Custom AI playbooks per persona", "Dedicated CSM", "SLA 99.9%"] },
              ].map(({ name, price, period, color, badge, features }) => (
                <div key={name} className={`rounded-2xl border-2 ${color} p-6 flex flex-col`}>
                  {badge && <div className="mb-3"><Tag color="green">{badge}</Tag></div>}
                  <div className="font-black text-xl text-gray-900">{name}</div>
                  <div className="mt-2 mb-4">
                    <span className="text-3xl font-black text-gray-900">{price}</span>
                    <span className="text-sm text-gray-500 ml-1">{period}</span>
                  </div>
                  <ul className="space-y-2 flex-1">
                    {features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-emerald-500 flex-shrink-0">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-5 bg-gray-50 rounded-xl p-5 text-sm text-gray-600">
              <strong>Pricing notes:</strong> All plans billed in SAR. Mada card processing at 1% (lowest rate in Saudi market). Tap, HyperPay, PayTabs, and Stripe also supported. Multi-currency available (AED, QAR, KWD, BHD, OMR). Sharia-compliant billing variant available for government/semi-government contracts.
            </div>
          </section>

          {/* ── 11 MARKET & TRACTION ────────────────────────────── */}
          <section id="s11" className="mb-20">
            <SectionHeader num="11" title="Market & Traction" subtitle="GCC CRM market and NexFlow's three-year build path" />
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Global CRM TAM", value: "$113B", sub: "2030 projection (Grand View Research)", color: "bg-gray-900 text-white" },
                { label: "GCC SAM", value: "$2.4B", sub: "Enterprise + mid-market B2B SaaS spend", color: "bg-blue-600 text-white" },
                { label: "Realistic SOM (Year 3)", value: "$48M", sub: "2% GCC share · 1,200 customers", color: "bg-emerald-500 text-white" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className={`rounded-2xl ${color} p-6`}>
                  <div className="text-xs font-semibold opacity-70 uppercase tracking-wide mb-1">{label}</div>
                  <div className="text-4xl font-black mb-1">{value}</div>
                  <div className="text-sm opacity-70">{sub}</div>
                </div>
              ))}
            </div>
            <div className="mb-6">
              <div className="font-bold text-gray-900 mb-3">Three-year roadmap</div>
              <div className="relative">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { year: "Year 1 (2025–26)", color: "bg-blue-50 border-blue-200", items: ["Core CRM + Power Dialer + 6 Arabic voices", "Saudi CR (Masaar) + 16-agent Person Intel", "Post-call WhatsApp automation", "GCC Cultural Calendar", "KSA PDPL call redaction", "First 50 customers · KSA focus"] },
                    { year: "Year 2 (2026–27)", color: "bg-emerald-50 border-emerald-200", items: ["UAE + Qatar + Kuwait market entry", "Mobile app (iOS + Android)", "AI Forecasting v2 + scenario modelling", "WhatsApp Business API direct", "Advanced conversation intelligence", "200 customers · SAR 12M ARR"] },
                    { year: "Year 3 (2027–28)", color: "bg-purple-50 border-purple-200", items: ["Bahrain + Oman + expansion", "Enterprise Marketplace (GCC system integrators)", "AI-generated sales playbooks v2", "Autonomous deal negotiation agents", "GCC Payments infra (direct Mada/Tap)", "1,200 customers · SAR 65M ARR"] },
                  ].map(({ year, color, items }) => (
                    <div key={year} className={`rounded-xl border ${color} p-4`}>
                      <div className="font-bold text-gray-900 text-sm mb-3">{year}</div>
                      <ul className="space-y-1.5">
                        {items.map((item) => (
                          <li key={item} className="flex gap-2 text-xs text-gray-700">
                            <span className="text-emerald-500 flex-shrink-0">→</span>{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Why now — Vision 2030", body: "SAR 3T in economic transformation creating a new generation of GCC B2B buyers who demand Arabic-first, AI-native tooling." },
                { label: "Why now — AI inflection", body: "Arabic LLMs (GPT-4o, Gemini, Claude) reached production quality for Gulf dialect in 2024. Voice quality for Khaleeji Arabic is now deployable." },
                { label: "Why now — Salesforce weakness", body: "Salesforce's GCC partner ecosystem is expensive and slow. Einstein Agentforce is English-only. Local teams are openly evaluating alternatives." },
                { label: "Why now — WhatsApp first", body: "GCC business communication shifted from email to WhatsApp as the primary sales channel. Global CRMs treat WhatsApp as a third-party integration." },
              ].map(({ label, body }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4">
                  <div className="font-bold text-gray-900 text-xs mb-1.5">{label}</div>
                  <div className="text-xs text-gray-600 leading-relaxed">{body}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 12 LOCAL DEV SETUP ───────────────────────────────── */}
          <section id="s12" className="mb-20">
            <SectionHeader num="12" title="Local Development Setup" subtitle="Run the full NexFlow stack on your own machine" />
            <div className="bg-gray-50 rounded-xl p-5 mb-6">
              <div className="font-bold text-gray-900 mb-3">System Requirements</div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                {[
                  ["Node.js", "20 (LTS) or higher — nodejs.org"],
                  ["pnpm", "10 or higher — npm install -g pnpm@latest"],
                  ["PostgreSQL", "14 or higher — postgresql.org/download"],
                  ["Git", "Any recent version — git-scm.com"],
                  ["Expo Go (mobile)", "Latest — App Store / Google Play"],
                  ["VS Code extensions", "ESLint, Prettier, TypeScript recommended"],
                ].map(([tool, detail]) => (
                  <div key={tool as string} className="flex gap-2">
                    <span className="font-mono font-semibold text-gray-900 w-28 flex-shrink-0">{tool}</span>
                    <span className="text-gray-600">{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="font-bold text-gray-900 mb-1">Step 1 — Install dependencies</div>
                <p className="text-sm text-gray-600 mb-2">From the project root (where <code className="bg-gray-100 px-1 rounded">pnpm-workspace.yaml</code> lives):</p>
                <CodeBlock>{`pnpm install`}</CodeBlock>
              </div>

              <div>
                <div className="font-bold text-gray-900 mb-1">Step 2 — Create the database</div>
                <CodeBlock>{`psql -U postgres
CREATE DATABASE nexflow;
\\q`}</CodeBlock>
              </div>

              <div>
                <div className="font-bold text-gray-900 mb-1">Step 3 — Environment variables</div>
                <p className="text-sm text-gray-600 mb-2">Create <code className="bg-gray-100 px-1 rounded">artifacts/api-server/.env</code>:</p>
                <CodeBlock>{`# Required
PORT=8080
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/nexflow
SESSION_SECRET=change-me-to-something-long-and-random

# AI Features (optional — app works with sample data without these)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...
GEMINI_API_KEY=AIza...

# Optional services
RESEND_API_KEY=re_...
INVESTOR_PASSCODE=demo1234`}</CodeBlock>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mt-2">
                  <strong>Note:</strong> None of the AI keys are required. Every AI feature falls back to realistic sample data when a key is missing — the full UI is demoable without any third-party accounts.
                </div>
              </div>

              <div>
                <div className="font-bold text-gray-900 mb-1">Step 4 — Push the database schema</div>
                <CodeBlock>{`pnpm --filter @workspace/db run push`}</CodeBlock>
              </div>

              <div>
                <div className="font-bold text-gray-900 mb-1">Step 5 — Start the services (4 terminals)</div>
                <CodeBlock>{`# Terminal 1 — API Server (wait for "Server listening port: 8080")
PORT=8080 DATABASE_URL=postgresql://postgres:pw@localhost:5432/nexflow SESSION_SECRET=any-secret pnpm --filter @workspace/api-server run dev

# Terminal 2 — Web App
PORT=5173 pnpm --filter @workspace/nexflow run dev
# Open: http://localhost:5173

# Terminal 3 — Mobile (optional)
EXPO_PUBLIC_DOMAIN=localhost:8080 pnpm --filter @workspace/mobile run dev

# Terminal 4 — Company profile deck (optional)
PORT=5175 pnpm --filter @workspace/company-profile-deck run dev`}</CodeBlock>
              </div>

              <div>
                <div className="font-bold text-gray-900 mb-2">Demo personas — sign in instantly</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "sales", name: "Khalid Al-Otaibi", role: "Senior Sales Executive" },
                    { key: "manager", name: "Layla Al-Sabah", role: "Head of Sales · Gulf Region" },
                    { key: "ceo", name: "Faisal Al-Harbi", role: "CEO" },
                    { key: "admin", name: "Sara Al-Mansouri", role: "CRM Operations Lead" },
                    { key: "marketing", name: "Reem Al-Qahtani", role: "Head of Marketing" },
                  ].map(({ key, name, role }) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                      <code className="font-mono text-xs bg-gray-200 px-2 py-1 rounded text-gray-700">{key}</code>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{name}</div>
                        <div className="text-xs text-gray-500">{role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-bold text-gray-900 mb-2">Project structure</div>
                <CodeBlock>{`nexflow/
├── artifacts/
│   ├── api-server/          ← Express + Drizzle ORM backend (port 8080)
│   ├── nexflow/             ← React + Vite web CRM (port 5173)
│   ├── mobile/              ← Expo React Native mobile app
│   ├── investor-deck/       ← Investor slide deck
│   └── company-profile-deck/ ← Company profile slides
├── lib/
│   ├── db/                  ← Shared PostgreSQL schema + Drizzle client
│   ├── api-spec/            ← OpenAPI spec (source of truth for API types)
│   └── api-client-react/    ← Generated React Query hooks
└── pnpm-workspace.yaml      ← Monorepo workspace definition`}</CodeBlock>
              </div>

              <div>
                <div className="font-bold text-gray-900 mb-2">Troubleshooting</div>
                <div className="space-y-2">
                  {[
                    { error: "EADDRINUSE: address already in use", fix: "Change the PORT value or stop the conflicting process." },
                    { error: "Cannot find module '@workspace/db'", fix: "Run pnpm install from the project root, then pnpm --filter @workspace/db run push." },
                    { error: "Web app blank page / API errors", fix: "Ensure API server started successfully before opening the web app. Check Terminal 1 logs." },
                    { error: "Mobile can't connect to API", fix: "Set EXPO_PUBLIC_DOMAIN to your machine's LAN IP (e.g. 192.168.1.x:8080), not localhost." },
                  ].map(({ error, fix }) => (
                    <div key={error} className="bg-gray-50 rounded-lg p-3">
                      <code className="text-xs font-mono text-rose-600">{error}</code>
                      <p className="text-sm text-gray-600 mt-1">{fix}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-gray-200 pt-8 pb-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-8 rotate-45 bg-emerald-500 rounded" />
              <span className="font-black text-xl tracking-tight">NexFlow</span>
            </div>
            <div className="text-sm text-gray-500">Universal AI-native B2B CRM for GCC markets · nexflow.app</div>
            <div className="mt-2 text-xs text-gray-400">Master Product Document · 13 sections · v2.0 · May 2026</div>
          </div>

        </main>
      </div>
    </div>
  );
}
