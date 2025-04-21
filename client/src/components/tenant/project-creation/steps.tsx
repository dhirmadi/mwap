import { Select, Stack, TextInput, Text, Box } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { FolderTree } from '../../common/FolderTree';
import { FormSection, ReviewField } from './ui';
import { FormValues, PROVIDER_LABELS } from './config';

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
          {...form.getInputProps('cloudProvider')}
        />

        {availableProviders.length === 0 && (
          <Text c="red" size="sm">
            No cloud providers connected. Please connect a cloud provider first.
          </Text>
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
        {...form.getInputProps('name')}
      />
    </FormSection>
  );
}

export function FolderStep({ form, tenantId }: StepProps) {
  return (
    <FormSection>
      <Box mah={400} style={{ overflowY: 'auto' }}>
        <FolderTree
          tenantId={tenantId}
          provider={form.values.cloudProvider}
          selectedPath={form.values.folderPath}
          onSelect={(path) => form.setFieldValue('folderPath', path)}
        />
      </Box>
    </FormSection>
  );
}

export function ReviewStep({ form }: StepProps) {
  return (
    <FormSection>
      <Stack>
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
          Please review the details above before creating the project.
          Click "Create Project" to proceed or "Back" to make changes.
        </Text>
      </Stack>
    </FormSection>
  );
}