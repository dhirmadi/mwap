/**
 * @fileoverview Centralized error handling system
 */

import React from 'react';
import { notifications } from '@mantine/notifications';
import { IconX, IconExclamationMark, IconInfoCircle } from '@tabler/icons-react';
import { AxiosError } from 'axios';
import { ErrorResponseBase, ValidationErrorResponse } from '@/types';
import {
  AppError,
  ApiError,
  NetworkError,
  ValidationError,
  AuthError,
  ErrorCode,
  isAppError,
  isValidationError,
  isApiError,
  isAuthError
} from '@/types/error';

// Error severity configuration
const ERROR_CONFIG = {
  [ErrorCode.VALIDATION]: {
    color: 'yellow',
    icon: IconExclamationMark,
    title: 'Validation Error'
  },
  [ErrorCode.NOT_FOUND]: {
    color: 'yellow',
    icon: IconExclamationMark,
    title: 'Not Found'
  },
  [ErrorCode.UNAUTHORIZED]: {
    color: 'red',
    icon: IconX,
    title: 'Unauthorized'
  },
  [ErrorCode.FORBIDDEN]: {
    color: 'red',
    icon: IconX,
    title: 'Access Denied'
  },
  [ErrorCode.CONFLICT]: {
    color: 'yellow',
    icon: IconExclamationMark,
    title: 'Conflict'
  },
  [ErrorCode.SERVER]: {
    color: 'red',
    icon: IconX,
    title: 'Server Error'
  },
  [ErrorCode.NETWORK]: {
    color: 'red',
    icon: IconX,
    title: 'Network Error'
  },
  [ErrorCode.TIMEOUT]: {
    color: 'yellow',
    icon: IconExclamationMark,
    title: 'Request Timeout'
  },
  [ErrorCode.PARSE]: {
    color: 'red',
    icon: IconX,
    title: 'Parse Error'
  },
  [ErrorCode.UNKNOWN]: {
    color: 'red',
    icon: IconX,
    title: 'Error'
  }
};

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
 * Formats an error for logging
 */
function formatErrorForLogging(error: AppError): Record<string, unknown> {
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

/**
 * Log error to console with proper formatting
 */
function logError(error: Error, context?: string) {
  if (isAppError(error)) {
    console.error(
      `[${context || 'App'}] ${error.toString()}`,
      formatErrorForLogging(error)
    );
  } else {
    console.error(
      `[${context || 'App'}] ${error.name}: ${error.message}`,
      error
    );
  }
}

/**
 * Show error notification with proper styling based on error type
 */
function showErrorNotification(error: Error) {
  const config = isAppError(error)
    ? ERROR_CONFIG[error.code]
    : ERROR_CONFIG[ErrorCode.UNKNOWN];

  notifications.show({
    color: config.color,
    icon: React.createElement(config.icon, { size: '1.1rem' }),
    title: config.title,
    message: formatErrorMessage(error),
    autoClose: 5000
  });
}

/**
 * Show success notification
 */
export function showSuccessNotification(title: string, message?: string) {
  notifications.show({
    color: 'green',
    icon: React.createElement(IconInfoCircle, { size: '1.1rem' }),
    title,
    message,
    autoClose: 3000
  });
}

/**
 * Formats an error message for display to the user
 */
export function formatErrorMessage(error: Error): string {
  if (!isAppError(error)) {
    return error.message;
  }

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
 * Transforms API errors into strongly-typed AppError instances
 */
export function transformApiError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Axios error
  if (error instanceof AxiosError) {
    // No response - network error
    if (!error.response) {
      return new NetworkError(
        0,
        error.message || 'Network error occurred',
        {
          url: error.config?.url,
          method: error.config?.method
        }
      );
    }

    const { status, data } = error.response;
    const errorResponse = data as ErrorResponseBase;

    // Auth errors
    if (status === 401 || status === 403) {
      return new AuthError(
        status === 401 ? ErrorCode.UNAUTHORIZED : ErrorCode.FORBIDDEN,
        errorResponse.error.message,
        errorResponse.error.data
      );
    }

    // Validation error (either by code or status)
    if (status === 400 || errorResponse.error.code === 'VALIDATION_ERROR') {
      const validationData = data as ValidationErrorResponse;
      return new ValidationError(
        validationData.error?.message || 'Validation failed',
        Array.isArray(validationData.error?.data) ? validationData.error.data : []
      );
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
 * Main error handler that routes errors to appropriate handlers
 */
export function handleError(error: unknown, context?: string) {
  // Convert unknown errors to AppError
  const err = error instanceof Error ? error : new Error(String(error));
  const appError = isAppError(err) ? err : transformApiError(err);

  // Log all errors
  logError(appError, context);

  // Show notification
  showErrorNotification(appError);

  // Handle authentication errors
  if (isAuthError(appError) && appError.code === ErrorCode.UNAUTHORIZED) {
    window.location.href = '/login';
  }

  // Re-throw fatal errors
  if (appError.code === ErrorCode.SERVER) {
    throw appError;
  }
}

// Re-export error types
export * from '@/types/error';