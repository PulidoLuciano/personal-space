import { FinanceExecutionRepository } from "@/database/repositories/FinanceExecutionRepository";
import { financeExecutionEvents, FINANCE_EXECUTION_CHANGED } from "@/utils/events/FinanceExecutionEvents";

export class DeleteFinanceExecutionUseCase {
  constructor(private financeExecutionRepo: FinanceExecutionRepository) {}

  async execute(id: number): Promise<void> {
    await this.financeExecutionRepo.delete(id);
    financeExecutionEvents.emit(FINANCE_EXECUTION_CHANGED, { executionId: id });
  }
}
