/**
 * @fileoverview Wizard component
 * @module components/wizard/Wizard
 */

import { useMemo } from 'react';
import { WizardStepConfig, WizardStepProps } from './types';
import { useWizard } from './WizardProvider';

interface WizardProps<T extends Record<string, unknown>> {
  steps: WizardStepConfig<T>[];
}

/**
 * Wizard component that renders the current step
 */
export function Wizard<T extends Record<string, unknown>>({ steps }: WizardProps<T>) {
  const {
    state,
    setData,
    isLoading
  } = useWizard<T>();

  // Get current step configuration
  const currentStep = useMemo(() => {
    return steps[state.currentStep];
  }, [steps, state.currentStep]);

  // Create props for current step
  const stepProps = useMemo<WizardStepProps<T>>(() => ({
    data: state.data,
    isValid: state.isValid,
    isLoading,
    onChange: setData
  }), [state.data, state.isValid, isLoading, setData]);

  // Render current step
  return currentStep ? currentStep.render(stepProps) : null;
}