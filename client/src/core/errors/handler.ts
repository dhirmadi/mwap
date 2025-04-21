/**
 * @fileoverview Centralized error handling system
 * @module core/errors/handler
 */

import React from 'react';
import { notifications } from '@mantine/notifications';
import { IconX, IconExclamationMark, IconInfoCircle } from '@tabler/icons-react';
import { AppError, ErrorCode, isAppError, isValidationError, isApiError, isAuthError } from './types';

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
 * Log error to console with proper formatting
 */
function logError(error: Error, context?: string) {
  if (isAppError(error)) {
    console.error(
      `[${context || 'App'}] ${error.toString()}`,
      error.details || ''
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
    message: error.message,
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
 * Handle form validation errors
 */
export function handleValidationError(error: Error) {
  if (!isValidationError(error)) {
    return;
  }

  logError(error, 'Validation');
  showErrorNotification(error);
}

/**
 * Handle API errors
 */
export function handleApiError(error: Error) {
  if (!isApiError(error)) {
    return;
  }

  logError(error, 'API');
  showErrorNotification(error);

  // Handle authentication errors
  if (isAuthError(error)) {
    // Redirect to login if unauthorized
    if (error.code === ErrorCode.UNAUTHORIZED) {
      window.location.href = '/login';
    }
  }
}

/**
 * Main error handler that routes errors to appropriate handlers
 */
export function handleError(error: unknown, context?: string) {
  // Convert unknown errors to Error objects
  const err = error instanceof Error ? error : new Error(String(error));

  // Log all errors
  logError(err, context);

  // Route to specific handlers
  if (isValidationError(err)) {
    handleValidationError(err);
  } else if (isApiError(err)) {
    handleApiError(err);
  } else {
    // Generic error handling
    showErrorNotification(err);
  }

  // Re-throw fatal errors
  if (isAppError(err) && err.code === ErrorCode.SERVER) {
    throw err;
  }
}