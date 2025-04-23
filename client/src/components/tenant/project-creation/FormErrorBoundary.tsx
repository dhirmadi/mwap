/**
 * @fileoverview Form-specific error boundary component
 * @module components/tenant/project-creation/FormErrorBoundary
 */

import { Alert, Button, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { ICON_SIZES } from '../../../core/theme/icons';
import { ErrorBoundary } from '../../common/ErrorBoundary';
import { handleError } from '../../../core/errors/handler';


interface Props {
  children: React.ReactNode;
  onReset?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Form-specific error boundary that handles form-related errors
 * and provides form-specific recovery options
 * @component
 * 
 * @example
 * ```tsx
 * <FormErrorBoundary onReset={handleReset}>
 *   <ProjectCreationForm />
 * </FormErrorBoundary>
 * ```
 */
export function FormErrorBoundary({ children, onReset, onError }: Props) {
  const handleFormError = (error: Error) => {
    // Handle error with proper context
    handleError(error, 'FormBoundary');
    onError?.(error);
  };

  const fallback = (
    <Alert
      icon={<IconAlertCircle size={ICON_SIZES.sm} />}
      title="Form Error"
      color="red"
      variant="filled"
    >
      <Stack spacing="sm">
        <Text size="sm">
          An error occurred while processing the form.
          Please try again or reset the form.
        </Text>
        <Button.Group>
          <Button
            variant="white"
            color="red"
            size="xs"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
          {onReset && (
            <Button
              variant="white"
              color="red"
              size="xs"
              onClick={onReset}
            >
              Reset Form
            </Button>
          )}
        </Button.Group>
      </Stack>
    </Alert>
  );

  return (
    <ErrorBoundary
      fallback={fallback}
      onError={handleFormError}
    >
      {children}
    </ErrorBoundary>
  );
}