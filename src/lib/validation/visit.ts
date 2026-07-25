import { z } from "zod";

export const visitStatusDbSchema = z.enum([
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

export const visitStatusUiSchema = z.enum([
  "Pending Approval",
  "Confirmed",
  "Completed",
  "Cancelled",
]);

const timeSlotSchema = z
  .string()
  .trim()
  .min(2)
  .max(40)
  .regex(/^[0-9]{1,2}:[0-9]{2}\s?(AM|PM)$/i, "Use a time like 11:00 AM");

const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const visitCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(5).max(40),
  date: dateSchema,
  time: timeSlotSchema,
  notes: z.string().trim().max(2000).optional(),
});

export const visitUpdateSchema = z
  .object({
    status: visitStatusUiSchema.optional(),
    date: dateSchema.optional(),
    time: timeSlotSchema.optional(),
    notes: z.string().trim().max(2000).optional(),
    brokerNotes: z.string().trim().max(2000).optional(),
  })
  .strict()
  .refine(
    (v) =>
      v.status !== undefined ||
      v.date !== undefined ||
      v.time !== undefined ||
      v.notes !== undefined ||
      v.brokerNotes !== undefined,
    { message: "No updates provided" }
  );

export type VisitCreateInput = z.infer<typeof visitCreateSchema>;
export type VisitUpdateInput = z.infer<typeof visitUpdateSchema>;

export function visitZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid request body";
  const path = first.path.length ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}
