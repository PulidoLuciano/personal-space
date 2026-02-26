import type { Project } from "../../schemas/project.js";
import type { DBClient } from "../index.js";
import { BaseRepository, type QueryCriteria } from "./BaseRepository.js";

export default class ProjectsRepository extends BaseRepository<Project> {
  constructor(db: DBClient) {
    super(db, "Projects");
  }

  public async searchNoArchivedProjectsPaginated(
    page: number,
    size: number,
    searchText: string | null = null,
  ) {
    const conditions: QueryCriteria<Project>[] = [
      {
        column: "is_archived",
        operator: "=",
        value: "FALSE",
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

  public async searchArchivedProjectsPaginated(
    page: number,
    size: number,
    searchText: string | null = null,
  ) {
    const conditions: QueryCriteria<Project>[] = [
      {
        column: "is_archived",
        operator: "=",
        value: "TRUE",
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

  public async archiveProject(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super.update(id, { is_archived: 1, updated_at: new Date().toISOString() } as any);
  }
}
