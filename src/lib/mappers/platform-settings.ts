import type { PlatformSettingsRow } from "@/types/database";
import type { PlatformSettings } from "@/types/platform";

export function mapPlatformSettings(row: PlatformSettingsRow): PlatformSettings {
  return {
    siteName: row.site_name,
    tagline: row.tagline,
    supportEmail: row.support_email,
    supportPhone: row.support_phone,
    maintenanceMode: row.maintenance_mode,
    requireListingApproval: row.require_listing_approval,
    maxListingsPerDealer: row.max_listings_per_dealer,
    currencyCode: row.currency_code,
    analyticsMeasurementId: row.analytics_measurement_id,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}
