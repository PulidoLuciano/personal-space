import { createDatabase, type DBClient } from "./database/index.js";
export type { DBClient };

import ProjectsRepository from "./database/repositories/ProjectsRepository.js";
import ProjectsService from "./services/ProjectsService.js";

export default class PersonalCore {
  protected db: DBClient;
  private _projectService: ProjectsService | null;

  public get projectService() {
    if (!this._projectService) {
      const repo = new ProjectsRepository(this.db);
      this._projectService = new ProjectsService(repo);
    }
    return this._projectService;
  }

  constructor(db: DBClient) {
    this.db = db;
    this._projectService = null;

    createDatabase(this.db);
  }
}
