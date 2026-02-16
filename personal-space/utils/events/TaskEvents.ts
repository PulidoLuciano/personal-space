import { EventEmitter } from "eventemitter3";

export interface TaskEventData {
  projectId?: number;
  taskId?: number;
}

export const taskEvents = new EventEmitter<{
  taskChanged: [TaskEventData];
}>();

export const TASK_CHANGED = "taskChanged";
