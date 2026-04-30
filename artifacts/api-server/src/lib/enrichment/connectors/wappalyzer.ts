/**
 * Wappalyzer-style tech stack detection — FREE, no key.
 *
 * Applies a curated set of fingerprints (regex against headers + HTML)
 * to the company homepage to detect tech in use. This is a pragmatic
 * subset of the open-source Wappalyzer fingerprint database covering
 * the categories that actually matter for B2B sales targeting.
 *
 * Categories: analytics, ads, auth, CRM, support, framework, hosting,
 * payment, marketing automation, ecommerce.
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { extractDomain, SCRAPER_UA } from "./_common.js";

interface Fingerprint {
  name: string;
  html?: RegExp;
  header?: { name: string; value?: RegExp };
}

const FINGERPRINTS: Fingerprint[] = [
  // CRM / sales
  { name: "Salesforce",      html: /salesforce\.com|sfdc\.com/i },
  { name: "HubSpot",         html: /hs-scripts\.com|hubspot/i },
  { name: "Intercom",        html: /widget\.intercom\.io|intercom-cdn/i },
  { name: "Zendesk",         html: /zdassets\.com|zendesk/i },
  { name: "Drift",           html: /js\.driftt\.com/i },
  // Analytics / ads
  { name: "Google Analytics", html: /googletagmanager\.com|google-analytics\.com|gtag/i },
  { name: "Mixpanel",        html: /cdn\.mxpnl\.com/i },
  { name: "Segment",         html: /cdn\.segment\.com/i },
  { name: "Amplitude",       html: /amplitude\.com/i },
  { name: "Hotjar",          html: /static\.hotjar\.com/i },
  { name: "Meta Pixel",      html: /connect\.facebook\.net.*fbevents/i },
  { name: "LinkedIn Insight", html: /snap\.licdn\.com/i },
  // Marketing automation
  { name: "Marketo",         html: /marketo\.com|munchkin/i },
  { name: "Mailchimp",       html: /mailchimp\.com|mc\.us\d+/i },
  { name: "Pardot",          html: /pi\.pardot\.com/i },
  // Frameworks
  { name: "React",           html: /__REACT_DEVTOOLS|_reactRootContainer|react\.production/i },
  { name: "Next.js",         html: /__NEXT_DATA__|_next\/static/i },
  { name: "Vue.js",          html: /vue(?:\.min)?\.js|__VUE__/i },
  { name: "Angular",         html: /ng-version|angular(?:\.min)?\.js/i },
  { name: "WordPress",       html: /wp-content|wp-includes/i },
  { name: "Shopify",         html: /cdn\.shopify\.com/i },
  // Hosting / infra
  { name: "Cloudflare",      header: { name: "server", value: /cloudflare/i } },
  { name: "Vercel",          header: { name: "server", value: /vercel/i } },
  { name: "AWS CloudFront",  header: { name: "x-amz-cf-id" } },
  { name: "Akamai",          header: { name: "server", value: /akamai/i } },
  // Payment
  { name: "Stripe",          html: /js\.stripe\.com/i },
  { name: "PayPal",          html: /paypalobjects\.com/i },
  // Auth
  { name: "Auth0",           html: /auth0\.com\/js/i },
  { name: "Okta",            html: /okta\.com/i },
  // GCC-relevant
  { name: "PayTabs",         html: /paytabs\.com/i },
  { name: "Tap Payments",    html: /tap\.company/i },
  { name: "HyperPay",        html: /hyperpay/i },
];

export const wappalyzerConnector: Connector = {
  source_key: "wappalyzer",

  async test() {
    return { ok: true, message: `${FINGERPRINTS.length} fingerprints loaded (offline)` };
  },

  async enrich({ seed, alreadyFilled }): Promise<EnrichResult> {
    if (alreadyFilled.has("company_tech_stack")) return { status: "skipped", fields: {} };
    const domain = extractDomain(seed);
    if (!domain) return { status: "miss", fields: {} };

    let html = "";
    let headers: Record<string, string> = {};
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8_000);
      const res = await fetch(`https://${domain}`, {
        headers: { "User-Agent": SCRAPER_UA },
        signal: ctrl.signal,
        redirect: "follow",
      }).finally(() => clearTimeout(t));
      if (!res.ok) return { status: "miss", fields: {} };
      html = await res.text();
      res.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
    } catch {
      return { status: "miss", fields: {} };
    }

    const detected = new Set<string>();
    for (const fp of FINGERPRINTS) {
      if (fp.html && fp.html.test(html)) { detected.add(fp.name); continue; }
      if (fp.header) {
        const v = headers[fp.header.name.toLowerCase()];
        if (v && (!fp.header.value || fp.header.value.test(v))) detected.add(fp.name);
      }
    }
    if (!detected.size) return { status: "miss", fields: {} };
    return {
      status: "ok",
      fields: { company_tech_stack: [...detected].sort() },
      cost_usd: 0,
    };
  },
};
