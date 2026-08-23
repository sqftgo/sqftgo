import { z } from "zod";

export const listingFilterKindSchema = z.enum([
  "purpose",
  "city",
  "locality",
  "type",
  "bhk",
  "furnishing",
  "price",
  "size",
  "amenities",
  "rera",
  "featured",
  "text",
  "toggle",
  "multi",
]);

export const listingFilterCatalogSchema = z.enum(["cities", "categories", "amenities"]);

export const listingFilterOptionSchema = z.object({
  label: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(80),
});

export const PROPERTY_FIELD_WHITELIST = [
  "city",
  "locality",
  "purpose",
  "type",
  "bhk",
  "furnished",
  "amenities",
  "reraApproved",
  "featured",
  "nearbyHospital",
  "nearbySchool",
  "nearbyTransportation",
] as const;

export const listingFilterCreateSchema = z
  .object({
    key: z
      .string()
      .trim()
      .toLowerCase()
      .min(2)
      .max(40)
      .regex(/^[a-z][a-z0-9_]*$/, "Key must be a lowercase slug (letters, numbers, underscore)"),
    label: z.string().trim().min(2).max(80),
    kind: listingFilterKindSchema,
    propertyField: z.enum(PROPERTY_FIELD_WHITELIST).optional().nullable(),
    catalog: listingFilterCatalogSchema.optional().nullable(),
    options: z.array(listingFilterOptionSchema).max(40).optional(),
    active: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(10000).optional(),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.kind === "text" || v.kind === "toggle" || v.kind === "multi") {
      if (!v.propertyField) {
        ctx.addIssue({
          code: "custom",
          message: "propertyField is required for custom filters",
          path: ["propertyField"],
        });
      }
    }
    if (v.kind === "multi" && (!v.options || v.options.length === 0)) {
      ctx.addIssue({
        code: "custom",
        message: "At least one option is required for multi filters",
        path: ["options"],
      });
    }
  });

export const listingFilterUpdateSchema = z
  .object({
    label: z.string().trim().min(2).max(80).optional(),
    kind: listingFilterKindSchema.optional(),
    propertyField: z.enum(PROPERTY_FIELD_WHITELIST).optional().nullable(),
    catalog: listingFilterCatalogSchema.optional().nullable(),
    options: z.array(listingFilterOptionSchema).max(40).optional(),
    active: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(10000).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "No updates provided" });

export function listingFilterZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid request body";
  const path = first.path.length ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}
