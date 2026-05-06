import { createDatabase, type DBClient } from "./database/index.js";
export type { DBClient };
export { createDatabase };

import ListsService from "./services/ListsService.js";
import ListsRepository from "./database/repositories/ListsRepository.js";
import SectionsService from "./services/SectionsService.js";
import SectionsRepository from "./database/repositories/SectionsRepository.js";
import TasksService from "./services/TasksService.js";
import { TasksRepository, TaskExecutionsRepository, TaskExceptionsRepository } from "./database/repositories/TasksRepository.js";
import type { InsertList, List } from "./schemas/lists.js";
export type { InsertList, List };
import type { InsertSection, Section } from "./schemas/sections.js";
export type { InsertSection, Section };
import type { InsertTask, Task } from "./schemas/tasks.js";
export type { InsertTask, Task };
import type { TaskWithProgress, TaskOccurrenceDetail, TaskInRange } from "./schemas/tasks.js";
export type { TaskWithProgress, TaskOccurrenceDetail, TaskInRange };

export {
  isDueRuleRelative,
  parseDueRuleToFixed,
  calculateDueDate,
} from "./utils/dueRuleParser.js";
export { validateRRule, createRRule } from "./utils/rruleHelper.js";

class PersonalCore {
  protected db: DBClient;
  private _listsService: ListsService | null;
  private _sectionsService: SectionsService | null;
  private _tasksService: TasksService | null;
  private _listsRepo: ListsRepository | null;

  public get listsService() {
    if (!this._listsService) {
      const repo = new ListsRepository(this.db);
      this._listsService = new ListsService(repo, this.sectionsService);
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

  public get tasksService() {
    if (!this._tasksService) {
      const tasksRepo = new TasksRepository(this.db);
      const taskExecutionsRepo = new TaskExecutionsRepository(this.db);
      const taskExceptionsRepo = new TaskExceptionsRepository(this.db);
      const sectionsRepo = new SectionsRepository(this.db);
      this._tasksService = new TasksService(tasksRepo, taskExecutionsRepo, taskExceptionsRepo, sectionsRepo);
    }
    return this._tasksService;
  }

  private get listsRepository() {
    if (!this._listsRepo) {
      this._listsRepo = new ListsRepository(this.db);
    }
    return this._listsRepo;
  }

  public async getAllColors(): Promise<string[]> {
    return this.listsRepository.getAllColors();
  }

  public async getAllIcons(): Promise<string[]> {
    return this.listsRepository.getAllIcons();
  }

  private constructor(db: DBClient) {
    this.db = db;
    this._listsService = null;
    this._sectionsService = null;
    this._tasksService = null;
    this._listsRepo = null;
  }

  static async initialize(db: DBClient): Promise<PersonalCore> {
    await createDatabase(db);
    return new PersonalCore(db);
  }
}

export { PersonalCore };
export default PersonalCore;
