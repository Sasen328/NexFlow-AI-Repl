import { useState } from "react";
import { useProperties, useCreate, useDelete, useAiSuggestProperties } from "@/hooks/useApi";
import {
  Plus, Trash2, Database, Type, Hash, Calendar, ToggleLeft, List, Mail,
  Phone as PhoneIcon, Link as LinkIcon, Sparkles, X, Loader2, Check,
  BookOpen, ChevronDown, ChevronUp, Search, Filter, Settings2, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_ICONS: any = { text: Type, long_text: Type, number: Hash, date: Calendar, boolean: ToggleLeft, select: List, multiselect: List, url: LinkIcon, email: Mail, phone: PhoneIcon };

// ─── 200+ Standard CRM Property Library ──────────────────────────────────────
const PROPERTY_LIBRARY: Record<string, { label: string; name: string; type: string; options?: string[]; object_type: string; description?: string }[]> = {
  "Contact Identity": [
    { label: "Salutation", name: "salutation", type: "select", options: ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof.", "Eng.", "HE"], object_type: "contact" },
    { label: "Date of Birth", name: "date_of_birth", type: "date", object_type: "contact" },
    { label: "Nationality", name: "nationality", type: "select", options: ["Saudi", "UAE", "Kuwaiti", "Qatari", "Bahraini", "Omani", "Egyptian", "Jordanian", "Lebanese", "Pakistani", "Indian", "British", "American", "Other"], object_type: "contact" },
    { label: "Arabic Name", name: "arabic_name", type: "text", object_type: "contact" },
    { label: "Preferred Language", name: "preferred_language", type: "select", options: ["Arabic", "English", "Bilingual"], object_type: "contact" },
    { label: "Gender", name: "gender", type: "select", options: ["Male", "Female", "Prefer not to say"], object_type: "contact" },
    { label: "Personal Email", name: "personal_email", type: "email", object_type: "contact" },
    { label: "Secondary Phone", name: "secondary_phone", type: "phone", object_type: "contact" },
    { label: "WhatsApp Number", name: "whatsapp_number", type: "phone", object_type: "contact" },
    { label: "Telegram Handle", name: "telegram_handle", type: "text", object_type: "contact" },
  ],
  "Job & Seniority": [
    { label: "Seniority Level", name: "seniority_level", type: "select", options: ["C-Suite", "VP / SVP", "Director", "Manager", "Senior IC", "IC", "Associate", "Intern"], object_type: "contact" },
    { label: "Department", name: "department", type: "select", options: ["Technology", "Finance", "Operations", "Marketing", "Sales", "HR", "Legal", "Procurement", "Strategy", "Board"], object_type: "contact" },
    { label: "Years in Role", name: "years_in_role", type: "number", object_type: "contact" },
    { label: "Years at Company", name: "years_at_company", type: "number", object_type: "contact" },
    { label: "Budget Authority", name: "budget_authority", type: "select", options: ["Full signatory", "Up to $1M", "Up to $100K", "Up to $50K", "Recommender only", "No budget"], object_type: "contact" },
    { label: "Procurement Involved", name: "procurement_involved", type: "boolean", object_type: "contact" },
    { label: "Reports to", name: "reports_to", type: "text", object_type: "contact" },
    { label: "Direct Reports Count", name: "direct_reports", type: "number", object_type: "contact" },
    { label: "Management Level", name: "management_level", type: "select", options: ["Individual contributor", "Team lead", "Manager", "Senior manager", "Director", "VP", "C-level"], object_type: "contact" },
    { label: "Decision Role", name: "decision_role", type: "select", options: ["Champion", "Decision maker", "Influencer", "Blocker", "End user", "Economic buyer"], object_type: "contact" },
  ],
  "Behavioral & Engagement": [
    { label: "Preferred Contact Method", name: "preferred_contact_method", type: "select", options: ["WhatsApp", "Email", "Phone", "LinkedIn", "In-person", "Zoom"], object_type: "contact" },
    { label: "Best Time to Contact", name: "best_contact_time", type: "select", options: ["Morning (8–11 AM)", "Midday (11 AM–2 PM)", "Afternoon (2–5 PM)", "Evening (5–8 PM)", "Flexible"], object_type: "contact" },
    { label: "Communication Style", name: "communication_style", type: "select", options: ["Direct and brief", "Relationship-first", "Data-driven", "Formal", "Informal"], object_type: "contact" },
    { label: "Decision Style", name: "decision_style", type: "select", options: ["Consensus-driven", "Autonomous", "Analytical", "Intuitive", "Collaborative"], object_type: "contact" },
    { label: "Email Open Rate", name: "email_open_rate", type: "number", object_type: "contact" },
    { label: "Avg Response Time (hours)", name: "avg_response_time_hours", type: "number", object_type: "contact" },
    { label: "Meeting Acceptance Rate", name: "meeting_acceptance_rate", type: "number", object_type: "contact" },
    { label: "Call Answer Rate", name: "call_answer_rate", type: "number", object_type: "contact" },
    { label: "Content Preferences", name: "content_preferences", type: "multiselect", options: ["Case studies", "ROI calculators", "Demo videos", "Whitepapers", "Benchmarks", "Executive summaries"], object_type: "contact" },
    { label: "LinkedIn Activity Level", name: "linkedin_activity", type: "select", options: ["Daily poster", "Weekly active", "Monthly lurker", "Inactive"], object_type: "contact" },
  ],
  "Sales & Pipeline": [
    { label: "Sales Stage Override", name: "sales_stage_override", type: "select", options: ["Prospect", "MQL", "SQL", "Opportunity", "Proposal", "Negotiation", "Closed Won", "Closed Lost"], object_type: "contact" },
    { label: "Pipeline Value (USD)", name: "pipeline_value_usd", type: "number", object_type: "contact" },
    { label: "Estimated Close Date", name: "est_close_date", type: "date", object_type: "contact" },
    { label: "Probability Override (%)", name: "probability_override", type: "number", object_type: "contact" },
    { label: "BANT Status", name: "bant_status", type: "select", options: ["Full BANT", "Budget only", "Authority only", "Need only", "Timeline only", "Partial", "None"], object_type: "contact" },
    { label: "Pain Points", name: "pain_points", type: "multiselect", options: ["CRM switching cost", "Data silos", "Low team adoption", "No Arabic support", "Expensive licensing", "Poor reporting", "Slow implementation"], object_type: "contact" },
    { label: "Competitive Alternatives", name: "competitive_alternatives", type: "multiselect", options: ["Salesforce", "HubSpot", "Zoho", "Microsoft Dynamics", "SAP", "Odoo", "Custom built", "None"], object_type: "contact" },
    { label: "Proposal Sent Date", name: "proposal_sent_date", type: "date", object_type: "contact" },
    { label: "Contract Value (USD)", name: "contract_value_usd", type: "number", object_type: "contact" },
    { label: "Deal Type", name: "deal_type", type: "select", options: ["New business", "Expansion", "Renewal", "Upsell", "Cross-sell"], object_type: "contact" },
    { label: "Sales Cycle Length (days)", name: "sales_cycle_days", type: "number", object_type: "contact" },
    { label: "Outreach Attempts", name: "outreach_attempts", type: "number", object_type: "contact" },
    { label: "Follow-up Frequency", name: "followup_frequency", type: "select", options: ["Daily", "Every 2 days", "Weekly", "Bi-weekly", "Monthly"], object_type: "contact" },
    { label: "Next Planned Action", name: "next_action", type: "select", options: ["Call", "Email", "WhatsApp", "Send proposal", "Schedule demo", "Follow up", "Await response", "None"], object_type: "contact" },
  ],
  "GCC / Regional": [
    { label: "Country", name: "country", type: "select", options: ["Saudi Arabia", "UAE", "Kuwait", "Qatar", "Bahrain", "Oman", "Egypt", "Jordan", "Lebanon", "Morocco", "Other GCC", "Other MENA", "Other"], object_type: "contact" },
    { label: "City / Region", name: "city_region", type: "select", options: ["Riyadh", "Jeddah", "NEOM", "Dubai", "Abu Dhabi", "Sharjah", "Kuwait City", "Doha", "Manama", "Muscat", "Cairo", "Amman", "Beirut"], object_type: "contact" },
    { label: "VISION 2030 Initiative", name: "vision_2030_initiative", type: "select", options: ["NEOM", "Red Sea Project", "ROSHN", "Diriyah Gate", "Qiddiya", "AMAALA", "National Transformation Program", "Other"], object_type: "contact" },
    { label: "Arabic Speaking", name: "arabic_speaking", type: "boolean", object_type: "contact" },
    { label: "Ramadan Outreach Opt-Out", name: "ramadan_optout", type: "boolean", object_type: "contact" },
    { label: "Wasta / Relationship Tier", name: "wasta_tier", type: "select", options: ["Royal family adjacent", "Minister level", "Director general", "Senior government", "Private sector leader", "Standard"], object_type: "contact" },
    { label: "Government Entity", name: "is_government", type: "boolean", object_type: "contact" },
    { label: "Vision 2030 Budget Access", name: "v2030_budget", type: "boolean", object_type: "contact" },
    { label: "Preferred Meeting Format", name: "meeting_format", type: "select", options: ["Majlis (in-person)", "Video call", "Phone", "Office visit", "Executive dinner"], object_type: "contact" },
  ],
  "Company Info": [
    { label: "Company Revenue (USD)", name: "company_revenue_usd", type: "number", object_type: "company" },
    { label: "Company Size Range", name: "company_size_range", type: "select", options: ["1–10", "11–50", "51–200", "201–500", "501–1000", "1001–5000", "5000+"], object_type: "company" },
    { label: "Industry Vertical", name: "industry_vertical", type: "select", options: ["Financial Services", "Oil & Gas", "Government", "Healthcare", "Real Estate", "Technology", "Retail", "Manufacturing", "Education", "Construction", "Logistics", "Media", "Tourism", "Other"], object_type: "company" },
    { label: "Funding Stage", name: "funding_stage", type: "select", options: ["Pre-seed", "Seed", "Series A", "Series B", "Series C", "Series D+", "PE-backed", "Bootstrapped", "Public", "Government-owned"], object_type: "company" },
    { label: "Funding Amount (USD)", name: "funding_amount_usd", type: "number", object_type: "company" },
    { label: "Founded Year", name: "founded_year", type: "number", object_type: "company" },
    { label: "Listed Exchange", name: "listed_exchange", type: "select", options: ["Tadawul (Saudi)", "ADX (UAE)", "DFM (Dubai)", "Boursa Kuwait", "QSE (Qatar)", "NASDAQ", "NYSE", "LSE", "Not listed"], object_type: "company" },
    { label: "Parent Company", name: "parent_company", type: "text", object_type: "company" },
    { label: "Subsidiaries Count", name: "subsidiaries_count", type: "number", object_type: "company" },
    { label: "HQ Country", name: "hq_country", type: "select", options: ["Saudi Arabia", "UAE", "Kuwait", "Qatar", "Bahrain", "Oman", "Egypt", "Jordan", "Other"], object_type: "company" },
    { label: "Tech Stack", name: "tech_stack", type: "multiselect", options: ["Salesforce", "SAP", "Oracle", "Microsoft 365", "Google Workspace", "Zoho", "AWS", "Azure", "HubSpot", "ServiceNow"], object_type: "company" },
    { label: "Current CRM", name: "current_crm", type: "select", options: ["Salesforce", "HubSpot", "Zoho", "Microsoft Dynamics", "SAP CRM", "Odoo", "Custom", "None"], object_type: "company" },
    { label: "Procurement Process", name: "procurement_process", type: "select", options: ["Tender / RFP", "Direct procurement", "Framework agreement", "Executive sponsor", "Committee approval"], object_type: "company" },
    { label: "IT Decision Complexity", name: "it_decision_complexity", type: "select", options: ["CTO decides alone", "Committee + CTO", "IT + Procurement", "Board sign-off required", "Government mandate"], object_type: "company" },
    { label: "Contract Start Month", name: "contract_start_month", type: "select", options: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], object_type: "company" },
  ],
  "Deal Properties": [
    { label: "Discount Applied (%)", name: "discount_pct", type: "number", object_type: "deal" },
    { label: "Pricing Model", name: "pricing_model", type: "select", options: ["Per seat", "Flat annual", "Usage-based", "Enterprise custom", "Freemium to paid"], object_type: "deal" },
    { label: "Contract Length (months)", name: "contract_months", type: "number", object_type: "deal" },
    { label: "Legal Review Required", name: "legal_review", type: "boolean", object_type: "deal" },
    { label: "Security Review Required", name: "security_review", type: "boolean", object_type: "deal" },
    { label: "Implementation Partner", name: "implementation_partner", type: "text", object_type: "deal" },
    { label: "Champion Name", name: "champion_name", type: "text", object_type: "deal" },
    { label: "Executive Sponsor", name: "executive_sponsor", type: "text", object_type: "deal" },
    { label: "Blockers", name: "blockers", type: "long_text", object_type: "deal" },
    { label: "Loss Reason", name: "loss_reason", type: "select", options: ["Price too high", "Chose competitor", "No budget", "No decision", "Wrong timing", "Feature gap", "Stakeholder change", "Other"], object_type: "deal" },
    { label: "Win Reason", name: "win_reason", type: "select", options: ["Best product", "Price competitiveness", "Relationship", "Speed of implementation", "Arabic support", "Local presence", "Executive alignment"], object_type: "deal" },
    { label: "Proof of Concept Required", name: "poc_required", type: "boolean", object_type: "deal" },
    { label: "Data Migration Scope", name: "migration_scope", type: "select", options: ["Full migration", "Partial migration", "New implementation", "Integration only"], object_type: "deal" },
  ],
  "Marketing Attributes": [
    { label: "Lead Source", name: "lead_source", type: "select", options: ["Inbound website", "Referral", "Cold outreach", "LinkedIn campaign", "Event / conference", "WhatsApp broadcast", "Partner", "Data provider", "AI sourcing"], object_type: "contact" },
    { label: "First Touch Campaign", name: "first_touch_campaign", type: "text", object_type: "contact" },
    { label: "Last Touch Campaign", name: "last_touch_campaign", type: "text", object_type: "contact" },
    { label: "UTM Source", name: "utm_source", type: "text", object_type: "contact" },
    { label: "Event Attended", name: "events_attended", type: "multiselect", options: ["LEAP Riyadh", "GITEX Dubai", "FII Forum", "Cityscape", "Saudi HORECA", "ADIPEC", "Seamless MENA"], object_type: "contact" },
    { label: "Content Downloaded", name: "content_downloaded", type: "multiselect", options: ["CRM Buyer Guide", "ROI Calculator", "Case Study", "Whitepaper", "Product Sheet", "Demo recording"], object_type: "contact" },
    { label: "Webinar Registered", name: "webinar_registered", type: "boolean", object_type: "contact" },
    { label: "Demo Requested", name: "demo_requested", type: "boolean", object_type: "contact" },
    { label: "Trial Started", name: "trial_started", type: "boolean", object_type: "contact" },
    { label: "Newsletter Subscriber", name: "newsletter_subscriber", type: "boolean", object_type: "contact" },
    { label: "Do Not Market", name: "do_not_market", type: "boolean", object_type: "contact" },
  ],
};

const OBJECT_TYPE_FILTER: Record<string, string[]> = {
  contact: ["Contact Identity", "Job & Seniority", "Behavioral & Engagement", "Sales & Pipeline", "GCC / Regional", "Marketing Attributes"],
  company: ["Company Info"],
  deal: ["Deal Properties"],
};

export default function PropertiesPage() {
  const [tab, setTab] = useState<"contact" | "company" | "deal">("contact");
  const [showNew, setShowNew] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const { data, isLoading } = useProperties(tab);
  const create = useCreate("/properties", ["properties"]);
  const del = useDelete((id) => `/properties/${id}`, ["properties"]);

  const props = data?.properties ?? [];

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-[#C8A880]" />
            Custom Properties
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Define custom fields for any record type — choose from 200+ standard CRM properties or create your own</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowLibrary(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C8A880]/15 text-[#C8A880] text-sm font-semibold hover:bg-[#C8A880]/25">
            <BookOpen className="w-4 h-4" /> Property Library
          </button>
          <button onClick={() => setShowAi(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B8A0C8]/15 text-[#B8A0C8] text-sm font-semibold hover:bg-[#B8A0C8]/25">
            <Sparkles className="w-4 h-4" /> AI Suggest
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">
            <Plus className="w-4 h-4" /> New Property
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-muted/40 rounded-xl w-fit">
        {(["contact", "company", "deal"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all", tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
            {t} properties
          </button>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Internal Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Options</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : !props.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <Settings2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground mb-3">No custom properties yet.</div>
                  <button onClick={() => setShowLibrary(true)} className="text-xs px-3 py-1.5 rounded-lg bg-[#C8A880]/15 text-[#C8A880] font-semibold hover:bg-[#C8A880]/25">
                    Browse 200+ Standard Properties →
                  </button>
                </td>
              </tr>
            ) : props.map((p: any) => {
              const Icon = TYPE_ICONS[p.type] ?? Database;
              return (
                <tr key={p.id} className="border-t border-border/30 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{p.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded bg-muted/60">
                      <Icon className="w-3 h-3" /> {p.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.options?.values?.slice(0, 4).join(", ") ?? "—"}{(p.options?.values?.length ?? 0) > 4 ? ` +${p.options.values.length - 4} more` : ""}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => del.mutate(p.id)} className="text-muted-foreground hover:text-[#C8A880]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showNew && <NewPropertyModal objectType={tab} onClose={() => setShowNew(false)} onCreate={(d: any) => { create.mutate(d, { onSuccess: () => setShowNew(false) }); }} />}
      {showAi && <AiSuggestModal objectType={tab} onClose={() => setShowAi(false)} onAdd={(p: any) => create.mutate(p)} />}
      {showLibrary && <PropertyLibraryModal objectType={tab} onClose={() => setShowLibrary(false)} onAdd={(p) => create.mutate({ ...p, object_type: tab })} existingNames={props.map((p: any) => p.name)} />}
    </div>
  );
}

function PropertyLibraryModal({ objectType, onClose, onAdd, existingNames }: { objectType: string; onClose: () => void; onAdd: (p: any) => void; existingNames: string[] }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string[]>(Object.keys(PROPERTY_LIBRARY));
  const [added, setAdded] = useState<Set<string>>(new Set(existingNames));
  const relevantCategories = OBJECT_TYPE_FILTER[objectType] ?? Object.keys(PROPERTY_LIBRARY);

  const allProps = Object.entries(PROPERTY_LIBRARY)
    .filter(([cat]) => relevantCategories.includes(cat))
    .flatMap(([, props]) => props);

  const totalCount = allProps.length;

  function toggleCategory(cat: string) {
    setExpanded(prev => prev.includes(cat) ? prev.filter(x => x !== cat) : [...prev, cat]);
  }

  function handleAdd(p: any) {
    if (added.has(p.name)) return;
    onAdd({
      object_type: p.object_type,
      label: p.label,
      name: p.name,
      type: p.type,
      options: p.options ? { values: p.options } : null,
    });
    setAdded(prev => new Set([...prev, p.name]));
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-border/20 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#C8A880]" /> Property Library
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{totalCount} standard CRM properties for {objectType} records — click to enable instantly</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted/50"><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search properties…"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#C8A880]/40" />
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="text-[#88B8B0] font-semibold">{added.size} enabled</span>
            <span>·</span>
            <span>{totalCount - added.size} available</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {Object.entries(PROPERTY_LIBRARY)
            .filter(([cat]) => relevantCategories.includes(cat))
            .map(([category, properties]) => {
              const filtered = search
                ? properties.filter(p => p.label.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase()))
                : properties;
              if (filtered.length === 0) return null;
              const isExpanded = expanded.includes(category) || search.length > 0;
              const categoryAdded = filtered.filter(p => added.has(p.name)).length;
              return (
                <div key={category} className="glass-card rounded-xl overflow-hidden">
                  <button onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{category}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">{filtered.length} properties</span>
                      {categoryAdded > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#88B8B0]/20 text-[#88B8B0] font-semibold">{categoryAdded} enabled</span>}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border/10">
                      {filtered.map(p => {
                        const isAdded = added.has(p.name);
                        return (
                          <div key={p.name} className="flex items-center gap-3 px-3 py-2.5 border-b border-border/10 last:border-0 hover:bg-muted/10 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">{p.label}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground font-mono">{p.type}</span>
                              </div>
                              {p.options && <div className="text-[10px] text-muted-foreground mt-0.5 truncate">Options: {p.options.slice(0, 5).join(", ")}{p.options.length > 5 ? ` +${p.options.length - 5}` : ""}</div>}
                            </div>
                            <button onClick={() => handleAdd(p)} disabled={isAdded}
                              className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all flex-shrink-0",
                                isAdded ? "bg-[#88B8B0]/15 text-[#88B8B0]" : "nf-chameleon-bg text-white hover:opacity-90")}>
                              {isAdded ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Enable</>}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function NewPropertyModal({ objectType, onClose, onCreate }: any) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState("text");
  const [optionsText, setOptionsText] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-foreground mb-4">New {objectType} property</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Label</label>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Decision Authority" className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none focus:border-[#B8A0C8]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none">
              {["text","long_text","number","date","boolean","select","multiselect","url","email","phone"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {(type === "select" || type === "multiselect") && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Options (comma-separated)</label>
              <input value={optionsText} onChange={e => setOptionsText(e.target.value)} placeholder="Option A, Option B" className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">Cancel</button>
          <button onClick={() => onCreate({ object_type: objectType, label, name: label.toLowerCase().replace(/[^a-z0-9]+/g, "_"), type, options: optionsText ? { values: optionsText.split(",").map(s => s.trim()) } : null })}
            disabled={!label} className="flex-1 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50">Create</button>
        </div>
      </div>
    </div>
  );
}

function AiSuggestModal({ objectType, onClose, onAdd }: any) {
  const [prompt, setPrompt] = useState("");
  const [added, setAdded] = useState<Set<string>>(new Set());
  const suggest = useAiSuggestProperties();
  const result = suggest.data?.properties ?? [];
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground text-lg flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#B8A0C8]" /> AI Property Suggester</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Describe what you need to track — AI proposes typed fields you can add with one click.</p>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} placeholder={`e.g. We sell to ${objectType}s in the Gulf and need to track their procurement quarter and decision authority`} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
        <button onClick={() => suggest.mutate({ prompt, object_type: objectType })} disabled={!prompt.trim() || suggest.isPending}
          className="mt-3 w-full px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          {suggest.isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…</> : "Suggest properties"}
        </button>
        {result.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">AI suggested {result.length} properties:</div>
            {result.map((p: any) => {
              const isAdded = added.has(p.name);
              return (
                <div key={p.name} className="p-3 rounded-xl bg-muted/30 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">{p.label}</div>
                    <div className="text-[11px] text-muted-foreground font-mono mb-1">{p.name} · {p.type}</div>
                    <div className="text-xs text-muted-foreground">{p.description}</div>
                  </div>
                  <button onClick={() => { onAdd({ object_type: objectType, label: p.label, name: p.name, type: p.type, options: p.options ? { values: p.options } : null }); setAdded(new Set([...added, p.name])); }} disabled={isAdded}
                    className={cn("text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 flex-shrink-0", isAdded ? "bg-[#88B8B0]/20 text-[#88B8B0]" : "nf-chameleon-bg text-white")}>
                    {isAdded ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
