import { BaseRepository } from "./BaseRepository.js";
import type { Section } from "../../schemas/sections.js";
import type { DBClient } from "../index.js";

export default class SectionsRepository extends BaseRepository<Section> {
  constructor(db: DBClient) {
    super(db, "sections");
  }
}
