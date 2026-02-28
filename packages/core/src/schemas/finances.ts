import { z } from "zod";
import { baseSchema } from "./baseSchema.js";

export const currency = z.object({
  name: z.string().min(1, "can not be empty"),
  symbol: z.string().min(1, "can not be empty"),
});

export const insertFinanceSchema = z.object({
  title: z.string().min(1, "can not be empty."),
  description: z.string().nullable().default(null),
  amount: z.number(),
  is_favorite: z.boolean().default(false),
  project_id: z.uuid(),
  currecy_id: z.uuid(),
});

export const financeSchema = insertFinanceSchema.extend(baseSchema);

export const financeWithCurrencySchema = financeSchema.extend({
  currency: currency,
});

export const insertFinanceExecutionSchema = z.object({
  amount: z.number(),
  date: z.date(),
  finance_id: z.uuid(),
  currecy_id: z.uuid(),
});

export const financeExecutionSchema = insertFinanceSchema.extend(baseSchema);
export const financeExecutionWithCurrencySchema = financeExecutionSchema.extend(
  {
    currency: currency,
  },
);

export type InsertFinance = z.infer<typeof insertFinanceSchema>;
export type Finance = z.infer<typeof financeSchema>;
export type InsertFinanceExecution = z.infer<
  typeof insertFinanceExecutionSchema
>;
export type FinanceExecution = z.infer<typeof financeExecutionSchema>;
export type FinanceWithCurrency = z.infer<typeof financeWithCurrencySchema>;
export type FinanceExecutionWithCurrency = z.infer<
  typeof financeExecutionWithCurrencySchema
>;
