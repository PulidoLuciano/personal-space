import type { Project } from "../../schemas/project.js";
import type { DBClient } from "../index.js";
import { BaseRepository } from "./BaseRepository.js";

export default class ProjectsRepository extends BaseRepository<Project> {
  constructor(db: DBClient) {
    super(db, "Projects");
  }
}
