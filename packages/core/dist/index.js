import { createDatabase } from "./database/index.js";
import ProjectsRepository from "./database/repositories/ProjectsRepository.js";
import ProjectsService from "./services/ProjectsService.js";
import NotesRepository from "./database/repositories/NotesRepository.js";
import NotesService from "./services/NotesService.js";
export default class PersonalCore {
    db;
    _projectService;
    _noteService;
    get projectService() {
        if (!this._projectService) {
            const repo = new ProjectsRepository(this.db);
            this._projectService = new ProjectsService(repo);
        }
        return this._projectService;
    }
    get noteService() {
        if (!this._noteService) {
            const repo = new NotesRepository(this.db);
            this._noteService = new NotesService(repo);
        }
        return this._noteService;
    }
    constructor(db) {
        this.db = db;
        this._projectService = null;
        this._noteService = null;
        createDatabase(this.db);
    }
}
//# sourceMappingURL=index.js.map