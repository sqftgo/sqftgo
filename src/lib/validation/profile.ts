import { z } from "zod";

const optionalNullableText = (max: number) =>
  z
    .union([z.string().max(max), z.null()])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      if (v === null) return null;
      const trimmed = v.trim();
      return trimmed === "" ? null : trimmed;
    });

export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    phone: optionalNullableText(30),
    bio: optionalNullableText(500),
    city: optionalNullableText(100),
    avatarUrl: z
      .union([z.string().url().max(2000), z.literal(""), z.null()])
      .optional()
      .transform((v) => {
        if (v === undefined) return undefined;
        if (v === null || v === "") return null;
        return v;
      }),
  })
  .strict()
  .refine(
    (v) =>
      v.name !== undefined ||
      v.phone !== undefined ||
      v.bio !== undefined ||
      v.city !== undefined ||
      v.avatarUrl !== undefined,
    { message: "No updates provided" }
  );

export function profileZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid JSON body";
  const path = first.path.length ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}
