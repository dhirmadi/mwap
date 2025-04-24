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
    console.group('[PROJECT WIZARD] Submit Process');
    console.log('[STEP 1] Current Form Data', {
      name: values.name,
      provider: values.provider,
      folderPath: values.folderPath,
      tenantId
    });

    try {
      console.log('[STEP 2] Preparing Project Request', {
        name: values.name,
        description: `Project using ${values.provider} at ${values.folderPath}`,
        provider: values.provider,
        folderPath: values.folderPath,
        tenantId
      });

      await createProject({
        name: values.name,
        description: `Project using ${values.provider} at ${values.folderPath}`,
        provider: values.provider,
        folderPath: values.folderPath,
        tenantId
      });

      console.log('[STEP 3] Project Created Successfully');
      showSuccessNotification();
      onSuccess?.();
    } catch (error: any) {
      console.group('[PROJECT WIZARD] Creation Error');
      console.error('Error Details:', {
        status: error.status,
        message: error.message,
        response: error.response?.data,
        request: {
          url: error.config?.url,
          method: error.config?.method,
          headers: {
            ...error.config?.headers,
            Authorization: error.config?.headers?.Authorization ? '[REDACTED]' : 'MISSING'
          },
          data: error.config?.data
        }
      });
      console.groupEnd();

      if (error.status === 403) {
        console.warn('[PROJECT WIZARD] Permission Denied - User lacks required role');
        showRoleError();
        return;
      }
      handleApiError(error, 'Failed to create project');
    } finally {
      console.groupEnd();
    }
  }, [createProject, onSuccess, tenantId]);

  // Initialize wizard with debugging
  console.group('[PROJECT WIZARD] Initialization');
  console.log('Initial Configuration:', {
    tenantId,
    availableProviders
  });

  const wizard = useWizardState<ProjectFormData>(
    STEPS.map(step => {
      console.log(`[WIZARD STEP] Configuring ${step.id}`, {
        label: step.label,
        fields: step.fields,
        validation: step.validation ? 'Configured' : 'None'
      });
      return {
        ...step,
        props: {
          tenantId,
          availableProviders
        }
      };
    }),
    {
      name: '',
      provider: availableProviders[0] || '',
      folderPath: ''
    }
  );
  console.groupEnd();

  // Create form object with debugging
  const form = {
    values: wizard.data,
    errors: wizard.errors,
    setFieldValue: (field: string, value: any) => {
      console.log('[PROJECT WIZARD] Field Update', {
        field,
        value,
        previousValue: wizard.data[field]
      });
      wizard.setData(field, value);
    },
    isValid: () => {
      const isValid = Object.keys(wizard.errors).length === 0;
      console.log('[PROJECT WIZARD] Form Validation', {
        isValid,
        errors: wizard.errors
      });
      return isValid;
    }
  };

  // Create state object with navigation handlers and debugging
  const state = {
    state: wizard.isSubmitting ? 'submitting' : 'idle',
    activeStep: wizard.currentStep,
    validatedSteps: wizard.steps.map(step => step.isValid),
    canNavigateToStep: (step: number) => {
      const canNavigate = step <= Math.max(...wizard.steps.map((s, i) => s.isValid ? i + 1 : 0));
      console.log('[PROJECT WIZARD] Navigation Check', {
        targetStep: step,
        canNavigate,
        validSteps: wizard.steps.map((s, i) => ({ step: i, isValid: s.isValid }))
      });
      return canNavigate;
    },
    handleNext: () => {
      console.log('[PROJECT WIZARD] Moving to Next Step', {
        currentStep: wizard.currentStep,
        nextStep: wizard.currentStep + 1
      });
      wizard.next();
    },
    handlePrev: () => {
      console.log('[PROJECT WIZARD] Moving to Previous Step', {
        currentStep: wizard.currentStep,
        prevStep: wizard.currentStep - 1
      });
      wizard.prev();
    },
    handleSubmit: () => {
      console.log('[PROJECT WIZARD] Initiating Submit', {
        currentStep: wizard.currentStep,
        formData: wizard.data,
        isValid: Object.keys(wizard.errors).length === 0
      });
      return handleSubmit(wizard.data);
    },
    handleReset: () => {
      console.log('[PROJECT WIZARD] Resetting Form');
      wizard.reset();
    },
    goToStep: (step: number) => {
      console.log('[PROJECT WIZARD] Direct Navigation', {
        fromStep: wizard.currentStep,
        toStep: step
      });
      wizard.goToStep(step);
    }
  };

  return {
    form,
    state,
    isLoading
  };
}