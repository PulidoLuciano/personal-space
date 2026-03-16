import { createDatabase, type DBClient } from "./database/index.js";
export type { DBClient };

import ListsService from "./services/ListsService.js";
import ListsRepository from "./database/repositories/ListsRepository.js";
import SectionsService from "./services/SectionsService.js";
import SectionsRepository from "./database/repositories/SectionsRepository.js";

export default class PersonalCore {
  protected db: DBClient;
  private _listsService: ListsService | null;
  private _sectionsService: SectionsService | null;

  public get listsService() {
    if (!this._listsService) {
      const repo = new ListsRepository(this.db);
      this._listsService = new ListsService(repo);
    }
    return this._listsService;
  }

  public get sectionsService() {
    if (!this._sectionsService) {
      const repo = new SectionsRepository(this.db);
      this._sectionsService = new SectionsService(repo);
    }
    return this._sectionsService;
  }

  constructor(db: DBClient) {
    this.db = db;
    this._listsService = null;
    this._sectionsService = null;

    createDatabase(this.db);
  }
}
