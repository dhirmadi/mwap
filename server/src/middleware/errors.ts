import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log error for debugging
  console.error('ERROR:', err);

  // Set default status code
  err.statusCode = err.statusCode || 500;

  // Send error response
  res.status(err.statusCode).json({
    error: err.error || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
};