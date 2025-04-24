/**
 * @fileoverview Folder selection step
 * @module project-creation/steps/FolderStep
 */

import { Stack, Text, Box, Alert } from '@mantine/core';
import { createWizardStep } from '../../../wizard/WizardStep';
import { ProjectFormData, ProjectStepProps } from '../types';
import { PROJECT_RULES } from '../../../../validation/projectValidation';
import { FolderTree } from '../../../common/FolderTree';
import { showSuccessNotification } from '../../../../utils/project/errors';

/**
 * Folder selection step
 * @component
 */
export const FolderStep = createWizardStep<ProjectFormData>({
  label: 'Select Folder',
  fields: ['folderPath', 'provider'],
  render: ({ data, onChange, error, props }) => {
    const { tenantId } = props as ProjectStepProps;

    return (
      <Stack spacing="xs">
        <Text size="sm" c="dimmed">
          {PROJECT_RULES.folderPath.description}
          Selected folder will be highlighted in blue.
        </Text>

        {error && (
          <Text size="sm" c="red">
            {error}
          </Text>
        )}

        <Box mah={400} style={{ overflowY: 'auto' }}>
          <FolderTree
            tenantId={tenantId}
            provider={data.provider}
            selectedPath={data.folderPath}
            onSelect={(path) => {
              onChange('folderPath', path);
              showSuccessNotification('Folder Selected', `Selected folder: ${path}`);
            }}
          />
        </Box>

        {data.folderPath && (
          <Alert color="blue" title="Selected Folder">
            {data.folderPath}
          </Alert>
        )}
      </Stack>
    );
  }
});