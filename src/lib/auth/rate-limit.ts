import { NextResponse, type NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };

/**
 * Fixed-window counters in process memory.
 * Adequate for single-instance / local. Phase 3 adds Upstash for multi-instance production.
 */
const buckets = new Map<string, Bucket>();

const MAX_KEYS = 20_000;

const IPV4 =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
const IPV6 =
  /^\[?(?:[0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}\]?$|^::(?:[0-9a-fA-F]{0,4}:){0,6}[0-9a-fA-F]{0,4}$/;

function pruneIfNeeded() {
  if (buckets.size < MAX_KEYS) return;
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
  if (buckets.size >= MAX_KEYS) {
    const oldest = buckets.keys().next().value;
    if (oldest) buckets.delete(oldest);
  }
}

function looksLikeIp(value: string): boolean {
  const v = value.trim();
  if (!v || v.length > 45) return false;
  if (v === "unknown" || v === "localhost") return false;
  return IPV4.test(v) || IPV6.test(v) || v.includes(":");
}

/**
 * Resolve client IP for rate limiting.
 * On Vercel, `x-forwarded-for` is platform-controlled (left-most = client).
 * Prefer `x-real-ip` when present; never trust arbitrary non-IP junk.
 */
export function clientIpKey(request: NextRequest | Request): string {
  const headers = request.headers;

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp && looksLikeIp(realIp)) return realIp;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first && looksLikeIp(first)) return first;
  }

  const vercelForwarded = headers.get("x-vercel-forwarded-for")?.trim();
  if (vercelForwarded) {
    const first = vercelForwarded.split(",")[0]?.trim();
    if (first && looksLikeIp(first)) return first;
  }

  return "unknown";
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

/**
 * Fixed-window counter: `limit` requests per `windowMs` for `key`.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  if (!Number.isFinite(limit) || limit < 1) {
    throw new Error("checkRateLimit: limit must be >= 1");
  }
  if (!Number.isFinite(windowMs) || windowMs < 1_000) {
    throw new Error("checkRateLimit: windowMs must be >= 1000");
  }

  pruneIfNeeded();
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return { ok: true };
}

/** Auth abuse defaults per IP. */
export const AUTH_RATE_LIMITS = {
  login: { limit: 10, windowMs: 60_000 },
  signup: { limit: 5, windowMs: 60_000 },
  forgotPassword: { limit: 5, windowMs: 60_000 },
} as const;

/**
 * Public unauthenticated / lightly-authenticated write surfaces.
 * Tuned to block scripted floods while allowing normal humans + retries.
 */
export const PUBLIC_RATE_LIMITS = {
  enquiry: { limit: 8, windowMs: 60_000 },
  assistance: { limit: 8, windowMs: 60_000 },
  propertyInquiry: { limit: 12, windowMs: 60_000 },
  propertyVisit: { limit: 10, windowMs: 60_000 },
} as const;

export type PublicRateLimitKind = keyof typeof PUBLIC_RATE_LIMITS;

export function rateLimitExceededResponse(
  message: string,
  retryAfterSec: number
): NextResponse {
  const retry = Math.max(1, Math.min(Math.floor(retryAfterSec), 3600));
  return NextResponse.json(
    { error: message, retryAfterSec: retry },
    {
      status: 429,
      headers: {
        "Retry-After": String(retry),
        "Cache-Control": "no-store",
      },
    }
  );
}

/** Returns a 429 response when limited; otherwise null. */
export function enforceRateLimit(
  request: NextRequest | Request,
  scope: string,
  limit: number,
  windowMs: number,
  message = "Too many requests. Please try again shortly."
): NextResponse | null {
  const ip = clientIpKey(request);
  const result = checkRateLimit(`${scope}:${ip}`, limit, windowMs);
  if (result.ok) return null;
  return rateLimitExceededResponse(message, result.retryAfterSec);
}

export function enforcePublicRateLimit(
  request: NextRequest | Request,
  kind: PublicRateLimitKind
): NextResponse | null {
  const cfg = PUBLIC_RATE_LIMITS[kind];
  return enforceRateLimit(
    request,
    `public:${kind}`,
    cfg.limit,
    cfg.windowMs,
    "Too many submissions from this network. Please try again shortly."
  );
}

export function enforceAuthRateLimit(
  request: NextRequest | Request,
  kind: keyof typeof AUTH_RATE_LIMITS,
  message: string
): NextResponse | null {
  const cfg = AUTH_RATE_LIMITS[kind];
  return enforceRateLimit(request, `auth:${kind}`, cfg.limit, cfg.windowMs, message);
}
