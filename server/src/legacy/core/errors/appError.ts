/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: object;

  constructor(code: string, statusCode: number, details?: object) {
    super(code);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details })
      }
    };
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Not Found') {
    return new AppError(message, 404);
  }

  static badRequest(message = 'Bad Request', details?: object) {
    return new AppError(message, 400, details);
  }

  static internal(message = 'Internal Server Error') {
    return new AppError(message, 500);
  }
}