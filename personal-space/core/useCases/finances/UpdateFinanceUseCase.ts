import { FinanceRepository } from "@/database/repositories/FinanceRepository";
import { FinanceEntity } from "@/core/entities/FinanceEntity";
import { financeEvents, FINANCE_CHANGED } from "@/utils/events/FinanceEvents";

export class UpdateFinanceUseCase {
  constructor(private financeRepo: FinanceRepository) {}

  async execute(
    id: number,
    props: {
      title: string;
      amount: number;
      currencyId: number;
    }
  ): Promise<void> {
    const finance = new FinanceEntity({
      id,
      projectId: 0,
      title: props.title,
      amount: props.amount,
      currencyId: props.currencyId,
    });

    await this.financeRepo.update(id, {
      title: finance.title,
      amount: finance.amount,
      currency_id: finance.currencyId,
    });

    financeEvents.emit(FINANCE_CHANGED, { financeId: id });
  }
}
