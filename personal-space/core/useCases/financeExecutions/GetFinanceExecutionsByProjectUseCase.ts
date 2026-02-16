import { FinanceExecutionRepository, FinanceExecutionWithDetails } from "@/database/repositories/FinanceExecutionRepository";

export interface PaginatedExecutions {
  executions: FinanceExecutionWithDetails[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class GetFinanceExecutionsByProjectUseCase {
  constructor(private financeExecutionRepo: FinanceExecutionRepository) {}

  async execute(projectId: number, page: number = 1, pageSize: number = 10): Promise<PaginatedExecutions> {
    const [executions, total] = await Promise.all([
      this.financeExecutionRepo.getByProjectPaginated(projectId, page, pageSize),
      this.financeExecutionRepo.getCountByProject(projectId),
    ]);

    return {
      executions,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
