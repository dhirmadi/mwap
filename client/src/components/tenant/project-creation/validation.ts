/**
 * @fileoverview Validation functions for project creation
 * @module project-creation/validation
 * @deprecated Use /validation/projectValidation.ts instead
 */

export {
  PROJECT_RULES as VALIDATION_RULES,
  validateProjectName as validateName,
  validateProjectProvider as validateProvider,
  validateProjectFolder as validateFolderPath
} from '../../../validation/projectValidation';