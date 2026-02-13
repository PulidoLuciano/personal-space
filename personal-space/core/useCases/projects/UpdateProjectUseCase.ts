import { ProjectRepository } from "@/database/repositories/ProjectRepository";
import { ProjectEntity } from "@/core/entities/ProjectEntity";

export class UpdateProjectUseCase {
  constructor(private projectRepo: ProjectRepository) {}

  /**
   * Actualiza un proyecto existente.
   * @param id El ID del proyecto a modificar.
   * @param data Datos parciales para actualizar.
   */
  async execute(
    id: number,
    data: { name?: string; color?: string; icon?: string },
  ): Promise<void> {
    // 1. Buscamos el registro actual en la DB
    const row = await this.projectRepo.getById(id);

    if (!row) {
      throw new Error(`No se encontró el proyecto con ID ${id}`);
    }

    // 2. Creamos una "Entidad" combinando los datos viejos con los nuevos.
    // Si el nuevo nombre es inválido (ej: muy corto), la entidad lanzará el error aquí.
    const updatedEntity = new ProjectEntity({
      id: row.id,
      name: data.name ?? row.name,
      color: data.color ?? row.color,
      icon: data.icon ?? row.icon,
    });

    // 3. Persistimos los datos ya validados
    await this.projectRepo.update(id, {
      name: updatedEntity.name,
      color: updatedEntity.color,
      icon: updatedEntity.icon,
    });
  }
}
