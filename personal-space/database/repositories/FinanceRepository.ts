import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./BaseRepository";

export interface Finance {
  id: number;
  project_id: number;
  task_id?: number;
  event_id?: number;
  habit_id?: number;
  amount: number;
  currency_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export class FinanceRepository extends BaseRepository<Finance> {
  constructor(db: SQLiteDatabase) {
    super(db, "finances");
  }

  async getByProject(projectId: number): Promise<Finance[]> {
    return await this.db.getAllAsync<Finance>(
      "SELECT * FROM finances WHERE project_id = ? ORDER BY updated_at DESC;",
      [projectId]
    );
  }

  async getByTask(taskId: number): Promise<Finance[]> {
    return await this.db.getAllAsync<Finance>(
      "SELECT * FROM finances WHERE task_id = ? ORDER BY updated_at DESC;",
      [taskId]
    );
  }

  async getByEvent(eventId: number): Promise<Finance[]> {
    return await this.db.getAllAsync<Finance>(
      "SELECT * FROM finances WHERE event_id = ? ORDER BY updated_at DESC;",
      [eventId]
    );
  }

  async getByHabit(habitId: number): Promise<Finance[]> {
    return await this.db.getAllAsync<Finance>(
      "SELECT * FROM finances WHERE habit_id = ? ORDER BY updated_at DESC;",
      [habitId]
    );
  }
}
