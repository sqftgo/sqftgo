import { z } from "zod";

const slug = z
  .string()
  .trim()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase slug like pack-10");

export const listingPlanWriteSchema = z.object({
  slug,
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(200).optional().default(""),
  priceInr: z.number().int().min(1).max(100_000),
  slots: z.number().int().min(1).max(1000),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).max(10_000).optional().default(0),
});

export const listingPlanPatchSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(200).optional(),
  priceInr: z.number().int().min(1).max(100_000).optional(),
  slots: z.number().int().min(1).max(1000).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(10_000).optional(),
});

export function listingPlanZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid listing plan";
}
