import type {
  TaskExecutionsRepository,
  TasksInfoRepository,
  TasksRepository,
} from "../database/repositories/TasksRepository.js";
import type { InsertTask, InsertTaskInfo, TaskInfo } from "../schemas/tasks.js";
import BaseService from "./BaseService.js";

type deleteMethods = "all" | "following" | "current";

export default class TasksService extends BaseService<
  TaskInfo,
  InsertTaskInfo,
  TasksInfoRepository
> {
  private _tasksRepository;
  private _taskExecutionsRepository;

  public constructor(
    taskInfoRepository: TasksInfoRepository,
    tasksRepository: TasksRepository,
    tasksExecutionRepository: TaskExecutionsRepository,
  ) {
    super(taskInfoRepository);
    this._taskExecutionsRepository = tasksExecutionRepository;
    this._tasksRepository = tasksRepository;
  }

  public async create(data: InsertTaskInfo) {
    const taskInfoId = await this.repository.create(data);
    if (!data.begin_date || data.begin_date <= new Date()) {
      const taskData: InsertTask = {
        due_date: new Date(),
        info_id: taskInfoId,
        is_skipped: false,
      };
      this._tasksRepository.create(taskData);
    }
    return taskInfoId;
  }

  public async delete(
    task_id: string,
    deleteMethod: deleteMethods = "current",
  ): Promise<void> {
    const task = await this._tasksRepository.getById(task_id, ["info_id"]);
    if (task && task.info_id) {
      const taskInfo = await this.repository.getById(task.info_id);
      if (taskInfo?.recurrency && deleteMethod != "current") {
        if ((deleteMethod = "all")) {
          this._tasksRepository.deleteByInfoId(taskInfo.id);
        }
        this.repository.delete(taskInfo.id);
      }
    }
    this._tasksRepository.delete(task_id);
  }
}
