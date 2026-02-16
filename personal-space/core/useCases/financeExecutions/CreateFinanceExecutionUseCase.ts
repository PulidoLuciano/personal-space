import { FinanceExecutionRepository } from "@/database/repositories/FinanceExecutionRepository";
import { FinanceExecutionEntity } from "@/core/entities/FinanceExecutionEntity";
import { financeExecutionEvents, FINANCE_EXECUTION_CHANGED } from "@/utils/events/FinanceExecutionEvents";

export class CreateFinanceExecutionUseCase {
  constructor(private financeExecutionRepo: FinanceExecutionRepository) {}

  async execute(props: {
    financeId: number;
    projectId: number;
    date: string;
    amount: number;
    currencyId: number;
  }): Promise<number> {
    const execution = new FinanceExecutionEntity({
      financeId: props.financeId,
      date: props.date,
      amount: props.amount,
      currencyId: props.currencyId,
    });

    const id = await this.financeExecutionRepo.create({
      finance_id: execution.financeId!,
      project_id: props.projectId,
      date: execution.date,
      amount: execution.amount,
      currency_id: execution.currencyId,
    });

    financeExecutionEvents.emit(FINANCE_EXECUTION_CHANGED, { financeId: props.financeId, projectId: props.projectId });

    return id;
  }
}
