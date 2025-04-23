import { useState } from 'react';
import { Button, Box, Tooltip } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { IntegrationProvider } from '../../types';
import { ProjectFormModal } from './ProjectFormModal';
import { usePermissions } from '../../hooks/usePermissions';

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
  const { canCreateProject } = usePermissions(tenantId);

  const handleClick = () => {
    if (canCreateProject()) {
      setOpened(true);
    }
  };

  const button = trigger ? (
    <Box onClick={handleClick} style={{ cursor: canCreateProject() ? 'pointer' : 'not-allowed' }}>
      {trigger}
    </Box>
  ) : (
    <Button
      leftSection={<IconPlus size="1rem" />}
      onClick={handleClick}
      disabled={!canCreateProject()}
    >
      Create New Project
    </Button>
  );

  return (
    <>
      {canCreateProject() ? (
        button
      ) : (
        <Tooltip label="You don't have permission to create projects in this tenant">
          {button}
        </Tooltip>
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