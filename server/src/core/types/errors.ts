export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string,
    public data?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, data?: any) {
    super(400, message, "VALIDATION_ERROR", data);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(401, message, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(403, message, "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message, "NOT_FOUND_ERROR");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, "CONFLICT_ERROR");
  }
}

export class RateLimitError extends AppError {
  constructor(message: string) {
    super(429, message, "RATE_LIMIT_ERROR");
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "An unexpected error occurred") {
    super(500, message, "INTERNAL_ERROR");
  }
}