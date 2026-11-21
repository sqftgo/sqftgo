import { z } from "zod";

export const websitePromotionPlanCreateSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional().default(""),
  priceInr: z.number().min(0).max(1_000_000),
  currency: z.string().trim().length(3).optional().default("INR"),
  billingType: z.enum(["one_time", "recurring"]),
  durationDays: z.number().int().min(1).max(3660),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).max(100000).optional().default(0),
});

export const websitePromotionPlanUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(1000).optional(),
    priceInr: z.number().min(0).max(1_000_000).optional(),
    currency: z.string().trim().length(3).optional(),
    billingType: z.enum(["one_time", "recurring"]).optional(),
    durationDays: z.number().int().min(1).max(3660).optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(100000).optional(),
  })
  .strict();

export const createWebsitePromotionOrderSchema = z.object({
  planId: z.string().uuid(),
  websiteUrl: z
    .string()
    .trim()
    .url("Enter a valid website URL (https://…)")
    .max(300)
    .optional(),
});

export const verifyWebsitePromotionPaymentSchema = z.object({
  razorpayOrderId: z.string().trim().min(3).max(120),
  razorpayPaymentId: z.string().trim().min(3).max(120),
  razorpaySignature: z.string().trim().min(3).max(256),
});

export const adminWebsitePromotionPatchSchema = z
  .object({
    status: z.enum(["inactive", "pending", "active", "expired", "cancelled"]).optional(),
    expiresAt: z.string().datetime().nullable().optional(),
    startsAt: z.string().datetime().nullable().optional(),
    websiteUrl: z.string().trim().max(300).optional(),
    adminNotes: z.string().trim().max(2000).optional(),
    extendDays: z.number().int().min(1).max(3660).optional(),
  })
  .strict();

export const updateMyWebsiteUrlSchema = z.object({
  websiteUrl: z
    .string()
    .trim()
    .url("Enter a valid website URL (https://…)")
    .max(300),
});

export function websitePromoZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid request body";
  const path = first.path.length ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}