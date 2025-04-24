/**
 * @fileoverview Enhanced wizard state management hook
 * @module hooks/useWizardState
 */

import { useCallback, useReducer } from 'react';
import { WizardState, WizardAction, WizardStepConfig } from '../components/wizard/types';

type WizardReducer<T> = (state: WizardState<T>, action: WizardAction<T>) => WizardState<T>;

/**
 * Creates wizard state reducer
 */
function createWizardReducer<T>(steps: WizardStepConfig<T>[]): WizardReducer<T> {
  return (state: WizardState<T>, action: WizardAction<T>): WizardState<T> => {
    switch (action.type) {
      case 'SET_STEP':
        return {
          ...state,
          currentStep: action.payload,
          isValid: false
        };

      case 'SET_DATA':
        return {
          ...state,
          data: { ...state.data, ...action.payload },
          isValid: false
        };

      case 'SET_VALID':
        return {
          ...state,
          isValid: action.payload
        };

      case 'RESET':
        return {
          currentStep: 0,
          data: {} as T,
          isValid: false
        };

      default:
        return state;
    }
  };
}

/**
 * Enhanced wizard state management hook
 */
export function useWizardState<T>(steps: WizardStepConfig<T>[]) {
  const [state, dispatch] = useReducer(createWizardReducer<T>(steps), {
    currentStep: 0,
    data: {} as T,
    isValid: false
  });

  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const setData = useCallback((data: Partial<T>) => {
    dispatch({ type: 'SET_DATA', payload: data });
  }, []);

  const setValid = useCallback((isValid: boolean) => {
    dispatch({ type: 'SET_VALID', payload: isValid });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const canGoNext = useCallback(() => {
    return state.currentStep < steps.length - 1 && state.isValid;
  }, [state.currentStep, state.isValid, steps.length]);

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