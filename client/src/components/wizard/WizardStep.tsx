/**
 * @fileoverview Base component for wizard steps
 * @module components/wizard/WizardStep
 */

import { ReactNode } from 'react';
import { Stack, LoadingOverlay, Paper } from '@mantine/core';
import { WizardStepConfig, WizardStepProps } from './types';

interface BaseStepProps {
  children: ReactNode;
  isLoading?: boolean;
}

/**
 * Base component for wizard steps that provides common functionality:
 * - Loading state
 * - Common styling
 * - Error handling
 */
export function BaseStep({ children, isLoading }: BaseStepProps) {
  return (
    <Paper withBorder p="md" mt="md">
      <Stack pos="relative">
        <LoadingOverlay 
          visible={!!isLoading}
          overlayProps={{ blur: 2 }}
        />
        {children}
      </Stack>
    </Paper>
  );
}

/**
 * Factory function to create wizard steps with consistent behavior
 */
export function createWizardStep<T extends Record<string, unknown>>(
  config: Omit<WizardStepConfig<T>, 'id'>
): WizardStepConfig<T>['render'] {
  return function WizardStep(props: WizardStepProps<T>) {
    return (
      <BaseStep isLoading={props.isLoading}>
        {config.render(props)}
      </BaseStep>
    );
  };
}