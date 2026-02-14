import { ProjectRepository } from "@/database/repositories/ProjectRepository";
import { ProjectEntity } from "@/core/entities/ProjectEntity";

export class GetAllProjectsUseCase {
  constructor(private projectRepo: ProjectRepository) {}

  /**
   * Obtiene todos los proyectos y los mapea a entidades de dominio.
   */
  async execute(): Promise<ProjectEntity[]> {
    const rows = await this.projectRepo.getAll();

    // Transformamos cada fila de la DB en una Entidad robusta
    return rows.map((row) => ProjectEntity.fromDatabase(row));
  }
}
