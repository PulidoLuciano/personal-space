import BaseService from "./BaseService.js";
import type {
  Section,
  InsertSection,
  UpdateSection,
} from "../schemas/sections.js";
import {
  insertSectionSchema,
  updateSectionSchema,
} from "../schemas/sections.js";
import { validate, validatePartial } from "../utils/zodValidator.js";
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
    return await this.repository.getAll([
      "id",
      "name",
      "list_id",
      "updated_at",
    ]);
  }

  public async getByListId(listId: string) {
    return await this.repository.findByListId(listId);
  }

  public async create(data: InsertSection): Promise<string> {
    validate(insertSectionSchema, data);
    const list = await this.repository.findListById(data.list_id);
    if (!list) {
      throw new Error("List does not exist");
    }
    return await super.create(data);
  }

  public async update(id: string, data: UpdateSection): Promise<void> {
    const section = await this.getById(id, ["id", "mutable"]);
    if (!section) {
      throw new Error("Section not found");
    }
    if (!section.mutable) {
      throw new Error("Cannot update a immutable section");
    }
    const validData = validatePartial(updateSectionSchema, data);
    const { list_id, ...updateData } = validData;
    return await this.repository.update(id, updateData);
  }

  public async delete(id: string): Promise<void> {
    const section = await this.getById(id, ["list_id"]);
    if (!section) {
      throw new Error("Section not found");
    }

    const sectionCount = await this.repository.countByListId(section.list_id);
    if (sectionCount <= 1) {
      throw new Error("Cannot delete the only section in a list");
    }

    return await this.repository.delete(id);
  }
}

