import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./BaseRepository";

export interface Task {
  id: number;
  project_id: number;
  habit_id?: number;
  title: string;
  due_date: string | null;
  location_name: string | null;
  location_lat: number | null;
  location_lon: number | null;
  completition_by: number | null;
  count_goal: number;
  created_at: string;
  updated_at: string;
}

export class TaskRepository extends BaseRepository<Task> {
  constructor(db: SQLiteDatabase) {
    super(db, "tasks");
  }

  async getByProject(projectId: number): Promise<Task[]> {
    return await this.db.getAllAsync<Task>(
      "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC;",
      [projectId]
    );
  }

  async getById(id: number): Promise<Task | null> {
    return await this.db.getFirstAsync<Task>(
      "SELECT * FROM tasks WHERE id = ?;",
      [id]
    );
  }

  async getByHabit(habitId: number): Promise<Task[]> {
    return await this.db.getAllAsync<Task>(
      "SELECT * FROM tasks WHERE habit_id = ? ORDER BY created_at DESC;",
      [habitId]
    );
  }
}
