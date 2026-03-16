import type ListsRepository from "../database/repositories/ListsRepository.js";
import type { InsertList, List } from "../schemas/lists.js";
import BaseService from "./BaseService.js";

export default class ListsService extends BaseService<
  List,
  InsertList,
  ListsRepository
> {
  constructor(repository: ListsRepository) {
    super(repository);
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

  public async archive(id: string) {
    return await this.repository.archive(id);
  }

  public async unarchive(id: string) {
    return await this.repository.unarchive(id);
  }

  public async getById(id: string) {
    return await this.repository.getById(id, [
      "id",
      "name",
      "color_id",
      "icon_id",
      "is_archived",
      "updated_at",
    ]);
  }
}
