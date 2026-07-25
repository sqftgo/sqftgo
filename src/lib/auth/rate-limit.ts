import type { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };

/** In-memory sliding window. Fine for single-instance deploys; use Redis/Upstash for multi-node. */
const buckets = new Map<string, Bucket>();

const MAX_KEYS = 10_000;

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

export function clientIpKey(request: NextRequest | Request): string {
  const headers = "headers" in request ? request.headers : new Headers();
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
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

/** Auth abuse defaults: login 10/min, signup 5/min, forgot-password 5/min per IP. */
export const AUTH_RATE_LIMITS = {
  login: { limit: 10, windowMs: 60_000 },
  signup: { limit: 5, windowMs: 60_000 },
  forgotPassword: { limit: 5, windowMs: 60_000 },
} as const;
