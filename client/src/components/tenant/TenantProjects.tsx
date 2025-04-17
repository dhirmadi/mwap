import { Link } from 'react-router-dom';
import { Card, Title, Text, Table, Group, Badge, Tooltip } from '@mantine/core';
import { IconFolder, IconUsers } from '@tabler/icons-react';
import { useTenantProjects } from '../../hooks/useTenantProjects';
import { LoadingState } from '../common';
import { Project } from '../../types';
import { CreateProjectForm } from './CreateProjectForm';

interface TenantProjectsProps {
  tenantId: string;
  getProviderName?: (project: Project) => string | undefined;
  getMemberCount?: (project: Project) => number;
  getFolderPath?: (project: Project) => string | undefined;
}

/**
 * Tenant projects table component
 * Displays list of tenant projects with details
 */
export function TenantProjects({
  tenantId,
  getProviderName,
  getMemberCount,
  getFolderPath
}: TenantProjectsProps) {
  const {
    projects,
    isLoading,
  } = useTenantProjects(tenantId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (projects.length === 0) {
    return (
      <Card withBorder>
        <Title order={3} mb="md">Projects</Title>
        <Text c="dimmed" ta="center" py="xl">
          No projects found in this tenant
        </Text>
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
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
}