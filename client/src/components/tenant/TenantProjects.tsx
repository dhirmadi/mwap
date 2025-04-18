import { Link } from 'react-router-dom';
import { Card, Title, Text, Table, Group, Badge, Tooltip, Button, ActionIcon, Menu, Stack } from '@mantine/core';
import { IconFolder, IconUsers, IconArchive, IconTrash, IconDots, IconPlus } from '@tabler/icons-react';
import { useTenantProjects } from '../../hooks/useTenantProjects';
import { LoadingState, ErrorDisplay } from '../common';
import { Project } from '../../types';
import { CreateProjectForm } from './CreateProjectForm';

interface TenantProjectsProps {
  tenantId: string;
  getProviderName?: (project: Project) => string | undefined;
  getMemberCount?: (project: Project) => number;
  getFolderPath?: (project: Project) => string | undefined;
  onArchive?: (project: Project) => Promise<void>;
  onDelete?: (project: Project) => Promise<void>;
}

/**
 * Tenant projects table component
 * Displays list of tenant projects with details
 */
export function TenantProjects({
  tenantId,
  getProviderName,
  getMemberCount,
  getFolderPath,
  onArchive,
  onDelete
}: TenantProjectsProps) {
  const {
    projects,
    isLoading,
    error,
    refetch
  } = useTenantProjects(tenantId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  if (projects.length === 0) {
    return (
      <Card withBorder>
        <Title order={3} mb="md">Projects</Title>
        <Stack align="center" gap="md" py="xl">
          <IconFolder size={40} color="gray" />
          <Stack gap={5} align="center">
            <Text size="lg" fw={500}>No projects found</Text>
            <Text size="sm" c="dimmed">Create your first project to get started</Text>
          </Stack>
          <CreateProjectForm
            tenantId={tenantId}
            availableProviders={['GDRIVE', 'DROPBOX']}
            trigger={
              <Button leftSection={<IconPlus size="1rem" />}>
                Create Project
              </Button>
            }
          />
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Projects</Title>
        <CreateProjectForm
          tenantId={tenantId}
          availableProviders={['GDRIVE', 'DROPBOX']}
        />
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Cloud Provider</Table.Th>
            <Table.Th>Folder Path</Table.Th>
            <Table.Th>Members</Table.Th>
            <Table.Th w={0} />
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {projects.map(project => (
            <Table.Tr key={project.id}>
              <Table.Td>
                <Text
                  component={Link}
                  to={`/projects/${project.id}/manage`}
                  c="blue"
                  td="underline"
                >
                  {project.name}
                </Text>
              </Table.Td>

              <Table.Td>
                {getProviderName?.(project) ? (
                  <Badge>{getProviderName(project)}</Badge>
                ) : (
                  <Text c="dimmed" size="sm">Not connected</Text>
                )}
              </Table.Td>

              <Table.Td>
                {getFolderPath?.(project) ? (
                  <Group gap="xs">
                    <IconFolder size="1rem" />
                    <Tooltip label={getFolderPath(project)}>
                      <Text truncate="end" maw={200}>
                        {getFolderPath(project)}
                      </Text>
                    </Tooltip>
                  </Group>
                ) : (
                  <Text c="dimmed" size="sm">Not set</Text>
                )}
              </Table.Td>

              <Table.Td>
                <Group gap="xs">
                  <IconUsers size="1rem" />
                  <Text>{getMemberCount?.(project) ?? 0}</Text>
                </Group>
              </Table.Td>

              <Table.Td>
                <Menu position="bottom-end" withinPortal>
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                      <IconDots size="1rem" />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    {onArchive && (
                      <Menu.Item
                        leftSection={<IconArchive size="1rem" />}
                        onClick={() => onArchive(project)}
                      >
                        Archive
                      </Menu.Item>
                    )}
                    {onDelete && (
                      <Menu.Item
                        leftSection={<IconTrash size="1rem" />}
                        color="red"
                        onClick={() => onDelete(project)}
                      >
                        Delete
                      </Menu.Item>
                    )}
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
}