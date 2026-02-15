import { NoteRepository } from "@/database/repositories/NoteRepository";
import { NoteEntity } from "@/core/entities/NoteEntity";
import { noteEvents } from "@/utils/events/NoteEvents";

export class CreateNoteUseCase {
  constructor(private noteRepo: NoteRepository) {}

  async execute(props: {
    projectId: number;
    title: string;
    content: string;
  }): Promise<number> {
    const note = new NoteEntity(props);

    const id = await this.noteRepo.create({
      project_id: note.projectId,
      title: note.title,
      content: note.content,
    });

    noteEvents.emit("noteCreated", { projectId: note.projectId, noteId: id });

    return id;
  }
}
