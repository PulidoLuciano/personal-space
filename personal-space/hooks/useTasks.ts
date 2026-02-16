import { useDependencies } from "@/components/providers/DatabaseContext";
import { TaskEntity } from "@/core/entities/TaskEntity";

export const useTasks = () => {
  const controller = useDependencies();

  const createTask = async (data: {
    projectId: number;
    title: string;
    dueDate?: string;
    locationName?: string;
    completitionBy?: number;
    countGoal?: number;
  }): Promise<number> => {
    return await controller.createTask.execute(data);
  };

  const updateTask = async (
    id: number,
    data: {
      title: string;
      dueDate?: string;
      locationName?: string;
      completitionBy?: number;
      countGoal?: number;
    }
  ): Promise<void> => {
    return await controller.updateTask.execute(id, data);
  };

  const deleteTask = async (id: number): Promise<void> => {
    return await controller.deleteTask.execute(id);
  };

  const getTaskById = async (id: number): Promise<TaskEntity | null> => {
    return await controller.getTaskById.execute(id);
  };

  return {
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
  };
};
