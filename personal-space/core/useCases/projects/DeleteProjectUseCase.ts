import { ProjectRepository } from "@/database/repositories/ProjectRepository";

export class DeleteProjectUseCase {
  constructor(private projectRepo: ProjectRepository) {}

  /**
   * Elimina un proyecto de forma permanente.
   * @param id ID del proyecto a eliminar.
   */
  async execute(id: number): Promise<void> {
    const project = await this.projectRepo.getById(id);

    if (!project) {
      throw new Error("No se encontró el proyecto a eliminar.");
    }

    // Nota: El borrado en cascada (tareas, notas) se maneja a nivel
    // de base de datos gracias al ON DELETE CASCADE del script SQL.
    await this.projectRepo.delete(id);
  }
}
