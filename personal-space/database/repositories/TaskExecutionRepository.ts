import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./BaseRepository";

export interface TaskExecution {
  id: number;
  task_id: number;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  updated_at: string;
}

export class TaskExecutionRepository extends BaseRepository<TaskExecution> {
  constructor(db: SQLiteDatabase) {
    super(db, "task_executions");
  }

  async getByTask(taskId: number): Promise<TaskExecution[]> {
    return await this.db.getAllAsync<TaskExecution>(
      "SELECT * FROM task_executions WHERE task_id = ? ORDER BY created_at DESC;",
      [taskId]
    );
  }

  async getById(id: number): Promise<TaskExecution | null> {
    return await this.db.getFirstAsync<TaskExecution>(
      "SELECT * FROM task_executions WHERE id = ?;",
      [id]
    );
  }

  async getActiveByTask(taskId: number): Promise<TaskExecution | null> {
    return await this.db.getFirstAsync<TaskExecution>(
      "SELECT * FROM task_executions WHERE task_id = ? AND end_time IS NULL ORDER BY created_at DESC LIMIT 1;",
      [taskId]
    );
  }

  async createExecution(data: {
    taskId: number;
    startTime?: string;
    endTime?: string;
  }): Promise<number> {
    const result = await this.db.runAsync(
      "INSERT INTO task_executions (task_id, start_time, end_time) VALUES (?, ?, ?);",
      [data.taskId, data.startTime || null, data.endTime || null]
    );
    return result.lastInsertRowId;
  }

  async updateExecution(
    id: number,
    data: {
      startTime?: string;
      endTime?: string;
    }
  ): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.startTime !== undefined) {
      updates.push("start_time = ?");
      values.push(data.startTime);
    }
    if (data.endTime !== undefined) {
      updates.push("end_time = ?");
      values.push(data.endTime);
    }

    if (updates.length > 0) {
      values.push(id);
      await this.db.runAsync(
        `UPDATE task_executions SET ${updates.join(", ")} WHERE id = ?;`,
        values
      );
    }
  }

  async deleteExecution(id: number): Promise<void> {
    await this.db.runAsync("DELETE FROM task_executions WHERE id = ?;", [id]);
  }

  async countCompletedByTask(taskId: number): Promise<number> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM task_executions WHERE task_id = ? AND end_time IS NOT NULL;",
      [taskId]
    );
    return result?.count || 0;
  }

  async sumMinutesByTask(taskId: number): Promise<number> {
    const result = await this.db.getFirstAsync<{ total: number | null }>(
      `SELECT SUM(
        CASE
          WHEN start_time IS NOT NULL AND end_time IS NOT NULL
          THEN CAST((julianday(end_time) - julianday(start_time)) * 24 * 60 AS INTEGER)
          ELSE 0
        END
      ) as total FROM task_executions WHERE task_id = ? AND end_time IS NOT NULL;`,
      [taskId]
    );
    return result?.total || 0;
  }
}
