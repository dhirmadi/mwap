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
  const { canCreateProject, isLoading: permissionsLoading } = usePermissions(tenantId);

  const handleClick = () => {
    if (!permissionsLoading && canCreateProject()) {
      setOpened(true);
    }
  };

  // Memoize the permission check to avoid multiple calls
  const hasCreatePermission = !permissionsLoading && canCreateProject();

  const button = trigger ? (
    <Box 
      onClick={handleClick} 
      style={{ 
        cursor: permissionsLoading ? 'wait' : (hasCreatePermission ? 'pointer' : 'not-allowed') 
      }}
    >
      {trigger}
    </Box>
  ) : (
    <Button
      leftSection={<IconPlus size="1rem" />}
      onClick={handleClick}
      loading={permissionsLoading}
      disabled={!hasCreatePermission}
    >
      Create New Project
    </Button>
  );

  const wrappedButton = !hasCreatePermission && !permissionsLoading ? (
    <Tooltip label="You don't have permission to create projects in this tenant">
      {button}
    </Tooltip>
  ) : button;

  return (
    <>
      {wrappedButton}
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