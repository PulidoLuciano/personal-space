import { SQLiteDatabase } from "expo-sqlite";

// Repositorios
import { ProjectRepository } from "../database/repositories/ProjectRepository";

// Casos de Uso (Proyectos)
import { CreateProjectUseCase } from "./useCases/projects/CreateProjectUseCase";
import { UpdateProjectUseCase } from "./useCases/projects/UpdateProjectUseCase";
import { DeleteProjectUseCase } from "./useCases/projects/DeleteProjectUseCase";

export class DependenciesManager {
  private projectRepo: ProjectRepository;

  public createProject: CreateProjectUseCase;
  public updateProject: UpdateProjectUseCase;
  public deleteProject: DeleteProjectUseCase;

  constructor(db: SQLiteDatabase) {
    this.projectRepo = new ProjectRepository(db);

    this.createProject = new CreateProjectUseCase(this.projectRepo);
    this.updateProject = new UpdateProjectUseCase(this.projectRepo);
    this.deleteProject = new DeleteProjectUseCase(this.projectRepo);
  }
}
