import type { List } from "../../schemas/lists.js";
import type { DBClient } from "../index.js";
import { BaseRepository, type QueryCriteria } from "./BaseRepository.js";

export default class ListsRepository extends BaseRepository<List> {
  constructor(db: DBClient) {
    super(db, "lists");
  }

  public async searchNoArchivedPaginated(
    page: number,
    size: number,
    searchText: string | null = null,
  ) {
    const conditions: QueryCriteria<List>[] = [
      {
        column: "is_archived",
        operator: "=",
        value: 0,
      },
    ];
    if (searchText && searchText != "") {
      conditions.push({
        column: "name",
        operator: "LIKE",
        value: `%${searchText}%`,
      });
    }
    return await super.paginate(page, size, conditions, [
      "name",
      "color_id",
      "icon_id",
      "id",
    ]);
  }

  public async searchArchivedPaginated(
    page: number,
    size: number,
    searchText: string | null = null,
  ) {
    const conditions: QueryCriteria<List>[] = [
      {
        column: "is_archived",
        operator: "=",
        value: 1,
      },
    ];
    if (searchText && searchText != "") {
      conditions.push({
        column: "name",
        operator: "LIKE",
        value: `%${searchText}%`,
      });
    }
    return await super.paginate(page, size, conditions, [
      "name",
      "color_id",
      "icon_id",
      "id",
    ]);
  }

  public async archive(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super.update(id, {
      is_archived: 1,
      updated_at: new Date().toISOString(),
    } as any);
  }

  public async unarchive(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super.update(id, {
      is_archived: 0,
      updated_at: new Date().toISOString(),
    } as any);
  }

  public async findColor(rgb: string): Promise<boolean> {
    const result = await this.db.queryOne<{ cnt: number }>(
      "SELECT 1 as cnt FROM colors WHERE rgb = ? AND is_deleted = 0",
      [rgb],
    );
    return !!result;
  }

  public async findIcon(name: string): Promise<boolean> {
    const result = await this.db.queryOne<{ cnt: number }>(
      "SELECT 1 as cnt FROM icons WHERE name = ? AND is_deleted = 0",
      [name],
    );
    return !!result;
  }

  public async getAllColors(): Promise<string[]> {
    const result = await this.db.query<{ rgb: string }>(
      "SELECT rgb FROM colors WHERE is_deleted = 0 ORDER BY rgb",
    );
    return result.map((r) => r.rgb);
  }

  public async getAllIcons(): Promise<string[]> {
    const result = await this.db.query<{ name: string }>(
      "SELECT name FROM icons WHERE is_deleted = 0 ORDER BY name",
    );
    return result.map((r) => r.name);
  }
}
