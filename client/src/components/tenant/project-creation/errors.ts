import { notifications } from '@mantine/notifications';
import { AppError } from '../../../core/errors';

export function showSuccessNotification() {
  notifications.show({
    title: 'Success',
    message: 'Project created successfully',
    color: 'green'
  });
}

export function showErrorNotification(error: unknown) {
  const appError = error as AppError;
  notifications.show({
    title: 'Error',
    message: appError.message || 'Failed to create project',
    color: 'red'
  });
}