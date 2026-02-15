import { NoteRepository } from "@/database/repositories/NoteRepository";
import { noteEvents } from "@/utils/events/NoteEvents";

export class DeleteNoteUseCase {
  constructor(private noteRepo: NoteRepository) {}

  async execute(id: number): Promise<void> {
    await this.noteRepo.delete(id);
    noteEvents.emit("noteDeleted", { noteId: id });
  }
}
