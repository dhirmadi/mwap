/**
 * @fileoverview State management type definitions
 * @module state/types/state
 */

/**
 * Form field state
 */
export interface FieldState<T = any> {
  /** Field value */
  value: T;
  /** Whether field has been touched */
  touched: boolean;
  /** Validation error message */
  error?: string;
}

/**
 * Form state
 */
export interface FormState {
  /** Field states mapped by field name */
  fields: Record<string, FieldState>;
  /** Whether form is being submitted */
  isSubmitting: boolean;
  /** Whether form has been submitted */
  isSubmitted: boolean;
  /** Form-level error message */
  error?: string;
}

/**
 * Step state
 */
export interface StepState {
  /** Step identifier */
  id: string;
  /** Whether step is complete */
  isComplete: boolean;
  /** Whether step has been visited */
  visited: boolean;
  /** Step validation error */
  error?: string;
}

/**
 * Project wizard state
 */
export interface ProjectWizardState {
  /** Current form state */
  form: FormState;
  /** Step states */
  steps: StepState[];
  /** Current step index */
  currentStep: number;
}