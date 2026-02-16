import { useDependencies } from "@/components/providers/DatabaseContext";
import { HabitEntity } from "@/core/entities/HabitEntity";

export const useHabits = () => {
  const controller = useDependencies();

  const createHabit = async (data: {
    projectId: number;
    isStrict?: boolean;
    title: string;
    dueMinutes?: number;
    locationName?: string;
    locationLat?: number;
    locationLon?: number;
    completitionBy?: number;
    countGoal?: number;
    beginAt?: string;
    recurrenceRule?: string;
  }): Promise<number> => {
    return await controller.createHabit.execute(data);
  };

  const updateHabit = async (
    id: number,
    data: {
      isStrict?: boolean;
      title?: string;
      dueMinutes?: number;
      locationName?: string;
      locationLat?: number;
      locationLon?: number;
      completitionBy?: number;
      countGoal?: number;
      beginAt?: string;
      recurrenceRule?: string;
    }
  ): Promise<void> => {
    return await controller.updateHabit.execute(id, data);
  };

  const deleteHabit = async (id: number): Promise<void> => {
    return await controller.deleteHabit.execute(id);
  };

  const getHabitById = async (id: number): Promise<HabitEntity | null> => {
    return await controller.getHabitById.execute(id);
  };

  const getHabitsByProject = async (projectId: number): Promise<HabitEntity[]> => {
    return await controller.getHabitsByProject.execute(projectId);
  };

  return {
    createHabit,
    updateHabit,
    deleteHabit,
    getHabitById,
    getHabitsByProject,
  };
};
