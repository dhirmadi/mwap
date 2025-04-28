import { Alert, Text, Stack } from '@mantine/core';
import { AppError, ValidationError } from '../../core/errors';
import { formatErrorMessage } from '../../core/errors';

/**
 * Props for ErrorDisplay component
 */
export interface ErrorDisplayProps {
  readonly error: AppError;
  readonly title?: string;
  readonly showDetails?: boolean;
}

/**
 * Display error messages with optional details
 * 
 * @example
 * ```tsx
 * if (error) {
 *   return <ErrorDisplay error={error} />;
 * }
 * ```
 */
export function ErrorDisplay({
  error,
  title,
  showDetails = false
}: ErrorDisplayProps): JSX.Element {
  return (
    <Alert
      color="red"
      title={title || error.code}
      variant="filled"
    >
      <Stack gap="xs">
        <Text>{formatErrorMessage(error)}</Text>
        {error instanceof ValidationError && error.fields.length > 0 && (
          <Stack gap="xs">
            {error.fields.map((field, index) => (
              <Text key={index} size="sm" color="red.2">
                {field.field}: {field.message}
              </Text>
            ))}
          </Stack>
        )}
        {showDetails && error.details && !(error instanceof ValidationError) && (
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(error.details, null, 2)}
          </Text>
        )}
      </Stack>
    </Alert>
  );
}