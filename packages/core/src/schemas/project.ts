import { z } from "zod";

export const insertProjectSchema = z.object({
  name: z.string().min(1, "can not be empty."),
  color_id: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "must be a hexadecimal rgb color.")
    .default("#777777"),
  icon_id: z.string().default("circle"),
});

export const projectSchema = insertProjectSchema.extend({
  id: z.uuid(),
  is_archived: z.boolean().default(false),
  updated_at: z.date(),
  is_deleted: z.boolean().default(false),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = z.infer<typeof projectSchema>;
