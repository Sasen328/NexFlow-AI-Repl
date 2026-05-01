/**
 * URL safety guards for the web engine.
 *
 * Blocks SSRF attempts: localhost, private RFC1918 ranges, link-local,
 * cloud metadata IPs (AWS/GCP/Azure 169.254.169.254). Applied to every
 * URL accepted by /scrape, /map, /crawl, /extract endpoints.
 */

const PRIVATE_IPV4_RANGES: Array<[number, number, number, number]> = [
  // [octet1_min, octet1_max, octet2_min, octet2_max] (or 0,255 for any)
];

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(n => parseInt(n, 10));
  if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) return false;
  const [a, b] = parts as [number, number, number, number];
  // 10.0.0.0/8
  if (a === 10) return true;
  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;
  // 127.0.0.0/8 (loopback)
  if (a === 127) return true;
  // 169.254.0.0/16 (link-local + cloud metadata)
  if (a === 169 && b === 254) return true;
  // 0.0.0.0/8
  if (a === 0) return true;
  // 100.64.0.0/10 (CGNAT)
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

const BLOCKED_HOSTS = new Set([
  "localhost",
  "ip6-localhost",
  "ip6-loopback",
  "metadata.google.internal",
]);

export interface UrlGuardResult {
  ok: boolean;
  reason?: string;
}

/**
 * Sync structural check (cheap). Blocks obvious bad shapes; does not
 * resolve DNS. Use for input validation. Pair with assertSafeUrl() for
 * the full check including DNS resolution if you really need it.
 */
export function checkUrlSafe(rawUrl: string): UrlGuardResult {
  let u: URL;
  try { u = new URL(rawUrl); } catch { return { ok: false, reason: "Invalid URL" }; }
  if (!/^https?:$/.test(u.protocol)) return { ok: false, reason: "Only http/https allowed" };
  const host = u.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host)) return { ok: false, reason: "Blocked host" };
  // Direct IP literal in URL
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) && isPrivateIPv4(host)) {
    return { ok: false, reason: "Private/loopback IP not allowed" };
  }
  // IPv6 loopback / link-local short forms
  if (host === "::1" || host === "[::1]" || host.startsWith("[fe80:") || host.startsWith("[fc") || host.startsWith("[fd")) {
    return { ok: false, reason: "Private/loopback IPv6 not allowed" };
  }
  // .local mDNS
  if (host.endsWith(".local") || host.endsWith(".internal")) {
    return { ok: false, reason: "Internal/.local hostnames not allowed" };
  }
  return { ok: true };
}

/** Maximum response size for web-engine fetches (5 MB). */
export const MAX_FETCH_BYTES = 5 * 1024 * 1024;
