/**
 * @fileoverview Project creation form configuration and validation
 * @module project-creation/config
 */

import { IconCloudUpload, IconFolderPlus, IconFolderSearch, IconClipboardCheck } from '@tabler/icons-react';
import { IntegrationProvider, PROVIDER_LABELS } from '../../../types/integration';
import { ValidationRules, ValidateFunction, StepValidateFunction, validateField } from '../../../types/validation';

/**
 * Form values for project creation
 * @interface FormValues
 * @property {string} name - Project name (3-50 characters)
 * @property {IntegrationProvider} cloudProvider - Selected cloud storage provider
 * @property {string} folderPath - Selected folder path in cloud storage
 */
export interface FormValues {
  name: string;
  cloudProvider: IntegrationProvider;
  folderPath: string;
}

/**
 * Validation rules for project creation form
 * @constant {ValidationRules<FormValues>}
 */
export const VALIDATION_RULES: ValidationRules<FormValues> = {
  name: {
    required: 'Name is required',
    min: { value: 3, message: 'Name must be at least 3 characters' },
    max: { value: 50, message: 'Name must be at most 50 characters' },
    description: 'Project name should be 3-50 characters long'
  },
  cloudProvider: {
    required: 'Cloud provider is required',
    description: 'Select where to store project files'
  },
  folderPath: {
    required: 'Folder path is required',
    max: { value: 200, message: 'Folder path must be at most 200 characters' },
    description: 'Double-click a folder to select it as the project location'
  }
} as const;

/**
 * Configuration for a form step
 * @interface StepConfig
 * @property {string} label - Step label shown in stepper
 * @property {string} description - Step description
 * @property {typeof IconCloudUpload} icon - Step icon component
 * @property {keyof FormValues} field - Primary form field for this step
 * @property {Array<keyof FormValues>} requiredFields - Fields that must be valid to proceed
 * @property {StepValidateFunction<FormValues>} [validateStep] - Custom step validation
 */
export interface StepConfig {
  label: string;
  description: string;
  icon: typeof IconCloudUpload;
  field: keyof FormValues;
  requiredFields: Array<keyof FormValues>;
  validateStep?: StepValidateFunction<FormValues>;
}

/**
 * Validates project name field
 * @function validateName
 * @param {string} value - Project name to validate
 * @returns {string | null} Error message or null if valid
 */
export const validateName: ValidateFunction<string> = (value) => 
  validateField('name', value, VALIDATION_RULES.name);

/**
 * Validates cloud provider field
 * @function validateProvider
 * @param {IntegrationProvider} value - Selected provider to validate
 * @returns {string | null} Error message or null if valid
 */
export const validateProvider: ValidateFunction<IntegrationProvider> = (value) =>
  validateField('cloudProvider', value, VALIDATION_RULES.cloudProvider);

/**
 * Validates folder path field
 * @function validateFolderPath
 * @param {string} value - Selected folder path to validate
 * @returns {string | null} Error message or null if valid
 */
export const validateFolderPath: ValidateFunction<string> = (value) =>
  validateField('folderPath', value, VALIDATION_RULES.folderPath);

/**
 * Form steps configuration
 * @constant {readonly StepConfig[]}
 * 
 * Each step represents a page in the form wizard:
 * 1. Cloud Provider Selection
 * 2. Project Name Input
 * 3. Folder Selection
 * 4. Final Review
 * 
 * Steps are validated sequentially, and users can only proceed
 * when all required fields for the current step are valid.
 */
export const STEPS: StepConfig[] = [
  {
    label: 'Cloud Provider',
    description: 'Select storage provider',
    icon: IconCloudUpload,
    field: 'cloudProvider',
    requiredFields: ['cloudProvider'],
    validateStep: (values) => validateProvider(values.cloudProvider)
  },
  {
    label: 'Project Name',
    description: 'Enter project name',
    icon: IconFolderPlus,
    field: 'name',
    requiredFields: ['name'],
    validateStep: (values) => validateName(values.name)
  },
  {
    label: 'Select Folder',
    description: 'Choose location',
    icon: IconFolderSearch,
    field: 'folderPath',
    requiredFields: ['folderPath', 'cloudProvider'],
    validateStep: (values) => validateFolderPath(values.folderPath)
  },
  {
    label: 'Review',
    description: 'Confirm details',
    icon: IconClipboardCheck,
    field: 'name',
    requiredFields: ['name', 'cloudProvider', 'folderPath'],
    validateStep: (values) => {
      // Validate all fields in sequence
      const nameError = validateName(values.name);
      if (nameError) return nameError;

      const providerError = validateProvider(values.cloudProvider);
      if (providerError) return providerError;

      const folderError = validateFolderPath(values.folderPath);
      if (folderError) return folderError;

      return null;
    }
  }
] as const;