import { NoteRepository } from "@/database/repositories/NoteRepository";
import { noteEvents } from "@/utils/events/NoteEvents";

export class UpdateNoteUseCase {
  constructor(private noteRepo: NoteRepository) {}

  async execute(
    id: number,
    props: {
      title: string;
      content: string;
    }
  ): Promise<void> {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error("La nota debe tener un título.");
    }

    if (props.title.length > 100) {
      throw new Error(
        "El título de la nota es demasiado largo (máximo 100 caracteres)."
      );
    }

    await this.noteRepo.update(id, {
      title: props.title.trim(),
      content: props.content ?? "",
    });

    noteEvents.emit("noteUpdated", { noteId: id });
  }
}
