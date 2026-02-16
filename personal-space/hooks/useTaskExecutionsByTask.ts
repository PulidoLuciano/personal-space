import { useState, useEffect, useCallback } from "react";
import { useDependencies } from "@/components/providers/DatabaseContext";
import { TaskExecutionEntity } from "@/core/entities/TaskExecutionEntity";
import { taskExecutionEvents, TASK_EXECUTION_CHANGED } from "@/utils/events/TaskExecutionEvents";

export const useTaskExecutionsByTask = (taskId: number) => {
  const controller = useDependencies();

  const [executions, setExecutions] = useState<TaskExecutionEntity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExecutions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await controller.getTaskExecutionsByTask.execute(taskId);
      setExecutions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [controller.getTaskExecutionsByTask, taskId]);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  useEffect(() => {
    const handleChanged = () => fetchExecutions();
    taskExecutionEvents.on(TASK_EXECUTION_CHANGED, handleChanged);
    return () => {
      taskExecutionEvents.off(TASK_EXECUTION_CHANGED, handleChanged);
    };
  }, [fetchExecutions]);

  return {
    executions,
    loading,
    refresh: fetchExecutions,
  };
};
