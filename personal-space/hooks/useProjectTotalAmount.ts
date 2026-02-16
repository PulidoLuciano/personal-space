import { useState, useEffect, useCallback } from "react";
import { useDependencies } from "@/components/providers/DatabaseContext";

export const useProjectTotalAmount = (projectId: number, currencyId?: number) => {
  const controller = useDependencies();

  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTotal = useCallback(async () => {
    try {
      setLoading(true);
      const amount = await controller.getProjectTotalAmount.execute(projectId, currencyId);
      setTotal(amount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [controller.getProjectTotalAmount, projectId, currencyId]);

  useEffect(() => {
    fetchTotal();
  }, [fetchTotal]);

  return {
    total,
    loading,
    refresh: fetchTotal,
  };
};
