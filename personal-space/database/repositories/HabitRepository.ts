import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./BaseRepository";

export interface HabitData {
  id: number;
  project_id: number;
  is_strict: number;
  title: string;
  due_minutes: number | null;
  location_name: string | null;
  location_lat: number | null;
  location_lon: number | null;
  completition_by: number | null;
  count_goal: number;
  begin_at: string | null;
  recurrence_rule: string;
  created_at: string;
  updated_at: string;
}

export class HabitRepository extends BaseRepository<HabitData> {
  constructor(db: SQLiteDatabase) {
    super(db, "habits");
  }

  async getByProject(projectId: number): Promise<HabitData[]> {
    return await this.db.getAllAsync<HabitData>(
      "SELECT * FROM habits WHERE project_id = ? ORDER BY created_at DESC;",
      [projectId]
    );
  }

  async getById(id: number): Promise<HabitData | null> {
    return await this.db.getFirstAsync<HabitData>(
      "SELECT * FROM habits WHERE id = ?;",
      [id]
    );
  }

  async create(data: {
    projectId: number;
    isStrict?: boolean;
    title: string;
    dueMinutes?: number;
    locationName?: string;
    locationLat?: number;
    locationLon?: number;
    completitionBy?: number;
    countGoal?: number;
    beginAt?: string;
    recurrenceRule?: string;
  }): Promise<number> {
    const result = await this.db.runAsync(
      `INSERT INTO habits (
        project_id, is_strict, title, due_minutes, location_name,
        location_lat, location_lon, completition_by, count_goal,
        begin_at, recurrence_rule
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        data.projectId,
        data.isStrict ? 1 : 0,
        data.title,
        data.dueMinutes || null,
        data.locationName || null,
        data.locationLat || null,
        data.locationLon || null,
        data.completitionBy || null,
        data.countGoal || 1,
        data.beginAt || null,
        data.recurrenceRule || "",
      ]
    );
    return result.lastInsertRowId;
  }

  async update(
    id: number,
    data: {
      isStrict?: boolean;
      title?: string;
      dueMinutes?: number;
      locationName?: string;
      locationLat?: number;
      locationLon?: number;
      completitionBy?: number;
      countGoal?: number;
      beginAt?: string;
      recurrenceRule?: string;
    }
  ): Promise<void> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.isStrict !== undefined) {
      fields.push("is_strict = ?");
      values.push(data.isStrict ? 1 : 0);
    }
    if (data.title !== undefined) {
      fields.push("title = ?");
      values.push(data.title);
    }
    if (data.dueMinutes !== undefined) {
      fields.push("due_minutes = ?");
      values.push(data.dueMinutes || null);
    }
    if (data.locationName !== undefined) {
      fields.push("location_name = ?");
      values.push(data.locationName || null);
    }
    if (data.locationLat !== undefined) {
      fields.push("location_lat = ?");
      values.push(data.locationLat || null);
    }
    if (data.locationLon !== undefined) {
      fields.push("location_lon = ?");
      values.push(data.locationLon || null);
    }
    if (data.completitionBy !== undefined) {
      fields.push("completition_by = ?");
      values.push(data.completitionBy || null);
    }
    if (data.countGoal !== undefined) {
      fields.push("count_goal = ?");
      values.push(data.countGoal);
    }
    if (data.beginAt !== undefined) {
      fields.push("begin_at = ?");
      values.push(data.beginAt || null);
    }
    if (data.recurrenceRule !== undefined) {
      fields.push("recurrence_rule = ?");
      values.push(data.recurrenceRule || "");
    }

    if (fields.length === 0) return;

    values.push(id);
    await this.db.runAsync(
      `UPDATE habits SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?;`,
      values
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.runAsync("DELETE FROM habits WHERE id = ?;", [id]);
  }
}
