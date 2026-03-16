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
}
