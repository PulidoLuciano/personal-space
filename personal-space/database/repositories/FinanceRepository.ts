import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./BaseRepository";

export interface Finance {
  id: number;
  project_id: number;
  task_id?: number;
  event_id?: number;
  is_income: boolean;
  amount: number;
  date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export class FinanceRepository extends BaseRepository<Finance> {
  constructor(db: SQLiteDatabase) {
    super(db, "finances");
  }
}
