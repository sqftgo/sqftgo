/** Cookie that carries the native app's return URL across the OAuth round trip. */
export const MOBILE_REDIRECT_COOKIE = "sqftgo_mobile_redirect";

const DEFAULT_MOBILE_REDIRECT = "sqftgo://auth/callback";

function allowedPrefixes(): string[] {
  const configured = process.env.MOBILE_AUTH_REDIRECT_PREFIXES?.split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (configured?.length) return configured;
  return process.env.NODE_ENV === "production" ? ["sqftgo://"] : ["sqftgo://", "exp://"];
}

/** Only app-scheme redirects are allowed so tokens never leave for a web origin. */
export function safeMobileRedirect(raw: string | null | undefined): string {
  const value = raw?.trim();
  if (!value) return DEFAULT_MOBILE_REDIRECT;
  return allowedPrefixes().some((prefix) => value.startsWith(prefix))
    ? value
    : DEFAULT_MOBILE_REDIRECT;
}
