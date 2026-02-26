import { type DBClient } from "./database/index.js";
export type { DBClient };
import ProjectsService from "./services/ProjectsService.js";
export default class PersonalCore {
    protected db: DBClient;
    private _projectService;
    get projectService(): ProjectsService;
    constructor(db: DBClient);
}
//# sourceMappingURL=index.d.ts.map