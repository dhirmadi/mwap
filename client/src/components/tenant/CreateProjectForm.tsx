import { useState } from 'react';
import { Button, Box } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { IntegrationProvider } from '../../types';
import { ProjectFormModal } from './ProjectFormModal';

interface CreateProjectFormProps {
  tenantId: string;
  availableProviders: IntegrationProvider[];
  trigger?: React.ReactNode;
}

/**
 * Project creation form component
 * Opens in a modal dialog with step-by-step form flow
 */
export function CreateProjectForm({
  tenantId,
  availableProviders,
  trigger
}: CreateProjectFormProps) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      {trigger ? (
        <Box onClick={() => setOpened(true)} style={{ cursor: 'pointer' }}>
          {trigger}
        </Box>
      ) : (
        <Button
          leftSection={<IconPlus size="1rem" />}
          onClick={() => setOpened(true)}
        >
          Create New Project
        </Button>
      )}

      {opened && (
        <ProjectFormModal
          opened={opened}
          onClose={() => setOpened(false)}
          tenantId={tenantId}
          availableProviders={availableProviders}
        />
      )}
    </>
  );
}