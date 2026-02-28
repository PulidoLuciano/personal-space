import type {
  Finance,
  InsertFinance,
  FinanceSummary,
  FinanceDetail,
  FinanceExecutionByProject,
  FinanceExecutionByFinance,
} from "../../schemas/finances.js";
import type { DBClient } from "../index.js";
import { BaseRepository, type QueryCriteria } from "./BaseRepository.js";
import { v4 as uuidv4 } from "uuid";

export default class FinancesRepository extends BaseRepository<Finance> {
  constructor(db: DBClient) {
    super(db, "finances");
  }

  public async searchFinancesByProjectPaginated(
    page: number,
    size: number,
    projectId: string,
    isFavorite?: number,
  ) {
    const criteria: QueryCriteria<Finance>[] = [
      { column: "project_id", operator: "=", value: projectId },
    ];
    if (isFavorite !== undefined) {
      criteria.push({ column: "is_favorite", operator: "=", value: isFavorite });
    }
    const results = await this.paginate(page, size, criteria, [
      "id",
      "title",
      "amount",
    ]);
    return results.map(({ id, title, amount }) => ({ id, title, amount })) as FinanceSummary[];
  }

  public async getSumExecutionsByProjectAndCurrency(
    projectId: string,
    currencyId: string,
  ) {
    const query = `
      SELECT SUM(fe.amount) as total
      FROM finance_executions fe
      JOIN finances f ON fe.finance_id = f.id
      WHERE f.project_id = ? AND fe.currency_id = ? AND f.is_deleted = 0 AND fe.is_deleted = 0
    `;
    const result = await this.db.queryOne<{ total: number | null }>(query, [
      projectId,
      currencyId,
    ]);
    return result?.total ?? 0;
  }

  public async getExecutionsByProjectPaginated(
    page: number,
    size: number,
    projectId: string,
  ) {
    const offset = (page - 1) * size;
    const query = `
      SELECT fe.id, fe.amount, fe.date, f.title as finance_title, c.name as currency_name, c.symbol as currency_symbol
      FROM finance_executions fe
      JOIN finances f ON fe.finance_id = f.id
      JOIN currencies c ON fe.currency_id = c.name
      WHERE f.project_id = ? AND f.is_deleted = 0 AND fe.is_deleted = 0
      ORDER BY fe.date DESC
      LIMIT ? OFFSET ?
    `;
    const results = await this.db.query(query, [projectId, size, offset]) as {
      id: string;
      amount: number;
      date: string;
      finance_title: string;
      currency_name: string;
      currency_symbol: string;
    }[];

    return results.map(
      (row) => ({
        id: row.id,
        amount: row.amount,
        date: new Date(row.date),
        finance_title: row.finance_title,
        currency: {
          name: row.currency_name,
          symbol: row.currency_symbol,
        },
      }),
    ) as FinanceExecutionByProject[];
  }

  public async createFinance(data: InsertFinance): Promise<string> {
    return await super.create(data);
  }

  public async toggleFavorite(id: string, isFavorite: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await super.update(id, { is_favorite: isFavorite ? 1 : 0 } as any);
  }

  public async getFinanceById(id: string) {
    const query = `
      SELECT f.id, f.title, f.description, f.amount, c.name as currency_name, c.symbol as currency_symbol
      FROM finances f
      JOIN currencies c ON f.currency_id = c.name
      WHERE f.id = ? AND f.is_deleted = 0
    `;
    const result = await this.db.queryOne(query, [id]) as {
      id: string;
      title: string;
      description: string | null;
      amount: number;
      currency_name: string;
      currency_symbol: string;
    } | undefined;

    if (!result) return null;

    return {
      id: result.id,
      title: result.title,
      description: result.description,
      amount: result.amount,
      currency: {
        name: result.currency_name,
        symbol: result.currency_symbol,
      },
    } as FinanceDetail;
  }

  public async getExecutionsByFinancePaginated(
    page: number,
    size: number,
    financeId: string,
  ) {
    const offset = (page - 1) * size;
    const query = `
      SELECT fe.id, fe.amount, fe.date, c.name as currency_name, c.symbol as currency_symbol
      FROM finance_executions fe
      JOIN currencies c ON fe.currency_id = c.name
      WHERE fe.finance_id = ? AND fe.is_deleted = 0
      ORDER BY fe.date DESC
      LIMIT ? OFFSET ?
    `;
    const results = await this.db.query(query, [financeId, size, offset]) as {
      id: string;
      amount: number;
      date: string;
      currency_name: string;
      currency_symbol: string;
    }[];

    return results.map(
      (row) => ({
        id: row.id,
        amount: row.amount,
        date: new Date(row.date),
        currency: {
          name: row.currency_name,
          symbol: row.currency_symbol,
        },
      }),
    ) as FinanceExecutionByFinance[];
  }

  public async createExecutionByFinanceId(
    financeId: string,
    amount: number | null,
    currencyId: string | null,
  ) {
    const finance = await this.getFinanceById(financeId);
    if (!finance) throw new Error("Finance not found");

    const executionAmount = amount ?? finance.amount;
    const executionCurrency = currencyId ?? finance.currency.name;

    await this.db.execute(
      `INSERT INTO finance_executions (id, amount, date, finance_id, currency_id, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        executionAmount,
        new Date().toISOString(),
        financeId,
        executionCurrency,
        new Date().toISOString(),
      ],
    );
  }
}
