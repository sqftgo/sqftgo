import { z } from "zod";
import {
  DEFAULT_AMENITY_ICON,
  DEFAULT_CATEGORY_ICON,
  isCatalogIconName,
} from "@/lib/icons/catalog-icon-names";

const optionalImageUrl = z
  .union([
    z.string().trim().url().max(2000),
    z.string().trim().startsWith("/").max(500),
    z.null(),
  ])
  .optional();

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase slug like apartment-homes")
  .optional();

const catalogIconSchema = z
  .string()
  .trim()
  .refine((v) => isCatalogIconName(v), {
    message: "Choose an icon from the Lucide catalog",
  });

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slugSchema,
  description: z.string().trim().max(2000).optional().default(""),
  icon: catalogIconSchema.default(DEFAULT_CATEGORY_ICON),
  imageUrl: optionalImageUrl,
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(10000).optional(),
});

export const categoryUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    slug: slugSchema,
    description: z.string().trim().max(2000).optional(),
    icon: catalogIconSchema.optional(),
    imageUrl: optionalImageUrl,
    active: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(10000).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "No updates provided" });

const coverImageUrlSchema = optionalImageUrl;

export const locationCreateSchema = z.object({
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  country: z.string().trim().min(2).max(100).default("India"),
  slug: slugSchema,
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(10000).optional(),
  coverImageUrl: coverImageUrlSchema,
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});

export const locationUpdateSchema = z
  .object({
    city: z.string().trim().min(2).max(100).optional(),
    state: z.string().trim().min(2).max(100).optional(),
    country: z.string().trim().min(2).max(100).optional(),
    slug: slugSchema,
    active: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(10000).optional(),
    coverImageUrl: coverImageUrlSchema,
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "No updates provided" });

export const amenityCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(2000).optional().default(""),
  icon: catalogIconSchema.optional().default(DEFAULT_AMENITY_ICON),
  category: z.string().trim().max(80).nullable().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(10000).optional(),
});

export const amenityUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    description: z.string().trim().max(2000).optional(),
    icon: catalogIconSchema.optional(),
    category: z.string().trim().max(80).nullable().optional(),
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
