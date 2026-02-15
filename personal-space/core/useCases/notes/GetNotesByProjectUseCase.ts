import { NoteRepository } from "@/database/repositories/NoteRepository";
import { NoteEntity } from "@/core/entities/NoteEntity";
import { QueryCriteria } from "@/database/repositories/BaseRepository";

export class GetNotesByProjectUseCase {
  constructor(private noteRepo: NoteRepository) {}

  async execute(projectId: number): Promise<NoteEntity[]> {
    const criteria: QueryCriteria<any>[] = [
      { column: "project_id", operator: "=", value: projectId },
    ];
    const notes = await this.noteRepo.find(criteria);
    return notes.map((note) => NoteEntity.fromDatabase(note));
  }
}
