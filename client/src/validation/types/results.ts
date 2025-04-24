/**
 * @fileoverview Validation result type definitions
 * @module validation/types/results
 */

/**
 * Validation result for a single field
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Error message if validation failed */
  error: string | null;
  /** Field that was validated */
  field: string;
}

/**
 * Validation results for multiple fields
 */
export interface ValidationResults {
  /** Results mapped by field name */
  [field: string]: ValidationResult;
}

/**
 * Form-level validation result
 */
export interface FormValidationResult {
  /** Whether all validations passed */
  isValid: boolean;
  /** Field validation results */
  results: ValidationResults;
  /** Form-level error message */
  error?: string;
}