import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  icon: z.string().trim().min(1).max(16).default("🏠"),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(10000).optional(),
});

export const categoryUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    icon: z.string().trim().min(1).max(16).optional(),
    active: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(10000).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "No updates provided" });

export const locationCreateSchema = z.object({
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  country: z.string().trim().min(2).max(100).default("India"),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(10000).optional(),
});

export const locationUpdateSchema = z
  .object({
    city: z.string().trim().min(2).max(100).optional(),
    state: z.string().trim().min(2).max(100).optional(),
    country: z.string().trim().min(2).max(100).optional(),
    active: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(10000).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "No updates provided" });

export function catalogZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid request body";
  const path = first.path.length ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}
