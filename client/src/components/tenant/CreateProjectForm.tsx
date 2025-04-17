import { useState } from 'react';
import {
  Button,
  TextInput,
  Select,
  Stack,
  Group,
  Modal,
  Text
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { useCreateProject } from '../../hooks/useCreateProject';
import { IntegrationProvider } from '../../types';
import { handleApiError } from '../../core/errors';

interface CreateProjectFormProps {
  tenantId: string;
  availableProviders: IntegrationProvider[];
}

interface FormValues {
  name: string;
  cloudProvider: IntegrationProvider;
  folderPath: string;
}

/**
 * Project creation form component
 * Opens in a modal dialog
 */
export function CreateProjectForm({
  tenantId,
  availableProviders
}: CreateProjectFormProps) {
  const [opened, setOpened] = useState(false);
  const { createProject, isLoading } = useCreateProject(tenantId);

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      cloudProvider: availableProviders[0],
      folderPath: ''
    },
    validate: {
      name: (value) => {
        if (!value) return 'Name is required';
        if (value.length < 3) return 'Name must be at least 3 characters';
        if (value.length > 50) return 'Name must be at most 50 characters';
        return null;
      },
      cloudProvider: (value) => {
        if (!value) return 'Cloud provider is required';
        return null;
      },
      folderPath: (value) => {
        if (!value) return 'Folder path is required';
        if (value.length > 200) return 'Folder path must be at most 200 characters';
        return null;
      }
    }
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await createProject({
        name: values.name,
        description: `Project using ${values.cloudProvider} at ${values.folderPath}`
      });

      notifications.show({
        title: 'Success',
        message: 'Project created successfully',
        color: 'green'
      });

      setOpened(false);
      form.reset();
    } catch (error) {
      handleApiError(error, 'Failed to create project');
    }
  });

  return (
    <>
      <Button
        leftSection={<IconPlus size="1rem" />}
        onClick={() => setOpened(true)}
      >
        Create New Project
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Create New Project"
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Project Name"
              placeholder="Enter project name"
              required
              {...form.getInputProps('name')}
            />

            <Select
              label="Cloud Provider"
              placeholder="Select cloud provider"
              data={availableProviders.map(provider => ({
                value: provider,
                label: provider === 'GDRIVE' ? 'Google Drive' : 'Dropbox'
              }))}
              required
              {...form.getInputProps('cloudProvider')}
            />

            <TextInput
              label="Folder Path"
              placeholder="/path/to/project/folder"
              description="Path in the cloud provider where project files will be stored"
              required
              {...form.getInputProps('folderPath')}
            />

            {availableProviders.length === 0 && (
              <Text c="red" size="sm">
                No cloud providers connected. Please connect a cloud provider first.
              </Text>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setOpened(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                disabled={availableProviders.length === 0}
              >
                Create Project
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}