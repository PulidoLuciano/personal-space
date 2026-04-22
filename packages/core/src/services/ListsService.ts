import type ListsRepository from "../database/repositories/ListsRepository.js";
import {
  insertListSchema,
  updateListSchema,
  type InsertList,
  type UpdateList,
  type List,
} from "../schemas/lists.js";
import { validate, validatePartial } from "../utils/zodValidator.js";
import BaseService from "./BaseService.js";
import type SectionsService from "./SectionsService.js";

export default class ListsService extends BaseService<
  List,
  InsertList,
  ListsRepository
> {
  private _sectionsService;

  constructor(repository: ListsRepository, sectionsService: SectionsService) {
    super(repository);
    this._sectionsService = sectionsService;
  }

  public async getAllPaginated(
    page: number,
    size: number,
    searchText: string | null = null,
    archived: boolean = false,
  ) {
    if (archived)
      return await this.repository.searchArchivedPaginated(
        page,
        size,
        searchText,
      );
    return await this.repository.searchNoArchivedPaginated(
      page,
      size,
      searchText,
    );
  }

  private async validateColor(color: string | undefined): Promise<void> {
    if (!color) return;
    const exists = await this.repository.findColor(color);
    if (!exists) {
      throw new Error("Color is not valid");
    }
  }

  private async validateIcon(icon: string | undefined): Promise<void> {
    if (!icon) return;
    const exists = await this.repository.findIcon(icon);
    if (!exists) {
      throw new Error("Icon is not valid");
    }
  }

  public async create(data: InsertList) {
    data = validate(insertListSchema, data);
    await this.validateColor(data.color_id);
    await this.validateIcon(data.icon_id);
    const dataWithDefaults = {
      ...data,
      color_id: data.color_id ?? "#777777",
      icon_id: data.icon_id ?? "circle",
    };
    const list_id = await super.create(dataWithDefaults);
    this._sectionsService.create({ name: "Not sectioned", list_id: list_id });
    return list_id;
  }

  public async getById(id: string) {
    return await this.repository.getById(id, [
      "id",
      "name",
      "color_id",
      "icon_id",
      "is_archived",
      "mutable",
      "updated_at",
    ]);
  }

  private checkMutable(list: List | null) {
    if (!list) {
      throw new Error("List not found");
    }
    if (!list.mutable) {
      throw new Error("Cannot modify an immutable list");
    }
  }

  public async update(id: string, data: UpdateList): Promise<void> {
    const list = await this.getById(id);
    this.checkMutable(list);
    const validData = validatePartial(updateListSchema, data);
    await this.validateColor(validData.color_id);
    await this.validateIcon(validData.icon_id);
    return await this.repository.update(id, validData);
  }

  public async delete(id: string): Promise<void> {
    const list = await this.getById(id);
    this.checkMutable(list);
    return await this.repository.delete(id);
  }

  public async archive(id: string): Promise<void> {
    const list = await this.getById(id);
    this.checkMutable(list);
    return await this.repository.archive(id);
  }

  public async unarchive(id: string): Promise<void> {
    const list = await this.getById(id);
    this.checkMutable(list);
    return await this.repository.unarchive(id);
  }
}
