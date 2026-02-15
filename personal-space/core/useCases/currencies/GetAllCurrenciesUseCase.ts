import { CurrencyRepository } from "@/database/repositories/CurrencyRepository";
import { CurrencyEntity } from "@/core/entities/CurrencyEntity";

export class GetAllCurrenciesUseCase {
  constructor(private currencyRepo: CurrencyRepository) {}

  async execute(): Promise<CurrencyEntity[]> {
    const currencies = await this.currencyRepo.getAll();
    return currencies.map((c) => CurrencyEntity.fromDatabase(c));
  }
}
