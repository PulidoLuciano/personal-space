import { FinanceRepository } from "@/database/repositories/FinanceRepository";
import { financeEvents, FINANCE_CHANGED } from "@/utils/events/FinanceEvents";

export class DeleteFinanceUseCase {
  constructor(private financeRepo: FinanceRepository) {}

  async execute(id: number): Promise<void> {
    await this.financeRepo.delete(id);
    financeEvents.emit(FINANCE_CHANGED, { financeId: id });
  }
}
