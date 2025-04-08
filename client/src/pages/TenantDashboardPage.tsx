import { useAuth0 } from '@auth0/auth0-react';
import {
  Container,
  Title,
  Text,
  Paper,
  Badge,
  Stack,
  Group,
  Box,
} from '@mantine/core';
import { useTenantContext } from '../contexts/TenantContext';

export default function TenantDashboardPage() {
  const { user } = useAuth0();
  const { tenantName, role, isAdmin, isSuperAdmin, isDeputy } = useTenantContext();

  const getRoleTip = () => {
    if (isAdmin || isSuperAdmin) {
      return "You can manage members and invite new users.";
    }
    if (isDeputy) {
      return "You can help manage your team.";
    }
    return "You have limited access to content and collaboration tools.";
  };

  const getRoleBadgeColor = () => {
    if (isSuperAdmin) return 'grape';
    if (isAdmin) return 'blue';
    if (isDeputy) return 'teal';
    return 'gray';
  };

  return (
    <Container size="lg" className="py-8">
      <Stack spacing="xl">
        {/* Welcome Section */}
        <Paper shadow="sm" p="md" radius="md" className="bg-white">
          <Stack spacing="xs">
            <Group position="apart" align="center">
              <Title order={2} className="text-gray-800">
                Welcome to {tenantName}
              </Title>
              <Badge size="lg" color={getRoleBadgeColor()}>
                {role}
              </Badge>
            </Group>
            <Text size="lg" color="dimmed">
              Logged in as {user?.name || user?.email}
            </Text>
            <Text className="mt-2 text-blue-600">
              {getRoleTip()}
            </Text>
          </Stack>
        </Paper>

        {/* Activity Preview Section */}
        <Paper shadow="sm" p="md" radius="md" className="bg-white">
          <Stack spacing="md">
            <Title order={3} className="text-gray-700">
              Recent Activity
            </Title>
            <Box className="h-48 flex items-center justify-center bg-gray-50 rounded-md">
              <Text color="dimmed" size="lg">
                Activity feed coming soon...
              </Text>
            </Box>
          </Stack>
        </Paper>

        {/* Usage Stats Section */}
        <Paper shadow="sm" p="md" radius="md" className="bg-white">
          <Stack spacing="md">
            <Title order={3} className="text-gray-700">
              Tenant Usage Overview
            </Title>
            <Box className="h-32 flex items-center justify-center bg-gray-50 rounded-md">
              <Text color="dimmed" size="lg">
                Usage statistics will be displayed here
              </Text>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}