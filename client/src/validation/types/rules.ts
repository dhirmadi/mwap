/**
 * @fileoverview Validation rule type definitions
 * @module validation/types/rules
 */

/**
 * Base validation rule interface
 */
export interface ValidationRule<T = any> {
  /** Whether the field is required */
  required?: string | boolean;
  /** Minimum value/length constraint */
  min?: { value: number; message: string };
  /** Maximum value/length constraint */
  max?: { value: number; message: string };
  /** Field description for UI */
  description?: string;
  /** Custom validation function */
  validate?: (value: T) => Promise<string | null> | string | null;
}

/**
 * Validation rules mapped by field name
 */
export interface ValidationRuleSet {
  [field: string]: ValidationRule;
}

/**
 * Validation function type
 */
export type ValidateFunction<T> = (value: T) => Promise<string | null>;

/**
 * Validation context for field validation
 */
export interface ValidationContext {
  /** All form values */
  values: Record<string, any>;
  /** Field being validated */
  field: string;
  /** Field value */
  value: any;
}