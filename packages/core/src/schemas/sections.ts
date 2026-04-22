import z from "zod";
import { baseSchema } from "./baseSchema.js";

export const insertSectionSchema = z.object({
  name: z.string().min(1, "cannot be empty"),
  list_id: z.string().min(1),
});

export const updateSectionSchema = insertSectionSchema.partial();

export const sectionSchema = z.object({
  ...insertSectionSchema.shape,
  ...baseSchema.shape,
  mutable: z.boolean().default(true),
});

export type InsertSection = z.infer<typeof insertSectionSchema>;
export type UpdateSection = z.infer<typeof updateSectionSchema>;
export type Section = z.infer<typeof sectionSchema>;
