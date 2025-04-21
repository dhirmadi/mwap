import { notifications } from '@mantine/notifications';
import { AppError, ValidationError, ErrorCode } from '../../../core/errors';
import { formatErrorMessage } from '../../../core/errors/handlers';

export function showSuccessNotification() {
  notifications.show({
    title: 'Project Created',
    message: 'Project has been created successfully. You will be redirected to the project page.',
    color: 'green',
    autoClose: 3000,
    withCloseButton: true
  });
}

export function showRoleError() {
  notifications.show({
    title: 'Permission Error',
    message: 'Only tenant owners can create projects. Please contact your tenant administrator.',
    color: 'red',
    autoClose: false,
    withCloseButton: true
  });
}

export function showValidationError(message: string) {
  notifications.show({
    title: 'Validation Error',
    message,
    color: 'red',
    autoClose: 3000,
    withCloseButton: true
  });
}

export function showErrorNotification(error: unknown) {
  const appError = error instanceof AppError ? error : new AppError(
    ErrorCode.UNKNOWN,
    'Failed to create project'
  );

  let message = formatErrorMessage(appError);
  
  // For validation errors, show field-specific messages
  if (appError instanceof ValidationError && appError.fields.length > 0) {
    message = `${message}\n${appError.fields.map(f => `- ${f.field}: ${f.message}`).join('\n')}`;
  }

  notifications.show({
    title: appError.code === ErrorCode.VALIDATION ? 'Validation Error' : 'Error',
    message,
    color: 'red',
    autoClose: appError instanceof ValidationError ? 5000 : 3000
  });
}