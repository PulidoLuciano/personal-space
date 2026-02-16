import { TaskRepository } from "@/database/repositories/TaskRepository";
import { taskEvents, TASK_CHANGED } from "@/utils/events/TaskEvents";

export class UpdateTaskUseCase {
  constructor(private taskRepo: TaskRepository) {}

  async execute(
    id: number,
    props: {
      title: string;
      dueDate?: string;
      locationName?: string;
      completitionBy?: number;
      countGoal?: number;
    }
  ): Promise<void> {
    await this.taskRepo.update(id, {
      title: props.title,
      due_date: props.dueDate || null,
      location_name: props.locationName || null,
      completition_by: props.completitionBy || null,
      count_goal: props.countGoal,
    });

    const task = await this.taskRepo.getById(id);
    if (task) {
      taskEvents.emit(TASK_CHANGED, { projectId: task.project_id, taskId: id });
    }
  }
}
