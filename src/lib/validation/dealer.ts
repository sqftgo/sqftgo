import { z } from "zod";

export const directoryCategorySchema = z.enum([
  "Agent & Broker",
  "Builder & Developer",
  "Interior Decorator",
  "Architect",
  "Building Contractor",
  "Property Consultant",
  "Vastu Consultant",
  "Home Valuation/Inspection",
  "Home Shifting/Deep Cleaning",
]);

const dealerFields = {
  firmName: z.string().trim().min(2).max(160),
  ownerName: z.string().trim().min(2).max(120),
  category: directoryCategorySchema,
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().max(300),
  email: z.string().trim().email().max(200),
  website: z.string().trim().max(200),
  mobile: z.string().trim().min(5).max(40),
  description: z.string().trim().max(5000),
  reraId: z.string().trim().max(80),
  experience: z.string().trim().max(80),
  specialties: z.array(z.string().trim().min(1).max(80)).max(30),
  teamSize: z.number().int().min(0).max(10000),
  listingsCount: z.number().int().min(0).max(100000),
};

export const dealerCreateSchema = z.object({
  firmName: dealerFields.firmName,
  ownerName: dealerFields.ownerName,
  category: dealerFields.category,
  city: dealerFields.city,
  address: dealerFields.address.optional().default(""),
  email: dealerFields.email,
  website: dealerFields.website.optional().default(""),
  mobile: dealerFields.mobile,
  description: dealerFields.description.optional().default(""),
  reraId: dealerFields.reraId.optional(),
  experience: dealerFields.experience.optional(),
  specialties: dealerFields.specialties.optional().default([]),
  teamSize: dealerFields.teamSize.optional(),
  listingsCount: dealerFields.listingsCount.optional(),
});

/** Partial update — no defaults, so omitted keys are left unchanged. */
export const dealerUpdateSchema = z
  .object({
    firmName: dealerFields.firmName.optional(),
    ownerName: dealerFields.ownerName.optional(),
    category: dealerFields.category.optional(),
    city: dealerFields.city.optional(),
    address: dealerFields.address.optional(),
    email: dealerFields.email.optional(),
    website: dealerFields.website.optional(),
    mobile: dealerFields.mobile.optional(),
    description: dealerFields.description.optional(),
    reraId: dealerFields.reraId.optional().nullable(),
    experience: dealerFields.experience.optional().nullable(),
    specialties: dealerFields.specialties.optional(),
    teamSize: dealerFields.teamSize.optional().nullable(),
    listingsCount: dealerFields.listingsCount.optional(),
  })
  .strict();

export type DealerCreateInput = z.infer<typeof dealerCreateSchema>;
export type DealerUpdateInput = z.infer<typeof dealerUpdateSchema>;

export function dealerZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid request body";
  const path = first.path.length ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}
