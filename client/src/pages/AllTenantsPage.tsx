import { Container, Stack, Title, Text } from '@mantine/core';

export default function AllTenantsPage() {
  return (
    <Container size="lg">
      <Stack spacing="xl" py="xl">
        <Title order={1} ta="center">
          All Tenants
        </Title>
        
        <Text c="dimmed" ta="center" size="lg">
          This is a placeholder for the All Tenants page where super admins can view and manage all tenants in the system.
        </Text>
        
        <Text c="dimmed" ta="center" size="sm">
          Coming soon: Searchable list of all tenants with management actions and analytics.
        </Text>
      </Stack>
    </Container>
  );
}