/**
 * Claude Agent Orchestrator
 *
 * Runs an iterative tool-use loop against Claude (via @anthropic-ai/sdk).
 * Falls back to NEXUS (Kimi planner → OpenRouter Claude → GPT-4o) when
 * ANTHROPIC_API_KEY is absent.
 *
 * Emits privacy-safe SSE events — never leaks provider/model names.
 */

import Anthropic from "@anthropic-ai/sdk";
import { AGENT_TOOLS, toAnthropicTools, getToolByName } from "./tools.js";

export type OrchestratorEvent =
  | { event: "agent_start"; data: { agent: string; description: string } }
  | { event: "agent_done"; data: { agent: string; summary?: string; found: boolean } }
  | { event: "token"; data: string }
  | { event: "final"; data: { text: string } }
  | { event: "error"; data: { message: string } }
  | { event: "intent"; data: { plan: string } };

export interface RunOptions {
  maxIterations?: number;
  model?: string;
  systemPrompt?: string;
}

const FRIENDLY_LABELS: Record<string, string> = {
  nexus_run:        "🧠 Specialist",
  web_search:       "🔍 Researcher",
  url_crawl:        "🌐 Crawler",
  deep_scrape:      "🎭 Playwright",
  harvester_run:    "🛰️ Harvester",
  sanctions_screen: "⚖️ Sanctions",
  scout_osint:      "🕵️ OSINT",
  lead_factory_run: "⚡ Lead Factory",
  signal_monitor:   "📡 Signal scout",
};

const DEFAULT_SYSTEM = `You are the NexFlow research orchestrator. The user is doing structured B2B research on Saudi Arabia / GCC companies and people.

RULES (strict):
1. Honor every constraint in the user's question — do not relax.
2. Cite every factual claim with a source URL from your tool results.
3. Never invent contact data (emails, phones, CR numbers). Leave blank + flag.
4. Halt-and-ask if any constraint conflicts with discovered data.
5. Prefer Arabic-language sources for Tadawul-listed companies.
6. Final answer: structured, scannable, ready for export.

WORKFLOW:
- Start by deciding which tool to call. Plan 2-4 steps.
- web_search for fresh facts. url_crawl for a specific page. harvester_run for company multi-source enrichment.
- nexus_run delegates to specialists: { role: "extractor" } for structured fields, { role: "arabic" } for Arabic sources, { role: "writer" } for final synthesis.
- After tools, produce the final answer in clean Markdown. Cite sources inline.`;

export async function runAgentChat(
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  onEvent: (e: OrchestratorEvent) => void,
  opts: RunOptions = {}
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const client = new Anthropic({ apiKey });
  const model = opts.model || process.env.AI_CHAT_ORCHESTRATOR_MODEL || "claude-opus-4-5";
  const maxIter = opts.maxIterations ?? 8;
  const system = opts.systemPrompt || DEFAULT_SYSTEM;

  type Msg = { role: "user" | "assistant"; content: unknown };
  const messages: Msg[] = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: userMessage },
  ];

  const tools = toAnthropicTools();
  let finalText = "";

  // Emit immediately so the stream is never silent at the start
  onEvent({ event: "agent_start", data: { agent: "🧠 Planner", description: "Analysing request and routing to agents…" } });

  for (let i = 0; i < maxIter; i++) {
    let resp: Anthropic.Messages.Message;
    try {
      resp = await client.messages.create({
        model,
        max_tokens: 4096,
        system,
        tools: tools as unknown as Anthropic.Messages.Tool[],
        messages: messages as Anthropic.Messages.MessageParam[],
      });
    } catch (e) {
      onEvent({ event: "error", data: { message: e instanceof Error ? e.message : String(e) } });
      throw e;
    }

    const toolUses: Array<{ id: string; name: string; input: Record<string, unknown> }> = [];
    let turnText = "";
    for (const block of resp.content) {
      if (block.type === "text") {
        turnText += block.text;
      } else if (block.type === "tool_use") {
        toolUses.push({ id: block.id, name: block.name, input: block.input as Record<string, unknown> });
      }
    }

    if (turnText) {
      for (const chunk of chunked(turnText, 50)) onEvent({ event: "token", data: chunk });
      finalText += turnText;
    }

    if (resp.stop_reason !== "tool_use") break;

    messages.push({ role: "assistant", content: resp.content });

    const toolResults: Array<{ type: "tool_result"; tool_use_id: string; content: string }> = [];
    for (const tu of toolUses) {
      const friendly = FRIENDLY_LABELS[tu.name] || tu.name;
      onEvent({ event: "agent_start", data: { agent: friendly, description: describeCall(tu.name, tu.input) } });
      const tool = getToolByName(tu.name);
      if (!tool) {
        toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: `error: unknown tool ${tu.name}` });
        onEvent({ event: "agent_done", data: { agent: friendly, found: false, summary: "unknown tool" } });
        continue;
      }
      try {
        const res = await tool.handler(tu.input);
        toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: JSON.stringify(res.result).slice(0, 12000) });
        onEvent({ event: "agent_done", data: { agent: friendly, found: true, summary: res.summary } });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: "error: " + msg });
        onEvent({ event: "agent_done", data: { agent: friendly, found: false, summary: msg } });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  onEvent({ event: "final", data: { text: finalText } });
  return finalText;
}

function chunked(s: string, n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += n) out.push(s.slice(i, i + n));
  return out;
}

function describeCall(toolName: string, input: Record<string, unknown>): string {
  if (toolName === "web_search")    return `Searching: ${String(input.query || "").slice(0, 80)}`;
  if (toolName === "url_crawl")     return `Crawling: ${String(input.url || "")}`;
  if (toolName === "harvester_run") return `Harvesting: ${String(input.query || "")}`;
  if (toolName === "nexus_run")     return `${String(input.role || "")}: ${String(input.task || "").slice(0, 80)}`;
  return toolName;
}
