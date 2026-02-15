import { NoteRepository } from "@/database/repositories/NoteRepository";
import { NoteEntity } from "@/core/entities/NoteEntity";

export class GetNoteByIdUseCase {
  constructor(private noteRepo: NoteRepository) {}

  async execute(id: number): Promise<NoteEntity | null> {
    const note = await this.noteRepo.getById(id);
    if (!note) return null;
    return NoteEntity.fromDatabase(note);
  }
}
