import type { BaseRepository } from "../database/repositories/BaseRepository.js";

export default abstract class BaseService<
  T,
  InsertT extends Partial<T>,
  TRepository extends BaseRepository<T>,
> {
  protected repository: TRepository;

  constructor(repository: TRepository) {
    this.repository = repository;
  }

  public async update(id: string, data: InsertT) {
    return await this.repository.update(id, data);
  }

  public async delete(id: string) {
    return await this.repository.delete(id);
  }

  public async create(data: InsertT) {
    return await this.repository.create(data);
  }
}
