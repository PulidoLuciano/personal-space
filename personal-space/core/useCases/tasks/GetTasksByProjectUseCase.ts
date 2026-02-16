import { TaskRepository } from "@/database/repositories/TaskRepository";
import { TaskEntity } from "@/core/entities/TaskEntity";

export class GetTasksByProjectUseCase {
  constructor(private taskRepo: TaskRepository) {}

  async execute(projectId: number): Promise<TaskEntity[]> {
    const tasks = await this.taskRepo.getByProject(projectId);
    return tasks.map((t) => TaskEntity.fromDatabase(t));
  }
}
