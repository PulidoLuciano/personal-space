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
}
