# Sherlock (username → social presence)

- **Layer/tier:** OSINT (people). Not a page scraper — checks 15+ platforms for a username.
- **Role bindings:** `scout_osint` tool; Scout `POST /scout/osint/social`; Relationship Agent 2 (hidden contacts); Signals individual.
- **Env vars:** `SCOUT_URL`; Sherlock installed in Scout image.
- **How:** given a username → `{found:[{platform,url,title}], not_found, found_count}` across Twitter/Instagram/LinkedIn/FB/YouTube/TikTok/GitHub/etc.
- **Cost:** $0.
- **Escalate when:** sparse hits → pair with TheHarvester (domain) + Perplexity person research.
- **Fallback:** Scout down → skip, mark OSINT unavailable.
- **Notes:** add to Relationship Tree Agent 2 enrichment for stakeholders without public emails.
