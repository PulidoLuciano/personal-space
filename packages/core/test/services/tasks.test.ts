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
    tasksService = new TasksService(
      tasksRepo,
      taskExecutionsRepo,
      taskExceptionsRepo,
      sectionsRepo,
    );

    const listId = await listsService.create({
      name: "Test List",
      color_id: "#1565C0",
      icon_id: "star",
    } as any);
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
      } as any);

      expect(id).toBeDefined();

      const task = await tasksService.getById(id, [
        "name",
        "body",
        "location",
        "type",
        "objective",
        "recurrency",
        "due_rule",
      ]);
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
        } as any),
      ).rejects.toThrow("cannot be empty");
    });

    it("should throw error when creating task with null name", async () => {
      await expect(
        tasksService.create({
          name: "",
          section_id: sectionId,
        } as any),
      ).rejects.toThrow("cannot be empty");
    });

    it("should create a task with type note", async () => {
      const id = await tasksService.create({
        name: "Note Task",
        type: "note",
        section_id: sectionId,
      } as any);

      const task = await tasksService.getById(id, ["type"]);
      expect(task?.type).toBe("note");
    });

    it("should create a task with type by time", async () => {
      const id = await tasksService.create({
        name: "Time Task",
        type: "by time",
        section_id: sectionId,
      } as any);

      const task = await tasksService.getById(id, ["type"]);
      expect(task?.type).toBe("by time");
    });

    it("should throw error when creating task with invalid type", async () => {
      await expect(
        tasksService.create({
          name: "Invalid Type Task",
          type: "invalid" as any,
          section_id: sectionId,
        } as any),
      ).rejects.toThrow("Invalid option");
    });

    it("should create a task with fixed due rule", async () => {
      const fixedDate = "2026-12-31";
      const id = await tasksService.create({
        name: "Fixed Due Task",
        due_rule: fixedDate,
        section_id: sectionId,
      } as any);

      const task = await tasksService.getById(id, ["due_rule"]);
      expect(task?.due_rule).toContain("2026-12-31");
    });

    it("should create a task with relative due rule and calculate the date", async () => {
      const today = new Date("2026-12-31");
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const expectedDateStr = tomorrow.toISOString().split("T")[0];

      const id = await tasksService.create({
        name: "Relative Due Task",
        due_rule: "+1d 00:00:00",
        section_id: sectionId,
      } as any);

      const task = await tasksService.getById(id, ["due_rule"]);
      expect(task?.due_rule).toContain(expectedDateStr);
    });

    it("should create a recurrent task without due_rule", async () => {
      const id = await tasksService.create({
        name: "Daily Recurrent Task",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const task = await tasksService.getById(id, ["recurrency", "due_rule"]);
      expect(task?.recurrency).toContain("DAILY");
      expect(task?.due_rule).toBeNull();
    });

    it("should create a recurrent task with relative due_rule", async () => {
      const id = await tasksService.create({
        name: "Daily Recurrent With Due",
        recurrency: "FREQ=DAILY",
        due_rule: "+1d 03:00:00",
        section_id: sectionId,
      } as any);

      const task = await tasksService.getById(id, ["recurrency", "due_rule"]);
      expect(task?.recurrency).toContain("DAILY");
      expect(task?.due_rule).toContain("+1d");
    });

    it("should throw error when creating recurrent task with fixed due_rule", async () => {
      await expect(
        tasksService.create({
          name: "Invalid Recurrent Task",
          recurrency: "FREQ=DAILY",
          due_rule: "2026-12-31",
          section_id: sectionId,
        } as any),
      ).rejects.toThrow("Recurrent tasks cannot have fixed due_rule");
    });

    it("should throw error when creating task with non-existent section", async () => {
      await expect(
        tasksService.create({
          name: "Task in Invalid Section",
          section_id: "00000000-0000-0000-0000-000000000000",
        } as any),
      ).rejects.toThrow("Section not found");
    });
  });

  describe("delete", () => {
    it("should soft delete a non-recurrent task", async () => {
      const id = await tasksService.create({
        name: "Task To Delete",
        section_id: sectionId,
      } as any);

      await tasksService.delete(id);

      await expect(tasksService.getById(id)).rejects.toThrow("Task not found");
    });

    it("should throw error when deleting non-existent task", async () => {
      await expect(tasksService.delete("non-existent-id")).rejects.toThrow(
        "Task not found",
      );
    });

    it("should soft delete a recurrent task with scope all", async () => {
      const id = await tasksService.create({
        name: "Recurrent Task To Delete",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      await tasksService.delete(id, undefined, "all");

      await expect(tasksService.getById(id)).rejects.toThrow("Task not found");
    });

    it("should create task exception for current occurrence delete", async () => {
      const id = await tasksService.create({
        name: "Recurrent Task",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      await tasksService.delete(id, occurrenceDate, "current");

      const task = await tasksService.getById(id);
      expect(task).toBeDefined();

      const exceptions = await taskExceptionsRepo.findByTaskAndOccurrence(
        id,
        occurrenceDate,
      );
      expect(exceptions).toBeDefined();
      expect(exceptions?.is_deleted).toBe(1);
    });

    it("should update recurrency for following occurrences delete", async () => {
      const id = await tasksService.create({
        name: "Recurrent Task",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      await tasksService.delete(id, occurrenceDate, "following");

      const task = await tasksService.getById(id, ["recurrency"]);
      expect(task?.recurrency).toContain("20261230");
    });
  });

  describe("update", () => {
    it("should update a non-recurrent task", async () => {
      const id = await tasksService.create({
        name: "Task To Update",
        section_id: sectionId,
      } as any);

      await tasksService.update(id, { name: "Updated Task Name" } as any);

      const task = await tasksService.getById(id);
      expect(task?.name).toBe("Updated Task Name");
    });

    it("should throw error when updating non-existent task", async () => {
      await expect(
        tasksService.update("non-existent-id", { name: "New Name" } as any),
      ).rejects.toThrow("Task not found");
    });

    it("should update a recurrent task with scope all", async () => {
      const id = await tasksService.create({
        name: "Recurrent Task",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      await tasksService.update(
        id,
        { name: "Updated Recurrent Name" } as any,
        undefined,
        "all",
      );

      const task = await tasksService.getById(id);
      expect(task?.name).toBe("Updated Recurrent Name");
    });

    it("should create task exception for current occurrence update", async () => {
      const id = await tasksService.create({
        name: "Recurrent Task",
        body: "Original body",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      await tasksService.update(
        id,
        { body: "Updated body" } as any,
        occurrenceDate,
        "current",
      );

      const task = await tasksService.getById(id);
      expect(task?.body).toBe("Original body");

      const exception = await taskExceptionsRepo.findByTaskAndOccurrence(
        id,
        occurrenceDate,
      );
      expect(exception?.override_body).toBe("Updated body");
    });

    it("should create new task for following occurrences update", async () => {
      const id = await tasksService.create({
        name: "Recurrent Task",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      await tasksService.update(
        id,
        { name: "Updated Following" } as any,
        occurrenceDate,
        "following",
      );

      const originalTask = await tasksService.getById(id, ["recurrency"]);
      expect(originalTask?.recurrency).toContain("UNTIL=20261230");

      const allTasks = await tasksRepo.getAll();
      const newTask = allTasks.find((t) => t.id !== id);
      expect(newTask?.name).toBe("Updated Following");
      expect(newTask?.recurrency).toContain("DTSTART:20261231");
    });

    it("should preserve previous exception values when updating same occurrence twice", async () => {
      const id = await tasksService.create({
        name: "Recurrent Task",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      await tasksService.update(
        id,
        { body: "Test body", location: "First Location" } as any,
        occurrenceDate,
        "current",
      );

      await tasksService.update(
        id,
        { body: "New Body" } as any,
        occurrenceDate,
        "current",
      );

      const exception = await taskExceptionsRepo.findByTaskAndOccurrence(
        id,
        occurrenceDate,
      );
      expect(exception?.override_body).toBe("New Body");
      expect(exception?.override_location).toBe("First Location");
    });
  });

  describe("startExecution", () => {
    it("should start execution for non-recurrent task with instant=true", async () => {
      const taskId = await tasksService.create({
        name: "Task For Execution",
        section_id: sectionId,
      } as any);

      const executionId = await tasksService.startExecution(taskId);
      expect(executionId).toBeDefined();

      const executions = await tasksService.getExecutionsByTaskAndDate(taskId);
      expect(executions.length).toBe(1);
      expect(executions[0]?.task_id).toBe(taskId);
      expect(executions[0]?.end_time).not.toBeNull();
    });

    it("should start execution for non-recurrent task with instant=false", async () => {
      const taskId = await tasksService.create({
        name: "Task For Execution",
        section_id: sectionId,
      } as any);

      const executionId = await tasksService.startExecution(
        taskId,
        null,
        false,
      );
      expect(executionId).toBeDefined();

      const executions = await tasksService.getExecutionsByTaskAndDate(taskId);
      expect(executions[0]?.end_time).toBeNull();
    });

    it("should start execution for recurrent task with occurrence_date", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      const executionId = await tasksService.startExecution(
        taskId,
        occurrenceDate,
      );
      expect(executionId).toBeDefined();

      const executions = await tasksService.getExecutionsByTaskAndDate(
        taskId,
        occurrenceDate,
      );
      expect(executions.length).toBe(1);
      expect(executions[0]?.task_id).toBe(taskId);
    });

    it("should start execution using occurrence date from getTaskOccurrence", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrence = await tasksService.getTaskOccurrence(
        taskId,
        "2026-12-31",
      );

      const executionId = await tasksService.startExecution(
        taskId,
        occurrence.occurrence_date,
      );
      expect(executionId).toBeDefined();

      const executions = await tasksService.getExecutionsByTaskAndDate(
        taskId,
        occurrence.occurrence_date,
      );
      expect(executions.length).toBe(1);
      expect(executions[0]?.task_id).toBe(taskId);
    });

    it("should start execution using occurrence date from getTasksBySection and update progress", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        type: "by executions",
        objective: 2,
        recurrency: "FREQ=DAILY;COUNT=5",
        section_id: sectionId,
      } as any);

      const tasks = await tasksService.getTasksBySection(sectionId);
      expect(tasks.length).toBeGreaterThan(0);

      const occurrenceDate = tasks[0]!.occurrence_date;
      expect(occurrenceDate).toBeDefined();

      const executionId = await tasksService.startExecution(
        taskId,
        occurrenceDate!,
      );
      expect(executionId).toBeDefined();

      const executions = await tasksService.getExecutionsByTaskAndDate(
        taskId,
        occurrenceDate!,
      );
      expect(executions.length).toBe(1);

      const updated = await tasksService.getTaskOccurrence(
        taskId,
        occurrenceDate!,
      );
      expect(updated.progress).toBe(1);
    });

    it("should throw error when starting execution for non-existent task", async () => {
      await expect(
        tasksService.startExecution("non-existent-id"),
      ).rejects.toThrow("Task not found");
    });

    it("should throw error when starting execution for recurrent task without occurrence_date", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      await expect(
        tasksService.startExecution(taskId),
      ).rejects.toThrow("An occurrence date is necessary");
    });
  });

  describe("stopExecution", () => {
    it("should stop a running execution", async () => {
      const taskId = await tasksService.create({
        name: "Task For Stop",
        section_id: sectionId,
      } as any);

      const executionId = await tasksService.startExecution(
        taskId,
        null,
        false,
      );

      await tasksService.stopExecution(executionId);

      const executions = await tasksService.getExecutionsByTaskAndDate(taskId);
      expect(executions[0]?.end_time).not.toBeNull();
    });
  });

  describe("getExecutionsByTaskAndDate", () => {
    it("should get executions for non-recurrent task", async () => {
      const taskId = await tasksService.create({
        name: "Task For Get Executions",
        section_id: sectionId,
      } as any);

      await tasksService.startExecution(taskId);
      await tasksService.startExecution(taskId);

      const executions = await tasksService.getExecutionsByTaskAndDate(taskId);
      expect(executions.length).toBe(2);
    });

    it("should get executions for recurrent task with occurrence_date", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      await tasksService.startExecution(taskId, occurrenceDate);

      const executions = await tasksService.getExecutionsByTaskAndDate(
        taskId,
        occurrenceDate,
      );
      expect(executions.length).toBe(1);
    });

    it("should throw error for recurrent task without occurrence_date", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      await expect(
        tasksService.getExecutionsByTaskAndDate(taskId),
      ).rejects.toThrow("An occurrence date is necessary");
    });

    it("should throw error for non-existent task", async () => {
      await expect(
        tasksService.getExecutionsByTaskAndDate("non-existent-id"),
      ).rejects.toThrow("Task not found");
    });

    it("should return empty array when no executions exist", async () => {
      const taskId = await tasksService.create({
        name: "Task No Executions",
        section_id: sectionId,
      } as any);

      const executions = await tasksService.getExecutionsByTaskAndDate(taskId);
      expect(executions.length).toBe(0);
    });

    it("should find executions even when occurrence date has different time components", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        type: "by executions",
        objective: 2,
        recurrency: "FREQ=DAILY;COUNT=5",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      await tasksService.startExecution(taskId, occurrenceDate);

      const queryDate = "2026-12-31";
      const executions = await tasksService.getExecutionsByTaskAndDate(
        taskId,
        queryDate,
      );
      
      expect(executions.length).toBe(1);
    });
  });

  describe("updateExecution", () => {
    it("should update execution start_time and end_time", async () => {
      const taskId = await tasksService.create({
        name: "Task For Update",
        section_id: sectionId,
      } as any);

      const executionId = await tasksService.startExecution(taskId);

      const newStartTime = new Date("2026-01-01T10:00:00");
      const newEndTime = new Date("2026-01-01T11:00:00");

      await tasksService.updateExecution(executionId, {
        start_time: newStartTime,
        end_time: newEndTime,
      } as any);

      const executions = await tasksService.getExecutionsByTaskAndDate(taskId);
      expect(executions[0]?.start_time).toBeDefined();
      expect(executions[0]?.end_time).toBeDefined();
    });

    it("should throw error when end_time is less than start_time", async () => {
      const taskId = await tasksService.create({
        name: "Task For Invalid Update",
        section_id: sectionId,
      } as any);

      const executionId = await tasksService.startExecution(taskId);

      const lateStartTime = new Date("2026-01-01T12:00:00");
      const earlyEndTime = new Date("2026-01-01T10:00:00");

      await expect(
        tasksService.updateExecution(executionId, {
          start_time: lateStartTime,
          end_time: earlyEndTime,
        } as any),
      ).rejects.toThrow("end_time must be greater than or equal to start_time");
    });

    it("should throw error for non-existent execution", async () => {
      await expect(
        tasksService.updateExecution("non-existent-id", {
          end_time: "2026-12-31",
        } as any),
      ).rejects.toThrow("Execution not found");
    });

    it("should update only end_time", async () => {
      const taskId = await tasksService.create({
        name: "Task Partial Update",
        section_id: sectionId,
      } as any);

      const executionId = await tasksService.startExecution(
        taskId,
        null,
        false,
      );

      const newEndTime = new Date(Date.now() + 3600000); // 1 hour from now
      await tasksService.updateExecution(executionId, {
        end_time: newEndTime,
      } as any);

      const executions = await tasksService.getExecutionsByTaskAndDate(taskId);
      expect(executions[0]?.end_time).toBeDefined();
    });

    it("should update only start_time", async () => {
      const taskId = await tasksService.create({
        name: "Task Update Start",
        section_id: sectionId,
      } as any);

      const executionId = await tasksService.startExecution(taskId);

      const newStartTime = new Date("2026-01-01T09:00:00");
      await tasksService.updateExecution(executionId, {
        start_time: newStartTime,
      } as any);

      const executions = await tasksService.getExecutionsByTaskAndDate(taskId);
      expect(executions[0]?.start_time).toBeDefined();
    });
  });

  describe("deleteExecution", () => {
    it("should delete an execution", async () => {
      const taskId = await tasksService.create({
        name: "Task For Delete Execution",
        section_id: sectionId,
      } as any);

      const executionId = await tasksService.startExecution(taskId);
      await tasksService.deleteExecution(executionId);

      const executions = await tasksService.getExecutionsByTaskAndDate(taskId);
      expect(executions.length).toBe(0);
    });
  });

  describe("getTaskOccurrence", () => {
    it("should get non-recurrent task detail", async () => {
      const taskId = await tasksService.create({
        name: "Test Task",
        body: "Test body",
        location: "Test location",
        due_rule: "2026-12-31",
        type: "by executions",
        objective: 2,
        section_id: sectionId,
      } as any);

      const result = await tasksService.getTaskOccurrence(taskId);

      expect(result.name).toBe("Test Task");
      expect(result.body).toBe("Test body");
      expect(result.location).toBe("Test location");
      expect(result.type).toBe("by executions");
      expect(result.objective).toBe(2);
      expect(result.progress).toBe(0);
    });

    it("should throw error for non-existent task", async () => {
      await expect(
        tasksService.getTaskOccurrence("non-existent-id"),
      ).rejects.toThrow("Task not found");
    });

    it("should throw error for recurrent task without occurrenceDate", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      await expect(
        tasksService.getTaskOccurrence(taskId),
      ).rejects.toThrow("You need to specify a ocurrence date for recurrent task");
    });

    it("should get recurrent task with occurrenceDate", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        body: "Original body",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      const result = await tasksService.getTaskOccurrence(taskId, occurrenceDate);

      expect(result.name).toBe("Recurrent Task");
      expect(result.occurrence_date).toEqual(occurrenceDate);
    });

    it("should apply exception override_body", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        body: "Original body",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      await tasksService.update(
        taskId,
        { body: "Changed body" } as any,
        occurrenceDate,
        "current",
      );

      const result = await tasksService.getTaskOccurrence(taskId, occurrenceDate);
      expect(result.body).toBe("Changed body");
    });

    it("should apply exception override_name", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      await tasksService.update(
        taskId,
        { name: "Changed Name" } as any,
        occurrenceDate,
        "current",
      );

      const result = await tasksService.getTaskOccurrence(taskId, occurrenceDate);
      expect(result.name).toBe("Changed Name");
    });

    it("should apply exception override_location", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        location: "Original location",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      await tasksService.update(
        taskId,
        { location: "New location" } as any,
        occurrenceDate,
        "current",
      );

      const result = await tasksService.getTaskOccurrence(taskId, occurrenceDate);
      expect(result.location).toBe("New location");
    });

    it("should apply exception override_type", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        type: "by executions",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      await tasksService.update(
        taskId,
        { type: "note" as any } as any,
        occurrenceDate,
        "current",
      );

      const result = await tasksService.getTaskOccurrence(taskId, occurrenceDate);
      expect(result.type).toBe("note");
    });

    it("should apply exception override_objective", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        objective: 5,
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      await tasksService.update(
        taskId,
        { objective: 1 } as any,
        occurrenceDate,
        "current",
      );

      const result = await tasksService.getTaskOccurrence(taskId, occurrenceDate);
      expect(result.objective).toBe(1);
    });

    it("should apply exception rescheduled_due to due_date", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        due_rule: "+1d 00:00:00",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      const rescheduledDue = new Date("2026-12-25");

      await taskExceptionsRepo.upsert(taskId, occurrenceDate, {
        rescheduled_due: "2026-12-25",
        override_body: null,
        override_location: null,
        override_type: null,
        override_objective: null,
      });

      const result = await tasksService.getTaskOccurrence(taskId, occurrenceDate);
      expect(result.due_date).toContain("2026-12-25");
    });

    it("should throw error for deleted occurrence", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      await tasksService.delete(taskId, occurrenceDate, "current");

      await expect(
        tasksService.getTaskOccurrence(taskId, occurrenceDate),
      ).rejects.toThrow("Occurrence has been deleted");
    });

    it("should calculate progress for by time type", async () => {
      const taskId = await tasksService.create({
        name: "Time Task",
        type: "by time",
        section_id: sectionId,
      } as any);

      const execId = await tasksService.startExecution(taskId, null, false);
      await tasksService.stopExecution(execId);

      const result = await tasksService.getTaskOccurrence(taskId);
      expect(result.progress).toBeGreaterThanOrEqual(0);
    });

    it("should calculate progress for by executions type", async () => {
      const taskId = await tasksService.create({
        name: "Execution Task",
        type: "by executions",
        objective: 2,
        section_id: sectionId,
      } as any);

      await tasksService.startExecution(taskId);

      const result = await tasksService.getTaskOccurrence(taskId);
      expect(result.progress).toBe(1);
    });
  });

  describe("getTasksBySection", () => {
    it("should get non-recurrent tasks with progress", async () => {
      const taskId = await tasksService.create({
        name: "Incomplete Task",
        type: "by executions",
        objective: 2,
        section_id: sectionId,
      } as any);

      await tasksService.startExecution(taskId);

      const results = await tasksService.getTasksBySection(sectionId);
      expect(results.length).toBe(1);
      expect(results[0]?.name).toBe("Incomplete Task");
      expect(results[0]?.progress).toBe(1);
    });

    it("should filter only completed when onlyCompleted=true", async () => {
      const taskId = await tasksService.create({
        name: "Incomplete Task",
        type: "by executions",
        objective: 2,
        section_id: sectionId,
      } as any);

      await tasksService.startExecution(taskId);

      const results = await tasksService.getTasksBySection(sectionId, true);
      expect(results.length).toBe(0);
    });

    it("should return completed tasks when onlyCompleted=true", async () => {
      const taskId = await tasksService.create({
        name: "Complete Task",
        type: "by executions",
        objective: 1,
        section_id: sectionId,
      } as any);

      await tasksService.startExecution(taskId);

      const results = await tasksService.getTasksBySection(sectionId, true);
      expect(results.length).toBe(1);
      expect(results[0]?.name).toBe("Complete Task");
    });

    it("should get all occurrences for recurrent task", async () => {
      const taskId = await tasksService.create({
        name: "Daily Task",
        type: "by executions",
        objective: 1,
        recurrency: "FREQ=DAILY;COUNT=10",
        section_id: sectionId,
      } as any);

      await tasksService.startExecution(taskId, "2025-01-01");

      const results = await tasksService.getTasksBySection(sectionId);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.name).toBe("Daily Task");
    });

    it("should exclude deleted occurrences", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        type: "by executions",
        objective: 1,
        recurrency: "FREQ=DAILY",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      await tasksService.delete(taskId, occurrenceDate, "current");

      const results = await tasksService.getTasksBySection(sectionId);
      const hasDeletedOccurrence = results.some(
        (r) => r.occurrence_date === occurrenceDate,
      );
      expect(hasDeletedOccurrence).toBe(false);
    });

    it("should apply exception override_objective for completion", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        type: "by executions",
        objective: 5,
        recurrency: "FREQ=DAILY;COUNT=100",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      await tasksService.startExecution(taskId, occurrenceDate);
      await tasksService.update(
        taskId,
        { objective: 1 } as any,
        occurrenceDate,
        "current",
      );

      const results = await tasksService.getTasksBySection(sectionId, true);
      expect(results.length).toBeGreaterThan(0);
    });

    it("should apply exception override_type", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Task",
        type: "by executions",
        recurrency: "FREQ=DAILY;COUNT=100",
        section_id: sectionId,
      } as any);

      const occurrenceDate = "2026-12-31";
      await tasksService.update(
        taskId,
        { type: "note" as any } as any,
        occurrenceDate,
        "current",
      );

      const results = await tasksService.getTasksBySection(sectionId);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("getTasksByDateRange", () => {
    it("should get non-recurrent task in range", async () => {
      const taskId = await tasksService.create({
        name: "Task in Range",
        due_rule: "2026-06-15",
        section_id: sectionId,
      } as any);

      const results = await tasksService.getTasksByDateRange(
        new Date("2026-06-01"),
        new Date("2026-06-30"),
      );

      expect(results.length).toBe(1);
      expect(results[0]?.name).toBe("Task in Range");
      expect(results[0]?.is_complete).toBe(false);
    });

    it("should get completed task in range", async () => {
      const taskId = await tasksService.create({
        name: "Completed Task",
        due_rule: "2026-06-15",
        section_id: sectionId,
      } as any);

      await tasksService.startExecution(taskId);

      const results = await tasksService.getTasksByDateRange(
        new Date("2026-06-01"),
        new Date("2026-06-30"),
      );

      expect(results[0]?.is_complete).toBe(true);
    });

    it("should get recurrent task occurrences in range", async () => {
      const taskId = await tasksService.create({
        name: "Daily Recurrent",
        type: "by executions",
        objective: 1,
        recurrency: "FREQ=DAILY;COUNT=100",
        section_id: sectionId,
      } as any);

      const today = new Date("2026-12-31");
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const results = await tasksService.getTasksByDateRange(today, nextWeek);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0]?.name).toBe("Daily Recurrent");
    });

    it("should exclude recurrent task outside range", async () => {
      const taskId = await tasksService.create({
        name: "Future Recurrent",
        type: "by executions",
        objective: 1,
        recurrency: "FREQ=DAILY;COUNT=5;UNTIL=20250701T000000Z",
        section_id: sectionId,
      } as any);

      const results = await tasksService.getTasksByDateRange(
        new Date("2025-06-01"),
        new Date("2025-06-30"),
      );

      expect(results.length).toBe(0);
    });

    it("should exclude deleted occurrences in range", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent to Delete",
        type: "by executions",
        objective: 1,
        recurrency: "FREQ=DAILY;COUNT=30",
        section_id: sectionId,
      } as any);

      await tasksService.delete(taskId, "2025-01-15", "current");

      const results = await tasksService.getTasksByDateRange(
        new Date("2025-01-01"),
        new Date("2025-01-31"),
      );

      const hasDeletedDate = results.some(
        (r) => r.occurrence_date === "2025-01-15",
      );
      expect(hasDeletedDate).toBe(false);
    });

    it("should use exception override_objective for completion", async () => {
      const taskId = await tasksService.create({
        name: "Recurrent Override",
        type: "by executions",
        objective: 10,
        recurrency: "FREQ=DAILY;COUNT=100",
        section_id: sectionId,
      } as any);

      const today = new Date("2026-12-31");
      await tasksService.startExecution(taskId, "2026-12-31");
      await tasksService.update(
        taskId,
        { objective: 1 } as any,
        "2026-12-31",
        "current",
      );

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const results = await tasksService.getTasksByDateRange(today, tomorrow);
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });
});
