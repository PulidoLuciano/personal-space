import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../setup.js';
import FinancesRepository from '../../src/database/repositories/FinancesRepository.js';
import ProjectsRepository from '../../src/database/repositories/ProjectsRepository.js';
import type { DBClient } from '../../src/database/index.js';

describe('FinancesRepository', () => {
  let db: DBClient;
  let repo: FinancesRepository;
  let projectsRepo: ProjectsRepository;

  beforeEach(async () => {
    db = await createTestDatabase();
    repo = new FinancesRepository(db);
    projectsRepo = new ProjectsRepository(db);
  });

  const createProject = async () => {
    return await projectsRepo.create({
      name: 'Test Project',
      icon_id: 'star',
      color_id: '#1565C0',
      is_archived: 0,
      show_completed: 1,
    });
  };

  const createFinance = async (projectId: string, title: string, amount: number) => {
    return await repo.createFinance({
      title,
      description: null,
      amount,
      is_favorite: false,
      project_id: projectId,
      currency_id: 'USD',
    });
  };

  describe('createFinance', () => {
    it('should create a new finance', async () => {
      const projectId = await createProject();

      const id = await repo.createFinance({
        title: 'My Finance',
        description: 'Description',
        amount: 100.50,
        is_favorite: false,
        project_id: projectId,
        currency_id: 'USD',
      });

      expect(id).toBeDefined();
      const result = await repo.getById(id);
      expect(result?.title).toBe('My Finance');
      expect(result?.amount).toBe(100.50);
      expect(result?.currency_id).toBe('USD');
    });
  });

  describe('getAll', () => {
    it('should return all non-deleted finances', async () => {
      const projectId = await createProject();

      await createFinance(projectId, 'Finance 1', 100);
      await createFinance(projectId, 'Finance 2', 200);

      const results = await repo.getAll();
      expect(results.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getById', () => {
    it('should return finance by id', async () => {
      const projectId = await createProject();
      const id = await createFinance(projectId, 'Find Me', 150);

      const result = await repo.getById(id);
      expect(result?.title).toBe('Find Me');
    });

    it('should return null for non-existent id', async () => {
      const result = await repo.getById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update existing finance', async () => {
      const projectId = await createProject();
      const id = await createFinance(projectId, 'Original', 100);

      await repo.update(id, { title: 'Updated', amount: 200 });

      const result = await repo.getById(id);
      expect(result?.title).toBe('Updated');
      expect(result?.amount).toBe(200);
    });
  });

  describe('delete', () => {
    it('should soft delete a finance', async () => {
      const projectId = await createProject();
      const id = await createFinance(projectId, 'To Delete', 100);

      await repo.delete(id);

      const result = await repo.getById(id);
      expect(result).toBeNull();
    });
  });

  describe('searchFinancesByProjectPaginated', () => {
    it('should return finances by project paginated', async () => {
      const projectId = await createProject();

      await createFinance(projectId, 'Finance A', 100);
      await createFinance(projectId, 'Finance B', 200);

      const results = await repo.searchFinancesByProjectPaginated(1, 10, projectId);
      expect(results.length).toBe(2);
    });

    it('should filter by favorite', async () => {
      const projectId = await createProject();

      const favId = await createFinance(projectId, 'Favorite', 100);
      await repo.toggleFavorite(favId, true);

      await createFinance(projectId, 'Not Favorite', 200);

      const results = await repo.searchFinancesByProjectPaginated(1, 10, projectId, 1);
      expect(results.length).toBe(1);
      expect(results[0]?.title).toBe('Favorite');
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status', async () => {
      const projectId = await createProject();
      const id = await createFinance(projectId, 'Toggle Me', 100);

      await repo.toggleFavorite(id, true);
      let result = await repo.getById(id);
      expect(result?.is_favorite).toBe(1);

      await repo.toggleFavorite(id, false);
      result = await repo.getById(id);
      expect(result?.is_favorite).toBe(0);
    });
  });

  describe('getFinanceById', () => {
    it('should return finance with currency details', async () => {
      const projectId = await createProject();

      const id = await repo.createFinance({
        title: 'With Currency',
        description: 'Test description',
        amount: 250,
        is_favorite: false,
        project_id: projectId,
        currency_id: 'USD',
      });

      const result = await repo.getFinanceById(id);
      expect(result).not.toBeNull();
      expect(result?.title).toBe('With Currency');
      expect(result?.description).toBe('Test description');
      expect(result?.currency.name).toBe('USD');
      expect(result?.currency.symbol).toBe('$');
    });

    it('should return null for non-existent finance', async () => {
      const result = await repo.getFinanceById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('createExecutionByFinanceId', () => {
    it('should create an execution', async () => {
      const projectId = await createProject();
      const financeId = await createFinance(projectId, 'With Executions', 100);

      await repo.createExecutionByFinanceId(financeId, 50, 'USD');

      const executions = await repo.getExecutionsByFinancePaginated(1, 10, financeId);
      expect(executions.length).toBe(1);
      expect(executions[0]?.amount).toBe(50);
    });

    it('should use default amount if not provided', async () => {
      const projectId = await createProject();
      const financeId = await createFinance(projectId, 'With Default Execution', 75);

      await repo.createExecutionByFinanceId(financeId, null, null);

      const executions = await repo.getExecutionsByFinancePaginated(1, 10, financeId);
      expect(executions[0]?.amount).toBe(75);
    });
  });

  describe('getSumExecutionsByProjectAndCurrency', () => {
    it('should return sum of executions', async () => {
      const projectId = await createProject();
      const financeId = await createFinance(projectId, 'Sum Test', 100);

      await repo.createExecutionByFinanceId(financeId, 50, 'USD');
      await repo.createExecutionByFinanceId(financeId, 30, 'USD');

      const total = await repo.getSumExecutionsByProjectAndCurrency(projectId, 'USD');
      expect(total).toBe(80);
    });

    it('should return 0 when no executions', async () => {
      const projectId = await createProject();

      const total = await repo.getSumExecutionsByProjectAndCurrency(projectId, 'USD');
      expect(total).toBe(0);
    });
  });

  describe('getExecutionsByProjectPaginated', () => {
    it('should return executions by project paginated', async () => {
      const projectId = await createProject();
      const financeId = await createFinance(projectId, 'Execution Test', 100);

      await repo.createExecutionByFinanceId(financeId, 50, 'USD');

      const results = await repo.getExecutionsByProjectPaginated(1, 10, projectId);
      expect(results.length).toBe(1);
      expect(results[0]?.finance_title).toBe('Execution Test');
    });
  });

  describe('getExecutionsByFinancePaginated', () => {
    it('should return executions by finance paginated', async () => {
      const projectId = await createProject();
      const financeId = await createFinance(projectId, 'Finance Exec', 100);

      await repo.createExecutionByFinanceId(financeId, 25, 'USD');
      await repo.createExecutionByFinanceId(financeId, 35, 'USD');

      const results = await repo.getExecutionsByFinancePaginated(1, 10, financeId);
      expect(results.length).toBe(2);
    });
  });

  describe('count', () => {
    it('should return total count', async () => {
      const initialCount = await repo.count();
      const projectId = await createProject();

      await createFinance(projectId, 'Count Test', 100);

      const newCount = await repo.count();
      expect(newCount).toBe(initialCount + 1);
    });
  });
});