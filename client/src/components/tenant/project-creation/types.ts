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
  provider: IntegrationProvider;
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

// Validation types moved to /validation/types/rules.ts
export type { ValidationRule, ValidationRules, ValidateFunction } from '../../../validation/types/rules';