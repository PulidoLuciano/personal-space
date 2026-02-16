import { useState, useEffect, useCallback } from "react";
import { useDependencies } from "@/components/providers/DatabaseContext";
import { TaskEntity } from "@/core/entities/TaskEntity";
import { taskEvents, TASK_CHANGED } from "@/utils/events/TaskEvents";

export const useProjectTasks = (projectId: number) => {
  const controller = useDependencies();

  const [tasks, setTasks] = useState<TaskEntity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await controller.getTasksByProject.execute(projectId);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [controller.getTasksByProject, projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const handleChanged = () => fetchTasks();
    taskEvents.on(TASK_CHANGED, handleChanged);
    return () => {
      taskEvents.off(TASK_CHANGED, handleChanged);
    };
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    refresh: fetchTasks,
  };
};
