import { z } from "zod";
import { baseSchema } from "./baseSchema.js";

export const insertTaskSchema = z.object({
  name: z.string().min(1, "cannot be empty"),
  body: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  due_rule: z.string().nullable().default(null),
  by_time: z.boolean().default(false),
  objective: z.number().int().min(0),
  recurrency: z.string().nullable().default(null),
  begin_date: z.date().nullable().default(null),
  section_id: z.uuid(),
});

export const taskInfoSchema = z.object({
  ...baseSchema.shape,
  ...insertTaskSchema.shape,
});

export type InsertTaskInfo = z.infer<typeof insertTaskSchema>;
export type TaskInfo = z.infer<typeof taskInfoSchema>;
