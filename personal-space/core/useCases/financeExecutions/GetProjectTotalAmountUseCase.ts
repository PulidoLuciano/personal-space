import { FinanceExecutionRepository } from "@/database/repositories/FinanceExecutionRepository";

export class GetProjectTotalAmountUseCase {
  constructor(private financeExecutionRepo: FinanceExecutionRepository) {}

  async execute(projectId: number, currencyId?: number): Promise<number> {
    return await this.financeExecutionRepo.getSumByProject(projectId, currencyId);
  }
}
