import { SQLiteDatabase } from "expo-sqlite";

// Repositorios
import { ProjectRepository } from "../database/repositories/ProjectRepository";
import { NoteRepository } from "../database/repositories/NoteRepository";
import { CurrencyRepository } from "../database/repositories/CurrencyRepository";
import { FinanceRepository } from "../database/repositories/FinanceRepository";

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
import { SearchNotesUseCase } from "./useCases/notes/SearchNotesUseCase";

// Casos de Uso (Monedas)
import { GetAllCurrenciesUseCase } from "./useCases/currencies/GetAllCurrenciesUseCase";

// Casos de Uso (Finanzas)
import { CreateFinanceUseCase } from "./useCases/finances/CreateFinanceUseCase";
import { UpdateFinanceUseCase } from "./useCases/finances/UpdateFinanceUseCase";
import { DeleteFinanceUseCase } from "./useCases/finances/DeleteFinanceUseCase";
import { GetFinanceByIdUseCase } from "./useCases/finances/GetFinanceByIdUseCase";

export class DependenciesManager {
  private projectRepo: ProjectRepository;
  private noteRepo: NoteRepository;
  private currencyRepo: CurrencyRepository;
  private financeRepo: FinanceRepository;

  public createProject: CreateProjectUseCase;
  public updateProject: UpdateProjectUseCase;
  public deleteProject: DeleteProjectUseCase;
  public getAllProjects: GetAllProjectsUseCase;

  public createNote: CreateNoteUseCase;
  public updateNote: UpdateNoteUseCase;
  public deleteNote: DeleteNoteUseCase;
  public getNoteById: GetNoteByIdUseCase;
  public getNotesByProject: GetNotesByProjectUseCase;
  public searchNotes: SearchNotesUseCase;

  public getAllCurrencies: GetAllCurrenciesUseCase;

  public createFinance: CreateFinanceUseCase;
  public updateFinance: UpdateFinanceUseCase;
  public deleteFinance: DeleteFinanceUseCase;
  public getFinanceById: GetFinanceByIdUseCase;

  constructor(db: SQLiteDatabase) {
    this.projectRepo = new ProjectRepository(db);
    this.noteRepo = new NoteRepository(db);
    this.currencyRepo = new CurrencyRepository(db);
    this.financeRepo = new FinanceRepository(db);

    this.createProject = new CreateProjectUseCase(this.projectRepo);
    this.updateProject = new UpdateProjectUseCase(this.projectRepo);
    this.deleteProject = new DeleteProjectUseCase(this.projectRepo);
    this.getAllProjects = new GetAllProjectsUseCase(this.projectRepo);

    this.createNote = new CreateNoteUseCase(this.noteRepo);
    this.updateNote = new UpdateNoteUseCase(this.noteRepo);
    this.deleteNote = new DeleteNoteUseCase(this.noteRepo);
    this.getNoteById = new GetNoteByIdUseCase(this.noteRepo);
    this.getNotesByProject = new GetNotesByProjectUseCase(this.noteRepo);
    this.searchNotes = new SearchNotesUseCase(this.noteRepo);

    this.getAllCurrencies = new GetAllCurrenciesUseCase(this.currencyRepo);

    this.createFinance = new CreateFinanceUseCase(this.financeRepo);
    this.updateFinance = new UpdateFinanceUseCase(this.financeRepo);
    this.deleteFinance = new DeleteFinanceUseCase(this.financeRepo);
    this.getFinanceById = new GetFinanceByIdUseCase(this.financeRepo);
  }
}
