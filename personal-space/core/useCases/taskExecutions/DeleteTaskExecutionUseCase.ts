import { TaskExecutionRepository } from "@/database/repositories/TaskExecutionRepository";
import { TaskRepository } from "@/database/repositories/TaskRepository";
import { taskExecutionEvents, TASK_EXECUTION_CHANGED } from "@/utils/events/TaskExecutionEvents";

export class DeleteTaskExecutionUseCase {
  constructor(
    private taskExecutionRepo: TaskExecutionRepository,
    private taskRepo: TaskRepository
  ) {}

  async execute(id: number): Promise<void> {
    const execution = await this.taskExecutionRepo.getById(id);
    await this.taskExecutionRepo.deleteExecution(id);
    
    if (execution) {
      const task = await this.taskRepo.getById(execution.task_id);
      if (task) {
        taskExecutionEvents.emit(TASK_EXECUTION_CHANGED, { projectId: task.project_id, taskId: execution.task_id, executionId: id });
      }
    }
  }
}
