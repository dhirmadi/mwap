/**
 * @fileoverview Type definitions for project creation wizard
 * @module project-creation/types
 */

import { IntegrationProvider } from '../../../types/integration';
import { WizardStepConfig } from '../../wizard/types';

/**
 * Form values for project creation
 * @interface ProjectFormData
 */
export interface ProjectFormData {
  name: string;
  cloudProvider: IntegrationProvider;
  folderPath: string;
}

/**
 * Props for project creation steps
 * @interface ProjectStepProps
 */
export interface ProjectStepProps {
  tenantId: string;
  availableProviders: string[];
  isLoading?: boolean;
}

/**
 * Step configuration for project creation
 * @type ProjectStepConfig
 */
export type ProjectStepConfig = WizardStepConfig<ProjectFormData> & {
  tenantId: string;
  availableProviders: string[];
};

/**
 * Validation rules for project creation form
 * @interface ValidationRule
 */
export interface ValidationRule {
  required?: string;
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  description: string;
}

/**
 * Validation rules for project creation form
 * @interface ValidationRules
 */
export interface ValidationRules {
  name: ValidationRule;
  cloudProvider: ValidationRule;
  folderPath: ValidationRule;
}

/**
 * Validation function type
 * @type ValidateFunction
 */
export type ValidateFunction<T> = (value: T) => Promise<string | null>;