import { z } from "zod";

export const favoritePropertyIdSchema = z.object({
  propertyId: z.string().uuid(),
});

export function favoriteZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid request body";
  const path = first.path.length ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}
