import type { PlatformSettingsRow } from "@/types/database";
import type { PlatformSettings, PublicPlatformSettings } from "@/types/platform";
import {
  DEFAULT_PRICE_RANGES,
  type PriceRangeConfig,
} from "@/features/admin/data/priceRanges";

function isPriceOption(item: unknown): item is { label: string; value: string } {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as { label?: unknown }).label === "string" &&
    typeof (item as { value?: unknown }).value === "string"
  );
}

export function parsePriceRanges(raw: unknown): PriceRangeConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const keys = ["buyMin", "buyMax", "rentMin", "rentMax"] as const;
  const out = {} as PriceRangeConfig;
  for (const key of keys) {
    const list = (raw as Record<string, unknown>)[key];
    if (!Array.isArray(list) || !list.every(isPriceOption)) return null;
    out[key] = list;
  }
  return out;
}

export function mapPlatformSettings(row: PlatformSettingsRow): PlatformSettings {
  const parsed = parsePriceRanges(row.price_ranges);
  return {
    siteName: row.site_name,
    tagline: row.tagline,
    supportEmail: row.support_email,
    supportPhone: row.support_phone,
    maintenanceMode: row.maintenance_mode,
    requireListingApproval: row.require_listing_approval,
    allowUserListings: row.allow_user_listings !== false,
    maxListingsPerDealer: row.max_listings_per_dealer,
    maxListingsPerUser: row.max_listings_per_user ?? 3,
    currencyCode: row.currency_code,
    analyticsMeasurementId: row.analytics_measurement_id,
    priceRanges: parsed,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

export function mapPublicPlatformSettings(
  row: PlatformSettingsRow
): PublicPlatformSettings {
  const full = mapPlatformSettings(row);
  return {
    siteName: full.siteName,
    tagline: full.tagline,
    supportEmail: full.supportEmail,
    supportPhone: full.supportPhone,
    allowUserListings: full.allowUserListings,
    maxListingsPerUser: full.maxListingsPerUser,
    currencyCode: full.currencyCode,
    priceRanges: full.priceRanges ?? DEFAULT_PRICE_RANGES,
  };
}
