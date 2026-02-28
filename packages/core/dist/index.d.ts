import { type DBClient } from "./database/index.js";
export type { DBClient };
import ProjectsService from "./services/ProjectsService.js";
import NotesService from "./services/NotesService.js";
import FinancesService from "./services/FinancesService.js";
export default class PersonalCore {
    protected db: DBClient;
    private _projectService;
    private _noteService;
    private _financeService;
    get projectService(): ProjectsService;
    get noteService(): NotesService;
    get financeService(): FinancesService;
    constructor(db: DBClient);
}
//# sourceMappingURL=index.d.ts.map