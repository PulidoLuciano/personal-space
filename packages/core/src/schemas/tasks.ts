import { z } from "zod";
import { baseSchema } from "./baseSchema.js";
import { projectSchema } from "./project.js";

export const insertTaskInfoSchema = z.object({
  title: z.string().min(1, "cannot be empty"),
  description: z.string().nullable().default(null),
  localization: z.string().nullable().default(null),
  due_rule: z.string().nullable().default(null),
  by_time: z.boolean().default(false),
  objective: z.number().int().min(0),
  recurrency: z.string().nullable().default(null),
  begin_date: z.date().nullable().default(null),
  project_id: z.uuid(),
});

export const taskInfoSchema = z.object({
  ...baseSchema.shape,
  ...insertTaskInfoSchema.shape,
});

export const taskInfoWithProjectSchema = taskInfoSchema.extend({
  project: projectSchema,
});

export const insertTaskSchema = z.object({
  is_skipped: z.boolean().default(false),
  due_date: z.date().nullable().default(null),
  info_id: z.uuid(),
});

export const taskSchema = z.object({
  ...baseSchema.shape,
  ...insertTaskSchema.shape,
  creation_date: z.date(),
});

export const taskWithInfoSchema = taskSchema.extend({
  info: taskInfoSchema,
});

export const insertTaskExecutionSchema = z.object({
  start_time: z.date().nullable().default(null),
  end_time: z.date().nullable().default(null),
  task_id: z.uuid(),
});

export const taskExecutionSchema = z.object({
  ...baseSchema.shape,
  ...insertTaskExecutionSchema.shape,
});

export const taskExecutionWithTaskSchema = taskExecutionSchema.extend({
  task: taskSchema,
});

export type InsertTaskInfo = z.infer<typeof insertTaskInfoSchema>;
export type TaskInfo = z.infer<typeof taskInfoSchema>;
export type TaskInfoWithProject = z.infer<typeof taskInfoWithProjectSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = z.infer<typeof taskSchema>;
export type TaskWithInfo = z.infer<typeof taskWithInfoSchema>;
export type InsertTaskExecution = z.infer<typeof insertTaskExecutionSchema>;
export type TaskExecution = z.infer<typeof taskExecutionSchema>;
export type TaskExecutionWithTask = z.infer<typeof taskExecutionWithTaskSchema>;
