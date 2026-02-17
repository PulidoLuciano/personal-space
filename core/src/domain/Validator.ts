import { ValidationError } from './errors/ValidationError';

export class Validator {
  static notNull(value: any, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new ValidationError([`${fieldName} cannot be null`]);
    }
  }

  static notEmpty(value: string, fieldName: string): void {
    if (value === '') {
      throw new ValidationError([`${fieldName} cannot be empty`]);
    }
  }

  static notBlank(value: string, fieldName: string): void {
    if (!value || value.trim() === '') {
      throw new ValidationError([`${fieldName} cannot be blank`]);
    }
  }

  static greaterThan(value: number, min: number, fieldName: string): void {
    if (value <= min) {
      throw new ValidationError([`${fieldName} must be greater than ${min}`]);
    }
  }

  static lessThan(value: number, max: number, fieldName: string): void {
    if (value >= max) {
      throw new ValidationError([`${fieldName} must be less than ${max}`]);
    }
  }

  static validateAll(...validations: (() => void)[]): void {
    const errors: string[] = [];

    for (const validation of validations) {
      try {
        validation();
      } catch (error) {
        if (error instanceof ValidationError) {
          errors.push(...error.errors);
        } else {
          throw error;
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }
}
