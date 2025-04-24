/**
 * @fileoverview Project creation wizard hook
 * @module hooks/useProjectWizard
 */

import { useCallback, useEffect } from 'react';
import { useWizardState } from './useWizardState';
import { useProjectValidation } from './useProjectValidation';
import { useProjectSubmission } from './useProjectSubmission';
import { ProjectFormData } from '../components/tenant/project-creation/types';
import { STEPS } from '../components/tenant/project-creation/config';

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
  currentStep: number;
  data: ProjectFormData;
  isValid: boolean;
  isLoading: boolean;
  setStep: (step: number) => void;
  setData: (data: Partial<ProjectFormData>) => void;
  canGoNext: () => boolean;
  canGoPrev: () => boolean;
  submit: () => Promise<void>;
  reset: () => void;
}

/**
 * Project creation wizard hook
 */
export function useProjectWizard({
  tenantId,
  availableProviders,
  onSuccess
}: UseProjectWizardOptions): UseProjectWizardReturn {
  const {
    state,
    setStep,
    setData,
    setValid,
    reset,
    canGoNext,
    canGoPrev
  } = useWizardState<ProjectFormData>(STEPS);

  const { validateStep } = useProjectValidation();
  const { submit: submitProject } = useProjectSubmission();

  // Validate current step when data changes
  useEffect(() => {
    const currentStepConfig = STEPS[state.currentStep];
    if (!currentStepConfig) return;

    validateStep(state.data, currentStepConfig.fields)
      .then(isValid => setValid(isValid));
  }, [state.data, state.currentStep, validateStep, setValid]);

  // Handle form submission
  const submit = useCallback(async () => {
    const project = await submitProject(state.data);
    if (project) {
      onSuccess?.();
    }
  }, [state.data, submitProject, onSuccess]);

  // Track validated steps
  const validatedSteps = new Set<number>();
  if (state.isValid) {
    validatedSteps.add(state.currentStep);
  }

  // Form interface
  const form = {
    values: state.data,
    errors: {},  // Errors handled by validation hook
    setFieldValue: (field: keyof ProjectFormData, value: any) => {
      setData({ [field]: value });
    },
    isValid: () => state.isValid
  };

  // Wizard state interface
  const wizardState = {
    state: state.isValid ? 'valid' : 'validating',
    activeStep: state.currentStep,
    validatedSteps,
    canNavigateToStep: (step: number) => step <= state.currentStep,
    handleNext: () => canGoNext() && setStep(state.currentStep + 1),
    handlePrev: () => canGoPrev() && setStep(state.currentStep - 1),
    handleSubmit: submit,
    handleReset: reset,
    goToStep: setStep
  };

  return {
    form,
    state: wizardState,
    isLoading: false
  };
}