import { z } from "zod";

const emptyToNull = (v: string | null | undefined) =>
  !v || !String(v).trim() ? null : String(v).trim();

export const platformSettingsUpdateSchema = z.object({
  siteName: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(2).max(200),
  supportEmail: z
    .union([z.string().email().max(200), z.literal(""), z.null()])
    .transform(emptyToNull),
  supportPhone: z
    .union([z.string().max(40), z.literal(""), z.null()])
    .transform(emptyToNull),
  maintenanceMode: z.boolean(),
  requireListingApproval: z.boolean(),
  allowUserListings: z.boolean(),
  maxListingsPerDealer: z.number().int().min(1).max(10_000).nullable().optional(),
  maxListingsPerUser: z.number().int().min(1).max(20).optional(),
  currencyCode: z
    .string()
    .trim()
    .length(3)
    .transform((v) => v.toUpperCase()),
  analyticsMeasurementId: z
    .union([z.string().max(64), z.literal(""), z.null()])
    .transform(emptyToNull),
});

export type PlatformSettingsUpdateInput = z.infer<typeof platformSettingsUpdateSchema>;
