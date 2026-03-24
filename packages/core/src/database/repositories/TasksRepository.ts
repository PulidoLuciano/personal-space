import { BaseRepository } from "./BaseRepository.js";
import type {
  Task,
  TaskExecution,
  TaskException,
  InsertTaskException,
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
}

export class TaskExecutionsRepository extends BaseRepository<TaskExecution> {
  public constructor(db: DBClient) {
    super(db, "task_executions");
  }

  public async findByTaskWithoutOccurrence(taskId: string): Promise<TaskExecution[]> {
    const query = `
      SELECT * FROM task_executions 
      WHERE task_id = ? AND (ocurrence_date IS NULL OR ocurrence_date = '') AND is_deleted = FALSE;
    `;
    return await this.db.query<TaskExecution>(query, [taskId]);
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
      WHERE task_id = ? AND ocurrence_date = ? AND is_deleted = FALSE;
    `;
    const result = await this.db.queryOne<TaskException>(query, [
      taskId,
      ocurrenceDate,
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
      ocurrence_date: ocurrenceDate,
      ...data,
    } as Partial<TaskException>;

    return await this.create(createData);
  }
}
