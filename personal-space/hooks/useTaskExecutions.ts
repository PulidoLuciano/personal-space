import { useDependencies } from "@/components/providers/DatabaseContext";
import { TaskExecutionEntity } from "@/core/entities/TaskExecutionEntity";
import { TaskProgress } from "@/core/useCases/taskExecutions/GetTaskProgressUseCase";

export const useTaskExecutions = () => {
  const controller = useDependencies();

  const createExecution = async (data: {
    taskId: number;
    startTime?: string;
    endTime?: string;
  }): Promise<number> => {
    return await controller.createTaskExecution.execute(data);
  };

  const getExecutionsByTask = async (taskId: number): Promise<TaskExecutionEntity[]> => {
    return await controller.getTaskExecutionsByTask.execute(taskId);
  };

  const deleteExecution = async (id: number): Promise<void> => {
    return await controller.deleteTaskExecution.execute(id);
  };

  const getTaskProgress = async (
    taskId: number,
    completitionBy: number,
    countGoal: number
  ): Promise<TaskProgress> => {
    return await controller.getTaskProgress.execute(taskId, completitionBy, countGoal);
  };

  const startExecution = async (taskId: number): Promise<number> => {
    return await controller.createTaskExecution.execute({
      taskId,
      startTime: new Date().toISOString(),
    });
  };

  const stopExecution = async (executionId: number): Promise<void> => {
    await controller.updateTaskExecution.execute(executionId, {
      endTime: new Date().toISOString(),
    });
  };

  const getActiveExecution = async (taskId: number): Promise<TaskExecutionEntity | null> => {
    const executions = await controller.getTaskExecutionsByTask.execute(taskId);
    return executions.find(e => !e.endTime) || null;
  };

  return {
    createExecution,
    getExecutionsByTask,
    deleteExecution,
    getTaskProgress,
    startExecution,
    stopExecution,
    getActiveExecution,
  };
};
