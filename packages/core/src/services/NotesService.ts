import type NotesRepository from "../database/repositories/NotesRepository.js";
import type { InsertNote, Note } from "../schemas/note.js";
import BaseService from "./BaseService.js";

export default class NotesService extends BaseService<
  Note,
  InsertNote,
  NotesRepository
> {
  constructor(repository: NotesRepository) {
    super(repository);
  }

  public async searchNotes(
    projectId: string,
    page: number,
    size: number,
    searchText: string | null = null,
  ) {
    const notes = await this.repository.searchNotesPaginated(
      page,
      size,
      searchText,
      projectId,
    );

    return notes.map((note) => ({
      ...note,
      content: note.content ? note.content.slice(0, 100) : null,
    }));
  }

  public async getNoteById(id: string) {
    return await this.repository.getNoteById(id);
  }
}
