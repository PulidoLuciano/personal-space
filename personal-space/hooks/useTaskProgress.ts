import { useState, useEffect, useCallback } from "react";
import { useDependencies } from "@/components/providers/DatabaseContext";
import { taskExecutionEvents, TASK_EXECUTION_CHANGED } from "@/utils/events/TaskExecutionEvents";

interface TaskProgress {
  progress: number;
  goal: number;
  isComplete: boolean;
  completitionBy: number;
}

export const useTaskProgress = (taskId: number, completitionBy: number | undefined, countGoal: number | undefined) => {
  const controller = useDependencies();

  const [progress, setProgress] = useState<TaskProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!completitionBy || !countGoal) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await controller.getTaskProgress.execute(taskId, completitionBy, countGoal);
      setProgress({
        progress: completitionBy === 1 ? data.completedCount : data.totalMinutes,
        goal: data.goal,
        isComplete: data.isComplete,
        completitionBy: data.completitionBy,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [controller.getTaskProgress, taskId, completitionBy, countGoal]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    const handleChanged = () => fetchProgress();
    taskExecutionEvents.on(TASK_EXECUTION_CHANGED, handleChanged);
    return () => {
      taskExecutionEvents.off(TASK_EXECUTION_CHANGED, handleChanged);
    };
  }, [fetchProgress]);

  return {
    progress,
    loading,
    refresh: fetchProgress,
  };
};
