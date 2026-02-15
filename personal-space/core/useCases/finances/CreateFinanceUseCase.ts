import { FinanceRepository } from "@/database/repositories/FinanceRepository";
import { FinanceEntity } from "@/core/entities/FinanceEntity";
import { financeEvents, FINANCE_CHANGED } from "@/utils/events/FinanceEvents";

export class CreateFinanceUseCase {
  constructor(private financeRepo: FinanceRepository) {}

  async execute(props: {
    projectId: number;
    title: string;
    amount: number;
    currencyId: number;
    taskId?: number;
    eventId?: number;
    habitId?: number;
  }): Promise<number> {
    const finance = new FinanceEntity({
      projectId: props.projectId,
      title: props.title,
      amount: props.amount,
      currencyId: props.currencyId,
      taskId: props.taskId,
      eventId: props.eventId,
      habitId: props.habitId,
    });

    const id = await this.financeRepo.create({
      project_id: finance.projectId,
      title: finance.title,
      amount: finance.amount,
      currency_id: finance.currencyId,
      task_id: finance.taskId,
      event_id: finance.eventId,
      habit_id: finance.habitId,
    });

    financeEvents.emit(FINANCE_CHANGED, { projectId: finance.projectId, financeId: id });

    return id;
  }
}
