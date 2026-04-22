import { z, type ZodIssue } from "zod";

export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i: ZodIssue) => i.message).join(", ");
    throw new Error(issues);
  }
  return parsed.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validatePartial(schema: z.ZodObject<any>, data: unknown) {
  const partialSchema = schema.partial();
  const parsed = partialSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i: ZodIssue) => i.message).join(", ");
    throw new Error(issues);
  }
  return parsed.data;
}