import { z } from "zod";
import { baseSchema } from "./baseSchema.js";

export const insertFinanceSchema = z.object({
  title: z.string().min(1, "can not be empty."),
  description: z.string().nullable().default(null),
  amount: z.number(),
  is_favorite: z.boolean().default(false),
  project_id: z.uuid(),
  currecy_id: z.uuid(),
});

export const financeSchema = insertFinanceSchema.extend(baseSchema);

export const insertFinanceExecutionSchema = z.object({
  amount: z.number(),
  date: z.date(),
  finance_id: z.uuid(),
  currecy_id: z.uuid(),
});

export const financeExecutionSchema = insertFinanceSchema.extend(baseSchema);

export type InsertFinance = z.infer<typeof insertFinanceSchema>;
export type Finance = z.infer<typeof financeSchema>;
export type InsertFinanceExecution = z.infer<
  typeof insertFinanceExecutionSchema
>;
export type FinanceExecution = z.infer<typeof financeExecutionSchema>;
