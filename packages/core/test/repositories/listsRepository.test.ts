import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../setup.js';
import ListsRepository from '../../src/database/repositories/ListsRepository.js';
import type { DBClient } from '../../src/database/index.js';

describe('ListsRepository', () => {
  let db: DBClient;
  let repo: ListsRepository;

  beforeEach(async () => {
    db = await createTestDatabase();
    repo = new ListsRepository(db);
  });

  describe('create', () => {
    it('should create a new list', async () => {
      const id = await repo.create({
        name: 'My List',
        color_id: '#1565C0',
        icon_id: 'star',
      });
      expect(id).toBeDefined();

      const result = await repo.getById(id);
      expect(result?.name).toBe('My List');
      expect(result?.color_id).toBe('#1565C0');
      expect(result?.icon_id).toBe('star');
    });
  });

  describe('getAll', () => {
    it('should return all non-deleted lists', async () => {
      await repo.create({ name: 'List 1', color_id: '#1565C0', icon_id: 'star' });
      await repo.create({ name: 'List 2', color_id: '#0D47A1', icon_id: 'heart' });

      const results = await repo.getAll();
      expect(results.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getById', () => {
    it('should return list by id', async () => {
      const id = await repo.create({ name: 'Find Me', color_id: '#1565C0', icon_id: 'star' });
      const result = await repo.getById(id);
      expect(result?.name).toBe('Find Me');
    });

    it('should return null for non-existent id', async () => {
      const result = await repo.getById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update existing list', async () => {
      const id = await repo.create({ name: 'Original', color_id: '#1565C0', icon_id: 'star' });
      await repo.update(id, { name: 'Updated' });

      const result = await repo.getById(id);
      expect(result?.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should soft delete a list', async () => {
      const id = await repo.create({ name: 'To Delete', color_id: '#1565C0', icon_id: 'star' });
      await repo.delete(id);

      const result = await repo.getById(id);
      expect(result).toBeNull();
    });
  });

  describe('searchNoArchivedPaginated', () => {
    it('should return non-archived lists paginated', async () => {
      await repo.create({ name: 'Active List', color_id: '#1565C0', icon_id: 'star' });

      const results = await repo.searchNoArchivedPaginated(1, 10);
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by search text', async () => {
      await repo.create({ name: 'Searchable Item', color_id: '#1565C0', icon_id: 'star' });

      const results = await repo.searchNoArchivedPaginated(1, 10, 'Searchable');
      expect(results.length).toBe(1);
      expect(results[0]?.name).toBe('Searchable Item');
    });

    it('should exclude archived lists', async () => {
      const id = await repo.create({ name: 'To Archive', color_id: '#1565C0', icon_id: 'star' });
      await repo.archive(id);

      const results = await repo.searchNoArchivedPaginated(1, 10);
      const found = results.find(r => r.id === id);
      expect(found).toBeUndefined();
    });
  });

  describe('searchArchivedPaginated', () => {
    it('should return archived lists', async () => {
      const id = await repo.create({ name: 'Archived List', color_id: '#1565C0', icon_id: 'star' });
      await repo.archive(id);

      const results = await repo.searchArchivedPaginated(1, 10);
      expect(results.length).toBe(1);
      expect(results[0]?.id).toBe(id);
    });
  });

  describe('archive', () => {
    it('should archive a list', async () => {
      const id = await repo.create({ name: 'Archive Me', color_id: '#1565C0', icon_id: 'star' });
      await repo.archive(id);

      const result = await repo.getById(id);
      expect(result?.is_archived).toBe(1);
    });
  });

  describe('unarchive', () => {
    it('should unarchive a list', async () => {
      const id = await repo.create({ name: 'Unarchive Me', color_id: '#1565C0', icon_id: 'star' });
      await repo.archive(id);
      await repo.unarchive(id);

      const result = await repo.getById(id);
      expect(result?.is_archived).toBe(0);
    });
  });

  describe('count', () => {
    it('should return total count', async () => {
      const initialCount = await repo.count();
      await repo.create({ name: 'Count Test', color_id: '#1565C0', icon_id: 'star' });
      const newCount = await repo.count();
      expect(newCount).toBe(initialCount + 1);
    });
  });
});