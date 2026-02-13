import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./BaseRepository";

export interface Execution {
  id: number;
  task_id: number;
  start_time?: string;
  end_time?: string;
  date: string;
  type: "manual" | "pomodoro" | "stopwatch";
  created_at: string;
}

export class ExecutionRepository extends BaseRepository<Execution> {
  constructor(db: SQLiteDatabase) {
    super(db, "executions");
  }
}
