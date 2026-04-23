import { Resend } from "resend";

let _resend: Resend | null = null;

async function getResendApiKey(): Promise<string | null> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const replitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null;

  if (!hostname || !replitToken) return process.env.RESEND_API_KEY ?? null;

  try {
    const url = `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=resend`;
    const r = await fetch(url, {
      headers: { Accept: "application/json", X_REPLIT_TOKEN: replitToken },
    });
    if (!r.ok) return null;
    const data = await r.json();
    const conn = data?.items?.[0];
    return (
      conn?.settings?.api_key ??
      conn?.settings?.access_token ??
      conn?.settings?.RESEND_API_KEY ??
      null
    );
  } catch {
    return null;
  }
}

export async function getResend(): Promise<Resend | null> {
  if (_resend) return _resend;
  const key = await getResendApiKey();
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const resend = await getResend();
  if (!resend) {
    return { ok: false, error: "Resend not configured. Connect Resend in the integrations panel." };
  }
  try {
    const result = await resend.emails.send({
      from: opts.from ?? "NexFlow <onboarding@resend.dev>",
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
    });
    return { ok: !result.error, id: result.data?.id, error: result.error?.message };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Failed to send" };
  }
}
