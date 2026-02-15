import { useDependencies } from "@/components/providers/DatabaseContext";
import { FinanceEntity } from "@/core/entities/FinanceEntity";

export const useFinances = () => {
  const controller = useDependencies();

  const createFinance = async (data: {
    projectId: number;
    title: string;
    amount: number;
    currencyId: number;
    taskId?: number;
    eventId?: number;
    habitId?: number;
  }): Promise<number> => {
    return await controller.createFinance.execute(data);
  };

  const updateFinance = async (
    id: number,
    data: { title: string; amount: number; currencyId: number }
  ): Promise<void> => {
    return await controller.updateFinance.execute(id, data);
  };

  const deleteFinance = async (id: number): Promise<void> => {
    return await controller.deleteFinance.execute(id);
  };

  const getFinanceById = async (id: number): Promise<FinanceEntity | null> => {
    return await controller.getFinanceById.execute(id);
  };

  return {
    createFinance,
    updateFinance,
    deleteFinance,
    getFinanceById,
  };
};
