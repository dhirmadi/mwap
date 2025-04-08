import { Container, Stack, Title, Text, Paper } from '@mantine/core';

export default function TenantSelectPage() {
  return (
    <Container size="sm">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Stack spacing="xl" py="md">
          <Title order={1} ta="center">
            Select Tenant
          </Title>
          
          <Text c="dimmed" ta="center" size="lg">
            This is a placeholder for the Tenant Selection page where users can choose which tenant workspace to enter.
          </Text>
          
          <Text c="dimmed" ta="center" size="sm">
            Coming soon: List of available tenants with quick-access cards and role indicators.
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
}