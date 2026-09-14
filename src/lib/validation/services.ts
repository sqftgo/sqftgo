import { z } from "zod";

export const serviceTypeCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().default(""),
  icon: z.string().trim().min(1).max(16).optional().default("🔧"),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).max(100000).optional().default(100),
});

export const serviceTypeUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(2000).optional(),
    icon: z.string().trim().min(1).max(16).optional(),
    active: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(100000).optional(),
  })
  .strict();

export const serviceBookingCreateSchema = z.object({
  preferredAt: z.string().datetime({ offset: true }).or(z.string().min(8).max(40)),
  message: z.string().trim().max(4000).optional().default(""),
  contactPhone: z.string().trim().min(5).max(40),
});

export const serviceBookingUpdateSchema = z
  .object({
    status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
    ownerNotes: z.string().trim().max(2000).optional(),
    preferredAt: z.string().min(8).max(40).optional(),
    message: z.string().trim().max(4000).optional(),
    contactPhone: z.string().trim().min(5).max(40).optional(),
  })
  .strict();

export const serviceVerificationSubmitSchema = z.object({
  businessRegistrationId: z.string().trim().max(120).optional().nullable(),
  ownerNotes: z.string().trim().max(2000).optional().default(""),
});

export const serviceVerificationAdminUpdateSchema = z
  .object({
    status: z.enum(["approved", "rejected", "pending"]),
    adminNotes: z.string().trim().max(2000).optional().default(""),
    rejectionReason: z.string().trim().max(2000).optional().nullable(),
  })
  .strict();

export function serviceZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid request body";
  const path = first.path.length ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}

export type ServiceTypeCreateInput = z.infer<typeof serviceTypeCreateSchema>;
export type ServiceTypeUpdateInput = z.infer<typeof serviceTypeUpdateSchema>;
export type ServiceBookingCreateInput = z.infer<typeof serviceBookingCreateSchema>;
export type ServiceBookingUpdateInput = z.infer<typeof serviceBookingUpdateSchema>;
