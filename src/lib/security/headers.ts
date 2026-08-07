/**
 * Production HTTP security headers for SqftGo.
 * Applied via next.config.ts `headers()`.
 *
 * CSP allows known first/third parties used by the app (Supabase, maps embeds,
 * listing image CDNs). Tighten further only after verifying no console CSP errors.
 */
export function buildContentSecurityPolicy(): string {
  const directives: string[] = [
    "default-src 'self'",
    // Next.js App Router still requires unsafe-inline/eval for runtime chunks
    // until a nonce-based middleware CSP is introduced.
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    // Google Fonts CSS is loaded from fonts.googleapis.com (see globals.css).
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    [
      "img-src 'self' data: blob:",
      "https://*.supabase.co",
      "https://images.unsplash.com",
      "https://maps.google.com",
      "https://*.googleapis.com",
      "https://*.gstatic.com",
      "https://content.jdmagicbox.com",
      "https://ui-avatars.com",
    ].join(" "),
    // Font files are served from fonts.gstatic.com after the CSS loads.
    "font-src 'self' data: https://fonts.gstatic.com",
    [
      "connect-src 'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co",
    ].join(" "),
    "frame-src 'self' https://maps.google.com https://www.google.com",
    "worker-src 'self' blob:",
    "media-src 'self' https://*.supabase.co blob: data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  // Only on HTTPS deployments — breaks http://localhost if applied in dev.
  if (process.env.NODE_ENV === "production") {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export const SECURITY_HEADERS: { key: string; value: string }[] = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Content-Security-Policy",
    value: buildContentSecurityPolicy(),
  },
];
