import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { tasks, projects, habits, finances } from "./schema";

// --- TASKS SCHEMAS ---
// createInsertSchema automatically makes `id` and `createdAt` optional!
export const insertTaskSchema = createInsertSchema(tasks);
export const selectTaskSchema = createSelectSchema(tasks);

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = z.infer<typeof selectTaskSchema>;

// --- PROJECTS SCHEMAS ---
export const insertProjectSchema = createInsertSchema(projects, {
  name: (schema) => schema.min(1, "Project name is required"),
  color: (schema) =>
    schema.regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
});
export const selectProjectSchema = createSelectSchema(projects);

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = z.infer<typeof selectProjectSchema>;

// --- HABITS SCHEMAS ---
export const insertHabitSchema = createInsertSchema(habits);
export const selectHabitSchema = createSelectSchema(habits);

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = z.infer<typeof selectHabitSchema>;

// --- FINANCES SCHEMAS ---
export const insertFinanceSchema = createInsertSchema(finances);
export const selectFinanceSchema = createSelectSchema(finances);

export type InsertFinance = z.infer<typeof insertFinanceSchema>;
export type Finance = z.infer<typeof selectFinanceSchema>;
