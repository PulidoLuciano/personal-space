import type ProjectsRepository from "../database/repositories/ProjectsRepository.js";
import type { InsertProject, Project } from "../schemas/project.js";
import BaseService from "./BaseService.js";

export default class ProjectsService extends BaseService<
  Project,
  InsertProject,
  ProjectsRepository
> {
  constructor(repository: ProjectsRepository) {
    super(repository);
  }

  public async getAllPaginated(
    page: number,
    size: number,
    searchText: string | null = null,
    archived: boolean = false,
  ) {
    if (archived)
      return await this.repository.searchArchivedProjectsPaginated(
        page,
        size,
        searchText,
      );
    return await this.repository.searchNoArchivedProjectsPaginated(
      page,
      size,
      searchText,
    );
  }

  public async archive(id: string) {
    return await this.repository.archiveProject(id);
  }

  public async getProjectById(id: string) {
    return await this.repository.getById(id, [
      "id",
      "name",
      "color_id",
      "icon_id",
      "is_archived",
      "updated_at",
    ]);
  }
}
