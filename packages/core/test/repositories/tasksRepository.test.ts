import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../setup.js';
import { TasksRepository, TaskExecutionsRepository, TaskExceptionsRepository } from '../../src/database/repositories/TasksRepository.js';
import ListsRepository from '../../src/database/repositories/ListsRepository.js';
import SectionsRepository from '../../src/database/repositories/SectionsRepository.js';
import type { DBClient } from '../../src/database/index.js';

describe('TasksRepository', () => {
  let db: DBClient;
  let repo: TasksRepository;
  let listsRepo: ListsRepository;
  let sectionsRepo: SectionsRepository;

  beforeEach(async () => {
    db = await createTestDatabase();
    repo = new TasksRepository(db);
    listsRepo = new ListsRepository(db);
    sectionsRepo = new SectionsRepository(db);
  });

  const createListAndSection = async () => {
    const listId = await listsRepo.create({ name: 'Test List', color_id: '#1565C0', icon_id: 'star' });
    const sectionId = await sectionsRepo.create({ name: 'Test Section', list_id: listId });
    return { listId, sectionId };
  };

  describe('create', () => {
    it('should create a new task', async () => {
      const { sectionId } = await createListAndSection();

      const id = await repo.create({
        name: 'My Task',
        body: 'Task body',
        location: 'Some location',
        due_rule: null,
        type: 'by executions',
        objective: 1,
        recurrency: null,
        section_id: sectionId,
      });

      expect(id).toBeDefined();
      const result = await repo.getById(id);
      expect(result?.name).toBe('My Task');
      expect(result?.body).toBe('Task body');
      expect(result?.section_id).toBe(sectionId);
    });
  });

  describe('getAll', () => {
    it('should return all non-deleted tasks', async () => {
      const { sectionId } = await createListAndSection();

      await repo.create({ name: 'Task 1', type: 'by executions', objective: 1, section_id: sectionId });
      await repo.create({ name: 'Task 2', type: 'by executions', objective: 1, section_id: sectionId });

      const results = await repo.getAll();
      expect(results.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getById', () => {
    it('should return task by id', async () => {
      const { sectionId } = await createListAndSection();
      const id = await repo.create({ name: 'Find Me', type: 'by executions', objective: 1, section_id: sectionId });

      const result = await repo.getById(id);
      expect(result?.name).toBe('Find Me');
    });

    it('should return null for non-existent id', async () => {
      const result = await repo.getById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update existing task', async () => {
      const { sectionId } = await createListAndSection();
      const id = await repo.create({ name: 'Original', type: 'by executions', objective: 1, section_id: sectionId });

      await repo.update(id, { name: 'Updated', objective: 5 });

      const result = await repo.getById(id);
      expect(result?.name).toBe('Updated');
      expect(result?.objective).toBe(5);
    });
  });

  describe('delete', () => {
    it('should soft delete a task', async () => {
      const { sectionId } = await createListAndSection();
      const id = await repo.create({ name: 'To Delete', type: 'by executions', objective: 1, section_id: sectionId });

      await repo.delete(id);

      const result = await repo.getById(id);
      expect(result).toBeNull();
    });
  });

  describe('findBySection', () => {
    it('should return tasks by section id', async () => {
      const { sectionId } = await createListAndSection();

      await repo.create({ name: 'Task A', type: 'by executions', objective: 1, section_id: sectionId });
      await repo.create({ name: 'Task B', type: 'by executions', objective: 1, section_id: sectionId });

      const results = await repo.findBySection(sectionId);
      expect(results.length).toBe(2);
    });

    it('should return empty for section with no tasks', async () => {
      const { listId } = await createListAndSection();
      const emptySectionId = await sectionsRepo.create({ name: 'Empty Section', list_id: listId });

      const results = await repo.findBySection(emptySectionId);
      expect(results).toEqual([]);
    });
  });

  describe('findNonRecurrentBySection', () => {
    it('should return non-recurrent tasks', async () => {
      const { sectionId } = await createListAndSection();

      await repo.create({ name: 'Non Recurrent', type: 'by executions', objective: 1, section_id: sectionId, recurrency: null });
      await repo.create({ name: 'Recurrent', type: 'by executions', objective: 1, section_id: sectionId, recurrency: 'FREQ=DAILY' });

      const results = await repo.findNonRecurrentBySection(sectionId);
      expect(results.length).toBe(1);
      expect(results[0]?.name).toBe('Non Recurrent');
    });
  });

  describe('findRecurrentBySection', () => {
    it('should return recurrent tasks', async () => {
      const { sectionId } = await createListAndSection();

      await repo.create({ name: 'Non Recurrent', type: 'by executions', objective: 1, section_id: sectionId, recurrency: null });
      await repo.create({ name: 'Recurrent', type: 'by executions', objective: 1, section_id: sectionId, recurrency: 'FREQ=DAILY' });

      const results = await repo.findRecurrentBySection(sectionId);
      expect(results.length).toBe(1);
      expect(results[0]?.name).toBe('Recurrent');
    });
  });

  describe('count', () => {
    it('should return total count', async () => {
      const initialCount = await repo.count();
      const { sectionId } = await createListAndSection();

      await repo.create({ name: 'Count Test', type: 'by executions', objective: 1, section_id: sectionId });

      const newCount = await repo.count();
      expect(newCount).toBe(initialCount + 1);
    });
  });
});

describe('TaskExecutionsRepository', () => {
  let db: DBClient;
  let repo: TaskExecutionsRepository;
  let tasksRepo: TasksRepository;
  let listsRepo: ListsRepository;
  let sectionsRepo: SectionsRepository;

  beforeEach(async () => {
    db = await createTestDatabase();
    repo = new TaskExecutionsRepository(db);
    tasksRepo = new TasksRepository(db);
    listsRepo = new ListsRepository(db);
    sectionsRepo = new SectionsRepository(db);
  });

  const createTask = async () => {
    const listId = await listsRepo.create({ name: 'Test List', color_id: '#1565C0', icon_id: 'star' });
    const sectionId = await sectionsRepo.create({ name: 'Test Section', list_id: listId });
    return await tasksRepo.create({ name: 'Test Task', type: 'by executions', objective: 1, section_id: sectionId });
  };

  describe('create', () => {
    it('should create a new task execution', async () => {
      const taskId = await createTask();

      const id = await repo.create({
        ocurrence_date: null,
        start_time: new Date(),
        end_time: null,
        task_id: taskId,
      });

      expect(id).toBeDefined();
      const result = await repo.getById(id);
      expect(result?.task_id).toBe(taskId);
    });
  });

  describe('getAll', () => {
    it('should return all non-deleted executions', async () => {
      const taskId = await createTask();
      await repo.create({ ocurrence_date: null, start_time: new Date(), end_time: null, task_id: taskId });
      await repo.create({ ocurrence_date: null, start_time: new Date(), end_time: null, task_id: taskId });

      const results = await repo.getAll();
      expect(results.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getById', () => {
    it('should return execution by id', async () => {
      const taskId = await createTask();
      const id = await repo.create({ ocurrence_date: null, start_time: new Date(), end_time: null, task_id: taskId });

      const result = await repo.getById(id);
      expect(result?.task_id).toBe(taskId);
    });
  });

  describe('update', () => {
    it('should update existing execution', async () => {
      const taskId = await createTask();
      const id = await repo.create({ ocurrence_date: null, start_time: new Date(), end_time: null, task_id: taskId });

      await repo.update(id, { end_time: new Date() });

      const result = await repo.getById(id);
      expect(result?.end_time).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should soft delete an execution', async () => {
      const taskId = await createTask();
      const id = await repo.create({ ocurrence_date: null, start_time: new Date(), end_time: null, task_id: taskId });

      await repo.delete(id);

      const result = await repo.getById(id);
      expect(result).toBeNull();
    });
  });

  describe('findByTaskWithoutOccurrence', () => {
    it('should return executions without occurrence date', async () => {
      const taskId = await createTask();

      await repo.create({ ocurrence_date: null, start_time: new Date(), end_time: null, task_id: taskId });

      const results = await repo.findByTaskWithoutOccurrence(taskId);
      expect(results.length).toBe(1);
    });

    it('should exclude executions with occurrence date', async () => {
      const taskId = await createTask();

      await repo.create({ ocurrence_date: new Date(), start_time: new Date(), end_time: null, task_id: taskId });

      const results = await repo.findByTaskWithoutOccurrence(taskId);
      expect(results).toEqual([]);
    });
  });

  describe('count', () => {
    it('should return total count', async () => {
      const initialCount = await repo.count();
      const taskId = await createTask();

      await repo.create({ ocurrence_date: null, start_time: new Date(), end_time: null, task_id: taskId });

      const newCount = await repo.count();
      expect(newCount).toBe(initialCount + 1);
    });
  });
});

describe('TaskExceptionsRepository', () => {
  let db: DBClient;
  let repo: TaskExceptionsRepository;
  let tasksRepo: TasksRepository;
  let listsRepo: ListsRepository;
  let sectionsRepo: SectionsRepository;

  beforeEach(async () => {
    db = await createTestDatabase();
    repo = new TaskExceptionsRepository(db);
    tasksRepo = new TasksRepository(db);
    listsRepo = new ListsRepository(db);
    sectionsRepo = new SectionsRepository(db);
  });

  const createTask = async () => {
    const listId = await listsRepo.create({ name: 'Test List', color_id: '#1565C0', icon_id: 'star' });
    const sectionId = await sectionsRepo.create({ name: 'Test Section', list_id: listId });
    return await tasksRepo.create({ name: 'Test Task', type: 'by executions', objective: 1, section_id: sectionId });
  };

  describe('create', () => {
    it('should create a new task exception', async () => {
      const taskId = await createTask();
      const ocurrenceDate = new Date();

      const id = await repo.create({
        task_id: taskId,
        ocurrence_date: ocurrenceDate,
        rescheduled_due: null,
        override_body: null,
        override_location: null,
        override_type: null,
        override_objective: null,
      } as any);

      expect(id).toBeDefined();
    });
  });

  describe('findByTaskAndOccurrence', () => {
    it('should find exception by task and occurrence date', async () => {
      const taskId = await createTask();
      const ocurrenceDate = new Date();

      await repo.create({
        task_id: taskId,
        ocurrence_date: ocurrenceDate,
        override_body: 'Override body',
      } as any);

      const result = await repo.findByTaskAndOccurrence(taskId, ocurrenceDate);
      expect(result).not.toBeNull();
      expect(result?.override_body).toBe('Override body');
    });

    it('should return null when not found', async () => {
      const taskId = await createTask();
      const ocurrenceDate = new Date();

      const result = await repo.findByTaskAndOccurrence(taskId, ocurrenceDate);
      expect(result).toBeNull();
    });
  });

  describe('upsert', () => {
    it('should create exception when not exists', async () => {
      const taskId = await createTask();
      const ocurrenceDate = new Date();

      const id = await repo.upsert(taskId, ocurrenceDate, { override_body: 'New override' });
      expect(id).toBeDefined();

      const result = await repo.findByTaskAndOccurrence(taskId, ocurrenceDate);
      expect(result?.override_body).toBe('New override');
    });

    it('should update exception when exists', async () => {
      const taskId = await createTask();
      const ocurrenceDate = new Date();

      await repo.upsert(taskId, ocurrenceDate, { override_body: 'Original' });
      await repo.upsert(taskId, ocurrenceDate, { override_body: 'Updated' });

      const result = await repo.findByTaskAndOccurrence(taskId, ocurrenceDate);
      expect(result?.override_body).toBe('Updated');
    });
  });

  describe('update', () => {
    it('should update existing exception', async () => {
      const taskId = await createTask();
      const ocurrenceDate = new Date();

      const id = await repo.create({
        task_id: taskId,
        ocurrence_date: ocurrenceDate,
        override_body: 'Original',
      } as any);

      await repo.update(id, { override_body: 'Updated' });

      const result = await repo.getById(id);
      expect(result?.override_body).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should soft delete an exception', async () => {
      const taskId = await createTask();
      const ocurrenceDate = new Date();

      const id = await repo.create({
        task_id: taskId,
        ocurrence_date: ocurrenceDate,
      } as any);

      await repo.delete(id);

      const result = await repo.getById(id);
      expect(result).toBeNull();
    });
  });

  describe('count', () => {
    it('should return total count', async () => {
      const initialCount = await repo.count();
      const taskId = await createTask();
      const ocurrenceDate = new Date();

      await repo.create({
        task_id: taskId,
        ocurrence_date: ocurrenceDate,
      } as any);

      const newCount = await repo.count();
      expect(newCount).toBe(initialCount + 1);
    });
  });
});