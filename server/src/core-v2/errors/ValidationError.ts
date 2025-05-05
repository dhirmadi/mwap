import type { ZodError } from 'zod';
import { AppError, type ErrorDetails } from './AppError';

export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed',
    details?: ErrorDetails
  ) {
    super(
      message,
      'VALIDATION_ERROR',
      400,
      details || { message }
    );
  }

  static fromZodError(error: ZodError): ValidationError {
    const details = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code,
      type: err.code,
      received: err.received,
      expected: err.expected,
    }));

    return new ValidationError(
      'Validation failed',
      { errors: details }
    );
  }
}