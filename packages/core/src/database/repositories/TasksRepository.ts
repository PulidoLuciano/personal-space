import { BaseRepository } from "./BaseRepository.js";
import type {
  Task,
  TaskExecution,
  TaskException,
  InsertTaskException,
  TaskWithListInfo,
} from "../../schemas/tasks.js";
import type { DBClient } from "../index.js";

export class TasksRepository extends BaseRepository<Task> {
  public constructor(db: DBClient) {
    super(db, "tasks");
  }

  public async findBySection(sectionId: string): Promise<Task[]> {
    const query = `
      SELECT * FROM tasks 
      WHERE section_id = ? AND is_deleted = FALSE;
    `;
    return await this.db.query<Task>(query, [sectionId]);
  }

  public async findNonRecurrentBySection(sectionId: string): Promise<Task[]> {
    const query = `
      SELECT * FROM tasks 
      WHERE section_id = ? AND is_deleted = FALSE AND (recurrency IS NULL OR recurrency = '');
    `;
    return await this.db.query<Task>(query, [sectionId]);
  }

  public async findRecurrentBySection(sectionId: string): Promise<Task[]> {
    const query = `
      SELECT * FROM tasks 
      WHERE section_id = ? AND is_deleted = FALSE AND recurrency IS NOT NULL AND recurrency != '';
    `;
    return await this.db.query<Task>(query, [sectionId]);
  }

  public async searchWithListInfo(searchTerm: string): Promise<TaskWithListInfo[]> {
    const query = `
      SELECT 
        t.id, t.name, t.type, t.objective, t.section_id, t.recurrency,
        s.name as section_name,
        s.list_id,
        l.name as list_name,
        l.color_id as list_color
      FROM tasks t
      JOIN sections s ON t.section_id = s.id
      JOIN lists l ON s.list_id = l.id
      WHERE t.is_deleted = FALSE 
        AND t.name LIKE ?
        AND l.is_archived = FALSE
      ORDER BY t.name ASC
      LIMIT 50;
    `;
    return await this.db.query<TaskWithListInfo>(query, [`%${searchTerm}%`]);
  }
}

export class TaskExecutionsRepository extends BaseRepository<TaskExecution> {
  public constructor(db: DBClient) {
    super(db, "task_executions");
  }

  public async findByTaskWithoutOccurrence(
    taskId: string,
  ): Promise<TaskExecution[]> {
    const query = `
      SELECT * FROM task_executions 
      WHERE task_id = ? AND (ocurrence_date IS NULL OR ocurrence_date = '') AND is_deleted = FALSE;
    `;
    return await this.db.query<TaskExecution>(query, [taskId]);
  }

  public async findByTaskAndOccurrence(
    taskId: string,
    ocurrenceDate: Date,
  ): Promise<TaskExecution[]> {
    const query = `
      SELECT * FROM task_executions 
      WHERE task_id = ? AND DATE(ocurrence_date) = ? AND is_deleted = FALSE;
    `;
    return await this.db.query<TaskExecution>(query, [
      taskId,
      `${ocurrenceDate.getUTCFullYear()}-${String(ocurrenceDate.getUTCMonth() + 1).padStart(2, "0")}-${String(ocurrenceDate.getUTCDate()).padStart(2, "0")}`,
    ]);
  }

  public async findRunningWithTaskInfo(): Promise<(TaskExecution & { taskName: string; taskType: string; taskObjective: number })[]> {
    const query = `
      SELECT 
        te.*, t.name as taskName, t.type as taskType, t.objective as taskObjective
      FROM task_executions te
      JOIN tasks t ON te.task_id = t.id
      WHERE te.end_time IS NULL AND te.is_deleted = FALSE
      ORDER BY te.start_time DESC;
    `;
    return await this.db.query<TaskExecution & { taskName: string; taskType: string; taskObjective: number }>(query, []);
  }
}

export class TaskExceptionsRepository extends BaseRepository<TaskException> {
  public constructor(db: DBClient) {
    super(db, "task_exceptions");
  }

  public async findByTaskAndOccurrence(
    taskId: string,
    ocurrenceDate: Date,
  ): Promise<TaskException | null> {
    const query = `
      SELECT * FROM task_exceptions 
      WHERE task_id = ? AND DATE(ocurrence_date) = ?;
    `;
    const result = await this.db.queryOne<TaskException>(query, [
      taskId,
      `${ocurrenceDate.getUTCFullYear()}-${String(ocurrenceDate.getUTCMonth() + 1).padStart(2, "0")}-${String(ocurrenceDate.getUTCDate()).padStart(2, "0")}`,
    ]);
    return result ?? null;
  }

  public async upsert(
    taskId: string,
    ocurrenceDate: Date,
    data: Partial<InsertTaskException>,
  ): Promise<string> {
    const existing = await this.findByTaskAndOccurrence(taskId, ocurrenceDate);
    if (existing) {
      await this.update(existing.id, data as Partial<TaskException>);
      return existing.id;
    }
    const createData = {
      task_id: taskId,
      ocurrence_date: ocurrenceDate.toISOString(),
      ...data,
    } as Partial<TaskException>;
    return await this.create(createData);
  }
}
