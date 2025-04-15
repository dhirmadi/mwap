import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { env } from '../config/environment';

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Error response interface
interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    data?: any;
    stack?: string;
  };
}

// Error handler middleware
export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Default error response
  const response: ErrorResponse = {
    error: {
      message: 'Internal Server Error',
    },
  };

  // Handle known error types
  if (err instanceof APIError) {
    response.error = {
      message: err.message,
      code: err.code,
      data: err.data,
    };
    
    // Include stack trace in development
    if (env.isDevelopment()) {
      response.error.stack = err.stack;
    }
    
    return res.status(err.statusCode).json(response);
  }

  // Handle validation errors (e.g., from express-validator)
  if (err.name === 'ValidationError') {
    response.error.message = 'Validation Error';
    response.error.code = 'VALIDATION_ERROR';
    response.error.data = err.message;
    return res.status(400).json(response);
  }

  // Handle JWT errors
  if (err.name === 'UnauthorizedError') {
    response.error.message = 'Invalid or expired token';
    response.error.code = 'INVALID_TOKEN';
    return res.status(401).json(response);
  }

  // Include stack trace in development for unknown errors
  if (env.isDevelopment()) {
    response.error.stack = err.stack;
  }

  // Send response
  res.status(500).json(response);
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: 'Resource not found',
      code: 'NOT_FOUND',
      data: {
        path: req.path,
        method: req.method,
      },
    },
  });
};

// Async handler wrapper to catch promise rejections
export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};