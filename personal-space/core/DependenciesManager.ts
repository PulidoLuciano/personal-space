import { SQLiteDatabase } from "expo-sqlite";

// Repositorios
import { ProjectRepository } from "../database/repositories/ProjectRepository";
import { NoteRepository } from "../database/repositories/NoteRepository";

// Casos de Uso (Proyectos)
import { CreateProjectUseCase } from "./useCases/projects/CreateProjectUseCase";
import { UpdateProjectUseCase } from "./useCases/projects/UpdateProjectUseCase";
import { DeleteProjectUseCase } from "./useCases/projects/DeleteProjectUseCase";
import { GetAllProjectsUseCase } from "./useCases/projects/GetAllProjectsUseCase";

// Casos de Uso (Notas)
import { CreateNoteUseCase } from "./useCases/notes/CreateNoteUseCase";
import { UpdateNoteUseCase } from "./useCases/notes/UpdateNoteUseCase";
import { DeleteNoteUseCase } from "./useCases/notes/DeleteNoteUseCase";
import { GetNoteByIdUseCase } from "./useCases/notes/GetNoteByIdUseCase";
import { GetNotesByProjectUseCase } from "./useCases/notes/GetNotesByProjectUseCase";

export class DependenciesManager {
  private projectRepo: ProjectRepository;
  private noteRepo: NoteRepository;

  public createProject: CreateProjectUseCase;
  public updateProject: UpdateProjectUseCase;
  public deleteProject: DeleteProjectUseCase;
  public getAllProjects: GetAllProjectsUseCase;

  public createNote: CreateNoteUseCase;
  public updateNote: UpdateNoteUseCase;
  public deleteNote: DeleteNoteUseCase;
  public getNoteById: GetNoteByIdUseCase;
  public getNotesByProject: GetNotesByProjectUseCase;

  constructor(db: SQLiteDatabase) {
    this.projectRepo = new ProjectRepository(db);
    this.noteRepo = new NoteRepository(db);

    this.createProject = new CreateProjectUseCase(this.projectRepo);
    this.updateProject = new UpdateProjectUseCase(this.projectRepo);
    this.deleteProject = new DeleteProjectUseCase(this.projectRepo);
    this.getAllProjects = new GetAllProjectsUseCase(this.projectRepo);

    this.createNote = new CreateNoteUseCase(this.noteRepo);
    this.updateNote = new UpdateNoteUseCase(this.noteRepo);
    this.deleteNote = new DeleteNoteUseCase(this.noteRepo);
    this.getNoteById = new GetNoteByIdUseCase(this.noteRepo);
    this.getNotesByProject = new GetNotesByProjectUseCase(this.noteRepo);
  }
}
