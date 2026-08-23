import { z } from "zod";
import { propertyTypeSchema, zodErrorMessage } from "@/lib/validation/property";

export { zodErrorMessage };

export const projectLifecycleUiSchema = z.enum([
  "Upcoming",
  "Under Construction",
  "Ready",
]);

export const projectOwnershipRoleUiSchema = z.enum([
  "Owner",
  "Builder",
  "Marketing Partner",
]);

/** UI-facing project status (no Rented). */
export const projectStatusUiSchema = z.enum([
  "Active",
  "Pending Review",
  "Sold",
  "Draft",
  "Rejected",
]);

const imageUrlSchema = z
  .string()
  .trim()
  .min(1)
  .refine((v) => v.startsWith("https://") || v.startsWith("http://"), {
    message: "Image URLs must start with http:// or https://",
  });

const optionalDateSchema = z
  .union([z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal(""), z.null()])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    if (v === null || v === "") return null;
    return v;
  });

const projectFieldsSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(1).max(20000),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),
  locality: z.string().trim().min(2).max(200),
  ownershipRole: projectOwnershipRoleUiSchema.optional(),
  lifecycle: projectLifecycleUiSchema.optional(),
  propertyTypes: z.array(propertyTypeSchema).max(10).optional(),
  configurations: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  priceFrom: z.number().nonnegative().optional().nullable(),
  priceTo: z.number().nonnegative().optional().nullable(),
  sizeFrom: z.number().nonnegative().optional().nullable(),
  sizeTo: z.number().nonnegative().optional().nullable(),
  amenities: z.array(z.string().trim().min(1).max(80)).max(50).optional(),
  images: z.array(imageUrlSchema).max(30).optional(),
  contactName: z.string().trim().min(1).max(120).optional(),
  contactPhone: z.string().trim().min(5).max(40).optional(),
  reraId: z.string().trim().max(80).optional().nullable(),
  reraApproved: z.boolean().optional(),
  possessionDate: optionalDateSchema,
  launchDate: optionalDateSchema,
  status: projectStatusUiSchema.optional(),
  featured: z.boolean().optional(),
  seoTitle: z.string().trim().max(200).optional(),
  seoDescription: z.string().trim().max(500).optional(),
});

function refinePriceAndSizeRanges(
  data: {
    priceFrom?: number | null;
    priceTo?: number | null;
    sizeFrom?: number | null;
    sizeTo?: number | null;
  },
  ctx: z.RefinementCtx,
) {
  if (
    data.priceFrom != null &&
    data.priceTo != null &&
    data.priceFrom > data.priceTo
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["priceTo"],
      message: "priceTo must be greater than or equal to priceFrom",
    });
  }
  if (
    data.sizeFrom != null &&
    data.sizeTo != null &&
    data.sizeFrom > data.sizeTo
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["sizeTo"],
      message: "sizeTo must be greater than or equal to sizeFrom",
    });
  }
}

export const projectCreateSchema = projectFieldsSchema.superRefine(refinePriceAndSizeRanges);

/** Zod v4: cannot call .partial() on refined schemas — partial the base object first. */
export const projectUpdateSchema = projectFieldsSchema
  .partial()
  .extend({
    rejectionReason: z
      .union([z.string().trim().max(1000), z.literal(""), z.null()])
      .optional()
      .transform((v) => {
        if (v === undefined) return undefined;
        if (v === null || v === "") return null;
        return v;
      }),
  })
  .superRefine(refinePriceAndSizeRanges);

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
/** Prefer input type so optional transform fields stay optional on callers. */
export type ProjectUpdateInput = z.input<typeof projectUpdateSchema>;
