/**
 * @fileoverview Project wizard state management
 * @module state/projectState
 */

import { useCallback, useReducer } from 'react';
import { ProjectWizardState, FormState, StepState } from './types/state';
import { validateProjectForm } from '../validation/projectValidation';

/**
 * Action types
 */
type Action =
  | { type: 'SET_FIELD_VALUE'; field: string; value: any }
  | { type: 'SET_FIELD_ERROR'; field: string; error: string }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: number }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_SUBMITTED'; isSubmitted: boolean }
  | { type: 'SET_FORM_ERROR'; error: string }
  | { type: 'RESET_FORM' };

/**
 * Initial form state
 */
const initialFormState: FormState = {
  fields: {},
  isSubmitting: false,
  isSubmitted: false
};

/**
 * Initial wizard state
 */
const initialState: ProjectWizardState = {
  form: initialFormState,
  steps: [],
  currentStep: 0
};

/**
 * State reducer
 */
function reducer(state: ProjectWizardState, action: Action): ProjectWizardState {
  switch (action.type) {
    case 'SET_FIELD_VALUE':
      return {
        ...state,
        form: {
          ...state.form,
          fields: {
            ...state.form.fields,
            [action.field]: {
              ...state.form.fields[action.field],
              value: action.value,
              touched: true
            }
          }
        }
      };

    case 'SET_FIELD_ERROR':
      return {
        ...state,
        form: {
          ...state.form,
          fields: {
            ...state.form.fields,
            [action.field]: {
              ...state.form.fields[action.field],
              error: action.error
            }
          }
        }
      };

    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.steps.length - 1),
        steps: state.steps.map((step, i) =>
          i === state.currentStep ? { ...step, visited: true } : step
        )
      };

    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0)
      };

    case 'GO_TO_STEP':
      return {
        ...state,
        currentStep: Math.max(0, Math.min(action.step, state.steps.length - 1))
      };

    case 'SET_SUBMITTING':
      return {
        ...state,
        form: {
          ...state.form,
          isSubmitting: action.isSubmitting
        }
      };

    case 'SET_SUBMITTED':
      return {
        ...state,
        form: {
          ...state.form,
          isSubmitted: action.isSubmitted
        }
      };

    case 'SET_FORM_ERROR':
      return {
        ...state,
        form: {
          ...state.form,
          error: action.error
        }
      };

    case 'RESET_FORM':
      return {
        ...initialState,
        steps: state.steps.map(step => ({
          ...step,
          isComplete: false,
          visited: false,
          error: undefined
        }))
      };

    default:
      return state;
  }
}

/**
 * Project wizard state hook
 */
export function useProjectWizardState(steps: string[]) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    steps: steps.map(id => ({
      id,
      isComplete: false,
      visited: false
    }))
  });

  const setFieldValue = useCallback((field: string, value: any) => {
    dispatch({ type: 'SET_FIELD_VALUE', field, value });
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    dispatch({ type: 'SET_FIELD_ERROR', field, error });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const goToStep = useCallback((step: number) => {
    dispatch({ type: 'GO_TO_STEP', step });
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', isSubmitting });
  }, []);

  const setSubmitted = useCallback((isSubmitted: boolean) => {
    dispatch({ type: 'SET_SUBMITTED', isSubmitted });
  }, []);

  const setFormError = useCallback((error: string) => {
    dispatch({ type: 'SET_FORM_ERROR', error });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  const validateForm = useCallback(async () => {
    const values = Object.fromEntries(
      Object.entries(state.form.fields).map(([field, { value }]) => [field, value])
    );
    const result = await validateProjectForm(values);
    
    if (!result.isValid) {
      Object.entries(result.results).forEach(([field, { error }]) => {
        if (error) setFieldError(field, error);
      });
      if (result.error) setFormError(result.error);
    }

    return result.isValid;
  }, [state.form.fields, setFieldError, setFormError]);

  return {
    state,
    setFieldValue,
    setFieldError,
    nextStep,
    prevStep,
    goToStep,
    setSubmitting,
    setSubmitted,
    setFormError,
    resetForm,
    validateForm
  };
}