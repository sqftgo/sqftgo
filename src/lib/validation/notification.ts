import { z } from "zod";

export const notificationTypeSchema = z.enum(["info", "success", "warning", "error"]);
export const notificationForRoleSchema = z.enum(["user", "broker", "admin", "all"]);

export const notificationUpdateSchema = z
  .object({
    read: z.boolean(),
  })
  .strict();

export type NotificationUpdateInput = z.infer<typeof notificationUpdateSchema>;

export function notificationZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid request body";
  const path = first.path.length ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}
