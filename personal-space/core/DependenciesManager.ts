import { SQLiteDatabase } from "expo-sqlite";

// Repositorios
import { ProjectRepository } from "../database/repositories/ProjectRepository";
import { NoteRepository } from "../database/repositories/NoteRepository";
import { CurrencyRepository } from "../database/repositories/CurrencyRepository";
import { FinanceRepository } from "../database/repositories/FinanceRepository";
import { FinanceExecutionRepository } from "../database/repositories/FinanceExecutionRepository";
import { TaskRepository } from "../database/repositories/TaskRepository";
import { HabitRepository } from "../database/repositories/HabitRepository";

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
import { GetFinancesByProjectUseCase } from "./useCases/finances/GetFinancesByProjectUseCase";

// Casos de Uso (Ejecuciones de Finanzas)
import { CreateFinanceExecutionUseCase } from "./useCases/financeExecutions/CreateFinanceExecutionUseCase";
import { DeleteFinanceExecutionUseCase } from "./useCases/financeExecutions/DeleteFinanceExecutionUseCase";
import { GetFinanceExecutionsByProjectUseCase } from "./useCases/financeExecutions/GetFinanceExecutionsByProjectUseCase";
import { GetProjectTotalAmountUseCase } from "./useCases/financeExecutions/GetProjectTotalAmountUseCase";

// Casos de Uso (Tareas)
import { CreateTaskUseCase } from "./useCases/tasks/CreateTaskUseCase";
import { UpdateTaskUseCase } from "./useCases/tasks/UpdateTaskUseCase";
import { DeleteTaskUseCase } from "./useCases/tasks/DeleteTaskUseCase";
import { GetTaskByIdUseCase } from "./useCases/tasks/GetTaskByIdUseCase";
import { GetTasksByProjectUseCase } from "./useCases/tasks/GetTasksByProjectUseCase";

// Casos de Uso (Hábitos)
import { CreateHabitUseCase } from "./useCases/habits/CreateHabitUseCase";
import { UpdateHabitUseCase } from "./useCases/habits/UpdateHabitUseCase";
import { DeleteHabitUseCase } from "./useCases/habits/DeleteHabitUseCase";
import { GetHabitByIdUseCase } from "./useCases/habits/GetHabitByIdUseCase";
import { GetHabitsByProjectUseCase } from "./useCases/habits/GetHabitsByProjectUseCase";

export class DependenciesManager {
  private projectRepo: ProjectRepository;
  private noteRepo: NoteRepository;
  private currencyRepo: CurrencyRepository;
  private financeRepo: FinanceRepository;
  private financeExecutionRepo: FinanceExecutionRepository;
  private taskRepo: TaskRepository;
  private habitRepo: HabitRepository;

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
  public getFinancesByProject: GetFinancesByProjectUseCase;

  public createFinanceExecution: CreateFinanceExecutionUseCase;
  public deleteFinanceExecution: DeleteFinanceExecutionUseCase;
  public getFinanceExecutionsByProject: GetFinanceExecutionsByProjectUseCase;
  public getProjectTotalAmount: GetProjectTotalAmountUseCase;

  public createTask: CreateTaskUseCase;
  public updateTask: UpdateTaskUseCase;
  public deleteTask: DeleteTaskUseCase;
  public getTaskById: GetTaskByIdUseCase;
  public getTasksByProject: GetTasksByProjectUseCase;

  public createHabit: CreateHabitUseCase;
  public updateHabit: UpdateHabitUseCase;
  public deleteHabit: DeleteHabitUseCase;
  public getHabitById: GetHabitByIdUseCase;
  public getHabitsByProject: GetHabitsByProjectUseCase;

  constructor(db: SQLiteDatabase) {
    this.projectRepo = new ProjectRepository(db);
    this.noteRepo = new NoteRepository(db);
    this.currencyRepo = new CurrencyRepository(db);
    this.financeRepo = new FinanceRepository(db);
    this.financeExecutionRepo = new FinanceExecutionRepository(db);
    this.taskRepo = new TaskRepository(db);
    this.habitRepo = new HabitRepository(db);

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
    this.getFinancesByProject = new GetFinancesByProjectUseCase(this.financeRepo);

    this.createFinanceExecution = new CreateFinanceExecutionUseCase(this.financeExecutionRepo);
    this.deleteFinanceExecution = new DeleteFinanceExecutionUseCase(this.financeExecutionRepo);
    this.getFinanceExecutionsByProject = new GetFinanceExecutionsByProjectUseCase(this.financeExecutionRepo);
    this.getProjectTotalAmount = new GetProjectTotalAmountUseCase(this.financeExecutionRepo);

    this.createTask = new CreateTaskUseCase(this.taskRepo);
    this.updateTask = new UpdateTaskUseCase(this.taskRepo);
    this.deleteTask = new DeleteTaskUseCase(this.taskRepo);
    this.getTaskById = new GetTaskByIdUseCase(this.taskRepo);
    this.getTasksByProject = new GetTasksByProjectUseCase(this.taskRepo);

    this.createHabit = new CreateHabitUseCase(this.habitRepo);
    this.updateHabit = new UpdateHabitUseCase(this.habitRepo);
    this.deleteHabit = new DeleteHabitUseCase(this.habitRepo);
    this.getHabitById = new GetHabitByIdUseCase(this.habitRepo);
    this.getHabitsByProject = new GetHabitsByProjectUseCase(this.habitRepo);
  }
}
