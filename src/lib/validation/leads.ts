import { z } from "zod";

export const assistanceStatusSchema = z.enum([
  "Received",
  "Assigned to Agent",
  "Properties Suggested",
]);

export const assistanceCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(5).max(40),
  budget: z.string().trim().max(120).optional().default(""),
  areas: z.array(z.string().trim().min(1).max(80)).max(20).optional().default([]),
  bhk: z.string().trim().max(40).optional().default(""),
  familySize: z.number().int().min(0).max(50).optional().default(1),
  moveInDate: z.string().trim().max(40).optional().default(""),
  notes: z.string().trim().max(5000).optional().default(""),
});

export const assistanceUpdateSchema = z
  .object({
    status: assistanceStatusSchema.optional(),
    notes: z.string().trim().max(5000).optional(),
  })
  .strict();

export const enquiryCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  city: z.string().trim().max(80).optional().default(""),
  propertyType: z.string().trim().max(80).optional().default(""),
  budget: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().email().max(200),
  mobile: z.string().trim().min(5).max(40),
  remarks: z.string().trim().max(5000).optional().default(""),
  message: z.string().trim().max(5000).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export type AssistanceCreateInput = z.infer<typeof assistanceCreateSchema>;
export type AssistanceUpdateInput = z.infer<typeof assistanceUpdateSchema>;
export type EnquiryCreateInput = z.infer<typeof enquiryCreateSchema>;

export function leadZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid request body";
  const path = first.path.length ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}
