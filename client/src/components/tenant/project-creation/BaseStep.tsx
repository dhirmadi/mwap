/**
 * @fileoverview Base component for form steps
 * @module components/tenant/project-creation/BaseStep
 */

import { ReactNode } from 'react';
import { UseFormReturnType } from '@mantine/form';
import { Stack, LoadingOverlay } from '@mantine/core';
import { FormErrorBoundary } from './FormErrorBoundary';
import { FormSection } from './ui';
import { FormValues } from './config';
import { handleError } from '../../../core/errors/handler';

interface BaseStepProps {
  form: UseFormReturnType<FormValues>;
  isLoading?: boolean;
  children: ReactNode;
  onError?: (error: Error) => void;
}

/**
 * Base component for form steps that provides common functionality:
 * - Error boundary
 * - Loading state
 * - Form section wrapper
 * - Common styling
 * 
 * @component
 * 
 * @example
 * ```tsx
 * <BaseStep form={form} isLoading={isLoading}>
 *   <TextInput {...form.getInputProps('name')} />
 * </BaseStep>
 * ```
 */
export function BaseStep({ form, isLoading, children, onError }: BaseStepProps) {
  const handleStepError = (error: Error) => {
    handleError(error, 'FormStep');
    onError?.(error);
  };

  return (
    <FormErrorBoundary onReset={form.reset} onError={handleStepError}>
      <FormSection>
        <Stack pos="relative">
          <LoadingOverlay 
            visible={!!isLoading}
            overlayProps={{ blur: 2 }}
          />
          {children}
        </Stack>
      </FormSection>
    </FormErrorBoundary>
  );
}