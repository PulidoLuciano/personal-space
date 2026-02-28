import type FinancesRepository from "../database/repositories/FinancesRepository.js";
import type { InsertFinance, Finance } from "../schemas/finances.js";
import BaseService from "./BaseService.js";

export default class FinancesService extends BaseService<
  Finance,
  InsertFinance,
  FinancesRepository
> {
  constructor(repository: FinancesRepository) {
    super(repository);
  }

  public async getFinancesByProjectPaginated(
    projectId: string,
    page: number,
    size: number,
    isFavorite: number = 1,
  ) {
    return await this.repository.searchFinancesByProjectPaginated(
      page,
      size,
      projectId,
      isFavorite,
    );
  }

  public async getSumExecutions(projectId: string, currencyId: string) {
    return await this.repository.getSumExecutionsByProjectAndCurrency(
      projectId,
      currencyId,
    );
  }

  public async getExecutionsByProject(
    projectId: string,
    page: number,
    size: number,
  ) {
    return await this.repository.getExecutionsByProjectPaginated(
      page,
      size,
      projectId,
    );
  }

  public async createFinance(
    data: InsertFinance,
    withExecution: boolean = false,
  ) {
    const financeId = await this.repository.createFinance(data);
    if (withExecution) {
      await this.repository.createExecutionByFinanceId(financeId, null, null);
    }
    return financeId;
  }

  public async makeFavorite(id: string) {
    return await this.repository.toggleFavorite(id, true);
  }

  public async unmakeFavorite(id: string) {
    return await this.repository.toggleFavorite(id, false);
  }

  public async getFinanceById(id: string) {
    return await this.repository.getFinanceById(id);
  }

  public async getExecutionsByFinance(
    financeId: string,
    page: number,
    size: number,
  ) {
    return await this.repository.getExecutionsByFinancePaginated(
      page,
      size,
      financeId,
    );
  }

  public async createExecution(
    financeId: string,
    amount: number | null = null,
    currencyId: string | null = null,
  ) {
    return await this.repository.createExecutionByFinanceId(
      financeId,
      amount,
      currencyId,
    );
  }
}
