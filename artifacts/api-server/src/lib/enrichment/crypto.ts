/**
 * AES-GCM encryption for stored API keys.
 *
 * The encryption key is derived from $SESSION_SECRET so keys are
 * unreadable in DB dumps but recoverable on the same env. If
 * SESSION_SECRET isn't set we fall back to a static dev key — the
 * schema column stores ciphertext either way so nothing is in plain
 * text on disk in production.
 */

import {
  createCipheriv, createDecipheriv, randomBytes, scryptSync,
} from "crypto";

const ALGO = "aes-256-gcm";
const SALT = "nexflow-enrichment-key-v1";

let cachedKey: Buffer | null = null;
function deriveKey(): Buffer {
  if (cachedKey) return cachedKey;
  const secret = process.env["SESSION_SECRET"] ?? "nexflow-dev-fallback-key";
  cachedKey = scryptSync(secret, SALT, 32);
  return cachedKey;
}

/** Encrypt → "iv.tag.ciphertext" all base64url. Empty input returns "". */
export function encryptKey(plain: string): string {
  if (!plain) return "";
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, deriveKey(), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${b64(iv)}.${b64(tag)}.${b64(ct)}`;
}

/** Decrypt the "iv.tag.ciphertext" format. Returns "" on any failure. */
export function decryptKey(blob: string | null): string {
  if (!blob) return "";
  try {
    const parts = blob.split(".");
    if (parts.length !== 3) return "";
    const iv = b64d(parts[0]!);
    const tag = b64d(parts[1]!);
    const ct = b64d(parts[2]!);
    const decipher = createDecipheriv(ALGO, deriveKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

function b64(buf: Buffer): string {
  return buf.toString("base64url");
}
function b64d(s: string): Buffer {
  return Buffer.from(s, "base64url");
}
