/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

export interface ErrorMetadata {
  [key: string]: unknown;
}

export enum ErrorCode {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  VALIDATION = 'VALIDATION_ERROR',
  SERVER = 'SERVER_ERROR',
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  PARSE = 'PARSE_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly metadata?: ErrorMetadata;
  public readonly code?: string;

  constructor(message: string, statusCode: number, metadata?: ErrorMetadata, code?: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.metadata = metadata;
    this.code = code;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Standard HTTP errors
export class ValidationError extends AppError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(message, 400, metadata, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Unauthorized access', metadata?: ErrorMetadata) {
    super(message, 401, metadata, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access forbidden', metadata?: ErrorMetadata) {
    super(message, 403, metadata, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', metadata?: ErrorMetadata) {
    super(message, 404, metadata, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(message, 409, metadata, 'CONFLICT_ERROR');
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', metadata?: ErrorMetadata) {
    super(message, 500, metadata, 'INTERNAL_SERVER_ERROR');
  }
}

// MongoDB specific error handlers
export const handleMongoDBError = (err: MongoError | MongooseError): AppError => {
  // Handle duplicate key errors
  if (err instanceof MongoError && err.code === 11000) {
    const match = err.errmsg?.match(/(["'])(\\?.)*?\1/);
    const value = match ? match[0] : '';
    return new ConflictError(`Duplicate field value: ${value}. Please use another value!`);
  }

  // Handle Mongoose validation errors
  if (err instanceof MongooseError.ValidationError) {
    const errors = Object.values(err.errors).map(el => el.message);
    return new ValidationError(`Invalid input data. ${errors.join('. ')}`);
  }

  // Handle Mongoose cast errors
  if (err instanceof MongooseError.CastError) {
    return new ValidationError(`Invalid ${err.path}: ${err.value}`);
  }

  // Default to internal server error
  return new InternalServerError('Database operation failed');
};