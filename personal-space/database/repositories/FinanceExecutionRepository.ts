import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./BaseRepository";

export interface FinanceExecution {
  id: number;
  finance_id: number;
  project_id: number;
  date: string;
  amount: number;
  currency_id: number;
  created_at: string;
  updated_at: string;
}

export interface FinanceExecutionWithDetails extends FinanceExecution {
  task_title?: string;
  finance_title: string;
}

export class FinanceExecutionRepository extends BaseRepository<FinanceExecution> {
  constructor(db: SQLiteDatabase) {
    super(db, "finance_executions");
  }

  async getByProject(projectId: number): Promise<FinanceExecutionWithDetails[]> {
    return await this.db.getAllAsync<FinanceExecutionWithDetails>(
      `SELECT fe.*, t.title as task_title, f.title as finance_title
       FROM finance_executions fe
       LEFT JOIN finances f ON fe.finance_id = f.id
       LEFT JOIN tasks t ON f.task_id = t.id
       WHERE fe.project_id = ?
       ORDER BY fe.date DESC;`,
      [projectId]
    );
  }

  async getByProjectPaginated(
    projectId: number,
    page: number,
    pageSize: number
  ): Promise<FinanceExecutionWithDetails[]> {
    const offset = (page - 1) * pageSize;
    return await this.db.getAllAsync<FinanceExecutionWithDetails>(
      `SELECT fe.*, t.title as task_title, f.title as finance_title
       FROM finance_executions fe
       LEFT JOIN finances f ON fe.finance_id = f.id
       LEFT JOIN tasks t ON f.task_id = t.id
       WHERE fe.project_id = ?
       ORDER BY fe.date DESC
       LIMIT ? OFFSET ?;`,
      [projectId, pageSize, offset]
    );
  }

  async getCountByProject(projectId: number): Promise<number> {
    const result = await this.db.getFirstAsync<{ total: number }>(
      `SELECT COUNT(*) as total FROM finance_executions WHERE project_id = ?;`,
      [projectId]
    );
    return result?.total || 0;
  }

  async getSumByProject(projectId: number, currencyId?: number): Promise<number> {
    let query = "SELECT COALESCE(SUM(amount), 0) as total FROM finance_executions WHERE project_id = ?";
    const params: number[] = [projectId];
    
    if (currencyId !== undefined) {
      query += " AND currency_id = ?";
      params.push(currencyId);
    }
    
    const result = await this.db.getFirstAsync<{ total: number }>(query, params);
    return result?.total || 0;
  }

  async getByFinance(financeId: number): Promise<FinanceExecution[]> {
    return await this.db.getAllAsync<FinanceExecution>(
      "SELECT * FROM finance_executions WHERE finance_id = ? ORDER BY date DESC;",
      [financeId]
    );
  }
}
