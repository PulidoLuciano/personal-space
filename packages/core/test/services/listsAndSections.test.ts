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
    it("should create a list with default icon and color when not provided", async () => {
      const id = await listsService.create({
        name: "Default List",
      } as any);

      expect(id).toBeDefined();
      const list = await listsService.getById(id);
      expect(list?.name).toBe("Default List");
      expect(list?.color_id).toBe("#777777");
      expect(list?.icon_id).toBe("circle");
    });

    it("should create a list with specific icon and color", async () => {
      const id = await listsService.create({
        name: "Apple List",
        color_id: "#FF9800",
        icon_id: "apple",
      });

      expect(id).toBeDefined();
      const list = await listsService.getById(id);
      expect(list?.name).toBe("Apple List");
      expect(list?.color_id).toBe("#FF9800");
      expect(list?.icon_id).toBe("apple");
    });

    it("should throw error when creating list with invalid color", async () => {
      await expect(
        listsService.create({
          name: "Invalid Color List",
          color_id: "#9C27B1",
          icon_id: "circle",
        }),
      ).rejects.toThrow("Color is not valid");
    });

    it("should throw error when creating list with invalid icon", async () => {
      await expect(
        listsService.create({
          name: "Invalid Icon List",
          color_id: "#FF9800",
          icon_id: "test",
        }),
      ).rejects.toThrow("Icon is not valid");
    });

    it("should create a default section when list is created", async () => {
      const id = await listsService.create({
        name: "Section Test List",
        color_id: "#1565C0",
        icon_id: "star",
      });

      const sections = await sectionsService.getByListId(id);
      expect(sections.length).toBe(1);
      expect(sections[0]?.name).toBe("Not sectioned");
    });

    it("should throw error when creating with empty name", async () => {
      await expect(
        listsService.create({
          name: "",
          color_id: "#1565C0",
          icon_id: "star",
        }),
      ).rejects.toThrow("can not be empty.");
    });
  });

  describe("update", () => {
    it("should update name, icon and color at once", async () => {
      const id = await listsService.create({
        name: "Original",
        color_id: "#1565C0",
        icon_id: "star",
      });

      await listsService.update(id, {
        name: "Updated All",
        color_id: "#FF9800",
        icon_id: "apple",
      });

      const result = await listsService.getById(id);
      expect(result?.name).toBe("Updated All");
      expect(result?.color_id).toBe("#FF9800");
      expect(result?.icon_id).toBe("apple");
    });

    it("should throw error when updating with invalid color", async () => {
      const id = await listsService.create({
        name: "Test List",
        color_id: "#1565C0",
        icon_id: "star",
      });

      await expect(
        listsService.update(id, { color_id: "#145354" }),
      ).rejects.toThrow("Color is not valid");
    });

    it("should throw error when updating with invalid icon", async () => {
      const id = await listsService.create({
        name: "Test List",
        color_id: "#1565C0",
        icon_id: "star",
      });

      await expect(
        listsService.update(id, { icon_id: "invalid_icon" }),
      ).rejects.toThrow("Icon is not valid");
    });

    it("should throw error when updating with empty name", async () => {
      const id = await listsService.create({
        name: "Test List",
        color_id: "#1565C0",
        icon_id: "star",
      });

      await expect(listsService.update(id, { name: "" })).rejects.toThrow(
        "can not be empty.",
      );
    });

    it("should throw error for immutable list", async () => {
      await expect(
        listsService.update("0", { name: "Try Update" }),
      ).rejects.toThrow("Cannot modify an immutable list");
    });
  });

  describe("delete", () => {
    it("should soft delete a list", async () => {
      const id = await listsService.create({
        name: "To Delete",
        color_id: "#1565C0",
        icon_id: "star",
      });

      await listsService.delete(id);

      const result = await listsService.getById(id);
      expect(result).toBeNull();
    });

    it("should throw error when deleting non-existent list", async () => {
      await expect(
        listsService.delete("non-existent-id"),
      ).rejects.toThrow("List not found");
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
        name: "To Archive",
        color_id: "#1565C0",
        icon_id: "star",
      });

      await listsService.archive(id);

      const result = await listsService.getById(id);
      expect(result?.is_archived).toBe(1);
    });

    it("should throw error when archiving non-existent list", async () => {
      await expect(
        listsService.archive("non-existent-id"),
      ).rejects.toThrow("List not found");
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
        name: "To Unarchive",
        color_id: "#1565C0",
        icon_id: "star",
      });
      await listsService.archive(id);

      await listsService.unarchive(id);

      const result = await listsService.getById(id);
      expect(result?.is_archived).toBe(0);
    });

    it("should throw error when unarchiving non-existent list", async () => {
      await expect(
        listsService.unarchive("non-existent-id"),
      ).rejects.toThrow("List not found");
    });

    it("should throw error for immutable list", async () => {
      await expect(listsService.unarchive("0")).rejects.toThrow(
        "Cannot modify an immutable list",
      );
    });
  });

  describe("toggleShowCompleted", () => {
    it("should toggle show_completed value", async () => {
      const id = await listsService.create({
        name: "Test List",
        color_id: "#1565C0",
        icon_id: "star",
      });

      await listsService.toggleShowCompleted(id);

      const result = await listsService.getById(id);
      expect(result?.show_completed).toBe(0);

      await listsService.toggleShowCompleted(id);

      const result2 = await listsService.getById(id);
      expect(result2?.show_completed).toBe(1);
    });

    it("should throw error for non-existent list", async () => {
      await expect(
        listsService.toggleShowCompleted("non-existent-id"),
      ).rejects.toThrow("List not found");
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
    it("should create a new section with valid data", async () => {
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

    it("should throw error when creating section with empty name", async () => {
      const listsRepo = new ListsRepository(db);
      const listId = await listsRepo.create({
        name: "Test List",
        color_id: "#1565C0",
        icon_id: "star",
      });

      await expect(
        service.create({ name: "", list_id: listId }),
      ).rejects.toThrow("cannot be empty");
    });

    it("should throw error when creating section with non-existent list", async () => {
      await expect(
        service.create({ name: "My Section", list_id: "non-existent-list-id" }),
      ).rejects.toThrow("List does not exist");
    });
  });
});
