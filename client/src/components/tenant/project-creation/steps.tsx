import { Select, Stack, TextInput, Text, Box, Alert } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { FolderTree } from '../../common/FolderTree';
import { FormSection, ReviewField } from './ui';
import { FormValues, PROVIDER_LABELS, VALIDATION_RULES } from './config';

interface StepProps {
  form: UseFormReturnType<FormValues>;
  tenantId: string;
  availableProviders: string[];
}

export function ProviderStep({ form, availableProviders }: StepProps) {
  return (
    <FormSection>
      <Stack>
        <Select
          label="Cloud Provider"
          placeholder="Select cloud provider"
          data={availableProviders.map(provider => ({
            value: provider,
            label: PROVIDER_LABELS[provider]
          }))}
          required
          description={VALIDATION_RULES.cloudProvider.description}
          error={form.errors.cloudProvider}
          {...form.getInputProps('cloudProvider')}
        />

        {availableProviders.length === 0 && (
          <Alert color="red" title="No Providers">
            No cloud providers connected. Please connect a cloud provider first.
          </Alert>
        )}
      </Stack>
    </FormSection>
  );
}

export function NameStep({ form }: StepProps) {
  return (
    <FormSection>
      <TextInput
        label="Project Name"
        placeholder="Enter project name"
        required
        description={VALIDATION_RULES.name.description}
        error={form.errors.name}
        {...form.getInputProps('name')}
      />
    </FormSection>
  );
}

export function FolderStep({ form, tenantId }: StepProps) {
  return (
    <FormSection>
      <Stack spacing="xs">
        <Text size="sm" c="dimmed">
          {VALIDATION_RULES.folderPath.description}
          Selected folder will be highlighted in blue.
        </Text>

        {form.errors.folderPath && (
          <Text size="sm" c="red">
            {form.errors.folderPath}
          </Text>
        )}

        <Box mah={400} style={{ overflowY: 'auto' }}>
          <FolderTree
            tenantId={tenantId}
            provider={form.values.cloudProvider}
            selectedPath={form.values.folderPath}
            onSelect={(path) => {
              form.setFieldValue('folderPath', path);
              form.validateField('folderPath');
              // Show success notification
              notifications.show({
                title: 'Folder Selected',
                message: `Selected folder: ${path}`,
                color: 'blue',
                autoClose: 2000
              });
            }}
          />
        </Box>

        {form.values.folderPath && (
          <Alert color="blue" title="Selected Folder">
            {form.values.folderPath}
          </Alert>
        )}
      </Stack>
    </FormSection>
  );
}

export function ReviewStep({ form }: StepProps) {
  return (
    <FormSection>
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
          value={PROVIDER_LABELS[form.values.cloudProvider]}
        />

        <ReviewField
          label="Project Name"
          value={form.values.name}
        />

        <ReviewField
          label="Folder Path"
          value={form.values.folderPath}
          wrap
        />

        <Text size="sm" c="dimmed" mt="md">
          Click "Create Project" to proceed or "Back" to make changes.
          You can manage project settings after creation.
        </Text>
      </Stack>
    </FormSection>
  );
}