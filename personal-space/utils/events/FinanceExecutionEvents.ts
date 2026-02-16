import { EventEmitter } from "eventemitter3";

export const financeExecutionEvents = new EventEmitter();
export const FINANCE_EXECUTION_CHANGED = "financeExecutionChanged";
