# TheHarvester (domain → emails / subdomains / hosts) [planned client]

- **Layer/tier:** OSINT (org). Domain reconnaissance.
- **Role bindings:** Scout OSINT harvest (`/scout/osint/harvest`); `theharvester-client.ts` [engine branch]; Relationship Agent 2; Lead Factory deep enrichment.
- **Env vars:** `THEHARVESTER_BIN` (or Scout-bundled), `SCOUT_URL`.
- **How:** enumerates a domain's emails, subdomains, hosts, MX, email patterns from public sources (crt.sh, search engines, DNS).
- **Cost:** $0 (rate-limited by public sources).
- **Escalate when:** thin results → Hunter.io (`HUNTER_API_KEY`) for email patterns.
- **Fallback:** Scout `/osint/harvest` (crt.sh + brute subdomains + whois) if binary absent.
- **Notes:** complements Sherlock — domain side vs username side.
