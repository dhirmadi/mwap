/**
 * @fileoverview Validation types and utilities for form validation
 * @module validation
 */

/**
 * Represents a validation rule for a form field
 * @interface ValidationRule
 * @property {string} required - Error message for required field validation
 * @property {string} description - Description of the validation rule for UI display
 * @property {{ value: number; message: string }} [min] - Minimum length constraint
 * @property {{ value: number; message: string }} [max] - Maximum length constraint
 */
export interface ValidationRule {
  required: string;
  description: string;
  min?: { value: number; message: string };
  max?: { value: number; message: string };
}

/**
 * Maps form field names to their validation rules
 * @interface ValidationRules
 * @template T - Form values type
 */
export type ValidationRules<T extends Record<string, unknown>> = {
  [K in keyof T]: ValidationRule;
};

/**
 * Type guard to check if an object is a valid ValidationRule
 * @function isValidationRule
 * @param {unknown} obj - Object to check
 * @returns {boolean} True if obj is a ValidationRule
 */
export function isValidationRule(obj: unknown): obj is ValidationRule {
  if (!obj || typeof obj !== 'object') return false;
  const rule = obj as ValidationRule;
  return (
    typeof rule.required === 'string' &&
    typeof rule.description === 'string' &&
    (!rule.min || (typeof rule.min.value === 'number' && typeof rule.min.message === 'string')) &&
    (!rule.max || (typeof rule.max.value === 'number' && typeof rule.max.message === 'string'))
  );
}

/**
 * Represents a validation error
 * @interface ValidationError
 * @property {string} field - Name of the field with error
 * @property {string} message - Error message
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Type guard to check if an object is a ValidationError
 * @function isValidationError
 * @param {unknown} obj - Object to check
 * @returns {boolean} True if obj is a ValidationError
 */
export function isValidationError(obj: unknown): obj is ValidationError {
  if (!obj || typeof obj !== 'object') return false;
  const error = obj as ValidationError;
  return typeof error.field === 'string' && typeof error.message === 'string';
}

/**
 * Function type for validating a single field
 * @template T - Type of value being validated
 */
export type ValidateFunction<T> = (value: T) => string | null;

/**
 * Function type for validating a form step
 * @template T - Form values type
 */
export type StepValidateFunction<T extends Record<string, unknown>> = (values: T) => string | null;

/**
 * Validates a field value against validation rules
 * @function validateField
 * @template T - Form values type
 * @param {keyof T} field - Field name to validate
 * @param {unknown} value - Field value to validate
 * @param {ValidationRule} rules - Validation rules to apply
 * @returns {string | null} Error message or null if valid
 * 
 * @example
 * ```typescript
 * const rules: ValidationRule = {
 *   required: 'Name is required',
 *   description: 'Enter your name',
 *   min: { value: 2, message: 'Name too short' }
 * };
 * 
 * const error = validateField('name', '', rules);
 * // Returns: 'Name is required'
 * ```
 */
export function validateField<T extends Record<string, unknown>>(
  field: keyof T,
  value: unknown,
  rules: ValidationRule
): string | null {
  // Handle undefined/null
  if (value === undefined || value === null) return rules.required;
  
  // Handle non-string values (except for enums which are also strings)
  if (typeof value !== 'string' && !Object.values(value as object).includes(value)) {
    return `${String(field)} has invalid value`;
  }

  // For string values, check length constraints
  if (typeof value === 'string') {
    if (rules.min && value.length < rules.min.value) return rules.min.message;
    if (rules.max && value.length > rules.max.value) return rules.max.message;
  }

  return null;
}