/**
 * Error codes for the application
 * Maps to backend error codes and adds client-specific codes
 */
export enum ErrorCode {
  // Backend error codes
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED_ERROR',
  FORBIDDEN = 'FORBIDDEN_ERROR',
  CONFLICT = 'CONFLICT_ERROR',
  SERVER = 'SERVER_ERROR',

  // Client-specific error codes
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  PARSE = 'PARSE_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

/**
 * Base error class for the application
 * All custom errors should extend this class
 */
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Convert error to string for logging
   */
  toString(): string {
    return `[${this.code}] ${this.message}${
      this.details ? ` - ${JSON.stringify(this.details)}` : ''
    }`;
  }
}

/**
 * Network-related errors (HTTP errors, timeouts, etc.)
 */
export class NetworkError extends AppError {
  constructor(
    public readonly status: number,
    message: string,
    details?: unknown
  ) {
    super(ErrorCode.NETWORK, message, details);
    this.name = 'NetworkError';
  }
}

/**
 * API-specific errors (based on backend error responses)
 */
export class ApiError extends AppError {
  constructor(
    public readonly status: number,
    code: ErrorCode,
    message: string,
    details?: unknown
  ) {
    super(code, message, details);
    this.name = 'ApiError';
  }
}

/**
 * Validation errors with field-level details
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fields: Array<{
      field: string;
      message: string;
    }>
  ) {
    super(ErrorCode.VALIDATION, message, fields);
    this.name = 'ValidationError';
  }

  /**
   * Get error message for a specific field
   */
  getFieldError(field: string): string | undefined {
    return this.fields.find(f => f.field === field)?.message;
  }
}

/**
 * Authentication/authorization errors
 */
export class AuthError extends AppError {
  constructor(
    code: ErrorCode.UNAUTHORIZED | ErrorCode.FORBIDDEN,
    message: string,
    details?: unknown
  ) {
    super(code, message, details);
    this.name = 'AuthError';
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Type guard to check if an error is an AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}