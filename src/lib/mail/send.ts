import type { MailMessage, MailSendResult } from "@/lib/mail/types";

function asList(to: string | string[]): string[] {
  return (Array.isArray(to) ? to : [to]).map((v) => v.trim()).filter(Boolean);
}

function defaultFrom(): string {
  return (
    process.env.MAIL_FROM?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    "SqftGo Alerts <onboarding@resend.dev>"
  );
}

function isQuotaOrRateLimit(status: number, body: string): boolean {
  if (status === 429) return true;
  const lower = body.toLowerCase();
  return (
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("rate_limit") ||
    lower.includes("monthly") ||
    lower.includes("insufficient")
  );
}

async function sendResend(message: MailMessage): Promise<MailSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY unset" };

  const to = asList(message.to);
  if (!to.length) return { ok: false, error: "No recipients" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM?.trim() || defaultFrom(),
      to,
      subject: message.subject,
      text: message.text,
      ...(message.html ? { html: message.html } : {}),
    }),
  });

  const body = await res.text().catch(() => "");
  if (!res.ok) {
    return {
      ok: false,
      provider: "resend",
      error: `Resend ${res.status}: ${body.slice(0, 300)}${isQuotaOrRateLimit(res.status, body) ? " [quota]" : ""}`,
    };
  }
  return { ok: true, provider: "resend" };
}

async function sendMailjet(message: MailMessage): Promise<MailSendResult> {
  const key = process.env.MAILJET_API_KEY?.trim();
  const secret = process.env.MAILJET_API_SECRET?.trim();
  if (!key || !secret) return { ok: false, error: "MAILJET_API_KEY/SECRET unset" };

  const to = asList(message.to);
  if (!to.length) return { ok: false, error: "No recipients" };

  const fromEmail =
    process.env.MAILJET_FROM_EMAIL?.trim() ||
    process.env.MAIL_FROM_EMAIL?.trim() ||
    "alerts@sqftgo.com";
  const fromName = process.env.MAILJET_FROM_NAME?.trim() || "SqftGo Alerts";

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Messages: [
        {
          From: { Email: fromEmail, Name: fromName },
          To: to.map((Email) => ({ Email })),
          Subject: message.subject,
          TextPart: message.text,
          ...(message.html ? { HTMLPart: message.html } : {}),
        },
      ],
    }),
  });

  const body = await res.text().catch(() => "");
  if (!res.ok) {
    return {
      ok: false,
      provider: "mailjet",
      error: `Mailjet ${res.status}: ${body.slice(0, 300)}${isQuotaOrRateLimit(res.status, body) ? " [quota]" : ""}`,
    };
  }
  return { ok: true, provider: "mailjet" };
}

/** Optional MSG91 Email API (v5). Used only if configured. */
async function sendMsg91(message: MailMessage): Promise<MailSendResult> {
  const authKey =
    process.env.MSG91_EMAIL_AUTH_KEY?.trim() || process.env.MSG91_AUTH_KEY?.trim();
  const domain = process.env.MSG91_EMAIL_DOMAIN?.trim();
  const fromEmail =
    process.env.MSG91_EMAIL_FROM?.trim() || process.env.MAIL_FROM_EMAIL?.trim();
  if (!authKey || !domain || !fromEmail) {
    return { ok: false, error: "MSG91 email env incomplete" };
  }

  const to = asList(message.to);
  if (!to.length) return { ok: false, error: "No recipients" };

  const res = await fetch("https://control.msg91.com/api/v5/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      authkey: authKey,
    },
    body: JSON.stringify({
      recipients: to.map((email) => ({ to: [{ email }], variables: {} })),
      from: { email: fromEmail },
      domain,
      subject: message.subject,
      body: {
        type: message.html ? "html" : "text",
        content: message.html || message.text,
      },
    }),
  });

  const body = await res.text().catch(() => "");
  if (!res.ok) {
    return {
      ok: false,
      provider: "msg91",
      error: `MSG91 email ${res.status}: ${body.slice(0, 300)}`,
    };
  }
  return { ok: true, provider: "msg91" };
}

function mailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() ||
      (process.env.MAILJET_API_KEY?.trim() && process.env.MAILJET_API_SECRET?.trim()) ||
      ((process.env.MSG91_EMAIL_AUTH_KEY?.trim() || process.env.MSG91_AUTH_KEY?.trim()) &&
        process.env.MSG91_EMAIL_DOMAIN?.trim() &&
        (process.env.MSG91_EMAIL_FROM?.trim() || process.env.MAIL_FROM_EMAIL?.trim())),
  );
}

/**
 * Send mail: Resend → Mailjet → MSG91.
 * Skips quietly when no provider env is set (ready for later ops config).
 */
export async function sendMail(message: MailMessage): Promise<MailSendResult> {
  if (!mailConfigured()) {
    return { ok: false, skipped: true, error: "No mail provider configured" };
  }

  const attempts: Array<() => Promise<MailSendResult>> = [
    () => sendResend(message),
    () => sendMailjet(message),
    () => sendMsg91(message),
  ];

  let last: MailSendResult = { ok: false, error: "No provider attempted" };
  for (const attempt of attempts) {
    try {
      const result = await attempt();
      if (result.ok) return result;
      // Skip providers that are simply unconfigured; try next.
      if (
        result.error?.includes("unset") ||
        result.error?.includes("incomplete")
      ) {
        last = result;
        continue;
      }
      last = result;
      // Quota/rate → try next provider; other failures still try fallback.
      continue;
    } catch (err) {
      last = {
        ok: false,
        error: err instanceof Error ? err.message : "Mail send failed",
      };
    }
  }
  return last;
}

export function isMailConfigured(): boolean {
  return mailConfigured();
}
