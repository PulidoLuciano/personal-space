import { EventEmitter } from "eventemitter3";

export interface HabitEventData {
  projectId?: number;
  habitId?: number;
}

export const habitEvents = new EventEmitter<{
  habitChanged: [HabitEventData];
}>();

export const HABIT_CHANGED = "habitChanged";
