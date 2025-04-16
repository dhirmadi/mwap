import type { ErrorMetadata } from '../types/errors/base';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly metadata?: ErrorMetadata;

  constructor(message: string, statusCode: number, metadata?: ErrorMetadata) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.metadata = metadata;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(message, 400, metadata);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Unauthorized access', metadata?: ErrorMetadata) {
    super(message, 401, metadata);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access forbidden', metadata?: ErrorMetadata) {
    super(message, 403, metadata);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', metadata?: ErrorMetadata) {
    super(message, 404, metadata);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(message, 409, metadata);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', metadata?: ErrorMetadata) {
    super(message, 500, metadata);
  }
}