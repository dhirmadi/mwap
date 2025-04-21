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

interface BaseStepProps {
  form: UseFormReturnType<FormValues>;
  isLoading?: boolean;
  children: ReactNode;
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
export function BaseStep({ form, isLoading, children }: BaseStepProps) {
  return (
    <FormErrorBoundary onReset={form.reset}>
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