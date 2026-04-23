export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  leadScore: number;
  stage: "buying-now" | "warm" | "cold" | "champion";
  channels: ("call" | "whatsapp" | "email" | "linkedin")[];
  notes: string;
  lastContactDays: number;
  pipelineValue: number;
  signals: string[];
  tags: string[];
  initials: string;
};

export type Deal = {
  id: string;
  name: string;
  contact: string;
  company: string;
  value: number;
  stage: "Discovery" | "Qualified" | "Proposal" | "Negotiation" | "Closed Won";
  probability: number;
  closeDate: string;
  health: "hot" | "warm" | "at-risk";
};

export type Signal = {
  id: string;
  title: string;
  contact: string;
  company: string;
  description: string;
  source: "Crunchbase" | "LinkedIn" | "WhatsApp" | "Email" | "Apollo" | "Web";
  intent: number;
  hoursAgo: number;
};

export type Agent = {
  id: string;
  name: string;
  voice: string;
  language: string;
  model: string;
  status: "live" | "idle" | "training";
  callsToday: number;
  qualRate: number;
  concurrent: number;
  avatar: string;
};

export type LiveCall = {
  id: string;
  contact: string;
  company: string;
  agent: string;
  durationSec: number;
  phase: "discovery" | "qualifying" | "objection" | "closing";
  sentiment: "positive" | "neutral" | "negative";
  lastUtterance: string;
};

export type Prospect = {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  location: string;
  fundingStage: string;
  intent: number;
  confidence: number;
  source: string;
  initials: string;
};

export const CONTACTS: Contact[] = [
  {
    id: "c1",
    firstName: "Sara",
    lastName: "Al-Mansouri",
    title: "Managing Partner",
    company: "Gulf Ventures",
    email: "sara@gulfventures.sa",
    phone: "+966501234567",
    location: "Riyadh, Saudi Arabia",
    leadScore: 92,
    stage: "buying-now",
    channels: ["call", "whatsapp", "email", "linkedin"],
    notes: "Series B announced last night. Decision maker. High urgency.",
    lastContactDays: 2,
    pipelineValue: 1010500000,
    signals: ["Closed $50M Series B", "Visited pricing 4×", "Hired 3 SDRs"],
    tags: ["decision-maker", "vip", "warm"],
    initials: "SA",
  },
  {
    id: "c2",
    firstName: "Ahmed",
    lastName: "Al-Rashidi",
    title: "VP of Sales",
    company: "Riyadh Capital",
    email: "ahmed@riyadhcapital.sa",
    phone: "+966502345678",
    location: "Riyadh, Saudi Arabia",
    leadScore: 87,
    stage: "warm",
    channels: ["call", "email"],
    notes: "Evaluating NexFlow for 200-seat deployment. Procurement engaged.",
    lastContactDays: 1,
    pipelineValue: 216000000,
    signals: ["Demo completed", "Procurement engaged"],
    tags: ["champion", "warm"],
    initials: "AA",
  },
  {
    id: "c3",
    firstName: "Nora",
    lastName: "Al-Faisal",
    title: "Director of Operations",
    company: "Riyadh Capital",
    email: "nora@riyadhcapital.sa",
    phone: "+966503456789",
    location: "Riyadh, Saudi Arabia",
    leadScore: 82,
    stage: "warm",
    channels: ["call", "whatsapp"],
    notes: "Technical evaluator for the Riyadh Capital deal.",
    lastContactDays: 4,
    pipelineValue: 27000000,
    signals: ["Joined eval call", "Asked about API"],
    tags: ["evaluator"],
    initials: "NA",
  },
  {
    id: "c4",
    firstName: "Mohammed",
    lastName: "Al-Otaibi",
    title: "Chief Digital Officer",
    company: "Aramco Digital",
    email: "mohammed@aramco-digital.sa",
    phone: "+966504567890",
    location: "Dhahran, Saudi Arabia",
    leadScore: 71,
    stage: "warm",
    channels: ["whatsapp", "email"],
    notes: "Budget approved Q2. Push contract this week.",
    lastContactDays: 6,
    pipelineValue: 480000000,
    signals: ["Budget approved", "Internal champion"],
    tags: ["enterprise", "vip"],
    initials: "MA",
  },
  {
    id: "c5",
    firstName: "Layla",
    lastName: "Hassan",
    title: "Founder & CEO",
    company: "Cairo Cloud",
    email: "layla@cairocloud.eg",
    phone: "+201001234567",
    location: "Cairo, Egypt",
    leadScore: 65,
    stage: "cold",
    channels: ["email", "linkedin"],
    notes: "Score dropped 72→65. No response to last 2 emails.",
    lastContactDays: 9,
    pipelineValue: 9500000,
    signals: ["No response 9d"],
    tags: ["at-risk"],
    initials: "LH",
  },
  {
    id: "c6",
    firstName: "Khalid",
    lastName: "Al-Hamdan",
    title: "Head of Sales Ops",
    company: "Dubai Holdings",
    email: "khalid@dubaiholdings.ae",
    phone: "+971501112233",
    location: "Dubai, UAE",
    leadScore: 58,
    stage: "cold",
    channels: ["email"],
    notes: "Pilot expansion stalled. No contact in 14 days.",
    lastContactDays: 14,
    pipelineValue: 14500000,
    signals: ["Pilot stalled"],
    tags: ["at-risk"],
    initials: "KA",
  },
  {
    id: "c7",
    firstName: "Fatima",
    lastName: "Khalid",
    title: "Conference Speaker · CRO",
    company: "Doha Tech",
    email: "fatima@dohatech.qa",
    phone: "+97433445566",
    location: "Doha, Qatar",
    leadScore: 78,
    stage: "warm",
    channels: ["whatsapp", "linkedin"],
    notes: "Met at GITEX. Strong fit for AI Voice product.",
    lastContactDays: 5,
    pipelineValue: 32000000,
    signals: ["Event signal", "LinkedIn engagement"],
    tags: ["event"],
    initials: "FK",
  },
];

export const DEALS: Deal[] = [
  { id: "d1", name: "Gulf Ventures Expansion", contact: "Sara Al-Mansouri", company: "Gulf Ventures", value: 158400000, stage: "Negotiation", probability: 78, closeDate: "May 12", health: "hot" },
  { id: "d2", name: "Riyadh Capital — 200 seats", contact: "Ahmed Al-Rashidi", company: "Riyadh Capital", value: 216000000, stage: "Proposal", probability: 62, closeDate: "May 21", health: "hot" },
  { id: "d3", name: "Aramco Digital — Pilot", contact: "Mohammed Al-Otaibi", company: "Aramco Digital", value: 480000000, stage: "Negotiation", probability: 71, closeDate: "Jun 3", health: "warm" },
  { id: "d4", name: "Doha Tech — AI Voice", contact: "Fatima Khalid", company: "Doha Tech", value: 32000000, stage: "Qualified", probability: 45, closeDate: "Jun 18", health: "warm" },
  { id: "d5", name: "Cairo Cloud — SMB", contact: "Layla Hassan", company: "Cairo Cloud", value: 9500000, stage: "Discovery", probability: 22, closeDate: "Jul 1", health: "at-risk" },
  { id: "d6", name: "Dubai Holdings — Pilot", contact: "Khalid Al-Hamdan", company: "Dubai Holdings", value: 14500000, stage: "Discovery", probability: 18, closeDate: "Jul 9", health: "at-risk" },
];

export const SIGNALS: Signal[] = [
  { id: "s1", title: "Gulf Ventures closed $50M Series B", contact: "Sara Al-Mansouri", company: "Gulf Ventures", description: "+$1.2M expansion potential", source: "Crunchbase", intent: 96, hoursAgo: 14 },
  { id: "s2", title: "VP Sales joined Riyadh Capital", contact: "Ahmed Al-Rashidi", company: "Riyadh Capital", description: "New decision maker — re-engage", source: "LinkedIn", intent: 84, hoursAgo: 6 },
  { id: "s3", title: "WhatsApp inbound from Aramco", contact: "Mohammed Al-Otaibi", company: "Aramco Digital", description: "Asked for revised pricing", source: "WhatsApp", intent: 91, hoursAgo: 2 },
  { id: "s4", title: "Doha Tech raised seed", contact: "Fatima Khalid", company: "Doha Tech", description: "Budget freed for AI Voice", source: "Crunchbase", intent: 73, hoursAgo: 22 },
];

export const AGENTS: Agent[] = [
  { id: "a1", name: "Layla", voice: "Saudi-Arabic Female", language: "ar-SA", model: "GPT-4o", status: "live", callsToday: 47, qualRate: 73, concurrent: 8, avatar: "L" },
  { id: "a2", name: "Adam", voice: "MSA Male, Warm", language: "ar-MSA", model: "Claude 3.5", status: "live", callsToday: 32, qualRate: 68, concurrent: 5, avatar: "A" },
  { id: "a3", name: "Noor", voice: "Egyptian-Arabic Female", language: "ar-EG", model: "GPT-4o", status: "idle", callsToday: 19, qualRate: 81, concurrent: 0, avatar: "N" },
  { id: "a4", name: "Faisal", voice: "Khaleeji Male, Confident", language: "ar-AE", model: "GPT-4o", status: "training", callsToday: 0, qualRate: 0, concurrent: 0, avatar: "F" },
];

export const LIVE_CALLS: LiveCall[] = [
  { id: "lc1", contact: "Sara Al-Mansouri", company: "Gulf Ventures", agent: "Layla", durationSec: 247, phase: "qualifying", sentiment: "positive", lastUtterance: "We are looking at deploying for 200 reps by Q3 …" },
  { id: "lc2", contact: "Mohammed Al-Otaibi", company: "Aramco Digital", agent: "Adam", durationSec: 92, phase: "discovery", sentiment: "neutral", lastUtterance: "Tell me more about the Arabic voice quality." },
];

export const PROSPECTS: Prospect[] = [
  { id: "p1", name: "Hassan Al-Sayed", title: "VP Revenue", company: "STC Pay", industry: "Fintech", location: "Riyadh", fundingStage: "Series C", intent: 87, confidence: 94, source: "Lusha", initials: "HA" },
  { id: "p2", name: "Maryam Al-Zahra", title: "Head of Growth", company: "Tabby", industry: "BNPL", location: "Riyadh", fundingStage: "Series D", intent: 79, confidence: 91, source: "Apollo", initials: "MA" },
  { id: "p3", name: "Yousef Al-Maktoum", title: "Director Sales", company: "Careem", industry: "Mobility", location: "Dubai", fundingStage: "Acquired", intent: 71, confidence: 88, source: "Clay Waterfall", initials: "YA" },
  { id: "p4", name: "Reem Khouri", title: "Founder", company: "Nala", industry: "Fintech", location: "Cairo", fundingStage: "Series A", intent: 68, confidence: 82, source: "Crunchbase", initials: "RK" },
  { id: "p5", name: "Omar Al-Faraj", title: "VP Sales", company: "Foodics", industry: "SaaS", location: "Riyadh", fundingStage: "Series C", intent: 64, confidence: 86, source: "ZoomInfo", initials: "OA" },
];

export function formatCurrency(cents: number) {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${dollars.toFixed(0)}`;
}

export function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return { label: "Good morning", icon: "sunrise" as const };
  if (h < 17) return { label: "Good afternoon", icon: "sun" as const };
  return { label: "Good evening", icon: "moon" as const };
}
