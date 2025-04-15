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

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(401, message, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(403, message, 'AUTHORIZATION_ERROR');
  }
}