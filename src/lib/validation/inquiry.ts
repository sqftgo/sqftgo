import { z } from "zod";

export const inquiryStatusSchema = z.enum(["new", "read", "archived"]);

export const inquiryCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(5).max(40),
  message: z.string().trim().min(5).max(5000),
});

export const inquiryUpdateSchema = z.object({
  status: inquiryStatusSchema,
});

export type InquiryCreateInput = z.infer<typeof inquiryCreateSchema>;
export type InquiryUpdateInput = z.infer<typeof inquiryUpdateSchema>;

export function inquiryZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid request body";
  const path = first.path.length ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}
