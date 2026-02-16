import { TaskRepository } from "@/database/repositories/TaskRepository";
import { TaskEntity } from "@/core/entities/TaskEntity";

export class GetTaskByIdUseCase {
  constructor(private taskRepo: TaskRepository) {}

  async execute(id: number): Promise<TaskEntity | null> {
    const task = await this.taskRepo.getById(id);
    if (!task) return null;
    return TaskEntity.fromDatabase(task);
  }
}
