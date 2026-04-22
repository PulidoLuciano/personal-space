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
});
