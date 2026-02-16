import { TaskExecutionRepository } from "@/database/repositories/TaskExecutionRepository";
import { TaskExecutionEntity } from "@/core/entities/TaskExecutionEntity";

export class GetTaskExecutionsByTaskUseCase {
  constructor(private taskExecutionRepo: TaskExecutionRepository) {}

  async execute(taskId: number): Promise<TaskExecutionEntity[]> {
    const executions = await this.taskExecutionRepo.getByTask(taskId);
    return executions.map((e) => TaskExecutionEntity.fromDatabase(e));
  }
}
