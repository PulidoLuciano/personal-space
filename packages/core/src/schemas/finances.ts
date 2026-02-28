import { z } from "zod";
import { baseSchema } from "./baseSchema.js";

export const currencySchema = z.object({
  name: z.string().min(1, "can not be empty"),
  symbol: z.string().min(1, "can not be empty"),
});

export const insertFinanceSchema = z.object({
  title: z.string().min(1, "can not be empty."),
  description: z.string().nullable().default(null),
  amount: z.number(),
  is_favorite: z.boolean().default(false),
  project_id: z.string().uuid(),
  currency_id: z.string(),
});

export const financeSchema = z.object({
  ...baseSchema.shape,
  ...insertFinanceSchema.shape,
});

export const financeWithCurrencySchema = financeSchema.extend({
  currency: currencySchema,
});

export const financeSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  amount: z.number(),
});

export const financeDetailSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  amount: z.number(),
  currency: currencySchema,
});

export const insertFinanceExecutionSchema = z.object({
  amount: z.number(),
  date: z.date(),
  finance_id: z.string().uuid(),
  currency_id: z.string(),
});

export const financeExecutionSchema = z.object({
  ...baseSchema.shape,
  ...insertFinanceExecutionSchema.shape,
});

export const financeExecutionWithCurrencySchema = financeExecutionSchema.extend({
  currency: currencySchema,
});

export const financeExecutionByProjectSchema = z.object({
  id: z.string().uuid(),
  amount: z.number(),
  date: z.date(),
  finance_title: z.string(),
  currency: currencySchema,
});

export const financeExecutionByFinanceSchema = z.object({
  id: z.string().uuid(),
  amount: z.number(),
  date: z.date(),
  currency: currencySchema,
});

export type Currency = z.infer<typeof currencySchema>;
export type InsertFinance = z.infer<typeof insertFinanceSchema>;
export type Finance = z.infer<typeof financeSchema>;
export type InsertFinanceExecution = z.infer<typeof insertFinanceExecutionSchema>;
export type FinanceExecution = z.infer<typeof financeExecutionSchema>;
export type FinanceWithCurrency = z.infer<typeof financeWithCurrencySchema>;
export type FinanceSummary = z.infer<typeof financeSummarySchema>;
export type FinanceDetail = z.infer<typeof financeDetailSchema>;
export type FinanceExecutionWithCurrency = z.infer<typeof financeExecutionWithCurrencySchema>;
export type FinanceExecutionByProject = z.infer<typeof financeExecutionByProjectSchema>;
export type FinanceExecutionByFinance = z.infer<typeof financeExecutionByFinanceSchema>;
