/**
 * @fileoverview Project creation form hook
 * @module hooks/useProjectCreationForm
 */

import { useCallback } from 'react';
import { useForm } from '@mantine/form';
import { useCreateProject } from './useCreateProject';
import { handleApiError } from '../core/errors';
import { FormValues, STEPS } from '../components/tenant/project-creation/config';
import { showSuccessNotification, showValidationError, showRoleError } from '../components/tenant/project-creation/errors';
import { useFormStateMachine, FormStateMachineConfig } from './useFormStateMachine';

/**
 * Hook options
 */
export interface UseProjectCreationFormOptions {
  tenantId: string;
  availableProviders: string[];
  onSuccess?: () => void;
}

/**
 * Hook return type
 */
export interface UseProjectCreationFormReturn {
  form: ReturnType<typeof useForm<FormValues>>;
  state: ReturnType<typeof useFormStateMachine<FormValues>>;
  isLoading: boolean;
}

/**
 * Custom hook for project creation form
 */
export function useProjectCreationForm({
  tenantId,
  availableProviders,
  onSuccess
}: UseProjectCreationFormOptions): UseProjectCreationFormReturn {
  const { createProject, isLoading } = useCreateProject(tenantId);

  // Initialize form with all state
  const form = useForm<FormValues & { activeStep: number }>({
    initialValues: {
      activeStep: 0,
      name: '',
      cloudProvider: availableProviders[0],
      folderPath: ''
    },
    validate: {
      ...Object.fromEntries(
        ['name', 'cloudProvider', 'folderPath'].map(field => [
          field,
          (_, values) => STEPS.find(s => s.field === field)?.validateStep?.(values) || null
        ])
      ),
      activeStep: (value) => (value >= 0 && value < STEPS.length ? null : 'Invalid step')
    }
  });

  // Handle form submission
  const handleSubmit = useCallback(async (values: FormValues) => {
    try {
      await createProject({
        name: values.name,
        description: `Project using ${values.cloudProvider} at ${values.folderPath}`,
        provider: values.cloudProvider,
        folderPath: values.folderPath
      });

      showSuccessNotification();
      onSuccess?.();
    } catch (error) {
      if (error.status === 403) {
        showRoleError();
        return;
      }
      handleApiError(error, 'Failed to create project');
      throw error;
    }
  }, [createProject, onSuccess]);

  // Configure state machine
  const config: FormStateMachineConfig<FormValues> = {
    steps: STEPS.map(step => ({
      validate: (values) => step.validateStep?.(values) || null,
      requiredFields: step.requiredFields
    })),
    onSubmit: handleSubmit
  };

  // Initialize state machine
  const state = useFormStateMachine({
    form,
    config
  });

  return {
    form,
    state,
    isLoading
  };
}