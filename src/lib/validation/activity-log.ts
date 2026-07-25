import { z } from "zod";

export const activityLogRoleSchema = z.enum(["Admin", "Dealer", "Broker", "User"]);

export const activityLogCreateSchema = z.object({
  action: z.string().trim().min(2).max(200),
  performedBy: z.string().trim().min(1).max(200).optional(),
  role: activityLogRoleSchema.optional(),
  target: z.string().trim().max(500).default(""),
  entityType: z.string().trim().max(80).optional(),
  entityId: z.string().uuid().optional(),
});

export type ActivityLogCreateInput = z.infer<typeof activityLogCreateSchema>;

export function activityLogZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid request body";
  const path = first.path.length ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}
