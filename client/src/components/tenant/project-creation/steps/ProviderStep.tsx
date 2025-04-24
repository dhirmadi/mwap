/**
 * @fileoverview Cloud provider selection step
 * @module project-creation/steps/ProviderStep
 */

import { Select, Stack, Alert } from '@mantine/core';
import { createWizardStep } from '../../../wizard/WizardStep';
import { ProjectFormData, ProjectStepProps } from '../types';
import { PROVIDER_LABELS } from '../../../../types/integration';
import { PROJECT_RULES } from '../../../../validation/projectValidation';

/**
 * Cloud provider selection step
 * @component
 */
export const ProviderStep = createWizardStep<ProjectFormData>({
  label: 'Cloud Provider',
  fields: ['provider'],
  render: ({ data, onChange, error, isLoading, props }) => {
    const { availableProviders } = props as ProjectStepProps;

    return (
      <Stack>
        <Select
          label="Cloud Provider"
          placeholder="Select cloud provider"
          data={availableProviders.map(provider => ({
            value: provider,
            label: PROVIDER_LABELS[provider]
          }))}
          required
          description={PROJECT_RULES.provider.description}
          error={error}
          value={data.provider}
          onChange={(value) => onChange('provider', value)}
          disabled={isLoading}
        />

        {availableProviders.length === 0 && (
          <Alert color="red" title="No Providers">
            No cloud providers connected. Please connect a cloud provider first.
          </Alert>
        )}
      </Stack>
    );
  }
});