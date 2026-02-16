import { useState, useEffect, useCallback } from "react";
import { useDependencies } from "@/components/providers/DatabaseContext";
import { FinanceEntity } from "@/core/entities/FinanceEntity";
import { financeEvents, FINANCE_CHANGED } from "@/utils/events/FinanceEvents";

export const useProjectFinances = (projectId: number) => {
  const controller = useDependencies();

  const [finances, setFinances] = useState<FinanceEntity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFinances = useCallback(async () => {
    try {
      setLoading(true);
      const data = await controller.getFinancesByProject.executeIndependent(projectId);
      setFinances(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [controller.getFinancesByProject, projectId]);

  useEffect(() => {
    fetchFinances();
  }, [fetchFinances]);

  useEffect(() => {
    const handleChanged = () => fetchFinances();
    financeEvents.on(FINANCE_CHANGED, handleChanged);
    return () => {
      financeEvents.off(FINANCE_CHANGED, handleChanged);
    };
  }, [fetchFinances]);

  return {
    finances,
    loading,
    refresh: fetchFinances,
  };
};
