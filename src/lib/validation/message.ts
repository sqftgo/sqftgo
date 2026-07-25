import { z } from "zod";

export const messageThreadKindSchema = z.enum(["direct", "support"]);
export const messageThreadStatusSchema = z.enum(["open", "resolved", "archived"]);

export const messageThreadCreateSchema = z.object({
  subject: z.string().trim().min(2).max(200),
  participantEmail: z.string().trim().email().max(200),
  body: z.string().trim().min(1).max(5000),
  kind: messageThreadKindSchema.optional(),
  propertyId: z.string().uuid().optional(),
});

export const messageCreateSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

export const messageThreadUpdateSchema = z
  .object({
    status: messageThreadStatusSchema.optional(),
    markRead: z.boolean().optional(),
  })
  .strict()
  .refine((v) => v.status !== undefined || v.markRead !== undefined, {
    message: "No updates provided",
  });

export type MessageThreadCreateInput = z.infer<typeof messageThreadCreateSchema>;
export type MessageCreateInput = z.infer<typeof messageCreateSchema>;
export type MessageThreadUpdateInput = z.infer<typeof messageThreadUpdateSchema>;

export function messageZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid request body";
  const path = first.path.length ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}
