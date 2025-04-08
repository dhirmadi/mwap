import { Container, Stack, Title, Text } from '@mantine/core';

export default function PendingTenantsPage() {
  return (
    <Container size="lg">
      <Stack spacing="xl" py="xl">
        <Title order={1} ta="center">
          Pending Tenants
        </Title>
        
        <Text c="dimmed" ta="center" size="lg">
          This is a placeholder for the Pending Tenants page where super admins can review and approve new tenant requests.
        </Text>
        
        <Text c="dimmed" ta="center" size="sm">
          Coming soon: List of pending tenant applications with approve/reject actions.
        </Text>
      </Stack>
    </Container>
  );
}