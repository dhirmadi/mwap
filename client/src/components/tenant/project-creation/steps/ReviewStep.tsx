/**
 * @fileoverview Final review step
 * @module project-creation/steps/ReviewStep
 */

import { Stack, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { createWizardStep } from '../../../wizard/WizardStep';
import { ProjectFormData } from '../types';
import { ReviewField } from '../ui';
import { PROVIDER_LABELS } from '../../../../types/integration';

/**
 * Final review step
 * @component
 */
export const ReviewStep = createWizardStep<ProjectFormData>({
  label: 'Review',
  fields: ['name', 'provider', 'folderPath'],
  render: ({ data, isLoading }) => (
    <Stack>
      <Alert 
        icon={<IconInfoCircle size="1rem" />}
        title="Please Review"
        color="blue"
      >
        Review the project details below. Make sure the folder path is correct
        as this cannot be changed after project creation.
      </Alert>

      <ReviewField
        label="Cloud Provider"
        value={PROVIDER_LABELS[data.provider]}
      />

      <ReviewField
        label="Project Name"
        value={data.name}
      />

      <ReviewField
        label="Folder Path"
        value={data.folderPath}
        wrap
      />
    </Stack>
  )
});