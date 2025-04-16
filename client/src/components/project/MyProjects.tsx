import { Card, Text, Stack, Badge, Group, Skeleton } from '@mantine/core';
import { useProjects } from '../../hooks/useProjects';
import { ErrorDisplay } from '../common';
import { ProjectRole } from '../../types';

/**
 * Role color mapping
 */
const ROLE_COLORS: Record<ProjectRole, string> = {
  OWNER: 'blue',
  ADMIN: 'green',
  MEMBER: 'gray'
} as const;

/**
 * Loading state component
 */
function LoadingState() {
  return (
    <Stack>
      {[1, 2, 3].map((i) => (
        <Card key={i} withBorder data-testid="project-skeleton">
          <Stack>
            <Skeleton height={20} width="70%" />
            <Skeleton height={24} width={60} />
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

/**
 * Empty state component
 */
function EmptyState() {
  return (
    <Text 
      c="dimmed" 
      ta="center" 
      py="xl"
      data-testid="empty-message"
    >
      You have not joined any projects yet
    </Text>
  );
}

/**
 * Project list component
 */
export function MyProjects() {
  const { projects, isLoading, error } = useProjects();

  return (
    <Card withBorder p="md">
      <Stack>
        <Text size="sm" c="dimmed">My Projects</Text>
        
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorDisplay error={error} />
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <Card key={project.id} withBorder data-testid="project-card">
              <Group justify="space-between" align="center">
                <Text fw={500}>{project.name}</Text>
                <Badge
                  color={ROLE_COLORS[project.role]}
                  data-testid="role-badge"
                >
                  {project.role}
                </Badge>
              </Group>
            </Card>
          ))
        ) : (
          <EmptyState />
        )}
      </Stack>
    </Card>
  );
}