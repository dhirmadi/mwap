/**
 * @fileoverview Project creation wizard hook that manages form state and wizard navigation
 * @module hooks/useProjectWizard
 */

import { useCallback, useEffect } from 'react';
import { useWizardState } from './useWizardState';
import { useProjectValidation } from './useProjectValidation';
import { useProjectSubmission } from './useProjectSubmission';
import { ProjectFormData } from '../components/tenant/project-creation/types';
import { STEPS } from '../components/tenant/project-creation/config';

/**
 * Hook options for project wizard configuration
 */
export interface UseProjectWizardOptions {
  /** ID of the tenant where the project will be created */
  tenantId: string;
  /** List of available cloud providers */
  availableProviders: string[];
  /** Optional callback when project creation succeeds */
  onSuccess?: () => void;
}

/**
 * Form interface returned by the hook
 */
export interface ProjectWizardForm {
  /** Current form values */
  values: ProjectFormData;
  /** Form validation errors */
  errors: Record<string, string>;
  /** Updates a single form field */
  setFieldValue: (field: keyof ProjectFormData, value: any) => void;
  /** Checks if form is valid */
  isValid: () => boolean;
}

/**
 * Wizard state interface returned by the hook
 */
export interface ProjectWizardState {
  /** Current wizard state (validating/valid) */
  state: string;
  /** Current active step index */
  activeStep: number;
  /** Set of validated step indices */
  validatedSteps: Set<number>;
  /** Checks if a step can be navigated to */
  canNavigateToStep: (step: number) => boolean;
  /** Moves to next step if possible */
  handleNext: () => void;
  /** Moves to previous step if possible */
  handlePrev: () => void;
  /** Submits the form */
  handleSubmit: () => Promise<void>;
  /** Resets the wizard state */
  handleReset: () => void;
  /** Navigates to a specific step */
  goToStep: (step: number) => void;
}

/**
 * Hook return type with form and wizard state
 */
export interface UseProjectWizardReturn {
  /** Form state and methods */
  form: ProjectWizardForm;
  /** Wizard navigation state and methods */
  state: ProjectWizardState;
  /** Loading state */
  isLoading: boolean;
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