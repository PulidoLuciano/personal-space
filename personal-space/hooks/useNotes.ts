import { useDependencies } from "@/components/providers/DatabaseContext";
import { NoteEntity } from "@/core/entities/NoteEntity";

export const useNotes = () => {
  const controller = useDependencies();

  const createNote = async (data: {
    projectId: number;
    title: string;
    content: string;
  }): Promise<number> => {
    return await controller.createNote.execute(data);
  };

  const updateNote = async (
    id: number,
    data: { title: string; content: string }
  ): Promise<void> => {
    return await controller.updateNote.execute(id, data);
  };

  const deleteNote = async (id: number): Promise<void> => {
    return await controller.deleteNote.execute(id);
  };

  const getNoteById = async (id: number): Promise<NoteEntity | null> => {
    return await controller.getNoteById.execute(id);
  };

  const getNotesByProject = async (
    projectId: number
  ): Promise<NoteEntity[]> => {
    return await controller.getNotesByProject.execute(projectId);
  };

  return {
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    getNotesByProject,
  };
};
