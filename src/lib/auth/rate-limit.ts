import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse, type NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };

/**
 * Fixed-window counters in process memory.
 * Used when Upstash env is not configured (local/dev) or as documented fallback.
 */
const buckets = new Map<string, Bucket>();
const MAX_KEYS = 20_000;

const upstashLimiters = new Map<string, Ratelimit>();
let missingUpstashWarned = false;
let redisClient: Redis | null | undefined;

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
  | { ok: false; retryAfterSec: number }
  | { ok: false; unavailable: true };

export function hasUpstashRateLimitConfig(): boolean {
  // Local/dev: keep login working even if Upstash env is present.
  // Restricted REST tokens often lack EVALSHA, which @upstash/ratelimit needs.
  if (process.env.NODE_ENV !== "production") return false;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/^"|"$/g, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim().replace(/^"|"$/g, "");
  return Boolean(
    url &&
      token &&
      !url.includes("YOUR_") &&
      !token.startsWith("your-") &&
      url.startsWith("https://")
  );
}

function getRedis(): Redis | null {
  if (!hasUpstashRateLimitConfig()) return null;
  if (redisClient !== undefined) return redisClient;
  try {
    redisClient = Redis.fromEnv();
    return redisClient;
  } catch (err) {
    console.error("[rate-limit] Failed to init Upstash Redis", err);
    redisClient = null;
    return null;
  }
}

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const cacheKey = `${limit}:${windowSec}`;
  const existing = upstashLimiters.get(cacheKey);
  if (existing) return existing;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    prefix: "sqftgo:ratelimit",
    analytics: false,
  });
  upstashLimiters.set(cacheKey, limiter);
  return limiter;
}

function checkMemoryRateLimit(
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

/**
 * Rate-limit `key` to `limit` requests per `windowMs`.
 * Uses Upstash when configured; otherwise in-memory (single instance only).
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (!Number.isFinite(limit) || limit < 1) {
    throw new Error("checkRateLimit: limit must be >= 1");
  }
  if (!Number.isFinite(windowMs) || windowMs < 1_000) {
    throw new Error("checkRateLimit: windowMs must be >= 1000");
  }

  const upstash = getUpstashLimiter(limit, windowMs);
  if (upstash) {
    try {
      const result = await upstash.limit(key);
      if (result.success) return { ok: true };
      const retryAfterSec = Math.max(
        1,
        Math.ceil((result.reset - Date.now()) / 1000)
      );
      return { ok: false, retryAfterSec };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Restricted Upstash tokens cannot EVALSHA (used by @upstash/ratelimit).
      // Fall back to memory so login is not 503 when Redis ACL is wrong.
      if (/NOPERM|evalsha/i.test(msg) || process.env.NODE_ENV !== "production") {
        console.warn(
          "[rate-limit] Upstash limit() failed — using in-memory limiter",
          msg
        );
        return checkMemoryRateLimit(key, limit, windowMs);
      }
      console.error("[rate-limit] Upstash limit() failed — failing closed", err);
      return { ok: false, unavailable: true };
    }
  }

  if (process.env.NODE_ENV === "production" && !missingUpstashWarned) {
    missingUpstashWarned = true;
    console.warn(
      "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN not set — using in-memory limiter (not shared across instances). Set Upstash env for production."
    );
  }

  return checkMemoryRateLimit(key, limit, windowMs);
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

function rateLimitUnavailableResponse(): NextResponse {
  return NextResponse.json(
    { error: "Service temporarily unavailable. Please try again shortly." },
    {
      status: 503,
      headers: {
        "Retry-After": "5",
        "Cache-Control": "no-store",
      },
    }
  );
}

/** Returns a 429/503 response when limited or backend unavailable; otherwise null. */
export async function enforceRateLimit(
  request: NextRequest | Request,
  scope: string,
  limit: number,
  windowMs: number,
  message = "Too many requests. Please try again shortly."
): Promise<NextResponse | null> {
  const ip = clientIpKey(request);
  const result = await checkRateLimit(`${scope}:${ip}`, limit, windowMs);
  if (result.ok) return null;
  if ("unavailable" in result && result.unavailable) {
    return rateLimitUnavailableResponse();
  }
  return rateLimitExceededResponse(
    message,
    "retryAfterSec" in result ? result.retryAfterSec : 60
  );
}

export async function enforcePublicRateLimit(
  request: NextRequest | Request,
  kind: PublicRateLimitKind
): Promise<NextResponse | null> {
  const cfg = PUBLIC_RATE_LIMITS[kind];
  return enforceRateLimit(
    request,
    `public:${kind}`,
    cfg.limit,
    cfg.windowMs,
    "Too many submissions from this network. Please try again shortly."
  );
}

export async function enforceAuthRateLimit(
  request: NextRequest | Request,
  kind: keyof typeof AUTH_RATE_LIMITS,
  message: string
): Promise<NextResponse | null> {
  const cfg = AUTH_RATE_LIMITS[kind];
  return enforceRateLimit(request, `auth:${kind}`, cfg.limit, cfg.windowMs, message);
}
