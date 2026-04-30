/**
 * Intelligence Engines — public surface.
 * Each engine: input → report. All run synchronously (we await the full
 * pipeline) but most agents inside fire in parallel.
 */

export { runMasaarPipeline } from "./masaar.js";
export { runPersonIntel } from "./prosengine-person.js";
export { runCompanyIntel } from "./prosengine-company.js";
export { findLeadsByCompany } from "./lead-finder.js";
export type {
  EngineKind,
  EngineRunEnvelope,
  MasaarInput, MasaarReport,
  PersonIntelInput, PersonIntelReport,
  CompanyIntelInput, CompanyIntelReport,
  LeadFinderInput, LeadFinderReport, DiscoveredLead,
} from "./types.js";
