import { z } from "zod";
import { baseSchema } from "./baseSchema.js";

export const insertTaskSchema = z.object({
  name: z.string().min(1, "cannot be empty"),
  body: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  due_rule: z.string().nullable().default(null),
  type: z.enum(["by time", "by executions", "note"]),
  objective: z.number().int().min(1).default(1),
  recurrency: z.string().nullable().default(null),
  begin_date: z.date().nullable().default(null),
  section_id: z.uuid(),
});

export const taskSchema = z.object({
  ...baseSchema.shape,
  ...insertTaskSchema.shape,
});

export const insertTaskExecutionsSchema = z.object({
  ocurrence_date: z.date().nullable().default(null),
  start_time: z.date().default(new Date()),
  end_time: z.date().nullable().default(null),
  task_id: z.uuid(),
});

export const taskExecutionsSchema = z.object({
  ...baseSchema.shape,
  ...insertTaskExecutionsSchema.shape,
});

export const insertTaskExceptionsSchema = z.object({
  ocurrence_date: z.date().nullable().default(null),
  reschedule_due: z.date().nullable().default(null),
  override_body: z.string().nullable().default(null),
  override_location: z.string().nullable().default(null),
  override_type: z
    .enum(["by time", "by executions", "note"])
    .nullable()
    .default(null),
  override_objective: z.number().int().min(1).nullable().default(null),
});

export const taskExceptionsSchema = z.object({
  ...baseSchema.shape,
  ...insertTaskExceptionsSchema.shape,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = z.infer<typeof taskSchema>;
export type InsertTaskExecution = z.infer<typeof insertTaskExecutionsSchema>;
export type TaskExecution = z.infer<typeof taskExecutionsSchema>;
export type InsertTaskException = z.infer<typeof insertTaskExceptionsSchema>;
export type TaskException = z.infer<typeof taskExceptionsSchema>;

export interface TaskWithProgress {
  id: string;
  name: string;
  due_date: Date | null;
  type: "by time" | "by executions" | "note";
  objective: number;
  progress: number;
  occurrence_date: Date | null;
}

export interface TaskInRange {
  id: string;
  name: string;
  is_complete: boolean;
  occurrence_date: Date | null;
}
