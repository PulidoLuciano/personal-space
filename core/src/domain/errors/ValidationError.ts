export class ValidationError extends Error {
  constructor(public errors: string[]) {
    super(errors.join(', '));
    this.name = 'ValidationError';
  }
}
