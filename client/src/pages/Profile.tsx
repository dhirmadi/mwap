import { useAuth0 } from '@auth0/auth0-react';
import {
  Container,
  Title,
  Paper,
  Text,
  Group,
  Stack,
  Avatar,
  Divider,
  Badge,
  Card,
  SimpleGrid,
  Space
} from '@mantine/core';
import { TenantStatus } from '../components/TenantStatus';
import { MyProjects } from '../components/MyProjects';
import { RedeemInvite } from '../components/RedeemInvite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

export function Profile() {
  const { user, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Text>Loading profile...</Text>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container size="md" py="xl">
        <Text>Please log in to view your profile.</Text>
      </Container>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Container size="md" py="xl">
        {/* User Profile Section */}
        <Paper shadow="sm" p="xl" radius="md" mb="xl">
          <Group align="flex-start" mb="xl">
            <Avatar 
              src={user.picture} 
              size="xl" 
              radius="md"
              alt={user.name || 'Profile picture'}
            />
            <Stack gap="xs">
              <Title order={2}>{user.name}</Title>
              <Text size="sm" c="dimmed">{user.email}</Text>
              {user.email_verified && (
                <Badge color="green" variant="light">Email Verified</Badge>
              )}
            </Stack>
          </Group>

          <SimpleGrid cols={1} spacing="md">
            <Card withBorder padding="md">
              <Text size="sm" fw={500} c="dimmed" mb="xs">Auth0 ID</Text>
              <Text>{user.sub}</Text>
            </Card>

            {user.nickname && (
              <Card withBorder padding="md">
                <Text size="sm" fw={500} c="dimmed" mb="xs">Nickname</Text>
                <Text>{user.nickname}</Text>
              </Card>
            )}

            {user.locale && (
              <Card withBorder padding="md">
                <Text size="sm" fw={500} c="dimmed" mb="xs">Locale</Text>
                <Text>{user.locale}</Text>
              </Card>
            )}
          </SimpleGrid>
        </Paper>

        {/* Workspace Section */}
        <Stack spacing="xl">
          <TenantStatus />
          <MyProjects />
          <RedeemInvite />
        </Stack>
      </Container>
    </QueryClientProvider>
  );
}