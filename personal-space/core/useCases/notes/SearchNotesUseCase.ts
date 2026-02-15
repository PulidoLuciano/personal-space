import { NoteRepository } from "@/database/repositories/NoteRepository";
import { NoteEntity } from "@/core/entities/NoteEntity";

export interface SearchNotesResult {
  notes: NoteEntity[];
  total: number;
}

export class SearchNotesUseCase {
  constructor(private noteRepo: NoteRepository) {}

  async execute(
    projectId: number,
    searchText: string,
    page: number,
    pageSize: number = 15
  ): Promise<SearchNotesResult> {
    const { notes, total } = await this.noteRepo.searchByProject(
      projectId,
      searchText,
      page,
      pageSize
    );

    return {
      notes: notes.map((note) => NoteEntity.fromDatabase(note)),
      total,
    };
  }
}
