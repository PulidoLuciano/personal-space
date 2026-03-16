import { BaseRepository } from "./BaseRepository.js";
import type { TaskInfo, Task, TaskExecution } from "../../schemas/tasks.js";
import type { DBClient } from "../index.js";

export class TasksInfoRepository extends BaseRepository<TaskInfo> {
  public constructor(db: DBClient) {
    super(db, "tasks_info");
  }
}

export class TaskExecutionsRepository extends BaseRepository<TaskExecution> {
  public constructor(db: DBClient) {
    super(db, "task_executions");
  }

  public async deleteByTaskId(id: string) {
    const query = `DELETE FROM ${this.tableName} WHERE task_id = ?`;
    await this.db.execute(query, [id]);
  }
}

export class TasksRepository extends BaseRepository<Task> {
  private taskExecutionsRepository;

  public constructor(
    db: DBClient,
    taskExecutionsRepository: TaskExecutionsRepository,
  ) {
    super(db, "tasks");
    this.taskExecutionsRepository = taskExecutionsRepository;
  }

  public async delete(id: string) {
    this.taskExecutionsRepository.deleteByTaskId(id);
    super.delete(id);
  }

  public async deleteByInfoId(id: string) {
    const query = `DELETE FROM ${this.tableName} WHERE info_id = ?`;
    await this.db.execute(query, [id]);
  }
}
