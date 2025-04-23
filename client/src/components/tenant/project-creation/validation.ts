/**
 * @fileoverview Validation functions for project creation
 * @module project-creation/validation
 */

import { ValidationRules, ValidateFunction } from './types';
import { IntegrationProvider } from '../../../types/integration';

/**
 * Validation rules for project creation form
 * @constant {ValidationRules}
 */
export const VALIDATION_RULES: ValidationRules = {
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
 * Validates project name field
 * @function validateName
 */
export const validateName: ValidateFunction<string> = async (value) => {
  if (!value) {
    return VALIDATION_RULES.name.required;
  }

  if (value.length < VALIDATION_RULES.name.min!.value) {
    return VALIDATION_RULES.name.min!.message;
  }

  if (value.length > VALIDATION_RULES.name.max!.value) {
    return VALIDATION_RULES.name.max!.message;
  }

  return null;
};

/**
 * Validates cloud provider field
 * @function validateProvider
 */
export const validateProvider: ValidateFunction<IntegrationProvider> = async (value) => {
  if (!value) {
    return VALIDATION_RULES.provider.required;
  }

  return null;
};

/**
 * Validates folder path field
 * @function validateFolderPath
 */
export const validateFolderPath: ValidateFunction<string> = async (value) => {
  if (!value) {
    return VALIDATION_RULES.folderPath.required;
  }

  if (value.length > VALIDATION_RULES.folderPath.max!.value) {
    return VALIDATION_RULES.folderPath.max!.message;
  }

  return null;
};