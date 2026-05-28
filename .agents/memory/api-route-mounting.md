---
name: API route mounting pattern
description: When to use router.use(r) vs router.use("/prefix", r) for Express sub-routers in the api-server
---

## Rule
If a sub-router embeds the full API path inside each handler (e.g. `router.get("/masaar/jobs", ...)`), mount it with **no prefix**: `router.use(router)`.

If a sub-router uses relative paths (e.g. `router.get("/jobs", ...)`), mount with a prefix: `router.use("/masaar", router)`.

Mixing these causes double-prefixing: `/masaar` mount + `/masaar/jobs` handler → actual path `/masaar/masaar/jobs` (404).

## Convention in this codebase
All new engine routers (masaar, builder, scout, seeder, orcengine, meshbase, relationship-intel, prosengine-chat) embed the full path in each handler and are mounted with `router.use(r)` — no prefix string.

The legacy `prosengineRouter` is an exception: it uses relative paths and is mounted at `router.use("/prosengine", prosengineRouter)`.

**Why:** Discovered when masaar/builder routes returned 404 after being mounted with prefix — the handler paths already included the prefix segment.
