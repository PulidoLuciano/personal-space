import { type DBClient } from "./database/index.js";
export type { DBClient };
import ProjectsService from "./services/ProjectsService.js";
import NotesService from "./services/NotesService.js";
export default class PersonalCore {
    protected db: DBClient;
    private _projectService;
    private _noteService;
    get projectService(): ProjectsService;
    get noteService(): NotesService;
    constructor(db: DBClient);
}
//# sourceMappingURL=index.d.ts.map