/**
 * @fileoverview Type definitions for wizard components
 * @module components/wizard/types
 */

import { ReactNode } from 'react';

/**
 * Wizard step configuration
 */
export interface WizardStepConfig<T extends Record<string, unknown>> {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType;
  fields: Array<keyof T>;
  render: (props: WizardStepProps<T>) => ReactNode;
}

/**
 * Props passed to each wizard step
 */
export interface WizardStepProps<T extends Record<string, unknown>> {
  data: T;
  isValid: boolean;
  isLoading: boolean;
  onChange: (data: Partial<T>) => void;
}

/**
 * Wizard state
 */
export interface WizardState<T extends Record<string, unknown>> {
  currentStep: number;
  data: T;
  isValid: boolean;
}

/**
 * Wizard action types
 */
export type WizardAction<T> =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_DATA'; payload: Partial<T> }
  | { type: 'SET_VALID'; payload: boolean }
  | { type: 'RESET' };

/**
 * Props for WizardProvider component
 */
export interface WizardProviderProps<T extends Record<string, unknown>> {
  children: ReactNode;
  steps: WizardStepConfig<T>[];
  initialData?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
}