/**
 * @fileoverview Provider component for wizard context
 * @module components/wizard/WizardProvider
 */

import { createContext, useContext, useCallback } from 'react';
import { WizardContextValue, WizardProviderProps } from './types';
import { useWizardState } from './hooks';

// Create context with type safety
const WizardContext = createContext<WizardContextValue<Record<string, unknown>> | null>(null);

/**
 * Hook to access wizard context
 * @throws {Error} If used outside of WizardProvider
 */
export function useWizard<T extends Record<string, unknown>>() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within WizardProvider');
  }
  return context as WizardContextValue<T>;
}

/**
 * Provider component that manages wizard state and behavior
 */
export function WizardProvider<T extends Record<string, unknown>>({
  children,
  steps,
  initialData,
  onSubmit,
  onError
}: WizardProviderProps<T>) {
  const state = useWizardState(steps, initialData);

  const handleSubmit = useCallback(async () => {
    try {
      state.isSubmitting = true;
      await onSubmit(state.data);
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      }
      throw error;
    } finally {
      state.isSubmitting = false;
    }
  }, [onSubmit, onError, state]);

  const value: WizardContextValue<T> = {
    ...state,
    submit: handleSubmit
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}