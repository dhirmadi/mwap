/**
 * @fileoverview Project validation module
 * @module validation/projectValidation
 */

import { ValidationRule, ValidationRuleSet, ValidateFunction, ValidationContext } from './types/rules';
import { ValidationResult, FormValidationResult } from './types/results';
import { IntegrationProvider } from '../types/integration';

/**
 * Project validation rules
 */
export const PROJECT_RULES: ValidationRuleSet = {
  name: {
    required: 'Name is required',
    min: { value: 3, message: 'Name must be at least 3 characters' },
    max: { value: 50, message: 'Name must be at most 50 characters' },
    description: 'Project name should be 3-50 characters long'
  },
  provider: {
    required: 'Cloud provider is required',
    description: 'Select where to store project files'
  },
  folderPath: {
    required: 'Folder path is required',
    max: { value: 200, message: 'Folder path must be at most 200 characters' },
    description: 'Select a folder by checking the box or double-clicking it'
  }
} as const;

/**
 * Creates a field validator function from a validation rule
 */
export function createFieldValidator<T>(rule: ValidationRule<T>): ValidateFunction<T> {
  return async (value: T): Promise<string | null> => {
    // Required check
    if (rule.required && !value) {
      return typeof rule.required === 'string' ? rule.required : 'Field is required';
    }

    // Skip other validations if empty and not required
    if (!value) return null;

    // Min/max for strings/arrays
    if (typeof value === 'string' || Array.isArray(value)) {
      if (rule.min && value.length < rule.min.value) {
        return rule.min.message;
      }
      if (rule.max && value.length > rule.max.value) {
        return rule.max.message;
      }
    }

    // Custom validation
    if (rule.validate) {
      return rule.validate(value);
    }

    return null;
  };
}

/**
 * Validates a single field
 */
export async function validateField(
  field: string,
  value: any,
  rules: ValidationRuleSet
): Promise<ValidationResult> {
  const rule = rules[field];
  if (!rule) {
    return { isValid: true, error: null, field };
  }

  const validator = createFieldValidator(rule);
  const error = await validator(value);

  return {
    isValid: !error,
    error,
    field
  };
}

/**
 * Validates project name
 */
export const validateProjectName: ValidateFunction<string> = 
  createFieldValidator(PROJECT_RULES.name);

/**
 * Validates cloud provider
 */
export const validateProjectProvider: ValidateFunction<IntegrationProvider> = 
  createFieldValidator(PROJECT_RULES.provider);

/**
 * Validates folder path
 */
export const validateProjectFolder: ValidateFunction<string> = 
  createFieldValidator(PROJECT_RULES.folderPath);

/**
 * Validates all project fields
 */
export async function validateProjectForm(values: Record<string, any>): Promise<FormValidationResult> {
  const results: Record<string, ValidationResult> = {};
  let isValid = true;

  // Validate each field
  for (const [field, rule] of Object.entries(PROJECT_RULES)) {
    const result = await validateField(field, values[field], PROJECT_RULES);
    results[field] = result;
    if (!result.isValid) isValid = false;
  }

  return {
    isValid,
    results,
    error: isValid ? undefined : 'Please fix the validation errors'
  };
}