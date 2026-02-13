import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./BaseRepository";

export interface Task {
  id: number;
  project_id: number;
  state_id: number;
  title: string;
  description?: string;
  due_date?: string;
  recurrence_rule?: string;
  location_name?: string;
  location_lat?: number;
  location_lon?: number;
  created_at: string;
  updated_at: string;
}

export class TaskRepository extends BaseRepository<Task> {
  constructor(db: SQLiteDatabase) {
    super(db, "tasks");
  }
}
