/**
 * @fileoverview Validation rule type definitions for form validation
 * @module validation/types/rules
 * 
 * This module defines the type system for form validation rules.
 * It provides a flexible and extensible validation framework that supports:
 * - Built-in validation rules (required, min, max)
 * - Custom validation functions
 * - Async validation
 * - Cross-field validation
 * - Type-safe validation
 * 
 * @example
 * ```ts
 * // Define validation rules
 * const rules: ValidationRuleSet = {
 *   name: {
 *     required: 'Name is required',
 *     min: { value: 2, message: 'Name too short' }
 *   },
 *   email: {
 *     required: 'Email is required',
 *     validate: async (value) => {
 *       const isValid = await checkEmailExists(value);
 *       return isValid ? null : 'Email already exists';
 *     }
 *   }
 * };
 * 
 * // Create validator
 * const validate = createValidator(rules);
 * 
 * // Use in form
 * const errors = await validate(formData);
 * ```
 */

/**
 * Base validation rule interface
 * 
 * Defines the structure of a validation rule with built-in and custom validations.
 * 
 * @template T Type of value being validated
 * 
 * @example
 * ```ts
 * const nameRule: ValidationRule<string> = {
 *   required: 'Name is required',
 *   min: { value: 2, message: 'Name too short' },
 *   validate: async (value) => {
 *     return value.includes('@') ? 'Invalid name' : null;
 *   }
 * };
 * ```
 */
export interface ValidationRule<T = any> {
  /**
   * Whether the field is required
   * - If string, used as error message
   * - If true, uses default message
   */
  required?: string | boolean;

  /**
   * Minimum value/length constraint
   * - For strings: minimum length
   * - For numbers: minimum value
   * - For arrays: minimum length
   */
  min?: { value: number; message: string };

  /**
   * Maximum value/length constraint
   * - For strings: maximum length
   * - For numbers: maximum value
   * - For arrays: maximum length
   */
  max?: { value: number; message: string };

  /**
   * Field description for UI display
   * Used in error messages and form labels
   */
  description?: string;

  /**
   * Custom validation function
   * - Return null for valid
   * - Return error message for invalid
   * - Can be async for API validation
   */
  validate?: (value: T) => Promise<string | null> | string | null;
}

/**
 * Validation rules mapped by field name
 * 
 * A collection of validation rules for a form, where each key
 * is a field name and the value is its validation rule.
 * 
 * @example
 * ```ts
 * const rules: ValidationRuleSet = {
 *   username: {
 *     required: 'Username required',
 *     min: { value: 3, message: 'Too short' }
 *   },
 *   password: {
 *     required: 'Password required',
 *     validate: (value) => validatePassword(value)
 *   }
 * };
 * ```
 */
export interface ValidationRuleSet {
  [field: string]: ValidationRule;
}

/**
 * Validation function type
 * 
 * A function that validates a value and returns a Promise
 * resolving to either null (valid) or an error message.
 * 
 * @template T Type of value being validated
 * 
 * @example
 * ```ts
 * const validateEmail: ValidateFunction<string> = 
 *   async (email) => {
 *     const exists = await checkEmailExists(email);
 *     return exists ? 'Email taken' : null;
 *   };
 * ```
 */
export type ValidateFunction<T> = (value: T) => Promise<string | null>;

/**
 * Validation context for field validation
 * 
 * Provides access to the full form state during validation,
 * enabling cross-field validation rules.
 * 
 * @example
 * ```ts
 * function validatePasswordMatch(
 *   context: ValidationContext
 * ) {
 *   const { values, field, value } = context;
 *   return value === values.password
 *     ? null
 *     : 'Passwords must match';
 * }
 * ```
 */
export interface ValidationContext {
  /** All form values */
  values: Record<string, any>;
  
  /** Field being validated */
  field: string;
  
  /** Current field value */
  value: any;
}