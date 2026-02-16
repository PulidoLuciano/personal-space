import { EventEmitter } from "eventemitter3";

export interface TaskExecutionEventData {
  projectId?: number;
  taskId?: number;
  executionId?: number;
}

export const taskExecutionEvents = new EventEmitter<{
  taskExecutionChanged: [TaskExecutionEventData];
}>();

export const TASK_EXECUTION_CHANGED = "taskExecutionChanged";
