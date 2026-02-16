import { TaskRepository } from "@/database/repositories/TaskRepository";
import { TaskEntity } from "@/core/entities/TaskEntity";
import { taskEvents, TASK_CHANGED } from "@/utils/events/TaskEvents";

export class CreateTaskUseCase {
  constructor(private taskRepo: TaskRepository) {}

  async execute(props: {
    projectId: number;
    title: string;
    dueDate?: string;
    locationName?: string;
    completitionBy?: number;
    countGoal?: number;
  }): Promise<number> {
    const task = new TaskEntity({
      projectId: props.projectId,
      title: props.title,
      habitId: undefined,
      dueDate: props.dueDate,
      locationName: props.locationName,
      completitionBy: props.completitionBy,
      countGoal: props.countGoal,
    });

    const id = await this.taskRepo.create({
      project_id: task.projectId,
      habit_id: task.habitId,
      title: task.title,
      due_date: task.dueDate || null,
      location_name: task.locationName || null,
      location_lat: null,
      location_lon: null,
      completition_by: task.completitionBy || null,
      count_goal: task.countGoal,
    } as any);

    taskEvents.emit(TASK_CHANGED, { projectId: task.projectId, taskId: id });

    return id;
  }
}
