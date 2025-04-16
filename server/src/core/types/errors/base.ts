export interface ErrorMetadata {
  [key: string]: unknown;
}

export class BaseError extends Error {
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

export class ValidationError extends BaseError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(message, 400, metadata);
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(message, 401, metadata);
  }
}

export class AuthorizationError extends BaseError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(message, 403, metadata);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(message, 404, metadata);
  }
}

export class ConflictError extends BaseError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(message, 409, metadata);
  }
}

export class InternalServerError extends BaseError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(message, 500, metadata);
  }
}