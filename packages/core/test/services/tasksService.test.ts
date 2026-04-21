import { describe, it, expect, beforeEach } from "vitest";
import { createTestDatabase } from "../setup.js";
import TasksService from "../../src/services/TasksService.js";
import {
  TasksRepository,
  TaskExecutionsRepository,
  TaskExceptionsRepository,
} from "../../src/database/repositories/TasksRepository.js";
import ListsRepository from "../../src/database/repositories/ListsRepository.js";
import SectionsRepository from "../../src/database/repositories/SectionsRepository.js";
import type { DBClient } from "../../src/database/index.js";

describe("TasksService", () => {
  let db: DBClient;
  let tasksRepo: TasksRepository;
  let executionsRepo: TaskExecutionsRepository;
  let exceptionsRepo: TaskExceptionsRepository;
  let listsRepo: ListsRepository;
  let sectionsRepo: SectionsRepository;
  let service: TasksService;

  beforeEach(async () => {
    db = await createTestDatabase();
    tasksRepo = new TasksRepository(db);
    executionsRepo = new TaskExecutionsRepository(db);
    exceptionsRepo = new TaskExceptionsRepository(db);
    listsRepo = new ListsRepository(db);
    sectionsRepo = new SectionsRepository(db);
    service = new TasksService(tasksRepo, executionsRepo, exceptionsRepo);
  });

  const createListAndSection = async () => {
    const listId = await listsRepo.create({
      name: "Test List",
      color_id: "#1565C0",
      icon_id: "star",
    });
    const sectionId = await sectionsRepo.create({
      name: "Test Section",
      list_id: listId,
    });
    return { listId, sectionId };
  };

  const createTask = async (
    sectionId: string,
    name: string,
    type: "by time" | "by executions" | "note" = "by executions",
    recurrency: string | null = null,
  ) => {
    return await service.create({
      name,
      body: null,
      location: null,
      due_rule: null,
      type,
      objective: 1,
      recurrency,
      section_id: sectionId,
    });
  };

  describe("isRecurrent", () => {
    it("should return true for task with recurrency", () => {
      expect(service.isRecurrent({ recurrency: "FREQ=DAILY" })).toBe(true);
    });

    it("should return false for task without recurrency", () => {
      expect(service.isRecurrent({ recurrency: null })).toBe(false);
    });

    it("should return false for undefined recurrency", () => {
      expect(service.isRecurrent({})).toBe(false);
    });
  });

  describe("create", () => {
    it("should create a new task", async () => {
      const { sectionId } = await createListAndSection();

      const id = await service.create({
        name: "My Task",
        body: null,
        location: null,
        due_rule: null,
        type: "by executions",
        objective: 1,
        recurrency: null,
        section_id: sectionId,
      });

      expect(id).toBeDefined();
      const result = await service.getById(id, []);
      expect(result?.name).toBe("My Task");
    });

    it("should create a recurrent task", async () => {
      const { sectionId } = await createListAndSection();

      const id = await service.create({
        name: "Recurrent Task",
        body: null,
        location: null,
        due_rule: null,
        type: "by executions",
        objective: 1,
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      });

      const result = await service.getById(id, []);
      expect(result?.recurrency).toContain("FREQ=DAILY");
    });
  });

  describe("update", () => {
    it("should update existing task", async () => {
      const { sectionId } = await createListAndSection();
      const id = await createTask(sectionId, "Original");

      await service.update(id, { name: "Updated" } as any);

      const result = await service.getById(id, []);
      expect(result?.name).toBe("Updated");
    });

    it("should throw error for non-existent task", async () => {
      await expect(
        service.update("non-existent", { name: "Test" } as any),
      ).rejects.toThrow("Task not found");
    });
  });

  describe("delete", () => {
    it("should soft delete a task", async () => {
      const { sectionId } = await createListAndSection();
      const id = await createTask(sectionId, "To Delete");

      await service.delete(id);

      const result = await service.getById(id, []);
      expect(result).toBeNull();
    });

    it("should throw error for non-existent task", async () => {
      await expect(service.delete("non-existent")).rejects.toThrow(
        "Task not found",
      );
    });
  });

  describe("startExecution", () => {
    it("should start an execution", async () => {
      const { sectionId } = await createListAndSection();
      const taskId = await createTask(sectionId, "Task with execution");

      const executionId = await service.startExecution(taskId);

      expect(executionId).toBeDefined();
    });

    it("should throw error for non-existent task", async () => {
      await expect(service.startExecution("non-existent")).rejects.toThrow(
        "Task not found",
      );
    });

    it("should start execution with occurrence date for recurrent task", async () => {
      const { sectionId } = await createListAndSection();
      const taskId = await createTask(
        sectionId,
        "Recurrent Task",
        "by executions",
        "FREQ=DAILY",
      );
      const occurrenceDate = new Date();

      const executionId = await service.startExecution(taskId, occurrenceDate);

      expect(executionId).toBeDefined();
    });
  });

  describe("stopExecution", () => {
    it("should stop an execution", async () => {
      const { sectionId } = await createListAndSection();
      const taskId = await createTask(sectionId, "Task to stop");

      const executionId = await service.startExecution(taskId);
      await service.stopExecution(executionId);

      const executions = await service.getExecutionsByTaskAndDate(taskId, null);
      expect(executions[0]?.end_time).toBeDefined();
    });
  });

  describe("getExecutionsByTaskAndDate", () => {
    it("should return executions for a task", async () => {
      const { sectionId } = await createListAndSection();
      const taskId = await createTask(sectionId, "Task");

      await service.startExecution(taskId);

      const executions = await service.getExecutionsByTaskAndDate(taskId, null);
      expect(executions.length).toBe(1);
    });

    it("should require occurrence date for recurrent task", async () => {
      const { sectionId } = await createListAndSection();
      const taskId = await createTask(
        sectionId,
        "Recurrent",
        "by executions",
        "FREQ=DAILY",
      );

      await expect(
        service.getExecutionsByTaskAndDate(taskId, null),
      ).rejects.toThrow("An occurrence date is necessary");
    });
  });

  describe("getTasksBySection", () => {
    it("should return tasks by section with progress", async () => {
      const { sectionId } = await createListAndSection();
      await createTask(sectionId, "Task 1");
      await createTask(sectionId, "Task 2");

      const results = await service.getTasksBySection(sectionId);
      expect(results.length).toBe(2);
    });

    it("should filter completed tasks when onlyCompleted=true", async () => {
      const { sectionId } = await createListAndSection();
      await createTask(sectionId, "Task");

      const results = await service.getTasksBySection(sectionId, true);
      expect(results.length).toBe(0);
    });
  });

  describe("getTasksByDateRange", () => {
    it("should return tasks in date range", async () => {
      const { sectionId } = await createListAndSection();
      await createTask(sectionId, "Task in range");

      const startDate = new Date("2020-01-01");
      const endDate = new Date("2030-12-31");

      const results = await service.getTasksByDateRange(startDate, endDate);
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getTaskOccurrence", () => {
    it("should return task occurrence detail", async () => {
      const { sectionId } = await createListAndSection();
      const taskId = await createTask(sectionId, "Test Task", "by executions");

      const result = await service.getTaskOccurrence(taskId, null);
      expect(result?.name).toBe("Test Task");
      expect(result?.type).toBe("by executions");
    });

    it("should throw error for recurrent task without occurrence date", async () => {
      const { sectionId } = await createListAndSection();
      const taskId = await createTask(
        sectionId,
        "Recurrent",
        "by executions",
        "FREQ=DAILY",
      );

      await expect(service.getTaskOccurrence(taskId, null)).rejects.toThrow(
        "You need to specify a ocurrence date for recurrent task",
      );
    });

    it("should throw error for non-existent task", async () => {
      await expect(
        service.getTaskOccurrence("non-existent", null),
      ).rejects.toThrow("Task not found");
    });
  });

  describe("calculateDueDate", () => {
    it("should calculate due date from relative due rule", () => {
      const dueDate = service.calculateDueDate(
        "+1d 10:00:00",
        new Date("2024-01-01T00:00:00Z"),
      );
      expect(dueDate).toBeInstanceOf(Date);
    });
  });
});

