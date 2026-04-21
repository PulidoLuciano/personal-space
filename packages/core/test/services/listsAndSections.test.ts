import { describe, it, expect, beforeEach } from "vitest";
import { createTestDatabase } from "../setup.js";
import ListsService from "../../src/services/ListsService.js";
import SectionsService from "../../src/services/SectionsService.js";
import ListsRepository from "../../src/database/repositories/ListsRepository.js";
import SectionsRepository from "../../src/database/repositories/SectionsRepository.js";
import type { DBClient } from "../../src/database/index.js";

describe("ListsService", () => {
  let db: DBClient;
  let listsRepo: ListsRepository;
  let sectionsRepo: SectionsRepository;
  let sectionsService: SectionsService;
  let listsService: ListsService;

  beforeEach(async () => {
    db = await createTestDatabase();
    listsRepo = new ListsRepository(db);
    sectionsRepo = new SectionsRepository(db);
    sectionsService = new SectionsService(sectionsRepo);
    listsService = new ListsService(listsRepo, sectionsService);
  });

  describe("create", () => {
    it("should create a new list with default section", async () => {
      const id = await listsService.create({
        name: "Test List",
        color_id: "#1565C0",
        icon_id: "star",
      });

      expect(id).toBeDefined();
      const list = await listsService.getById(id);
      expect(list?.name).toBe("Test List");

      const sections = await sectionsService.getByListId(id);
      expect(sections.length).toBe(1);
      expect(sections[0]?.name).toBe("Not sectioned");
    });
  });

  describe("getAllPaginated", () => {
    it("should return non-archived lists paginated", async () => {
      await listsService.create({
        name: "List 1",
        color_id: "#1565C0",
        icon_id: "star",
      });
      await listsService.create({
        name: "List 2",
        color_id: "#0D47A1",
        icon_id: "heart",
      });

      const results = await listsService.getAllPaginated(1, 10);
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it("should return archived lists when archived=true", async () => {
      const id = await listsService.create({
        name: "To Archive",
        color_id: "#1565C0",
        icon_id: "star",
      });
      await listsService.archive(id);

      const results = await listsService.getAllPaginated(1, 10, null, true);
      expect(results.length).toBe(1);
      expect(results[0]?.id).toBe(id);
    });

    it("should filter by search text", async () => {
      await listsService.create({
        name: "Searchable Item",
        color_id: "#1565C0",
        icon_id: "star",
      });

      const results = await listsService.getAllPaginated(1, 10, "Searchable");
      expect(results.length).toBe(1);
      expect(results[0]?.name).toBe("Searchable Item");
    });
  });

  describe("getById", () => {
    it("should return list by id with selected columns", async () => {
      const id = await listsService.create({
        name: "Get Me",
        color_id: "#1565C0",
        icon_id: "star",
      });

      const result = await listsService.getById(id);
      expect(result?.name).toBe("Get Me");
      expect(result?.color_id).toBe("#1565C0");
      expect(result?.icon_id).toBe("star");
      expect(result?.is_archived).toBeDefined();
    });
  });

  describe("update", () => {
    it("should update existing list", async () => {
      const id = await listsService.create({
        name: "Original",
        color_id: "#1565C0",
        icon_id: "star",
      });

      await listsService.update(id, { name: "Updated" });

      const result = await listsService.getById(id);
      expect(result?.name).toBe("Updated");
    });

    it("should throw error for immutable list", async () => {
      await expect(
        listsService.update("0", { name: "Try Update" }),
      ).rejects.toThrow("Cannot modify an immutable list");
    });
  });

  describe("delete", () => {
    it("should delete mutable list", async () => {
      const id = await listsService.create({
        name: "To Delete",
        color_id: "#1565C0",
        icon_id: "star",
      });

      await listsService.delete(id);

      const result = await listsService.getById(id);
      expect(result).toBeNull();
    });

    it("should throw error for immutable list", async () => {
      await expect(listsService.delete("0")).rejects.toThrow(
        "Cannot modify an immutable list",
      );
    });
  });

  describe("archive", () => {
    it("should archive a list", async () => {
      const id = await listsService.create({
        name: "Archive Me",
        color_id: "#1565C0",
        icon_id: "star",
      });

      await listsService.archive(id);

      const result = await listsService.getById(id);
      expect(result?.is_archived).toBe(1);
    });

    it("should throw error for immutable list", async () => {
      await expect(listsService.archive("0")).rejects.toThrow(
        "Cannot modify an immutable list",
      );
    });
  });

  describe("unarchive", () => {
    it("should unarchive a list", async () => {
      const id = await listsService.create({
        name: "Unarchive Me",
        color_id: "#1565C0",
        icon_id: "star",
      });
      await listsService.archive(id);

      await listsService.unarchive(id);

      const result = await listsService.getById(id);
      expect(result?.is_archived).toBe(0);
    });

    it("should throw error for immutable list", async () => {
      await expect(listsService.unarchive("0")).rejects.toThrow(
        "Cannot modify an immutable list",
      );
    });
  });
});

describe("SectionsService", () => {
  let db: DBClient;
  let repo: SectionsRepository;
  let service: SectionsService;

  beforeEach(async () => {
    db = await createTestDatabase();
    repo = new SectionsRepository(db);
    service = new SectionsService(repo);
  });

  describe("create", () => {
    it("should create a new section", async () => {
      const listsRepo = new ListsRepository(db);
      const listId = await listsRepo.create({
        name: "Test List",
        color_id: "#1565C0",
        icon_id: "star",
      });

      const id = await service.create({ name: "My Section", list_id: listId });
      expect(id).toBeDefined();

      const result = await service.getById(id, [
        "id",
        "name",
        "list_id",
        "updated_at",
      ]);
      expect(result?.name).toBe("My Section");
    });
  });

  describe("getAll", () => {
    it("should return all sections with selected columns", async () => {
      const listsRepo = new ListsRepository(db);
      const listId = await listsRepo.create({
        name: "Test List",
        color_id: "#1565C0",
        icon_id: "star",
      });

      await service.create({ name: "Section 1", list_id: listId });
      await service.create({ name: "Section 2", list_id: listId });

      const results = await service.getAll();
      expect(results.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("getByListId", () => {
    it("should return sections by list id", async () => {
      const listsRepo = new ListsRepository(db);
      const listId = await listsRepo.create({
        name: "Test List",
        color_id: "#1565C0",
        icon_id: "star",
      });

      await service.create({ name: "Section A", list_id: listId });
      await service.create({ name: "Section B", list_id: listId });

      const results = await service.getByListId(listId);
      expect(results.length).toBe(2);
    });
  });

  describe("delete", () => {
    it("should delete a section", async () => {
      const listsRepo = new ListsRepository(db);
      const listId = await listsRepo.create({
        name: "Test List",
        color_id: "#1565C0",
        icon_id: "star",
      });
      await service.create({ name: "Section 1", list_id: listId });
      const idToDelete = await service.create({
        name: "Section 2",
        list_id: listId,
      });

      await service.delete(idToDelete);

      const result = await service.getById(idToDelete, [
        "id",
        "name",
        "list_id",
        "updated_at",
      ]);
      expect(result).toBeNull();
    });

    it("should throw error when deleting last section", async () => {
      const listsRepo = new ListsRepository(db);
      const listId = await listsRepo.create({
        name: "Test List",
        color_id: "#1565C0",
        icon_id: "star",
      });

      await expect(service.delete("0")).rejects.toThrow(
        "Cannot delete the only section in a list",
      );
    });
  });
});

