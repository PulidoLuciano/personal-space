import type { Finance } from "../../schemas/finances.js";
import type { DBClient } from "../index.js";
import { BaseRepository } from "./BaseRepository.js";

export default class FinancesRepository extends BaseRepository<Finance> {
  public constructor(db: DBClient) {
    super(db, "Finances");
  }
}
