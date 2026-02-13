import { ProjectRepository } from "@/database/repositories/ProjectRepository";
import { ProjectEntity } from "@/core/entities/ProjectEntity";

export class CreateProjectUseCase {
  constructor(private projectRepo: ProjectRepository) {}

  async execute(props: {
    name: string;
    color?: string;
    icon?: string;
  }): Promise<number> {
    const project = new ProjectEntity(props);

    return await this.projectRepo.create({
      name: project.name,
      color: project.color,
      icon: project.icon,
    });
  }
}
