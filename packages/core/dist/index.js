import { createDatabase } from "./database/index.js";
import ProjectsRepository from "./database/repositories/ProjectsRepository.js";
import ProjectsService from "./services/ProjectsService.js";
export default class PersonalCore {
    db;
    _projectService;
    get projectService() {
        if (!this._projectService) {
            const repo = new ProjectsRepository(this.db);
            this._projectService = new ProjectsService(repo);
        }
        return this._projectService;
    }
    constructor(db) {
        this.db = db;
        this._projectService = null;
        createDatabase(this.db);
    }
}
//# sourceMappingURL=index.js.map