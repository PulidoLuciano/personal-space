import { z } from "zod";
import { baseSchema } from "./baseSchema.js";

export const insertListSchema = z.object({
  name: z.string().min(1, "can not be empty."),
  color_id: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "must be a hexadecimal rgb color.")
    .default("#777777"),
  icon_id: z.string().default("circle"),
});

export const updateListSchema = insertListSchema.partial();

export const listSchema = z.object({
  ...baseSchema.shape,
  ...insertListSchema.shape,
  is_archived: z.boolean().default(false),
  show_completed: z.boolean().default(true),
  mutable: z.boolean().default(true),
  can_delete: z.boolean().default(true),
});

export type InsertList = z.infer<typeof insertListSchema>;
export type UpdateList = z.infer<typeof updateListSchema>;
export type List = z.infer<typeof listSchema>;
