import { Card, Text, Stack, Badge, Group, Skeleton } from '@mantine/core';
import { useProjects } from '../hooks/useProjects';

export function MyProjects() {
  const { projects, isLoading, error } = useProjects();

  // Loading state with skeleton cards
  if (isLoading) {
    return (
      <Card withBorder p="md">
        <Stack>
          <Text size="sm" c="dimmed">My Projects</Text>
          {[1, 2, 3].map((i) => (
            <Card key={i} withBorder data-testid="project-skeleton">
              <Stack>
                <Skeleton height={20} width="70%" />
                <Skeleton height={24} width={60} />
              </Stack>
            </Card>
          ))}
        </Stack>
      </Card>
    );
  }

  // Error state
  if (error) {
    console.error('[MyProjects] Error:', error);
    return (
      <Card withBorder p="md">
        <Text c="red">Error loading projects. Please try again later.</Text>
      </Card>
    );
  }

  // Log projects data
  console.log('[MyProjects] Projects:', projects);

  return (
    <Card withBorder p="md">
      <Stack>
        <Text size="sm" c="dimmed">My Projects</Text>
        
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <Card key={project.id} withBorder data-testid="project-card">
              <Group justify="space-between" align="center">
                <Text fw={500}>{project.name}</Text>
                <Badge
                  color={
                    project.role === 'OWNER' ? 'blue' :
                    project.role === 'ADMIN' ? 'green' : 'gray'
                  }
                  data-testid="role-badge"
                >
                  {project.role}
                </Badge>
              </Group>
            </Card>
          ))
        ) : (
          <Text 
            c="dimmed" 
            ta="center" 
            py="xl"
            data-testid="empty-message"
          >
            You have not joined any projects yet
          </Text>
        )}
      </Stack>
    </Card>
  );
}