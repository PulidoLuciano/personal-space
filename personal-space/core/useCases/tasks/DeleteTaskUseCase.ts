import { TaskRepository } from "@/database/repositories/TaskRepository";

export class DeleteTaskUseCase {
  constructor(private taskRepo: TaskRepository) {}

  async execute(id: number): Promise<void> {
    await this.taskRepo.delete(id);
  }
}
