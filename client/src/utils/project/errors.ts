/**
 * @fileoverview Project error handling utilities
 * @module utils/project/errors
 */

import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

/**
 * Shows success notification
 */
export function showSuccessNotification() {
  notifications.show({
    title: 'Success',
    message: 'Project created successfully',
    color: 'green',
    icon: <IconCheck size={16} />,
    autoClose: 3000
  });
}

/**
 * Shows role error notification
 */
export function showRoleError() {
  notifications.show({
    title: 'Permission Error',
    message: 'You do not have the required role to create projects',
    color: 'red',
    icon: <IconX size={16} />,
    autoClose: false
  });
}

/**
 * Handles API error
 */
export function handleProjectError(error: any, message: string = 'Failed to create project') {
  console.group('[PROJECT ERROR]');
  console.error('Error Details:', {
    status: error.status,
    message: error.message,
    response: error.response?.data,
    request: {
      url: error.config?.url,
      method: error.config?.method,
      headers: {
        ...error.config?.headers,
        Authorization: error.config?.headers?.Authorization ? '[REDACTED]' : 'MISSING'
      },
      data: error.config?.data
    }
  });
  console.groupEnd();

  notifications.show({
    title: 'Error',
    message,
    color: 'red',
    icon: <IconX size={16} />,
    autoClose: 5000
  });
}