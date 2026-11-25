import { isMailConfigured, sendMail } from "@/lib/mail/send";

const DEFAULT_ALERT_TO = "bhaveshanjana58@gmail.com";
const COOLDOWN_MS = 15 * 60 * 1000;

type AlertInput = {
  path: string;
  method?: string;
  status?: number;
  message: string;
  detail?: string;
  source: "jsonError" | "uncaught";
};

const lastSent = new Map<string, number>();
const inFlight = new Set<string>();

function alertEnabled(): boolean {
  if (process.env.API_ALERTS_DISABLED === "true") return false;
  if (process.env.NODE_ENV !== "production" && process.env.API_ALERT_IN_DEV !== "true") {
    return false;
  }
  return isMailConfigured();
}

function alertTo(): string {
  return process.env.API_ALERT_EMAIL?.trim() || DEFAULT_ALERT_TO;
}

function normalizePath(path: string): string {
  try {
    if (path.startsWith("http")) return new URL(path).pathname;
  } catch {
    /* ignore */
  }
  return path.split("?")[0] || path;
}

function shouldSkipPath(path: string): boolean {
  const p = normalizePath(path);
  // Avoid recursion / noise from self-check noise.
  if (p.startsWith("/api/ops/")) return true;
  return false;
}

function cooldownKey(input: AlertInput): string {
  return `${(input.method || "GET").toUpperCase()} ${normalizePath(input.path)} ${input.status ?? "err"}`;
}

function allowSend(key: string): boolean {
  const now = Date.now();
  const prev = lastSent.get(key) ?? 0;
  if (now - prev < COOLDOWN_MS) return false;
  if (inFlight.has(key)) return false;
  return true;
}

function formatBody(input: AlertInput): { subject: string; text: string; html: string } {
  const method = (input.method || "GET").toUpperCase();
  const path = normalizePath(input.path);
  const status = input.status != null ? String(input.status) : "n/a";
  const when = new Date().toISOString();
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "sqftgo";

  const subject = `[SqftGo API] ${status} ${method} ${path}`;
  const text = [
    "SqftGo API failure alert",
    "",
    `Site: ${site}`,
    `When: ${when}`,
    `Method: ${method}`,
    `Path: ${path}`,
    `Status: ${status}`,
    `Source: ${input.source}`,
    `Message: ${input.message}`,
    input.detail ? `Detail: ${input.detail.slice(0, 2000)}` : null,
    "",
    "This alert is rate-limited (same route ~15 min).",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.5;color:#111">
      <h2 style="margin:0 0 12px">SqftGo API failure</h2>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Site</td><td>${escapeHtml(site)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">When</td><td>${escapeHtml(when)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Method</td><td>${escapeHtml(method)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Path</td><td><code>${escapeHtml(path)}</code></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Status</td><td><strong>${escapeHtml(status)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Source</td><td>${escapeHtml(input.source)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Message</td><td>${escapeHtml(input.message)}</td></tr>
      </table>
      ${
        input.detail
          ? `<pre style="margin-top:16px;padding:12px;background:#f4f4f5;border-radius:8px;white-space:pre-wrap;font-size:12px">${escapeHtml(input.detail.slice(0, 2000))}</pre>`
          : ""
      }
      <p style="margin-top:16px;color:#666;font-size:12px">Rate-limited: same route ~15 minutes.</p>
    </div>
  `;

  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Fire-and-forget alert when one of our API routes fails (5xx / uncaught).
 * Does not poll endpoints — only reacts when a real request fails.
 */
export function notifyApiFailure(input: AlertInput): void {
  if (!alertEnabled()) return;
  if (shouldSkipPath(input.path)) return;
  if (input.status != null && input.status < 500) return;

  const key = cooldownKey(input);
  if (!allowSend(key)) return;

  inFlight.add(key);
  const { subject, text, html } = formatBody(input);

  void sendMail({ to: alertTo(), subject, text, html })
    .then((result) => {
      if (result.ok) {
        lastSent.set(key, Date.now());
      } else if (!result.skipped) {
        console.error("[api-alert] mail failed:", result.error);
      }
    })
    .catch((err) => {
      console.error("[api-alert] mail threw:", err);
    })
    .finally(() => {
      inFlight.delete(key);
    });
}

export function notifyApiJsonError(args: {
  message: string;
  status: number;
  path?: string;
  method?: string;
  extra?: Record<string, unknown>;
}): void {
  if (args.status < 500) return;
  notifyApiFailure({
    path: args.path || "/api/unknown",
    method: args.method,
    status: args.status,
    message: args.message,
    detail: args.extra ? safeJson(args.extra) : undefined,
    source: "jsonError",
  });
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
