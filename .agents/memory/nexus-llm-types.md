---
name: Nexus LLM router types
description: Type contracts for nexusRunRole, synthesize helpers, ScrapeOptions, screenSanctions, JobRegistry, OrgNode, and RelationshipIntelBrief
---

## nexusRunRole
Returns `Promise<NexusGenerateResult>` where `NexusGenerateResult = { text: string; model: string; provider: string; usage? }`.
- ALWAYS extract `.text` to get the string response.
- Pattern for optional fallback: `.then(r => r.text).catch(() => "")`
- Role must be cast: `role as import("../lib/nexus/roles.js").AgentRole`

## synthesizeClaude / synthesizeGpt
Both in `lib/engines/_ai.ts` and return `Promise<string>` (NOT NexusGenerateResult).
- Do NOT add `.text` — they already return a plain string.

## ScrapeOptions / ScrapeResult (power-scraper)
- `forceEngine` not `engine` for single-engine override
- `timeoutMs` not `timeout`
- `ScrapeResult` has no `.ok` field — check `!result.error && !result.blocked`

## screenSanctions
- Signature: `screenSanctions(name: string, aliases: string[] = [])`
- First arg is a single string, NOT an array
- Result: `{ matched: boolean; source?: string; score?: number }` — NOT `.ofac`, `.un`, `.eu`

## JobRegistry
- Has `create()`, `get()`, `cancel()`, `attach()`, `delete()` — NO `status()` method
- Check existence: `{ exists: registry.get(jobId) !== undefined }`

## fanOut (nexus/index.ts)
- Takes `JobSpec<T>[]` not plain `string[]`
- For parallel nexusRunRole calls use `Promise.all(prompts.map(p => nexusRunRole(...).then(r => r.text).catch(() => "")))`

## OrgNode (relationship-intel schema)
- Fields: `nameEn`, `title`, `linkedin` (NOT `name`, `role`, `linkedinUrl`)

## RelationshipIntelBrief
- Field: `targetCompanyName` (NOT `companyName`)
- No `companyId` field

## DB table columns (contacts)
- `title` not `job_title`
- `linkedin_url`, `company_id` (uuid), `org_id`

## scoutSiteIntel / scoutSignalsFull (scout-client)
- `scoutSiteIntel(url: string, opts?: { followSubpages?, timeout? })` — second arg is options object, NOT a URL string
- `scoutSignalsFull(companyName: string, opts?: { domain?, includeNews?, ... })` — second arg is options object, use `{ domain: url }` not raw URL string

**Why:** These were all discovered during the Sasen328/Enrich port — wrong types caused 30+ TS errors. Patterns are unintuitive because nexusRunRole looks like it should return string but doesn't.
