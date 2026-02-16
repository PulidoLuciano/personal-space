import { TaskRepository } from "@/database/repositories/TaskRepository";
import { taskEvents, TASK_CHANGED } from "@/utils/events/TaskEvents";

export class DeleteTaskUseCase {
  constructor(private taskRepo: TaskRepository) {}

  async execute(id: number): Promise<void> {
    const task = await this.taskRepo.getById(id);
    await this.taskRepo.delete(id);
    if (task) {
      taskEvents.emit(TASK_CHANGED, { projectId: task.project_id, taskId: id });
    }
  }
}
