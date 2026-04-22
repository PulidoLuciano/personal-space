import { BaseRepository, type QueryCriteria } from "./BaseRepository.js";
import type { Section } from "../../schemas/sections.js";
import type { DBClient } from "../index.js";

export default class SectionsRepository extends BaseRepository<Section> {
  constructor(db: DBClient) {
    super(db, "sections");
  }

  public async findByListId(listId: string) {
    const criteria: QueryCriteria<Section>[] = [
      {
        column: "list_id",
        operator: "=",
        value: listId,
      },
    ];
    return await this.find(criteria, ["id", "name", "list_id", "updated_at"]);
  }

  public async countByListId(listId: string): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE list_id = ? AND is_deleted = FALSE`;
    const result = await this.db.queryOne<{ count: number }>(query, [listId]);
    return result?.count ?? 0;
  }

  public async findListById(listId: string): Promise<boolean> {
    const result = await this.db.queryOne<{ id: string }>(
      "SELECT id FROM lists WHERE id = ? AND is_deleted = 0",
      [listId],
    );
    return !!result;
  }
}
