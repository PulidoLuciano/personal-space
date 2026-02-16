import { FinanceRepository } from "@/database/repositories/FinanceRepository";
import { FinanceEntity } from "@/core/entities/FinanceEntity";

export class GetFinancesByProjectUseCase {
  constructor(private financeRepo: FinanceRepository) {}

  async execute(projectId: number): Promise<FinanceEntity[]> {
    const finances = await this.financeRepo.getByProject(projectId);
    return finances.map((f) => FinanceEntity.fromDatabase(f));
  }

  async executeIndependent(projectId: number): Promise<FinanceEntity[]> {
    const finances = await this.financeRepo.getByProject(projectId);
    const independent = finances.filter(
      (f) => !f.task_id && !f.event_id && !f.habit_id
    );
    return independent.map((f) => FinanceEntity.fromDatabase(f));
  }
}
