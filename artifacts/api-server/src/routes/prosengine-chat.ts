// ─── /api/prosengine-chat — ProsEngine AI Chat ───────────────────────────────
//
//  Conversational interface for ProsEngine tools — lets users describe what they
//  want (company intel, person research, signal scan) in natural language and
//  get a structured response via the NEXUS planner → tool dispatch loop.
//
//  POST /api/prosengine-chat/stream  — streaming chat (SSE)
//  GET  /api/prosengine-chat/history — list recent chat sessions
//
// ─────────────────────────────────────────────────────────────────────────────

import { Router, type Request, type Response } from "express";
import { nexusRunRole } from "../lib/nexus/index.js";

const router = Router();

// ── Streaming chat ────────────────────────────────────────────────────────────

router.post("/prosengine-chat/stream", async (req: Request, res: Response): Promise<void> => {
  const { message, sessionId, context } = req.body as {
    message?: string;
    sessionId?: string;
    context?: Record<string, unknown>;
  };

  if (!message) { res.status(400).json({ error: "message required" }); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (data: Record<string, unknown>) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    send({ type: "intent", sessionId: sessionId || "default" });

    // Step 1: Planner determines which ProsEngine tool to use
    const plan = await nexusRunRole("planner", `
The user is using ProsEngine — a Saudi B2B intelligence platform.
Available tools: company_intel, person_intel, website_intel, data_seeder, signal_scan.

User message: "${message}"
Context: ${JSON.stringify(context || {})}

Return JSON:
{
  "intent": "company_intel|person_intel|website_intel|data_seeder|signal_scan|general",
  "target": "name, URL, or query to look up",
  "subTasks": ["task 1", "task 2", ...],
  "response": "direct answer if no tool needed"
}
`, { maxTokens: 500 });

    const parsed = tryParseJson(plan.text);
    send({ type: "plan", plan: parsed || { intent: "general", target: message } });

    const intent = parsed?.intent as string || "general";
    const target = parsed?.target as string || message;

    // Step 2: Execute the right tool
    let toolResult = "";

    if (intent === "company_intel") {
      toolResult = (await nexusRunRole("researcher", `
Research Saudi company "${target}": overview, leadership, financials, products, regulatory status, recent news.
Write a structured intelligence brief (400-600 words) for a B2B sales professional.
`, { maxTokens: 1500 })).text;
    } else if (intent === "person_intel") {
      toolResult = (await nexusRunRole("researcher", `
Research professional "${target}": current role, career history, education, LinkedIn presence, publications, recent activity.
Write a structured profile brief (300-500 words) for relationship-building context.
`, { maxTokens: 1200 })).text;
    } else if (intent === "signal_scan") {
      toolResult = (await nexusRunRole("researcher", `
Find buying signals for "${target}" in Saudi Arabia / GCC:
- Funding rounds, M&A activity, IPO plans
- Executive hiring or departures
- New office openings or expansions
- Government contract wins
- Product launches or partnerships
- Regulatory filings or compliance events

Return structured JSON: { signals: [{ type, description, date, significance: 0-100, sourceUrl }] }
`, { maxTokens: 1500 })).text;
    } else if (intent === "website_intel") {
      const { scrapePage } = await import("../lib/power-scraper.js");
      const scraped = await scrapePage(target, { forceEngine: "playwright-stealth", timeoutMs: 30000 });
      toolResult = (await nexusRunRole("extractor", `
Analyse this website for B2B intelligence about the company.
Extract: company overview, products/services, team size indicators, tech stack, clients, contact info, social links.
Write a structured brief (300-500 words).
Content: ${(scraped.text || "").slice(0, 6000)}
`, { maxTokens: 1200 })).text;
    } else {
      toolResult = (await nexusRunRole("writer", `
Answer this ProsEngine user query about Saudi/GCC B2B intelligence:
"${message}"

Provide a helpful, structured response (200-400 words). Reference relevant ProsEngine capabilities where appropriate.
`, { maxTokens: 800 })).text;
    }

    send({ type: "token", text: toolResult });
    send({ type: "final", intent, target, result: toolResult });
    res.end();
  } catch (err) {
    send({ type: "error", message: String(err) });
    res.end();
  }
});

// ── History (stub — no persistent session DB yet) ─────────────────────────────

router.get("/prosengine-chat/history", (_req: Request, res: Response): void => {
  res.json({ ok: true, sessions: [], message: "Session history not yet persisted" });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tryParseJson(text: string | null | undefined): Record<string, unknown> | null {
  if (!text) return null;
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]) as Record<string, unknown>; } catch { /* */ }
  return null;
}

export default router;
