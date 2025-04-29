import { notifications } from '@mantine/notifications';
import { debug } from '../debug';

/**
 * Show success notification for project creation
 */
export function showSuccessNotification() {
  notifications.show({
    title: 'Project Created',
    message: 'Your project has been created successfully',
    color: 'green',
    autoClose: 3000
  });
}

/**
 * Handle project-related errors
 */
export function handleProjectError(error: any) {
  debug.error('[PROJECT ERROR]');
  debug.error('Error Details:', {
    status: error?.response?.status,
    message: error?.message,
    response: error?.response,
    request: error?.config
  });

  notifications.show({
    title: 'Project Creation Failed',
    message: error?.message || 'Failed to create project. Please try again.',
    color: 'red',
    autoClose: 5000
  });
}