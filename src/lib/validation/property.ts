import { z } from "zod";

export const propertyTypeSchema = z.enum([
  "Home",
  "Villa",
  "Hotel",
  "Agricultural Land",
  "Apartment",
  "Office Space",
  "Commercial Space",
  "Shop",
  "Industrial Plot",
]);

export const propertyPurposeSchema = z.enum(["buy", "sell", "rent", "lease"]);

export const furnishedSchema = z.enum(["Furnished", "Semi-Furnished", "Unfurnished"]);

/** UI-facing status labels used across the app */
export const propertyStatusUiSchema = z.enum([
  "Active",
  "Pending Review",
  "Sold",
  "Rented",
  "Draft",
  "Rejected",
]);

export const verificationChecksSchema = z
  .object({
    titleDeed: z.boolean(),
    taxClearance: z.boolean(),
    utilitiesCheck: z.boolean(),
    physicalVerification: z.boolean(),
    structuralVetted: z.boolean(),
  })
  .partial()
  .optional();

export const priceBreakdownSchema = z
  .object({
    basePrice: z.number().nonnegative(),
    securityDeposit: z.number().nonnegative().optional(),
    maintenance: z.number().nonnegative(),
    registrationFees: z.number().nonnegative().optional(),
    gst: z.number().nonnegative().optional(),
  })
  .optional();

const imageUrlSchema = z
  .string()
  .trim()
  .min(1)
  .refine((v) => v.startsWith("https://") || v.startsWith("http://"), {
    message: "Image URLs must start with http:// or https://",
  });

export const propertyCreateSchema = z.object({
  title: z.string().trim().min(3).max(200),
  price: z.number().nonnegative(),
  type: propertyTypeSchema,
  purpose: propertyPurposeSchema,
  bhk: z.number().int().min(0).max(50).optional(),
  bathrooms: z.number().int().min(0).max(50).optional(),
  parking: z.number().int().min(0).max(100).optional(),
  yearBuilt: z.number().int().min(1800).max(2100).optional(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),
  locality: z.string().trim().min(2).max(200),
  nearbyHospital: z.string().trim().max(200).optional().nullable(),
  nearbySchool: z.string().trim().max(200).optional().nullable(),
  nearbyTransportation: z.string().trim().max(200).optional().nullable(),
  size: z.number().nonnegative(),
  furnished: furnishedSchema,
  description: z.string().trim().min(1).max(20000),
  amenities: z.array(z.string().trim().min(1).max(80)).max(50).optional(),
  images: z.array(imageUrlSchema).max(30).optional(),
  videoUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  ownerName: z.string().trim().min(1).max(120).optional(),
  ownerPhone: z.string().trim().min(5).max(40).optional(),
  ownerEmail: z.string().trim().email().optional(),
  status: propertyStatusUiSchema.optional(),
  featured: z.boolean().optional(),
  reraApproved: z.boolean().optional(),
  reraId: z.string().trim().max(80).optional(),
  verifiedDate: z.string().trim().max(40).optional(),
  seoTitle: z.string().trim().max(200).optional(),
  seoDescription: z.string().trim().max(500).optional(),
  verificationChecks: verificationChecksSchema,
  priceBreakdown: priceBreakdownSchema,
});

export const propertyUpdateSchema = propertyCreateSchema.partial().extend({
  inquiryCount: z.number().int().min(0).optional(),
  rejectionReason: z
    .union([z.string().trim().max(1000), z.literal(""), z.null()])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      if (v === null || v === "") return null;
      return v;
    }),
});

export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>;
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;

export function zodErrorMessage(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid request body";
  const path = first.path.length ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}
