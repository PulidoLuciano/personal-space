import type {
  TaskExecutionsRepository,
  TaskExceptionsRepository,
  TasksRepository,
} from "../database/repositories/TasksRepository.js";
import type { InsertTask, Task } from "../schemas/tasks.js";
import BaseService from "./BaseService.js";

type deleteMethods = "all" | "following" | "current";

export default class TasksService extends BaseService<
  Task,
  InsertTask,
  TasksRepository
> {
  public constructor(tasksRepository: TasksRepository) {
    super(tasksRepository);
  }
}
