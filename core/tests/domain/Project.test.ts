import { describe, it, expect } from 'vitest';
import { Project } from '../../src/domain/Project';
import { ValidationError } from '../../src/domain/errors/ValidationError';

describe('Project', () => {
  describe('constructor', () => {
    it('should create a project with all valid fields', () => {
      const project = new Project('My Project', 'folder', '#FF0000');
      expect(project.title).toBe('My Project');
      expect(project.icon).toBe('folder');
      expect(project.color).toBe('#FF0000');
    });

    it('should create a project with default icon and color', () => {
      const project = new Project('My Project');
      expect(project.title).toBe('My Project');
      expect(project.icon).toBe('circle');
      expect(project.color).toBe('#808080');
    });

    it('should throw ValidationError when title is null', () => {
      expect(() => new Project(null as any)).toThrow(ValidationError);
    });

    it('should throw ValidationError when title is empty string', () => {
      expect(() => new Project('')).toThrow(ValidationError);
    });

    it('should throw ValidationError when icon is null', () => {
      expect(() => new Project('My Project', null as any)).toThrow(ValidationError);
    });

    it('should throw ValidationError when icon is empty string', () => {
      expect(() => new Project('My Project', '')).toThrow(ValidationError);
    });

    it('should throw ValidationError when color is null', () => {
      expect(() => new Project('My Project', 'folder', null as any)).toThrow(ValidationError);
    });

    it('should throw ValidationError when color is empty string', () => {
      expect(() => new Project('My Project', 'folder', '')).toThrow(ValidationError);
    });

    it('should collect multiple validation errors', () => {
      expect(() => new Project(null as any, null as any, null as any)).toThrow();
      try {
        new Project(null as any, null as any, null as any);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.errors).toContain('Title cannot be blank');
        expect(validationError.errors).toContain('Icon cannot be blank');
        expect(validationError.errors).toContain('Color cannot be blank');
      }
    });
  });

  describe('setters', () => {
    it('should set a valid title', () => {
      const project = new Project('My Project');
      project.title = 'New Title';
      expect(project.title).toBe('New Title');
    });

    it('should throw error when setting title to null', () => {
      const project = new Project('My Project');
      expect(() => { project.title = null as any; }).toThrow(ValidationError);
    });

    it('should throw error when setting title to empty string', () => {
      const project = new Project('My Project');
      expect(() => { project.title = ''; }).toThrow(ValidationError);
    });

    it('should set a valid icon', () => {
      const project = new Project('My Project');
      project.icon = 'star';
      expect(project.icon).toBe('star');
    });

    it('should throw error when setting icon to null', () => {
      const project = new Project('My Project');
      expect(() => { project.icon = null as any; }).toThrow(ValidationError);
    });

    it('should throw error when setting icon to empty string', () => {
      const project = new Project('My Project');
      expect(() => { project.icon = ''; }).toThrow(ValidationError);
    });

    it('should set a valid color', () => {
      const project = new Project('My Project');
      project.color = '#00FF00';
      expect(project.color).toBe('#00FF00');
    });

    it('should throw error when setting color to null', () => {
      const project = new Project('My Project');
      expect(() => { project.color = null as any; }).toThrow(ValidationError);
    });

    it('should throw error when setting color to empty string', () => {
      const project = new Project('My Project');
      expect(() => { project.color = ''; }).toThrow(ValidationError);
    });
  });
});
