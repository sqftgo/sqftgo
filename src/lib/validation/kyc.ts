import { z } from "zod";

export const kycDocTypeSchema = z.enum([
  "pan_card",
  "aadhaar",
  "rera_certificate",
  "other",
]);

const emptyToNull = (v: string | null | undefined) =>
  !v || !String(v).trim() ? null : String(v).trim();

export const dealerKycUpsertSchema = z.object({
  panNumber: z
    .union([z.string().trim().min(8).max(12), z.literal(""), z.null()])
    .transform(emptyToNull),
  aadhaarLast4: z
    .union([
      z.string().trim().regex(/^[0-9]{4}$/, "Enter last 4 Aadhaar digits"),
      z.literal(""),
      z.null(),
    ])
    .transform(emptyToNull),
  dealerNotes: z.string().trim().max(2000).optional().default(""),
  directoryProfileId: z.string().uuid().nullable().optional(),
  submit: z.boolean().optional().default(false),
});

export const adminKycReviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  adminNotes: z.string().trim().max(2000).optional().default(""),
  rejectionReason: z.string().trim().max(500).optional(),
});
