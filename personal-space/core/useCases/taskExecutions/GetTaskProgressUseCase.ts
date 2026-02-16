import { TaskExecutionRepository } from "@/database/repositories/TaskExecutionRepository";

export interface TaskProgress {
  completedCount: number;
  totalMinutes: number;
  goal: number;
  isComplete: boolean;
  completitionBy: number;
}

export class GetTaskProgressUseCase {
  constructor(private taskExecutionRepo: TaskExecutionRepository) {}

  async execute(taskId: number, completitionBy: number, countGoal: number): Promise<TaskProgress> {
    let completedCount = 0;
    let totalMinutes = 0;

    if (completitionBy === 1) {
      completedCount = await this.taskExecutionRepo.countCompletedByTask(taskId);
    } else if (completitionBy === 2) {
      totalMinutes = await this.taskExecutionRepo.sumMinutesByTask(taskId);
    }

    const isComplete = completitionBy === 1 
      ? completedCount >= countGoal 
      : totalMinutes >= countGoal;

    return {
      completedCount,
      totalMinutes,
      goal: countGoal,
      isComplete,
      completitionBy,
    };
  }
}
