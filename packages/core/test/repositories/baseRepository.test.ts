import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../setup.js';
import { BaseRepository } from '../../src/database/repositories/BaseRepository.js';
import type { DBClient } from '../../src/database/index.js';

interface TestEntity {
  id: string;
  name: string;
  color_id: string;
  icon_id: string;
  is_archived: number;
  show_completed: number;
  mutable: number;
  is_deleted: number;
  updated_at: string;
}

class TestRepository extends BaseRepository<TestEntity> {
  constructor(db: DBClient) {
    super(db, 'lists');
  }
}

describe('BaseRepository', () => {
  let db: DBClient;
  let repo: TestRepository;

  beforeEach(async () => {
    db = await createTestDatabase();
    repo = new TestRepository(db);
  });

  describe('create', () => {
    it('should create a new record and return id', async () => {
      const id = await repo.create({ name: 'Test List', color_id: '#1565C0', icon_id: 'star' } as Partial<TestEntity>);
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');

      const result = await repo.getById(id);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Test List');
    });

    it('should set default timestamps', async () => {
      const id = await repo.create({ name: 'Timestamp Test', color_id: '#1565C0', icon_id: 'star' } as Partial<TestEntity>);
      const result = await repo.getById(id);
      expect(result?.updated_at).toBeDefined();
    });
  });

  describe('getAll', () => {
    it('should return all non-deleted records', async () => {
      await repo.create({ name: 'List 1', color_id: '#1565C0', icon_id: 'star' } as Partial<TestEntity>);
      await repo.create({ name: 'List 2', color_id: '#0D47A1', icon_id: 'heart' } as Partial<TestEntity>);

      const results = await repo.getAll();
      expect(results.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getById', () => {
    it('should return record by id', async () => {
      const id = await repo.create({ name: 'Find Me', color_id: '#1565C0', icon_id: 'star' } as Partial<TestEntity>);
      const result = await repo.getById(id);
      expect(result?.name).toBe('Find Me');
    });

    it('should return null for non-existent id', async () => {
      const result = await repo.getById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('find', () => {
    it('should find records by criteria', async () => {
      await repo.create({ name: 'Search Target', color_id: '#1565C0', icon_id: 'star' } as Partial<TestEntity>);

      const results = await repo.find([
        { column: 'name', operator: '=', value: 'Search Target' }
      ]);
      expect(results.length).toBe(1);
      expect(results[0]?.name).toBe('Search Target');
    });

    it('should return empty array when no matches', async () => {
      const results = await repo.find([
        { column: 'name', operator: '=', value: 'Non Existent' }
      ]);
      expect(results).toEqual([]);
    });
  });

  describe('paginate', () => {
    it('should return paginated results', async () => {
      for (let i = 0; i < 5; i++) {
        await repo.create({ name: `Page Item ${i}`, color_id: '#1565C0', icon_id: 'star' } as Partial<TestEntity>);
      }

      const page1 = await repo.paginate(1, 2);
      expect(page1.length).toBe(2);
    });

    it('should filter with criteria', async () => {
      await repo.create({ name: 'Filtered 1', color_id: '#1565C0', icon_id: 'star' } as Partial<TestEntity>);
      await repo.create({ name: 'Filtered 2', color_id: '#0D47A1', icon_id: 'heart' } as Partial<TestEntity>);
      await repo.create({ name: 'Other', color_id: '#388E3C', icon_id: 'leaf' } as Partial<TestEntity>);

      const results = await repo.paginate(1, 10, [
        { column: 'name', operator: 'LIKE', value: '%Filtered%' }
      ]);
      expect(results.length).toBe(2);
    });
  });

  describe('update', () => {
    it('should update existing record', async () => {
      const id = await repo.create({ name: 'Original', color_id: '#1565C0', icon_id: 'star' } as Partial<TestEntity>);
      await repo.update(id, { name: 'Updated' } as Partial<TestEntity>);

      const result = await repo.getById(id);
      expect(result?.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should soft delete a record', async () => {
      const id = await repo.create({ name: 'To Delete', color_id: '#1565C0', icon_id: 'star' } as Partial<TestEntity>);
      await repo.delete(id);

      const result = await repo.getById(id);
      expect(result).toBeNull();
    });
  });

  describe('count', () => {
    it('should return total count of non-deleted records', async () => {
      const initialCount = await repo.count();
      await repo.create({ name: 'Count Test', color_id: '#1565C0', icon_id: 'star' } as Partial<TestEntity>);
      const newCount = await repo.count();
      expect(newCount).toBe(initialCount + 1);
    });
  });
});