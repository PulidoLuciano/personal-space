import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../setup.js';
import SectionsRepository from '../../src/database/repositories/SectionsRepository.js';
import ListsRepository from '../../src/database/repositories/ListsRepository.js';
import type { DBClient } from '../../src/database/index.js';

describe('SectionsRepository', () => {
  let db: DBClient;
  let repo: SectionsRepository;
  let listsRepo: ListsRepository;

  beforeEach(async () => {
    db = await createTestDatabase();
    repo = new SectionsRepository(db);
    listsRepo = new ListsRepository(db);
  });

  describe('create', () => {
    it('should create a new section', async () => {
      const listId = await listsRepo.create({ name: 'Test List', color_id: '#1565C0', icon_id: 'star' });
      const id = await repo.create({ name: 'My Section', list_id: listId });
      
      expect(id).toBeDefined();
      const result = await repo.getById(id);
      expect(result?.name).toBe('My Section');
      expect(result?.list_id).toBe(listId);
    });
  });

  describe('getAll', () => {
    it('should return all non-deleted sections', async () => {
      const listId = await listsRepo.create({ name: 'Test List', color_id: '#1565C0', icon_id: 'star' });
      await repo.create({ name: 'Section 1', list_id: listId });
      await repo.create({ name: 'Section 2', list_id: listId });

      const results = await repo.getAll();
      expect(results.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getById', () => {
    it('should return section by id', async () => {
      const listId = await listsRepo.create({ name: 'Test List', color_id: '#1565C0', icon_id: 'star' });
      const id = await repo.create({ name: 'Find Me', list_id: listId });
      
      const result = await repo.getById(id);
      expect(result?.name).toBe('Find Me');
    });

    it('should return null for non-existent id', async () => {
      const result = await repo.getById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update existing section', async () => {
      const listId = await listsRepo.create({ name: 'Test List', color_id: '#1565C0', icon_id: 'star' });
      const id = await repo.create({ name: 'Original', list_id: listId });
      await repo.update(id, { name: 'Updated' });

      const result = await repo.getById(id);
      expect(result?.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should soft delete a section', async () => {
      const listId = await listsRepo.create({ name: 'Test List', color_id: '#1565C0', icon_id: 'star' });
      const id = await repo.create({ name: 'To Delete', list_id: listId });
      await repo.delete(id);

      const result = await repo.getById(id);
      expect(result).toBeNull();
    });
  });

  describe('findByListId', () => {
    it('should return sections by list id', async () => {
      const listId = await listsRepo.create({ name: 'Test List', color_id: '#1565C0', icon_id: 'star' });
      await repo.create({ name: 'Section A', list_id: listId });
      await repo.create({ name: 'Section B', list_id: listId });

      const results = await repo.findByListId(listId);
      expect(results.length).toBe(2);
    });

    it('should return empty for list with no sections', async () => {
      const listId = await listsRepo.create({ name: 'Empty List', color_id: '#1565C0', icon_id: 'star' });
      const results = await repo.findByListId(listId);
      expect(results).toEqual([]);
    });
  });

  describe('countByListId', () => {
    it('should return count of sections by list id', async () => {
      const listId = await listsRepo.create({ name: 'Test List', color_id: '#1565C0', icon_id: 'star' });
      await repo.create({ name: 'Section 1', list_id: listId });
      await repo.create({ name: 'Section 2', list_id: listId });

      const count = await repo.countByListId(listId);
      expect(count).toBe(2);
    });

    it('should return 0 for list with no sections', async () => {
      const listId = await listsRepo.create({ name: 'Test List', color_id: '#1565C0', icon_id: 'star' });
      const count = await repo.countByListId(listId);
      expect(count).toBe(0);
    });
  });

  describe('count', () => {
    it('should return total count', async () => {
      const initialCount = await repo.count();
      const listId = await listsRepo.create({ name: 'Test List', color_id: '#1565C0', icon_id: 'star' });
      await repo.create({ name: 'Count Test', list_id: listId });
      const newCount = await repo.count();
      expect(newCount).toBe(initialCount + 1);
    });
  });
});