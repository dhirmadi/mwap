import { useState } from 'react';
import {
  Button,
  TextInput,
  Select,
  Stack,
  Group,
  Modal,
  Text,
  Stepper,
  Paper
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconCloudUpload, IconFolderPlus } from '@tabler/icons-react';
import { useCreateProject } from '../../hooks/useCreateProject';
import { IntegrationProvider } from '../../types';
import { handleApiError } from '../../core/errors';

interface CreateProjectFormProps {
  tenantId: string;
  availableProviders: IntegrationProvider[];
  trigger?: React.ReactNode;
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
  const [activeStep, setActiveStep] = useState(0);
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

  const nextStep = () => {
    const currentStepValid = activeStep === 0
      ? form.isValid('cloudProvider')
      : form.isValid('name') && form.isValid('folderPath');

    if (currentStepValid) {
      setActiveStep((current) => current + 1);
    } else {
      form.validate();
    }
  };

  const prevStep = () => setActiveStep((current) => current - 1);

  return (
    <>
      {trigger || (
        <Button
          leftSection={<IconPlus size="1rem" />}
          onClick={() => setOpened(true)}
        >
          Create New Project
        </Button>
      )}

      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setActiveStep(0);
          form.reset();
        }}
        title="Create New Project"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <Stepper active={activeStep} onStepClick={setActiveStep}>
            <Stepper.Step
              label="Cloud Provider"
              description="Select storage provider"
              icon={<IconCloudUpload size="1.2rem" />}
            >
              <Paper withBorder p="md" mt="md">
                <Stack>
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

                  {availableProviders.length === 0 && (
                    <Text c="red" size="sm">
                      No cloud providers connected. Please connect a cloud provider first.
                    </Text>
                  )}
                </Stack>
              </Paper>
            </Stepper.Step>

            <Stepper.Step
              label="Project Details"
              description="Name and location"
              icon={<IconFolderPlus size="1.2rem" />}
            >
              <Paper withBorder p="md" mt="md">
                <Stack>
                  <TextInput
                    label="Project Name"
                    placeholder="Enter project name"
                    required
                    {...form.getInputProps('name')}
                  />

                  <TextInput
                    label="Folder Path"
                    placeholder="/path/to/project/folder"
                    description="Path in the cloud provider where project files will be stored"
                    required
                    {...form.getInputProps('folderPath')}
                  />
                </Stack>
              </Paper>
            </Stepper.Step>
          </Stepper>

          <Group justify="flex-end" mt="xl">
            {activeStep > 0 && (
              <Button variant="default" onClick={prevStep}>
                Back
              </Button>
            )}
            {activeStep === 0 ? (
              <Button onClick={nextStep} disabled={availableProviders.length === 0}>
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                loading={isLoading}
                disabled={availableProviders.length === 0}
              >
                Create Project
              </Button>
            )}
          </Group>
        </form>
      </Modal>
    </>
  );
}