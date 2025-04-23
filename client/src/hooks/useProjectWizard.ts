/**
 * @fileview Project creation wizard hook
 * @module hooks/useProjectWizard
 */

import { useCallback } from 'react';
import { useWizardState } from '../components/wizard/hooks';
import { useCreateProject } from './useCreateProject';
import { handleApiError } from '../utils/error';
import { ProjectFormData } from '../components/tenant/project-creation/types';
import { STEPS } from '../components/tenant/project-creation/config';
import {
  showSuccessNotification,
  showRoleError
} from '../components/tenant/project-creation/errors';

/**
 * Hook options
 */
export interface UseProjectWizardOptions {
  tenantId: string;
  availableProviders: string[];
  onSuccess?: () => void;
}

/**
 * Hook return type
 */
export interface UseProjectWizardReturn {
  wizard: ReturnType<typeof useWizardState<ProjectFormData>>;
  isLoading: boolean;
}

/**
 * Custom hook for project creation wizard
 */
export function useProjectWizard({
  tenantId,
  availableProviders,
  onSuccess
}: UseProjectWizardOptions): UseProjectWizardReturn {
  const { createProject, isLoading } = useCreateProject(tenantId);

  // Handle form submission
  const handleSubmit = useCallback(async (values: ProjectFormData) => {
    try {
      await createProject({
        name: values.name,
        description: `Project using ${values.provider} at ${values.folderPath}`,
        provider: values.provider,
        folderPath: values.folderPath,
        tenantId
      });

      showSuccessNotification();
      onSuccess?.();
    } catch (error) {
      if (error.status === 403) {
        showRoleError();
        return;
      }
      handleApiError(error, 'Failed to create project');
    }
  }, [createProject, onSuccess, tenantId]);

  // Initialize wizard
  const wizard = useWizardState<ProjectFormData>(
    STEPS.map(step => ({
      ...step,
      props: {
        tenantId,
        availableProviders
      }
    })),
    {
      name: '',
      provider: availableProviders[0] || '',
      folderPath: ''
    }
  );

  // Create form object
  const form = {
    values: wizard.data,
    errors: wizard.errors,
    setFieldValue: wizard.setData,
    isValid: () => Object.keys(wizard.errors).length === 0
  };

  // Create state object with navigation handlers
  const state = {
    state: wizard.isSubmitting ? 'submitting' : 'idle',
    activeStep: wizard.currentStep,
    validatedSteps: wizard.steps.map(step => step.isValid),
    canNavigateToStep: (step: number) => step <= Math.max(...wizard.steps.map((s, i) => s.isValid ? i + 1 : 0)),
    handleNext: wizard.next,
    handlePrev: wizard.prev,
    handleSubmit: () => handleSubmit(wizard.data),
    handleReset: wizard.reset,
    goToStep: wizard.goToStep
  };

  return {
    form,
    state,
    isLoading
  };
}