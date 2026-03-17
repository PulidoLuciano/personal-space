import { BaseRepository } from "./BaseRepository.js";
import type {
  Task,
  TaskExecution,
  TaskException,
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
}
