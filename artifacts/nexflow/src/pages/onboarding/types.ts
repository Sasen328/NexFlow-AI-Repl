export type SetupPath = "managed" | "self";

export interface SetupAnswers {
  // Step 1 — Company & Branding
  companyName: string;
  companyNameAr: string;
  industry: string;
  companySize: string;
  countries: string[];
  logoBase64: string;
  primaryColor: string;
  tabStructure: string[];

  // Step 2 — Team
  seatsSales: number;
  seatsSDR: number;
  seatsMarketing: number;
  seatsManagement: number;
  currentCrm: string;
  migrationNeeded: boolean;

  // Step 3 — Features
  enabledModules: string[];

  // Step 4 — Volume & Budget
  monthlyLeadVolume: string;
  enrichmentCreditsMonthly: number;
  budgetRangeSAR: string;
  timeline: string;

  // Step 5 — Integrations
  integrations: string[];
  trainingNeeded: boolean;
  supportLevel: string;

  // Step 6 — Contact
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
  logoBase64: "",
  primaryColor: "#4F46E5",
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
  { value: "1-10",     label: "1–10 employees" },
  { value: "11-50",    label: "11–50 employees" },
  { value: "51-200",   label: "51–200 employees" },
  { value: "201-1000", label: "201–1,000 employees" },
  { value: "1000+",    label: "1,000+ employees" },
];

export const CRM_OPTIONS = [
  { value: "none",      label: "No CRM — using spreadsheets" },
  { value: "salesforce",label: "Salesforce" },
  { value: "hubspot",   label: "HubSpot" },
  { value: "zoho",      label: "Zoho CRM" },
  { value: "pipedrive", label: "Pipedrive" },
  { value: "dynamics",  label: "Microsoft Dynamics" },
  { value: "freshsales",label: "Freshsales" },
  { value: "other",     label: "Other" },
];

export const MODULES = [
  { id: "core",             name: "Core CRM",             emoji: "🏗️",  desc: "Contacts, pipelines, deals, tasks, activities",       price: "SAR 149/seat",  required: true  },
  { id: "dialer",           name: "Power Dialer",         emoji: "📞",  desc: "Auto-dial, live AI coaching, call scoring",            price: "SAR 89/seat",   required: false },
  { id: "enrichment",       name: "AI Enrichment",        emoji: "⚡",  desc: "Pull data from 15+ GCC sources automatically",         price: "From SAR 50/mo",required: false },
  { id: "marketing",        name: "Marketing Suite",      emoji: "📣",  desc: "Campaigns, web forms, audiences, performance",         price: "SAR 299/mo",    required: false },
  { id: "voice-agents",     name: "AI Voice Agents",      emoji: "🤖",  desc: "24/7 Arabic + English AI calling & qualification",     price: "SAR 599/mo",    required: false },
  { id: "intelligence",     name: "Conversation Intel",   emoji: "🧠",  desc: "Transcription, scoring, objection detection",          price: "SAR 199/mo",    required: false },
  { id: "forecasting",      name: "Forecasting",          emoji: "📈",  desc: "Revenue prediction, quota tracking, gap analysis",     price: "SAR 149/mo",    required: false },
  { id: "cpq",              name: "CPQ & Quotes",         emoji: "📄",  desc: "Price quotes, discount approvals, e-contracts",        price: "SAR 99/mo",     required: false },
  { id: "website-tracking", name: "Website Tracking",     emoji: "🌐",  desc: "Track lead activity on your website in real-time",    price: "SAR 199/mo",    required: false },
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
