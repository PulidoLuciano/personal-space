import { TaskExecutionRepository } from "@/database/repositories/TaskExecutionRepository";
import { TaskExecutionEntity } from "@/core/entities/TaskExecutionEntity";
import { TaskRepository } from "@/database/repositories/TaskRepository";
import { taskExecutionEvents, TASK_EXECUTION_CHANGED } from "@/utils/events/TaskExecutionEvents";

export class CreateTaskExecutionUseCase {
  constructor(
    private taskExecutionRepo: TaskExecutionRepository,
    private taskRepo: TaskRepository
  ) {}

  async execute(data: {
    taskId: number;
    startTime?: string;
    endTime?: string;
  }): Promise<number> {
    const entity = new TaskExecutionEntity({
      taskId: data.taskId,
      startTime: data.startTime,
      endTime: data.endTime,
    });

    const id = await this.taskExecutionRepo.createExecution({
      taskId: entity.taskId!,
      startTime: entity.startTime,
      endTime: entity.endTime,
    });

    const task = await this.taskRepo.getById(data.taskId);
    if (task) {
      taskExecutionEvents.emit(TASK_EXECUTION_CHANGED, { projectId: task.project_id, taskId: data.taskId, executionId: id });
    }

    return id;
  }
}
