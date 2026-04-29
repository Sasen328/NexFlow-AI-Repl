import { Router } from "express";

const router = Router();

const PATTERNS: { name: string; re: RegExp; replacement: (m: string) => string }[] = [
  { name: "credit_card", re: /\b(?:\d[ -]*?){13,16}\b/g, replacement: (m) => m.replace(/\d/g, "•") },
  { name: "ssn", re: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: () => "[REDACTED-SSN]" },
  { name: "iqama", re: /\b[12]\d{9}\b/g, replacement: () => "[REDACTED-IQAMA]" },
  { name: "iban_sa", re: /\bSA\d{22}\b/gi, replacement: () => "[REDACTED-IBAN-SA]" },
  { name: "iban_ae", re: /\bAE\d{21}\b/gi, replacement: () => "[REDACTED-IBAN-AE]" },
  { name: "email", re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, replacement: (m) => m.replace(/(.).+@/, "$1***@") },
  { name: "phone_intl", re: /\+\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}/g, replacement: () => "[REDACTED-PHONE]" },
  { name: "cvv", re: /\bcvv[:\s]*\d{3,4}\b/gi, replacement: () => "cvv: ***" },
];

router.post("/scan", (req, res) => {
  try {
    const { text } = req.body ?? {};
    if (typeof text !== "string") return res.status(400).json({ error: "text required" });

    const findings: { pattern: string; matches: number }[] = [];
    let redacted = text;
    for (const p of PATTERNS) {
      const matches = redacted.match(p.re);
      if (matches?.length) {
        findings.push({ pattern: p.name, matches: matches.length });
        redacted = redacted.replace(p.re, p.replacement);
      }
    }

    res.json({
      original_length: text.length,
      redacted_length: redacted.length,
      findings,
      redacted,
      pii_score: findings.reduce((s, f) => s + f.matches, 0),
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
