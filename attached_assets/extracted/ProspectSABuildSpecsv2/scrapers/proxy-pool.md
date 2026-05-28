# Proxy pool (rotating residential)

- **Layer/tier:** infrastructure under L2/L3. Rotates egress IPs to beat rate-limits/geo-blocks.
- **Role bindings:** `nexus/proxy-manager.ts` (real, this branch); `lib/scrapers/proxy-pool.ts` [engine branch]; Masaar stealth, Builder/Masaar harvest.
- **Env vars:** `NEXUS_PROXY_ENABLED=true` + one of `WEBSHARE_PROXY_LIST` / `IPROYAL_USER`+`IPROYAL_PASS`+`IPROYAL_ENDPOINT` / `LUNAPROXY_*` / `SIMPLYNODE_*`.
- **How:** picks a proxy per request/session, retires failing IPs, prefers Saudi/GCC egress for gov sites.
- **Cost:** proxy-provider metered (bandwidth/IP).
- **Escalate when:** repeated blocks on one IP → rotate; exhausted pool → back off + retry later.
- **Fallback:** disabled (`NEXUS_PROXY_ENABLED=false`) → direct connection.
- **Notes:** keep OFF in dev to avoid spend; ON for production gov-registry harvesting.
