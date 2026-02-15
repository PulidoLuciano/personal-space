import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./BaseRepository";

export interface Currency {
  id: number;
  name: string;
  symbol: string;
  created_at: string;
  updated_at: string;
}

export class CurrencyRepository extends BaseRepository<Currency> {
  constructor(db: SQLiteDatabase) {
    super(db, "currencies");
  }

  async getAll(): Promise<Currency[]> {
    return await this.db.getAllAsync<Currency>(
      "SELECT * FROM currencies ORDER BY name ASC;"
    );
  }

  async getById(id: number): Promise<Currency | null> {
    return await this.db.getFirstAsync<Currency>(
      "SELECT * FROM currencies WHERE id = ?;",
      [id]
    );
  }
}
