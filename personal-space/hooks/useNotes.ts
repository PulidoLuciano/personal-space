import { useDependencies } from "@/components/providers/DatabaseContext";
import { NoteEntity } from "@/core/entities/NoteEntity";
import { SearchNotesResult } from "@/core/useCases/notes/SearchNotesUseCase";
import { noteEvents, NOTE_CHANGED } from "@/utils/events/NoteEvents";

export const useNotes = () => {
  const controller = useDependencies();

  const createNote = async (data: {
    projectId: number;
    title: string;
    content: string;
  }): Promise<number> => {
    const id = await controller.createNote.execute(data);
    noteEvents.emit(NOTE_CHANGED, { projectId: data.projectId, noteId: id });
    return id;
  };

  const updateNote = async (
    id: number,
    data: { title: string; content: string }
  ): Promise<void> => {
    await controller.updateNote.execute(id, data);
    noteEvents.emit(NOTE_CHANGED, { noteId: id });
  };

  const deleteNote = async (id: number): Promise<void> => {
    await controller.deleteNote.execute(id);
    noteEvents.emit(NOTE_CHANGED, { noteId: id });
  };

  const getNoteById = async (id: number): Promise<NoteEntity | null> => {
    return await controller.getNoteById.execute(id);
  };

  const getNotesByProject = async (
    projectId: number
  ): Promise<NoteEntity[]> => {
    return await controller.getNotesByProject.execute(projectId);
  };

  const searchNotes = async (
    projectId: number,
    searchText: string,
    page: number,
    pageSize: number = 15
  ): Promise<SearchNotesResult> => {
    return await controller.searchNotes.execute(projectId, searchText, page, pageSize);
  };

  return {
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    getNotesByProject,
    searchNotes,
  };
};
