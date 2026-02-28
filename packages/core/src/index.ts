import { createDatabase, type DBClient } from "./database/index.js";
export type { DBClient };

import ProjectsRepository from "./database/repositories/ProjectsRepository.js";
import ProjectsService from "./services/ProjectsService.js";
import NotesRepository from "./database/repositories/NotesRepository.js";
import NotesService from "./services/NotesService.js";

export default class PersonalCore {
  protected db: DBClient;
  private _projectService: ProjectsService | null;
  private _noteService: NotesService | null;

  public get projectService() {
    if (!this._projectService) {
      const repo = new ProjectsRepository(this.db);
      this._projectService = new ProjectsService(repo);
    }
    return this._projectService;
  }

  public get noteService() {
    if (!this._noteService) {
      const repo = new NotesRepository(this.db);
      this._noteService = new NotesService(repo);
    }
    return this._noteService;
  }

  constructor(db: DBClient) {
    this.db = db;
    this._projectService = null;
    this._noteService = null;

    createDatabase(this.db);
  }
}
