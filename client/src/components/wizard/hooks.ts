/**
 * @fileoverview Custom hooks for wizard functionality
 * @module components/wizard/hooks
 */

import { useState, useCallback, useMemo } from 'react';
import { WizardState, WizardStepConfig } from './types';

/**
 * Hook for managing wizard state
 */
export function useWizardState<T extends Record<string, unknown>>(
  steps: WizardStepConfig<T>[],
  initialData?: Partial<T>
) {
  // Initialize state
  const [state, setState] = useState<WizardState<T>>({
    currentStep: 0,
    steps: steps.map(step => ({
      id: step.id,
      isValid: false,
      isDirty: false,
      data: {}
    })),
    data: initialData as T || {} as T,
    isSubmitting: false,
    errors: {}
  });

  // Navigation
  const next = useCallback(async () => {
    const currentConfig = steps[state.currentStep];
    if (currentConfig.validation) {
      const isValid = await currentConfig.validation(state.data);
      if (!isValid) return;
    }
    setState(s => ({
      ...s,
      currentStep: Math.min(s.currentStep + 1, steps.length - 1)
    }));
  }, [state.currentStep, state.data, steps]);

  const prev = useCallback(() => {
    setState(s => ({
      ...s,
      currentStep: Math.max(s.currentStep - 1, 0)
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState(s => ({
      ...s,
      currentStep: Math.max(0, Math.min(step, steps.length - 1))
    }));
  }, [steps.length]);

  // Data management
  const setData = useCallback((field: keyof T, value: unknown) => {
    setState(s => ({
      ...s,
      data: { ...s.data, [field]: value },
      steps: s.steps.map((step, i) => 
        i === s.currentStep ? { ...step, isDirty: true } : step
      )
    }));
  }, []);

  // Validation
  const validate = useCallback(async () => {
    const currentConfig = steps[state.currentStep];
    if (!currentConfig.validation) return true;

    try {
      const isValid = await currentConfig.validation(state.data);
      setState(s => ({
        ...s,
        steps: s.steps.map((step, i) =>
          i === s.currentStep ? { ...step, isValid } : step
        )
      }));
      return isValid;
    } catch (error) {
      setState(s => ({
        ...s,
        errors: { 
          ...s.errors, 
          [currentConfig.id]: error instanceof Error ? error.message : 'Validation failed'
        }
      }));
      return false;
    }
  }, [state.currentStep, state.data, steps]);

  // Reset
  const reset = useCallback(() => {
    setState({
      currentStep: 0,
      steps: steps.map(step => ({
        id: step.id,
        isValid: false,
        isDirty: false,
        data: {}
      })),
      data: initialData as T || {} as T,
      isSubmitting: false,
      errors: {}
    });
  }, [initialData, steps]);

  return useMemo(
    () => ({
      ...state,
      next,
      prev,
      goToStep,
      setData,
      validate,
      reset
    }),
    [state, next, prev, goToStep, setData, validate, reset]
  );
}