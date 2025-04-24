/**
 * @fileoverview Project validation hook
 * @module hooks/useProjectValidation
 */

import { useCallback } from 'react';
import { ProjectFormData } from '../components/tenant/project-creation/types';
import { validateProjectForm } from '../validation/projectValidation';
import { ValidationResult } from '../validation/types/results';

/**
 * Project validation hook
 */
export function useProjectValidation() {
  const validateStep = useCallback(async (data: ProjectFormData, fields: (keyof ProjectFormData)[]): Promise<boolean> => {
    const result = await validateProjectForm(data);
    return fields.every(field => result.results[field]?.isValid ?? false);
  }, []);

  const validateAll = useCallback(async (data: ProjectFormData): Promise<ValidationResult<ProjectFormData>> => {
    return validateProjectForm(data);
  }, []);

  return {
    validateStep,
    validateAll
  };
}