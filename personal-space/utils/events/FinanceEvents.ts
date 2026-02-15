import { EventEmitter } from "eventemitter3";

export interface FinanceEventData {
  projectId?: number;
  financeId?: number;
}

export const financeEvents = new EventEmitter<{
  financeChanged: [FinanceEventData];
}>();

export const FINANCE_CHANGED = "financeChanged";
