import BaseService from "./BaseService.js";
import type { Section, InsertSection } from "../schemas/sections.js";
import SectionsRepository from "../database/repositories/SectionsRepository.js";

export default class SectionsService extends BaseService<
  Section,
  InsertSection,
  SectionsRepository
> {
  constructor(repo: SectionsRepository) {
    super(repo);
  }

  public async getAll() {
    return await this.repository.getAll(["id", "name", "list_id", "updated_at"]);
  }

  public async getByListId(listId: string) {
    return await this.repository.findByListId(listId);
  }
}
