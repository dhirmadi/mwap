/**
 * @fileoverview Form state machine hook for managing multi-step form state
 * @module hooks/useFormStateMachine
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { UseFormReturnType } from '@mantine/form';
import { ValidationError, ErrorCode } from '../core/errors/types';
import { handleError } from '../core/errors/handler';

/**
 * Form state machine states
 */
export type FormState =
  | 'initial'     // Form just mounted
  | 'editing'     // User is editing current step
  | 'validating'  // Validating current step
  | 'submitting'  // Form is being submitted
  | 'error'       // Error state
  | 'success';    // Form submitted successfully

/**
 * Form state machine events
 */
export type FormEvent =
  | 'EDIT'        // User starts editing
  | 'VALIDATE'    // Validate current step
  | 'NEXT'        // Move to next step
  | 'PREV'        // Move to previous step
  | 'SUBMIT'      // Submit form
  | 'ERROR'       // Error occurred
  | 'RESET'       // Reset form
  | 'SUCCESS';    // Form submitted successfully

/**
 * Form state machine configuration
 */
export interface FormStateMachineConfig<T> {
  steps: Array<{
    validate: (values: T) => string | null;
    requiredFields: Array<keyof T>;
  }>;
  onSubmit: (values: T) => Promise<void>;
}

/**
 * Form state machine hook options
 */
export interface UseFormStateMachineOptions<T> {
  form: UseFormReturnType<T>;
  config: FormStateMachineConfig<T>;
}

/**
 * Form state machine hook return type
 */
export interface UseFormStateMachineReturn {
  state: FormState;
  activeStep: number;
  validatedSteps: Set<number>;
  isStepValid: (step: number) => boolean;
  canNavigateToStep: (step: number) => boolean;
  handleNext: () => void;
  handlePrev: () => void;
  handleSubmit: () => Promise<void>;
  handleReset: () => void;
}

/**
 * Custom hook for managing form state machine
 * @template T Form values type
 */
export function useFormStateMachine<T extends Record<string, unknown>>({
  form,
  config
}: UseFormStateMachineOptions<T>): UseFormStateMachineReturn {
  // State
  const [state, setState] = useState<FormState>('initial');
  const [activeStep, setActiveStep] = useState(0);
  const [validatedSteps, setValidatedSteps] = useState<Set<number>>(new Set());
  const prevStateRef = useRef<FormState>(state);

  // Track state changes for cleanup
  useEffect(() => {
    prevStateRef.current = state;
    return () => {
      // Cleanup if component unmounts during async operations
      if (['validating', 'submitting'].includes(prevStateRef.current)) {
        setState('error');
      }
    };
  }, [state]);

  /**
   * Validate current step
   */
  const validateCurrentStep = useCallback(async () => {
    const step = config.steps[activeStep];
    if (!step) return false;

    try {
      // Validate step-specific logic
      const stepError = step.validate(form.values);
      if (stepError) {
        const error = new ValidationError(
          'Step validation failed',
          [{ field: String(step.requiredFields[0]), message: stepError }]
        );
        handleError(error, 'StepValidation');
        form.setFieldError(step.requiredFields[0], stepError);
        return false;
      }

      // Validate required fields
      const fieldErrors = step.requiredFields.reduce((errors, field) => {
        const error = form.validateField(field);
        if (error) errors[field] = error;
        return errors;
      }, {} as Record<string, string>);

      if (Object.keys(fieldErrors).length > 0) {
        const error = new ValidationError(
          'Field validation failed',
          Object.entries(fieldErrors).map(([field, message]) => ({
            field,
            message
          }))
        );
        handleError(error, 'FieldValidation');
        Object.entries(fieldErrors).forEach(([field, message]) => {
          form.setFieldError(field as keyof T, message);
        });
        return false;
      }

    // Clear any previous errors and mark step as validated
    step.requiredFields.forEach(field => form.clearFieldError(field));
    setValidatedSteps(prev => new Set([...prev, activeStep]));
    return true;
  } catch (error) {
    return false;
  }
}, [activeStep, config.steps, form]);

  /**
   * Check if a step is valid
   */
  const isStepValid = useCallback((step: number) => {
    return validatedSteps.has(step);
  }, [validatedSteps]);

  /**
   * Check if can navigate to a step
   */
  const canNavigateToStep = useCallback((targetStep: number) => {
    // Can always go back
    if (targetStep < activeStep) return true;
    // Can only go forward if all previous steps are validated
    for (let i = 0; i < targetStep; i++) {
      if (!isStepValid(i)) return false;
    }
    return true;
  }, [activeStep, isStepValid]);

  /**
   * Handle next step
   */
  const handleNext = useCallback(async () => {
    setState('validating');
    const isValid = await validateCurrentStep();
    
    if (isValid) {
      if (activeStep < config.steps.length - 1) {
        setActiveStep(step => step + 1);
        setState('editing');
      } else {
        setState('error');
      }
    } else {
      setState('error');
    }
  }, [activeStep, config.steps.length, validateCurrentStep]);

  /**
   * Handle previous step
   */
  const handlePrev = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(step => step - 1);
      setState('editing');
    }
  }, [activeStep]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    setState('validating');
    const isValid = await validateCurrentStep();
    
    if (isValid) {
      // Verify all steps are validated
      for (let i = 0; i < config.steps.length; i++) {
        if (!isStepValid(i)) {
          setState('error');
          return;
        }
      }

      setState('submitting');
      try {
        await config.onSubmit(form.values);
        setState('success');
      } catch (error) {
        setState('error');
        handleError(error, 'FormSubmission');
        throw error;
      }
    } else {
      setState('error');
    }
  }, [config, form.values, isStepValid, validateCurrentStep]);

  /**
   * Handle form reset
   */
  const handleReset = useCallback(() => {
    setActiveStep(0);
    setValidatedSteps(new Set());
    setState('initial');
    form.reset();
  }, [form]);

  return {
    state,
    activeStep,
    validatedSteps,
    isStepValid,
    canNavigateToStep,
    handleNext,
    handlePrev,
    handleSubmit,
    handleReset
  };
}