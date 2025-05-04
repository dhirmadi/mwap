import type { ZodError } from 'zod';

export interface ErrorDetails {
  [key: string]: unknown;
}

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: ErrorDetails;

  static notFound(message: string): NotFoundError {
    return new NotFoundError('Resource', 'unknown', { message });
  }

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    details?: ErrorDetails
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details || { message };

    // Ensure proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serialize error for API responses
   */
  toJSON(): Record<string, unknown> {
    return {
      error: {
        message: this.message,
        code: this.code,
        details: this.details,
        // Only include stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
      },
    };
  }
}

export class AuthError extends AppError {
  constructor(
    message: string = 'Authentication failed',
    code: string = 'AUTH_ERROR',
    details?: ErrorDetails
  ) {
    super(
      message,
      code,
      401,
      details || { message }
    );
  }
}

export class NotFoundError extends AppError {
  constructor(
    resource: string,
    id: string,
    details?: ErrorDetails
  ) {
    const message = `${resource} not found with id: ${id}`;
    super(
      message,
      'NOT_FOUND',
      404,
      details || { message, resource, id }
    );
  }
}

// Common error codes
export const ErrorCodes = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL: 'INTERNAL_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  BAD_REQUEST: 'BAD_REQUEST',
  RATE_LIMIT: 'RATE_LIMIT',
} as const;

// Type for error codes
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// Example usage:
/*
throw new ValidationError('Invalid input', {
  fields: ['email', 'password'],
  reason: 'missing_required_fields'
});

throw new AuthError('Token expired', 'AUTH_TOKEN_EXPIRED', {
  tokenId: '123',
  expiredAt: new Date()
});

throw new NotFoundError('User', '123', {
  query: { email: 'test@example.com' }
});
*/