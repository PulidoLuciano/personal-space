import { z } from "zod";
import { baseSchema } from "./baseSchema.js";

export const insertProjectSchema = z.object({
  name: z.string().min(1, "can not be empty."),
  color_id: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "must be a hexadecimal rgb color.")
    .default("#777777"),
  icon_id: z.string().default("circle"),
});

export const projectSchema = insertProjectSchema.extend(
  baseSchema.extend({
    is_archived: z.boolean().default(false),
  }),
);

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = z.infer<typeof projectSchema>;
