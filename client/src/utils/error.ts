import { notifications } from '@mantine/notifications';
import { AppError, ValidationError, ErrorCode } from '../core/errors';
import { formatErrorMessage } from '../core/errors';

export function handleApiError(error: unknown, title = 'Error') {
  const appError = error instanceof AppError ? error : new AppError(
    ErrorCode.UNKNOWN,
    'An unknown error occurred'
  );

  let message = formatErrorMessage(appError);
  
  // For validation errors, show field-specific messages
  if (appError instanceof ValidationError && appError.fields.length > 0) {
    message = `${message}\n${appError.fields.map(f => `- ${f.field}: ${f.message}`).join('\n')}`;
  }

  notifications.show({
    title: appError.code === ErrorCode.VALIDATION ? 'Validation Error' : title,
    message,
    color: 'red',
    autoClose: appError instanceof ValidationError ? 5000 : 3000
  });
}