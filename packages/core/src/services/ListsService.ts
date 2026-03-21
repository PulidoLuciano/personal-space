import type ListsRepository from "../database/repositories/ListsRepository.js";
import type { InsertList, List } from "../schemas/lists.js";
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

  public async create(data: InsertList) {
    const list_id = await super.create(data);
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

  public async update(id: string, data: Partial<InsertList>): Promise<void> {
    const list = await this.getById(id);
    this.checkMutable(list);
    return await this.repository.update(id, data);
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
