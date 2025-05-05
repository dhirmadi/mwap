import type { ZodError } from 'zod';

export interface ErrorDetails {
  [key: string]: unknown;
}

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: ErrorDetails;

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
    this.details = details;

    // Ensure proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert a Zod validation error to AppError
   */
  static fromZodError(error: ZodError): ValidationError {
    const details = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    return new ValidationError(
      'Validation failed',
      details
    );
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

  // Static methods for common error types
  static forbidden(
    message: string = 'Forbidden', 
    details?: ErrorDetails
  ): AppError {
    return new AppError(
      message, 
      ErrorCodes.FORBIDDEN, 
      403, 
      details
    );
  }

  static badRequest(
    message: string = 'Bad Request', 
    details?: ErrorDetails
  ): AppError {
    return new AppError(
      message, 
      ErrorCodes.BAD_REQUEST, 
      400, 
      details
    );
  }

  static internal(
    message: string = 'Internal Server Error', 
    details?: ErrorDetails
  ): AppError {
    return new AppError(
      message, 
      ErrorCodes.INTERNAL, 
      500, 
      details
    );
  }

  static unauthorized(
    message: string = 'Unauthorized', 
    details?: ErrorDetails
  ): AppError {
    return new AppError(
      message, 
      ErrorCodes.AUTH, 
      401, 
      details
    );
  }

  static validation(
    message: string = 'Validation Failed', 
    details?: ErrorDetails
  ): AppError {
    return new AppError(
      message, 
      ErrorCodes.VALIDATION, 
      400, 
      details
    );
  }

  static notFound(
    message: string = 'Resource Not Found', 
    details?: ErrorDetails
  ): AppError {
    return new AppError(
      message, 
      ErrorCodes.NOT_FOUND, 
      404, 
      details
    );
  }

  static conflict(
    message: string = 'Conflict', 
    details?: ErrorDetails
  ): AppError {
    return new AppError(
      message, 
      ErrorCodes.CONFLICT, 
      409, 
      details
    );
  }

  static notImplemented(
    message: string = 'Not Implemented', 
    details?: ErrorDetails
  ): AppError {
    return new AppError(
      message, 
      ErrorCodes.NOT_IMPLEMENTED, 
      501, 
      details
    );
  }

  static rateLimit(
    message: string = 'Rate Limit Exceeded', 
    details?: ErrorDetails
  ): AppError {
    return new AppError(
      message, 
      ErrorCodes.RATE_LIMIT, 
      429, 
      details
    );
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed',
    details?: ErrorDetails
  ) {
    super(
      message,
      'VALIDATION_ERROR',
      400,
      details
    );
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
      details
    );
  }
}

export class NotFoundError extends AppError {
  constructor(
    resource: string,
    id: string,
    details?: ErrorDetails
  ) {
    super(
      `${resource} not found with id: ${id}`,
      'NOT_FOUND',
      404,
      details
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