import { useState, useEffect, useCallback } from "react";
import { useDependencies } from "@/components/providers/DatabaseContext";
import { FinanceExecutionWithDetails } from "@/database/repositories/FinanceExecutionRepository";
import { financeExecutionEvents, FINANCE_EXECUTION_CHANGED } from "@/utils/events/FinanceExecutionEvents";

export const useFinanceExecutions = (projectId: number, page: number = 1, pageSize: number = 10) => {
  const controller = useDependencies();

  const [executions, setExecutions] = useState<FinanceExecutionWithDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchExecutions = useCallback(async () => {
    try {
      setLoading(true);
      const result = await controller.getFinanceExecutionsByProject.execute(projectId, page, pageSize);
      setExecutions(result.executions);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [controller.getFinanceExecutionsByProject, projectId, page, pageSize]);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  useEffect(() => {
    const handleChanged = () => fetchExecutions();
    financeExecutionEvents.on(FINANCE_EXECUTION_CHANGED, handleChanged);
    return () => {
      financeExecutionEvents.off(FINANCE_EXECUTION_CHANGED, handleChanged);
    };
  }, [fetchExecutions]);

  return {
    executions,
    total,
    totalPages,
    page,
    loading,
    refresh: fetchExecutions,
  };
};
