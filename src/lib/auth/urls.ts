/**
 * Auth URL helpers — production redirects must use a configured site URL,
 * not only request.origin (which can be spoofed behind some proxies).
 */

export function getSiteUrl(request?: { nextUrl: { origin: string } }): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    process.env.SITE_URL?.trim().replace(/\/$/, "");

  if (configured) return configured;
  if (request) return request.nextUrl.origin;
  return "http://localhost:3000";
}

/**
 * Allow only same-app relative paths. Blocks open redirects like "//evil.com".
 */
export function safeRedirectPath(
  next: string | null | undefined,
  fallback = "/"
): string {
  if (!next) return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  return trimmed;
}

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}
