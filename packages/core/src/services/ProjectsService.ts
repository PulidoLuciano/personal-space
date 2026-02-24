import type ProjectsRepository from "../database/repositories/ProjectsRepository.js";
import type { Project } from "../schemas/project.js";

export default class ProjectsService {
  protected repository: ProjectsRepository;

  constructor(repository: ProjectsRepository) {
    this.repository = repository;
  }

  async getAllProjects(): Promise<Project[]> {
    return await this.repository.getAll();
  }
}
