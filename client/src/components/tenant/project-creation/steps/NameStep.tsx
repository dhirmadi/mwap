/**
 * @fileoverview Project name input step
 * @module project-creation/steps/NameStep
 */

import { TextInput } from '@mantine/core';
import { createWizardStep } from '../../../wizard/WizardStep';
import { ProjectFormData } from '../types';
import { VALIDATION_RULES } from '../validation';

/**
 * Project name input step
 * @component
 */
export const NameStep = createWizardStep<ProjectFormData>({
  label: 'Project Name',
  fields: ['name'],
  render: ({ data, onChange, error, isLoading }) => (
    <TextInput
      label="Project Name"
      placeholder="Enter project name"
      required
      description={VALIDATION_RULES.name.description}
      error={error}
      value={data.name}
      onChange={(e) => onChange('name', e.target.value)}
      disabled={isLoading}
    />
  )
});