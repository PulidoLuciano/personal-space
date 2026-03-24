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
}

export class TaskExecutionsRepository extends BaseRepository<TaskExecution> {
  public constructor(db: DBClient) {
    super(db, "task_executions");
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
