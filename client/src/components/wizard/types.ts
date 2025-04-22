/**
 * @fileoverview Type definitions for wizard components
 * @module components/wizard/types
 */

import { ReactNode } from 'react';

/**
 * Base type for wizard step data
 */
export interface WizardStepData {
  id: string;
  isValid: boolean;
  isDirty: boolean;
  data: Record<string, unknown>;
}

/**
 * Wizard step configuration
 */
export interface WizardStepConfig<T extends Record<string, unknown>> {
  id: string;
  label: string;
  description?: string;
  fields: Array<keyof T>;
  validation?: (data: T) => Promise<boolean>;
  render: (props: WizardStepProps<T>) => ReactNode;
}

/**
 * Props passed to each wizard step
 */
export interface WizardStepProps<T extends Record<string, unknown>> {
  data: T;
  onChange: (field: keyof T, value: unknown) => void;
  onValidate: () => Promise<boolean>;
  isValid: boolean;
  isDirty: boolean;
  isLoading: boolean;
  error?: string;
}

/**
 * Wizard context state
 */
export interface WizardState<T extends Record<string, unknown>> {
  currentStep: number;
  steps: WizardStepData[];
  data: T;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

/**
 * Wizard context value
 */
export interface WizardContextValue<T extends Record<string, unknown>> extends WizardState<T> {
  next: () => Promise<void>;
  prev: () => void;
  goToStep: (step: number) => void;
  setData: (field: keyof T, value: unknown) => void;
  validate: () => Promise<boolean>;
  submit: () => Promise<void>;
  reset: () => void;
}

/**
 * Props for WizardProvider component
 */
export interface WizardProviderProps<T extends Record<string, unknown>> {
  children: ReactNode;
  steps: WizardStepConfig<T>[];
  initialData?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
  onError?: (error: Error) => void;
}