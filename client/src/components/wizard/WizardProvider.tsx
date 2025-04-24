/**
 * @fileoverview Provider component for wizard context
 * @module components/wizard/WizardProvider
 */

import { createContext, useContext, useMemo } from 'react';
import { WizardState, WizardProviderProps } from './types';
import { useWizardState } from '../../hooks/useWizardState';

// Create context with type safety
const WizardContext = createContext<WizardState<Record<string, unknown>> | null>(null);

/**
 * Hook to access wizard context
 * @throws {Error} If used outside of WizardProvider
 */
export function useWizard<T extends Record<string, unknown>>() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within WizardProvider');
  }
  return context as WizardState<T>;
}

/**
 * Provider component that manages wizard state and behavior
 */
export function WizardProvider<T extends Record<string, unknown>>({
  children,
  steps,
  initialData,
  onSubmit
}: WizardProviderProps<T>) {
  const {
    state,
    setStep,
    setData,
    setValid,
    reset,
    canGoNext,
    canGoPrev
  } = useWizardState<T>(steps);

  // Initialize with initial data if provided
  useMemo(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData, setData]);

  const value = useMemo(() => ({
    state,
    setStep,
    setData,
    setValid,
    reset,
    canGoNext,
    canGoPrev,
    onSubmit
  }), [state, setStep, setData, setValid, reset, canGoNext, canGoPrev, onSubmit]);

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}