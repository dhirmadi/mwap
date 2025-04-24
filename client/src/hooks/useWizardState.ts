/**
 * @fileoverview Enhanced wizard state management hook with validation and navigation
 * @module hooks/useWizardState
 * 
 * This module provides a composable state management solution for multi-step forms.
 * It handles:
 * - Step navigation
 * - Form data management
 * - Validation state
 * - Reset functionality
 * 
 * @example
 * ```tsx
 * function MyWizard() {
 *   const {
 *     state,
 *     setStep,
 *     setData,
 *     setValid,
 *     reset,
 *     canGoNext,
 *     canGoPrev
 *   } = useWizardState(steps);
 * 
 *   return (
 *     <WizardContext.Provider value={state}>
 *       <WizardStep />
 *       <Navigation
 *         onNext={canGoNext ? () => setStep(state.currentStep + 1) : undefined}
 *         onPrev={canGoPrev ? () => setStep(state.currentStep - 1) : undefined}
 *       />
 *     </WizardContext.Provider>
 *   );
 * }
 * ```
 */

import { useCallback, useReducer } from 'react';
import { WizardState, WizardAction, WizardStepConfig } from '../components/wizard/types';

/**
 * Reducer function type for wizard state management
 * @template T Form data type
 */
type WizardReducer<T> = (state: WizardState<T>, action: WizardAction<T>) => WizardState<T>;

/**
 * Creates a reducer function for wizard state management
 * 
 * @template T Form data type
 * @param steps Array of step configurations
 * @returns Reducer function for wizard state
 * 
 * Actions:
 * - SET_STEP: Navigate to specific step
 * - SET_DATA: Update form data
 * - SET_VALID: Update validation state
 * - RESET: Reset wizard to initial state
 * 
 * State Shape:
 * ```ts
 * {
 *   currentStep: number;
 *   data: T;
 *   isValid: boolean;
 * }
 * ```
 */
/**
 * Enhanced wizard state management hook
 * 
 * Provides a complete state management solution for multi-step forms with:
 * - Type-safe state updates
 * - Validation state tracking
 * - Navigation controls
 * - Reset functionality
 * 
 * @template T Form data type
 * @param steps Array of step configurations
 * @returns Object containing state and state management functions
 * 
 * @example
 * ```tsx
 * interface FormData {
 *   name: string;
 *   email: string;
 * }
 * 
 * function MyForm() {
 *   const {
 *     state: { data, currentStep },
 *     setData,
 *     canGoNext,
 *     setStep
 *   } = useWizardState<FormData>(steps);
 * 
 *   const handleChange = (field: keyof FormData) => (
 *     e: React.ChangeEvent<HTMLInputElement>
 *   ) => {
 *     setData({ [field]: e.target.value });
 *   };
 * 
 *   return (
 *     <form>
 *       <input
 *         value={data.name}
 *         onChange={handleChange('name')}
 *       />
 *       {canGoNext() && (
 *         <button onClick={() => setStep(currentStep + 1)}>
 *           Next
 *         </button>
 *       )}
 *     </form>
 *   );
 * }
 * ```
 */
export function useWizardState<T>(steps: WizardStepConfig<T>[]) {
  // Initialize state with reducer
  const [state, dispatch] = useReducer(createWizardReducer<T>(steps), {
    currentStep: 0,
    data: {} as T,
    isValid: false
  });

  /**
   * Navigate to a specific step
   * Resets validation state when changing steps
   */
  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  /**
   * Update form data
   * Accepts partial updates to maintain type safety
   */
  const setData = useCallback((data: Partial<T>) => {
    dispatch({ type: 'SET_DATA', payload: data });
  }, []);

  /**
   * Update validation state
   * Used by validation hooks to track validity
   */
  const setValid = useCallback((isValid: boolean) => {
    dispatch({ type: 'SET_VALID', payload: isValid });
  }, []);

  /**
   * Reset wizard to initial state
   * Clears data and resets to first step
   */
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  /**
   * Check if navigation to next step is allowed
   * Requires current step to be valid
   */
  const canGoNext = useCallback(() => {
    return state.currentStep < steps.length - 1 && state.isValid;
  }, [state.currentStep, state.isValid, steps.length]);

  /**
   * Check if navigation to previous step is allowed
   * Always allowed if not on first step
   */
  const canGoPrev = useCallback(() => {
    return state.currentStep > 0;
  }, [state.currentStep]);

  return {
    state,
    setStep,
    setData,
    setValid,
    reset,
    canGoNext,
    canGoPrev
  };
}