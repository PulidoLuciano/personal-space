import type { Note } from "../../schemas/note.js";
import type { DBClient } from "../index.js";
import { BaseRepository, type QueryCriteria } from "./BaseRepository.js";

export default class NotesRepository extends BaseRepository<Note> {
  constructor(db: DBClient) {
    super(db, "Notes");
  }

  public async searchNotesPaginated(
    page: number,
    size: number,
    searchText: string | null = null,
    projectId: string,
  ) {
    const offset = (page - 1) * size;

    if (searchText && searchText !== "") {
      const query = `
        SELECT id, title, content, project_id, updated_at 
        FROM Notes 
        WHERE project_id = ? AND is_deleted = FALSE AND (title LIKE ? OR content LIKE ?)
        LIMIT ? OFFSET ?
      `;
      return await this.db.query<Note>(query, [
        projectId,
        `%${searchText}%`,
        `%${searchText}%`,
        size,
        offset,
      ]);
    }

    const conditions: QueryCriteria<Note>[] = [
      {
        column: "project_id",
        operator: "=",
        value: projectId,
      },
    ];

    return await this.paginate(page, size, conditions, [
      "id",
      "title",
      "content",
      "project_id",
      "updated_at",
    ]);
  }

  public async getNoteById(id: string) {
    return await super.getById(id, [
      "id",
      "title",
      "content",
      "project_id",
      "updated_at",
    ]);
  }
}
