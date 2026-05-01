/**
 * Visual generator — powered by Gemini 2.5 Flash Image.
 * Replaces the former Napkin AI integration (which required NAPKIN_AI_API key).
 *
 * Uses AI_INTEGRATIONS_GEMINI_API_KEY directly with Google's image-generation
 * model. Returns a data: URI so the browser can render it inline — no proxy
 * or external URL needed.
 *
 * Endpoint contract (unchanged so the frontend needs no edits):
 *   POST /api/napkin/generate-visual
 *   body: { prompt: string, style?: string, format?: "png"|"svg", aspect_ratio?: string }
 *   resp: { url: string, format: string }   on success
 *         { error: string }                 on failure
 */
import { Router } from "express";
import { z } from "zod";

const router = Router();

const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";

const Body = z.object({
  prompt: z.string().min(4).max(2000),
  style: z.enum(["professional", "hand-drawn", "minimalist", "tech"]).optional(),
  format: z.enum(["png", "svg"]).optional(),
  aspect_ratio: z.string().max(16).optional(),
});

const STYLE_HINTS: Record<string, string> = {
  professional: "clean professional infographic, business diagram, corporate color palette, white background",
  "hand-drawn": "hand-drawn whiteboard style diagram, sketch aesthetic, marker lines",
  minimalist: "ultra-minimalist diagram, flat design, thin lines, lots of whitespace",
  tech: "tech-style dark diagram, neon highlights, circuit board aesthetic",
};

router.post("/generate-visual", async (req, res) => {
  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "Gemini API key not configured.", ai_disabled: true });
  }

  const parsed = Body.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
  }
  const { prompt, style = "professional" } = parsed.data;

  const styleHint = STYLE_HINTS[style] ?? STYLE_HINTS.professional;
  const fullPrompt = `Create a business data visualization or infographic for: "${prompt}". Style: ${styleHint}. Make it visually compelling, clear, and professional. Include relevant charts, flow arrows, or diagrams as appropriate. No placeholder text.`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`;
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      }),
    });

    const data: any = await r.json();

    if (!r.ok) {
      req.log?.warn?.({ status: r.status, err: data?.error?.message }, "gemini image gen failed");
      return res.status(502).json({ error: data?.error?.message ?? `Gemini returned ${r.status}` });
    }

    const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));

    if (!imgPart) {
      return res.status(502).json({ error: "Gemini returned no image for this prompt. Try a different description." });
    }

    const mime: string = imgPart.inlineData.mimeType;
    const b64: string = imgPart.inlineData.data;
    const dataUri = `data:${mime};base64,${b64}`;

    return res.json({ url: dataUri, format: "png", engine: "gemini-2.5-flash-image" });
  } catch (err: any) {
    req.log?.error?.({ err }, "visual generate failed");
    return res.status(500).json({ error: err?.message ?? "Visual generation failed" });
  }
});

export default router;
