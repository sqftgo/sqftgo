/**
 * Absolute site origin for sitemap, Open Graph, and canonical URLs.
 * Prefer NEXT_PUBLIC_SITE_URL in production.
 */
export function getSiteOrigin(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export const DEFAULT_OG_IMAGE = "/DestinationHero.png";

export const SITE_NAME = "SqftGo";
export const DEFAULT_TITLE = "SqftGo | Bharat Real Estate Marketplace";
export const DEFAULT_DESCRIPTION =
  "Buy, rent, and sell properties across Bharat. Heritage havelis, lakeview villas, apartments, and relocating assistance on SqftGo.";
