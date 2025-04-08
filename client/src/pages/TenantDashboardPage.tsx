import { Container, Stack, Title, Text } from '@mantine/core';

export default function TenantDashboardPage() {
  return (
    <Container size="lg">
      <Stack spacing="xl" py="xl">
        <Title order={1} ta="center">
          Tenant Dashboard
        </Title>
        
        <Text c="dimmed" ta="center" size="lg">
          This is a placeholder for the Tenant Dashboard where users can view and manage their tenant resources.
        </Text>
        
        <Text c="dimmed" ta="center" size="sm">
          Coming soon: Resource usage, activity feed, and quick actions.
        </Text>
      </Stack>
    </Container>
  );
}