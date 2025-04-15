import { AxiosError } from 'axios';
import { ErrorResponseBase, ValidationErrorResponse } from '@/types';
import {
  AppError,
  ApiError,
  NetworkError,
  ValidationError,
  AuthError,
  ErrorCode
} from './types';

/**
 * Maps backend error codes to ErrorCode enum
 */
function mapErrorCode(code?: string): ErrorCode {
  switch (code) {
    case 'VALIDATION_ERROR':
      return ErrorCode.VALIDATION;
    case 'NOT_FOUND_ERROR':
      return ErrorCode.NOT_FOUND;
    case 'UNAUTHORIZED_ERROR':
      return ErrorCode.UNAUTHORIZED;
    case 'FORBIDDEN_ERROR':
      return ErrorCode.FORBIDDEN;
    case 'CONFLICT_ERROR':
      return ErrorCode.CONFLICT;
    case 'SERVER_ERROR':
      return ErrorCode.SERVER;
    default:
      return ErrorCode.UNKNOWN;
  }
}

/**
 * Handles validation errors from the backend
 */
function handleValidationError(error: ValidationErrorResponse): ValidationError {
  return new ValidationError(
    error.error.message,
    error.error.data
  );
}

/**
 * Handles network errors (no response from server)
 */
function handleNetworkError(error: AxiosError): NetworkError {
  const status = error.response?.status ?? 0;
  const message = error.message || 'Network error occurred';
  
  return new NetworkError(
    status,
    message,
    {
      url: error.config?.url,
      method: error.config?.method
    }
  );
}

/**
 * Handles auth errors (401, 403)
 */
function handleAuthError(
  status: number,
  error: ErrorResponseBase
): AuthError {
  const code = status === 401 ? ErrorCode.UNAUTHORIZED : ErrorCode.FORBIDDEN;
  return new AuthError(
    code,
    error.error.message,
    error.error.data
  );
}

/**
 * Main error handler that transforms any error into an AppError
 */
export function handleApiError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Axios error
  if (error instanceof AxiosError) {
    // No response - network error
    if (!error.response) {
      return handleNetworkError(error);
    }

    const { status, data } = error.response;
    const errorResponse = data as ErrorResponseBase;

    // Auth errors
    if (status === 401 || status === 403) {
      return handleAuthError(status, errorResponse);
    }

    // Validation error
    if (errorResponse.error.code === 'VALIDATION_ERROR') {
      return handleValidationError(data as ValidationErrorResponse);
    }

    // Other API errors
    return new ApiError(
      status,
      mapErrorCode(errorResponse.error.code),
      errorResponse.error.message,
      errorResponse.error.data
    );
  }

  // Unknown error
  return new AppError(
    ErrorCode.UNKNOWN,
    error instanceof Error ? error.message : 'An unknown error occurred'
  );
}

/**
 * Formats an error for display to the user
 */
export function formatErrorMessage(error: AppError): string {
  if (error instanceof ValidationError) {
    return `Validation Error: ${error.message}`;
  }

  if (error instanceof NetworkError) {
    return 'Network Error: Unable to connect to server';
  }

  if (error instanceof AuthError) {
    return error.code === ErrorCode.UNAUTHORIZED
      ? 'Please log in to continue'
      : 'You do not have permission to perform this action';
  }

  return error.message;
}

/**
 * Formats an error for logging
 */
export function formatErrorForLogging(error: AppError): Record<string, unknown> {
  const logData: Record<string, unknown> = {
    code: error.code,
    message: error.message,
    name: error.name
  };

  if (error instanceof ApiError || error instanceof NetworkError) {
    logData.status = error.status;
  }

  if (error.details) {
    logData.details = error.details;
  }

  if (error.stack) {
    logData.stack = error.stack;
  }

  return logData;
}