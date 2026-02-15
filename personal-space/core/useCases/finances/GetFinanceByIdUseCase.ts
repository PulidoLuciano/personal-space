import { FinanceRepository } from "@/database/repositories/FinanceRepository";
import { FinanceEntity } from "@/core/entities/FinanceEntity";

export class GetFinanceByIdUseCase {
  constructor(private financeRepo: FinanceRepository) {}

  async execute(id: number): Promise<FinanceEntity | null> {
    const finance = await this.financeRepo.getById(id);
    if (!finance) return null;
    return FinanceEntity.fromDatabase(finance);
  }
}
