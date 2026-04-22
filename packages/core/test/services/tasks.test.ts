import { describe, it, expect, beforeEach } from "vitest";
import { createTestDatabase } from "../setup.js";
import TasksService from "../../src/services/TasksService.js";
import ListsService from "../../src/services/ListsService.js";
import SectionsService from "../../src/services/SectionsService.js";
import ListsRepository from "../../src/database/repositories/ListsRepository.js";
import SectionsRepository from "../../src/database/repositories/SectionsRepository.js";
import {
  TasksRepository,
  TaskExecutionsRepository,
  TaskExceptionsRepository,
} from "../../src/database/repositories/TasksRepository.js";
import type { DBClient } from "../../src/database/index.js";

describe("TasksService", () => {
  let db: DBClient;
  let listsRepo: ListsRepository;
  let sectionsRepo: SectionsRepository;
  let sectionsService: SectionsService;
  let listsService: ListsService;
  let tasksRepo: TasksRepository;
  let taskExecutionsRepo: TaskExecutionsRepository;
  let taskExceptionsRepo: TaskExceptionsRepository;
  let tasksService: TasksService;
  let sectionId: string;

  beforeEach(async () => {
    db = await createTestDatabase();
    listsRepo = new ListsRepository(db);
    sectionsRepo = new SectionsRepository(db);
    sectionsService = new SectionsService(sectionsRepo);
    listsService = new ListsService(listsRepo, sectionsService);
    tasksRepo = new TasksRepository(db);
    taskExecutionsRepo = new TaskExecutionsRepository(db);
    taskExceptionsRepo = new TaskExceptionsRepository(db);
    tasksService = new TasksService(tasksRepo, taskExecutionsRepo, taskExceptionsRepo);

    const listId = await listsService.create({
      name: "Test List",
      color_id: "#1565C0",
      icon_id: "star",
    });
    const sections = await sectionsService.getByListId(listId);
    sectionId = sections[0]?.id ?? "";
  });

  describe("create", () => {
    it("should create a simple task with name, body and location", async () => {
      const id = await tasksService.create({
        name: "Test Task",
        body: "Test body",
        location: "Test location",
        section_id: sectionId,
      });

      expect(id).toBeDefined();

      const task = await tasksService.getById(id);
      expect(task?.name).toBe("Test Task");
      expect(task?.body).toBe("Test body");
      expect(task?.location).toBe("Test location");
      expect(task?.type).toBe("by executions");
      expect(task?.objective).toBe(1);
      expect(task?.recurrency).toBeNull();
      expect(task?.due_rule).toBeNull();
    });

    it("should throw error when creating task with empty name", async () => {
      await expect(
        tasksService.create({
          name: "",
          section_id: sectionId,
        }),
      ).rejects.toThrow("cannot be empty");
    });

    it("should throw error when creating task with null name", async () => {
      await expect(
        tasksService.create({
          name: "",
          section_id: sectionId,
        }),
      ).rejects.toThrow("cannot be empty");
    });

    it("should create a task with type note", async () => {
      const id = await tasksService.create({
        name: "Note Task",
        type: "note",
        section_id: sectionId,
      });

      const task = await tasksService.getById(id);
      expect(task?.type).toBe("note");
    });

    it("should create a task with type by time", async () => {
      const id = await tasksService.create({
        name: "Time Task",
        type: "by time",
        section_id: sectionId,
      });

      const task = await tasksService.getById(id);
      expect(task?.type).toBe("by time");
    });

    it("should throw error when creating task with invalid type", async () => {
      await expect(
        tasksService.create({
          name: "Invalid Type Task",
          type: "invalid" as "by executions",
          section_id: sectionId,
        }),
      ).rejects.toThrow("Invalid option");
    });

    it("should create a task with fixed due rule", async () => {
      const fixedDate = "2026-12-31";
      const id = await tasksService.create({
        name: "Fixed Due Task",
        due_rule: fixedDate,
        section_id: sectionId,
      });

      const task = await tasksService.getById(id);
      expect(task?.due_rule).toContain("2026-12-31");
    });

    it("should create a task with relative due rule and calculate the date", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const expectedDateStr = tomorrow.toISOString().split("T")[0];

      const id = await tasksService.create({
        name: "Relative Due Task",
        due_rule: "+1d 00:00:00",
        section_id: sectionId,
      });

      const task = await tasksService.getById(id);
      expect(task?.due_rule).toContain(expectedDateStr);
    });
  });
});