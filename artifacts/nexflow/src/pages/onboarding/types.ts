export type SetupPath = "managed" | "self";
export type BrandMode = "pick" | "upload" | "mesh" | "ai";

export interface SetupAnswers {
  companyName: string;
  companyNameAr: string;
  industry: string;
  companySize: string;
  countries: string[];
  crNumber: string;
  companyWebsite: string;
  linkedinPage: string;
  logoBase64: string;
  brandMode: BrandMode;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  meshColors: [string, string, string];
  brandGuidelinesName: string;
  brandVibeAi: string;
  brandHeritageAi: string;
  brandFeelingAi: string;
  tabStructure: string[];

  seatsSales: number;
  seatsSDR: number;
  seatsMarketing: number;
  seatsManagement: number;
  currentCrm: string;
  migrationNeeded: boolean;

  enabledModules: string[];

  monthlyLeadVolume: string;
  enrichmentCreditsMonthly: number;
  budgetRangeSAR: string;
  timeline: string;

  integrations: string[];
  trainingNeeded: boolean;
  supportLevel: string;

  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
}

export const defaultAnswers: SetupAnswers = {
  companyName: "",
  companyNameAr: "",
  industry: "",
  companySize: "11-50",
  countries: ["Saudi Arabia"],
  crNumber: "",
  companyWebsite: "",
  linkedinPage: "",
  logoBase64: "",
  brandMode: "pick",
  primaryColor: "#B8A0C8",
  secondaryColor: "#88B8B0",
  accentColor: "#C8A880",
  meshColors: ["#B8A0C8", "#88B8B0", "#C8A880"],
  brandGuidelinesName: "",
  brandVibeAi: "",
  brandHeritageAi: "",
  brandFeelingAi: "",
  tabStructure: ["home", "leads", "callcenter", "datahub", "marketing", "insights"],
  seatsSales: 5,
  seatsSDR: 2,
  seatsMarketing: 2,
  seatsManagement: 1,
  currentCrm: "none",
  migrationNeeded: false,
  enabledModules: ["core"],
  monthlyLeadVolume: "100-500",
  enrichmentCreditsMonthly: 1000,
  budgetRangeSAR: "5000-15000",
  timeline: "1-2 months",
  integrations: [],
  trainingNeeded: true,
  supportLevel: "standard",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  notes: "",
};

export interface PricingLine {
  name: string;
  unit: string;
  monthly: number;
}

export interface PricingBreakdown {
  lines: PricingLine[];
  totalMonthly: number;
  setupFee: number;
  timelineWeeks: number;
  annualTotal: number;
}

export interface SetupSession {
  id: string;
  setupPath: SetupPath;
  status: "draft" | "proposal_generated" | "approved" | "completed";
  answers: SetupAnswers;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalData {
  id: string;
  sessionId: string;
  version: number;
  pricing: PricingBreakdown;
  executiveSummary: string;
  moduleRationale: Record<string, string>;
  roiProjection: { metric: string; value: string }[];
  implementationPhases: { phase: string; weeks: string; tasks: string[] }[];
  nextSteps: string[];
  createdAt: string;
}

export const TABS_META: Record<string, { label: string; icon: string }> = {
  home:       { label: "Home",        icon: "🏠" },
  leads:      { label: "Leads",       icon: "👥" },
  callcenter: { label: "Call Center", icon: "📞" },
  datahub:    { label: "Data Hub",    icon: "🗄️" },
  marketing:  { label: "Marketing",   icon: "📣" },
  insights:   { label: "Insights",    icon: "📊" },
};

export const INDUSTRIES = [
  "Financial Services & Banking",
  "Real Estate & Property",
  "Oil, Gas & Energy",
  "Government & Public Sector",
  "Healthcare & Pharmaceuticals",
  "Technology & Software",
  "Telecommunications",
  "Retail & E-commerce",
  "Construction & Contracting",
  "Education & Training",
  "Logistics & Supply Chain",
  "Manufacturing",
  "Media & Advertising",
  "Legal & Professional Services",
  "Tourism & Hospitality",
  "Insurance",
  "Automotive",
  "Food & Beverage",
  "Agriculture",
  "Other",
];

export const GCC_COUNTRIES = [
  "Saudi Arabia", "UAE", "Kuwait", "Qatar", "Bahrain", "Oman",
  "Egypt", "Jordan", "Lebanon", "Iraq",
];

export const COMPANY_SIZES = [
  { value: "1-10",     label: "1–10" },
  { value: "11-50",    label: "11–50" },
  { value: "51-200",   label: "51–200" },
  { value: "201-1000", label: "201–1,000" },
  { value: "1000+",    label: "1,000+" },
];

export const CRM_OPTIONS = [
  { value: "none",      label: "Spreadsheets" },
  { value: "salesforce",label: "Salesforce" },
  { value: "hubspot",   label: "HubSpot" },
  { value: "zoho",      label: "Zoho CRM" },
  { value: "pipedrive", label: "Pipedrive" },
  { value: "dynamics",  label: "Dynamics 365" },
  { value: "freshsales",label: "Freshsales" },
  { value: "other",     label: "Other" },
];

export interface ModuleDef {
  id: string;
  name: string;
  desc: string;
  price: string;
  required: boolean;
  category: string;
  popular?: boolean;
  colorClass: string;
}

export const MODULES: ModuleDef[] = [
  { id: "core",             name: "Core CRM",           desc: "Contacts, deals, pipelines, tasks, activities and timeline",       price: "SAR 149/seat",  required: true,  category: "Foundation", colorClass: "from-[#B8A0C8] to-[#C0A0B8]" },
  { id: "dialer",           name: "Power Dialer",        desc: "Auto-dial queue, live AI coaching, call scoring & playbooks",      price: "SAR 89/seat",   required: false, category: "Engagement",  popular: true, colorClass: "from-blue-500 to-blue-700" },
  { id: "enrichment",       name: "AI Enrichment",       desc: "Pull verified data from 15+ GCC sources automatically",            price: "From SAR 50/mo",required: false, category: "Data",        popular: true, colorClass: "from-purple-500 to-purple-700" },
  { id: "marketing",        name: "Marketing Suite",     desc: "Campaigns, web forms, audience segments and performance analytics", price: "SAR 299/mo",    required: false, category: "Growth",      colorClass: "from-rose-500 to-rose-700" },
  { id: "voice-agents",     name: "AI Voice Agents",     desc: "24/7 Arabic + English AI calling, qualification and handoff",      price: "SAR 599/mo",    required: false, category: "Engagement",  colorClass: "from-cyan-500 to-cyan-700" },
  { id: "intelligence",     name: "Conversation Intel",  desc: "Transcription, sentiment scoring and objection detection",         price: "SAR 199/mo",    required: false, category: "Intelligence",colorClass: "from-amber-500 to-amber-600" },
  { id: "forecasting",      name: "Forecasting",         desc: "Revenue prediction, quota tracking and gap analysis dashboards",   price: "SAR 149/mo",    required: false, category: "Intelligence",colorClass: "from-emerald-500 to-emerald-700" },
  { id: "cpq",              name: "CPQ & Quotes",        desc: "Price quotes, discount approval workflows and e-contracts",        price: "SAR 99/mo",     required: false, category: "Revenue",     colorClass: "from-orange-500 to-orange-700" },
  { id: "website-tracking", name: "Website Tracking",    desc: "Track lead behaviour on your website in real-time",               price: "SAR 199/mo",    required: false, category: "Data",        colorClass: "from-teal-500 to-teal-700" },
];

export const INTEGRATIONS_LIST = [
  { id: "whatsapp",    label: "WhatsApp Business API", emoji: "💬" },
  { id: "email",       label: "Email / SMTP",          emoji: "📧" },
  { id: "calendar",    label: "Google / Outlook Cal.", emoji: "📅" },
  { id: "erp",         label: "ERP (SAP / Oracle)",    emoji: "🏭" },
  { id: "gov-moci",    label: "MoCI Registry",         emoji: "🏛️" },
  { id: "gov-etimad",  label: "Etimad Procurement",    emoji: "📋" },
  { id: "zatca",       label: "ZATCA e-Invoicing",     emoji: "🧾" },
  { id: "website",     label: "Company Website",       emoji: "🌐" },
  { id: "linkedin",    label: "LinkedIn",              emoji: "💼" },
  { id: "zapier",      label: "Zapier / Make",         emoji: "⚡" },
];

export const LEAD_VOLUMES = [
  { value: "<100",      label: "Under 100 leads/mo" },
  { value: "100-500",   label: "100–500 leads/mo" },
  { value: "500-2000",  label: "500–2,000 leads/mo" },
  { value: "2000-10000",label: "2,000–10,000 leads/mo" },
  { value: "10000+",    label: "10,000+ leads/mo" },
];

export const BUDGET_RANGES = [
  { value: "0-5000",     label: "Up to SAR 5,000/mo" },
  { value: "5000-15000", label: "SAR 5,000–15,000/mo" },
  { value: "15000-30000",label: "SAR 15,000–30,000/mo" },
  { value: "30000-60000",label: "SAR 30,000–60,000/mo" },
  { value: "60000+",     label: "SAR 60,000+/mo" },
];

export const TIMELINES = [
  { value: "asap",     label: "As soon as possible" },
  { value: "1 month",  label: "Within 1 month" },
  { value: "1-2 months",label: "1–2 months" },
  { value: "3+ months",label: "3+ months" },
  { value: "flexible", label: "Flexible" },
];

export const BRAND_VIBES = [
  "Luxury & Premium",
  "Technology & Innovation",
  "Corporate & Traditional",
  "Government & Institutional",
  "Healthcare & Trust",
  "Creative & Bold",
  "Khaleeji Heritage",
  "Startup & Agile",
];

export const BRAND_HERITAGES = [
  "Saudi", "Emirati", "Kuwaiti", "Qatari", "Bahraini", "Omani", "Pan-GCC", "International",
];

export const BRAND_FEELINGS = [
  "Professional", "Trustworthy", "Dynamic", "Calm", "Bold", "Sophisticated", "Approachable", "Authoritative",
];

export const BRAND_PRESET_PALETTES: Record<string, { primary: string; secondary: string; accent: string; name: string }> = {
  "Luxury & Premium":            { primary: "#1a1a2e", secondary: "#c9a84c", accent: "#8B5CF6", name: "Midnight Gold" },
  "Technology & Innovation":     { primary: "#6366f1", secondary: "#06b6d4", accent: "#f59e0b", name: "Quantum Blue" },
  "Corporate & Traditional":     { primary: "#1e3a5f", secondary: "#2d6a4f", accent: "#e9c46a", name: "Navy & Forest" },
  "Government & Institutional":  { primary: "#003049", secondary: "#d62828", accent: "#f77f00", name: "National Heritage" },
  "Healthcare & Trust":          { primary: "#0077b6", secondary: "#00b4d8", accent: "#48cae4", name: "Clinical Blue" },
  "Creative & Bold":             { primary: "#e63946", secondary: "#457b9d", accent: "#f1faee", name: "Vivid Studio" },
  "Khaleeji Heritage":           { primary: "#006400", secondary: "#c8a951", accent: "#8b0000", name: "Desert Royal" },
  "Startup & Agile":             { primary: "#B8A0C8", secondary: "#88B8B0", accent: "#C8A880", name: "NexFlow Signature" },
};
