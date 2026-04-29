import { useState } from "react";
import {
  User, Building2, Bell, Shield, Palette, Globe, Phone, Mail,
  Save, ChevronRight, Check, Moon, Sun, Languages, Zap, Bot,
  CreditCard, Users, Key, Database, Plug, Clock, ToggleLeft, ToggleRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "profile",       label: "Profile",         icon: User },
  { key: "organization",  label: "Organization",    icon: Building2 },
  { key: "notifications", label: "Notifications",   icon: Bell },
  { key: "integrations",  label: "Integrations",    icon: Plug },
  { key: "ai",            label: "AI & Automation", icon: Bot },
  { key: "security",      label: "Security",        icon: Shield },
  { key: "billing",       label: "Billing & Plan",  icon: CreditCard },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        on ? "bg-[#88B8B0]" : "bg-muted/60"
      )}
    >
      <span className={cn("inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", on ? "translate-x-6" : "translate-x-1")} />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/10 last:border-0">
      <div className="flex-1 min-w-0 pr-8">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-6 mb-6">
      <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  // Profile state
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@nexflow.ai");
  const [phone, setPhone] = useState("+966 50 000 0000");
  const [title, setTitle] = useState("Sales Director");
  const [timezone, setTimezone] = useState("Asia/Riyadh");
  const [language, setLanguage] = useState("en");

  // Org state
  const [orgName, setOrgName] = useState("NexFlow Demo Org");
  const [orgDomain, setOrgDomain] = useState("nexflow.ai");
  const [orgCountry, setOrgCountry] = useState("Saudi Arabia");
  const [orgCurrency, setOrgCurrency] = useState("USD");

  // Notification toggles
  const [notifs, setNotifs] = useState({
    dealAlert: true,
    signalDetected: true,
    callMissed: true,
    taskDue: true,
    teamActivity: false,
    weeklyDigest: true,
    emailNotifs: true,
    whatsappNotifs: false,
  });

  // AI toggles
  const [ai, setAi] = useState({
    autoBriefing: true,
    leadScoring: true,
    signalScan: true,
    emailSuggestions: true,
    callTranscripts: true,
    culturalAdvisor: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const input = "w-full px-3 py-2 rounded-xl border border-border/30 bg-background text-sm text-foreground focus:outline-none focus:border-[#B8A0C8]/60 focus:ring-1 focus:ring-[#B8A0C8]/30 transition-all";
  const select = "w-full px-3 py-2 rounded-xl border border-border/30 bg-background text-sm text-foreground focus:outline-none focus:border-[#B8A0C8]/60 focus:ring-1 focus:ring-[#B8A0C8]/30 transition-all";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account, organization, and NexFlow preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-52 flex-shrink-0">
          <div className="glass-card rounded-2xl p-2 space-y-1 sticky top-6">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    tab === t.key
                      ? "bg-[#B8A0C8]/15 text-[#B8A0C8]"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* ── PROFILE ── */}
          {tab === "profile" && (
            <>
              <Section title="Personal Information">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                    <input className={input} value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Job Title</label>
                    <input className={input} value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                    <input className={input} type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone / WhatsApp</label>
                    <input className={input} value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>
              </Section>

              <Section title="Regional Preferences">
                <SettingRow label="Timezone" description="Used for scheduling and briefing times">
                  <select className={cn(select, "w-44")} value={timezone} onChange={e => setTimezone(e.target.value)}>
                    <option value="Asia/Riyadh">Riyadh (AST+3)</option>
                    <option value="Asia/Dubai">Dubai (GST+4)</option>
                    <option value="Asia/Kuwait">Kuwait (AST+3)</option>
                    <option value="Asia/Qatar">Doha (AST+3)</option>
                    <option value="Asia/Muscat">Muscat (GST+4)</option>
                    <option value="Asia/Bahrain">Manama (AST+3)</option>
                    <option value="Africa/Cairo">Cairo (EET+2)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </SettingRow>
                <SettingRow label="Interface Language" description="Display language for the NexFlow UI">
                  <select className={cn(select, "w-44")} value={language} onChange={e => setLanguage(e.target.value)}>
                    <option value="en">English</option>
                    <option value="ar">العربية (Arabic)</option>
                  </select>
                </SettingRow>
                <SettingRow label="Date Format" description="How dates are displayed throughout NexFlow">
                  <select className={cn(select, "w-44")}>
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </SettingRow>
              </Section>

              <Section title="Avatar">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl nf-chameleon-bg flex items-center justify-center text-white text-2xl font-black">
                    {name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <button type="button" className="px-4 py-2 rounded-xl bg-muted/50 hover:bg-muted/70 text-sm font-medium transition-colors">Upload photo</button>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </Section>
            </>
          )}

          {/* ── ORGANIZATION ── */}
          {tab === "organization" && (
            <>
              <Section title="Organization Details">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Organization Name</label>
                    <input className={input} value={orgName} onChange={e => setOrgName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Primary Domain</label>
                    <input className={input} value={orgDomain} onChange={e => setOrgDomain(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Headquarters Country</label>
                    <select className={select} value={orgCountry} onChange={e => setOrgCountry(e.target.value)}>
                      {["Saudi Arabia", "UAE", "Kuwait", "Qatar", "Bahrain", "Oman", "Egypt", "Jordan"].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Default Currency</label>
                    <select className={select} value={orgCurrency} onChange={e => setOrgCurrency(e.target.value)}>
                      {["USD", "SAR", "AED", "KWD", "QAR", "OMR", "BHD", "EGP"].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </Section>

              <Section title="CRM Defaults">
                <SettingRow label="Fiscal Year Start" description="Used for revenue reporting periods">
                  <select className={cn(select, "w-40")}>
                    {["January", "April", "July", "October"].map(m => <option key={m}>{m}</option>)}
                  </select>
                </SettingRow>
                <SettingRow label="Default Deal Currency" description="Currency used when creating new deals">
                  <select className={cn(select, "w-24")}>
                    {["USD", "SAR", "AED"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </SettingRow>
                <SettingRow label="Lead Scoring Model" description="Algorithm used to calculate contact lead scores">
                  <select className={cn(select, "w-44")}>
                    <option>NexFlow AI (default)</option>
                    <option>Activity-based</option>
                    <option>BANT manual</option>
                  </select>
                </SettingRow>
              </Section>

              <Section title="Team Members">
                {[
                  { name: "Sara Al-Mansouri", role: "AE",       email: "sara@nexflow.ai",   tz: "Dubai" },
                  { name: "Ahmed Khalid",      role: "SDR",      email: "ahmed@nexflow.ai",  tz: "Riyadh" },
                  { name: "Layla Hassan",      role: "VP Sales", email: "layla@nexflow.ai",  tz: "Cairo" },
                  { name: "Omar Farouk",       role: "AE",       email: "omar@nexflow.ai",   tz: "Dubai" },
                  { name: "Khalid Nasser",     role: "SDR",      email: "khalid@nexflow.ai", tz: "Riyadh" },
                ].map(m => (
                  <div key={m.email} className="flex items-center justify-between py-3 border-b border-border/10 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl nf-chameleon-bg flex items-center justify-center text-white text-xs font-bold">
                        {m.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.email} · {m.tz}</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-[#B8A0C8]/10 text-[#B8A0C8] text-xs font-medium">{m.role}</span>
                  </div>
                ))}
                <button type="button" className="mt-4 flex items-center gap-2 text-sm text-[#B8A0C8] font-medium hover:opacity-80 transition-opacity">
                  <Users className="w-4 h-4" /> Invite team member
                </button>
              </Section>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === "notifications" && (
            <>
              <Section title="CRM Alerts">
                <SettingRow label="Deal at Risk" description="Alert when a deal has no activity for 7+ days">
                  <Toggle on={notifs.dealAlert} onChange={v => setNotifs(n => ({ ...n, dealAlert: v }))} />
                </SettingRow>
                <SettingRow label="Signal Detected" description="Notify when a buying signal is found for a contact">
                  <Toggle on={notifs.signalDetected} onChange={v => setNotifs(n => ({ ...n, signalDetected: v }))} />
                </SettingRow>
                <SettingRow label="Missed Call" description="Alert when a call attempt goes unanswered">
                  <Toggle on={notifs.callMissed} onChange={v => setNotifs(n => ({ ...n, callMissed: v }))} />
                </SettingRow>
                <SettingRow label="Task Due Today" description="Morning reminder for tasks due that day">
                  <Toggle on={notifs.taskDue} onChange={v => setNotifs(n => ({ ...n, taskDue: v }))} />
                </SettingRow>
                <SettingRow label="Team Activity" description="Notifications when teammates complete activities">
                  <Toggle on={notifs.teamActivity} onChange={v => setNotifs(n => ({ ...n, teamActivity: v }))} />
                </SettingRow>
                <SettingRow label="Weekly Digest" description="Sunday summary of pipeline and team performance">
                  <Toggle on={notifs.weeklyDigest} onChange={v => setNotifs(n => ({ ...n, weeklyDigest: v }))} />
                </SettingRow>
              </Section>

              <Section title="Delivery Channels">
                <SettingRow label="Email Notifications" description="Receive alerts via email (admin@nexflow.ai)">
                  <Toggle on={notifs.emailNotifs} onChange={v => setNotifs(n => ({ ...n, emailNotifs: v }))} />
                </SettingRow>
                <SettingRow label="WhatsApp Notifications" description="Receive critical alerts via WhatsApp">
                  <Toggle on={notifs.whatsappNotifs} onChange={v => setNotifs(n => ({ ...n, whatsappNotifs: v }))} />
                </SettingRow>
              </Section>
            </>
          )}

          {/* ── INTEGRATIONS ── */}
          {tab === "integrations" && (
            <Section title="Connected Integrations">
              {[
                { name: "WhatsApp Business API", status: "connected", color: "#25D366", desc: "Send and receive WhatsApp messages from NexFlow" },
                { name: "Gmail",                  status: "connected", color: "#EA4335", desc: "Sync sent/received emails with contact timelines" },
                { name: "Google Calendar",        status: "connected", color: "#4285F4", desc: "Sync meetings and tasks with your Google Calendar" },
                { name: "LinkedIn Sales Nav",     status: "disconnected", color: "#0A66C2", desc: "Import leads and track LinkedIn engagement signals" },
                { name: "Zoom",                   status: "connected", color: "#2D8CFF", desc: "Auto-log Zoom calls and sync recordings" },
                { name: "HubSpot",                status: "disconnected", color: "#FF7A59", desc: "Import contacts and deals from HubSpot" },
                { name: "Salesforce",             status: "disconnected", color: "#00A1E0", desc: "Migrate from or sync with Salesforce" },
                { name: "Slack",                  status: "connected", color: "#4A154B", desc: "Receive CRM alerts in your Slack workspace" },
              ].map(i => (
                <div key={i.name} className="flex items-center justify-between py-4 border-b border-border/10 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ background: i.color }}>
                      {i.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{i.name}</div>
                      <div className="text-xs text-muted-foreground">{i.desc}</div>
                    </div>
                  </div>
                  <button type="button" className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    i.status === "connected"
                      ? "bg-[#88B8B0]/15 text-[#88B8B0] hover:bg-[#88B8B0]/25"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted/70"
                  )}>
                    {i.status === "connected" ? "✓ Connected" : "Connect"}
                  </button>
                </div>
              ))}
            </Section>
          )}

          {/* ── AI ── */}
          {tab === "ai" && (
            <>
              <Section title="AI Features">
                <SettingRow label="Daily AI Briefing" description="Generate an AI briefing every morning on the command center">
                  <Toggle on={ai.autoBriefing} onChange={v => setAi(a => ({ ...a, autoBriefing: v }))} />
                </SettingRow>
                <SettingRow label="AI Lead Scoring" description="Continuously score contacts using AI signals">
                  <Toggle on={ai.leadScoring} onChange={v => setAi(a => ({ ...a, leadScoring: v }))} />
                </SettingRow>
                <SettingRow label="Signal Scanning" description="Scan LinkedIn, news, and job postings for buying signals">
                  <Toggle on={ai.signalScan} onChange={v => setAi(a => ({ ...a, signalScan: v }))} />
                </SettingRow>
                <SettingRow label="Email Suggestions" description="AI-drafted email suggestions based on contact history">
                  <Toggle on={ai.emailSuggestions} onChange={v => setAi(a => ({ ...a, emailSuggestions: v }))} />
                </SettingRow>
                <SettingRow label="Call Transcription & Scoring" description="Transcribe and score all outbound calls with AI">
                  <Toggle on={ai.callTranscripts} onChange={v => setAi(a => ({ ...a, callTranscripts: v }))} />
                </SettingRow>
                <SettingRow label="Cultural Intelligence Advisor" description="GCC-specific cultural tips for outreach and timing">
                  <Toggle on={ai.culturalAdvisor} onChange={v => setAi(a => ({ ...a, culturalAdvisor: v }))} />
                </SettingRow>
              </Section>
              <Section title="AI Model">
                <SettingRow label="Language Model" description="The AI model powering NexFlow's intelligence features">
                  <select className={cn(select, "w-44")}>
                    <option>GPT-4o (default)</option>
                    <option>Claude 3.5 Sonnet</option>
                    <option>Gemini Pro</option>
                  </select>
                </SettingRow>
                <SettingRow label="Response Language" description="Preferred language for AI-generated content">
                  <select className={cn(select, "w-44")}>
                    <option>English</option>
                    <option>Arabic</option>
                    <option>Bilingual</option>
                  </select>
                </SettingRow>
              </Section>
            </>
          )}

          {/* ── SECURITY ── */}
          {tab === "security" && (
            <Section title="Security Settings">
              <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security with 2FA">
                <button type="button" className="px-3 py-1.5 rounded-lg bg-[#88B8B0]/15 text-[#88B8B0] text-xs font-semibold hover:bg-[#88B8B0]/25 transition-colors">Enable 2FA</button>
              </SettingRow>
              <SettingRow label="Active Sessions" description="2 active sessions — last login 2 hours ago">
                <button type="button" className="px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground text-xs font-medium hover:bg-muted/70 transition-colors">View sessions</button>
              </SettingRow>
              <SettingRow label="API Keys" description="Manage API access keys for integrations">
                <button type="button" className="px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground text-xs font-medium hover:bg-muted/70 transition-colors">Manage keys</button>
              </SettingRow>
              <SettingRow label="Data Export" description="Download all your CRM data as CSV">
                <button type="button" className="px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground text-xs font-medium hover:bg-muted/70 transition-colors">Export data</button>
              </SettingRow>
              <SettingRow label="Delete Organization" description="Permanently delete your NexFlow organization">
                <button type="button" className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition-colors">Delete org</button>
              </SettingRow>
            </Section>
          )}

          {/* ── BILLING ── */}
          {tab === "billing" && (
            <>
              <div className="glass-card rounded-2xl p-6 mb-6 border-2 border-[#B8A0C8]/30">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-[#B8A0C8] mb-1">Current Plan</div>
                    <div className="text-2xl font-black text-foreground">Enterprise</div>
                    <div className="text-sm text-muted-foreground mt-1">Unlimited contacts · All AI features · GCC Cultural Intelligence</div>
                  </div>
                  <div className="px-4 py-2 rounded-xl nf-chameleon-bg text-white text-xs font-bold">Active</div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/10 grid grid-cols-3 gap-4">
                  {[
                    { label: "Seats", value: "25 / 50" },
                    { label: "Next billing", value: "Jun 1, 2026" },
                    { label: "Monthly cost", value: "$2,400 / mo" },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                      <div className="text-sm font-bold text-foreground mt-0.5">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <Section title="Plan Features">
                {[
                  "Unlimited contacts & companies",
                  "40+ AI agents & automations",
                  "GCC Cultural Intelligence",
                  "WhatsApp Business API",
                  "AI call transcription & scoring",
                  "Advanced signal scanning",
                  "Custom properties (200+ library)",
                  "Priority support + dedicated CSM",
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 py-2 border-b border-border/10 last:border-0">
                    <Check className="w-4 h-4 text-[#88B8B0] flex-shrink-0" />
                    <span className="text-sm text-foreground">{f}</span>
                  </div>
                ))}
              </Section>
            </>
          )}

          {/* Save button */}
          {["profile", "organization", "notifications", "ai"].includes(tab) && (
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleSave}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all",
                  saved ? "bg-[#88B8B0]" : "nf-chameleon-bg hover:opacity-90"
                )}
              >
                {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save changes</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
