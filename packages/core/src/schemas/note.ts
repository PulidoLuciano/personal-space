import { z } from "zod";

export const insertNoteSchema = z.object({
  title: z.string().min(1, "can not be empty."),
  content: z.string().nullable().default(null),
  project_id: z.string().uuid(),
});

export const noteSchema = insertNoteSchema.extend({
  id: z.uuid(),
  updated_at: z.date(),
  is_deleted: z.boolean().default(false),
});

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = z.infer<typeof noteSchema>;
